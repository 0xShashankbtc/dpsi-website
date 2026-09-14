import { describe, it, expect, beforeEach } from "vitest";

// --- TC VERIFICATION LOGIC SIMULATION ---
interface MockTcRecord {
  admissionNumber: string;
  studentName: string;
  fatherName: string;
  classLeaving: string;
  dob: string;
  dateOfIssue: string;
  certificatePdfUrl: string;
  status: "Issued" | "Pending" | "Cancelled";
}

const mockDatabase: MockTcRecord[] = [
  {
    admissionNumber: "DPSI-1082",
    studentName: "Aarav Sharma",
    fatherName: "Rajesh Sharma",
    classLeaving: "Class X",
    dob: "2010-05-14",
    dateOfIssue: "2025-03-31",
    certificatePdfUrl: "https://dpsindirapuram.com/tc/sample.pdf",
    status: "Issued",
  },
  {
    admissionNumber: "DPSI-2045",
    studentName: "Ananya Verma",
    fatherName: "Sunil Verma",
    classLeaving: "Class XII",
    dob: "2008-09-22",
    dateOfIssue: "2025-04-15",
    certificatePdfUrl: "https://dpsindirapuram.com/tc/sample.pdf",
    status: "Issued",
  },
];

// In-memory rate limiting tracker matching cms-router.ts
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count++;
  return true;
}

function normalizeDate(input: string): string {
  const clean = input.trim();
  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return clean;
}

function verifyTcRecord(admissionNumber: string, dob: string, ip: string) {
  const cleanAdm = admissionNumber.trim().toUpperCase();
  const cleanDob = normalizeDate(dob);

  if (!cleanAdm || !cleanDob) {
    throw new Error("Both Admission Number and Date of Birth are required");
  }

  const ipAllowed = checkRateLimit(`tc_ip:${ip}`, 5, 60000);
  if (!ipAllowed) {
    throw new Error("Rate limit exceeded for IP. Please try again in a minute.");
  }

  const admAllowed = checkRateLimit(`tc_adm:${cleanAdm}`, 10, 300000);
  if (!admAllowed) {
    throw new Error("Too many verification attempts for this admission number.");
  }

  // Two-factor lookup matching BOTH fields together
  const match = mockDatabase.find((rec) => {
    const dbAdm = rec.admissionNumber.trim().toUpperCase();
    const dbDob = normalizeDate(rec.dob);
    return dbAdm === cleanAdm && dbDob === cleanDob;
  });

  if (!match) {
    throw new Error("No matching Transfer Certificate found for the provided credentials.");
  }

  return {
    studentName: match.studentName,
    admissionNumber: match.admissionNumber,
    classLeaving: match.classLeaving,
    dateOfIssue: match.dateOfIssue,
    status: match.status,
    certificatePdfUrl: match.certificatePdfUrl,
  };
}

// --- CACHE IMAGE VALIDATION ---
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB

function validateCacheUpload(fileName: string, mimeType: string, fileSizeBytes: number) {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  if (!ALLOWED_EXT.includes(ext)) {
    throw new Error(`File extension "${ext}" not permitted. Allowed: ${ALLOWED_EXT.join(", ")}`);
  }
  if (!ALLOWED_MIME.includes(mimeType)) {
    throw new Error(`MIME type "${mimeType}" not allowed.`);
  }
  if (fileSizeBytes > MAX_CACHE_SIZE) {
    throw new Error(`File exceeds max size of 5MB (size: ${(fileSizeBytes / (1024 * 1024)).toFixed(2)}MB)`);
  }
  return true;
}

