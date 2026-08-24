import { admissionRouter } from "./admission-router";
import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { newsRouter } from "./news-router";
import { eventsRouter } from "./events-router";
import { galleryRouter } from "./gallery-router";
import { contactRouter } from "./contact-router";
import { testimonialRouter } from "./testimonial-router";
import { achievementRouter } from "./achievement-router";
import { announcementRouter } from "./announcement-router";
import { statsRouter } from "./stats-router";
import { aiRouter } from "./ai-router";
import { cmsRouter } from "./cms-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  admissions: admissionRouter,
  news: newsRouter,
  events: eventsRouter,
  gallery: galleryRouter,
  contact: contactRouter,
  testimonials: testimonialRouter,
  achievements: achievementRouter,
  announcements: announcementRouter,
  stats: statsRouter,
  ai: aiRouter,
  cms: cmsRouter,
});

export type AppRouter = typeof appRouter;