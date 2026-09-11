/**
 * DPS Indirapuram AI Conversational Engine & Voice Synthesis Pipeline
 * Copyright (c) 2026 DPS Indirapuram Portal Architecture. All rights reserved.
 * Custom implementation supporting bilingual natural speech and contextual intent matching.
 */

import { createRouter, publicQuery } from "./middleware";
import { z } from "zod";
import { getMainModels, checkPersistentRateLimit } from "./models/cmsSchemas";

interface GroqApiResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

const MANDATORY_SANITIZATION_RULES = `
CRITICAL FORMATTING & SANITIZATION RULES (MANDATORY & STRICT):
- Output in clean, pure text ONLY.
- NEVER generate markdown tables, ASCII tables, grid matrices, pipe characters (|), or plus signs (+).
- NEVER generate dashes, hyphens (-, —, –), underscores (_), or separator lines (such as ---------- or =====).
- NEVER use bullet points, list dashes, numbered lists, markdown asterisks (*, **), brackets, or hashtags.
- Do not write hyphenated session years like 2026-27 (write 2026 to 2027 instead). Write Pre Nursery instead of Pre-Nursery.
- When asked about Class 11 streams, NEVER output a table or matrix. Present the three streams (Science, Commerce, Humanities) in fluent, elegant sentences using connecting words like "and", "along with", "as well as".
- Provide comprehensive, accurate answers in 2 to 4 clear, well-spoken sentences.
`;

const DEFAULT_SYSTEM_PROMPT = `You are DPSI AI, the official and intelligent AI assistant for Delhi Public School Indirapuram (DPS Indirapuram), located in Ghaziabad, Uttar Pradesh.

${MANDATORY_SANITIZATION_RULES}

COMPREHENSIVE KNOWLEDGE BASE — DELHI PUBLIC SCHOOL INDIRAPURAM:

1. OVERVIEW & AFFILIATION:
- Full Official Name: Delhi Public School Indirapuram (DPSI)
- Established: 2003 | Managed by Delhi Public School Society (DPSS)
- Affiliation: Central Board of Secondary Education (CBSE), Affiliation No. 2130663, School Code: 60297
- Campus: 10-acre world-class lush green campus located at 526/1 Ahinsa Khand-II, Indirapuram, Ghaziabad, Uttar Pradesh 201014
- Contact Phone: +91-0120-4660000, 4670000 | Email: info@dpsindirapuram.com
- School Motto: "Service Before Self"

2. LEADERSHIP & REPUTATION:
- Principal: Ms. Priya Elizabeth John (M.Ed., M.Phil., 22+ years of educational leadership)
- Pro-Vice Chairperson: Ms. Santosh Bansal
- Chairman: Mr. V.K. Shunglu (IAS Retd., Former Comptroller and Auditor General of India)
- Accreditations: Times School Survey Rank 1 in Ghaziabad, British Council International School Award (ISA).

3. ADMISSIONS (SESSION 2026-27):
- Admissions are currently OPEN for Pre-Nursery, Nursery, Prep, Classes I to IX, and Class XI.
- Process: Online application via school website -> Document verification -> Interaction / Evaluation -> Provisional Admission Offer.
- Documents Required: Child's Birth Certificate, Transfer Certificate (TC) from previous school, previous year report card, address proof, passport-sized photographs, medical fitness certificate.
- For admission inquiries, parents can call +91-0120-4660000 or email info@dpsindirapuram.com.

4. ACADEMIC EXCELLENCE & STREAMS:
- Class XI & XII Streams Offered:
  * Science: Physics, Chemistry, Mathematics/Biology with AI, Biotechnology, Computer Science (Python/SQL), or Physical Education.
  * Commerce: Accountancy, Business Studies, Economics, Mathematics/Applied Mathematics, Informatics Practices.
  * Humanities: Psychology, Political Science, Economics, History, Legal Studies, Sociology, Fine Arts.
- Board Results: Consistent 100% pass rate in CBSE Class 10 & 12. School toppers include Siddhant Tiwari (99.4%), Ansh Pathak (99.4%), and Aayush Jha (99.2%). Over 50 students score 95% and above annually.

5. WORLD-CLASS INFRASTRUCTURE & FACILITIES:
- AI & Robotics Innovation Lab: State-of-the-art lab with humanoid robotics, 3D printers, IoT kits, Arduino, and AI programming workstations.
- Science & Computer Labs: Fully equipped labs for Physics, Chemistry, Biology, Mathematics, and Junior/Senior Computer Labs with high-speed internet.
- Smart Classrooms: 80+ digitized interactive multimedia smart classrooms.
- Digital Library: 20,000+ books, national and international journals, digital media stations.
- Sports & Athletics: 50-meter Olympic-standard swimming pool, ISSF certified .177 air rifle shooting range, synthetic basketball courts, football field, cricket pitch, lawn tennis, badminton, volleyball courts.
- Performing Arts: 1,200-seat air-conditioned auditorium, dedicated classical and western dance and music studios.
- Health & Transport: 50+ GPS-enabled AC buses with live parent tracking, 24/7 CCTV surveillance, biometric security, and dedicated medical infirmary with qualified nursing staff.

6. TIMINGS & OFFICE HOURS:
- Pre-Nursery to Prep: 8:30 AM to 12:30 PM (Monday to Friday)
- Class I to Class XII: 7:30 AM to 1:40 PM (Monday to Friday)
- Administrative & Admission Office: 8:00 AM to 3:00 PM (Monday to Saturday)

7. TRANSFER CERTIFICATE (TC) & PORTALS:
- TC search and verification are available online on the school website TC portal.
- Parents can pay fees and track academic progress through the SchoolsOS portal login.

If a question falls outside this knowledge base, politely provide the school contact number (+91-0120-4660000) and email (info@dpsindirapuram.com).`;

