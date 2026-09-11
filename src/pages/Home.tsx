import Layout from "@/components/Layout";
import HeroSection from "@/sections/HeroSection";
import AnnouncementsBar from "@/sections/AnnouncementsBar";
import QuickStats from "@/sections/QuickStats";
import InteractiveFacilitiesSection from "@/sections/InteractiveFacilitiesSection";
import NewsHighlights from "@/sections/NewsHighlights";
import PrincipalMessage from "@/sections/PrincipalMessage";
import AchievementsSection from "@/sections/AchievementsSection";
import VideoGallerySection from "@/sections/VideoGallerySection";
import TestimonialsSection from "@/sections/TestimonialsSection";
import CTASection from "@/sections/CTASection";

export default function Home() {
  return (
    <Layout>
      {/* 1. Full-Screen Cinematic Hero Video on top of the screen */}
      <HeroSection />

      {/* 2. Smoothly appearing sections as user scrolls down */}
      <div id="home-content" className="relative z-10 bg-white dark:bg-slate-950 transition-colors">
        <AnnouncementsBar />
        <QuickStats />
        
        {/* Below-the-fold sections with deferred rendering for butter-smooth 60/120fps scrolling */}
        <div className="content-visibility-auto">
          <InteractiveFacilitiesSection />
        </div>
        <div className="content-visibility-auto">
          <NewsHighlights />
        </div>
        <div className="content-visibility-auto">
          <PrincipalMessage />
        </div>
        <div className="content-visibility-auto">
          <AchievementsSection />
        </div>
        <div className="content-visibility-auto">
          <VideoGallerySection />
        </div>
        <div className="content-visibility-auto">
          <TestimonialsSection />
        </div>
        <div className="content-visibility-auto">
          <CTASection />
        </div>
      </div>
    </Layout>
  );
}
