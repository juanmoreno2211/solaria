"use client";

import { useEffect, useRef } from "react";
import { registrarRankingVisto } from "../actions";

/** Registra ranking_visto una vez, cuando el ranking entra en pantalla. */
export function RankingVisto({ aparatos }: { aparatos: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) {
        obs.disconnect();
        registrarRankingVisto(aparatos).catch(() => {});
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [aparatos]);
  return <span ref={ref} hidden />;
}
