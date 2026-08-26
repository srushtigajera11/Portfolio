"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journey } from "@/data/journey";
import Reveal from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

export default function Journey() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const tween = gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: line.parentElement,
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.5,
        },
      },
    );
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);

  return (
    <section id="journey" className="py-28">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <h2 className="display text-4xl sm:text-6xl text-cream mb-20">
            The <span className="outline-text">journey</span> so far
          </h2>
        </Reveal>

        <div className="relative pl-10">
          {/* the line that draws itself */}
          <div
            ref={lineRef}
            className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-amber via-amber/60 to-denim origin-top"
          />
          <div className="space-y-16">
            {journey.map((stop, i) => (
              <Reveal key={stop.title} delay={i * 0.05}>
                <div className="relative">
                  <span className="absolute -left-10 top-1.5 w-4 h-4 rounded-full border-2 border-amber bg-ink" />
                  <div className="text-xs uppercase tracking-widest text-amber mb-1">
                    {stop.period}
                  </div>
                  <h3 className="display text-2xl text-cream">{stop.title}</h3>
                  <div className="text-sm text-denim mt-0.5">{stop.place}</div>
                  <ul className="mt-3 space-y-1.5 text-sm text-mist leading-relaxed">
                    {stop.points.map((pt) => (
                      <li key={pt}>— {pt}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
