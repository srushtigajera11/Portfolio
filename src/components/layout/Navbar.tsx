"use client";

import Link from "next/link";
import Image from "next/image";
import { site } from "@/data/site";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#skills", label: "Skills" },
  { href: "/#journey", label: "Journey" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="flex items-center justify-between px-5 sm:px-8 h-16 backdrop-blur-md bg-ink/60 border-b border-cream/5">
        <Link href="/" className="flex items-center gap-2" aria-label={site.name}>
          <Image
            src="/logo.png"
            alt={`${site.initials} logo`}
            width={36}
            height={36}
            priority
            className="w-9 h-9 hover:scale-110 transition-transform"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-mist">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-cream transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <a
          href={site.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm border border-cream/20 hover:border-amber hover:text-amber text-cream rounded-full px-4 py-1.5 transition-colors"
        >
          Resume
        </a>
      </div>
    </header>
  );
}
