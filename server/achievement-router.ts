import { z } from "zod";
import mongoose from "mongoose";
import { createRouter, publicQuery, adminMutation } from "./middleware";
import { getMainModels, createImmutableAuditLog } from "./models/cmsSchemas";

export const achievementRouter = createRouter({
  list: publicQuery.query(async () => {
    try {
      const { Achievement } = await getMainModels();
      const docs = await Achievement.find({ isDeleted: { $ne: true } }).sort({ order: 1, createdAt: -1 });
      return docs.map((d: any) => ({
        id: d._id.toString(),
        _id: d._id.toString(),
        studentName: d.studentName,
        class: d.className,
        className: d.className,
        score: d.score,
        exam: d.exam,
        stream: d.stream || "",
        rank: d.rank || "",
        year: d.year,
        image: d.imageUrl || "",
        imageUrl: d.imageUrl || "",
        featured: d.featured,
        order: d.order,
        isActive: d.isActive,
      }));
    } catch {
      return [];
    }
  }),

  featured: publicQuery.query(async () => {
    try {
      const { Achievement } = await getMainModels();
      const docs = await Achievement.find({ isDeleted: { $ne: true }, isActive: true, featured: true }).sort({ order: 1 });
      return docs.map((d: any) => ({
        id: d._id.toString(),
        _id: d._id.toString(),
        studentName: d.studentName,
        class: d.className,
        className: d.className,
        score: d.score,
        exam: d.exam,
        stream: d.stream || "",
        rank: d.rank || "",
        year: d.year,
        image: d.imageUrl || "",
        imageUrl: d.imageUrl || "",
        featured: d.featured,
        order: d.order,
      }));
    } catch {
      return [];
    }
  }),

  create: adminMutation
    .input(
      z.object({
        studentName: z.string().min(2).max(255),
        className: z.string().min(1).max(50),
        score: z.string().min(1).max(50),
        exam: z.string().min(1).max(100),
        stream: z.string().optional(),
        rank: z.string().optional(),
        imageUrl: z.string().optional(),
        year: z.string().min(4).max(20).default("2025-26"),
        featured: z.boolean().default(true),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Achievement } = await getMainModels();
      const doc = await Achievement.create(input);
      await createImmutableAuditLog({
        action: "CREATE_ACHIEVEMENT",
        module: "Academics",
        performedBy: ctx.user?.username || "Admin",
        documentId: doc._id.toString(),
        details: `Created academic topper: ${doc.studentName} (${doc.score})`,
      });
      return { success: true, id: doc._id.toString() };
    }),

  update: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        studentName: z.string().min(2).max(255),
        className: z.string().min(1).max(50),
        score: z.string().min(1).max(50),
        exam: z.string().min(1).max(100),
        stream: z.string().optional(),
        rank: z.string().optional(),
        imageUrl: z.string().optional(),
        year: z.string().min(4).max(20).default("2025-26"),
        featured: z.boolean().default(true),
        order: z.number().default(0),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const achId = String(id?._id || id);
      const { Achievement } = await getMainModels();
      const updated = await Achievement.findByIdAndUpdate(achId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_ACHIEVEMENT",
        module: "Academics",
        performedBy: ctx.user?.username || "Admin",
        documentId: achId,
        details: `Updated academic topper: ${updated?.studentName || achId}`,
      });
      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Achievement } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const achId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(achId)) {
        deleted = await Achievement.findByIdAndDelete(achId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Achievement.findOneAndDelete({
          $or: [{ _id: achId }, { id: achId }, { studentName: achId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_ACHIEVEMENT",
        module: "Academics",
        performedBy: ctx.user?.username || "Admin",
        documentId: achId,
        details: `Deleted academic topper: ${deleted?.studentName || achId}`,
      });
      return { success: true, deleted };
    }),
});