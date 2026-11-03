"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tomarPendiente } from "@/lib/negocio/resultado-pendiente";
import { guardarResultadoCalculadora } from "../actions";

/** Si la persona llegó desde la calculadora, guarda ese resultado en su cuenta. */
export function ImportarResultado() {
  const router = useRouter();
  const [estado, setEstado] = useState<"nada" | "guardando" | "listo" | "error">("nada");
  const hecho = useRef(false);

  useEffect(() => {
    if (hecho.current) return;
    hecho.current = true;
    const pendiente = tomarPendiente();
    if (!pendiente) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee localStorage, que solo existe en el navegador
    setEstado("guardando");
    guardarResultadoCalculadora(pendiente).then(({ ok }) => {
      setEstado(ok ? "listo" : "error");
      if (ok) router.refresh();
    });
  }, [router]);

  if (estado === "nada") return null;
  return (
    <p role="status" className="mb-6 rounded-lg border border-ink-950/10 bg-white px-4 py-3 text-sm text-ink-950/85">
      {estado === "guardando" && "Guardando el resultado de tu calculadora…"}
      {estado === "listo" && "Guardamos tu resultado: tu recibo y tu negocio ya están cargados."}
      {estado === "error" && "No pudimos guardar el resultado de la calculadora. Escribe tus datos abajo."}
    </p>
  );
}
