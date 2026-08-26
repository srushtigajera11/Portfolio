import Image from "next/image";
import { site, socials } from "@/data/site";
import Magnetic from "@/components/ui/Magnetic";
import Reveal from "@/components/ui/Reveal";

export default function Contact() {
  return (
    <section id="contact" className="relative pt-32 pb-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(234,200,110,0.1), transparent 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-widest text-amber mb-6">
            {site.status}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display text-5xl sm:text-7xl lg:text-8xl text-cream">
            Every great product
            <br />
            starts with a<span className="text-amber"> hello.</span>
          </h2>
          <p className="mt-6 text-mist text-sm">
            (The bad ones too, but let&apos;s focus on the great ones.)
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-col items-center gap-6">
            <Magnetic strength={0.25}>
              <a
                href={`mailto:${site.email}`}
                className="inline-block bg-amber hover:bg-amber-deep text-ink font-semibold rounded-full px-10 py-5 text-lg transition-colors"
              >
                {site.email}
              </a>
            </Magnetic>
            <div className="flex gap-6 text-sm text-mist">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber transition-colors"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* mascot waves goodbye */}
        <Reveal delay={0.25}>
          <div className="relative w-40 mx-auto mt-16">
            <Image
              src="/mascot/look_up.webp"
              alt=""
              width={543}
              height={701}
              className="w-full h-auto"
            />
            <div className="absolute -top-6 -right-28 bg-ink-soft border border-cream/15 rounded-2xl rounded-bl-none px-4 py-2 text-xs text-mist">
              she&apos;ll be waiting 👋
            </div>
          </div>
        </Reveal>

        <p className="text-xs text-mist/50 mt-16 pb-4">
          © {new Date().getFullYear()} {site.name} · built with Next.js, one very
          attentive mascot, and an irresponsible amount of coffee
        </p>
      </div>
    </section>
  );
}
