"use client";

import { useEffect, useRef } from "react";

/**
 * Full-page interactive dot matrix. A grid of dots sits behind the content;
 * dots near the cursor get pushed away, brighten toward amber, and spring
 * back — the whole page feels alive without stealing attention.
 */

const SPACING = 34; // px between dots
const RADIUS = 130; // cursor influence radius
const PUSH = 22; // max displacement
const BASE_ALPHA = 0.14;

export default function DotMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0, cols = 0, rows = 0;
    let mx = -9999, my = -9999;
    // per-dot displaced offsets (for spring-back)
    let ox: Float32Array = new Float32Array(0);
    let oy: Float32Array = new Float32Array(0);

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / SPACING) + 1;
      rows = Math.ceil(h / SPACING) + 1;
      ox = new Float32Array(cols * rows);
      oy = new Float32Array(cols * rows);
    }

    function onMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
    }
    function onLeave() {
      mx = -9999;
      my = -9999;
    }

    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const r2 = RADIUS * RADIUS;

      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const i = gy * cols + gx;
          const bx = gx * SPACING;
          const by = gy * SPACING;

          const dx = bx - mx;
          const dy = by - my;
          const d2 = dx * dx + dy * dy;

          let tx = 0, ty = 0, glow = 0;
          if (d2 < r2) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / RADIUS; // 0..1
            const push = f * f * PUSH;
            tx = (dx / d) * push;
            ty = (dy / d) * push;
            glow = f;
          }
          // spring toward target offset
          ox[i] += (tx - ox[i]) * 0.14;
          oy[i] += (ty - oy[i]) * 0.14;

          const a = BASE_ALPHA + glow * 0.5;
          const size = 1.1 + glow * 1.6;
          ctx.fillStyle =
            glow > 0.05
              ? `rgba(234, 200, 110, ${a})`
              : `rgba(242, 232, 213, ${a})`;
          ctx.beginPath();
          ctx.arc(bx + ox[i], by + oy[i], size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
