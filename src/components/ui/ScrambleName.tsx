"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

const CHARS = "SRUHTIGAJE#@%&{}</>*";

/**
 * The name decodes out of glyph noise on load, and re-scrambles
 * on hover — because a static <h1> is for other portfolios.
 */
export default function ScrambleName({
  first,
  last,
}: {
  first: string;
  last: string;
}) {
  const firstRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  function play(duration = 1.4) {
    const f = firstRef.current;
    const l = lastRef.current;
    if (!f || !l || busy.current) return;
    busy.current = true;
    gsap.to(f, {
      duration,
      scrambleText: { text: first, chars: CHARS, speed: 0.4 },
      ease: "none",
    });
    gsap.to(l, {
      duration: duration + 0.35,
      scrambleText: { text: last, chars: CHARS, speed: 0.4 },
      ease: "none",
      onComplete: () => { busy.current = false; },
    });
  }

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    play(1.6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <h1
      className="display text-5xl sm:text-7xl lg:text-8xl text-cream mt-3 cursor-default"
      onMouseEnter={() => play(0.8)}
      aria-label={`${first} ${last}`}
    >
      <span ref={firstRef} aria-hidden>{first}</span>
      <br />
      <span ref={lastRef} aria-hidden className="text-amber">{last}</span>
    </h1>
  );
}
