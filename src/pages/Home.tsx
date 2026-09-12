import { lazy, Suspense, useEffect } from "react";
import Layout from "@/components/Layout";
import HeroSection from "@/sections/HeroSection";
import AnnouncementsBar from "@/sections/AnnouncementsBar";
import QuickStats from "@/sections/QuickStats";
import { trpc } from "@/providers/trpc";

// Below-fold sections: lazy-loaded to defer JS parsing until needed
// This removes ~120KB from the critical-path bundle
const InteractiveFacilitiesSection = lazy(() => import("@/sections/InteractiveFacilitiesSection"));
const NewsHighlights = lazy(() => import("@/sections/NewsHighlights"));
const PrincipalMessage = lazy(() => import("@/sections/PrincipalMessage"));
const AchievementsSection = lazy(() => import("@/sections/AchievementsSection"));
const VideoGallerySection = lazy(() => import("@/sections/VideoGallerySection"));
const TestimonialsSection = lazy(() => import("@/sections/TestimonialsSection"));
const CTASection = lazy(() => import("@/sections/CTASection"));

// Lightweight skeleton shown while a lazy section loads
function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`w-full ${height} bg-slate-100 dark:bg-slate-800/60 animate-pulse`} />
  );
}

export default function Home() {
  const utils = trpc.useUtils();

  useEffect(() => {
    // Eagerly prefetch all Home page queries in a single batched HTTP request
    // This primes the TanStack Query cache before the user scrolls, eliminating all loading delays
    utils.cms.getSiteSettings.prefetch();
    utils.cms.listMenus.prefetch({ location: "header" });
    utils.cms.listMenus.prefetch({ location: "footer_quick" });
    utils.cms.listMenus.prefetch({ location: "footer_resources" });
    utils.cms.listMarquees.prefetch();
    utils.announcements.list.prefetch();
    utils.stats.list.prefetch();
    utils.cms.listSliders.prefetch();
    utils.cms.listFacilities.prefetch();
    utils.cms.listActivities.prefetch();
    utils.news.featured.prefetch();
    utils.achievements.list.prefetch();
    utils.testimonials.featured.prefetch();
    utils.cms.listVideos.prefetch();
  }, [utils]);

  return (
    <Layout>
      {/* 1. Full-Screen Cinematic Hero Video — above fold, eager */}
      <HeroSection />

      {/* 2. Smoothly appearing sections as user scrolls down */}
      <div id="home-content" className="relative z-10 bg-white dark:bg-slate-950 transition-colors">
        {/* Near-fold: eager */}
        <AnnouncementsBar />
        <QuickStats />

        {/* Below-fold: lazy-loaded — GSAP pin support, no content-visibility wrapper */}
        <Suspense fallback={<SectionSkeleton height="h-[70vh]" />}>
          <InteractiveFacilitiesSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <NewsHighlights />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-80" />}>
          <PrincipalMessage />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-64" />}>
          <AchievementsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <VideoGallerySection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-64" />}>
          <TestimonialsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-64" />}>
          <CTASection />
        </Suspense>
      </div>
    </Layout>
  );
}
