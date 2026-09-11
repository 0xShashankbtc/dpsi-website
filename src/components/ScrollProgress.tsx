import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 35,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[90] pointer-events-none">
      <motion.div
        className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 origin-left shadow-[0_0_12px_rgba(16,185,129,0.8),0_0_24px_rgba(52,211,153,0.4)]"
        style={{ scaleX }}
      />
    </div>
  );
}