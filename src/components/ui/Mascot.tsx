"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Real-time morphing mascot.
 *
 * 9 pre-rendered look-direction frames + precomputed optical-flow fields
 * (public/mascot/flows.json) are combined in a WebGL shader that WARPS the
 * images along the flow while blending — her face physically travels as the
 * gaze parameter changes, instead of cross-dissolving.
 *
 * Motion model: damped springs chase the cursor for continuous real-time
 * movement; when the mouse settles, the parameter magnetically glides to the
 * nearest real frame so she always rests pixel-crisp. Idle mode wanders
 * node-to-node. Falls back to a static image with CSS tilt if WebGL fails.
 */

const IMG_W = 1086, IMG_H = 1402; // aligned frame size
const TEX_W = 543, TEX_H = 701; // GPU texture size
const FLOW_RANGE = 48; // px (half-res) encoded into flow texture bytes

const TURN_TAU = 0.25; // s, gaze damping (drives node choice + micro-tilt)
const TRANS_DUR = 0.26; // s, duration of one node-to-node head turn
const IDLE_AFTER = 3.0; // s before idle wander starts
const IDLE_EVERY = 2.8; // s between idle glances
const BREATH_PERIOD = 4.2; // s
const TILT_MAX = 5; // deg CSS micro-tilt

// grid order must match flows.json frame keys
const FRAME_NAMES = [
  "look_left_up", "look_up", "look_right_up",
  "look_left", "look_center", "look_right",
  "look_left_down", "look_down", "look_right_down",
];

type FlowBundle = {
  gw: number;
  gh: number;
  frames: Record<string, { fx: number[]; fy: number[] }>;
};

