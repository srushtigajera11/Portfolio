"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/data/projects";
import Reveal from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * Card deck: each project is dealt onto a sticky pile as you scroll —
 * it slides up, lands with its own slight tilt, and the card underneath
 * sinks back and dims. Like polaroids tossed on a table.
 */

// deterministic "messy pile" tilts (Math.random would break hydration)
const TILTS = [-2.4, 1.8, -1.4, 2.6, -2, 1.2];

export default function Showcase() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const cards = Array.from(wrap.querySelectorAll<HTMLElement>("[data-card]"));
    const tweens: gsap.core.Tween[] = [];

    cards.forEach((card, i) => {
      // entrance: rise + straighten into its resting tilt
      tweens.push(
        gsap.fromTo(
          card,
          { y: 120, rotate: TILTS[i % TILTS.length] * 3, scale: 1.04 },
          {
            y: 0,
            rotate: TILTS[i % TILTS.length],
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card.parentElement,
              start: "top bottom",
              end: "top center",
              scrub: 0.4,
            },
          },
        ),
      );
      // exit: sink back + dim while the next card lands on top
      if (i < cards.length - 1) {
        tweens.push(
          gsap.fromTo(
            card,
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.92,
              filter: "brightness(0.45)",
              ease: "none",
              scrollTrigger: {
                trigger: cards[i + 1].parentElement,
                start: "top bottom",
                end: "top center",
                scrub: 0.4,
              },
            },
          ),
        );
      }
    });

    return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  }, []);

  return (
    <section id="work" className="relative py-28">
      <div className="max-w-5xl mx-auto px-6 mb-4">
        <Reveal>
          <h2 className="display text-4xl sm:text-6xl text-cream">
            The <span className="outline-text">deck</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-mist text-sm mt-3 mb-8">
            Six projects, dealt one at a time. Scroll to see the hand I&apos;m playing.
          </p>
        </Reveal>
      </div>

      <div ref={wrapRef}>
        {projects.map((p, i) => (
          <div key={p.title} className="sticky top-[18vh] px-4 sm:px-6 pb-[8vh]">
            <article
              data-card
              className="max-w-2xl mx-auto bg-ink-soft border border-cream/15 rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.55)] will-change-transform"
              style={{ transformOrigin: "50% 100%" }}
            >
              <div className="grid md:grid-cols-[1fr_1.1fr]">
                <div className="relative">
                  <Image
                    src={p.image}
                    alt={p.title}
                    width={640}
                    height={360}
                    className="w-full h-40 md:h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 display text-xs text-ink bg-amber rounded-full px-2.5 py-0.5">
                    {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="p-5 md:p-6 flex flex-col">
                  <h3 className="display text-xl md:text-2xl text-cream">{p.title}</h3>
                  <p className="text-sm text-mist mt-2 leading-relaxed flex-1 line-clamp-3">
                    {p.description}
                  </p>
                  <ul className="flex flex-wrap gap-1.5 mt-4 text-xs text-mist">
                    {p.stack.slice(0, 5).map((t) => (
                      <li key={t} className="border border-cream/15 rounded-full px-2 py-0.5">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex gap-5 text-sm">
                    <a
                      href={p.repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber hover:text-cream transition-colors font-medium"
                    >
                      Repository ↗
                    </a>
                    {p.liveLink && (
                      <a
                        href={p.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber hover:text-cream transition-colors font-medium"
                      >
                        Live ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
