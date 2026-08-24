import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Database Models & Schema Integrity Test Suite", () => {
  describe("Multi-Database Connection URI Generation", () => {
    function constructUri(baseUri: string, dbName: string) {
      let uri = baseUri.trim();
      if (uri.includes("?")) {
        const [base, query] = uri.split("?");
        const cleanBase = base.replace(/\/+$/, "");
        return `${cleanBase}/${dbName}?${query}`;
      } else {
        return `${uri.replace(/\/+$/, "")}/${dbName}`;
      }
    }

    it("correctly injects database names into standard MongoDB Atlas URIs", () => {
      const atlasUri = "mongodb+srv://user:pass@cluster0.e4cvux4.mongodb.net/?appName=Cluster0";
      expect(constructUri(atlasUri, "dpsi_main")).toBe("mongodb+srv://user:pass@cluster0.e4cvux4.mongodb.net/dpsi_main?appName=Cluster0");
      expect(constructUri(atlasUri, "dpsi_gallery")).toBe("mongodb+srv://user:pass@cluster0.e4cvux4.mongodb.net/dpsi_gallery?appName=Cluster0");
      expect(constructUri(atlasUri, "dpsi_tc")).toBe("mongodb+srv://user:pass@cluster0.e4cvux4.mongodb.net/dpsi_tc?appName=Cluster0");
    });

    it("handles plain URIs without query parameters", () => {
      const plainUri = "mongodb://localhost:27017";
      expect(constructUri(plainUri, "dpsi_main")).toBe("mongodb://localhost:27017/dpsi_main");
    });
  });

  describe("Schema Property Validations", () => {
    const TcValidationSchema = z.object({
      admissionNumber: z.string().min(1),
      studentName: z.string().min(1),
      fatherName: z.string().min(1),
      motherName: z.string().optional().default(""),
      classLeaving: z.string().min(1),
      dateOfIssue: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
      status: z.enum(["Issued", "Pending", "Cancelled"]).default("Issued"),
    });

    it("accepts valid TC record entries", () => {
      const result = TcValidationSchema.safeParse({
        admissionNumber: "DPSI-1001",
        studentName: "Aditya Roy",
        fatherName: "Sunil Roy",
        classLeaving: "Class X",
        dateOfIssue: "2025-06-15",
        status: "Issued",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.motherName).toBe("");
      }
    });

    it("rejects invalid date format in TC records", () => {
      const result = TcValidationSchema.safeParse({
        admissionNumber: "DPSI-1001",
        studentName: "Aditya Roy",
        fatherName: "Sunil Roy",
        classLeaving: "Class X",
        dateOfIssue: "invalid-date",
        status: "Issued",
      });
      expect(result.success).toBe(false);
    });

    it("validates MUN Registration status transitions", () => {
      const MunStatusSchema = z.object({
        id: z.string(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        paymentStatus: z.enum(["unpaid", "paid"]).optional(),
      });

      expect(MunStatusSchema.safeParse({ id: "64b1f2e8c9", status: "approved" }).success).toBe(true);
      expect(MunStatusSchema.safeParse({ id: "64b1f2e8c9", paymentStatus: "paid" }).success).toBe(true);
      expect(MunStatusSchema.safeParse({ id: "64b1f2e8c9", status: "unknown" }).success).toBe(false);
    });
  });
});
