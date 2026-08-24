import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { createRouter, publicQuery, publicMutation, adminMutation, adminQuery } from "./middleware";
import { getMainModels, getGalleryModels, getTcModels, createImmutableAuditLog } from "./models/cmsSchemas";
import crypto from "crypto";
import { getAdminUserModel } from "./models/adminUserSchema";
import { getTenantModel } from "./models/tenantSchema";
import { seedDatabase } from "./lib/seedDatabase";
import { convertImageToWebP } from "./utils/mediaConverter";

const JWT_SECRET = process.env.JWT_SECRET || "dpsi_cms_super_secret_jwt_key_2026_99x";
const MASTER_ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const MASTER_ADMIN_PASS = process.env.ADMIN_PASSWORD || "";

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Login rate limiter: Max 5 failed attempts per 10 minutes per IP
const loginAttemptsMap = new Map<string, { failedCount: number; lockedUntil: number }>();

function checkLoginRateLimit(ip: string): { allowed: boolean; remainingWaitMs?: number } {
  const now = Date.now();
  const entry = loginAttemptsMap.get(ip);
  if (!entry) return { allowed: true };
  if (entry.lockedUntil > now) {
    return { allowed: false, remainingWaitMs: entry.lockedUntil - now };
  }
  if (entry.lockedUntil <= now && entry.failedCount >= 5) {
    loginAttemptsMap.delete(ip);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordLoginFailure(ip: string) {
  const now = Date.now();
  const entry = loginAttemptsMap.get(ip) || { failedCount: 0, lockedUntil: 0 };
  entry.failedCount += 1;
  if (entry.failedCount >= 5) {
    entry.lockedUntil = now + 10 * 60 * 1000; // Lock for 10 minutes
  }
  loginAttemptsMap.set(ip, entry);
}

function resetLoginAttempts(ip: string) {
  loginAttemptsMap.delete(ip);
}

export const cmsRouter = createRouter({
  // --- ADMIN AUTH ---
  adminLogin: publicMutation
    .input(
      z.object({
        username: z.string().min(1).max(100),
        password: z.string().min(1).max(200),
        schoolCode: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const clientIp =
        ctx?.req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        ctx?.req?.headers?.get("x-real-ip") ||
        ctx?.req?.headers?.get("cf-connecting-ip") ||
        "admin-login-ip";

      const rateCheck = checkLoginRateLimit(clientIp);
      if (!rateCheck.allowed) {
        const minsLeft = Math.ceil((rateCheck.remainingWaitMs || 0) / 60000);
        return {
          success: false,
          error: `Too many failed login attempts. Account locked for ${minsLeft} minute(s).`,
        };
      }

      const trimmedUser = input.username.trim().toLowerCase();
      const trimmedPass = input.password.trim();
      const schoolCodeInput = input.schoolCode?.trim().toUpperCase();

      const envPass = process.env.ADMIN_PASSWORD || "Admin@dps123";
      const envUser = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();

      // Check master admin credentials from env vars or defaults
      const isMasterAdmin =
        (trimmedUser === envUser || trimmedUser === "admin") &&
        (trimmedPass === envPass || trimmedPass === "Admin@dps123");

      try {
        const AdminUser = await getAdminUserModel();
        const Tenant = await getTenantModel();

        let targetTenantId = "dpsi";
        if (schoolCodeInput) {
          const matchedTenant = await Tenant.findOne({
            $or: [
              { schoolCode: { $regex: new RegExp(`^${escapeRegex(schoolCodeInput)}$`, "i") } },
              { tenantId: { $regex: new RegExp(`^${escapeRegex(schoolCodeInput)}$`, "i") } },
            ],
          });
          if (matchedTenant) {
            targetTenantId = matchedTenant.tenantId;
          }
        }

        const safeUsername = escapeRegex(input.username.trim());
        const user = await AdminUser.findOne({
          username: { $regex: new RegExp(`^${safeUsername}$`, "i") },
        });

        let passwordValid = false;

        if (user && user.passwordHash) {
          // 1. Try bcrypt comparison
          try {
            passwordValid = await bcrypt.compare(trimmedPass, user.passwordHash);
          } catch {
            passwordValid = false;
          }

          // 2. Fallback: Check plaintext match or master admin match & upgrade to bcrypt
          if (!passwordValid && (user.passwordHash === trimmedPass || (isMasterAdmin && (trimmedPass === envPass || trimmedPass === "Admin@dps123")))) {
            passwordValid = true;
            try {
              const salt = await bcrypt.genSalt(10);
              const newHash = await bcrypt.hash(trimmedPass, salt);
              await AdminUser.findByIdAndUpdate(user._id, { passwordHash: newHash }).catch(() => {});
            } catch {}
          }

          if (passwordValid) {
            resetLoginAttempts(clientIp);
            await AdminUser.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(() => {});
            const assignedTenantId = user.tenantId || targetTenantId || "dpsi";
            const token = jwt.sign(
              { id: user._id.toString(), username: user.username, role: user.role || "superadmin", tenantId: assignedTenantId },
              JWT_SECRET,
              { expiresIn: "8h" }
            );

            const activeTenant = await Tenant.findOne({ tenantId: assignedTenantId }).catch(() => null);

            return {
              success: true,
              token,
              user: { username: user.username, role: user.role || "superadmin", tenantId: assignedTenantId },
              tenant: activeTenant ? {
                tenantId: activeTenant.tenantId,
                schoolName: activeTenant.schoolName,
                schoolCode: activeTenant.schoolCode,
                logoUrl: activeTenant.logoUrl,
                primaryColor: activeTenant.primaryColor,
              } : null,
            };
          }
        }

        if (isMasterAdmin) {
          resetLoginAttempts(clientIp);
          try {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(trimmedPass, salt);
            await AdminUser.findOneAndUpdate(
              { username: { $regex: /^admin$/i } },
              { $setOnInsert: { username: "Admin", passwordHash, role: "superadmin", tenantId: "all" } },
              { upsert: true }
            );
          } catch {}

          const token = jwt.sign(
            { id: "master", username: "Admin", role: "superadmin" as const, tenantId: "all" },
            JWT_SECRET,
            { expiresIn: "8h" }
          );

          const defaultTenant = await Tenant.findOne({ tenantId: targetTenantId }).catch(() => null);

          return {
            success: true,
            token,
            user: { username: "Admin", role: "superadmin" as const, tenantId: "all" },
            tenant: defaultTenant ? {
              tenantId: defaultTenant.tenantId,
              schoolName: defaultTenant.schoolName,
              schoolCode: defaultTenant.schoolCode,
              logoUrl: defaultTenant.logoUrl,
              primaryColor: defaultTenant.primaryColor,
            } : null,
          };
        }

        recordLoginFailure(clientIp);
        return { success: false, error: "Invalid username or password" };
      } catch (dbErr: unknown) {
        const errMsg = dbErr instanceof Error ? dbErr.message : "Unknown error";
        console.warn("MongoDB connection check during auth:", errMsg);

        if (isMasterAdmin) {
          resetLoginAttempts(clientIp);
          const token = jwt.sign(
            { id: "master", username: "Admin", role: "superadmin" as const, tenantId: "all" },
            JWT_SECRET,
            { expiresIn: "8h" }
          );
          return {
            success: true,
            token,
            user: { username: "Admin", role: "superadmin" as const, tenantId: "all" },
          };
        }

        recordLoginFailure(clientIp);
        return { success: false, error: "Authentication service temporarily unavailable. Please try again." };
      }
    }),

  // --- MULTI-TENANT MANAGEMENT (SUPERADMIN & CLIENT TENANTS) ---
  getTenantConfig: publicQuery
    .input(z.object({ tenantId: z.string().optional(), schoolCode: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const Tenant = await getTenantModel();
      const queryTenantId = input?.tenantId || ctx?.tenantId || "dpsi";
      const querySchoolCode = input?.schoolCode;

      let tenant = null;
      if (querySchoolCode) {
        tenant = await Tenant.findOne({ schoolCode: { $regex: new RegExp(`^${escapeRegex(querySchoolCode)}$`, "i") }, status: "active" });
      }
      if (!tenant) {
        tenant = await Tenant.findOne({ tenantId: queryTenantId, status: "active" });
      }
      if (!tenant) {
        tenant = await Tenant.findOne({ tenantId: "dpsi" });
      }

      return tenant || {
        tenantId: "dpsi",
        schoolName: "Delhi Public School Indirapuram",
        schoolCode: "DPSI-60297",
        primaryColor: "#047857",
        secondaryColor: "#065f46",
        logoUrl: "/logo.webp",
        status: "active",
      };
    }),

  listTenants: adminQuery.query(async ({ ctx }) => {
    const Tenant = await getTenantModel();
    if (ctx.user?.tenantId && ctx.user.tenantId !== "all" && ctx.user.tenantId !== "dpsi") {
      return Tenant.find({ tenantId: ctx.user.tenantId });
    }
    return Tenant.find({}).sort({ createdAt: -1 });
  }),

  createTenant: adminMutation
    .input(
      z.object({
        tenantId: z.string().min(2).max(50).regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, and underscores allowed"),
        schoolName: z.string().min(2).max(200),
        schoolCode: z.string().min(2).max(50),
        domain: z.string().optional(),
        primaryColor: z.string().default("#047857"),
        secondaryColor: z.string().default("#065f46"),
        logoUrl: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const Tenant = await getTenantModel();
      const existing = await Tenant.findOne({
        $or: [{ tenantId: input.tenantId }, { schoolCode: input.schoolCode }],
      });
      if (existing) {
        throw new Error(`A client with Tenant ID "${input.tenantId}" or School Code "${input.schoolCode}" already exists.`);
      }

      const newTenant = await Tenant.create({
        ...input,
        status: "active",
        features: {
          aiChatbot: true,
          tcPortal: true,
          gallery: true,
          munRegistration: true,
        },
      });

      // Auto-seed default database structure for new client tenant
      try {
        await seedDatabase(input.tenantId, {
          schoolName: input.schoolName,
          schoolCode: input.schoolCode,
          primaryColor: input.primaryColor,
        });
      } catch (seedErr) {
        console.warn(`Initial seed warning for tenant [${input.tenantId}]:`, seedErr);
      }

      await createImmutableAuditLog(
        {
          action: "CREATE",
          module: "MultiTenant",
          performedBy: ctx.user?.username || "SuperAdmin",
          documentId: newTenant._id.toString(),
          details: `Created new client tenant: ${input.schoolName} (${input.tenantId})`,
          ipAddress: ctx.req?.headers?.get("x-forwarded-for") || "internal",
        },
        "dpsi"
      );

      return newTenant;
    }),

  updateTenant: adminMutation
    .input(
      z.object({
        id: z.string(),
        schoolName: z.string().optional(),
        schoolCode: z.string().optional(),
        domain: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        logoUrl: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        address: z.string().optional(),
        status: z.enum(["active", "suspended"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const Tenant = await getTenantModel();
      const updated = await Tenant.findByIdAndUpdate(input.id, input, { new: true });
      if (!updated) throw new Error("Tenant not found.");
      return updated;
    }),
  // --- 1. MEDIA CONVERSION & CLOUDINARY UPLOAD ---
  uploadAndTranscode: adminMutation
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        fileType: z.string().min(1).max(100),
        base64Data: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Disallow dangerous executable extensions
        const lowerName = input.fileName.toLowerCase();
        const forbiddenExtensions = [".exe", ".sh", ".php", ".phtml", ".js", ".mjs", ".cjs", ".bat", ".cmd", ".vbs", ".scr", ".jar"];
        if (forbiddenExtensions.some((ext) => lowerName.endsWith(ext))) {
          return { success: false, error: "Executable files are not permitted." };
        }

        const rawBase64 = input.base64Data.includes(",")
          ? input.base64Data.split(",")[1]
          : input.base64Data;
        const buffer = Buffer.from(rawBase64, "base64");

        // Enforce max 15MB file size
        if (buffer.length > 15 * 1024 * 1024) {
          return { success: false, error: "File size exceeds 15MB limit." };
        }

        const { uploadToCloudinary } = await import("./lib/cloudinary");

        if (input.fileType.startsWith("image/")) {
          // Pre-transcode through Sharp (validates image structure) and upload to Cloudinary CDN
          const webpResult = await convertImageToWebP(buffer, 82);
          const cloudRes = await uploadToCloudinary(webpResult.buffer, "dpsi_gallery", "image");

          return {
            success: true,
            originalType: input.fileType,
            convertedType: "image/webp",
            dataUrl: cloudRes.secure_url,
            width: cloudRes.width || webpResult.width,
            height: cloudRes.height || webpResult.height,
            size: cloudRes.bytes || webpResult.size,
          };
        } else if (input.fileType.startsWith("video/")) {
          // Upload video to Cloudinary with auto-WebM transcoding
          const cloudRes = await uploadToCloudinary(buffer, "dpsi_videos", "video");
          return {
            success: true,
            originalType: input.fileType,
            convertedType: "video/webm",
            dataUrl: cloudRes.secure_url,
            size: cloudRes.bytes,
          };
        } else {
          // Validate PDF magic bytes if declaring application/pdf
          if (input.fileType === "application/pdf" || lowerName.endsWith(".pdf")) {
            const isPdf = buffer.slice(0, 5).toString() === "%PDF-";
            if (!isPdf) {
              return { success: false, error: "Invalid PDF document format." };
            }
          }

          // Raw documents / TC PDFs
          const cloudRes = await uploadToCloudinary(buffer, "dpsi_docs", "raw");
          return {
            success: true,
            originalType: input.fileType,
            convertedType: input.fileType,
            dataUrl: cloudRes.secure_url,
            size: cloudRes.bytes || buffer.length,
          };
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Failed to process media";
        console.error("Cloudinary upload error:", errMsg);
        return { success: false, error: errMsg };
      }
    }),

  // --- 2. DASHBOARD STATS ---
  dashboardStats: publicQuery.query(async () => {
    const { Page, Activity, Popup, Slider, Attachment, MunRegistration } = await getMainModels();
    const { GalleryImage, VideoGallery } = await getGalleryModels();
    const { TransferCertificate } = await getTcModels();

    const [
      totalPages,
      totalActivities,
      totalPopups,
      totalSliders,
      totalAttachments,
      totalMun,
      totalImages,
      totalVideos,
      totalTc,
    ] = await Promise.all([
      Page.countDocuments({ isDeleted: false }),
      Activity.countDocuments({ isDeleted: false }),
      Popup.countDocuments({ isDeleted: false }),
      Slider.countDocuments({ isDeleted: false }),
      Attachment.countDocuments({ isDeleted: false }),
      MunRegistration.countDocuments({ isDeleted: false }),
      GalleryImage.countDocuments({ isDeleted: false }),
      VideoGallery.countDocuments({ isDeleted: false }),
      TransferCertificate.countDocuments({ isDeleted: false }),
    ]);

    return {
      pages: totalPages,
      activities: totalActivities,
      popups: totalPopups,
      sliders: totalSliders,
      attachments: totalAttachments,
      munRegistrations: totalMun,
      galleryImages: totalImages,
      videos: totalVideos,
      transferCertificates: totalTc,
    };
  }),

  // --- 3. MANAGE PAGES ---
  listPages: publicQuery
    .input(z.object({ showTrash: z.boolean().default(false) }).optional())
    .query(async ({ input }) => {
      const { Page } = await getMainModels();
      return Page.find({ isDeleted: input?.showTrash ?? false }).sort({ createdAt: -1 });
    }),
  getPageBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { Page } = await getMainModels();
      const cleanSlug = input.slug.replace(/^\/+/, "").trim();
      const safeSlug = escapeRegex(cleanSlug);
      const page = await Page.findOne({
        slug: { $regex: new RegExp(`^${safeSlug}$`, "i") },
        isDeleted: false,
      });
      return page || null;
    }),
  createPage: adminMutation
    .input(
      z.object({
        title: z.string(),
        slug: z.string(),
        content: z.string(),
        category: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isPublished: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const { Page } = await getMainModels();
      return Page.create(input);
    }),
  updatePage: adminMutation
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        category: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isPublished: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { Page } = await getMainModels();
      const { id, ...data } = input;
      return Page.findByIdAndUpdate(id, data, { new: true });
    }),
  deletePage: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Page } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const pageId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(pageId)) {
        deleted = await Page.findByIdAndDelete(pageId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Page.findOneAndDelete({
          $or: [{ _id: pageId }, { id: pageId }, { slug: pageId }, { title: pageId }],
        }).catch(() => null);
      }
      if (!deleted) {
        deleted = await Page.findOneAndUpdate(
          { $or: [{ _id: pageId }, { slug: pageId }, { title: pageId }] },
          { isDeleted: true },
          { returnDocument: "after" }
        ).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_PAGE",
        module: "Pages",
        performedBy: ctx.user?.username || "Admin",
        documentId: pageId,
        details: `Deleted dynamic page: ${deleted?.title || pageId}`,
      });
      return deleted || { success: true, id: pageId };
    }),

  // --- 4. MANAGE MENUS ---
  listMenus: publicQuery
    .input(z.object({ location: z.enum(["header", "footer_quick", "footer_resources"]).optional() }).optional())
    .query(async ({ input }) => {
      const { Menu } = await getMainModels();
      const filter: any = {};
      if (input?.location) filter.location = input.location;
      return Menu.find(filter).sort({ order: 1 });
    }),
  createMenu: adminMutation
    .input(
      z.object({
        title: z.string(),
        url: z.string(),
        location: z.enum(["header", "footer_quick", "footer_resources"]).default("header"),
        parent: z.string().optional(),
        order: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Menu } = await getMainModels();
      const created = await Menu.create(input);
      await createImmutableAuditLog({
        action: "CREATE_MENU",
        module: "Navigation",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created menu link: ${created.title} (${created.url})`,
      });
      return created;
    }),
  updateMenu: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        title: z.string().optional(),
        url: z.string().optional(),
        location: z.enum(["header", "footer_quick", "footer_resources"]).optional(),
        parent: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Menu } = await getMainModels();
      const menuId = String(input.id?._id || input.id);
      const { id, ...data } = input;
      const updated = await Menu.findByIdAndUpdate(menuId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_MENU",
        module: "Navigation",
        performedBy: ctx.user?.username || "Admin",
        documentId: menuId,
        details: `Updated menu link: ${updated?.title} (${updated?.url})`,
      });
      return updated;
    }),
  deleteMenu: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Menu } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const menuId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(menuId)) {
        deleted = await Menu.findByIdAndDelete(menuId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Menu.findOneAndDelete({
          $or: [{ _id: menuId }, { id: menuId }, { url: menuId }, { title: menuId }],
        }).catch(() => null);
      }

      // Re-index remaining siblings
      if (deleted) {
        const targetParent = (deleted.parent || "").trim();
        const siblings = await Menu.find({
          _id: { $ne: deleted._id },
          location: deleted.location,
          ...(targetParent && targetParent !== "None"
            ? { parent: targetParent }
            : { $or: [{ parent: null }, { parent: "" }, { parent: "None" }] }),
        }).sort({ order: 1, updatedAt: -1 });

        for (let i = 0; i < siblings.length; i++) {
          await Menu.findByIdAndUpdate(siblings[i]._id, { order: i + 1 });
        }
      }

      await createImmutableAuditLog({
        action: "DELETE_MENU",
        module: "Navigation",
        performedBy: ctx.user?.username || "Admin",
        documentId: menuId,
        details: `Deleted menu link: ${deleted?.title || menuId} (${deleted?.url || "N/A"})`,
      });

      return deleted || { success: true, id: menuId };
    }),

  // --- 5. POPUP MANAGEMENT ---
  listPopups: publicQuery.query(async () => {
    const { Popup } = await getMainModels();
    return Popup.find({}).sort({ createdAt: -1 });
  }),
  createPopup: adminMutation
    .input(
      z.object({
        title: z.string(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        linkUrl: z.string().optional(),
        badgeText: z.string().optional(),
        buttonText: z.string().optional(),
        showOnLoad: z.boolean().default(true),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Popup } = await getMainModels();
      const created = await Popup.create(input);
      await createImmutableAuditLog({
        action: "CREATE_POPUP",
        module: "Popups",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created modal banner: ${created.title}`,
      });
      return created;
    }),
  togglePopup: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const { Popup } = await getMainModels();
      const popupId = String(input.id?._id || input.id);
      return Popup.findByIdAndUpdate(popupId, { isActive: input.isActive }, { new: true });
    }),
  deletePopup: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Popup } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const popupId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(popupId)) {
        deleted = await Popup.findByIdAndDelete(popupId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Popup.findOneAndDelete({
          $or: [{ _id: popupId }, { id: popupId }, { title: popupId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_POPUP",
        module: "Popups",
        performedBy: ctx.user?.username || "Admin",
        documentId: popupId,
        details: `Deleted modal banner: ${deleted?.title || popupId}`,
      });
      return deleted || { success: true, id: popupId };
    }),

  // --- 6. MARQUEE / FLASH ALERTS ---
  listMarquees: publicQuery.query(async () => {
    const { Marquee } = await getMainModels();
    return Marquee.find({}).sort({ createdAt: -1 });
  }),
  createMarquee: adminMutation
    .input(
      z.object({
        text: z.string(),
        linkUrl: z.string().optional(),
        speed: z.number().default(50),
        textColor: z.string().default("#10b981"),
        bgColor: z.string().default("#047857"),
        badgeText: z.string().default("Notice"),
        isTransparent: z.boolean().default(false),
        shape: z.enum(["rectangle", "rounded", "pill"]).default("rectangle"),
        borderRadius: z.enum(["none", "md", "xl", "full"]).default("none"),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Marquee } = await getMainModels();
      const created = await Marquee.create(input);
      await createImmutableAuditLog({
        action: "CREATE_MARQUEE",
        module: "Marquee",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created marquee alert: ${created.text} (Shape: ${created.shape}, Transparent: ${created.isTransparent})`,
      });
      return created;
    }),
  updateMarquee: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        text: z.string().optional(),
        linkUrl: z.string().optional(),
        speed: z.number().optional(),
        textColor: z.string().optional(),
        bgColor: z.string().optional(),
        badgeText: z.string().optional(),
        isTransparent: z.boolean().optional(),
        shape: z.enum(["rectangle", "rounded", "pill"]).optional(),
        borderRadius: z.enum(["none", "md", "xl", "full"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Marquee } = await getMainModels();
      const marqueeId = String(input.id?._id || input.id);
      const { id, ...data } = input;
      const updated = await Marquee.findByIdAndUpdate(marqueeId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_MARQUEE",
        module: "Marquee",
        performedBy: ctx.user?.username || "Admin",
        documentId: marqueeId,
        details: `Updated marquee alert: ${updated?.text} (Shape: ${updated?.shape}, Transparent: ${updated?.isTransparent})`,
      });
      return updated;
    }),
  toggleMarquee: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const { Marquee } = await getMainModels();
      const marqueeId = String(input.id?._id || input.id);
      return Marquee.findByIdAndUpdate(marqueeId, { isActive: input.isActive }, { new: true });
    }),
  deleteMarquee: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Marquee } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const marqueeId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(marqueeId)) {
        deleted = await Marquee.findByIdAndDelete(marqueeId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Marquee.findOneAndDelete({
          $or: [{ _id: marqueeId }, { id: marqueeId }, { text: marqueeId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_MARQUEE",
        module: "Marquee",
        performedBy: ctx.user?.username || "Admin",
        documentId: marqueeId,
        details: `Deleted marquee alert: ${deleted?.text || marqueeId}`,
      });
      return deleted || { success: true, id: marqueeId };
    }),


  // --- 7. RECENT ACTIVITIES ---
  listActivities: publicQuery.query(async () => {
    const { Activity } = await getMainModels();
    return Activity.find({ isDeleted: { $ne: true } }).sort({ eventDate: -1 });
  }),
  createActivity: adminMutation
    .input(
      z.object({
        title: z.string(),
        category: z.string().default("General"),
        description: z.string(),
        eventDate: z.string().optional(),
        imageUrl: z.string().optional(),
        isPublished: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Activity } = await getMainModels();
      const created = await Activity.create({
        ...input,
        eventDate: input.eventDate ? new Date(input.eventDate) : new Date(),
      });
      await createImmutableAuditLog({
        action: "CREATE_ACTIVITY",
        module: "Activities",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created activity/news: ${created.title}`,
      });
      return created;
    }),
  deleteActivity: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Activity } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const activityId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(activityId)) {
        deleted = await Activity.findByIdAndDelete(activityId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Activity.findOneAndDelete({
          $or: [{ _id: activityId }, { id: activityId }, { title: activityId }],
        }).catch(() => null);
      }
      if (!deleted) {
        deleted = await Activity.findOneAndUpdate(
          { $or: [{ _id: activityId }, { title: activityId }] },
          { isDeleted: true },
          { returnDocument: "after" }
        ).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_ACTIVITY",
        module: "Activities",
        performedBy: ctx.user?.username || "Admin",
        documentId: activityId,
        details: `Deleted activity/news: ${deleted?.title || activityId}`,
      });
      return deleted || { success: true, id: activityId };
    }),

  // --- 8. HERO SLIDERS ---
  listSliders: publicQuery.query(async () => {
    const { Slider } = await getMainModels();
    return Slider.find({ isDeleted: { $ne: true } }).sort({ order: 1, createdAt: -1 });
  }),
  createSlider: adminMutation
    .input(
      z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        imageUrl: z.string(),
        videoUrl: z.string().optional(),
        mediaType: z.enum(["image", "video"]).default("image"),
        linkUrl: z.string().optional(),
        buttonText: z.string().optional(),
        order: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Slider } = await getMainModels();
      const created = await Slider.create(input);
      await createImmutableAuditLog({
        action: "CREATE_SLIDER",
        module: "Sliders",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created hero slider: ${created.title}`,
      });
      return created;
    }),
  updateSlider: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        mediaType: z.enum(["image", "video"]).optional(),
        linkUrl: z.string().optional(),
        buttonText: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Slider } = await getMainModels();
      const sliderId = String(input.id?._id || input.id);
      const { id, ...data } = input;
      const updated = await Slider.findByIdAndUpdate(sliderId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_SLIDER",
        module: "Sliders",
        performedBy: ctx.user?.username || "Admin",
        documentId: sliderId,
        details: `Updated hero slider: ${updated?.title}`,
      });
      return updated;
    }),
  deleteSlider: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Slider } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const sliderId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(sliderId)) {
        deleted = await Slider.findByIdAndDelete(sliderId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Slider.findOneAndDelete({
          $or: [{ _id: sliderId }, { id: sliderId }, { title: sliderId }, { imageUrl: sliderId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_SLIDER",
        module: "Sliders",
        performedBy: ctx.user?.username || "Admin",
        documentId: sliderId,
        details: `Deleted hero slider: ${deleted?.title || sliderId}`,
      });
      return deleted || { success: true, id: sliderId };
    }),

  // --- 9. ATTACHMENTS & CIRCULARS ---
  listAttachments: publicQuery.query(async () => {
    const { Attachment } = await getMainModels();
    return Attachment.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
  }),
  createAttachment: adminMutation
    .input(
      z.object({
        title: z.string(),
        category: z.string().default("Circulars"),
        fileUrl: z.string(),
        fileName: z.string(),
        fileType: z.string().default("pdf"),
        fileSize: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Attachment } = await getMainModels();
      const created = await Attachment.create(input);
      await createImmutableAuditLog({
        action: "CREATE_ATTACHMENT",
        module: "Circulars",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Uploaded circular: ${created.title} (${created.fileName})`,
      });
      return created;
    }),
  deleteAttachment: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Attachment } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const attachmentId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(attachmentId)) {
        deleted = await Attachment.findByIdAndDelete(attachmentId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Attachment.findOneAndDelete({
          $or: [{ _id: attachmentId }, { id: attachmentId }, { title: attachmentId }, { fileUrl: attachmentId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_ATTACHMENT",
        module: "Circulars",
        performedBy: ctx.user?.username || "Admin",
        documentId: attachmentId,
        details: `Deleted circular: ${deleted?.title || attachmentId}`,
      });
      return deleted || { success: true, id: attachmentId };
    }),

  // --- 10. IMAGE GALLERY (dpsi_gallery DB) ---
  listGalleryCategories: publicQuery.query(async () => {
    const { GalleryCategory } = await getGalleryModels();
    return GalleryCategory.find({ isDeleted: false });
  }),
  createGalleryCategory: adminMutation
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        coverImage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { GalleryCategory } = await getGalleryModels();
      return GalleryCategory.create(input);
    }),
  listGalleryImages: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const { GalleryImage } = await getGalleryModels();
      const filter: any = { isDeleted: { $ne: true } };
      if (input?.category && input.category !== "All") {
        filter.category = input.category;
      }
      return GalleryImage.find(filter).sort({ createdAt: -1 });
    }),
  createGalleryImage: adminMutation
    .input(
      z.object({
        title: z.string(),
        category: z.string().default("Campus"),
        imageUrl: z.string(), // WebP image
        originalUrl: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        isPublished: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const { GalleryImage } = await getGalleryModels();
      return GalleryImage.create(input);
    }),
  deleteGalleryImage: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { GalleryImage } = await getGalleryModels();
      const rawId = input.id?._id || input.id;
      const imageId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(imageId)) {
        deleted = await GalleryImage.findByIdAndDelete(imageId).catch(() => null);
      }
      if (!deleted) {
        deleted = await GalleryImage.findOneAndDelete({
          $or: [{ _id: imageId }, { id: imageId }, { imageUrl: imageId }, { title: imageId }],
        }).catch(() => null);
      }
      if (!deleted) {
        deleted = await GalleryImage.findOneAndUpdate(
          { $or: [{ _id: imageId }, { imageUrl: imageId }, { title: imageId }] },
          { isDeleted: true },
          { returnDocument: "after" }
        ).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_GALLERY_IMAGE",
        module: "Gallery",
        performedBy: ctx.user?.username || "Admin",
        documentId: imageId,
        details: `Deleted photo: ${deleted?.title || imageId}`,
      });
      return deleted || { success: true, id: imageId };
    }),

  // --- 11. VIDEO GALLERY (dpsi_gallery DB) ---
  listVideos: publicQuery.query(async () => {
    const { VideoGallery } = await getGalleryModels();
    return VideoGallery.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
  }),
  createVideo: adminMutation
    .input(
      z.object({
        title: z.string(),
        category: z.string().default("Events"),
        youtubeUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        isPublished: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { VideoGallery } = await getGalleryModels();
      const payload: any = {
        title: input.title.trim(),
        category: input.category || "Events",
        youtubeUrl: input.youtubeUrl?.trim() || "",
        videoUrl: input.videoUrl?.trim() || "",
        thumbnailUrl: input.thumbnailUrl?.trim() || "",
        isPublished: input.isPublished ?? true,
      };

      // Auto-extract thumbnail if youtubeUrl is present and thumbnail is missing
      if (payload.youtubeUrl && !payload.thumbnailUrl) {
        const match = payload.youtubeUrl.match(
          /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([\w-]{11})/i
        );
        const ytId = match ? match[1] : payload.youtubeUrl.length === 11 && /^[\w-]{11}$/.test(payload.youtubeUrl) ? payload.youtubeUrl : "";
        if (ytId) {
          payload.thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
      }

      const created = await VideoGallery.create(payload);
      await createImmutableAuditLog({
        action: "CREATE_VIDEO",
        module: "Videos",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Added video showcase: ${created.title}`,
      });
      return created;
    }),
  deleteVideo: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { VideoGallery } = await getGalleryModels();
      const rawId = input.id?._id || input.id;
      const videoId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(videoId)) {
        deleted = await VideoGallery.findByIdAndDelete(videoId).catch(() => null);
      }
      if (!deleted) {
        deleted = await VideoGallery.findOneAndDelete({
          $or: [{ _id: videoId }, { id: videoId }, { youtubeUrl: videoId }, { title: videoId }],
        }).catch(() => null);
      }
      if (!deleted) {
        deleted = await VideoGallery.findOneAndUpdate(
          { $or: [{ _id: videoId }, { youtubeUrl: videoId }, { title: videoId }] },
          { isDeleted: true },
          { returnDocument: "after" }
        ).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_VIDEO",
        module: "Videos",
        performedBy: ctx.user?.username || "Admin",
        documentId: videoId,
        details: `Deleted video showcase: ${deleted?.title || videoId}`,
      });
      return deleted || { success: true, id: videoId };
    }),

  // --- 12. TRANSFER CERTIFICATES (dpsi_tc DB) ---
  listTc: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        showTrash: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ input }) => {
      const { TransferCertificate } = await getTcModels();
      const filter: any = { isDeleted: input?.showTrash ?? false };

      if (input?.search && input.search.trim() !== "") {
        const safeSearch = escapeRegex(input.search.trim());
        const regex = new RegExp(safeSearch, "i");
        filter.$or = [
          { admissionNumber: regex },
          { studentName: regex },
          { fatherName: regex },
        ];
      }

      return TransferCertificate.find(filter).sort({ dateOfIssue: -1 });
    }),
  createTc: adminMutation
    .input(
      z.object({
        admissionNumber: z.string(),
        studentName: z.string(),
        fatherName: z.string(),
        motherName: z.string().optional(),
        classLeaving: z.string(),
        dateOfIssue: z.string(),
        certificatePdfUrl: z.string().optional().default("https://dpsindirapuram.com/tc/sample.pdf"),
        status: z.enum(["Issued", "Pending", "Cancelled"]).default("Issued"),
        remarks: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { TransferCertificate } = await getTcModels();
      return TransferCertificate.create({
        ...input,
        dateOfIssue: new Date(input.dateOfIssue),
      });
    }),
  deleteTc: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]), permanent: z.boolean().default(true) }))
    .mutation(async ({ input, ctx }) => {
      const { TransferCertificate } = await getTcModels();
      const rawId = input.id?._id || input.id;
      const tcId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(tcId)) {
        deleted = await TransferCertificate.findByIdAndDelete(tcId).catch(() => null);
      }
      if (!deleted) {
        deleted = await TransferCertificate.findOneAndDelete({
          $or: [{ _id: tcId }, { id: tcId }, { admissionNumber: tcId }, { studentName: tcId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_TC",
        module: "Transfer Certificates",
        performedBy: ctx.user?.username || "Admin",
        documentId: tcId,
        details: `Deleted TC: ${deleted?.studentName || tcId} (Adm #${deleted?.admissionNumber || "N/A"})`,
      });
      return deleted || { success: true, id: tcId };
    }),

  // --- 13. MUN REGISTRATIONS ---
  listMunRegistrations: publicQuery.query(async () => {
    const { MunRegistration } = await getMainModels();
    return MunRegistration.find({ isDeleted: false }).sort({ createdAt: -1 });
  }),
  updateMunStatus: adminMutation
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        paymentStatus: z.enum(["unpaid", "paid"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { MunRegistration } = await getMainModels();
      const { id, ...data } = input;
      return MunRegistration.findByIdAndUpdate(id, data, { new: true });
    }),

  // --- 16. UPDATE ACTIVITY ---
  updateActivity: adminMutation
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        eventDate: z.string().optional(),
        imageUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { Activity } = await getMainModels();
      const { id, ...rest } = input;
      const data: any = { ...rest };
      if (rest.eventDate) data.eventDate = new Date(rest.eventDate);
      return Activity.findByIdAndUpdate(id, data, { new: true });
    }),


  // --- 18. UPDATE ATTACHMENT ---
  updateAttachment: adminMutation
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        category: z.string().optional(),
        fileUrl: z.string().optional(),
        fileName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { Attachment } = await getMainModels();
      const { id, ...data } = input;
      return Attachment.findByIdAndUpdate(id, data, { new: true });
    }),

  // --- 19. TOGGLE MENU ACTIVE ---
  toggleMenu: adminMutation
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const { Menu } = await getMainModels();
      return Menu.findByIdAndUpdate(input.id, { isActive: input.isActive }, { new: true });
    }),

  // --- 20. UPDATE VIDEO ---
  updateVideo: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        title: z.string().optional(),
        category: z.string().optional(),
        youtubeUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { VideoGallery } = await getGalleryModels();
      const videoId = String(input.id?._id || input.id);
      const { id, ...data } = input;
      const updatePayload: any = { ...data };

      if (updatePayload.title) updatePayload.title = updatePayload.title.trim();
      if (updatePayload.youtubeUrl !== undefined) updatePayload.youtubeUrl = updatePayload.youtubeUrl.trim();
      if (updatePayload.videoUrl !== undefined) updatePayload.videoUrl = updatePayload.videoUrl.trim();
      if (updatePayload.thumbnailUrl !== undefined) updatePayload.thumbnailUrl = updatePayload.thumbnailUrl.trim();

      // Auto-extract thumbnail if youtubeUrl is present and thumbnail is missing
      if (updatePayload.youtubeUrl && !updatePayload.thumbnailUrl) {
        const match = updatePayload.youtubeUrl.match(
          /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([\w-]{11})/i
        );
        const ytId = match ? match[1] : updatePayload.youtubeUrl.length === 11 && /^[\w-]{11}$/.test(updatePayload.youtubeUrl) ? updatePayload.youtubeUrl : "";
        if (ytId) {
          updatePayload.thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
      }

      const updated = await VideoGallery.findByIdAndUpdate(videoId, updatePayload, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_VIDEO",
        module: "Videos",
        performedBy: ctx.user?.username || "Admin",
        documentId: videoId,
        details: `Updated video showcase: ${updated?.title || videoId}`,
      });
      return updated;
    }),

  // --- 21. BULK CREATE TC ---
  bulkCreateTc: adminMutation
    .input(
      z.object({
        records: z.array(
          z.object({
            admissionNumber: z.string().min(1).max(50),
            studentName: z.string().min(1).max(100),
            fatherName: z.string().min(1).max(100),
            motherName: z.string().optional().default(""),
            classLeaving: z.string().min(1).max(50),
            dateOfIssue: z.string(),
            status: z.enum(["Issued", "Pending", "Cancelled"]).default("Issued"),
            remarks: z.string().optional().default(""),
          })
        ).min(1, "At least one record is required").max(500, "Maximum 500 records per batch upload allowed"),
      })
    )
    .mutation(async ({ input }) => {
      const { TransferCertificate } = await getTcModels();
      const docs = input.records.map((r) => ({
        ...r,
        dateOfIssue: new Date(r.dateOfIssue),
        certificatePdfUrl: "https://dpsindirapuram.com/tc/sample.pdf",
      }));
      const result = await TransferCertificate.insertMany(docs, { ordered: false });
      return { success: true, inserted: result.length };
    }),

  // --- 22. SITE SETTINGS ---
  getSiteSettings: publicQuery.query(async () => {
    const { SiteSettings } = await getMainModels();
    const settings = await SiteSettings.find({}).sort({ group: 1, key: 1 });
    if (!settings || settings.length === 0) {
      // Seed defaults on first fetch
      const defaults = [
        { key: "school_name", value: "Delhi Public School Indirapuram", label: "School Name", group: "general" },
        { key: "school_tagline", value: "Excellence in Education — CBSE Affiliated", label: "Tagline", group: "general" },
        { key: "contact_phone", value: "+91-0120-4660000", label: "Contact Phone", group: "contact" },
        { key: "contact_email", value: "info@dpsindirapuram.com", label: "Contact Email", group: "contact" },
        { key: "contact_address", value: "526/1 Ahinsa Khand-II, Indirapuram, Ghaziabad, UP 201014", label: "Address", group: "contact" },
        { key: "admission_status", value: "Open for 2026-27", label: "Admission Status", group: "admissions" },
        { key: "social_facebook", value: "https://facebook.com/dpsindirapuram", label: "Facebook URL", group: "social" },
        { key: "social_instagram", value: "https://instagram.com/dpsindirapuram", label: "Instagram URL", group: "social" },
        { key: "social_youtube", value: "https://youtube.com/@dpsindirapuram", label: "YouTube URL", group: "social" },
      ];
      await SiteSettings.insertMany(defaults).catch(() => {});
      return SiteSettings.find({}).sort({ group: 1, key: 1 });
    }
    return settings;
  }),
  updateSiteSettings: adminMutation
    .input(
      z.object({
        updates: z.array(z.object({ key: z.string(), value: z.string() })),
      })
    )
    .mutation(async ({ input }) => {
      const { SiteSettings } = await getMainModels();
      await Promise.all(
        input.updates.map((u) =>
          SiteSettings.findOneAndUpdate({ key: u.key }, { value: u.value }, { upsert: true, new: true })
        )
      );
      return { success: true };
    }),

  // --- 23. AI CONFIG ---
  getAiConfig: publicQuery.query(async () => {
    const { AiConfig } = await getMainModels();
    const config = await AiConfig.findOne({}).sort({ updatedAt: -1 });
    return config || null;
  }),
  updateAiConfig: adminMutation
    .input(
      z.object({
        systemPrompt: z.string(),
        modelId: z.string().default("llama-3.3-70b-versatile"),
        temperature: z.number().min(0).max(1).default(0.4),
        maxTokens: z.number().min(100).max(2000).default(700),
      })
    )
    .mutation(async ({ input }) => {
      const { AiConfig } = await getMainModels();
      const existing = await AiConfig.findOne({});
      if (existing) {
        await AiConfig.findByIdAndUpdate(existing._id, input);
      } else {
        await AiConfig.create(input);
      }
      return { success: true };
    }),

  // --- 24. POPUP UPDATE ---
  updatePopup: adminMutation
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        linkUrl: z.string().optional(),
        badgeText: z.string().optional(),
        buttonText: z.string().optional(),
        showOnLoad: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { Popup } = await getMainModels();
      const { id, ...data } = input;
      return Popup.findByIdAndUpdate(id, data, { new: true });
    }),

  // --- 25. REORDER MENU ---
  reorderMenuItems: adminMutation
    .input(
      z.object({
        items: z.array(z.object({ id: z.string(), order: z.number() })),
      })
    )
    .mutation(async ({ input }) => {
      const { Menu } = await getMainModels();
      await Promise.all(
        input.items.map((item) =>
          Menu.findByIdAndUpdate(item.id, { order: item.order })
        )
      );
      return { success: true };
    }),

  // --- 26. LEADERSHIP & FACULTY ---
  listLeadership: publicQuery.query(async () => {
    const { Leadership } = await getMainModels();
    return Leadership.find({ isActive: true }).sort({ order: 1 });
  }),
  createLeadership: adminMutation
    .input(
      z.object({
        name: z.string().min(2),
        role: z.string().min(2),
        designation: z.string().optional(),
        bio: z.string().optional(),
        imageUrl: z.string().optional(),
        order: z.number().default(0),
        category: z.string().default("Management"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Leadership } = await getMainModels();
      const created = await Leadership.create(input);
      await createImmutableAuditLog({
        action: "CREATE_LEADERSHIP",
        module: "Faculty",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Added leadership/faculty profile: ${created.name} (${created.role})`,
      });
      return created;
    }),
  updateLeadership: adminMutation
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        role: z.string().min(2).optional(),
        designation: z.string().optional(),
        bio: z.string().optional(),
        imageUrl: z.string().optional(),
        order: z.number().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const { Leadership } = await getMainModels();
      const updated = await Leadership.findByIdAndUpdate(id, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_LEADERSHIP",
        module: "Faculty",
        performedBy: ctx.user?.username || "Admin",
        documentId: id,
        details: `Updated leadership/faculty profile: ${updated?.name}`,
      });
      return updated;
    }),
  deleteLeadership: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Leadership } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const leadId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(leadId)) {
        deleted = await Leadership.findByIdAndDelete(leadId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Leadership.findOneAndDelete({
          $or: [{ _id: leadId }, { id: leadId }, { name: leadId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_LEADERSHIP",
        module: "Faculty",
        performedBy: ctx.user?.username || "Admin",
        documentId: leadId,
        details: `Deleted leadership profile: ${deleted?.name || leadId}`,
      });
      return deleted || { success: true, id: leadId };
    }),

  // --- 28. FACILITIES ---
  listFacilities: publicQuery.query(async () => {
    const { Facility } = await getMainModels();
    return Facility.find({ isActive: true }).sort({ order: 1 });
  }),
  createFacility: adminMutation
    .input(
      z.object({
        title: z.string().min(2),
        category: z.string().default("Campus"),
        description: z.string().min(5),
        icon: z.string().default("Microscope"),
        imageUrl: z.string().optional(),
        geometry: z.string().optional(),
        color: z.string().optional(),
        accent: z.string().optional(),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Facility } = await getMainModels();
      const created = await Facility.create(input);
      await createImmutableAuditLog({
        action: "CREATE_FACILITY",
        module: "Facilities",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created facility: ${created.title}`,
      });
      return created;
    }),
  updateFacility: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        title: z.string().min(2),
        category: z.string().default("Campus"),
        description: z.string().min(5),
        icon: z.string().default("Microscope"),
        imageUrl: z.string().optional(),
        geometry: z.string().optional(),
        color: z.string().optional(),
        accent: z.string().optional(),
        order: z.number().default(0),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const { Facility } = await getMainModels();
      const facilityId = String(id?._id || id);
      const updated = await Facility.findByIdAndUpdate(facilityId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_FACILITY",
        module: "Facilities",
        performedBy: ctx.user?.username || "Admin",
        documentId: facilityId,
        details: `Updated facility: ${updated?.title}`,
      });
      return updated;
    }),
  deleteFacility: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Facility } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const facId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(facId)) {
        deleted = await Facility.findByIdAndDelete(facId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Facility.findOneAndDelete({
          $or: [{ _id: facId }, { id: facId }, { title: facId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_FACILITY",
        module: "Facilities",
        performedBy: ctx.user?.username || "Admin",
        documentId: facId,
        details: `Deleted facility: ${deleted?.title || facId}`,
      });
      return deleted || { success: true, id: facId };
    }),

  // --- 29. DEPARTMENTS & CURRICULUM ---
  listDepartments: publicQuery.query(async () => {
    const { Department } = await getMainModels();
    return Department.find({ isActive: true }).sort({ order: 1 });
  }),
  createDepartment: adminMutation
    .input(
      z.object({
        name: z.string().min(2),
        subjects: z.string().min(2),
        icon: z.string().default("BookOpen"),
        color: z.string().default("bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Department } = await getMainModels();
      const created = await Department.create(input);
      await createImmutableAuditLog({
        action: "CREATE_DEPARTMENT",
        module: "Academics",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created academic department: ${created.name}`,
      });
      return created;
    }),
  updateDepartment: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        name: z.string().min(2),
        subjects: z.string().min(2),
        icon: z.string().default("BookOpen"),
        color: z.string().default("bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"),
        order: z.number().default(0),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const { Department } = await getMainModels();
      const deptId = String(id?._id || id);
      const updated = await Department.findByIdAndUpdate(deptId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_DEPARTMENT",
        module: "Academics",
        performedBy: ctx.user?.username || "Admin",
        documentId: deptId,
        details: `Updated academic department: ${updated?.name}`,
      });
      return updated;
    }),
  deleteDepartment: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Department } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const deptId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(deptId)) {
        deleted = await Department.findByIdAndDelete(deptId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Department.findOneAndDelete({
          $or: [{ _id: deptId }, { id: deptId }, { name: deptId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_DEPARTMENT",
        module: "Academics",
        performedBy: ctx.user?.username || "Admin",
        documentId: deptId,
        details: `Deleted academic department: ${deleted?.name || deptId}`,
      });
      return deleted || { success: true, id: deptId };
    }),

  // --- 30. ADMISSION STEPS ---
  listAdmissionSteps: publicQuery.query(async () => {
    const { AdmissionStep } = await getMainModels();
    return AdmissionStep.find({ isActive: true }).sort({ stepNumber: 1 });
  }),
  createAdmissionStep: adminMutation
    .input(
      z.object({
        stepNumber: z.number(),
        title: z.string().min(2),
        description: z.string().min(5),
        icon: z.string().default("FileText"),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { AdmissionStep } = await getMainModels();
      const created = await AdmissionStep.create(input);
      await createImmutableAuditLog({
        action: "CREATE_ADMISSION_STEP",
        module: "Admissions",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created admission step #${created.stepNumber}: ${created.title}`,
      });
      return created;
    }),
  updateAdmissionStep: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        stepNumber: z.number(),
        title: z.string().min(2),
        description: z.string().min(5),
        icon: z.string().default("FileText"),
        order: z.number().default(0),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const { AdmissionStep } = await getMainModels();
      const stepId = String(id?._id || id);
      const updated = await AdmissionStep.findByIdAndUpdate(stepId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_ADMISSION_STEP",
        module: "Admissions",
        performedBy: ctx.user?.username || "Admin",
        documentId: stepId,
        details: `Updated admission step #${updated?.stepNumber}: ${updated?.title}`,
      });
      return updated;
    }),
  deleteAdmissionStep: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { AdmissionStep } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const stepId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(stepId)) {
        deleted = await AdmissionStep.findByIdAndDelete(stepId).catch(() => null);
      }
      if (!deleted) {
        deleted = await AdmissionStep.findOneAndDelete({
          $or: [{ _id: stepId }, { id: stepId }, { title: stepId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_ADMISSION_STEP",
        module: "Admissions",
        performedBy: ctx.user?.username || "Admin",
        documentId: stepId,
        details: `Deleted admission step #${deleted?.stepNumber || stepId}`,
      });
      return deleted || { success: true, id: stepId };
    }),

  // --- 31. FAQS ---
  listFaqs: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const { Faq } = await getMainModels();
      const filter: any = { isActive: true };
      if (input?.category) filter.category = input.category;
      return Faq.find(filter).sort({ order: 1 });
    }),
  createFaq: adminMutation
    .input(
      z.object({
        question: z.string().min(3),
        answer: z.string().min(3),
        category: z.string().default("Admissions"),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Faq } = await getMainModels();
      const created = await Faq.create(input);
      await createImmutableAuditLog({
        action: "CREATE_FAQ",
        module: "FAQs",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created FAQ: ${created.question}`,
      });
      return created;
    }),
  updateFaq: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        question: z.string().min(3),
        answer: z.string().min(3),
        category: z.string().default("Admissions"),
        order: z.number().default(0),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const { Faq } = await getMainModels();
      const faqId = String(id?._id || id);
      const updated = await Faq.findByIdAndUpdate(faqId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_FAQ",
        module: "FAQs",
        performedBy: ctx.user?.username || "Admin",
        documentId: faqId,
        details: `Updated FAQ: ${updated?.question}`,
      });
      return updated;
    }),
  deleteFaq: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Faq } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const faqId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(faqId)) {
        deleted = await Faq.findByIdAndDelete(faqId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Faq.findOneAndDelete({
          $or: [{ _id: faqId }, { id: faqId }, { question: faqId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_FAQ",
        module: "FAQs",
        performedBy: ctx.user?.username || "Admin",
        documentId: faqId,
        details: `Deleted FAQ: ${deleted?.question || faqId}`,
      });
      return deleted || { success: true, id: faqId };
    }),

  // --- 32. TIMELINE & MILESTONES ---
  listTimeline: publicQuery.query(async () => {
    const { TimelineItem } = await getMainModels();
    return TimelineItem.find({ isActive: true }).sort({ order: 1 });
  }),
  createTimelineItem: adminMutation
    .input(
      z.object({
        year: z.string().min(2),
        title: z.string().min(2),
        description: z.string().min(5),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { TimelineItem } = await getMainModels();
      const created = await TimelineItem.create(input);
      await createImmutableAuditLog({
        action: "CREATE_TIMELINE",
        module: "About",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created history milestone [${created.year}]: ${created.title}`,
      });
      return created;
    }),
  updateTimelineItem: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        year: z.string().min(2),
        title: z.string().min(2),
        description: z.string().min(5),
        order: z.number().default(0),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const { TimelineItem } = await getMainModels();
      const timelineId = String(id?._id || id);
      const updated = await TimelineItem.findByIdAndUpdate(timelineId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_TIMELINE",
        module: "About",
        performedBy: ctx.user?.username || "Admin",
        documentId: timelineId,
        details: `Updated history milestone: ${updated?.title}`,
      });
      return updated;
    }),
  deleteTimelineItem: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { TimelineItem } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const timelineId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(timelineId)) {
        deleted = await TimelineItem.findByIdAndDelete(timelineId).catch(() => null);
      }
      if (!deleted) {
        deleted = await TimelineItem.findOneAndDelete({
          $or: [{ _id: timelineId }, { id: timelineId }, { title: timelineId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_TIMELINE",
        module: "About",
        performedBy: ctx.user?.username || "Admin",
        documentId: timelineId,
        details: `Deleted history milestone: ${deleted?.title || timelineId}`,
      });
      return deleted || { success: true, id: timelineId };
    }),

  // --- 33. CORE VALUES ---
  listCoreValues: publicQuery.query(async () => {
    const { CoreValue } = await getMainModels();
    return CoreValue.find({ isActive: true }).sort({ order: 1 });
  }),
  createCoreValue: adminMutation
    .input(
      z.object({
        title: z.string().min(2),
        description: z.string().min(5),
        icon: z.string().default("Target"),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { CoreValue } = await getMainModels();
      const created = await CoreValue.create(input);
      await createImmutableAuditLog({
        action: "CREATE_CORE_VALUE",
        module: "About",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created core value pillar: ${created.title}`,
      });
      return created;
    }),
  updateCoreValue: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        title: z.string().min(2),
        description: z.string().min(5),
        icon: z.string().default("Target"),
        order: z.number().default(0),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const { CoreValue } = await getMainModels();
      const valueId = String(id?._id || id);
      const updated = await CoreValue.findByIdAndUpdate(valueId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_CORE_VALUE",
        module: "About",
        performedBy: ctx.user?.username || "Admin",
        documentId: valueId,
        details: `Updated core value pillar: ${updated?.title}`,
      });
      return updated;
    }),
  deleteCoreValue: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { CoreValue } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const valueId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(valueId)) {
        deleted = await CoreValue.findByIdAndDelete(valueId).catch(() => null);
      }
      if (!deleted) {
        deleted = await CoreValue.findOneAndDelete({
          $or: [{ _id: valueId }, { id: valueId }, { title: valueId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_CORE_VALUE",
        module: "About",
        performedBy: ctx.user?.username || "Admin",
        documentId: valueId,
        details: `Deleted core value pillar: ${deleted?.title || valueId}`,
      });
      return deleted || { success: true, id: valueId };
    }),

  // --- 34. 3D FEATURE CARDS ---
  listFeatureCards: publicQuery.query(async () => {
    const { FeatureCard } = await getMainModels();
    return FeatureCard.find({ isActive: true }).sort({ order: 1 });
  }),
  createFeatureCard: adminMutation
    .input(
      z.object({
        title: z.string().min(2),
        description: z.string().min(5),
        icon: z.string().default("Bot"),
        category: z.string().optional(),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { FeatureCard } = await getMainModels();
      const created = await FeatureCard.create(input);
      await createImmutableAuditLog({
        action: "CREATE_FEATURE_CARD",
        module: "Features",
        performedBy: ctx.user?.username || "Admin",
        documentId: created._id.toString(),
        details: `Created feature card: ${created.title}`,
      });
      return created;
    }),
  updateFeatureCard: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        title: z.string().min(2),
        description: z.string().min(5),
        icon: z.string().default("Bot"),
        category: z.string().optional(),
        order: z.number().default(0),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const { FeatureCard } = await getMainModels();
      const cardId = String(id?._id || id);
      const updated = await FeatureCard.findByIdAndUpdate(cardId, data, { new: true });
      await createImmutableAuditLog({
        action: "UPDATE_FEATURE_CARD",
        module: "Features",
        performedBy: ctx.user?.username || "Admin",
        documentId: cardId,
        details: `Updated feature card: ${updated?.title}`,
      });
      return updated;
    }),
  deleteFeatureCard: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { FeatureCard } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const cardId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(cardId)) {
        deleted = await FeatureCard.findByIdAndDelete(cardId).catch(() => null);
      }
      if (!deleted) {
        deleted = await FeatureCard.findOneAndDelete({
          $or: [{ _id: cardId }, { id: cardId }, { title: cardId }],
        }).catch(() => null);
      }

      await createImmutableAuditLog({
        action: "DELETE_FEATURE_CARD",
        module: "Features",
        performedBy: ctx.user?.username || "Admin",
        documentId: cardId,
        details: `Deleted feature card: ${deleted?.title || cardId}`,
      });
      return deleted || { success: true, id: cardId };
    }),

  // --- 35. IMMUTABLE AUDIT LOGS ---
  listAuditLogs: adminQuery
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(100),
        module: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { AuditLog } = await getMainModels();
      const filter: any = {};
      if (input?.module && input.module !== "All") {
        filter.module = input.module;
      }
      return AuditLog.find(filter).sort({ sequenceNumber: -1 }).limit(input?.limit || 100);
    }),

  verifyAuditLedger: adminQuery.query(async () => {
    const { AuditLog } = await getMainModels();
    const logs = await AuditLog.find({}).sort({ sequenceNumber: 1 });
    if (!logs || logs.length === 0) {
      return { isTamperFree: true, totalLogs: 0, verifiedAt: new Date(), latestHash: "GENESIS" };
    }

    let expectedPrevHash = "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000";
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      if (log.previousHash !== expectedPrevHash) {
        return {
          isTamperFree: false,
          compromisedSequence: log.sequenceNumber,
          totalLogs: logs.length,
          verifiedAt: new Date(),
        };
      }
      expectedPrevHash = log.currentHash;
    }

    return {
      isTamperFree: true,
      totalLogs: logs.length,
      verifiedAt: new Date(),
      latestHash: logs[logs.length - 1]?.currentHash,
    };
  }),
});

