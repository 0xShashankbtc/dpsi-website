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
        'flow-art-container relative flex min-h-[100dvh] w-full flex-col justify-between gap-3 sm:gap-6 px-3 sm:px-6 md:px-[4vw] pt-3 sm:pt-6 md:pt-[clamp(2rem,8vw,4vw)] pb-3 sm:pb-6 md:pb-[4vw] border-0 outline-none shadow-[0_-20px_50px_rgba(0,0,0,0.4),0_25px_50px_rgba(0,0,0,0.3)]',
        'will-change-transform transform-gpu',
      )}
      style={{ transformOrigin: 'bottom left', ...style }}
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
      ScrollTrigger.config({ ignoreMobileResize: true });

      const isMobile =
        typeof window !== 'undefined' && window.innerWidth < 768;

      // Calibrated rotation angle: 18° on mobile for high-impact 3D card tilt without overflow; 30° on desktop
      const rotationAngle = isMobile ? 18 : 30;
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
            willChange: 'transform',
          });

          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: isMobile ? 'top 15%' : 'top 25%',
              scrub: isMobile ? 0.3 : true,
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
              anticipatePin: 1,
              invalidateOnRefresh: true,
            }),
          );
        }
      });

      ScrollTrigger.refresh();
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);

      const handleResize = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener('resize', handleResize, { passive: true });
      window.addEventListener('orientationchange', handleResize, { passive: true });

      return () => {
        clearTimeout(timer);
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
