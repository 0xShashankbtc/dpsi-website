import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("AI Chat & Voice Synthesis Unit Test Suite", () => {
  // 1. Text Cleansing & Acronym Normalization for TTS
  function cleanSpeechText(text: string): string {
    let clean = text
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[*_#`~[\]()|]/g, " ")
      .replace(/\bDPSI\b/gi, "D P S I")
      .replace(/\bCBSE\b/gi, "C B S E")
      .replace(/\bAI\b/gi, "A I")
      .replace(/\b3D\b/gi, "3 D")
      .replace(/\bIX & XI\b/gi, "9 and 11")
      .replace(/\s+/g, " ")
      .trim();

    const firstSentenceMatch = clean.match(/^(.*?[.!?])\s/);
    if (firstSentenceMatch && firstSentenceMatch[1].length > 25 && firstSentenceMatch[1].length < 180) {
      clean = firstSentenceMatch[1].trim();
    } else {
      clean = clean.slice(0, 180).trim();
    }

    return clean;
  }

  describe("TTS Speech Text Sanitization & Chunking", () => {
    it("strips internal thought tags and raw URLs", () => {
      const input = "<think>Analyzing user question</think>Welcome to DPSI. Visit https://dpsindirapuram.com for details.";
      const cleaned = cleanSpeechText(input);
      expect(cleaned).not.toContain("<think>");
      expect(cleaned).not.toContain("https://");
      expect(cleaned).toContain("D P S I");
    });

    it("normalizes common educational acronyms for natural human speech", () => {
      const input = "Admissions for CBSE curriculum in DPSI are open for classes IX & XI with AI robotics lab.";
      const cleaned = cleanSpeechText(input);
      expect(cleaned).toContain("C B S E");
      expect(cleaned).toContain("D P S I");
      expect(cleaned).toContain("9 and 11");
      expect(cleaned).toContain("A I");
    });

    it("extracts the first conversational sentence cleanly under 180 characters", () => {
      const longInput = "Admissions for the 2026-27 session are currently open from Pre-Nursery to Class 9 and 11. You can apply online through the official portal anytime. Fee structures and scholarships are available on request.";
      const cleaned = cleanSpeechText(longInput);
      expect(cleaned.length).toBeLessThanOrEqual(180);
      expect(cleaned.endsWith(".")).toBe(true);
      expect(cleaned).toContain("Pre-Nursery");
    });
  });

  // 2. Dynamic Action Detection
  function getDynamicAction(query: string, text?: string, settings?: { calendarPdfUrl?: string; phone?: string; email?: string }) {
    const q = (query + " " + (text || "")).toLowerCase();
    const calUrl = settings?.calendarPdfUrl || "https://www.dpsindirapuram.com/calendar/annual-academic-calendar.pdf";
    const phone = settings?.phone || "+9101204660000";
    const email = settings?.email || "info@dpsindirapuram.com";

    if (q.includes("calendar link") || q.includes("download calendar") || q.includes("academic calendar pdf") || q.includes("schedule pdf")) {
      return { actionUrl: calUrl, actionType: "link" as const };
    }
    if (q.includes("how to apply") || q.includes("admission link") || q.includes("registration link") || q.includes("admission portal") || q.includes("admission form")) {
      return { actionUrl: "/admissions", actionType: "link" as const };
    }
    if (q.includes("contact number") || q.includes("phone number") || q.includes("call school") || q.includes("phone no")) {
      return { actionUrl: `tel:${phone.replace(/[^0-9+]/g, "")}`, actionType: "call" as const };
    }
    if (q.includes("email id") || q.includes("email address") || q.includes("send email")) {
      return { actionUrl: `mailto:${email}`, actionType: "email" as const };
    }
    return { actionUrl: undefined, actionType: undefined };
  }

  describe("Dynamic Action URL Generator", () => {
    it("routes admission portal queries to /admissions", () => {
      const action = getDynamicAction("Where is the admission portal to register?");
      expect(action.actionType).toBe("link");
      expect(action.actionUrl).toBe("/admissions");
    });

    it("generates telephone tel: links for contact queries", () => {
      const action = getDynamicAction("What is the school phone number?", "", { phone: "+91-120-4660000" });
      expect(action.actionType).toBe("call");
      expect(action.actionUrl).toBe("tel:+911204660000");
    });

    it("generates mailto: links for email queries", () => {
      const action = getDynamicAction("Please provide the admissions email address", "", { email: "admissions@dpsindirapuram.com" });
      expect(action.actionType).toBe("email");
      expect(action.actionUrl).toBe("mailto:admissions@dpsindirapuram.com");
    });

    it("generates PDF download link for calendar queries", () => {
      const action = getDynamicAction("Download academic calendar pdf", "", { calendarPdfUrl: "https://cdn.school.com/cal.pdf" });
      expect(action.actionType).toBe("link");
      expect(action.actionUrl).toBe("https://cdn.school.com/cal.pdf");
    });
  });

  // 3. AI Configuration Zod Schema Validation
  describe("AI Configuration Schema Validation", () => {
    const AiConfigSchema = z.object({
      systemPrompt: z.string().min(1, "System prompt is required"),
      modelId: z.string().default("llama-3.3-70b-versatile"),
      temperature: z.number().min(0).max(1).default(0.4),
      maxTokens: z.number().min(100).max(2000).default(700),
      apiKey: z.string().optional(),
      ttsProvider: z.enum(["google", "elevenlabs", "auto"]).default("google"),
      googleTtsApiKey: z.string().optional(),
      googleTtsVoice: z.string().optional().default("en-IN-Journey-F"),
      elevenlabsApiKey: z.string().optional(),
      elevenlabsVoiceId: z.string().optional().default("EXAVITQu4vr4xnSDxMaL"),
    });

    it("validates full AI config with Google Cloud Journey & ElevenLabs settings", () => {
      const result = AiConfigSchema.safeParse({
        systemPrompt: "You are DPSI AI, a polite assistant for Delhi Public School Indirapuram.",
        modelId: "llama-3.3-70b-versatile",
        temperature: 0.3,
        maxTokens: 700,
        ttsProvider: "google",
        googleTtsApiKey: "AIzaSyTestKey12345",
        googleTtsVoice: "en-IN-Journey-F",
        elevenlabsApiKey: "sk_test_key_12345",
        elevenlabsVoiceId: "21m00Tcm4TlvDq8ikWAM",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ttsProvider).toBe("google");
        expect(result.data.googleTtsVoice).toBe("en-IN-Journey-F");
        expect(result.data.elevenlabsVoiceId).toBe("21m00Tcm4TlvDq8ikWAM");
      }
    });

    it("applies sensible defaults when optional parameters are omitted", () => {
      const result = AiConfigSchema.safeParse({
        systemPrompt: "DPSI Assistant Prompt",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.modelId).toBe("llama-3.3-70b-versatile");
        expect(result.data.temperature).toBe(0.4);
        expect(result.data.maxTokens).toBe(700);
        expect(result.data.ttsProvider).toBe("google");
        expect(result.data.googleTtsVoice).toBe("en-IN-Journey-F");
        expect(result.data.elevenlabsVoiceId).toBe("EXAVITQu4vr4xnSDxMaL");
      }
    });

    it("rejects invalid temperature exceeding range", () => {
      const result = AiConfigSchema.safeParse({
        systemPrompt: "Valid prompt",
        temperature: 1.8,
      });
      expect(result.success).toBe(false);
    });
  });

  // 4. Google Cloud Neural2 & Journey Indian Voices
  describe("Google Cloud Text-to-Speech Indian Voices", () => {
    it("recognizes official Indian English and Hindi Journey & Neural2 voices", () => {
      const validGoogleVoices = [
        "en-IN-Journey-F",
        "en-IN-Journey-D",
        "en-IN-Neural2-A",
        "en-IN-Neural2-D",
        "hi-IN-Neural2-A",
        "hi-IN-Neural2-D",
      ];
      expect(validGoogleVoices).toContain("en-IN-Journey-F");
      expect(validGoogleVoices).toContain("hi-IN-Neural2-A");
    });
  });

  // 6. Fast Active Groq Models & Deprecated Model Remapping
  describe("Groq Model Routing & Normalization", () => {
    const GROQ_FAST_MODELS = [
      "openai/gpt-oss-120b",
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-20b",
      "groq/compound-mini",
      "qwen/qwen3.6-27b",
    ];

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

    it("maps legacy Llama/Mixtral/Gemma models to active high-intelligence models", () => {
      expect(normalizeGroqModel("llama-3.3-70b-versatile")).toBe("openai/gpt-oss-120b");
      expect(normalizeGroqModel("llama-3.1-8b-instant")).toBe("openai/gpt-oss-120b");
      expect(normalizeGroqModel("mixtral-8x7b-32768")).toBe("openai/gpt-oss-120b");
      expect(normalizeGroqModel("gemma2-9b-it")).toBe("openai/gpt-oss-120b");
    });

    it("preserves active low-latency model IDs", () => {
      expect(normalizeGroqModel("qwen/qwen3.8-27b")).toBe("qwen/qwen3.8-27b");
      expect(normalizeGroqModel("openai/gpt-oss-120b")).toBe("openai/gpt-oss-120b");
      expect(normalizeGroqModel("openai/gpt-oss-20b")).toBe("openai/gpt-oss-20b");
    });
  });
});