function buildShaders(gl: WebGL2RenderingContext) {
  const vs = `#version 300 es
  in vec2 a_pos;
  out vec2 v_uv;
  void main() {
    v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }`;

  const flowAt = `
  vec2 flowAt(float i, vec2 uv) {
    float v = (i + clamp(uv.y, 0.004, 0.996)) / 9.0;
    vec2 rg = texture(u_flow, vec2(uv.x, v)).rg;
    vec2 px = rg * ${(FLOW_RANGE * 2).toFixed(1)} - ${FLOW_RANGE.toFixed(1)};
    return px * vec2(${(2 / IMG_W).toFixed(8)}, ${(2 / IMG_H).toFixed(8)});
  }`;

  // u_wg: geometry weights (smooth — drive the warp field so the head
  //       physically travels). u_wc: color weights (sharpened — one crisp
  //       frame dominates, so the face never dissolves into a blur).
  const samples = Array.from({ length: 9 }, (_, i) => `
    { vec2 fl = flowAt(${i}.0, uv);
      F += u_wg[${i}] * fl; fls[${i}] = fl; }`).join("");
  const colors = Array.from({ length: 9 }, (_, i) => `
    col += u_wc[${i}] * texture(u_tex${i}, clamp(uv - F + fls[${i}], 0.0, 1.0));`).join("");
  const texDecls = Array.from({ length: 9 }, (_, i) => `uniform sampler2D u_tex${i};`).join("\n");

  const fs = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  out vec4 outColor;
  uniform sampler2D u_flow;
  ${texDecls}
  uniform float u_wg[9];
  uniform float u_wc[9];
  ${flowAt}
  void main() {
    vec2 uv = v_uv;
    vec2 fls[9];
    vec2 F = vec2(0.0);
    ${samples}
    vec4 col = vec4(0.0);
    ${colors}
    outColor = col;
  }`;

  function compile(type: number, src: string) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
    }
    return s;
  }

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) ?? "link error");
  }
  return prog;
}

export default function Mascot({ className = "" }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    let disposed = false;
    let last = performance.now();
    let lastMove = performance.now();
    // gaze follows the cursor; p is the displayed morph parameter (-1..1)
    let gxT = 0, gyT = 0; // raw target from pointer
    let gx = 0, gy = 0; // damped gaze
    let px = 0, py = 0; // displayed param
    let idleNextAt = 0;
    let idleNode: [number, number] = [0, 0];
    let webglOn = false;
    // node-to-node transition state
    let nodeX = 0, nodeY = 0; // current resting node (-1 | 0 | 1)
    let transT = 1; // transition progress, 1 = at rest
    let transFromX = 0, transFromY = 0;

    // gaze -1..1 -> node -1|0|1, with hysteresis so the choice
    // doesn't flicker when the cursor rides a boundary
    function nearestNode(g: number, current: number) {
      const HYST = 0.11;
      let n = g < -0.33 ? -1 : g < 0.33 ? 0 : 1;
      if (n !== current) {
        const edge = n > current ? (current === -1 ? -0.33 : 0.33) : (n === -1 ? -0.33 : 0.33);
        if (Math.abs(g - edge) < HYST) n = current;
      }
      return n;
    }

    function onPointerMove(e: PointerEvent) {
      const el = frameRef.current;
      if (!el) return;
      lastMove = performance.now();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 3;
      gxT = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
      gyT = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
    }

    // ---------- WebGL setup (async); CSS tilt runs regardless ----------
    let drawWeights: ((wg: Float32Array, wc: Float32Array) => void) | null = null;

    async function initGL() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true });
      if (!gl) return;

      const [flowRes, ...bitmaps] = await Promise.all([
        fetch("/mascot/flows.json").then((r) => r.json() as Promise<FlowBundle>),
        ...FRAME_NAMES.map((n) =>
          fetch(`/mascot/${n}.webp`)
            .then((r) => r.blob())
            .then((b) => createImageBitmap(b, { resizeWidth: TEX_W, resizeHeight: TEX_H })),
        ),
      ]);
      if (disposed) return;

      const { gw, gh } = flowRes;

      const prog = buildShaders(gl);
      gl.useProgram(prog);

      // fullscreen quad
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      // flow texture: 9 bands stacked vertically, RG = (flow + range) / (2*range)
      const flowTex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, flowTex);
      const flowData = new Uint8Array(gw * gh * 9 * 4);
      FRAME_NAMES.forEach((name, fi) => {
        const f = flowRes.frames[name];
        for (let i = 0; i < gw * gh; i++) {
          const o = (fi * gw * gh + i) * 4;
          flowData[o] = Math.max(0, Math.min(255, Math.round(((f.fx[i] + FLOW_RANGE) / (2 * FLOW_RANGE)) * 255)));
          flowData[o + 1] = Math.max(0, Math.min(255, Math.round(((f.fy[i] + FLOW_RANGE) / (2 * FLOW_RANGE)) * 255)));
          flowData[o + 3] = 255;
        }
      });
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gw, gh * 9, 0, gl.RGBA, gl.UNSIGNED_BYTE, flowData);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(prog, "u_flow"), 0);

      // frame textures
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      bitmaps.forEach((bmp, i) => {
        const tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1 + i);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(gl.getUniformLocation(prog, `u_tex${i}`), 1 + i);
        bmp.close();
      });

      const wgLoc = gl.getUniformLocation(prog, "u_wg");
      const wcLoc = gl.getUniformLocation(prog, "u_wc");

      // size the drawing buffer to the displayed size
      function resize() {
        const el = canvasRef.current;
        if (!el || !gl) return;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.round(el.clientWidth * dpr);
        const h = Math.round((el.clientWidth * (IMG_H / IMG_W)) * dpr);
        if (el.width !== w || el.height !== h) {
          el.width = w;
          el.height = h;
          gl.viewport(0, 0, w, h);
        }
      }
      resize();
      window.addEventListener("resize", resize);

      drawWeights = (wg: Float32Array, wc: Float32Array) => {
        resize();
        gl.uniform1fv(wgLoc, wg);
        gl.uniform1fv(wcLoc, wc);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      webglOn = true;
      if (fallbackRef.current) fallbackRef.current.style.opacity = "0";
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    }

    initGL().catch(() => {
      /* fallback image + CSS tilt keeps running */
    });

    // ---------- animation loop ----------
    const wg = new Float32Array(9); // geometry (warp) weights — smooth
    const wc = new Float32Array(9); // color weights — sharpened

    // smoothstep: head accelerates through the middle of a turn,
    // settles gently at each look — like a real head movement
    const easeG = (t: number) => t * t * (3 - 2 * t);
    // texture hand-off confined to the middle band of the turn
    const easeC = (t: number) => {
      const s = Math.max(0, Math.min(1, (t - 0.32) / 0.36));
      return s * s * (3 - 2 * s);
    };

    function bilinear(out: Float32Array, fx: number, fy: number, ease: (t: number) => number) {
      const x0 = Math.min(1, Math.floor(fx));
      const y0 = Math.min(1, Math.floor(fy));
      const wx = ease(fx - x0);
      const wy = ease(fy - y0);
      out.fill(0);
      out[y0 * 3 + x0] = (1 - wx) * (1 - wy);
      out[y0 * 3 + x0 + 1] = wx * (1 - wy);
      out[(y0 + 1) * 3 + x0] = (1 - wx) * wy;
      out[(y0 + 1) * 3 + x0 + 1] = wx * wy;
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const quiet = (now - lastMove) / 1000;

      // idle: glance node-to-node so rests stay crisp
      if (quiet > IDLE_AFTER) {
        if (t > idleNextAt) {
          const nodes: [number, number][] = [
            [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [0, 0], [0.0, 1],
          ];
          idleNode = nodes[Math.floor((t * 7919) % nodes.length)];
          idleNextAt = t + IDLE_EVERY;
        }
        gxT = idleNode[0];
        gyT = idleNode[1];
      }

      // damped gaze chases the target (drives node choice + micro-tilt)
      const k = 1 - Math.exp(-dt / TURN_TAU);
      gx += (gxT - gx) * k;
      gy += (gyT - gy) * k;

      // Displayed pose is ALWAYS one of the 9 real frames; changing looks is
      // a brief animated head-turn between nodes. She never dwells at a
      // synthesized in-between angle.
      const wantX = nearestNode(gx, nodeX);
      const wantY = nearestNode(gy, nodeY);
      if ((wantX !== nodeX || wantY !== nodeY) && transT >= 1) {
        transFromX = px;
        transFromY = py;
        nodeX = wantX;
        nodeY = wantY;
        transT = 0;
      }
      if (transT < 1) {
        transT = Math.min(1, transT + dt / TRANS_DUR);
        const e = transT * transT * (3 - 2 * transT);
        px = transFromX + (nodeX - transFromX) * e;
        py = transFromY + (nodeY - transFromY) * e;
      } else {
        px = nodeX;
        py = nodeY;
      }

      // weights over the 3x3 grid: smooth for geometry, sharpened for color
      if (webglOn && drawWeights) {
        const fx = Math.max(0, Math.min(2, px + 1));
        const fy = Math.max(0, Math.min(2, py + 1));
        bilinear(wg, fx, fy, easeG);
        bilinear(wc, fx, fy, easeC);
        drawWeights(wg, wc);
      }

      // continuous micro-motion follows the cursor at all times (gx/gy),
      // keeping her alive between the discrete head turns
      const breath = Math.sin((t * Math.PI * 2) / BREATH_PERIOD);
      const inner = innerRef.current;
      if (inner) {
        inner.style.transform =
          `rotateY(${(gx * TILT_MAX).toFixed(2)}deg) ` +
          `rotateX(${(-gy * TILT_MAX * 0.4 + breath * 0.4).toFixed(2)}deg) ` +
          `translate3d(${(gx * 3).toFixed(1)}px, ${(breath * 3.5).toFixed(1)}px, 0)`;
      }
      const shadow = shadowRef.current;
      if (shadow) {
        shadow.style.transform = `translateX(${(-px * 8).toFixed(1)}px)`;
      }

      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onPointerMove);
    raf = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className={`relative select-none ${className}`}
      style={{ perspective: "900px" }}
    >
      <div ref={innerRef} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
        {/* fallback: static center frame with CSS tilt (WebGL off / loading) */}
        <Image
          ref={fallbackRef}
          src="/mascot/look_center.webp"
          alt="Srushti's 3D mascot"
          width={543}
          height={701}
          priority
          draggable={false}
          className="w-full h-auto transition-opacity duration-300"
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 w-full transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
      </div>
      <div
        ref={shadowRef}
        aria-hidden
        className="absolute -bottom-3 left-1/2 -ml-[35%] w-[70%] h-6 rounded-[50%] bg-black/25 dark:bg-black/50 blur-md"
      />
    </div>
  );
}