// High-performance In-Memory LRU Cache with TTL for ultra-fast repeated queries
interface CacheEntry {
  answer: string;
  expiresAt: number;
}
const aiResponseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache
const MAX_CACHE_SIZE = 500;

function getCachedAnswer(query: string, tenantId?: string): string | null {
  const normKey = `${tenantId || "default"}:${query.toLowerCase().replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, " ").trim()}`;
  const entry = aiResponseCache.get(normKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    aiResponseCache.delete(normKey);
    return null;
  }
  return entry.answer;
}

function setCachedAnswer(query: string, answer: string, tenantId?: string) {
  if (aiResponseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = aiResponseCache.keys().next().value;
    if (firstKey) aiResponseCache.delete(firstKey);
  }
  const normKey = `${tenantId || "default"}:${query.toLowerCase().replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, " ").trim()}`;
  aiResponseCache.set(normKey, {
    answer,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// Simple in-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);

// Active low-latency Groq models in prioritized order
const GROQ_FAST_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "groq/compound-mini",
  "qwen/qwen3.6-27b",
];

// Map legacy or deprecated model names to current active Groq fast models
function normalizeGroqModel(model?: string): string {
  if (!model) return GROQ_FAST_MODELS[0];
  const m = model.trim().toLowerCase();
  if (m.includes("llama") || m.includes("mixtral") || m.includes("gemma") || m.includes("120b")) {
    return "openai/gpt-oss-120b";
  }
  if (m.includes("qwen3.8") || m.includes("qwen")) {
    return "qwen/qwen3.8-27b";
  }
  if (m.includes("gpt-oss-20b") || (m.includes("20b") && !m.includes("120b"))) {
    return "openai/gpt-oss-20b";
  }
  if (m.includes("compound")) {
    return "groq/compound-mini";
  }
  return model.trim();
}

// Circuit breaker for external TTS services to prevent latency lag on quota/auth errors
let elevenlabsCircuitBreakerUntil = 0;

export const aiRouter = createRouter({
  chat: publicQuery
    .input(
      z.object({
        message: z.string().min(1, "Message cannot be empty").max(1000, "Message is too long"),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(1500) })).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Extract client identifier (IP or fallback)
      const clientIp = ctx?.req?.headers?.get("x-forwarded-for") || ctx?.req?.headers?.get("cf-connecting-ip") || "global-client";
      
      const isAllowed = checkRateLimit(clientIp, 60, 60000) && (await checkPersistentRateLimit(`chat:${clientIp}`, 60, 60, ctx.tenantId));
      if (!isAllowed) {
        return {
          answer: "You are sending messages too quickly. Please wait a moment before asking another question.",
        };
      }

      // Check high-speed in-memory response cache (< 2ms instant answer)
      const cached = getCachedAnswer(input.message, ctx.tenantId);
      if (cached && (!input.history || input.history.length === 0)) {
        return { answer: cached };
      }

      let apiKey =
        process.env.GROQ_API_KEY ||
        process.env.VITE_GROQ_API_KEY ||
        process.env.DOPPLER_GROQ_API_KEY ||
        "";
      let configuredModel: string | undefined;

      // Load admin-configured system prompt and custom key from MongoDB if available
      let systemPrompt = DEFAULT_SYSTEM_PROMPT;
      try {
        const { AiConfig } = await getMainModels(ctx.tenantId) as any;
        if (AiConfig) {
          const config = await AiConfig.findOne({}).sort({ updatedAt: -1 });
          if (config?.apiKey && config.apiKey.trim().startsWith("gsk_")) {
            apiKey = config.apiKey.trim();
          }
          if (config?.modelId && config.modelId.trim()) {
            configuredModel = normalizeGroqModel(config.modelId);
          } else if (config?.model && config.model.trim()) {
            configuredModel = normalizeGroqModel(config.model);
          }
          if (config?.systemPrompt && config.systemPrompt.trim().length > 50) {
            systemPrompt = `${MANDATORY_SANITIZATION_RULES}\n\n${config.systemPrompt}`;
          }
        }
      } catch {
        // Use default prompt
      }

      // Sanitize input to mitigate prompt injection tricks
      const sanitizedMsg = input.message
        .replace(/ignore\s+(all\s+)?(previous|prior)\s+instructions/gi, "")
        .replace(/system\s+prompt\s+override/gi, "")
        .trim();

      // Keep only last 4 turns for optimal speed + context accuracy
      const recentHistory = (input.history || []).slice(-4);

      const messagesPayload = [
        { role: "system", content: systemPrompt },
        ...recentHistory.map((h) => ({ role: h.role, content: h.text })),
        { role: "user", content: sanitizedMsg || input.message },
      ];

      const primaryModel = configuredModel ? normalizeGroqModel(configuredModel) : GROQ_FAST_MODELS[0];
      const candidateModels = [
        primaryModel,
        ...GROQ_FAST_MODELS.filter((m) => m !== primaryModel),
      ];

      // Try models in fallback order with ultra-fast timeout (3s per model)
      if (apiKey) {
        for (const model of candidateModels) {
          try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey.trim()}`,
              },
              body: JSON.stringify({
                model,
                messages: messagesPayload,
                temperature: 0.3,
                max_tokens: 300,
                stream: false,
              }),
              signal: AbortSignal.timeout(3000), // 3s fast timeout per attempt
            });

            if (!response.ok) {
              const errText = await response.text();
              console.warn(`Groq API notice for model ${model}:`, errText);
              continue;
            }

            const data = (await response.json()) as GroqApiResponse;
            let replyText = data?.choices?.[0]?.message?.content || "";

            if (replyText) {
              // Strip think tags, reasoning logs, markdown tables, hyphens, and extra symbols
              replyText = replyText
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
                .replace(/```[\s\S]*?```/g, "")
                .replace(/https?:\/\/\S+/g, "")
                // Strip markdown / ASCII table row and column dividers (e.g. |---+---| or ----------+-----)
                .replace(/[|\s]*[-—–_=]{2,}[+|\s\-—–_=]*/g, " ")
                .replace(/\b2026[-–—]27\b/g, "2026 to 2027")
                .replace(/\bPre[-–—]Nursery\b/gi, "Pre Nursery")
                .replace(/\bClass(es)?\s*IX\s*&?\s*XI\b/gi, "Classes 9 and 11")
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/\*(.*?)\*/g, "$1")
                .replace(/#{1,6}\s+/g, "")
                .replace(/`{1,3}/g, "")
                // Remove all remaining hyphens, en-dashes, em-dashes, underscores
                .replace(/[-—–_]/g, " ")
                // Remove pipes, pluses, markdown symbols, brackets
                .replace(/[|*#`~[\](){}<>\\+]/g, " ")
                .replace(/^[•*·▪▫◦\s-]+/gm, "")
                .replace(/\s{2,}/g, " ")
                .trim();

              if (replyText.length > 5) {
                // Store in fast in-memory LRU cache
                setCachedAnswer(input.message, replyText, ctx.tenantId);
                return { answer: replyText };
              }
            }
          } catch (err) {
            console.warn(`Groq failover for model ${model}:`, err);
          }
        }
      }

      // Intelligent instant local keyword-based fallback if external API is unreachable or slow (Strictly no hyphens or extra symbols)
      const lower = input.message.toLowerCase();
      let fallbackAnswer = "";

      if (lower.includes("kaise ho") || lower.includes("how are you") || lower.includes("namaste") || lower.includes("hello") || lower.includes("hi")) {
        fallbackAnswer = "Namaste! Main DPS Indirapuram ka official AI assistant DPSI AI hoon. Admissions Session 2026 to 2027, academics, streams, facilities ya kisi bhi query ke liye main aapki kya madad kar sakta hoon?";
      } else if (lower.includes("admission") || lower.includes("apply") || lower.includes("form") || lower.includes("dakhila") || lower.includes("register")) {
        fallbackAnswer = "DPS Indirapuram mein Session 2026 to 2027 ke liye Pre Nursery se Class 9 aur Class 11 ke admissions open hain. Aap online apply kar sakte hain ya admission desk se 0120 4660000 par sampark kar sakte hain.";
      } else if (lower.includes("stream") || lower.includes("subject") || lower.includes("class 11") || lower.includes("11th")) {
        fallbackAnswer = "Class 11 mein teen streams available hain: Science with AI, Biotech, and Computer Science, Commerce with Accounts, Economics, Math, and Business Studies, aur Humanities with Psychology, Legal Studies, and Political Science.";
      } else if (lower.includes("facility") || lower.includes("campus") || lower.includes("lab") || lower.includes("sports") || lower.includes("robotics") || lower.includes("pool") || lower.includes("shooting")) {
        fallbackAnswer = "DPS Indirapuram ke 10 acre campus mein AI and Robotics Innovation Lab, Olympic standard 50 meter swimming pool, shooting range, 80 plus smart classrooms, aur digital library uplabdh hain.";
      } else if (lower.includes("principal") || lower.includes("head") || lower.includes("leadership") || lower.includes("chairperson")) {
        fallbackAnswer = "DPS Indirapuram ki Principal Ms Priya Elizabeth John hain, Pro Vice Chairperson Ms Santosh Bansal hain, aur Chairman Mr V K Shunglu hain.";
      } else if (lower.includes("result") || lower.includes("topper") || lower.includes("board") || lower.includes("score")) {
        fallbackAnswer = "DPS Indirapuram ka CBSE Class 10 aur 12 mein 100 percent pass result raha hai. School toppers mein Siddhant Tiwari 99.4 percent, Ansh Pathak 99.4 percent aur Aayush Jha 99.2 percent shamil hain.";
      } else if (lower.includes("fee") || lower.includes("fees") || lower.includes("cost") || lower.includes("structure")) {
        fallbackAnswer = "Fee structure grade ke according structured hai. Detail fee chart aur online payment ke liye aap school website par check kar sakte hain ya accounts desk par 0120 4660000 par call kar sakte hain.";
      } else if (lower.includes("calendar") || lower.includes("schedule") || lower.includes("vacation") || lower.includes("summer") || lower.includes("winter")) {
        fallbackAnswer = "Academic Year 2026 to 2027 starts in April 2026. Summer break begins late May 2026, and Winter break starts late December 2026. Complete calendar is available on the website.";
      } else {
        fallbackAnswer = "Main DPS Indirapuram ka official AI assistant hoon. Admissions 2026 to 2027, academic calendar, streams, ya campus facilities se jude kisi bhi sawal ke liye aap hume 0120 4660000 par call ya info at dpsindirapuram com par email kar sakte hain.";
      }

      setCachedAnswer(input.message, fallbackAnswer, ctx.tenantId);
      return { answer: fallbackAnswer };
    }),

  synthesizeSpeech: publicQuery
    .input(
      z.object({
        text: z.string().min(1, "Text cannot be empty").max(350, "Text exceeds maximum 350 character limit for voice synthesis"),
        voiceId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const clientIp = ctx?.req?.headers?.get("x-forwarded-for") || ctx?.req?.headers?.get("cf-connecting-ip") || "global-client";
      
      // Rate limit for metered TTS voice synthesis
      const isTtsAllowed = checkRateLimit(`tts:${clientIp}`, 20, 60000) && (await checkPersistentRateLimit(`tts:${clientIp}`, 20, 60, ctx.tenantId));
      if (!isTtsAllowed) {
        return { audioBase64: null };
      }

      let ttsProvider: "google" | "elevenlabs" | "auto" = "elevenlabs";
      let googleApiKey = (
        process.env.GOOGLE_TTS_API_KEY ||
        process.env.GOOGLE_CLOUD_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.VITE_GOOGLE_TTS_API_KEY ||
        ""
      ).trim();
      let googleVoice = "en-IN-Journey-F";

      let elevenlabsApiKey = (
        process.env.ELEVENLABS_API_KEY ||
        process.env.VITE_ELEVENLABS_API_KEY ||
        process.env.DOPPLER_ELEVENLABS_API_KEY ||
        ""
      ).trim();
      let elevenlabsVoiceId = input.voiceId || "EXAVITQu4vr4xnSDxMaL";

      try {
        const { AiConfig } = await getMainModels(ctx.tenantId) as any;
        if (AiConfig) {
          const config = await AiConfig.findOne({}).sort({ updatedAt: -1 });
          if (config?.ttsProvider) {
            ttsProvider = config.ttsProvider;
          }
          if (config?.googleTtsApiKey && config.googleTtsApiKey.trim()) {
            googleApiKey = config.googleTtsApiKey.trim();
          }
          if (config?.googleTtsVoice && config.googleTtsVoice.trim()) {
            googleVoice = config.googleTtsVoice.trim();
          }
          if (config?.elevenlabsApiKey && config.elevenlabsApiKey.trim().startsWith("sk_")) {
            elevenlabsApiKey = config.elevenlabsApiKey.trim();
          }
          if (config?.elevenlabsVoiceId && config.elevenlabsVoiceId.trim()) {
            elevenlabsVoiceId = config.elevenlabsVoiceId.trim();
          }
        }
      } catch {}

      // Keep prompt punchy, natural & strictly strip punctuation marks so TTS never vocalizes them
      const cleanPrompt = input.text
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, " ")
        .replace(/[|\s]*[-—–_=]{2,}[+|\s\-—–_=]*/g, " ")
        .replace(/\b2026[-–—]27\b/g, "2026 to 2027")
        .replace(/\bPre[-–—]Nursery\b/gi, "Pre Nursery")
        .replace(/\bIX\s*&\s*XI\b/gi, "9 and 11")
        .replace(/\bIX\b/g, "9")
        .replace(/\bXI\b/g, "11")
        .replace(/\bXII\b/g, "12")
        .replace(/\bDPSI\b/gi, "DPS Indirapuram")
        .replace(/\+?91[- ]?0?120[- ]?4660000/g, "0 1 2 0 4 6 6 0 0 0 0")
        .replace(/info@dpsindirapuram\.com/gi, "info at dps indirapuram com")
        .replace(/([0-9]+)\.([0-9]+)%?/g, "$1 point $2 percent")
        .replace(/[,.;:!?'"“”‘’`~@#$%^&*()_+=\-[\]{}|\\/<>•·▪▫◦]/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 220)
        .trim();
      const hasHindi = /[\u0900-\u097F]/.test(cleanPrompt);

      // 1. ElevenLabs Engine (High-Fidelity AI Female Voice)
      if ((ttsProvider === "elevenlabs" || ttsProvider === "auto") && elevenlabsApiKey && Date.now() > elevenlabsCircuitBreakerUntil) {
        const ttsModels = ["eleven_flash_v2_5", "eleven_turbo_v2_5", "eleven_multilingual_v2"];

        for (const modelId of ttsModels) {
          try {
            const response = await fetch(
              `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}?optimize_streaming_latency=4&output_format=mp3_22050_32`,
              {
                method: "POST",
                headers: {
                  Accept: "audio/mpeg",
                  "Content-Type": "application/json",
                  "xi-api-key": elevenlabsApiKey,
                },
                body: JSON.stringify({
                  text: cleanPrompt,
                  model_id: modelId,
                  voice_settings: {
                    stability: 0.50,
                    similarity_boost: 0.80,
                    style: 0.0,
                    use_speaker_boost: true,
                  },
                }),
                signal: AbortSignal.timeout(3500),
              }
            );

            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString("base64");
              return { audioBase64: `data:audio/mpeg;base64,${base64}` };
            } else if (response.status === 401 || response.status === 403 || response.status === 429) {
              // 30s transient cooldown so admin updating keys can immediately retry
              elevenlabsCircuitBreakerUntil = Date.now() + 30 * 1000;
              break;
            }
          } catch {
            // Model failover
          }
        }
      }

      // 2. Google Cloud Text-to-Speech Engine (Journey & Neural2)
      if (googleApiKey) {
        try {
          const langCode = hasHindi ? "hi-IN" : (googleVoice.startsWith("hi") ? "hi-IN" : "en-IN");
          const selectedVoice = hasHindi ? "hi-IN-Neural2-A" : googleVoice;

          const googleRes = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: { text: cleanPrompt },
                voice: {
                  languageCode: langCode,
                  name: selectedVoice,
                  ssmlGender: selectedVoice.endsWith("-D") ? "MALE" : "FEMALE",
                },
                audioConfig: {
                  audioEncoding: "MP3",
                  speakingRate: 1.02,
                  pitch: 0.0,
                },
              }),
              signal: AbortSignal.timeout(4500),
            }
          );

          if (googleRes.ok) {
            const data = (await googleRes.json()) as { audioContent?: string };
            if (data?.audioContent) {
              return { audioBase64: `data:audio/mp3;base64,${data.audioContent}` };
            }
          }
        } catch {
          // Fall through
        }
      }

      return { audioBase64: null };
    }),
});

