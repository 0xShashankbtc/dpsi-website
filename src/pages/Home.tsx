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
      <InteractiveFacilitiesSection />
      <NewsHighlights />
      <PrincipalMessage />
      <AchievementsSection />
      <VideoGallerySection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
}
