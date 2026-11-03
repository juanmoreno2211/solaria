import Image from "next/image";
import clsx from "clsx";
import type { ReactNode } from "react";
import { buscarImagen, EN_DESARROLLO } from "@/lib/imagenes";

/**
 * Un espacio para una imagen que sube el equipo a /public.
 * - Si el archivo existe, lo muestra.
 * - Si no, muestra `respaldo` (un dibujo o ícono) para que la página no se vea rota.
 * - En desarrollo, además dice qué archivo falta y dónde ponerlo.
 */
export function ImagenSubida({
  base,
  alt = "",
  respaldo,
  sizes,
  ajuste = "contain",
  aviso = true,
  className,
}: {
  /** Ruta dentro de /public, sin extensión. Ej.: "imagenes/como-funciona/recibo". */
  base: string;
  /** Vacío si es decorativa (el texto al lado ya dice lo mismo). */
  alt?: string;
  respaldo: ReactNode;
  sizes: string;
  ajuste?: "contain" | "cover";
  /** En espacios pequeños el aviso de desarrollo no cabe: se marca solo con un borde. */
  aviso?: boolean;
  className?: string;
}) {
  const imagen = buscarImagen(base);

  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {imagen ? (
        <Image
          src={imagen.src}
          alt={alt}
          fill
          sizes={sizes}
          unoptimized={imagen.esSvg}
          className={ajuste === "cover" ? "object-cover" : "object-contain"}
        />
      ) : (
        <>
          <div className="flex h-full w-full items-center justify-center">{respaldo}</div>
          {EN_DESARROLLO && !aviso && (
            <span
              title={`Falta la imagen: public/${base}`}
              className="absolute inset-0 rounded-[inherit] border border-dashed border-sun-500/60"
            />
          )}
          {EN_DESARROLLO && aviso && (
            <p className="absolute inset-x-2 bottom-2 rounded-md border border-dashed border-sun-500/50 bg-white/85 px-2 py-1 text-center text-[10px] leading-snug text-sun-600">
              Falta la imagen: public/{base}.png (o .webp, .jpg, .svg)
            </p>
          )}
        </>
      )}
    </div>
  );
}
