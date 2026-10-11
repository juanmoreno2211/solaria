"use client";

import {
  HelpCircle,
  Stethoscope,
  Store,
  Tractor,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import clsx from "clsx";
import { FieldLabel, OptionCard } from "./ui";
import { Button } from "@/components/ui/Button";
import { REGIONES } from "@/lib/config/pricing";
import type {
  CargaCritica,
  FallaLuz,
  Horario,
  TipoNegocio,
} from "@/lib/savings/types";

export interface NegocioFormState {
  tipoNegocio: TipoNegocio;
  region: string;
  cargasCriticas: CargaCritica[];
  horario: Horario;
  fallaLuz: FallaLuz;
  legalmenteConstituido: "si" | "no" | "";
}

const TIPOS: { v: TipoNegocio; label: string; icon: React.ReactNode }[] = [
  { v: "tienda", label: "Tienda o supermercado", icon: <Store className="h-4 w-4" /> },
  { v: "restaurante", label: "Restaurante", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { v: "consultorio", label: "Consultorio o clínica", icon: <Stethoscope className="h-4 w-4" /> },
  { v: "taller", label: "Taller o ferretería", icon: <Wrench className="h-4 w-4" /> },
  { v: "finca", label: "Finca o agro", icon: <Tractor className="h-4 w-4" /> },
  { v: "otro", label: "Otro", icon: <HelpCircle className="h-4 w-4" /> },
];

const CARGAS: { v: CargaCritica; label: string }[] = [
  { v: "refrigeracion", label: "Refrigeración" },
  { v: "equipos", label: "Equipos o computadores" },
  { v: "iluminacion", label: "Iluminación" },
  { v: "caja_datafono", label: "Caja o datáfono" },
  { v: "maquinaria", label: "Maquinaria" },
  { v: "bombeo", label: "Bombeo de agua" },
];

const HORARIOS: { v: Horario; label: string }[] = [
  { v: "dia", label: "De día" },
  { v: "dia_noche", label: "De día y de noche" },
  { v: "24h", label: "24 horas" },
];

const FALLAS: { v: FallaLuz; label: string }[] = [
  { v: "cortes", label: "Se va (cortes)" },
  { v: "bajones", label: "Baja (bajones)" },
  { v: "ambos", label: "Las dos" },
];

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-sun-500 bg-sun-500/10 text-sun-600"
          : "border-black/10 text-ink-800/60 hover:border-black/20"
      )}
    >
      {children}
    </button>
  );
}

export function StepProperty({
  value,
  onChange,
  onBack,
  onSubmit,
  loading,
}: {
  value: NegocioFormState;
  onChange: (v: NegocioFormState) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  function toggleCarga(c: CargaCritica) {
    const cargasCriticas = value.cargasCriticas.includes(c)
      ? value.cargasCriticas.filter((x) => x !== c)
      : [...value.cargasCriticas, c];
    onChange({ ...value, cargasCriticas });
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-ink-950">
        2. Cuéntanos de tu negocio
      </h3>
      <p className="mt-1 text-sm text-ink-800/60">
        Con esto ajustamos el cálculo a cómo y cuándo usas la luz.
      </p>

      <div className="mt-5">
        <FieldLabel>Tipo de negocio</FieldLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TIPOS.map((t) => (
            <OptionCard
              key={t.v}
              selected={value.tipoNegocio === t.v}
              onClick={() => onChange({ ...value, tipoNegocio: t.v })}
              title={t.label}
              icon={t.icon}
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
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

      <div className="mt-5">
        <FieldLabel>¿Qué no puede fallar en tu negocio?</FieldLabel>
        <p className="-mt-1 mb-2 text-xs text-ink-800/50">Puedes marcar varias.</p>
        <div className="flex flex-wrap gap-2">
          {CARGAS.map((c) => (
            <Chip
              key={c.v}
              selected={value.cargasCriticas.includes(c.v)}
              onClick={() => toggleCarga(c.v)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel>¿Cuándo trabajas?</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {HORARIOS.map((h) => (
              <Chip
                key={h.v}
                selected={value.horario === h.v}
                onClick={() => onChange({ ...value, horario: h.v })}
              >
                {h.label}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>¿Cómo te falla la luz?</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {FALLAS.map((f) => (
              <Chip
                key={f.v}
                selected={value.fallaLuz === f.v}
                onClick={() => onChange({ ...value, fallaLuz: f.v })}
              >
                {f.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <FieldLabel>¿Tu negocio está legalmente constituido? (opcional)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { v: "si", label: "Sí" },
              { v: "no", label: "No" },
            ] as const
          ).map((o) => (
            <Chip
              key={o.v}
              selected={value.legalmenteConstituido === o.v}
              onClick={() =>
                onChange({
                  ...value,
                  legalmenteConstituido:
                    value.legalmenteConstituido === o.v ? "" : o.v,
                })
              }
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Atrás
        </Button>
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? "Calculando..." : "Ver si me conviene"}
        </Button>
      </div>
    </div>
  );
}
