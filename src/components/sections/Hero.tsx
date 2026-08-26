import { site } from "@/data/site";
import Mascot from "@/components/ui/Mascot";
import Magnetic from "@/components/ui/Magnetic";
import Reveal from "@/components/ui/Reveal";
import Greeting from "@/components/ui/Greeting";
import RoleCycler from "@/components/ui/RoleCycler";
import ScrambleName from "@/components/ui/ScrambleName";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* backdrop glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 45%, rgba(234,200,110,0.08), transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-12 grid gap-10 md:grid-cols-[1.2fr_1fr] items-center w-full">
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-2 border border-cream/15 rounded-full px-4 py-1.5 text-sm text-mist mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
              {site.status}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <Greeting />
          </Reveal>

          <Reveal delay={0.1}>
            <ScrambleName first="Srushti" last="Gajera" />
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-5 text-lg sm:text-xl text-cream/90">
              <span className="text-mist">certified*</span>{" "}
              <RoleCycler roles={site.roles} />
            </p>
            <p className="mt-4 text-mist max-w-md leading-relaxed">
              {site.tagline}
            </p>
            <p className="mt-2 text-xs text-mist/50">
              *certification pending. skills very much not.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex items-center gap-6">
              <Magnetic>
                <a
                  href="#contact"
                  className="inline-block bg-amber hover:bg-amber-deep text-ink font-semibold rounded-full px-8 py-4 transition-colors"
                >
                  Let&apos;s talk →
                </a>
              </Magnetic>
              <a href="#work" className="text-mist hover:text-cream transition-colors text-sm">
                inspect the evidence ↓
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.25} y={24}>
          <div className="relative">
            <div className="mascot-glow" aria-hidden />
            <Mascot className="relative max-w-xs sm:max-w-sm mx-auto" />
          </div>
          <p className="text-center text-xs text-mist/60 mt-6">
            psst — she&apos;s watching your cursor. she judges slow scrollers too.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
