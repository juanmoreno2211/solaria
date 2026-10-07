"use client";

import { useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Sun } from "lucide-react";

export function FloatingSun() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 1080]);
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setVisible(v > 0.03);
  });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed bottom-5 right-5 z-40"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        style={{ rotate }}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-sun-gradient shadow-[0_8px_22px_-6px_rgba(245,158,11,0.65)] sm:h-14 sm:w-14"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-sun-400/50 blur-md"
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <Sun className="relative h-5 w-5 text-ink-950 sm:h-7 sm:w-7" strokeWidth={2.25} />
      </motion.div>
    </motion.div>
  );
}
