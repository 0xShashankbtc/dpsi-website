import { z } from "zod";
import mongoose from "mongoose";
import { TRPCError } from "@trpc/server";
import { createRouter, publicMutation, adminQuery, adminMutation } from "./middleware";
import { getMainModels, checkPersistentRateLimit, createImmutableAuditLog } from "./models/cmsSchemas";
import { getClientIp } from "./context";

export const contactRouter = createRouter({
  create: publicMutation
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email(),
        phone: z.string().max(20).optional(),
        subject: z.string().max(255).optional(),
        message: z.string().min(5).max(3000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const clientIp = getClientIp(ctx?.req);
      const allowed = await checkPersistentRateLimit(`contact:${clientIp}`, 10, 60);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many submissions. Please wait a moment before sending another message.",
        });
      }

      try {
        const { ContactMessage, SiteSettings } = await getMainModels();
        const doc = await ContactMessage.create({
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone?.trim() || "",
          subject: input.subject?.trim() || "Website Contact Form Inquiry",
          message: input.message.trim(),
          isRead: false,
          isDeleted: false,
        });

        // Forward to Web3Forms so administration receives email notifications at it@dpsindirapuram.com
        let web3formsResult: { delivered: boolean; message?: string } = { delivered: false };
        try {
          const settings = await SiteSettings.find({
            key: { $in: ["contact_notification_email", "web3forms_access_key", "web3forms_enabled"] },
          }).lean();

          const getVal = (k: string, fallback: string) => {
            const found = settings.find((s: any) => s.key === k);
            return found?.value?.trim() || fallback;
          };

          const notificationEmail = getVal("contact_notification_email", "it@dpsindirapuram.com");
          const accessKey = getVal("web3forms_access_key", "") || (process.env.WEB3FORMS_ACCESS_KEY || "").trim();
          const isEnabled = getVal("web3forms_enabled", "true") !== "false";

          if (isEnabled && accessKey) {
            const payload = {
              access_key: accessKey,
              name: input.name.trim(),
              email: input.email.trim().toLowerCase(),
              phone: input.phone?.trim() || "Not provided",
              subject: input.subject?.trim() || `New Contact Inquiry: ${input.name.trim()} - DPS Indirapuram`,
              message: input.message.trim(),
              from_name: "DPS Indirapuram Contact Portal",
              replyto: input.email.trim().toLowerCase(),
              to_email: notificationEmail,
              recipient: notificationEmail,
            };

            const response = await fetch("https://api.web3forms.com/submit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(payload),
            });

            const data = (await response.json()) as any;
            if (data.success) {
              web3formsResult = { delivered: true, message: "Delivered via Web3Forms" };
            } else {
              web3formsResult = { delivered: false, message: data.message || "Web3Forms non-success response" };
              console.warn("[Web3Forms] Forwarding returned:", data);
            }
          } else if (!accessKey) {
            web3formsResult = { delivered: false, message: "Web3Forms key not configured yet" };
          }
        } catch (w3err: any) {
          console.error("[Web3Forms] Error forwarding contact submission:", w3err?.message);
          web3formsResult = { delivered: false, message: w3err?.message };
        }

        return { success: true, id: doc._id.toString(), web3forms: web3formsResult };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        console.error("[Contact Form] Failed to save contact submission:", err?.message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send your message. Please try again or call the school office directly.",
        });
      }
    }),

  testWeb3Forms: adminMutation
    .input(
      z.object({
        accessKey: z.string().optional(),
        notificationEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { SiteSettings } = await getMainModels();
      const settings = await SiteSettings.find({
        key: { $in: ["contact_notification_email", "web3forms_access_key"] },
      }).lean();

      const getVal = (k: string, fallback: string) => {
        const found = settings.find((s: any) => s.key === k);
        return found?.value?.trim() || fallback;
      };

      const notificationEmail = input.notificationEmail?.trim() || getVal("contact_notification_email", "it@dpsindirapuram.com");
      const accessKey = input.accessKey?.trim() || getVal("web3forms_access_key", "") || (process.env.WEB3FORMS_ACCESS_KEY || "").trim();

      if (!accessKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Web3Forms Access Key configured. Please enter an access key first.",
        });
      }

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: accessKey,
            name: "DPS Indirapuram Admin Test",
            email: "admin@dpsindirapuram.com",
            phone: "+91-0120-4660000",
            subject: "🧪 Web3Forms Connectivity Test — DPS Indirapuram",
            message: `This is a test notification dispatched from the DPS Indirapuram Admin Panel.\nConfigured Recipient: ${notificationEmail}\nTimestamp: ${new Date().toISOString()}\nExecuted By: ${ctx.user?.username || "Admin"}`,
            from_name: "DPS Indirapuram Admin Portal",
            to_email: notificationEmail,
            recipient: notificationEmail,
          }),
        });

        const data = (await response.json()) as any;
        if (!data.success) {
          return {
            success: false,
            message: data.message || "Web3Forms rejected the request. Please verify your access key.",
          };
        }

        await createImmutableAuditLog({
          action: "TEST_WEB3FORMS_SUBMISSION",
          module: "Contact",
          performedBy: ctx.user?.username || "Admin",
          details: `Dispatched Web3Forms test email to ${notificationEmail}`,
        });

        return {
          success: true,
          message: `Test email successfully dispatched to ${notificationEmail} via Web3Forms!`,
        };
      } catch (err: any) {
        console.error("[Web3Forms] Test delivery failed:", err?.message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to connect to Web3Forms: ${err?.message}`,
        });
      }
    }),

  list: adminQuery.query(async () => {
    try {
      const { ContactMessage } = await getMainModels();
      const docs = await ContactMessage.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(200).lean();
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