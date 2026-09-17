'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function cx(...parts: Array<string | undefined | false | null>): string {
  return parts.filter(Boolean).join(' ');
}

export interface FlowSectionProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  'aria-label'?: string;
}

export const FlowSection: React.FC<FlowSectionProps> = ({
  className,
  style = {},
  children,
  'aria-label': ariaLabel,
}) => (
  <section
    data-flow-section
    aria-label={ariaLabel}
    className={cx('relative min-h-[100dvh] w-full overflow-visible border-0 outline-none', className)}
  >
    <div
      data-flow-inner
      className={cx(
        'flow-art-container relative flex min-h-[100dvh] w-full flex-col justify-between gap-3 sm:gap-6 px-3 sm:px-6 md:px-[4vw] pt-3 sm:pt-6 md:pt-[clamp(2rem,8vw,4vw)] pb-3 sm:pb-6 md:pb-[4vw] border-0 outline-none shadow-[0_-8px_30px_rgba(0,0,0,0.12),0_16px_32px_rgba(0,0,0,0.08)] ring-1 ring-black/5 dark:ring-white/10 rounded-2xl sm:rounded-3xl',
        'transform-gpu',
      )}
      style={{
        transformOrigin: 'bottom left',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  </section>
);

export interface FlowArtProps {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

const childCount = (children: React.ReactNode) => React.Children.count(children);

export const FlowArt: React.FC<FlowArtProps> = ({
  as: Component = 'div',
  children,
  className,
  'aria-label': ariaLabel = 'Story scroll',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Sync GSAP ScrollTrigger with Lenis smooth scroll if active
  useEffect(() => {
    if (typeof window === 'undefined' || !window.__lenis) return;
    const updateScrollTrigger = () => {
      ScrollTrigger.update();
    };
    window.__lenis.on('scroll', updateScrollTrigger);
    return () => {
      window.__lenis?.off('scroll', updateScrollTrigger);
    };
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return;

      const sections = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>('[data-flow-section]'),
      );
      if (sections.length === 0) return;

      // Prevent mobile address bar collapse from thrashing ScrollTrigger
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      });

      const isMobile =
        typeof window !== 'undefined' && window.innerWidth < 768;

      // Calibrated rotation angle: 6° on mobile for responsive 3D card tilt without clipping or lag; 14° on desktop for elegant card fan effect
      const rotationAngle = isMobile ? 6 : 14;
      const triggers: ScrollTrigger[] = [];

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });

        const inner = section.querySelector<HTMLElement>('.flow-art-container');
        if (!inner) return;

        // Animate non-first cards: enter tilted and smoothly rotate flat as they stack over the previous card
        if (i > 0) {
          gsap.set(inner, {
            rotation: rotationAngle,
            transformOrigin: 'bottom left',
            force3D: true,
          });

          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: isMobile ? 'top 10%' : 'top 20%',
              scrub: isMobile ? 0.05 : true,
              fastScrollEnd: true,
              preventOverlaps: true,
              invalidateOnRefresh: true,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        // Viewport pinning for all cards except the last one (enabling 3D card stack on both mobile & desktop)
        if (i < sections.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: 'bottom bottom',
              end: 'bottom top',
              pin: true,
              pinSpacing: false,
              anticipatePin: 0,
              fastScrollEnd: true,
              preventOverlaps: true,
              invalidateOnRefresh: true,
            }),
          );
        }
      });

      ScrollTrigger.refresh();
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);

      let resizeTimer: any = null;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 200);
      };
      window.addEventListener('resize', handleResize, { passive: true });
      window.addEventListener('orientationchange', handleResize, { passive: true });

      return () => {
        clearTimeout(timer);
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        triggers.forEach((t) => {
          t.kill(true);
        });
      };
    },
    { scope: containerRef, dependencies: [childCount(children), reducedMotion] },
  );

  return (
    <Component
      ref={containerRef}
      aria-label={ariaLabel}
      className={cx('relative w-full overflow-x-clip', className)}
    >
      {children}
    </Component>
  );
};

export default FlowArt;
