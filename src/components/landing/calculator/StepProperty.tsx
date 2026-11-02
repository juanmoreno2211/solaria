"use client";

import { useId } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";
import { FieldLabel } from "./ui";
import { IlustracionNegocio } from "./IlustracionNegocio";
import { Button } from "@/components/ui/Button";
import { COBERTURA_POR_HORARIO } from "@/lib/config/pricing";
import { LocationSelector } from "./LocationSelector";
import { Desplegable } from "./Desplegable";
import { EnergyContextFields } from "./EnergyContextFields";
import { FinancialFields } from "./FinancialFields";
import type { FinanzasFormState } from "@/lib/savings/financial-types";
import styles from "./SolarWidgets.module.css";
import type { ConexionElectrica, ZonaNegocio } from "@/lib/catalog/types";
import type {
  CargaCritica,
  FallaLuz,
  Horario,
  NegocioInput,
  TipoNegocio,
} from "@/lib/savings/types";

export interface NegocioFormState {
  finanzas?: FinanzasFormState;
  tipoNegocio: TipoNegocio | "";
  region: string;
  departamento: string;
  conexion: ConexionElectrica | "";
  zona: ZonaNegocio | "";
  municipio: string;
  potenciaCriticaW: string;
  horasAutonomia: string;
  cargasCriticas: CargaCritica[];
  horario: Horario | "";
  fallaLuz: FallaLuz | "";
  legalmenteConstituido: NonNullable<NegocioInput["legalmenteConstituido"]> | "";
}

const TIPOS: { v: TipoNegocio; label: string }[] = [
  { v: "tienda", label: "Tienda o supermercado" },
  { v: "restaurante", label: "Restaurante o cafetería" },
  { v: "consultorio", label: "Consultorio o clínica" },
  { v: "taller", label: "Taller o ferretería" },
  { v: "finca", label: "Finca o agro" },
  { v: "otro", label: "Otro tipo de negocio" },
];

const CARGAS: { v: CargaCritica; label: string }[] = [
  { v: "neveras", label: "Neveras o congeladores" },
  { v: "aire", label: "Aire acondicionado" },
  { v: "medicos", label: "Equipos médicos u odontológicos" },
  { v: "maquinaria", label: "Maquinaria o motores" },
  { v: "computo", label: "Computador y datáfono" },
  { v: "luces", label: "Iluminación" },
];

const HORARIOS: { v: Horario; label: string }[] = [
  { v: "dia", label: "De día" },
  { v: "dia_noche", label: "De día y de noche" },
  { v: "24h", label: "Las 24 horas" },
];

const FALLAS: { v: FallaLuz; label: string }[] = [
  { v: "cortes", label: "Cortes largos" },
  { v: "bajones", label: "Bajones y fluctuaciones" },
  { v: "ambos", label: "Las dos cosas" },
];

const CONSTITUIDO = [
  { v: "si", label: "Sí" },
  { v: "no", label: "No" },
  { v: "nose", label: "No sé" },
] as const;

const ZONAS: Record<ZonaNegocio, string> = {
  urbana: "Zona urbana",
  rural: "Zona rural",
  apartada: "Zona rural apartada",
};

export function etiquetaTipoNegocio(v: string): string | undefined {
  return TIPOS.find((t) => t.v === v)?.label;
}

export function etiquetaHorario(v: string): string | undefined {
  return HORARIOS.find((h) => h.v === v)?.label;
}

/** La conexión se pregunta explícitamente: la ubicación no basta para inferirla. */
export function negocioCompleto(v: NegocioFormState): boolean {
  return Boolean(v.tipoNegocio && v.departamento && v.horario && v.conexion);
}

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

/** Una pregunta del formulario, separada de la anterior por una línea. */
function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-950/8 pt-7">
      <h4 className="text-[clamp(20px,2.4vw,24px)] font-semibold leading-tight tracking-[-0.035em] text-ink-950">
        {titulo}
      </h4>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Tarjeta con dibujo: elegir el tipo de negocio. */
function TarjetaNegocio({
  tipo,
  label,
  selected,
  onClick,
}: {
  tipo: TipoNegocio;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "relative flex flex-col overflow-hidden rounded-xl border text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/50",
        selected ? "border-ink-900 ring-1 ring-ink-900" : "border-ink-950/10 hover:border-ink-950/30"
      )}
    >
      <span className={clsx("flex h-20 items-center justify-center", selected ? "bg-cream-200/70" : "bg-cream-100")}>
        <IlustracionNegocio tipo={tipo} className="h-14 w-auto" />
      </span>
      <span className="px-3 py-2.5 text-sm font-semibold leading-snug text-ink-950">{label}</span>
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function resumenOpcional(v: NegocioFormState): string {
  const partes = [
    v.zona && ZONAS[v.zona],
    v.municipio.trim(),
    v.cargasCriticas.length > 0 &&
      CARGAS.filter((c) => v.cargasCriticas.includes(c.v)).map((c) => c.label).join(", "),
    FALLAS.find((f) => f.v === v.fallaLuz)?.label,
    v.legalmenteConstituido &&
      `Constituido: ${CONSTITUIDO.find((o) => o.v === v.legalmenteConstituido)?.label}`,
  ].filter(Boolean);
  return partes.length > 0
    ? partes.join(" · ")
    : "Zona, municipio, equipos importantes y otros detalles que ayudan al instalador.";
}

