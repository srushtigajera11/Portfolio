"use client";

import { useEffect, useState } from "react";

/** Time-aware one-liner — the site knows when you showed up. */
export default function Greeting() {
  const [line, setLine] = useState<string>("");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 5) setLine("3 a.m.? Respect. That's prime debugging hours.");
    else if (h < 12) setLine("Good morning. The coffee's fake, the code is real.");
    else if (h < 17) setLine("Good afternoon. You look productive. Let's ruin that.");
    else if (h < 22) setLine("Good evening. Best time to hire someone, honestly.");
    else setLine("Up late scrolling portfolios? You've found the right one.");
  }, []);

  return (
    <p className="text-sm text-mist min-h-5 transition-opacity duration-500">
      {line}
    </p>
  );
}
