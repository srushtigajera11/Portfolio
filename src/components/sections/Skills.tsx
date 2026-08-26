"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { skillGroups, type Skill } from "@/data/skills";
import Reveal from "@/components/ui/Reveal";

/**
 * Gravity playground: every skill is a physics body that drops into a pit
 * when the section scrolls into view. Grab them, throw them, stack them —
 * matter-js does the rest.
 */

const COLORS = [
  // amber candy
  "text-ink bg-gradient-to-b from-[#f6dc96] via-[#eac86e] to-[#c9963a] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-2px_6px_rgba(120,70,10,0.35),0_10px_24px_rgba(234,200,110,0.25)]",
  // glossy charcoal
  "text-cream bg-gradient-to-b from-[#2e2e34] via-[#1c1c20] to-[#101012] ring-1 ring-cream/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_24px_rgba(0,0,0,0.5)]",
  // denim candy
  "text-ink bg-gradient-to-b from-[#b7cfe8] via-[#7c9cbf] to-[#54749a] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_6px_rgba(20,40,70,0.4),0_10px_24px_rgba(124,156,191,0.25)]",
];

interface Pill extends Skill {
  color: string;
}

const PILLS: Pill[] = skillGroups.flatMap((g, gi) =>
  g.items.map((s) => ({ ...s, color: COLORS[gi % COLORS.length] })),
);

export default function Skills() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // static pills are fine

    const W = arena.clientWidth;
    const H = arena.clientHeight;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.1 } });
    const world = engine.world;

    // walls: floor + sides (ceiling far above so throws can fly)
    const wallOpts = { isStatic: true, friction: 0.3 };
    Matter.Composite.add(world, [
      Matter.Bodies.rectangle(W / 2, H + 30, W * 2, 60, wallOpts),
      Matter.Bodies.rectangle(-30, H / 2 - 400, 60, H + 900, wallOpts),
      Matter.Bodies.rectangle(W + 30, H / 2 - 400, 60, H + 900, wallOpts),
      Matter.Bodies.rectangle(W / 2, -520, W * 2, 60, wallOpts),
    ]);

    // one body per pill, sized to its DOM element
    const bodies: Matter.Body[] = [];
    pillRefs.current.forEach((el, i) => {
      if (!el) return;
      const bw = el.offsetWidth;
      const bh = el.offsetHeight;
      const body = Matter.Bodies.rectangle(
        40 + Math.random() * (W - 80),
        -80 - i * 46 - Math.random() * 120,
        bw,
        bh,
        {
          chamfer: { radius: bh / 2 },
          restitution: 0.45,
          friction: 0.25,
          frictionAir: 0.012,
          angle: (Math.random() - 0.5) * 0.6,
        },
      );
      bodies.push(body);
    });
    Matter.Composite.add(world, bodies);

    // sync DOM to physics
    let raf = 0;
    function sync() {
      for (let i = 0; i < bodies.length; i++) {
        const el = pillRefs.current[i];
        if (!el) continue;
        const b = bodies[i];
        el.style.transform = `translate(${b.position.x - el.offsetWidth / 2}px, ${
          b.position.y - el.offsetHeight / 2
        }px) rotate(${b.angle}rad)`;
      }
      raf = requestAnimationFrame(sync);
    }
    raf = requestAnimationFrame(sync);

    // start the world only when visible
    const runner = Matter.Runner.create();
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          Matter.Runner.run(runner, engine);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(arena);

    // drag interaction
    const mouse = Matter.Mouse.create(arena);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.15, render: { visible: false } },
    });
    Matter.Composite.add(world, mouseConstraint);
    // let the page keep scrolling over the arena
    const m = mouse as unknown as { mousewheel?: EventListener; element: HTMLElement };
    if (m.mousewheel) m.element.removeEventListener("wheel", m.mousewheel);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, [resetKey]);

  return (
    <section id="skills" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <h2 className="display text-4xl sm:text-6xl text-cream">
              Skills, <span className="outline-text">dropped</span>
            </h2>
            <button
              onClick={() => setResetKey((k) => k + 1)}
              className="text-sm text-mist hover:text-amber border border-cream/15 hover:border-amber rounded-full px-4 py-1.5 transition-colors"
            >
              ↺ make it rain again
            </button>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-mist text-sm mb-8">
            Every skill here survived production. Go ahead — grab one and throw
            it. They&apos;re used to being under pressure.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div
            key={resetKey}
            ref={arenaRef}
            className="relative h-[480px] rounded-3xl border border-cream/10 bg-ink-soft/40 overflow-hidden touch-none"
          >
            {PILLS.map((p, i) => (
              <div
                key={p.label + i}
                ref={(el) => { pillRefs.current[i] = el; }}
                className={`absolute top-0 left-0 flex items-center gap-2 select-none cursor-grab active:cursor-grabbing rounded-full px-4 py-2.5 text-sm font-semibold tracking-tight whitespace-nowrap will-change-transform hover:brightness-110 ${p.color}`}
                style={{ transform: "translate(-300px, -300px)" }}
              >
                {p.icon && <p.icon className="text-base shrink-0" aria-hidden />}
                {p.label}
              </div>
            ))}
            <span className="absolute bottom-4 right-5 text-xs text-mist/40 pointer-events-none">
              yes, this is a physics engine. no, she couldn&apos;t resist.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
