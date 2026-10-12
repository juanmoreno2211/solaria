"use client";

import { useEffect, useMemo, useRef } from "react";
import { Camera, FileText, ImageUp, Loader2, ShieldAlert } from "lucide-react";
import { FieldLabel, OptionCard, TextInput } from "./ui";
import { Button } from "@/components/ui/Button";
import { formatCOP, formatNumber } from "@/lib/format";
import { AVISO_FOTO_RECIBO } from "@/lib/config/avisos";
import {
  TIPOS_IMAGEN_RECIBO,
  validarImagenRecibo,
  type LecturaRecibo,
} from "@/lib/ai/receipt";

export interface ReciboFormState {
  fuente: "foto" | "manual";
  imageFile: File | null;
  lectura: "sin_foto" | "leyendo" | "leido" | "error";
  mensajeLectura: string | null;
  /** Lo que leyó la IA, para saber si el usuario lo corrigió. */
  leido: { consumo: string; valor: string } | null;
  consumoMensualKwh: string;
  valorPagadoMensual: string;
}

export function reciboInicial(fotoDisponible: boolean): ReciboFormState {
  return {
    fuente: fotoDisponible ? "foto" : "manual",
    imageFile: null,
    lectura: "sin_foto",
    mensajeLectura: null,
    leido: null,
    consumoMensualKwh: "",
    valorPagadoMensual: "",
  };
}

/** De dónde salen los números confirmados: de la foto leída o escritos a mano. */
export function fuenteNumeros(r: ReciboFormState): "foto" | "manual" {
  return r.fuente === "foto" && r.lectura === "leido" ? "foto" : "manual";
}

export function corrigioLectura(r: ReciboFormState): boolean {
  return (
    fuenteNumeros(r) === "foto" &&
    r.leido !== null &&
    (r.leido.consumo !== r.consumoMensualKwh || r.leido.valor !== r.valorPagadoMensual)
  );
}

function textoLeido(consumo: string, valor: string): string {
  const partes = [
    consumo && `${formatNumber(Number(consumo))} kWh`,
    valor && formatCOP(Number(valor)),
  ].filter(Boolean);
  const faltante = !consumo ? "el consumo" : !valor ? "el valor" : null;
  return `Leímos ${partes.join(" y ")}${faltante ? `, pero no ${faltante}` : ""}. ¿Es correcto?`;
}

function CamposNumeros({
  value,
  onChange,
}: {
  value: ReciboFormState;
  onChange: React.Dispatch<React.SetStateAction<ReciboFormState>>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <FieldLabel>Consumo del mes (kWh)</FieldLabel>
        <TextInput
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Ej. 720"
          value={value.consumoMensualKwh}
          onChange={(e) => onChange((v) => ({ ...v, consumoMensualKwh: e.target.value }))}
        />
      </div>
      <div>
        <FieldLabel>Valor pagado (pesos)</FieldLabel>
        <TextInput
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Ej. 760000"
          value={value.valorPagadoMensual}
          onChange={(e) => onChange((v) => ({ ...v, valorPagadoMensual: e.target.value }))}
        />
      </div>
    </div>
  );
}

