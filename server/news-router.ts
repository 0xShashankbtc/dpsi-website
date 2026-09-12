import { z } from "zod";
import mongoose from "mongoose";
import { createRouter, publicQuery, adminQuery, adminMutation } from "./middleware";
import { getMainModels, createImmutableAuditLog } from "./models/cmsSchemas";
import { withCache, invalidateCache } from "./lib/cache";

export const newsRouter = createRouter({
  list: publicQuery.query(async () => {
    return withCache("news:list", 300, async () => {
      try {
        const { Activity } = await getMainModels();
        const acts = await Activity.find({ isDeleted: false, isPublished: true }).sort({ eventDate: -1, createdAt: -1 }).lean();
        return acts.map((a: any, idx: number) => ({
          id: a._id?.toString() || idx + 1,
          title: a.title,
          slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          excerpt: a.description,
          content: a.description,
          image: a.imageUrl || "",
          category: a.category || "Campus",
          published: a.isPublished,
          featured: true,
          createdAt: a.eventDate || a.createdAt || new Date(),
        }));
      } catch {
        return [];
      }
    });
  }),

  featured: publicQuery.query(async () => {
    return withCache("news:featured", 300, async () => {
      try {
        const { Activity } = await getMainModels();
        const acts = await Activity.find({ isDeleted: false, isPublished: true }).sort({ eventDate: -1, createdAt: -1 }).limit(3).lean();
        return acts.map((a: any, idx: number) => ({
          id: a._id?.toString() || idx + 1,
          title: a.title,
          slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          excerpt: a.description,
          content: a.description,
          image: a.imageUrl || "",
          category: a.category || "Campus",
          published: a.isPublished,
          featured: true,
          createdAt: a.eventDate || a.createdAt || new Date(),
        }));
      } catch {
        return [];
      }
    });
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return withCache(`news:slug:${input.slug}`, 300, async () => {
        try {
          const { Activity } = await getMainModels();
          const safeSlug = input.slug.trim();
          const words = safeSlug.split("-").filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

          let matched: any = null;
          if (words.length > 0) {
            const regexPattern = words.join("[^a-z0-9]+");
            matched = await Activity.findOne({
              isDeleted: false,
              isPublished: true,
              title: { $regex: new RegExp(`^${regexPattern}$`, "i") },
            }).lean();
          }

          if (!matched) {
            // Fallback check limited to top 50 recent published items
            const recentActs = await Activity.find({ isDeleted: false, isPublished: true }).sort({ createdAt: -1 }).limit(50).lean();
            matched = recentActs.find((a: any) => {
              const s = a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              return s === safeSlug;
            });
          }

          if (matched) {
            return {
              id: matched._id?.toString(),
              title: matched.title,
              slug: input.slug,
              excerpt: matched.description,
              content: matched.description,
              image: matched.imageUrl || "",
              category: matched.category || "Campus",
              published: matched.isPublished,
              featured: true,
              createdAt: matched.eventDate || matched.createdAt || new Date(),
            };
          }
          return null;
        } catch {
          return null;
        }
      });
    }),

  adminList: adminQuery.query(async () => {
    try {
      const { Activity } = await getMainModels();
      const acts = await Activity.find({ isDeleted: false }).sort({ eventDate: -1, createdAt: -1 }).lean();
      return acts.map((a: any) => ({
        id: a._id?.toString(),
        title: a.title,
        excerpt: a.description,
        content: a.description,
        image: a.imageUrl || "",
        category: a.category || "Campus",
        published: a.isPublished,
        createdAt: a.eventDate || a.createdAt || new Date(),
      }));
    } catch {
      return [];
    }
  }),

  create: adminMutation
    .input(
      z.object({
        title: z.string().min(3).max(500),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().min(5),
        image: z.string().optional(),
        category: z.string().optional(),
        published: z.boolean().default(true),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { Activity } = await getMainModels();
      const doc = await Activity.create({
        title: input.title,
        description: input.content || input.excerpt || "",
        imageUrl: input.image || "",
        category: input.category || "News",
        isPublished: input.published,
      });
      invalidateCache("news:");
      invalidateCache("events:");
      await createImmutableAuditLog({
        action: "CREATE_ACTIVITY",
        module: "News",
        performedBy: ctx.user?.username || "Admin",
        documentId: doc._id.toString(),
        details: `Created news post: ${doc.title}`,
      });
      return { success: true, id: doc._id.toString() };
    }),

  update: adminMutation
    .input(
      z.object({
        id: z.union([z.string(), z.any()]),
        title: z.string().min(3).max(500),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().min(5),
        image: z.string().optional(),
        category: z.string().optional(),
        published: z.boolean().default(true),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const newsId = String(id?._id || id);
      const { Activity } = await getMainModels();
      const updated = await Activity.findByIdAndUpdate(
        newsId,
        {
          title: data.title,
          description: data.content || data.excerpt || "",
          imageUrl: data.image,
          category: data.category,
          isPublished: data.published,
        },
        { new: true }
      );
      invalidateCache("news:");
      invalidateCache("events:");
      await createImmutableAuditLog({
        action: "UPDATE_ACTIVITY",
        module: "News",
        performedBy: ctx.user?.username || "Admin",
        documentId: newsId,
        details: `Updated news post: ${updated?.title || newsId}`,
      });
      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { Activity } = await getMainModels();
      const rawId = input.id?._id || input.id;
      const newsId = String(rawId);

      let deleted: any = null;
      if (mongoose.Types.ObjectId.isValid(newsId)) {
        deleted = await Activity.findByIdAndDelete(newsId).catch(() => null);
      }
      if (!deleted) {
        deleted = await Activity.findOneAndDelete({
          $or: [{ _id: newsId }, { id: newsId }, { title: newsId }],
        }).catch(() => null);
      }

      invalidateCache("news:");
      invalidateCache("events:");
      await createImmutableAuditLog({
        action: "DELETE_ACTIVITY",
        module: "News",
        performedBy: ctx.user?.username || "Admin",
        documentId: newsId,
        details: `Deleted news post: ${deleted?.title || newsId}`,
      });
      return { success: true, deleted };
    }),
});