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

const DEFAULT_SYSTEM_PROMPT = `You are DPSI AI, the official and intelligent AI assistant for Delhi Public School Indirapuram (DPS Indirapuram), located in Ghaziabad, Uttar Pradesh.

LANGUAGE & TONE INSTRUCTIONS:
- You are warm, polite, professional, and extremely helpful.
- If the user talks in Hindi or Hinglish (e.g. "kaise ho", "admission kab start hoga", "fees kitni hai"), reply in fluent, natural Hindi or Hinglish.
- If the user talks in English, reply in crisp, articulate, professional English.
- Keep your answers speech-friendly: DO NOT use markdown formatting like asterisks (* or **), hashtags (#), brackets, or backticks. Write in clear, natural sentences that sound wonderful when spoken aloud by voice assistants.
- Provide comprehensive, accurate answers in 2 to 4 concise sentences.

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

// Simple in-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit = 40, windowMs = 60000): boolean {
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

const GROQ_FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "groq/compound-mini",
];

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
      
      const isAllowed = checkRateLimit(clientIp, 40, 60000) && (await checkPersistentRateLimit(`chat:${clientIp}`, 40, 60));
      if (!isAllowed) {
        return {
          answer: "You are sending messages too quickly. Please wait a moment before asking another question.",
        };
      }

      const apiKey = process.env.GROQ_API_KEY || "";

      // Load admin-configured system prompt from MongoDB if available
      let systemPrompt = DEFAULT_SYSTEM_PROMPT;
      try {
        const { AiConfig } = await getMainModels() as any;
        if (AiConfig) {
          const config = await AiConfig.findOne({}).sort({ updatedAt: -1 });
          if (config?.systemPrompt && config.systemPrompt.trim().length > 100) {
            systemPrompt = config.systemPrompt;
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

      // Keep only last 6 turns for optimal speed + context accuracy
      const recentHistory = (input.history || []).slice(-6);

      const messagesPayload = [
        { role: "system", content: systemPrompt },
        ...recentHistory.map((h) => ({ role: h.role, content: h.text })),
        { role: "user", content: sanitizedMsg || input.message },
      ];

      // Try models in fallback order with ultra-fast timeout (4s per model)
      if (apiKey) {
        for (const model of GROQ_FALLBACK_MODELS) {
          try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model,
                messages: messagesPayload,
                temperature: 0.3,
                max_tokens: 300,
                stream: false,
              }),
              signal: AbortSignal.timeout(4000), // 4s fast timeout per attempt
            });

            if (!response.ok) {
              const errText = await response.text();
              console.warn(`Groq API error with model ${model}:`, errText);
              continue;
            }

            const data = (await response.json()) as GroqApiResponse;
            let replyText = data?.choices?.[0]?.message?.content || "";

            if (replyText) {
              // Strip think tags and markdown formatting for clean voice and text output
              replyText = replyText
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/\*(.*?)\*/g, "$1")
                .replace(/#{1,6}\s+/g, "")
                .replace(/`{1,3}/g, "")
                .replace(/^[-*]\s+/gm, "")
                .replace(/\*/g, "")
                .replace(/\s{2,}/g, " ")
                .trim();

              if (replyText.length > 5) {
                return { answer: replyText };
              }
            }
          } catch (err) {
            console.warn(`Error calling Groq API model ${model}:`, err);
          }
        }
      }

      // Intelligent instant local keyword-based fallback if external API is unreachable or slow
      const lower = input.message.toLowerCase();
      if (lower.includes("kaise ho") || lower.includes("how are you") || lower.includes("namaste") || lower.includes("hello") || lower.includes("hi")) {
        return {
          answer: "Namaste! Main DPS Indirapuram ka official AI assistant DPSI AI hoon. Admissions Session 2026-27, academics, streams, facilities ya kisi bhi query ke liye main aapki kya madad kar sakta hoon?",
        };
      }
      if (lower.includes("admission") || lower.includes("apply") || lower.includes("form") || lower.includes("dakhila") || lower.includes("register")) {
        return {
          answer: "DPS Indirapuram mein Session 2026-27 ke liye Pre-Nursery se Class IX aur Class XI ke admissions open hain. Aap online apply kar sakte hain ya admission desk se +91-0120-4660000 par sampark kar sakte hain.",
        };
      }
      if (lower.includes("stream") || lower.includes("subject") || lower.includes("class 11") || lower.includes("11th")) {
        return {
          answer: "Class XI mein teen streams available hain: Science (PCM/PCB with AI, Biotech, Computer Science), Commerce (Accounts, Economics, Math, Business Studies), aur Humanities (Psychology, Legal Studies, Economics, Political Science).",
        };
      }
      if (lower.includes("facility") || lower.includes("campus") || lower.includes("lab") || lower.includes("sports") || lower.includes("robotics") || lower.includes("pool") || lower.includes("shooting")) {
        return {
          answer: "DPS Indirapuram ke 10-acre campus mein AI and Robotics Innovation Lab, Olympic-standard 50m swimming pool, ISSF certified shooting range, 80+ smart classrooms, aur digital library uplabdh hain.",
        };
      }
      if (lower.includes("principal") || lower.includes("head") || lower.includes("leadership") || lower.includes("chairperson")) {
        return {
          answer: "DPS Indirapuram ki Principal Ms. Priya Elizabeth John hain, Pro-Vice Chairperson Ms. Santosh Bansal hain, aur Chairman Mr. V.K. Shunglu (IAS Retd.) hain.",
        };
      }
      if (lower.includes("result") || lower.includes("topper") || lower.includes("board") || lower.includes("score")) {
        return {
          answer: "DPS Indirapuram ka CBSE Class 10 aur 12 mein 100% pass result raha hai. School toppers mein Siddhant Tiwari (99.4%), Ansh Pathak (99.4%) aur Aayush Jha (99.2%) shamil hain.",
        };
      }
      if (lower.includes("fee") || lower.includes("fees") || lower.includes("cost") || lower.includes("structure")) {
        return {
          answer: "Fee structure grade ke according structured hai. Detail fee chart aur online payment ke liye aap school website par check kar sakte hain ya accounts desk par +91-0120-4660000 par call kar sakte hain.",
        };
      }

      return {
        answer: "Main DPS Indirapuram ka official AI assistant hoon. Admissions 2026-27, academic calendar, streams, ya campus facilities se jude kisi bhi sawal ke liye aap hume +91-0120-4660000 par call ya info@dpsindirapuram.com par email kar sakte hain.",
      };
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
      
      // Stricter rate limit for metered TTS voice synthesis (Max 10 requests per minute per IP)
      const isTtsAllowed = checkRateLimit(`tts:${clientIp}`, 10, 60000) && (await checkPersistentRateLimit(`tts:${clientIp}`, 10, 60));
      if (!isTtsAllowed) {
        return { audioBase64: null };
      }

      const apiKey = process.env.ELEVENLABS_API_KEY || "";
      if (!apiKey) {
        return { audioBase64: null };
      }

      // Default to Sarah (EXAVITQu4vr4xnSDxMaL) - warm, clear, professional female voice
      const voiceId = input.voiceId || "EXAVITQu4vr4xnSDxMaL";

      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: input.text.slice(0, 350),
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.50,
              similarity_boost: 0.80,
              style: 0.10,
              use_speaker_boost: true,
            },
          }),
          signal: AbortSignal.timeout(7000), // 7s maximum timeout for TTS
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          return { audioBase64: `data:audio/mpeg;base64,${base64}` };
        }
        console.warn("ElevenLabs TTS status error:", response.status);
      } catch (error) {
        console.warn("Error calling ElevenLabs API on server:", error);
      }

      return { audioBase64: null };
    }),
});

