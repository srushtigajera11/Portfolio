import { site, socials } from "@/data/site";

export default function Footer() {
  return (
    <footer className="px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
      <p>
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
      <div className="flex gap-4">
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
            {s.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
