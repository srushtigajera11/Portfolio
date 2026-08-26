"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stats } from "@/data/site";
import Reveal from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

const TECH = [
  "React", "Node.js", "MongoDB", "Express", "TypeScript", "Next.js",
  "Tailwind", "JWT", "REST APIs", "Git", "Razorpay", "SQL",
];

export default function Story() {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = statsRef.current;
    if (!root) return;
    const nums = root.querySelectorAll<HTMLElement>("[data-count]");
    const tweens: gsap.core.Tween[] = [];
    nums.forEach((el) => {
      const target = parseFloat(el.dataset.count ?? "0");
      const decimals = parseInt(el.dataset.decimals ?? "0", 10);
      const obj = { v: 0 };
      tweens.push(
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = obj.v.toFixed(decimals) + (el.dataset.suffix ?? "");
          },
        }),
      );
    });
    return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  }, []);

  return (
    <section className="relative py-28">
      {/* tech marquee */}
      <div className="overflow-hidden border-y border-cream/10 py-4 mb-24 select-none">
        <div className="marquee-track flex gap-10 w-max text-mist/50 text-sm uppercase tracking-widest">
          {[...TECH, ...TECH].map((t, i) => (
            <span key={i} className="flex items-center gap-10">
              {t} <span className="text-amber/60">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">
        <Reveal>
          <p className="display text-3xl sm:text-5xl leading-tight text-cream">
            I don&apos;t just write code —
            <br />
            <span className="text-mist">I build things people</span>
            <br />
            <span className="text-amber">actually use.</span>
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-8 text-mist max-w-xl mx-auto leading-relaxed">
            Working MERN stack developer, currently building something on the
            side that even she can&apos;t fully explain
            yet — that&apos;s how the good ones start. Fluent in React, Node, and
            explaining why the bug was &quot;actually a feature&quot;. Payment gateways,
            auth flows, REST APIs — and the occasional 2 a.m. fix that turned
            out to be a missing comma.
          </p>
        </Reveal>
      </div>

      <div ref={statsRef} className="max-w-5xl mx-auto px-6 mt-24 grid grid-cols-2 md:grid-cols-4 gap-px bg-cream/10 rounded-2xl overflow-hidden">
        {stats.map((s) => (
          <div key={s.label} className="bg-ink p-8 text-center">
            <div
              className="display text-4xl sm:text-5xl text-amber"
              data-count={s.value}
              data-decimals={s.decimals}
              data-suffix={s.suffix}
            >
              0
            </div>
            <div className="text-xs text-mist mt-2 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
