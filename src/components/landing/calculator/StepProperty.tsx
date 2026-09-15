"use client";

import { Building2, Home, TreePine } from "lucide-react";
import { FieldLabel, OptionCard, TextInput, ToggleCard } from "./ui";
import { Button } from "@/components/ui/Button";
import { REGIONES } from "@/lib/config/pricing";
import type {
  ConexionRed,
  Estrato,
  TamanoRefrigeracion,
  TipoPredio,
} from "@/lib/savings/types";

export interface PredioFormState {
  tipoPredio: TipoPredio;
  estrato: Estrato;
  esComercialOIndustrial: "comercial" | "industrial";
  region: string;
  conexionRed: ConexionRed;
  tieneRefrigeracionCritica: boolean;
  tamanoRefrigeracion: TamanoRefrigeracion;
  interesIluminacionExterior: boolean;
  puntosIluminacionAprox: string;
}

export function StepProperty({
  value,
  onChange,
  onBack,
  onSubmit,
  loading,
}: {
  value: PredioFormState;
  onChange: (v: PredioFormState) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-ink-950">
        2. Cuéntanos sobre tu casa, negocio o finca
      </h3>
      <p className="mt-1 text-sm text-ink-800/60">
        Así el agente ajusta la recomendación a tu caso real.
      </p>

      <div className="mt-5">
        <FieldLabel>Tipo de predio</FieldLabel>
        <div className="grid grid-cols-3 gap-3">
          <OptionCard
            selected={value.tipoPredio === "casa"}
            onClick={() => onChange({ ...value, tipoPredio: "casa" })}
            title="Casa"
            icon={<Home className="h-4 w-4" />}
          />
          <OptionCard
            selected={value.tipoPredio === "negocio"}
            onClick={() => onChange({ ...value, tipoPredio: "negocio" })}
            title="Negocio"
            icon={<Building2 className="h-4 w-4" />}
          />
          <OptionCard
            selected={value.tipoPredio === "finca"}
            onClick={() => onChange({ ...value, tipoPredio: "finca" })}
            title="Finca / terreno"
            icon={<TreePine className="h-4 w-4" />}
          />
        </div>
      </div>

      {value.tipoPredio === "casa" && (
        <div className="mt-5">
          <FieldLabel>Estrato</FieldLabel>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((e) => (
              <button
                key={e}
                type="button"
                onClick={() =>
                  onChange({ ...value, estrato: e as Estrato })
                }
                className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                  value.estrato === e
                    ? "border-sun-500 bg-sun-500/10 text-sun-600"
                    : "border-black/10 text-ink-800/60 hover:border-black/20"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {value.tipoPredio === "negocio" && (
        <div className="mt-5">
          <FieldLabel>Tipo de tarifa</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <OptionCard
              selected={value.esComercialOIndustrial === "comercial"}
              onClick={() =>
                onChange({ ...value, esComercialOIndustrial: "comercial" })
              }
              title="Comercial"
            />
            <OptionCard
              selected={value.esComercialOIndustrial === "industrial"}
              onClick={() =>
                onChange({ ...value, esComercialOIndustrial: "industrial" })
              }
              title="Industrial"
            />
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Región</FieldLabel>
          <select
            value={value.region}
            onChange={(e) => onChange({ ...value, region: e.target.value })}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none focus:border-sun-500 focus:ring-2 focus:ring-sun-500/20"
          >
            {REGIONES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Conexión eléctrica</FieldLabel>
          <select
            value={value.conexionRed}
            onChange={(e) =>
              onChange({
                ...value,
                conexionRed: e.target.value as ConexionRed,
              })
            }
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none focus:border-sun-500 focus:ring-2 focus:ring-sun-500/20"
          >
            <option value="interconectado">Conectado a la red</option>
            <option value="zona_no_interconectada">
              Zona no interconectada (planta / sin red)
            </option>
          </select>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <ToggleCard
          active={value.tieneRefrigeracionCritica}
          onClick={() =>
            onChange({
              ...value,
              tieneRefrigeracionCritica: !value.tieneRefrigeracionCritica,
            })
          }
          title="Tengo neveras o refrigeración que proteger"
          description="Lácteos, alimentos, vacunas u otros productos que no pueden perder la cadena de frío"
        />
        {value.tieneRefrigeracionCritica && (
          <div className="grid grid-cols-3 gap-2 pl-1">
            {(
              [
                { v: "pequena", label: "Pequeña (<200L)" },
                { v: "media", label: "Media (200-600L)" },
                { v: "grande", label: "Grande (>600L)" },
              ] as { v: TamanoRefrigeracion; label: string }[]
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() =>
                  onChange({ ...value, tamanoRefrigeracion: opt.v })
                }
                className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  value.tamanoRefrigeracion === opt.v
                    ? "border-leaf-500 bg-leaf-500/10 text-leaf-700"
                    : "border-black/10 text-ink-800/55 hover:border-black/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <ToggleCard
          active={value.interesIluminacionExterior}
          onClick={() =>
            onChange({
              ...value,
              interesIluminacionExterior: !value.interesIluminacionExterior,
            })
          }
          title="Me interesa iluminación solar exterior o decorativa"
          description="Fachadas, senderos, parqueaderos, zonas comunes o decoración"
        />
        {value.interesIluminacionExterior && (
          <div className="pl-1">
            <FieldLabel>Puntos de luz aproximados</FieldLabel>
            <TextInput
              type="number"
              min={1}
              placeholder="Ej. 8"
              value={value.puntosIluminacionAprox}
              onChange={(e) =>
                onChange({ ...value, puntosIluminacionAprox: e.target.value })
              }
              className="max-w-[160px]"
            />
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Atrás
        </Button>
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? "Analizando..." : "Ver mi ahorro"}
        </Button>
      </div>
    </div>
  );
}
