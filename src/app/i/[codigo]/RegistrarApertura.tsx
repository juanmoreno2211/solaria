"use client";

import { useEffect, useRef } from "react";

/** Cuenta la apertura desde el navegador: los robots que no ejecutan JavaScript no suman. */
export function RegistrarApertura({ codigo }: { codigo: string }) {
  const enviado = useRef(false);
  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    fetch("/api/invitaciones/apertura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo }),
      keepalive: true,
    }).catch(() => {});
  }, [codigo]);
  return null;
}
