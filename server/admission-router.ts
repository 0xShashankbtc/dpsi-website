import { z } from "zod";
import mongoose from "mongoose";
import { createRouter, publicQuery, publicMutation, adminQuery, adminMutation } from "./middleware";
import { getMainModels, checkPersistentRateLimit, createImmutableAuditLog } from "./models/cmsSchemas";

export const admissionRouter = createRouter({
  create: publicMutation
    .input(
      z.object({
        studentName: z.string().min(2).max(255),
        parentName: z.string().min(2).max(255),
        email: z.string().email(),
        phone: z.string().min(10).max(20),
        grade: z.string().min(1).max(50),
        dob: z.string().min(1).max(50),
        address: z.string().min(5),
        city: z.string().min(2).max(100),
        state: z.string().min(2).max(100),
        pincode: z.string().min(4).max(20),
        previousSchool: z.string().max(255).optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const clientIp = ctx?.req?.headers?.get("x-forwarded-for") || ctx?.req?.headers?.get("cf-connecting-ip") || "global-client";
      const allowed = await checkPersistentRateLimit(`admission:${clientIp}`, 10, 60);
      if (!allowed) {
        return { success: false, error: "Too many registration attempts. Please wait a moment before trying again." };
      }
      try {
        const { AdmissionInquiry } = await getMainModels();
        const doc = await AdmissionInquiry.create({
          studentName: input.studentName.trim(),
          parentName: input.parentName.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone.trim(),
          grade: input.grade.trim(),
          dob: input.dob.trim(),
          address: input.address.trim(),
          city: input.city.trim(),
          state: input.state.trim(),
          pincode: input.pincode.trim(),
          previousSchool: input.previousSchool?.trim() || "",
          message: input.message?.trim() || "",
          status: "pending",
          isDeleted: false,
        });
        return { success: true, id: doc._id.toString() };
      } catch (err: any) {
        console.error("[Admission] Failed to save admission application:", err?.message);
        return { success: false, error: "Failed to submit admission application. Please try again or contact the admissions desk." };
      }
    }),

  list: adminQuery.query(async () => {
    try {
      const { AdmissionInquiry } = await getMainModels();
      const docs = await AdmissionInquiry.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(200);
      return docs.map((doc: any) => ({
        id: doc._id.toString(),
        _id: doc._id.toString(),
        studentName: doc.studentName,
        parentName: doc.parentName,
        email: doc.email,
        phone: doc.phone,
        grade: doc.grade,
        dob: doc.dob,
        address: doc.address,
        city: doc.city,
        state: doc.state,
        pincode: doc.pincode,
        previousSchool: doc.previousSchool || "",
        message: doc.message || "",
        status: doc.status,
        createdAt: doc.createdAt,
      }));
    } catch {
      return [];
    }
  }),

  getById: adminQuery
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .query(async ({ input }) => {
      const { AdmissionInquiry } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const targetId = String(rawId);
      if (mongoose.Types.ObjectId.isValid(targetId)) {
        return AdmissionInquiry.findById(targetId);
      }
      return AdmissionInquiry.findOne({ _id: targetId });
    }),

  updateStatus: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        status: z.enum(["pending", "reviewing", "approved", "rejected"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { AdmissionInquiry } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const targetId = String(rawId);

      const updated = mongoose.Types.ObjectId.isValid(targetId)
        ? await AdmissionInquiry.findByIdAndUpdate(targetId, { status: input.status }, { new: true })
        : await AdmissionInquiry.findOneAndUpdate({ _id: targetId }, { status: input.status }, { new: true });

      await createImmutableAuditLog({
        action: "UPDATE_ADMISSION_STATUS",
        module: "Admissions",
        performedBy: ctx.user?.username || "Admin",
        documentId: targetId,
        details: `Updated admission inquiry status to ${input.status}`,
      });

      return { success: true, updated };
    }),

  delete: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { AdmissionInquiry } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const targetId = String(rawId);

      if (mongoose.Types.ObjectId.isValid(targetId)) {
        await AdmissionInquiry.findByIdAndUpdate(targetId, { isDeleted: true });
      } else {
        await AdmissionInquiry.findOneAndUpdate({ _id: targetId }, { isDeleted: true });
      }

      await createImmutableAuditLog({
        action: "DELETE_ADMISSION_INQUIRY",
        module: "Admissions",
        performedBy: ctx.user?.username || "Admin",
        documentId: targetId,
        details: `Soft-deleted admission inquiry ${targetId}`,
      });

      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    try {
      const { AdmissionInquiry } = await getMainModels();
      const [total, pending, approved] = await Promise.all([
        AdmissionInquiry.countDocuments({ isDeleted: false }),
        AdmissionInquiry.countDocuments({ isDeleted: false, status: "pending" }),
        AdmissionInquiry.countDocuments({ isDeleted: false, status: "approved" }),
      ]);
      return { total, pending, approved };
    } catch {
      return { total: 0, pending: 0, approved: 0 };
    }
  }),
});