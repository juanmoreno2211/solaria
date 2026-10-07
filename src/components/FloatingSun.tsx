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
        className="flex h-10 w-10 items-center justify-center rounded-full border border-sun-500/25 bg-cream-50 sm:h-12 sm:w-12"
      >
        <Sun className="h-4 w-4 text-sun-500 sm:h-5 sm:w-5" strokeWidth={2} />
      </motion.div>
    </motion.div>
  );
}
