import { motion } from "framer-motion";
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

const sectionFadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function Home() {
  return (
    <Layout>
      {/* 1. Full-Screen Cinematic Hero Video on top of the screen */}
      <HeroSection />

      {/* 2. Smoothly appearing sections as user scrolls down */}
      <div id="home-content" className="relative z-10 bg-white dark:bg-slate-950 transition-colors">
        <AnnouncementsBar />
        <QuickStats />

        <motion.div {...sectionFadeUp}>
          <InteractiveFacilitiesSection />
        </motion.div>

        <motion.div {...sectionFadeUp}>
          <NewsHighlights />
        </motion.div>

        <motion.div {...sectionFadeUp}>
          <PrincipalMessage />
        </motion.div>

        <motion.div {...sectionFadeUp}>
          <AchievementsSection />
        </motion.div>

        <motion.div {...sectionFadeUp}>
          <VideoGallerySection />
        </motion.div>

        <motion.div {...sectionFadeUp}>
          <TestimonialsSection />
        </motion.div>

        <motion.div {...sectionFadeUp}>
          <CTASection />
        </motion.div>
      </div>
    </Layout>
  );
}
