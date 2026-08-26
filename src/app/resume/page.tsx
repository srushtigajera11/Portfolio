import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Resume",
};

export default function ResumePage() {
  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <iframe src={site.resumeUrl} title="Resume" className="w-full h-full border-0" />
    </div>
  );
}