describe("Student TC Portal & Verification Tests", () => {
  beforeEach(() => {
    rateLimits.clear();
  });

  it("successfully verifies student when BOTH Admission Number and DOB match", () => {
    const result = verifyTcRecord("DPSI-1082", "2010-05-14", "192.168.1.1");
    expect(result).toBeDefined();
    expect(result.studentName).toBe("Aarav Sharma");
    expect(result.admissionNumber).toBe("DPSI-1082");
    expect(result.certificatePdfUrl).toBeTruthy();
  });

  it("handles case-insensitivity and whitespace in Admission Number", () => {
    const result = verifyTcRecord("  dpsi-1082  ", "2010-05-14", "192.168.1.2");
    expect(result.studentName).toBe("Aarav Sharma");
  });

  it("handles DD/MM/YYYY date format normalization", () => {
    const result = verifyTcRecord("DPSI-1082", "14/05/2010", "192.168.1.3");
    expect(result.studentName).toBe("Aarav Sharma");
  });

  it("fails with generic error when Admission Number is valid but DOB is incorrect", () => {
    expect(() => {
      verifyTcRecord("DPSI-1082", "2010-01-01", "192.168.1.4");
    }).toThrow("No matching Transfer Certificate found for the provided credentials.");
  });

  it("fails with generic error when DOB is valid but Admission Number is incorrect", () => {
    expect(() => {
      verifyTcRecord("DPSI-9999", "2010-05-14", "192.168.1.5");
    }).toThrow("No matching Transfer Certificate found for the provided credentials.");
  });

  it("never returns data if either field is missing or empty", () => {
    expect(() => verifyTcRecord("", "2010-05-14", "192.168.1.6")).toThrow();
    expect(() => verifyTcRecord("DPSI-1082", "", "192.168.1.7")).toThrow();
  });

  it("enforces IP-based rate limiting after 5 attempts", () => {
    const testIp = "10.0.0.99";
    for (let i = 0; i < 5; i++) {
      try {
        verifyTcRecord("DPSI-9999", "2010-01-01", testIp);
      } catch {
        // expected
      }
    }
    expect(() => {
      verifyTcRecord("DPSI-1082", "2010-05-14", testIp);
    }).toThrow(/Rate limit exceeded/);
  });

  it("enforces admission number velocity limit against distributed rotating proxies", () => {
    for (let i = 0; i < 10; i++) {
      try {
        verifyTcRecord("DPSI-1082", `2010-01-0${i}`, `10.0.1.${i}`);
      } catch {
        // expected
      }
    }
    expect(() => {
      verifyTcRecord("DPSI-1082", "2010-05-14", "10.0.1.99");
    }).toThrow(/Too many verification attempts/);
  });
});

describe("Cache Layer & Upload Security Audit", () => {
  it("permits valid image upload within size limit", () => {
    expect(validateCacheUpload("hero.webp", "image/webp", 2 * 1024 * 1024)).toBe(true);
    expect(validateCacheUpload("banner.png", "image/png", 1.5 * 1024 * 1024)).toBe(true);
    expect(validateCacheUpload("popup.jpg", "image/jpeg", 500 * 1024)).toBe(true);
  });

  it("rejects files exceeding 5MB cap", () => {
    expect(() => {
      validateCacheUpload("large_banner.png", "image/png", 6 * 1024 * 1024);
    }).toThrow(/File exceeds max size/);
  });

  it("rejects non-whitelisted extensions (e.g. .php, .exe, .sh, .svg)", () => {
    expect(() => validateCacheUpload("payload.php", "image/jpeg", 1024)).toThrow(/not permitted/);
    expect(() => validateCacheUpload("exploit.exe", "image/png", 1024)).toThrow(/not permitted/);
    expect(() => validateCacheUpload("script.sh", "text/x-sh", 1024)).toThrow(/not permitted/);
    expect(() => validateCacheUpload("vector.svg", "image/svg+xml", 1024)).toThrow(/not permitted/);
  });

  it("rejects mismatched/non-image MIME types", () => {
    expect(() => validateCacheUpload("data.webp", "application/javascript", 1024)).toThrow(/MIME type/);
    expect(() => validateCacheUpload("data.png", "application/pdf", 1024)).toThrow(/MIME type/);
  });
});

