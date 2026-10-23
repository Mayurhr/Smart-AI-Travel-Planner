import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 240;

export interface AirplaneCanvasProps {
  mode?: 'airplane' | 'earth';
}

/**
 * Scroll-driven fullscreen canvas animation.
 * Loads /frames/*.webp (paper airplane) or /frames_earth/*.webp (3D earth).
 * Fixed position — renders behind all page content. Only mount when on landing page.
 */
export const AirplaneCanvas: React.FC<AirplaneCanvasProps> = ({ mode = 'airplane' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    const loaded: boolean[] = new Array(TOTAL_FRAMES).fill(false);

    let targetFrame = 0;
    let currentFrame = 0;
    let lastRenderedIndex = -1;
    let animId: number;
    let isAnimating = false;

    const frameFolder = mode === 'earth' ? '/frames_earth' : '/frames';

    const getFramePath = (index: number) => {
      const frameNum = String(index + 1).padStart(4, '0');
      return `${frameFolder}/frame_${frameNum}.webp`;
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      lastRenderedIndex = -1;
      const active = Math.min(Math.max(Math.round(currentFrame), 0), TOTAL_FRAMES - 1);
      drawFrame(active);
    };

    const renderImageToCanvas = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;
      ctx.fillStyle = mode === 'earth' ? '#000000' : '#0b1528';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, sx, sy, sw, sh);
    };

    const getNearestLoadedFrame = (preferredIndex: number): number | null => {
      if (loaded[preferredIndex] && images[preferredIndex]) return preferredIndex;
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = preferredIndex - offset;
        if (prev >= 0 && loaded[prev] && images[prev]) return prev;
        const next = preferredIndex + offset;
        if (next < TOTAL_FRAMES && loaded[next] && images[next]) return next;
      }
      return null;
    };

    const drawFrame = (index: number) => {
      const activeIndex = getNearestLoadedFrame(index);
      if (activeIndex === null || activeIndex === lastRenderedIndex) return;
      const img = images[activeIndex];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      renderImageToCanvas(img);
      lastRenderedIndex = activeIndex;
    };

    const calculateTargetFrame = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      ) - window.innerHeight;
      if (maxScroll <= 0) return 0;
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      return progress * (TOTAL_FRAMES - 1);
    };

    const animationLoop = () => {
      const diff = targetFrame - currentFrame;
      if (Math.abs(diff) > 0.002) {
        currentFrame += diff * 0.15;
        drawFrame(Math.round(currentFrame));
        animId = requestAnimationFrame(animationLoop);
      } else {
        currentFrame = targetFrame;
        drawFrame(Math.round(currentFrame));
        isAnimating = false;
      }
    };

    const onScroll = () => {
      targetFrame = calculateTargetFrame();
      if (!isAnimating) {
        isAnimating = true;
        animId = requestAnimationFrame(animationLoop);
      }
    };

    // Immediately preload frame 0
    const firstImg = new Image();
    firstImg.onload = () => {
      loaded[0] = true;
      images[0] = firstImg;
      drawFrame(0);
    };
    firstImg.src = getFramePath(0);
    images[0] = firstImg;

    // Preload remaining frames
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameIdx = i;
      img.onload = () => {
        loaded[frameIdx] = true;
        images[frameIdx] = img;
        const needed = Math.round(currentFrame);
        if (needed === frameIdx || lastRenderedIndex === -1) drawFrame(needed);
      };
      img.src = getFramePath(frameIdx);
      images[frameIdx] = img;
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    resizeCanvas();
    targetFrame = calculateTargetFrame();
    currentFrame = targetFrame;
    drawFrame(Math.round(currentFrame));

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', onScroll);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [mode]);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="animation-canvas"
        className="fixed inset-0 w-screen h-screen pointer-events-none bg-[#0b1528] block"
        style={{ zIndex: 0 }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1, background: 'radial-gradient(circle at top, rgba(255,255,255,0.03), rgba(11,21,40,0.4))' }}
      />
    </>
  );
};
