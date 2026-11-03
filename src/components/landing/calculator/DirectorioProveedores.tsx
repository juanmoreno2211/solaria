"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CONTACTO_SOLARIA_ID } from "@/lib/cotizacion-contacto";
import type { ProveedorCoincidente } from "@/lib/catalog/types";

function Ficha({
  proveedor: p,
  onElegir,
}: {
  proveedor: ProveedorCoincidente;
  onElegir: (id: string) => void;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-ink-950/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <h5 className="text-base font-semibold tracking-tight text-ink-950">
          {p.nombre}
        </h5>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-800/75">
          {p.descripcion}
        </p>
      </div>
      <Button
        type="button"
        className="w-full shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500 focus-visible:ring-offset-2 sm:w-auto"
        onClick={() => onElegir(p.id)}
        aria-label={`Cotizar ${p.nombre} con SolarIA`}
      >
        Cotizar con SolarIA
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </article>
  );
}

export function DirectorioProveedores({
  proveedores,
  comunitarios = [],
  onElegir,
}: {
  proveedores: ProveedorCoincidente[];
  comunitarios?: ProveedorCoincidente[];
  mostrarRecursos?: boolean;
  onElegir: (id: string) => void;
}) {
  return (
    <section aria-label="Directorio de proveedores">
      <h4 className="text-base font-semibold tracking-tight text-ink-950">Elige una opción para cotizar</h4>
      <p className="mb-4 mt-1 text-sm leading-relaxed text-ink-800/65">
        SolarIA confirma disponibilidad y precio en tu municipio.
      </p>

      {proveedores.length ? (
        <div className="grid gap-3">
          {proveedores.slice(0, 4).map((p) => (
            <Ficha key={p.id} proveedor={p} onElegir={onElegir} />
          ))}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-ink-800/75">
          Te ayudamos a encontrar una opción para tu negocio.
        </p>
      )}

      {proveedores.length > 4 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-ink-950">
            Ver {proveedores.length - 4} opciones más
          </summary>
          <div className="mt-3 grid gap-3">
            {proveedores.slice(4).map((p) => (
              <Ficha key={p.id} proveedor={p} onElegir={onElegir} />
            ))}
          </div>
        </details>
      )}

      {comunitarios.length > 0 && (
        <details className="mt-5 border-t border-ink-950/10 pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-ink-950">
            Para proyectos colectivos
          </summary>
          <p className="mb-3 mt-2 text-sm leading-relaxed text-ink-800/65">
            Disponibilidad según el tamaño y la ubicación del proyecto.
          </p>
          <div className="grid gap-3">
            {comunitarios.map((p) => (
              <Ficha key={p.id} proveedor={p} onElegir={onElegir} />
            ))}
          </div>
        </details>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-ink-950/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-800/75">¿Necesitas ayuda para elegir?</p>
        <Button
          type="button"
          variant="secondary"
          className="w-full shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500 focus-visible:ring-offset-2 sm:w-auto"
          onClick={() => onElegir(CONTACTO_SOLARIA_ID)}
        >
          Continuar con SolarIA
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
