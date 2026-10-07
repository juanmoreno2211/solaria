"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sun } from "lucide-react";

const PARTICULAS = [0, 90, 180, 270];

export function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();
  const duracion = reduceMotion ? 0.4 : 1.9;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = "";
    }, duracion * 1000);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-gradient"
        >
          <div className="relative flex h-32 w-32 items-center justify-center">
            {!reduceMotion &&
              [0, 0.45, 0.9].map((delay) => (
                <motion.span
                  key={delay}
                  className="absolute inset-0 rounded-full border-2 border-sun-400/40"
                  initial={{ scale: 0.55, opacity: 0.8 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay,
                    ease: "easeOut",
                  }}
                />
              ))}

            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-sun-500/30 blur-2xl"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
              }
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {!reduceMotion && (
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                {PARTICULAS.map((deg) => (
                  <span
                    key={deg}
                    style={{ transform: `rotate(${deg}deg) translate(54px)` }}
                    className="absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full bg-sun-300 shadow-[0_0_8px_2px_rgba(253,184,51,0.6)]"
                  />
                ))}
              </motion.div>
            )}

            <motion.span
              className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-sun-gradient shadow-[0_0_30px_rgba(245,158,11,0.6)]"
              animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sun className="h-8 w-8 text-ink-950" strokeWidth={2.25} />
            </motion.span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-7 text-lg font-bold tracking-tight text-white"
          >
            Solar<span className="text-sun-400">IA</span>
          </motion.p>

          <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-sun-gradient"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: duracion, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
