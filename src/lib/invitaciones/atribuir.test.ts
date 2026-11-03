import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { atribuirInvitacion } from "./atribuir";
import { enlaceInvitacion, enlaceWhatsApp, rutaRegistroConInvitacion } from "./enlace";

function clienteFalso(respuesta: { data: unknown; error: { message: string } | null }) {
  const rpc = vi.fn().mockResolvedValue(respuesta);
  return { cliente: { rpc } as unknown as SupabaseClient, rpc };
}

describe("atribuirInvitacion", () => {
  it("llama a la función con solo el código: nunca un id de usuario", async () => {
    const { cliente, rpc } = clienteFalso({ data: true, error: null });
    const registrar = vi.fn().mockResolvedValue(undefined);
    expect(await atribuirInvitacion(cliente, "ABCDEFGHJK", registrar)).toBe(true);
    expect(rpc).toHaveBeenCalledWith("atribuir_invitacion", { p_codigo: "abcdefghjk" });
    expect(registrar).toHaveBeenCalledWith(cliente, "invitado_registrado", { codigo: "abcdefghjk" });
  });

  it("con un código inválido no consulta la base de datos", async () => {
    const { cliente, rpc } = clienteFalso({ data: true, error: null });
    const registrar = vi.fn();
    expect(await atribuirInvitacion(cliente, "x'; drop table", registrar)).toBe(false);
    expect(await atribuirInvitacion(cliente, undefined, registrar)).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
    expect(registrar).not.toHaveBeenCalled();
  });

  it("si la base de datos rechaza la atribución, no registra el evento", async () => {
    const { cliente } = clienteFalso({ data: false, error: null });
    const registrar = vi.fn();
    expect(await atribuirInvitacion(cliente, "abcdefghjk", registrar)).toBe(false);
    expect(registrar).not.toHaveBeenCalled();
  });

  it("si la función falla, no registra el evento", async () => {
    const { cliente } = clienteFalso({ data: null, error: { message: "boom" } });
    const registrar = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await atribuirInvitacion(cliente, "abcdefghjk", registrar)).toBe(false);
    expect(registrar).not.toHaveBeenCalled();
  });
});

describe("enlaces", () => {
  it("enlace /i/[codigo] sin barras dobles", () => {
    expect(enlaceInvitacion("https://solaria.co/", "abcdefghjk")).toBe("https://solaria.co/i/abcdefghjk");
  });

  it("WhatsApp sin número y con el enlace dentro del mensaje", () => {
    const url = enlaceWhatsApp("https://solaria.co/i/abcdefghjk");
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1])).toContain("https://solaria.co/i/abcdefghjk");
  });

  it("el registro conserva el código", () => {
    expect(rutaRegistroConInvitacion("abcdefghjk")).toBe("/ingresar?invitacion=abcdefghjk&siguiente=%2Fmi-negocio");
  });
});
