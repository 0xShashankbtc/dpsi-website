import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import AnnouncementsBar from "@/sections/AnnouncementsBar";
import QuickStats from "@/sections/QuickStats";
import NewsHighlights from "@/sections/NewsHighlights";
import PrincipalMessage from "@/sections/PrincipalMessage";
import AchievementsSection from "@/sections/AchievementsSection";
import VideoGallerySection from "@/sections/VideoGallerySection";
import TestimonialsSection from "@/sections/TestimonialsSection";
import CTASection from "@/sections/CTASection";
import { SplineSceneBasic } from "@/components/ui/demo";
import { trpc } from "@/providers/trpc";
import {
  Bot,
  Cpu,
  Rocket,
  Sparkles,
  Code,
  GraduationCap,
  Laptop,
  Microscope,
  Atom,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";


const ICON_MAP: Record<string, LucideIcon> = {
  Bot,
  Cpu,
  Rocket,
  Sparkles,
  Code,
  GraduationCap,
  Laptop,
  Microscope,
  Atom,
  Globe,
};

export default function Home2() {
  const { data: featureCards } = trpc.cms.listFeatureCards.useQuery(undefined, {
    staleTime: 60000,
  });

  const cards = featureCards?.filter((c: any) => c.isActive && !c.isDeleted) || [];

  return (
    <Layout>
      <AnnouncementsBar />
      
      {/* UNBOXED GIANT 3D ROBOTICS HERO SECTION */}
      <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50/80 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white border-b border-sky-200/50 dark:border-slate-800 relative overflow-hidden">
        {/* Ambient Top Glow Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Giant Unboxed Spline 3D Component */}
          <SplineSceneBasic />

          {/* Quick 3D Tech Feature Highlights */}
          {cards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8 lg:mt-12">
              {cards.map((card: any, idx: number) => {
                const IconComponent = ICON_MAP[card.icon] || Bot;
                return (
                  <motion.div
                    key={card._id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-sky-200/80 dark:border-slate-800 shadow-lg backdrop-blur-xl flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{card.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{card.description || card.category}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>


      {/* CORE WEBSITE SECTIONS */}
      <QuickStats />
      <NewsHighlights />
      <PrincipalMessage />
      <AchievementsSection />
      <VideoGallerySection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
}
