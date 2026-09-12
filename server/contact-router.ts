import { z } from "zod";
import mongoose from "mongoose";
import { createRouter, publicMutation, adminQuery, adminMutation } from "./middleware";
import { getMainModels, checkPersistentRateLimit, createImmutableAuditLog } from "./models/cmsSchemas";

export const contactRouter = createRouter({
  create: publicMutation
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email(),
        phone: z.string().max(20).optional(),
        subject: z.string().max(255).optional(),
        message: z.string().min(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const clientIp = ctx?.req?.headers?.get("x-forwarded-for") || ctx?.req?.headers?.get("cf-connecting-ip") || "global-client";
      const allowed = await checkPersistentRateLimit(`contact:${clientIp}`, 10, 60);
      if (!allowed) {
        return { success: false, error: "Too many submissions. Please wait a moment before sending another message." };
      }

      try {
        const { ContactMessage } = await getMainModels();
        const doc = await ContactMessage.create({
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone?.trim() || "",
          subject: input.subject?.trim() || "Website Contact Form Inquiry",
          message: input.message.trim(),
          isRead: false,
          isDeleted: false,
        });

        return { success: true, id: doc._id.toString() };
      } catch (err: any) {
        console.error("[Contact Form] Failed to save contact submission:", err?.message);
        return { success: false, error: "Failed to send your message. Please try again or call the school office directly." };
      }
    }),

  list: adminQuery.query(async () => {
    try {
      const { ContactMessage } = await getMainModels();
      const docs = await ContactMessage.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(200);
      return docs.map((doc: any) => ({
        id: doc._id.toString(),
        _id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone || "",
        subject: doc.subject || "",
        message: doc.message,
        isRead: doc.isRead,
        createdAt: doc.createdAt,
      }));
    } catch {
      return [];
    }
  }),

  markRead: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { ContactMessage } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const targetId = String(rawId);

      if (mongoose.Types.ObjectId.isValid(targetId)) {
        await ContactMessage.findByIdAndUpdate(targetId, { isRead: true });
      } else {
        await ContactMessage.findOneAndUpdate({ _id: targetId }, { isRead: true });
      }

      await createImmutableAuditLog({
        action: "MARK_CONTACT_READ",
        module: "Contact",
        performedBy: ctx.user?.username || "Admin",
        documentId: targetId,
        details: `Marked contact inquiry ${targetId} as read`,
      });

      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { ContactMessage } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const targetId = String(rawId);

      if (mongoose.Types.ObjectId.isValid(targetId)) {
        await ContactMessage.findByIdAndUpdate(targetId, { isDeleted: true });
      } else {
        await ContactMessage.findOneAndUpdate({ _id: targetId }, { isDeleted: true });
      }

      await createImmutableAuditLog({
        action: "DELETE_CONTACT_MESSAGE",
        module: "Contact",
        performedBy: ctx.user?.username || "Admin",
        documentId: targetId,
        details: `Soft-deleted contact inquiry ${targetId}`,
      });

      return { success: true };
    }),
});