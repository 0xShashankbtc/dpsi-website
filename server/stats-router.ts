import { z } from "zod";
import mongoose from "mongoose";
import { createRouter, publicQuery, adminMutation, adminQuery } from "./middleware";
import { getMainModels, createImmutableAuditLog } from "./models/cmsSchemas";

export const statsRouter = createRouter({
  list: publicQuery.query(async () => {
    try {
      const { QuickStat } = await getMainModels();
      const docs = await QuickStat.find({ isDeleted: { $ne: true }, isActive: true }).sort({ order: 1 });
      return docs.map((d: any) => ({
        id: d._id.toString(),
        _id: d._id.toString(),
        label: d.label,
        value: d.value,
        icon: d.icon || "GraduationCap",
        order: d.order,
        active: d.isActive,
      }));
    } catch {
      return [];
    }
  }),

  adminList: adminQuery.query(async () => {
    try {
      const { QuickStat } = await getMainModels();
      const docs = await QuickStat.find({ isDeleted: { $ne: true } }).sort({ order: 1 });
      return docs.map((d: any) => ({
        id: d._id.toString(),
        _id: d._id.toString(),
        label: d.label,
        value: d.value,
        icon: d.icon || "GraduationCap",
        order: d.order,
        active: d.isActive,
      }));
    } catch {
      return [];
    }
  }),

  create: adminMutation
    .input(
      z.object({
        label: z.string().min(2).max(255),
        value: z.string().min(1).max(100),
        icon: z.string().max(100).default("GraduationCap"),
        order: z.number().default(0),
        active: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { QuickStat } = await getMainModels();
      const doc = await QuickStat.create({
        label: input.label,
        value: input.value,
        icon: input.icon,
        order: input.order,
        isActive: input.active,
      });
      await createImmutableAuditLog({
        action: "CREATE_STAT",
        module: "Stats",
        performedBy: ctx.user?.username || "Admin",
        documentId: doc._id.toString(),
        details: `Created quick stat: ${doc.label} = ${doc.value}`,
      });
      return { success: true, id: doc._id.toString() };
    }),

  update: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        label: z.string().min(2).max(255),
        value: z.string().min(1).max(100),
        icon: z.string().max(100).optional(),
        order: z.number().default(0),
        active: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const statId = String(id?._id || id);
      const { QuickStat } = await getMainModels();
      const updated = await QuickStat.findByIdAndUpdate(
        statId,
        {
          label: data.label,
          value: data.value,
          ...(data.icon ? { icon: data.icon } : {}),
          order: data.order,
          isActive: data.active,
        },
        { new: true }
      );
      await createImmutableAuditLog({
        action: "UPDATE_STAT",
        module: "Stats",
        performedBy: ctx.user?.username || "Admin",
        documentId: statId,
        details: `Updated quick stat: ${updated?.label || statId}`,
      });
      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { QuickStat } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const statId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(statId)) {
        deleted = await QuickStat.findByIdAndDelete(statId).catch(() => null);
      }
      if (!deleted) {
        deleted = await QuickStat.findOneAndDelete({
          $or: [{ _id: statId }, { id: statId }, { label: statId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_STAT",
        module: "Stats",
        performedBy: ctx.user?.username || "Admin",
        documentId: statId,
        details: `Deleted quick stat: ${deleted?.label || statId}`,
      });
      return { success: true, deleted };
    }),
});