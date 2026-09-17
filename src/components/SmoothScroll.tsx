import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect reduced motion accessibility
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    // Touch devices (iOS Safari, Android Chrome) have native hardware-accelerated
    // 120Hz/60Hz momentum scrolling. Bypassing Lenis on touch prevents fighting native
    // fling elasticity and delivers zero input latency.
    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      // Native anchor link click handler for touch devices
      const handleAnchorClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement)?.closest("a");
        if (!target) return;
        const href = target.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) {
          const targetElement = document.querySelector(href);
          if (targetElement) {
            e.preventDefault();
            const top = (targetElement as HTMLElement).getBoundingClientRect().top + window.scrollY - 85;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
          }
        }
      };
      document.addEventListener("click", handleAnchorClick, { passive: false });
      return () => {
        document.removeEventListener("click", handleAnchorClick);
      };
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3), // Silky cubic deceleration curve
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 0,
      syncTouch: false,
      infinite: false,
    });

    window.__lenis = lenis;

    // Synchronize Lenis scroll ticks with GSAP ScrollTrigger
    const handleLenisScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleLenisScroll);

    // Drive Lenis via GSAP's central ticker so both render on the exact same frame clock
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);

    // Disable GSAP lag smoothing to eliminate catch-up hitching/rubber-banding during scroll
    gsap.ticker.lagSmoothing(0);

    // Toggle .is-scrolling class on documentElement so heavy WebGL/shaders can throttle during scroll
    let scrollTimeout: any = null;
    const handleScrollActivity = () => {
      document.documentElement.classList.add("is-scrolling");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 150);
    };
    lenis.on("scroll", handleScrollActivity);

    // Smooth anchor link click handler for desktop Lenis
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement as HTMLElement, {
            offset: -85,
            duration: 1.1,
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { passive: false });

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      lenis.off("scroll", handleScrollActivity);
      lenis.off("scroll", handleLenisScroll);
      clearTimeout(scrollTimeout);
      document.documentElement.classList.remove("is-scrolling");
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
