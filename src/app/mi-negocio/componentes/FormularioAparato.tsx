"use client";

import { useId, useState } from "react";
import { aparatoDelCatalogo } from "@/lib/aparatos/catalogo";
import { DIAS_MES_DEFECTO } from "@/lib/aparatos/calculo";
import { guardarAparato } from "../actions";
import type { AparatoFila } from "../datos";
import { botonPrimario } from "./estilos";
import { CamposAparato, VALORES_VACIOS, valoresDeCatalogo, type ValoresAparato } from "./CamposAparato";

function valoresDeFila(a: AparatoFila): ValoresAparato {
  return {
    tipo: aparatoDelCatalogo(a.tipo_catalogo)?.tipo ?? "",
    nombre: a.nombre,
    cantidad: String(a.cantidad),
    potenciaW: a.potencia_w != null ? String(a.potencia_w) : "",
    factorPct: String(Math.round(a.factor_ciclo * 100)),
    horasDia: a.horas_dia != null ? String(a.horas_dia) : "",
    diasMes: String(a.dias_mes ?? DIAS_MES_DEFECTO),
    kwhAnioEtiqueta: a.kwh_anio_etiqueta != null ? String(a.kwh_anio_etiqueta) : "",
  };
}

/** Agregar (sin `aparato`) o editar un aparato guardado. */
export function FormularioAparato({ aparato, onListo }: { aparato?: AparatoFila; onListo?: () => void }) {
  const idBase = useId();
  const [valores, setValores] = useState<ValoresAparato>(() =>
    aparato ? valoresDeFila(aparato) : valoresDeCatalogo("nevera")
  );

  return (
    <form
      action={async (formData) => {
        await guardarAparato(formData);
        if (!aparato) setValores({ ...VALORES_VACIOS, ...valoresDeCatalogo("nevera") });
        onListo?.();
      }}
      className="space-y-4"
    >
      {aparato && <input type="hidden" name="id" value={aparato.id} />}
      <CamposAparato valores={valores} onCambiar={setValores} idBase={idBase} />
      <button type="submit" className={`${botonPrimario} w-full sm:w-auto`}>
        {aparato ? "Guardar cambios" : "Agregar aparato"}
      </button>
    </form>
  );
}
