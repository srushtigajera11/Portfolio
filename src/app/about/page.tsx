import type { Metadata } from "next";
import { site } from "@/data/site";
import Skills from "@/components/sections/Skills";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="px-6 pt-28 pb-16 max-w-3xl mx-auto">
      <h1 className="display text-4xl text-cream mb-6">About Me</h1>
      <div className="space-y-4 text-mist leading-relaxed">
        <p>
          Working MERN stack developer. I turn ideas
          into functional, user-friendly products — and occasionally into
          lessons about why you should always read the error message twice.
        </p>
        <p>
          I specialize in the MERN stack with hands-on experience shipping
          real-world projects like a payment-integrated Learning Management
          System. Clean, scalable code and intuitive interfaces are the goal;
          the mystery side project is the hobby.
        </p>
        <p>{site.seeking}</p>
      </div>
      <Skills />
    </div>
  );
}
