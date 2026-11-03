"use client";

/** Enlace que abre un <details> cerrado (p. ej. "Mi recibo") y baja hasta él. */
export function AbrirSeccion({ destino, children, className }: { destino: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={`#${destino}`}
      onClick={() => {
        const el = document.getElementById(destino);
        if (el instanceof HTMLDetailsElement) el.open = true;
      }}
      className={className}
    >
      {children}
    </a>
  );
}
