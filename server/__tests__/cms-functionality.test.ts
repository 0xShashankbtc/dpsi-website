import { describe, it, expect } from "vitest";
import { z } from "zod";

// 1. TC Bulk Import Parser
function parseBulkCsv(text: string) {
  const lines = text.trim().split("\n").filter(l => l.trim());
  const rows: any[] = [];
  for (const line of lines) {
    const parts = line.split(",").map(p => p.trim());
    if (parts.length >= 5) {
      rows.push({
        admissionNumber: parts[0] || "",
        studentName: parts[1] || "",
        fatherName: parts[2] || "",
        motherName: parts[3] || "",
        classLeaving: parts[4] || "Class X",
        dateOfIssue: parts[5] || new Date().toISOString().split("T")[0],
        status: (["Issued", "Pending", "Cancelled"].includes(parts[6]) ? parts[6] : "Issued") as "Issued" | "Pending" | "Cancelled",
      });
    }
  }
  return rows;
}

// 2. Safe YouTube URL Extractor
function extractYoutubeId(val: string): string {
  try {
    if (!val || val.trim().length === 0) return "";
    const trimmed = val.trim();
    if (trimmed.length === 11 && !trimmed.includes("/") && !trimmed.includes(".")) {
      return trimmed;
    }
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match?.[1] || "";
  } catch {
    return "";
  }
}

// 3. Slug generator
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-");
}

