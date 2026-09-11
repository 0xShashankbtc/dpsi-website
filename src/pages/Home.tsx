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
      <AnnouncementsBar />
      <HeroSection />
      <QuickStats />

      {/* Performance-optimized below-the-fold sections for instant initial paint & silky scroll */}
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
    </Layout>
  );
}
