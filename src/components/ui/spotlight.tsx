'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useSpring, useTransform, type SpringOptions } from 'framer-motion';
import { cn } from '@/lib/utils';

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
  fill?: string;
};

export function Spotlight({
  className,
  size = 200,
  springOptions = { bounce: 0 },
  fill,
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        parent.style.position = 'relative';
        parent.style.overflow = 'hidden';
        setParentElement(parent);
      }
    }
  }, []);

  const rectRef = useRef<{ left: number; top: number } | null>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (parentElement) {
      const rect = parentElement.getBoundingClientRect();
      rectRef.current = { left: rect.left, top: rect.top };
    }
  }, [parentElement]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rectRef.current = null;
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!rectRef.current && parentElement) {
        const rect = parentElement.getBoundingClientRect();
        rectRef.current = { left: rect.left, top: rect.top };
      }
      if (!rectRef.current) return;

      const clientX = event.clientX;
      const clientY = event.clientY;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (!rectRef.current) return;
        mouseX.set(clientX - rectRef.current.left);
        mouseY.set(clientY - rectRef.current.top);
      });
    },
    [mouseX, mouseY, parentElement]
  );

  useEffect(() => {
    if (!parentElement) return;

    parentElement.addEventListener('mousemove', handleMouseMove, { passive: true });
    parentElement.addEventListener('mouseenter', handleMouseEnter);
    parentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove);
      parentElement.removeEventListener('mouseenter', handleMouseEnter);
      parentElement.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [parentElement, handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_80%)] blur-xl transition-opacity duration-200',
        'from-zinc-50 via-zinc-100 to-zinc-200',
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        background: fill ? `radial-gradient(circle at center, ${fill}, transparent 80%)` : undefined,
      }}
    />
  );
}
