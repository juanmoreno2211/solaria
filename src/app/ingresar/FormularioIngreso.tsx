"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { FieldLabel, TextInput } from "@/components/landing/calculator/ui";
import { ingresar, registrarse, type EstadoIngreso } from "./actions";

type Modo = "ingresar" | "registrarse";

export function FormularioIngreso({
  siguiente,
  error,
  invitacion,
  modoInicial = "ingresar",
}: {
  siguiente?: string;
  error?: string;
  invitacion?: string;
  modoInicial?: Modo;
}) {
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [estadoIngreso, accionIngreso, ingresando] = useActionState<EstadoIngreso, FormData>(ingresar, {
    error: error === "enlace" ? "El enlace no es válido o ya venció. Ingresa o regístrate de nuevo." : undefined,
  });
  const [estadoRegistro, accionRegistro, registrando] = useActionState<EstadoIngreso, FormData>(registrarse, {});

  const estado = modo === "ingresar" ? estadoIngreso : estadoRegistro;
  const pendiente = ingresando || registrando;

  return (
    <div className="w-full max-w-sm rounded-xl border border-ink-950/10 bg-white p-6 sm:p-8">
      <div className="mb-6 grid grid-cols-2 rounded-lg bg-ink-950/5 p-1 text-sm font-semibold">
        {(["ingresar", "registrarse"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={clsx(
              "rounded-md py-2 transition-colors",
              modo === m ? "bg-white text-ink-950 shadow-sm" : "text-ink-950/55 hover:text-ink-950"
            )}
          >
            {m === "ingresar" ? "Ingresar" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <form action={modo === "ingresar" ? accionIngreso : accionRegistro} className="space-y-4">
        <input type="hidden" name="siguiente" value={siguiente ?? ""} />
        {invitacion && <input type="hidden" name="invitacion" value={invitacion} />}
        <div>
          <FieldLabel>Correo</FieldLabel>
          <TextInput name="correo" type="email" autoComplete="email" required />
        </div>
        <div>
          <FieldLabel>Contraseña</FieldLabel>
          <TextInput
            name="contrasena"
            type="password"
            autoComplete={modo === "ingresar" ? "current-password" : "new-password"}
            minLength={modo === "registrarse" ? 8 : undefined}
            required
          />
        </div>

        {estado.error && <p className="text-sm text-red-700" role="alert">{estado.error}</p>}
        {estado.mensaje && <p className="text-sm text-ink-950/70" role="status">{estado.mensaje}</p>}

        <Button type="submit" className="w-full" disabled={pendiente}>
          {modo === "ingresar" ? "Ingresar" : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
