/**
 * DPS Indirapuram AI Conversational Interface & Web Audio Hardware Synthesizer
 * Copyright (c) 2026 DPS Indirapuram Portal Architecture. All rights reserved.
 * Custom client-side streaming typewriter and hardware-level Web Audio buffer decoder.
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, MessageSquare, GraduationCap, RotateCcw, ExternalLink, Phone, Mail, Mic, Calendar, Volume2, VolumeX } from "lucide-react";
import { trpc } from "@/providers/trpc";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: "assistant" | "user";
  text: string;
  timestamp?: string;
  isStreaming?: boolean;
  actionUrl?: string;
  actionType?: "call" | "email" | "link";
}

// Dynamic Action Helper for Action Buttons - dynamically configured from CMS SiteSettings
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

export default function AIChatWidget() {
  const aiChatMutation = trpc.ai.chat.useMutation();
  const ttsMutation = trpc.ai.synthesizeSpeech.useMutation();
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery(undefined, {
    staleTime: 60000,
  });

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const welcomeMessage = getSetting(
    "chat_welcome_message",
    "Hello! I am DPSI AI. I can assist you with Admissions, Exam Schedules, Vacations, Academic Streams, and Campus Facilities."
  );
  const calendarPdfUrl = getSetting("calendar_pdf_url", "https://www.dpsindirapuram.com/calendar/annual-academic-calendar.pdf");
  const phone = getSetting("contact_phone", "+91-0120-4660000");
  const email = getSetting("contact_email", "info@dpsindirapuram.com");

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  // Update initial greeting when site settings load
  useEffect(() => {
    if (welcomeMessage) {
      setMessages(prev => {
        if (prev.length === 1 && prev[0].role === "assistant") {
          return [{
            ...prev[0],
            text: welcomeMessage,
          }];
        }
        return prev;
      });
    }
  }, [welcomeMessage]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hold-to-Talk Voice Input State & Handlers
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  // Voice State & Speech Synthesis Control
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const spokenResponseRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const clientQueryCache = useRef<Map<string, { answer: string; actionUrl?: string; actionType?: "call" | "email" | "link" }>>(new Map());

  // Helper to instantly kill and silence all audio and speech synthesis without destroying singleton
  const stopAllAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    activeUtteranceRef.current = null;
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Web Audio Context reference for iOS/Android low-level hardware playback
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    return audioCtxRef.current;
  };

  // Convert Base64 data URL to ArrayBuffer for Web Audio decoding
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const raw = base64.includes(",") ? base64.split(",")[1] : base64;
    const binaryString = window.atob(raw);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const playBufferWithWebAudio = async (arrayBuf: ArrayBuffer): Promise<boolean> => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return false;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      const audioBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);
      return true;
    } catch {
      return false;
    }
  };

  // Mobile Audio Unlocker for iOS Safari & Android Chrome Autoplay Policies
  const unlockMobileAudio = () => {
    if (typeof window === "undefined") return;
    try {
      // 1. Resume Web Audio Context
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(ctx.currentTime + 0.02);
      }

      // 2. Unlock HTML5 Audio Singleton
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audioRef.current.play().then(() => {
        if (audioRef.current) audioRef.current.pause();
      }).catch(() => {});

      // 3. Unlock WebKit SpeechSynthesis
      if ("speechSynthesis" in window) {
        window.speechSynthesis.resume();
        const silent = new SpeechSynthesisUtterance(" ");
        silent.volume = 0.01;
        window.speechSynthesis.speak(silent);
      }
    } catch {}
  };

  const speakAnswerOnce = async (text: string, forcePlay = false) => {
    if (typeof window === "undefined") return;
    if (!forcePlay && isMuted) return;
    if (spokenResponseRef.current === text && !forcePlay) return;

    spokenResponseRef.current = text;

    // Stop any existing audio or speech synthesis before new speech
    stopAllAudio();

    // Ensure audio singleton exists
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    // Clean markdown, URLs, and normalize acronyms for ultra-realistic pronunciation
    let cleanText = text
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[*_#`~[\]()|]/g, " ")
      .replace(/\bDPSI\b/gi, "DPS Indirapuram")
      .replace(/\bCBSE\b/gi, "C B S E")
      .replace(/\bAI\b/gi, "A I")
      .replace(/\b3D\b/gi, "3 D")
      .replace(/\bIX & XI\b/gi, "9 and 11")
      .replace(/\bTC\b/gi, "Transfer Certificate")
      .replace(/\s+/g, " ")
      .trim();

    // Natural sentence speech length (up to 350 chars)
    cleanText = cleanText.slice(0, 350).trim();
    if (!cleanText) return;

    // 1. Check fast client-side audio cache first
    if (audioCacheRef.current.has(cleanText)) {
      const cached = audioCacheRef.current.get(cleanText);
      if (cached) {
        setIsSpeaking(true);
        const arrayBuf = base64ToArrayBuffer(cached);
        const played = await playBufferWithWebAudio(arrayBuf);
        if (played) return;

        if (audioRef.current) {
          audioRef.current.src = cached;
          audioRef.current.currentTime = 0;
          audioRef.current.onended = () => setIsSpeaking(false);
          audioRef.current.onerror = () => setIsSpeaking(false);
          await audioRef.current.play().catch(() => { setIsSpeaking(false); });
          return;
        }
      }
    }

    // 2. High-fidelity ElevenLabs voice synthesis (Sarah: EXAVITQu4vr4xnSDxMaL) if API key configured
    try {
      const ttsRes = await ttsMutation.mutateAsync({ text: cleanText, voiceId: "EXAVITQu4vr4xnSDxMaL" });
      if (ttsRes?.audioBase64) {
        audioCacheRef.current.set(cleanText, ttsRes.audioBase64);
        setIsSpeaking(true);
        
        // Web Audio API Direct Buffer Playback (iOS/Android hardware sound)
        const arrayBuf = base64ToArrayBuffer(ttsRes.audioBase64);
        const played = await playBufferWithWebAudio(arrayBuf);
        if (played) return;

        // HTML5 Audio Element Fallback
        if (audioRef.current) {
          audioRef.current.src = ttsRes.audioBase64;
          audioRef.current.currentTime = 0;
          audioRef.current.onended = () => setIsSpeaking(false);
          audioRef.current.onerror = () => setIsSpeaking(false);
          await audioRef.current.play().catch(() => { setIsSpeaking(false); });
          return;
        }
      }
    } catch {
      // Fall through to browser natural voice engine
    }

    // 3. Browser Natural Human Voice Engine (Ultra-reliable on all devices)
    if (!("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {}

    const hasHindi = /[\u0900-\u097F]/.test(cleanText);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtteranceRef.current = utterance; // Prevent garbage collection in Chromium

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      activeUtteranceRef.current = null;
      setIsSpeaking(false);
    };
    utterance.onerror = (e) => {
      console.warn("Speech playback error:", e);
      activeUtteranceRef.current = null;
      setIsSpeaking(false);
    };

    const voices = window.speechSynthesis.getVoices();

    if (voices && voices.length > 0) {
      if (hasHindi) {
        // Natural Human Hindi voices (Microsoft Natural Swara, Madhur, Google Hindi)
        const naturalHindi =
          voices.find((v) => /hi[-_]IN/i.test(v.lang) && /natural|neural|online/i.test(v.name)) ||
          voices.find((v) => /hi[-_]IN/i.test(v.lang) && /swara|madhur|kalpana|hemant/i.test(v.name)) ||
          voices.find((v) => /hi[-_]IN/i.test(v.lang) && /google/i.test(v.name)) ||
          voices.find((v) => /hi[-_]IN/i.test(v.lang)) ||
          voices.find((v) => v.lang.startsWith("hi")) ||
          voices.find((v) => /en[-_]IN/i.test(v.lang) && /natural|neural/i.test(v.name));

        if (naturalHindi) {
          utterance.voice = naturalHindi;
          utterance.lang = naturalHindi.lang;
        } else {
          utterance.lang = "hi-IN";
        }
      } else {
        // Studio-grade Natural Human voices (Microsoft Natural, Apple Enhanced/Premium, Google Studio)
        const realPersonVoice =
          // 1. Natural Indian English
          voices.find((v) => /en[-_]IN/i.test(v.lang) && /natural|neural|online|premium|enhanced/i.test(v.name)) ||
          voices.find((v) => /en[-_]IN/i.test(v.lang) && /neerja|sonia|heera|veena|kavya|rishi|anjali/i.test(v.name)) ||
          // 2. Apple Enhanced Human Voices (Samantha Enhanced, Ava, Serena, Karen)
          voices.find((v) => /samantha|ava|serena|moira|karen|oliver|zoe/i.test(v.name) && /enhanced|premium|natural/i.test(v.name)) ||
          // 3. Microsoft Natural Human Voices
          voices.find((v) => /en[-_](US|GB|UK)/i.test(v.lang) && /natural|neural|online/i.test(v.name) && /jenny|aria|emma|sonia|ava/i.test(v.name)) ||
          // 4. Google UK / US Natural Voices
          voices.find((v) => /google/i.test(v.name) && /uk english female|us english|india english/i.test(v.name)) ||
          // 5. Standard en-IN Regional
          voices.find((v) => /en[-_]IN/i.test(v.lang)) ||
          // 6. Samantha / Clean English
          voices.find((v) => /samantha/i.test(v.name)) ||
          voices.find((v) => v.lang.startsWith("en") && /female/i.test(v.name)) ||
          voices.find((v) => v.lang.startsWith("en"));

        if (realPersonVoice) {
          utterance.voice = realPersonVoice;
          utterance.lang = realPersonVoice.lang;
        } else {
          utterance.lang = "en-IN";
        }
      }
    } else {
      utterance.lang = hasHindi ? "hi-IN" : "en-IN";
    }

    // Warm, natural real-person conversational pacing
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Small timeout avoids Chrome queue cancellation deadlock
    setTimeout(() => {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis speak error:", err);
        setIsSpeaking(false);
      }
    }, 40);
  };

  const isProcessingRef = useRef(false);

  const startListening = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    
    // CRITICAL: Instantly stop and silence any playing voice before listening
    stopAllAudio();

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening || recognitionRef.current) return;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      transcriptRef.current = "";

      recognition.onresult = (event: any) => {
        let current = "";
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        transcriptRef.current = current;
        setInput(current);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        const text = transcriptRef.current.trim();
        if (text) {
          transcriptRef.current = "";
          handleSend(text);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const stopListening = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const toggleMic = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    // Stop any playing audio immediately when mic button is pressed
    stopAllAudio();
    if (isListening) {
      stopListening(e);
    } else {
      startListening(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
      if (isListening || recognitionRef.current) {
        try {
          recognitionRef.current?.stop();
        } catch {
          // ignore
        }
        setIsListening(false);
        recognitionRef.current = null;
      }
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
      setIsTyping(false);
      isProcessingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    // CRITICAL: Stop everything when cross button is clicked
    stopAllAudio();
    if (isListening || recognitionRef.current) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      recognitionRef.current = null;
    }
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }
    setIsTyping(false);
    isProcessingRef.current = false;
    setIsOpen(false);
  };

  const handleResetChat = () => {
    stopAllAudio();
    spokenResponseRef.current = null;
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setIsTyping(false);
    isProcessingRef.current = false;
    setMessages([
      {
        role: "assistant",
        text: "Chat reset! How can I help you with DPS Indirapuram today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const fetchGroqAIResponse = async (query: string, currentHistory: Message[]) => {
    const normKey = query.toLowerCase().replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, " ").trim();
    if (clientQueryCache.current.has(normKey) && currentHistory.length <= 1) {
      return clientQueryCache.current.get(normKey)!;
    }

    try {
      const formattedHistory = currentHistory
        .filter((m) => m.text)
        .slice(-4)
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          text: m.text,
        }));

      const res = await aiChatMutation.mutateAsync({
        message: query,
        history: formattedHistory,
      });

      if (res?.answer && res.answer.trim()) {
        let text = res.answer
          .replace(/<think>[\s\S]*?<\/think>/gi, "")
          .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
          .replace(/```[\s\S]*?```/g, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/#{1,6}\s+/g, "")
          .replace(/`{1,3}/g, "")
          .replace(/^\s*[-*•]\s+/gm, "• ")
          .replace(/\*/g, "")
          .replace(/\s+/g, " ")
          .trim();

        const action = getDynamicAction(query, text, { calendarPdfUrl, phone, email });
        const result = { answer: text, actionUrl: action.actionUrl, actionType: action.actionType };
        clientQueryCache.current.set(normKey, result);
        return result;
      }
    } catch {
      // Gracefully fall back to local responses without console errors
    }

    // Comprehensive smart local fallback answers grounded in the official academic calendar and school records
    const lower = query.toLowerCase();
    const fallbackAction = getDynamicAction(query, "", { calendarPdfUrl, phone, email });
    let fallbackText = "";

    if (lower.includes("calendar") || lower.includes("academic year") || lower.includes("schedule")) {
      fallbackText = "The DPS Indirapuram Academic Year 2026-27 begins in April 2026 for all classes. It features regular Periodic Tests, Mid-Term exams in September, Pre-Board exams in December/January, and Annual exams concluding in February-March 2027.";
    } else if (lower.includes("summer") || lower.includes("vacation")) {
      fallbackText = "Summer break begins in late May 2026 for all classes. School reopens after summer break in June 2026 for Classes X & XII, and in July 2026 for Nursery to Class IX and Class XI.";
    } else if (lower.includes("winter") || lower.includes("winter break")) {
      fallbackText = "Winter break begins towards the end of December 2026 for all classes. Classes IX to XII reopen in early January 2027, followed by Nursery to Class VIII in mid-January 2027.";
    } else if (lower.includes("exam") || lower.includes("test") || lower.includes("half yearly") || lower.includes("preboard") || lower.includes("annual")) {
      fallbackText = "Periodic Tests are held across April, May, July, and November. Half Yearly exams take place in September 2026, Pre-Boards for Classes X & XII occur in December 2026 and January 2027, and Annual Final Exams occur in January-March 2027.";
    } else if (lower.includes("ptm") || lower.includes("parent teacher")) {
      fallbackText = "Parent-Teacher Meetings (PTMs) are scheduled regularly throughout the academic session following key assessment cycles with answer script viewings.";
    } else if (lower.includes("admiss") || lower.includes("apply") || lower.includes("register")) {
      fallbackText = "Admissions for the 2026-27 academic session are currently open from Pre-Nursery to Class IX and Class XI through the official school admission portal.";
    } else {
      fallbackText = "Namaste! I am DPSI AI. You can ask me about Admissions 2026-27, Academic Calendar, Exam Schedules, Streams, or Facilities in both English and Hindi. How can I assist you today?";
    }

    const fallbackResult = {
      answer: fallbackText,
      actionUrl: fallbackAction.actionUrl,
      actionType: fallbackAction.actionType,
    };
    clientQueryCache.current.set(normKey, fallbackResult);
    return fallbackResult;
  };

  const handleSend = async (userQuery: string) => {
    const textToSend = userQuery.trim();
    if (!textToSend || isTyping || isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Unlock mobile audio pipeline on touch/click
    unlockMobileAudio();
    stopAllAudio();

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setInput("");
    transcriptRef.current = "";

    setMessages((prev) => [...prev, { role: "user", text: textToSend, timestamp: timeStr }]);
    setIsTyping(true);

    try {
      const response = await fetchGroqAIResponse(textToSend, messages);
      // Clean markdown and formatting artifacts once in memory
      const cleanAnswer = (response.answer || "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/\*/g, "")
        .replace(/#{1,6}\s+/g, "")
        .replace(/`{1,3}/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/:\s*(\.|\s*$)/g, ".")
        .replace(/\s+/g, " ")
        .trim();

      // Start voice output immediately so sound plays right away
      speakAnswerOnce(cleanAnswer);

      let charIndex = 0;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "",
          timestamp: timeStr,
          isStreaming: true,
          actionUrl: response.actionUrl,
          actionType: response.actionType,
        },
      ]);

      if (typingTimerRef.current) clearInterval(typingTimerRef.current);

      // Ultra-Fast & Smooth 60 FPS Adaptive Typewriter (Finishes in ~500ms)
      const step = Math.max(3, Math.ceil(cleanAnswer.length / 25));
      typingTimerRef.current = setInterval(() => {
        charIndex += step;
        const currentSlice = cleanAnswer.slice(0, Math.min(charIndex, cleanAnswer.length));

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              text: currentSlice,
              isStreaming: charIndex < cleanAnswer.length,
            };
          }
          return updated;
        });

        if (charIndex >= cleanAnswer.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          setIsTyping(false);
          isProcessingRef.current = false;
        }
      }, 16);
    } catch {
      setIsTyping(false);
      isProcessingRef.current = false;
    }
  };

    return (
      <div className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] right-[max(12px,env(safe-area-inset-right))] z-[99999] pointer-events-none font-sans flex flex-col items-end justify-end">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="dpsi-ai-chat-window"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-[calc(100vw-24px)] sm:w-[385px] h-[520px] max-h-[82dvh] bg-gradient-to-b from-[#fce7f3] via-[#e2e8f0] to-[#047857] backdrop-blur-2xl border border-white/80 rounded-[26px] sm:rounded-[28px] shadow-2xl shadow-slate-900/30 flex flex-col overflow-hidden text-slate-900 relative pointer-events-auto"
            >
              {/* Ambient Silk Wave Orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#fed7aa]/35 blur-3xl pointer-events-none" />
              <div className="absolute top-1/3 left-0 w-64 h-64 rounded-full bg-[#cbd5e1]/50 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#fecdd3]/35 blur-3xl pointer-events-none" />

              {/* STICKY TOP HEADER */}
              <div className="sticky top-0 z-40 shrink-0 p-3.5 bg-gradient-to-r from-[#1e1b4b] via-[#1e3a8a] to-[#047857] text-white flex items-center justify-between shadow-md border-b border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0072ff] to-[#00c6ff] flex items-center justify-center text-white shadow-md shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm text-white leading-tight">
                        DPSI AI
                      </h3>
                      {isSpeaking && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-400/50 text-[10px] text-emerald-200 font-bold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Speaking
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isMuted) {
                        stopAllAudio();
                        setIsMuted(true);
                      } else {
                        setIsMuted(false);
                        unlockMobileAudio();
                        const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
                        if (lastAssistantMsg) {
                          speakAnswerOnce(lastAssistantMsg.text, true);
                        }
                      }
                    }}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      isMuted ? "text-red-300 hover:bg-white/10" : "text-emerald-300 hover:bg-white/10"
                    }`}
                    title={isMuted ? "Unmute Voice Output" : "Mute Voice Output"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleResetChat}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Reset Conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Close Assistant"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* MESSAGES SCROLL AREA */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 relative z-10 custom-scrollbar overscroll-contain">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm relative break-words [word-break:break-word] ${
                        msg.role === "user"
                          ? "bg-slate-900 text-white rounded-br-xs font-medium"
                          : "bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-white/80 dark:border-slate-700/80 shadow-md backdrop-blur-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words [word-break:break-word]">
                        {msg.text}
                      </p>
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3 bg-emerald-500 ml-1 animate-pulse" />
                      )}

                      {/* ACTION BUTTON ENHANCEMENT */}
                      {msg.actionUrl && msg.role === "assistant" && !msg.isStreaming && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          {msg.actionType === "call" ? (
                            <a
                              href={msg.actionUrl}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call School Office
                            </a>
                          ) : msg.actionType === "email" ? (
                            <a
                              href={msg.actionUrl}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                            >
                              <Mail className="w-3.5 h-3.5" /> Email Admissions Desk
                            </a>
                          ) : (
                            <a
                              href={msg.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Open Link
                            </a>
                          )}
                        </div>
                      )}
                      {/* VOICE REPLAY BUTTON FOR ASSISTANT RESPONSES */}
                      {msg.role === "assistant" && !msg.isStreaming && (
                        <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMuted(false);
                              unlockMobileAudio();
                              spokenResponseRef.current = null;
                              speakAnswerOnce(msg.text, true);
                            }}
                            title="Play voice answer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer select-none py-0.5"
                          >
                            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                            <span>Listen to Voice</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {msg.timestamp && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    )}
                  </motion.div>
                ))}

                {/* Instant Audio Wave / Thinking Animation */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl rounded-bl-xs border border-white/80 dark:border-slate-700/80 shadow-md w-max"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0072ff] to-[#00c6ff] flex items-center justify-center text-white shadow-sm animate-spin-slow">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-4 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-4 bg-blue-500 rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">
                      DPSI AI is thinking...
                    </span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* QUICK SUGGESTION CHIPS - 2x2 GRID WITHOUT SIDE SCROLL */}
              <div className="px-3 pt-2 pb-1.5 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shrink-0">
                <div className="grid grid-cols-2 gap-1.5 py-0.5">
                  {[
                    { label: "Admissions 2026", icon: <GraduationCap className="w-3 h-3 text-sky-600" />, query: "Tell me about admissions 2026" },
                    { label: "Academic Calendar", icon: <Calendar className="w-3 h-3 text-rose-500" />, query: "What is the 2026-27 Academic Calendar schedule for exams, breaks, and PTMs?" },
                    { label: "AI Robotics Lab", icon: <Bot className="w-3 h-3 text-amber-500" />, query: "Tell me about your AI Robotics Lab" },
                    { label: "Class 11 Streams", icon: <MessageSquare className="w-3 h-3 text-indigo-600" />, query: "What streams are offered in Class 11?" },
                  ].map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        unlockMobileAudio();
                        handleSend(chip.query);
                      }}
                      disabled={isTyping}
                      className="w-full px-2 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-white/80 text-slate-800 font-bold text-[11px] truncate transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:border-sky-400 disabled:opacity-50 cursor-pointer"
                    >
                      {chip.icon}
                      <span className="truncate">{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* INPUT FORM */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  unlockMobileAudio();
                  handleSend(input);
                }}
                className="relative z-20 p-3 bg-gradient-to-r from-[#1e1b4b] via-[#1e3a8a] to-[#047857] text-white shrink-0 border-t border-emerald-500/30 rounded-b-[27px] mt-auto w-full"
              >
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-600/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-full shadow-lg border border-rose-400/40 flex items-center gap-1.5 whitespace-nowrap z-30 pointer-events-none"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>Listening...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Unified Input Box Pill Container */}
                <div className="w-full flex items-center gap-1.5 p-1 rounded-full bg-white/10 border border-white/20 focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
                  {/* Extreme Left Mic Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      unlockMobileAudio();
                      toggleMic(e);
                    }}
                    title={isListening ? "Stop listening and send" : "Speak to DPSI AI"}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer shrink-0 ${
                      isListening
                        ? "bg-rose-600 text-white scale-105 shadow-rose-500/50"
                        : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
                    }`}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
                  </button>

                  {/* Input Text Field */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="sentences"
                    spellCheck={false}
                    className="flex-1 bg-transparent text-[16px] sm:text-xs text-white placeholder-white/50 focus:outline-none px-2.5 py-1"
                  />

                  {/* Extreme Right Send Button */}
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10b981] to-[#00c6ff] text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0 shadow-sm cursor-pointer touch-manipulation"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Floating Trigger Button - Firmly Fixed Anchor without Layout Shift */
            <motion.button
              key="dpsi-ai-trigger-button"
              onClick={() => {
                unlockMobileAudio();
                setIsOpen(true);
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-[#fce7f3] via-[#e2e8f0] to-[#ffedd5] text-slate-900 font-bold text-xs shadow-2xl shadow-slate-900/30 border border-white/90 backdrop-blur-2xl cursor-pointer pointer-events-auto select-none transition-shadow hover:shadow-emerald-500/20 touch-manipulation"
              title="Click to open DPSI AI Assistant"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0072ff] to-[#00c6ff] flex items-center justify-center text-white shadow-md shrink-0 pointer-events-none">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="text-left pr-1 pointer-events-none">
                <p className="font-extrabold text-slate-900 text-xs leading-none">DPSI AI</p>
                <p className="text-[10px] text-slate-600 font-medium leading-none mt-1">Ask Anything</p>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