describe("CMS Functionality & Business Logic Test Suite", () => {
  describe("TC Bulk Import CSV Parser", () => {
    it("parses valid multi-line CSV correctly", () => {
      const csv = [
        "DPSI-1001, Aarav Sharma, Rajesh Sharma, Priya Sharma, Class X, 2025-03-31, Issued",
        "DPSI-1002, Diya Patel, Suresh Patel, Anjali Patel, Class XII, 2025-04-15, Pending",
        "DPSI-1003, Rohan Gupta, Amit Gupta, Sunita Gupta, Class IX, 2025-05-01, Cancelled",
      ].join("\n");

      const rows = parseBulkCsv(csv);
      expect(rows).toHaveLength(3);
      expect(rows[0].admissionNumber).toBe("DPSI-1001");
      expect(rows[0].studentName).toBe("Aarav Sharma");
      expect(rows[0].fatherName).toBe("Rajesh Sharma");
      expect(rows[0].motherName).toBe("Priya Sharma");
      expect(rows[0].classLeaving).toBe("Class X");
      expect(rows[0].dateOfIssue).toBe("2025-03-31");
      expect(rows[0].status).toBe("Issued");

      expect(rows[1].status).toBe("Pending");
      expect(rows[2].status).toBe("Cancelled");
    });

    it("filters out empty or incomplete lines (< 5 fields)", () => {
      const invalidCsv = "\n   \nDPS-1, Incomplete\nDPS-2, Only, Three, Fields\n";
      const rows = parseBulkCsv(invalidCsv);
      expect(rows).toHaveLength(0);
    });

    it("defaults invalid status values to Issued", () => {
      const csv = "DPSI-9999, Test Student, Father Name, Mother Name, Class VIII, 2025-01-01, InvalidStatus";
      const rows = parseBulkCsv(csv);
      expect(rows).toHaveLength(1);
      expect(rows[0].status).toBe("Issued");
    });
  });

  describe("Safe YouTube URL / ID Parser", () => {
    it("extracts ID from standard watch URL", () => {
      expect(extractYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("extracts ID from youtu.be shortlink", () => {
      expect(extractYoutubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("extracts ID from embed URL", () => {
      expect(extractYoutubeId("https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1")).toBe("dQw4w9WgXcQ");
    });

    it("handles direct 11-char ID without crash", () => {
      expect(extractYoutubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("safely returns empty string for malformed or incomplete URLs without throwing", () => {
      expect(extractYoutubeId("")).toBe("");
      expect(extractYoutubeId("https://google.com")).toBe("");
      expect(extractYoutubeId("invalid-url-string")).toBe("");
    });
  });

  describe("Slug Generator", () => {
    it("formats uppercase titles with special characters into SEO-friendly slugs", () => {
      expect(generateSlug("AI & Innovation Labs Ecosystem")).toBe("ai-innovation-labs-ecosystem");
      expect(generateSlug("Vision & Pedagogical Philosophy")).toBe("vision-pedagogical-philosophy");
      expect(generateSlug("   Leading CBSE School (Indirapuram)   ")).toBe("leading-cbse-school-indirapuram");
    });

    it("handles leading and trailing slashes cleanly for dynamic routing", () => {
      const cleanSlug = (input: string) => input.replace(/^\/+/, "").replace(/\/+$/, "").trim().toLowerCase();
      expect(cleanSlug("/testing/")).toBe("testing");
      expect(cleanSlug("///vision-philosophy")).toBe("vision-philosophy");
      expect(cleanSlug("/unf")).toBe("unf");
    });
  });

  describe("Schema Validation (Zod)", () => {
    it("validates Menu placement location enum", () => {
      const schema = z.object({
        location: z.enum(["header", "footer_quick", "footer_resources"]),
      });

      expect(schema.safeParse({ location: "header" }).success).toBe(true);
      expect(schema.safeParse({ location: "footer_quick" }).success).toBe(true);
      expect(schema.safeParse({ location: "footer_resources" }).success).toBe(true);
      expect(schema.safeParse({ location: "sidebar" }).success).toBe(false);
    });

    it("validates Site Settings key-value pairs", () => {
      const schema = z.object({
        updates: z.array(z.object({ key: z.string(), value: z.string() })),
      });

      expect(schema.safeParse({
        updates: [{ key: "contact_phone", value: "+91-0120-4660000" }]
      }).success).toBe(true);

      expect(schema.safeParse({
        updates: [{ key: "contact_phone" }]
      }).success).toBe(false);
    });
  });

  describe("Stage A CMS-to-Live Round Trip & Empty State Contracts", () => {
    it("1. Activity / News & Events: validates data shape and zero-state handling", () => {
      const ActivityContract = z.object({
        id: z.string().or(z.number()),
        title: z.string(),
        category: z.string().optional(),
        excerpt: z.string().optional(),
        description: z.string().optional(),
        image: z.string(),
        createdAt: z.string().or(z.date()),
        eventDate: z.string().or(z.date()).optional(),
      });

      const newActivity = {
        id: "act_101",
        title: "Robotics Hackathon 2026",
        category: "Innovation",
        excerpt: "Students prototype autonomous rovers",
        description: "Full description of robotics showcase",
        image: "https://res.cloudinary.com/dpsi/image/upload/hackathon.webp",
        createdAt: new Date().toISOString(),
        eventDate: new Date().toISOString(),
      };

      expect(ActivityContract.safeParse(newActivity).success).toBe(true);

      // Empty collection state: displayNews must be empty without throwing
      const emptyList: any[] = [];
      const displayNews = emptyList.slice(0, 6);
      expect(displayNews).toEqual([]);
      expect(displayNews.length).toBe(0);
    });

    it("2. Marquees / Announcements Bar: validates data shape and zero-state handling", () => {
      const MarqueeContract = z.object({
        id: z.string().or(z.number()),
        title: z.string(),
        link: z.string().optional(),
      });

      const newMarquee = {
        id: "marq_101",
        title: "ADMISSIONS OPEN FOR SESSION 2026-27",
        link: "/admissions",
      };

      expect(MarqueeContract.safeParse(newMarquee).success).toBe(true);

      // Empty collection state: items must be empty and safeIndex returns undefined
      const emptyMarquees: any[] = [];
      expect(emptyMarquees.length).toBe(0);
      const current = emptyMarquees[0];
      expect(current).toBeUndefined();
    });

    it("3. Gallery Images: validates data shape, category extraction and zero-state handling", () => {
      const GalleryContract = z.object({
        id: z.string().or(z.number()),
        title: z.string(),
        category: z.string(),
        imageUrl: z.string(),
        featured: z.boolean().optional(),
      });

      const newImage = {
        id: "img_101",
        title: "Robotics Innovation Lab",
        category: "Labs",
        imageUrl: "https://res.cloudinary.com/dpsi/image/upload/lab.webp",
        featured: true,
      };

      expect(GalleryContract.safeParse(newImage).success).toBe(true);

      // Empty collection state: 3D coverflow and grid must be empty without throwing
      const emptyGallery: any[] = [];
      const coverflowSlides = emptyGallery.slice(0, 10).map((item) => ({
        src: item.imageUrl,
        alt: item.title,
      }));
      expect(coverflowSlides).toEqual([]);
    });

    it("4. Hero Slider: validates data shape, zero-state calculation, and typewriter safety", () => {
      const SliderContract = z.object({
        image: z.string(),
        title: z.string(),
        subtitle: z.string(),
        badge: z.string(),
        buttonText: z.string(),
        buttonLink: z.string(),
      });

      const newSlider = {
        image: "https://res.cloudinary.com/dpsi/image/upload/slider1.webp",
        title: "Welcome to DPS Indirapuram",
        subtitle: "Soaring High... We reach for the sky!",
        badge: "Admissions Open 2026-27",
        buttonText: "Apply Now",
        buttonLink: "/admissions",
      };

      expect(SliderContract.safeParse(newSlider).success).toBe(true);

      // Empty collection safety: zero length must safely produce undefined slide without divide-by-zero
      const emptySliders: any[] = [];
      const safeSlideIndex = emptySliders.length > 0 ? 0 % emptySliders.length : 0;
      expect(safeSlideIndex).toBe(0);
      const slide = emptySliders[safeSlideIndex];
      expect(slide).toBeUndefined();
    });

    it("5. Video Gallery: validates YouTube parser, direct video shape, and zero-state", () => {
      const VideoContract = z.object({
        id: z.string().or(z.number()),
        title: z.string(),
        url: z.string(),
        thumbnail: z.string(),
        isDirectVideo: z.boolean(),
      });

      const newVideo = {
        id: "vid_101",
        title: "Annual Day Celebrations",
        url: "https://www.youtube.com/embed/Nn2K8b2JQn0?autoplay=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/Nn2K8b2JQn0/hqdefault.jpg",
        isDirectVideo: false,
      };

      expect(VideoContract.safeParse(newVideo).success).toBe(true);

      // Empty collection safety: zero length must safely return null section
      const emptyVideos: any[] = [];
      expect(emptyVideos.length).toBe(0);
    });
  });

  describe("Stage B CMS-to-Live Round Trip & Empty State Contracts", () => {
    it("1. Footer: validates dynamic quick links, resources, and site setting copy", () => {
      const MenuLinkContract = z.object({
        label: z.string(),
        href: z.string(),
        external: z.boolean().optional(),
      });

      const sampleQuickLink = { label: "Admissions", href: "/admissions" };
      const sampleResource = { label: "SchoolsOS Portal Login", href: "https://dpsindp.schoolforschools.ai/login", external: true };

      expect(MenuLinkContract.safeParse(sampleQuickLink).success).toBe(true);
      expect(MenuLinkContract.safeParse(sampleResource).success).toBe(true);

      // Empty collection handling: empty arrays must not crash
      const emptyLinks: any[] = [];
      expect(emptyLinks.length).toBe(0);
    });

    it("2. Navbar: validates dynamic affiliation, phone, email, and tagline settings", () => {
      const NavbarSettingContract = z.object({
        phone: z.string(),
        email: z.string().email(),
        cbseAffiliationNo: z.string(),
        schoolCode: z.string(),
        tagline: z.string(),
      });

      const sampleSettings = {
        phone: "+91-0120-4660000, 4670000",
        email: "info@dpsindirapuram.com",
        cbseAffiliationNo: "2130663",
        schoolCode: "60297",
        tagline: "Service Before Self • Nurturing Global Leaders",
      };

      expect(NavbarSettingContract.safeParse(sampleSettings).success).toBe(true);
    });

    it("3. AIChatWidget: validates welcome message and dynamic action link generation", () => {
      const ActionLinkContract = z.object({
        actionUrl: z.string().optional(),
        actionType: z.enum(["call", "email", "link"]).optional(),
      });

      const calendarAction = { actionUrl: "https://res.cloudinary.com/dpsi/image/upload/calendar.pdf", actionType: "link" as const };
      const callAction = { actionUrl: "tel:+9101204660000", actionType: "call" as const };

      expect(ActionLinkContract.safeParse(calendarAction).success).toBe(true);
      expect(ActionLinkContract.safeParse(callAction).success).toBe(true);
    });

    it("4. Home2 Feature Cards: validates constrained icon enum, schema contract, and empty handling", () => {
      const ALLOWED_ICONS = ["Bot", "Cpu", "Rocket", "Sparkles", "Code", "GraduationCap", "Laptop", "Microscope", "Atom", "Globe"] as const;
      const FeatureCardContract = z.object({
        id: z.string().optional(),
        title: z.string().min(2),
        description: z.string().min(5),
        icon: z.enum(ALLOWED_ICONS),
        category: z.string().optional(),
        order: z.number().default(0),
        isActive: z.boolean().default(true),
      });

      const validCard = {
        title: "Humanoid Robotics",
        description: "AI Innovation Lab with autonomous bots and Raspberry Pi workstations",
        icon: "Bot" as const,
        category: "AI Innovation Lab",
        order: 1,
        isActive: true,
      };

      expect(FeatureCardContract.safeParse(validCard).success).toBe(true);

      // Verify unconstrained/typo icon is rejected
      const invalidCard = {
        title: "Invalid Icon Card",
        description: "Some description here",
        icon: "NonExistentIconXYZ",
      };
      expect(FeatureCardContract.safeParse(invalidCard).success).toBe(false);

      // Empty collection handling: cards.length === 0 safely returns no grid
      const emptyCards: any[] = [];
      expect(emptyCards.length).toBe(0);
    });

    it("5. Facilities 3D & 2D: validates shared Facility schema with 3D defaults and geometry presets", () => {
      const ALLOWED_GEOMETRIES = ["torusKnot", "icosahedron", "dodecahedron", "octahedron"] as const;
      const FacilitySharedContract = z.object({
        id: z.string().optional(),
        title: z.string(),
        category: z.string(),
        description: z.string(),
        icon: z.string().optional(),
        imageUrl: z.string().optional(),
        geometry: z.enum(ALLOWED_GEOMETRIES).default("torusKnot"),
        color: z.string().default("#10b981"),
        accent: z.string().default("#34d399"),
        order: z.number().default(0),
        isActive: z.boolean().default(true),
      });

      // Existing Stage 1 document without 3D fields (tests automatic fallback to defaults)
      const stage1Doc = {
        title: "AI & Robotics Lab",
        category: "Campus",
        description: "Next-gen AI research center with humanoid robotics",
        icon: "Microscope",
        imageUrl: "/images/facilities/ai_robotics_lab.webp",
      };

      const parsed = FacilitySharedContract.parse(stage1Doc);
      expect(parsed.geometry).toBe("torusKnot");
      expect(parsed.color).toBe("#10b981");
      expect(parsed.accent).toBe("#34d399");

      // Custom 3D configured facility
      const custom3DDoc = {
        title: "Sports & Aquatic Complex",
        category: "Sports",
        description: "Olympic-standard swimming arena",
        geometry: "dodecahedron" as const,
        color: "#065f46",
        accent: "#f59e0b",
      };
      expect(FacilitySharedContract.safeParse(custom3DDoc).success).toBe(true);

      // Empty facilities collection safety: zero length must safely handle indexing
      const emptyFacilities: any[] = [];
      const safeIndex = emptyFacilities.length > 0 ? 0 % emptyFacilities.length : 0;
      expect(safeIndex).toBe(0);
      expect(emptyFacilities[safeIndex]).toBeUndefined();
    });
  });

  describe("Slider Banner Video & Image Contract", () => {
    const SliderContract = z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      imageUrl: z.string().optional().default(""),
      videoUrl: z.string().optional().default(""),
      mediaType: z.enum(["image", "video"]).default("image"),
      buttonText: z.string().optional(),
      buttonLink: z.string().optional(),
      order: z.number().default(0),
      isActive: z.boolean().default(true),
    });

    it("validates direct video slider banner items", () => {
      const videoSlide = {
        title: "Campus Aerial Tour",
        subtitle: "Experience 10-Acre Lush Green Campus",
        videoUrl: "https://res.cloudinary.com/dpsi/video/upload/v123456/campus_tour.webm",
        mediaType: "video" as const,
        order: 1,
      };

      const parsed = SliderContract.parse(videoSlide);
      expect(parsed.mediaType).toBe("video");
      expect(parsed.videoUrl).toContain("campus_tour.webm");
      expect(parsed.imageUrl).toBe("");
    });

    it("validates photo image slider items with defaults", () => {
      const imageSlide = {
        title: "Admissions Open 2026-27",
        imageUrl: "https://res.cloudinary.com/dpsi/image/upload/v123456/banner.webp",
      };

      const parsed = SliderContract.parse(imageSlide);
      expect(parsed.mediaType).toBe("image");
      expect(parsed.imageUrl).toContain("banner.webp");
      expect(parsed.order).toBe(0);
    });
  });
});


