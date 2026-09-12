"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Color from "color-bits";

// Helper function to convert any CSS color to rgba
export const getRGBA = (
  cssColor: React.CSSProperties["color"],
  fallback: string = "rgba(180, 180, 180, 1)",
): string => {
  if (typeof window === "undefined") return fallback;
  if (!cssColor) return fallback;

  try {
    if (typeof cssColor === "string" && cssColor.startsWith("var(")) {
      const element = document.createElement("div");
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return Color.formatRGBA(Color.parse(computedColor));
    }

    return Color.formatRGBA(Color.parse(cssColor));
  } catch {
    return fallback;
  }
};

// Helper function to add opacity to an RGB color string
export const colorWithOpacity = (color: string, opacity: number): string => {
  if (!color.startsWith("rgb")) return color;
  try {
    return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
  } catch {
    return color;
  }
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number | string;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 3,
  gridGap = 3,
  flickerChance = 0.2,
  color = "#B4B4B4",
  width,
  height,
  className,
  maxOpacity = 0.15,
  text = "",
  fontSize = 140,
  fontWeight = 600,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    return getRGBA(color);
  }, [color]);

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      textMask: Uint8Array,
      offsetX: number,
      offsetY: number,
      step: number,
      squareSide: number,
    ) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        const colIdx = i * rows;
        const x = offsetX + i * step;

        for (let j = 0; j < rows; j++) {
          const idx = colIdx + j;
          const hasText = textMask[idx] === 1;
          const opacity = squares[idx];
          const finalOpacity = hasText
            ? Math.min(1, opacity * 2.2 + 0.45)
            : opacity;

          const y = offsetY + j * step;
          ctx.fillStyle = colorWithOpacity(memoizedColor, finalOpacity);
          ctx.fillRect(x, y, squareSide, squareSide);
        }
      }
    },
    [memoizedColor],
  );

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvasWidth = Math.floor(width * dpr);
      const canvasHeight = Math.floor(height * dpr);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const step = (squareSize + gridGap) * dpr;
      const squareSide = squareSize * dpr;
      const cols = Math.floor(canvasWidth / step);
      const rows = Math.floor(canvasHeight / step);

      const totalGridWidth = cols * step - gridGap * dpr;
      const totalGridHeight = rows * step - gridGap * dpr;
      const offsetX = Math.max(0, Math.floor((canvasWidth - totalGridWidth) / 2));
      const offsetY = Math.max(0, Math.floor((canvasHeight - totalGridHeight) / 2));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      const textMask = new Uint8Array(cols * rows);
      if (text && cols > 0 && rows > 0) {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = canvasWidth;
        maskCanvas.height = canvasHeight;
        const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
        if (maskCtx) {
          maskCtx.fillStyle = "black";
          maskCtx.fillRect(0, 0, canvasWidth, canvasHeight);

          maskCtx.fillStyle = "white";
          let effectiveFontSize = fontSize * dpr;
          const fontFamily = `"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          maskCtx.font = `${fontWeight} ${effectiveFontSize}px ${fontFamily}`;
          const textMetrics = maskCtx.measureText(text);
          const maxTextWidth = canvasWidth * 0.94;
          if (textMetrics.width > maxTextWidth && textMetrics.width > 0) {
            effectiveFontSize = Math.max(16 * dpr, Math.floor(effectiveFontSize * (maxTextWidth / textMetrics.width)));
            maskCtx.font = `${fontWeight} ${effectiveFontSize}px ${fontFamily}`;
          }

          maskCtx.textAlign = "center";
          maskCtx.textBaseline = "middle";
          maskCtx.fillText(text, canvasWidth / 2, canvasHeight / 2);

          const imgData = maskCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;
          for (let i = 0; i < cols; i++) {
            const colIdx = i * rows;
            for (let j = 0; j < rows; j++) {
              const centerX = Math.floor(offsetX + i * step + squareSide / 2);
              const centerY = Math.floor(offsetY + j * step + squareSide / 2);
              if (centerX < canvasWidth && centerY < canvasHeight) {
                const pixelIndex = (centerY * canvasWidth + centerX) * 4;
                if (imgData[pixelIndex] > 40) {
                  textMask[colIdx + j] = 1;
                }
              }
            }
          }
        }
      }

      return {
        cols,
        rows,
        squares,
        textMask,
        offsetX,
        offsetY,
        step,
        squareSide,
        dpr,
      };
    },
    [squareSize, gridGap, maxOpacity, text, fontSize, fontWeight],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      if (gridParams) {
        updateSquares(gridParams.squares, deltaTime);
        drawGrid(
          ctx,
          canvas.width,
          canvas.height,
          gridParams.cols,
          gridParams.rows,
          gridParams.squares,
          gridParams.textMask,
          gridParams.offsetX,
          gridParams.offsetY,
          gridParams.step,
          gridParams.squareSide,
        );
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${className || ""}`}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function checkQuery() {
      const result = window.matchMedia(query);
      setValue(result.matches);
    }

    checkQuery();

    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", checkQuery);

    return () => {
      mediaQuery.removeEventListener("change", checkQuery);
    };
  }, [query]);

  return value;
}
