"use client";

import { useRef, useState } from "react";
import { Camera, FileText, ImageUp, X } from "lucide-react";
import { FieldLabel, OptionCard, TextInput } from "./ui";
import { Button } from "@/components/ui/Button";

export interface ReciboFormState {
  fuente: "foto" | "manual";
  imageFile: File | null;
  consumoMensualKwh: string;
  valorPagadoMensual: string;
}

export function StepReceipt({
  value,
  onChange,
  onNext,
}: {
  value: ReciboFormState;
  onChange: (v: ReciboFormState) => void;
  onNext: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const canContinue =
    value.fuente === "foto"
      ? Boolean(value.imageFile)
      : Boolean(value.consumoMensualKwh || value.valorPagadoMensual);

  function handleFile(file: File | null) {
    onChange({ ...value, imageFile: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-ink-950">
        1. Cuéntanos sobre tu recibo de luz
      </h3>
      <p className="mt-1 text-sm text-ink-800/60">
        Sube una foto o ingresa los datos manualmente.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <OptionCard
          selected={value.fuente === "foto"}
          onClick={() => onChange({ ...value, fuente: "foto" })}
          title="Subir foto"
          description="El agente lee tu recibo"
          icon={<Camera className="h-4 w-4" />}
        />
        <OptionCard
          selected={value.fuente === "manual"}
          onClick={() => onChange({ ...value, fuente: "manual" })}
          title="Ingresar a mano"
          description="Consumo y valor pagado"
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      {value.fuente === "foto" ? (
        <div className="mt-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {!preview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-black/15 py-10 text-center transition-colors hover:border-sun-500/50 hover:bg-sun-500/5"
            >
              <ImageUp className="h-6 w-6 text-ink-800/40" />
              <span className="text-sm font-medium text-ink-950">
                Toca para subir una foto de tu recibo
              </span>
              <span className="text-xs text-ink-800/45">JPG, PNG o WEBP</span>
            </button>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Recibo cargado" className="max-h-64 w-full object-contain bg-black/5" />
              <button
                type="button"
                onClick={() => handleFile(null)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow"
              >
                <X className="h-4 w-4 text-ink-950" />
              </button>
            </div>
          )}
          <p className="mt-3 text-xs text-ink-800/50">
            También puedes completar el consumo o valor manualmente si la
            lectura automática no está disponible.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Consumo (kWh) — opcional</FieldLabel>
              <TextInput
                type="number"
                min={0}
                placeholder="Ej. 280"
                value={value.consumoMensualKwh}
                onChange={(e) =>
                  onChange({ ...value, consumoMensualKwh: e.target.value })
                }
              />
            </div>
            <div>
              <FieldLabel>Valor pagado (COP) — opcional</FieldLabel>
              <TextInput
                type="number"
                min={0}
                placeholder="Ej. 240000"
                value={value.valorPagadoMensual}
                onChange={(e) =>
                  onChange({ ...value, valorPagadoMensual: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Consumo mensual (kWh)</FieldLabel>
            <TextInput
              type="number"
              min={0}
              placeholder="Ej. 280"
              value={value.consumoMensualKwh}
              onChange={(e) =>
                onChange({ ...value, consumoMensualKwh: e.target.value })
              }
            />
          </div>
          <div>
            <FieldLabel>Valor pagado (COP)</FieldLabel>
            <TextInput
              type="number"
              min={0}
              placeholder="Ej. 240000"
              value={value.valorPagadoMensual}
              onChange={(e) =>
                onChange({ ...value, valorPagadoMensual: e.target.value })
              }
            />
          </div>
          <p className="text-xs text-ink-800/50 sm:col-span-2">
            Con solo uno de los dos datos podemos estimar el otro.
          </p>
        </div>
      )}

      <div className="mt-7 flex justify-end">
        <Button onClick={onNext} disabled={!canContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