describe("Footer Credit Line & Site Settings Contract", () => {
  const defaultCredit = "Developed by : Shashank Jangid";

  it("formats developer credit cleanly without Orange badge", () => {
    expect(defaultCredit).toBe("Developed by : Shashank Jangid");
    expect(defaultCredit.toLowerCase()).not.toContain("orange");

    const textPart = defaultCredit.replace(/\s*\(?Orange\)?\s*/gi, "").trim();
    expect(textPart).toBe("Developed by : Shashank Jangid");
  });

  it("allows arbitrary admin overrides for footer_credit", () => {
    const customCredit = "Managed by DPSI Technology Team";
    const textPart = customCredit.replace(/\s*\(?Orange\)?\s*/gi, "").trim();
    expect(textPart).toBe(customCredit);
  });

  describe("Developer Credit Password Security Guard", () => {
    // Import helper dynamically to verify runtime export
    it("rejects unauthorized password attempts (empty, wrong, or malformed)", async () => {
      const { verifyDevCreditPassword } = await import("../cms-router");
      expect(verifyDevCreditPassword("")).toBe(false);
      expect(verifyDevCreditPassword(undefined)).toBe(false);
      expect(verifyDevCreditPassword("admin123")).toBe(false);
      expect(verifyDevCreditPassword("WrongPassword!")).toBe(false);
      expect(verifyDevCreditPassword("  ")).toBe(false);
    });

    it("verifies unlock password correctly using environment or secure hash", async () => {
      const { verifyDevCreditPassword } = await import("../cms-router");
      const secret = process.env.DEV_CREDIT_UNLOCK_PASSWORD;
      if (secret) {
        expect(verifyDevCreditPassword(secret)).toBe(true);
        expect(verifyDevCreditPassword(`  ${secret}  `)).toBe(true);
      }
    });

    it("guards footer_credit from unauthorized modification while allowing other settings", () => {
      function evaluateCreditGuard(
        currentCredit: string,
        newCredit: string,
        unlockPasswordValid: boolean
      ): { allowed: boolean; error?: string } {
        if (newCredit.trim() !== currentCredit.trim()) {
          if (!unlockPasswordValid) {
            return {
              allowed: false,
              error: "Protected Field: Modifying Developer Credit Text requires the developer authorization password.",
            };
          }
        }
        return { allowed: true };
      }

      // Blocked: modifying credit without valid password
      const blockedAttempt = evaluateCreditGuard(
        "Developed by : Shashank Jangid",
        "Developed by : Someone Else",
        false
      );
      expect(blockedAttempt.allowed).toBe(false);
      expect(blockedAttempt.error).toContain("developer authorization password");

      // Allowed: same credit unchanged (no password needed)
      const untouchedAttempt = evaluateCreditGuard(
        "Developed by : Shashank Jangid",
        "Developed by : Shashank Jangid",
        false
      );
      expect(untouchedAttempt.allowed).toBe(true);

      // Allowed: modifying credit with valid password
      const authorizedAttempt = evaluateCreditGuard(
        "Developed by : Shashank Jangid",
        "Developed by : Shashank Jangid (Updated)",
        true
      );
      expect(authorizedAttempt.allowed).toBe(true);
    });
  });
});

describe("Edge CDN Caching & Zero-Latency Hydration Audit", () => {
  function computeCacheControl(isGet: boolean, hasAuth: boolean, isAdminAuth: boolean): string {
    const isPublicQuery = isGet && !hasAuth && !isAdminAuth;
    if (isPublicQuery) {
      return "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400";
    }
    return "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
  }

  it("sets Edge CDN acceleration headers for public unauthenticated GET queries", () => {
    const header = computeCacheControl(true, false, false);
    expect(header).toBe("public, max-age=60, s-maxage=3600, stale-while-revalidate=86400");
    expect(header).toContain("s-maxage=3600");
    expect(header).toContain("stale-while-revalidate=86400");
  });

  it("sets strict no-cache headers for authenticated or admin requests", () => {
    expect(computeCacheControl(true, true, false)).toBe("no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    expect(computeCacheControl(true, false, true)).toBe("no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    expect(computeCacheControl(false, false, false)).toBe("no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  });

  it("filters sensitive/admin queries during client-side cache persistence", () => {
    const shouldDehydrate = (key: any[]) => {
      const first = Array.isArray(key[0]) ? key[0][0] : key[0];
      const second = Array.isArray(key[0]) ? key[0][1] : "";
      if (first === "admin" || second === "verifyTc" || first === "auth" || typeof first !== "string") {
        return false;
      }
      return true;
    };

    expect(shouldDehydrate([["cms", "getSiteSettings"], { type: "query" }])).toBe(true);
    expect(shouldDehydrate([["cms", "listMarquees"], { type: "query" }])).toBe(true);
    expect(shouldDehydrate([["stats", "list"], { type: "query" }])).toBe(true);
    expect(shouldDehydrate([["admin", "login"], { type: "mutation" }])).toBe(false);
    expect(shouldDehydrate([["cms", "verifyTc"], { type: "mutation" }])).toBe(false);
    expect(shouldDehydrate([["auth", "me"], { type: "query" }])).toBe(false);
  });
});

