import { z } from "zod";
import mongoose from "mongoose";
import { createRouter, publicQuery, adminMutation } from "./middleware";
import { getGalleryModels } from "./models/cmsSchemas";
import { withCache, invalidateCache } from "./lib/cache";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const galleryRouter = createRouter({
  list: publicQuery.query(async ({ ctx }) => {
    return withCache("gallery:list", 120, async () => {
      try {
        const { GalleryImage } = await getGalleryModels(ctx.tenantId);
        const images = await GalleryImage.find({ isDeleted: false }).sort({ createdAt: -1 });
        return images.map((img: any, idx: number) => ({
          id: img._id?.toString() || idx + 1,
          title: img.title,
          category: img.category,
          imageUrl: img.imageUrl,
          featured: img.featured ?? true,
        }));
      } catch {
        return [];
      }
    });
  }),

  byCategory: publicQuery
    .input(z.object({ category: z.string() }))
    .query(async ({ input, ctx }) => {
      const safeCat = escapeRegex(input.category.trim());
      return withCache(`gallery:cat:${safeCat.toLowerCase()}`, 120, async () => {
        try {
          const { GalleryImage } = await getGalleryModels(ctx.tenantId);
          const query: any = { isDeleted: false };
          if (safeCat.toLowerCase() !== "all") {
            query.category = { $regex: new RegExp(`^${safeCat}$`, "i") };
          }
          const images = await GalleryImage.find(query).sort({ createdAt: -1 });
          return images.map((img: any, idx: number) => ({
            id: img._id?.toString() || idx + 1,
            title: img.title,
            category: img.category,
            imageUrl: img.imageUrl,
            featured: img.featured ?? true,
          }));
        } catch {
          return [];
        }
      });
    }),

  featured: publicQuery.query(async ({ ctx }) => {
    return withCache("gallery:featured", 120, async () => {
      try {
        const { GalleryImage } = await getGalleryModels(ctx.tenantId);
        const images = await GalleryImage.find({ isDeleted: false, featured: true }).limit(8);
        const docs = images.length > 0 ? images : await GalleryImage.find({ isDeleted: false }).limit(8);
        return docs.map((img: any, idx: number) => ({
          id: img._id?.toString() || idx + 1,
          title: img.title,
          category: img.category,
          imageUrl: img.imageUrl,
          featured: true,
        }));
      } catch {
        return [];
      }
    });
  }),

  create: adminMutation
    .input(
      z.object({
        title: z.string().min(2).max(255),
        description: z.string().optional(),
        imageUrl: z.string().min(1),
        videoUrl: z.string().optional(),
        category: z.string().min(1).max(100),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { GalleryImage } = await getGalleryModels(ctx.tenantId);
      const doc = await GalleryImage.create(input);
      invalidateCache("gallery:");
      invalidateCache("cms:galleryImages");
      return { success: true, id: doc._id.toString() };
    }),

  update: adminMutation
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(2).max(255),
        description: z.string().optional(),
        imageUrl: z.string().min(1),
        videoUrl: z.string().optional(),
        category: z.string().min(1).max(100),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const { GalleryImage } = await getGalleryModels(ctx.tenantId);
      await GalleryImage.findByIdAndUpdate(id, data);
      invalidateCache("gallery:");
      invalidateCache("cms:galleryImages");
      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.union([z.string(), z.any()]) }))
    .mutation(async ({ input, ctx }) => {
      const { GalleryImage } = await getGalleryModels(ctx.tenantId);
      const rawId = input.id?._id || input.id;
      const imageId = String(rawId);
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(imageId)) {
        deleted = await GalleryImage.findByIdAndDelete(imageId).catch(() => null);
      }
      if (!deleted) {
        deleted = await GalleryImage.findOneAndDelete({
          $or: [{ _id: imageId }, { id: imageId }, { imageUrl: imageId }, { title: imageId }],
        }).catch(() => null);
      }
      invalidateCache("gallery:");
      invalidateCache("cms:galleryImages");
      return { success: true, deleted };
    }),
});