export function StepReceipt({
  value,
  onChange,
  onNext,
  fotoDisponible,
  error,
  onError,
}: {
  value: ReciboFormState;
  onChange: React.Dispatch<React.SetStateAction<ReciboFormState>>;
  onNext: () => void;
  fotoDisponible: boolean;
  error: string | null;
  onError: (mensaje: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lecturaActual = useRef(0);

  // Se deriva del archivo guardado para que la vista previa siga al volver con "Atrás".
  const preview = useMemo(
    () => (value.imageFile ? URL.createObjectURL(value.imageFile) : null),
    [value.imageFile]
  );
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const modoFoto = fotoDisponible && value.fuente === "foto";

  async function leerFoto(file: File) {
    onError(null);
    const invalida = validarImagenRecibo(file.type, file.size);
    if (invalida) {
      onChange((v) => ({ ...v, imageFile: null, lectura: "sin_foto", mensajeLectura: invalida }));
      return;
    }

    const id = ++lecturaActual.current;
    onChange((v) => ({ ...v, imageFile: file, lectura: "leyendo", mensajeLectura: null, leido: null }));

    let lectura: LecturaRecibo;
    try {
      const body = new FormData();
      body.set("recibo", file);
      const res = await fetch("/api/leer-recibo", { method: "POST", body });
      lectura = await res.json();
    } catch {
      lectura = { disponible: false, mensaje: "No pudimos conectar con el servidor." };
    }
    if (id !== lecturaActual.current) return; // llegó una foto más nueva

    if (lectura.disponible) {
      const consumo = lectura.datos.consumoMensualKwh?.toString() ?? "";
      const valor = lectura.datos.valorPagadoMensual?.toString() ?? "";
      onChange((v) => ({
        ...v,
        lectura: "leido",
        leido: { consumo, valor },
        consumoMensualKwh: consumo,
        valorPagadoMensual: valor,
      }));
    } else {
      onChange((v) => ({ ...v, lectura: "error", mensajeLectura: lectura.mensaje }));
    }
  }

  function otraFoto() {
    lecturaActual.current++;
    onError(null);
    onChange((v) => ({ ...v, imageFile: null, lectura: "sin_foto", mensajeLectura: null, leido: null }));
  }

  function handleContinue() {
    if (!value.consumoMensualKwh && !value.valorPagadoMensual) {
      onError("Escribe el consumo o el valor de tu recibo para continuar.");
      return;
    }
    onError(null);
    onNext();
  }

  return (
    <div>
      <h3 data-step-title tabIndex={-1} className="text-lg font-bold text-ink-950 outline-none">
        Tu recibo de luz
      </h3>
      <p className="mt-1 text-sm text-ink-800/60">
        {fotoDisponible
          ? "Sube una foto o escribe el consumo y el valor pagado. Si solo tienes uno de los dos, también sirve."
          : "Escribe el consumo y el valor pagado de tu recibo. Si solo tienes uno de los dos, también sirve."}
      </p>

      {fotoDisponible && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <OptionCard
            selected={value.fuente === "foto"}
            onClick={() => onChange((v) => ({ ...v, fuente: "foto" }))}
            title="Subir foto"
            description="La leemos y tú confirmas"
            icon={<Camera className="h-4 w-4" />}
          />
          <OptionCard
            selected={value.fuente === "manual"}
            onClick={() => onChange((v) => ({ ...v, fuente: "manual" }))}
            title="Escribir a mano"
            description="Consumo y valor pagado"
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      )}

      {modoFoto ? (
        <div className="mt-5">
          {value.lectura === "sin_foto" && (
            <>
              <p className="flex items-start gap-2.5 rounded-lg border border-sun-500/30 bg-sun-500/8 px-4 py-3 text-xs leading-relaxed text-ink-900/80">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-sun-600" />
                {AVISO_FOTO_RECIBO}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={TIPOS_IMAGEN_RECIBO.join(",")}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) leerFoto(f);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-black/15 py-10 text-center transition-colors hover:border-sun-500/50 hover:bg-sun-500/5"
              >
                <ImageUp className="h-6 w-6 text-ink-800/40" />
                <span className="text-sm font-medium text-ink-950">
                  Toca para subir una foto de tu recibo
                </span>
                <span className="text-xs text-ink-800/45">JPG, PNG o WEBP, hasta 4 MB</span>
              </button>
              {value.mensajeLectura && (
                <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                  {value.mensajeLectura}
                </p>
              )}
            </>
          )}

          {value.lectura !== "sin_foto" && preview && (
            <div className="flex items-center gap-4 rounded-xl border border-black/10 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Tu recibo" className="h-20 w-20 shrink-0 rounded-lg bg-black/5 object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                {value.lectura === "leyendo" ? (
                  <p className="flex items-center gap-2 font-medium text-ink-950" role="status">
                    <Loader2 className="h-4 w-4 animate-spin text-sun-600" />
                    Leyendo tu recibo...
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={otraFoto}
                    className="font-semibold text-sun-600 underline-offset-4 hover:underline"
                  >
                    Usar otra foto
                  </button>
                )}
              </div>
            </div>
          )}

          {value.lectura === "leido" && value.leido && (
            <div className="mt-5">
              <p className="text-base font-semibold text-ink-950" role="status">
                {textoLeido(value.leido.consumo, value.leido.valor)}
              </p>
              <p className="mb-4 mt-1 text-xs text-ink-800/55">
                Revisa los números con tu recibo y corrígelos si hace falta.
              </p>
              <CamposNumeros value={value} onChange={onChange} />
            </div>
          )}

          {value.lectura === "error" && (
            <div className="mt-5">
              <p role="alert" className="text-base font-semibold text-ink-950">
                No pudimos leer la foto. Escribe tu consumo y el valor de tu recibo
              </p>
              {value.mensajeLectura && (
                <p className="mb-4 mt-1 text-xs text-ink-800/55">{value.mensajeLectura}</p>
              )}
              <CamposNumeros value={value} onChange={onChange} />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <CamposNumeros value={value} onChange={onChange} />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {!(modoFoto && (value.lectura === "sin_foto" || value.lectura === "leyendo")) && (
        <div className="mt-7 flex justify-end">
          <Button onClick={handleContinue}>
            {modoFoto && value.lectura === "leido" ? "Confirmar y continuar" : "Continuar"}
          </Button>
        </div>
      )}
    </div>
  );
}