export function StepProperty({
  value,
  onChange,
  onBack,
  onSubmit,
  loading,
  error,
}: {
  value: NegocioFormState;
  onChange: (v: NegocioFormState) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}) {
  const id = useId();

  function toggleCarga(c: CargaCritica) {
    const cargasCriticas = value.cargasCriticas.includes(c)
      ? value.cargasCriticas.filter((x) => x !== c)
      : [...value.cargasCriticas, c];
    onChange({ ...value, cargasCriticas });
  }

  const cobertura = value.horario ? Math.round(COBERTURA_POR_HORARIO[value.horario] * 100) : null;

  return (
    <div>
      <div className="mt-7 space-y-8">
        <LocationSelector
          value={{
            region: value.region,
            departamento: value.departamento,
            conexion: value.conexion,
            zona: value.zona,
            municipio: value.municipio,
          }}
          onChange={(ubicacion) => {
            const cambiaConexion = ubicacion.conexion !== value.conexion;
            const quitarRespaldo = cambiaConexion && (ubicacion.conexion === "estable" || ubicacion.conexion === "no_se");
            onChange({
              ...value,
              ...ubicacion,
              ...(cambiaConexion ? { finanzas: undefined } : {}),
              ...(quitarRespaldo ? { potenciaCriticaW: "", horasAutonomia: "", fallaLuz: "" as const } : {}),
              ...(cambiaConexion && ubicacion.conexion === "sin_red" ? { fallaLuz: "" as const } : {}),
            });
          }}
        />

        <EnergyContextFields value={value} onChange={onChange} />

        <Bloque titulo="¿Qué tipo de negocio tienes?">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TIPOS.map((t) => (
              <TarjetaNegocio
                key={t.v}
                tipo={t.v}
                label={t.label}
                selected={value.tipoNegocio === t.v}
                onClick={() => onChange({ ...value, tipoNegocio: t.v })}
              />
            ))}
          </div>
        </Bloque>

        <Bloque titulo="¿Cuándo trabajas?">
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
          <p className="mt-3 text-xs leading-relaxed text-ink-800/55" aria-live="polite">
            {value.conexion && value.conexion !== "estable"
              ? "Con cortes o sin red, el horario ayuda a dimensionar cargas y baterías. La autonomía se debe validar con un estudio técnico."
              : cobertura !== null
              ? `Con este horario, los paneles podrían cubrir cerca del ${cobertura} % de tu factura: sin baterías, solo aprovechas el sol mientras trabajas.`
              : "Sin baterías, los paneles solo cubren lo que consumes de día."}
          </p>
        </Bloque>

        <Desplegable
          titulo="Más detalles para tu cotización (opcional)"
          resumen={resumenOpcional(value)}
          icono={<SlidersHorizontal className="h-4 w-4" />}
        >
          <div className="space-y-5 border-t border-ink-950/8 pt-4">
            <div>
              <FieldLabel>¿Qué no puede fallar?</FieldLabel>
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
              <p className="mt-2 text-xs text-ink-800/50">Marca todo lo que aplique.</p>
            </div>

            <div>
              <FieldLabel>¿Cómo falla la luz?</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {FALLAS.map((f) => (
                  <Chip
                    key={f.v}
                    selected={value.fallaLuz === f.v}
                    onClick={() =>
                      onChange({ ...value, fallaLuz: value.fallaLuz === f.v ? "" : f.v, ...(value.conexion !== "sin_red" && (f.v === "cortes" || f.v === "ambos") ? { conexion: "intermitente" as const } : {}) })
                    }
                  >
                    {f.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>¿Tu negocio está legalmente constituido?</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {CONSTITUIDO.map((o) => (
                  <Chip
                    key={o.v}
                    selected={value.legalmenteConstituido === o.v}
                    onClick={() =>
                      onChange({
                        ...value,
                        legalmenteConstituido: value.legalmenteConstituido === o.v ? "" : o.v,
                      })
                    }
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-800/50">Algunos apoyos del Gobierno lo piden.</p>
            </div>

            <FinancialFields value={value.finanzas ?? {}} onChange={(finanzas) => onChange({ ...value, finanzas })} conexion={value.conexion} />

            <div className={styles.camposUbicacion}>
              <div>
                <label htmlFor={`${id}-zona`}>Zona</label>
                <p id={`${id}-zona-ayuda`} className={styles.ayudaCampo}>
                  Opcional. Ayuda a revisar el acceso al predio y la logística de instalación.
                </p>
                <select
                  id={`${id}-zona`}
                  value={value.zona}
                  aria-describedby={`${id}-zona-ayuda`}
                  onChange={(event) =>
                    onChange({ ...value, zona: event.target.value as NegocioFormState["zona"] })
                  }
                >
                  <option value="">Selecciona la zona</option>
                  <option value="urbana">Urbana</option>
                  <option value="rural">Rural</option>
                  <option value="apartada">Rural apartada o de difícil acceso</option>
                </select>
              </div>

              <div>
                <label htmlFor={`${id}-municipio`}>Municipio o localidad</label>
                <p id={`${id}-municipio-ayuda`} className={styles.ayudaCampo}>
                  Opcional. Nos ayuda a ubicar mejor tu negocio.
                </p>
                <input
                  id={`${id}-municipio`}
                  type="text"
                  value={value.municipio}
                  maxLength={100}
                  autoComplete="address-level2"
                  aria-describedby={`${id}-municipio-ayuda`}
                  placeholder="Ej. Puerto Carreño"
                  onChange={(event) => onChange({ ...value, municipio: event.target.value })}
                />
              </div>
            </div>
          </div>
        </Desplegable>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Atrás
        </Button>
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? "Calculando..." : "Ver mi resultado"}
        </Button>
      </div>
    </div>
  );
}
