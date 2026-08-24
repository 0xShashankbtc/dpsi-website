import { z } from "zod";
import mongoose from "mongoose";
import { createRouter, publicQuery, adminMutation } from "./middleware";
import { getMainModels, createImmutableAuditLog } from "./models/cmsSchemas";

export const testimonialRouter = createRouter({
  list: publicQuery.query(async () => {
    try {
      const { Testimonial } = await getMainModels();
      const docs = await Testimonial.find({ isDeleted: { $ne: true } }).sort({ order: 1, createdAt: -1 });
      return docs.map((d: any) => ({
        id: d._id.toString(),
        _id: d._id.toString(),
        name: d.name,
        role: d.role,
        content: d.content,
        avatar: d.avatarUrl || "",
        avatarUrl: d.avatarUrl || "",
        rating: d.rating || 5,
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
      const { Testimonial } = await getMainModels();
      const docs = await Testimonial.find({ isDeleted: { $ne: true }, isActive: true, featured: true }).sort({ order: 1 });
      return docs.map((d: any) => ({
        id: d._id.toString(),
        _id: d._id.toString(),
        name: d.name,
        role: d.role,
        content: d.content,
        avatar: d.avatarUrl || "",
        avatarUrl: d.avatarUrl || "",
        rating: d.rating || 5,
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
        name: z.string().min(2).max(255),
        role: z.string().min(2).max(255),
        content: z.string().min(5),
        avatarUrl: z.string().optional(),
        rating: z.number().min(1).max(5).default(5),
        featured: z.boolean().default(true),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Testimonial } = await getMainModels();
      const doc = await Testimonial.create(input);
      await createImmutableAuditLog({
        action: "CREATE_TESTIMONIAL",
        module: "Testimonials",
        performedBy: ctx.user?.username || "Admin",
        documentId: doc._id.toString(),
        details: `Created testimonial: ${doc.name} (${doc.role})`,
      });
      return { success: true, id: doc._id.toString() };
    }),

  update: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        name: z.string().min(2).max(255),
        role: z.string().min(2).max(255),
        content: z.string().min(5),
        avatarUrl: z.string().optional(),
        rating: z.number().min(1).max(5).default(5),
        featured: z.boolean().default(true),
        order: z.number().default(0),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const testId = String(id?._id || id);
      const { Testimonial } = await getMainModels();
      const updated = await Testimonial.findByIdAndUpdate(testId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_TESTIMONIAL",
        module: "Testimonials",
        performedBy: ctx.user?.username || "Admin",
        documentId: testId,
        details: `Updated testimonial: ${updated?.name || testId}`,
      });
      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Testimonial } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const testId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(testId)) {
        deleted = await Testimonial.findByIdAndDelete(testId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Testimonial.findOneAndDelete({
          $or: [{ _id: testId }, { id: testId }, { name: testId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_TESTIMONIAL",
        module: "Testimonials",
        performedBy: ctx.user?.username || "Admin",
        documentId: testId,
        details: `Deleted testimonial: ${deleted?.name || testId}`,
      });
      return { success: true, deleted };
    }),
});