import { z } from "zod";
import mongoose from "mongoose";
import { createRouter, publicQuery, adminMutation, adminQuery } from "./middleware";
import { getMainModels, createImmutableAuditLog } from "./models/cmsSchemas";

export const announcementRouter = createRouter({
  list: publicQuery.query(async () => {
    try {
      const { Marquee } = await getMainModels();
      const marquees = await Marquee.find({ isDeleted: { $ne: true }, isActive: true }).sort({ createdAt: -1 });
      return marquees.map((m: any, idx: number) => ({
        id: m._id?.toString() || idx + 1,
        title: m.text,
        link: m.linkUrl || "/admissions",
        active: m.isActive,
        priority: m.speed || 50,
      }));
    } catch {
      return [];
    }
  }),

  adminList: adminQuery.query(async () => {
    try {
      const { Marquee } = await getMainModels();
      const marquees = await Marquee.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
      return marquees.map((m: any, idx: number) => ({
        id: m._id?.toString() || idx + 1,
        title: m.text,
        link: m.linkUrl || "",
        active: m.isActive,
        priority: m.speed || 50,
      }));
    } catch {
      return [];
    }
  }),

  create: adminMutation
    .input(
      z.object({
        title: z.string().min(3).max(500),
        link: z.string().optional(),
        active: z.boolean().default(true),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Marquee } = await getMainModels();
      const doc = await Marquee.create({
        text: input.title,
        linkUrl: input.link,
        isActive: input.active,
        speed: input.priority,
      });
      await createImmutableAuditLog({
        action: "CREATE_MARQUEE",
        module: "Marquee",
        performedBy: ctx.user?.username || "Admin",
        documentId: doc._id.toString(),
        details: `Created announcement: ${doc.text}`,
      });
      return { success: true, id: doc._id.toString() };
    }),

  update: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        title: z.string().min(3).max(500),
        link: z.string().optional(),
        active: z.boolean().default(true),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const annId = String(id?._id || id);
      const { Marquee } = await getMainModels();
      const updated = await Marquee.findByIdAndUpdate(
        annId,
        {
          text: data.title,
          linkUrl: data.link,
          isActive: data.active,
          speed: data.priority,
        },
        { new: true }
      );
      await createImmutableAuditLog({
        action: "UPDATE_MARQUEE",
        module: "Marquee",
        performedBy: ctx.user?.username || "Admin",
        documentId: annId,
        details: `Updated announcement: ${updated?.text || annId}`,
      });
      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Marquee } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const annId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(annId)) {
        deleted = await Marquee.findByIdAndDelete(annId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Marquee.findOneAndDelete({
          $or: [{ _id: annId }, { id: annId }, { text: annId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_MARQUEE",
        module: "Marquee",
        performedBy: ctx.user?.username || "Admin",
        documentId: annId,
        details: `Deleted announcement: ${deleted?.text || annId}`,
      });
      return { success: true, deleted };
    }),
});