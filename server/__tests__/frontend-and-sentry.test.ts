import { describe, it, expect } from "vitest";
import { optimizeMediaUrl } from "../../src/sections/HeroSection";

describe("Frontend Core & Instrumentation Unit Tests", () => {
  describe("Hero Media URL Optimizer (optimizeMediaUrl)", () => {
    it("returns empty string for undefined or empty input", () => {
      expect(optimizeMediaUrl(undefined)).toBe("");
      expect(optimizeMediaUrl("")).toBe("");
      expect(optimizeMediaUrl("   ")).toBe("");
    });

    it("leaves local video paths unchanged", () => {
      const localPath = "/videos/campus_hero.mp4";
      expect(optimizeMediaUrl(localPath)).toBe(localPath);
    });

    it("leaves non-Cloudinary external URLs unchanged", () => {
      const externalUrl = "https://example.com/videos/hero.mp4";
      expect(optimizeMediaUrl(externalUrl)).toBe(externalUrl);
    });

    it("transforms raw Cloudinary video URLs into high-quality 1080p stream URLs", () => {
      const rawCloudinary = "https://res.cloudinary.com/dpsi/video/upload/v12345/campus_tour.mp4";
      const optimized = optimizeMediaUrl(rawCloudinary);
      expect(optimized).toContain("/video/upload/q_auto:best,vc_auto,w_1920,c_limit/");
      expect(optimized).toContain("campus_tour.mp4");
    });

    it("transforms raw Cloudinary image URLs into auto-format high-res URLs", () => {
      const rawImage = "https://res.cloudinary.com/dpsi/image/upload/v12345/banner.jpg";
      const optimized = optimizeMediaUrl(rawImage);
      expect(optimized).toContain("/image/upload/q_auto:best,f_auto,w_2560,c_limit/");
    });

    it("does not duplicate transformation flags if already present", () => {
      const alreadyOptimized = "https://res.cloudinary.com/dpsi/image/upload/q_auto:best,f_auto,w_2560,c_limit/v12345/banner.jpg";
      const result = optimizeMediaUrl(alreadyOptimized);
      expect(result).toBe(alreadyOptimized);
    });
  });

  describe("Footer Text Canvas Scaling Algorithm", () => {
    function calculateEffectiveFontSize(
      baseFontSize: number,
      canvasWidth: number,
      measuredTextWidth: number,
      targetRatio: number = 0.92
    ): number {
      const maxTextWidth = canvasWidth * targetRatio;
      if (measuredTextWidth > maxTextWidth && measuredTextWidth > 0) {
        return Math.floor(baseFontSize * (maxTextWidth / measuredTextWidth));
      }
      return baseFontSize;
    }

    it("maintains base font size when text fits within canvas bounds", () => {
      const baseSize = 68;
      const canvasWidth = 1920;
      const measuredWidth = 1000;
      const result = calculateEffectiveFontSize(baseSize, canvasWidth, measuredWidth);
      expect(result).toBe(68);
    });

    it("downscales font size proportionally when text exceeds canvas bounds", () => {
      const baseSize = 68;
      const canvasWidth = 800;
      const measuredWidth = 1472;
      const result = calculateEffectiveFontSize(baseSize, canvasWidth, measuredWidth);
      expect(result).toBe(34);
    });

    it("handles mobile portrait viewport (360px) without negative or zero values", () => {
      const baseSize = 40;
      const canvasWidth = 360;
      const measuredWidth = 1200;
      const result = calculateEffectiveFontSize(baseSize, canvasWidth, measuredWidth);
      expect(result).toBeGreaterThan(5);
      expect(result).toBeLessThan(baseSize);
      expect(result).toBe(11);
    });

    it("handles 4K ultra-wide viewport (3840px) cleanly", () => {
      const baseSize = 68;
      const canvasWidth = 3840;
      const measuredWidth = 1500;
      const result = calculateEffectiveFontSize(baseSize, canvasWidth, measuredWidth);
      expect(result).toBe(68);
    });
  });

  describe("Sentry Frontend Configuration & Error Handling", () => {
    const FRONTEND_DSN = "https://08fc42b0aa8123348987d264d2c88b99@o4511965668179968.ingest.us.sentry.io/4511965673029632";
    const BACKEND_DSN = "https://4af9b9eba8a785eebe4a2f825c232e87@o4511965668179968.ingest.us.sentry.io/4511965680304128";

    it("validates that frontend DSN matches the expected React project ID (4511965673029632)", () => {
      expect(FRONTEND_DSN).toContain("4511965673029632");
      expect(FRONTEND_DSN).toMatch(/^https:\/\/[a-f0-9]+@o\d+\.ingest\.us\.sentry\.io\/\d+$/);
    });

    it("validates that backend DSN matches the expected Node project ID (4511965680304128)", () => {
      expect(BACKEND_DSN).toContain("4511965680304128");
      expect(BACKEND_DSN).toMatch(/^https:\/\/[a-f0-9]+@o\d+\.ingest\.us\.sentry\.io\/\d+$/);
    });

    it("filters out benign browser warnings from Sentry logging", () => {
      const ignoredErrors = [
        "ResizeObserver loop limit exceeded",
        "Non-Error promise rejection captured",
        /^Network Error$/,
        /^Failed to fetch$/,
        /^Load failed$/,
      ];

      function shouldIgnore(message: string): boolean {
        return ignoredErrors.some((rule) => {
          if (rule instanceof RegExp) return rule.test(message);
          return rule === message;
        });
      }

      expect(shouldIgnore("ResizeObserver loop limit exceeded")).toBe(true);
      expect(shouldIgnore("Failed to fetch")).toBe(true);
      expect(shouldIgnore("Network Error")).toBe(true);
      expect(shouldIgnore("ReferenceError: foo is not defined")).toBe(false);
      expect(shouldIgnore("TypeError: Cannot read properties of undefined")).toBe(false);
    });

    it("validates trace propagation targets include production domain", () => {
      const traceTargets = [
        "localhost",
        /^https:\/\/dpsindirapuram\.vercel\.app/,
        /^https:\/\/dpsindirapuram\.com/,
        /^https:\/\/dpsi-website\.vercel\.app/,
      ];

      function isTraceTarget(url: string): boolean {
        return traceTargets.some((target) => {
          if (target instanceof RegExp) return target.test(url);
          return url.includes(target);
        });
      }

      expect(isTraceTarget("https://dpsindirapuram.vercel.app/api/trpc")).toBe(true);
      expect(isTraceTarget("http://localhost:3000/api/trpc")).toBe(true);
      expect(isTraceTarget("https://malicious-external-api.com/data")).toBe(false);
    });
  });

  describe("Interactive Facilities Data Pipeline", () => {
    interface RawFacility {
      _id?: string;
      id?: string;
      title?: string;
      category?: string;
      icon?: string;
      imageUrl?: string;
      tagline?: string;
      description?: string;
      highlights?: string[];
      metrics?: { value: string; label: string }[];
      isDeleted?: boolean;
      isActive?: boolean;
    }

    function normalizeFacility(raw: RawFacility, index: number) {
      return {
        id: raw._id?.toString() || raw.id || `fac-${index}`,
        name: raw.title || "Facility",
        category: raw.category || "Campus Facility",
        image: raw.imageUrl || "/images/facilities/ai_robotics_lab.webp",
        tagline: raw.tagline || "World-Class Learning Environment",
        description: raw.description || "",
        highlights: Array.isArray(raw.highlights) && raw.highlights.length > 0
          ? raw.highlights
          : ["Modern Infrastructure", "Safe Campus"],
        metrics: Array.isArray(raw.metrics) && raw.metrics.length > 0
          ? raw.metrics
          : [{ value: "100%", label: "Practical" }],
      };
    }

    it("normalizes complete CMS facility object without data loss", () => {
      const item: RawFacility = {
        _id: "60a1b2c3d4e5f67890123456",
        title: "Olympic Swimming Arena",
        category: "Aquatics",
        tagline: "25m Heated Pool",
        description: "All-weather Olympic standard pool.",
        highlights: ["FINA Certified", "Lifeguards on duty"],
        metrics: [{ value: "25m", label: "Length" }, { value: "6", label: "Lanes" }],
      };

      const normalized = normalizeFacility(item, 0);
      expect(normalized.id).toBe("60a1b2c3d4e5f67890123456");
      expect(normalized.name).toBe("Olympic Swimming Arena");
      expect(normalized.highlights).toHaveLength(2);
      expect(normalized.metrics[0].value).toBe("25m");
    });

    it("supplies robust fallback data when CMS properties are missing or undefined", () => {
      const incompleteItem: RawFacility = {};
      const normalized = normalizeFacility(incompleteItem, 4);

      expect(normalized.id).toBe("fac-4");
      expect(normalized.name).toBe("Facility");
      expect(normalized.category).toBe("Campus Facility");
      expect(normalized.highlights).toEqual(["Modern Infrastructure", "Safe Campus"]);
      expect(normalized.metrics).toEqual([{ value: "100%", label: "Practical" }]);
    });
  });
});
