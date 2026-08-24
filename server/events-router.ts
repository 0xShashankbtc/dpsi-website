import { z } from "zod";
import mongoose from "mongoose";
import { createRouter, publicQuery, adminMutation } from "./middleware";
import { getMainModels, createImmutableAuditLog } from "./models/cmsSchemas";

export const eventsRouter = createRouter({
  list: publicQuery.query(async () => {
    try {
      const { Activity } = await getMainModels();
      const acts = await Activity.find({ isDeleted: { $ne: true }, isPublished: true }).sort({ eventDate: -1 });
      return acts.map((a: any) => ({
        id: a._id.toString(),
        _id: a._id.toString(),
        title: a.title,
        description: a.description,
        image: a.imageUrl || "",
        imageUrl: a.imageUrl || "",
        eventDate: a.eventDate || new Date(),
        location: "DPSI Campus",
        category: a.category || "Events",
      }));
    } catch {
      return [];
    }
  }),

  all: publicQuery.query(async () => {
    try {
      const { Activity } = await getMainModels();
      const acts = await Activity.find({ isDeleted: { $ne: true }, isPublished: true }).sort({ eventDate: -1 });
      return acts.map((a: any) => ({
        id: a._id.toString(),
        _id: a._id.toString(),
        title: a.title,
        description: a.description,
        image: a.imageUrl || "",
        imageUrl: a.imageUrl || "",
        eventDate: a.eventDate || new Date(),
        location: "DPSI Campus",
        category: a.category || "Events",
      }));
    } catch {
      return [];
    }
  }),

  create: adminMutation
    .input(
      z.object({
        title: z.string().min(2).max(255),
        description: z.string().min(5),
        image: z.string().optional(),
        eventDate: z.string(),
        category: z.string().default("Events"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Activity } = await getMainModels();
      const doc = await Activity.create({
        title: input.title,
        description: input.description,
        imageUrl: input.image,
        eventDate: new Date(input.eventDate),
        category: input.category,
        isPublished: true,
      });
      await createImmutableAuditLog({
        action: "CREATE_ACTIVITY",
        module: "Events",
        performedBy: ctx.user?.username || "Admin",
        documentId: doc._id.toString(),
        details: `Created event: ${doc.title}`,
      });
      return { success: true, id: doc._id.toString() };
    }),

  update: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        title: z.string().min(2).max(255),
        description: z.string().min(5),
        image: z.string().optional(),
        eventDate: z.string(),
        category: z.string().default("Events"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const eventId = String(id?._id || id);
      const { Activity } = await getMainModels();
      const updated = await Activity.findByIdAndUpdate(
        eventId,
        {
          title: data.title,
          description: data.description,
          imageUrl: data.image,
          eventDate: new Date(data.eventDate),
          category: data.category,
        },
        { new: true }
      );
      await createImmutableAuditLog({
        action: "UPDATE_ACTIVITY",
        module: "Events",
        performedBy: ctx.user?.username || "Admin",
        documentId: eventId,
        details: `Updated event: ${updated?.title || eventId}`,
      });
      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Activity } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const eventId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(eventId)) {
        deleted = await Activity.findByIdAndDelete(eventId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Activity.findOneAndDelete({
          $or: [{ _id: eventId }, { id: eventId }, { title: eventId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_ACTIVITY",
        module: "Events",
        performedBy: ctx.user?.username || "Admin",
        documentId: eventId,
        details: `Deleted event: ${deleted?.title || eventId}`,
      });
      return { success: true, deleted };
    }),
});