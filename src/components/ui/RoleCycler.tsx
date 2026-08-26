"use client";

import { useEffect, useState } from "react";

/** Cycles through job titles that get progressively more honest. */
export default function RoleCycler({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % roles.length);
        setVisible(true);
      }, 350);
    }, 2600);
    return () => clearInterval(id);
  }, [roles.length]);

  return (
    <span
      className={`inline-block transition-all duration-350 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {roles[index]}
    </span>
  );
}
