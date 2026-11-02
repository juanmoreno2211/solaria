import { Container } from "@/components/ui/Container";
import { ImagenSubida } from "@/components/ui/ImagenSubida";
import { buscarImagen, EN_DESARROLLO } from "@/lib/imagenes";

/** Las 8 fotos del fondo: public/imagenes/por-que/1.jpg … 8.jpg */
const FOTOS = ["A", "B", "C", "D", "E", "F2","G","H"].map((n) => `imagenes/por-que/${n}`);
const FUENTE_MINENERGIA =
  "https://minenergia.gov.co/es/sala-de-prensa/noticias-index/colombia-supera-los-24000-techos-solares-y-acelera-la-democratizacion-de-la-energia-limpia/";
const FUENTE_DANE =
  "https://www.dane.gov.co/files/operaciones/EMICRON/pres-EMICRON-Itrim2024.pdf";
const FUENTE_XM =
  "https://www.lafm.com.co/economia/xm-alerta-embalses-bajas-lluvias-riesgos-suministro-energia-verano-2027-415808";
const FUENTE_PORTAFOLIO =
"https://www.portafolio.co/energia/colombia-podria-enfrentar-un-deficit-de-energia-en-2027-xm-advierte-faltantes-de-hasta-7-669-gwh-504633";


function Fuente({ enlaces }: { enlaces: { nombre: string; url: string }[] }) {
  return (
    <dd className="mt-3 text-xs text-white/40">
      Fuente:{" "}
      {enlaces.map((enlace, index) => (
        <span key={enlace.nombre}>
          {index > 0 && " · "}
          <a
            href={enlace.url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/25 underline-offset-2 transition hover:text-white/75"
          >
            {enlace.nombre}
          </a>
        </span>
      ))}
    </dd>
  );
}

function UnoDeDoscientos() {
  const ENCENDIDO = 87;

  return (
    <div
      aria-hidden
      className="grid w-fit grid-cols-[repeat(20,minmax(0,1fr))] gap-[5px]"
    >
      {Array.from({ length: 200 }, (_, punto) => (
        <span
          key={punto}
          className={
            punto === ENCENDIDO
              ? "size-1.5 rounded-full bg-sun-300 shadow-[0_0_10px_3px_rgba(231,184,118,0.65)]"
              : "size-1.5 rounded-full bg-white/20"
          }
        />
      ))}
    </div>
  );
}

export function ProblemSolution() {
  const faltan = FOTOS.filter((foto) => !buscarImagen(foto)).length;

  return (
    <section
      id="por-que"
      className="relative overflow-hidden bg-ink-950 py-24 text-white sm:py-32"
    >
      {/* Fondo fotográfico */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 grid grid-cols-2 grid-rows-4 gap-px md:grid-cols-4 md:grid-rows-2"
      >
        {FOTOS.map((foto) => (
          <ImagenSubida
            key={foto}
            base={foto}
            ajuste="cover"
            aviso={false}
            sizes="(min-width: 768px) 25vw, 50vw"
            className="h-full w-full bg-white/[0.06]"
            respaldo={null}
          />
        ))}
      </div>

      {/* Degradado igual al Hero: oscuro a la izquierda, fotos visibles a la derecha */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,14,22,0.88) 0%, rgba(10,14,22,0.64) 55%, rgba(10,14,22,0.30) 100%)",
        }}
      />

      <Container className="relative z-10">
        <h2 className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-200">
          <span aria-hidden className="h-px w-6 bg-sun-300/60" />
          El problema
        </h2>

        <dl className="mt-10 grid gap-14 border-t border-white/15 pt-10 md:grid-cols-2 md:gap-16">
          <div className="space-y-12">
            <div>
              <dt className="text-5xl font-semibold tracking-[-0.045em] text-sun-300 tabular-nums sm:text-6xl">
                266,56 GWh
              </dt>
              <dd className="mt-4 max-w-[38ch] text-base leading-[1.75] text-white/85 sm:text-lg">
                Fue la demanda diaria máxima de electricidad en 2026, con un
                pico de 12.706 MW. El sistema eléctrico está operando bajo
                presión histórica.
              </dd>
              <Fuente enlaces={[{ nombre: "La FM", url: FUENTE_XM }]} />
            </div>

            <div>
              <dt className="text-4xl font-semibold tracking-[-0.04em] text-sun-300 sm:text-5xl">
                Riesgo de déficit
              </dt>
              <dd className="mt-4 max-w-[38ch] text-base leading-[1.75] text-white/85 sm:text-lg">
                Si el verano de 2027 es severo y la generación térmica no
                responde, Colombia podría no cubrir completamente la demanda
                entre febrero y abril.
              </dd>
              <Fuente enlaces={[{ nombre: "Portafolio", url: FUENTE_PORTAFOLIO }]} />
            </div>
          </div>

          <div>
            <dt className="text-5xl font-semibold tracking-[-0.045em] tabular-nums sm:text-6xl">
              Menos de 1 de cada 200
            </dt>
            <dd className="mt-4 max-w-[38ch] text-base leading-[1.75] text-white/85 sm:text-lg">
              micronegocios tiene un techo solar registrado.
            </dd>

            <dd className="mt-7">
              <UnoDeDoscientos />
            </dd>

            <dd className="mt-6 max-w-[42ch] text-sm leading-relaxed text-white/70">
              Colombia suma 24.447 sistemas solares de techo y autogeneración
              registrados, frente a cerca de 5 millones de micronegocios.
            </dd>

            <Fuente
              enlaces={[
                { nombre: "MinEnergía", url: FUENTE_MINENERGIA },
                { nombre: "DANE", url: FUENTE_DANE },
              ]}
            />
          </div>
        </dl>

        {EN_DESARROLLO && faltan > 0 && (
          <p className="mt-8 text-xs text-sun-300/80">
            Faltan {faltan} de 8 fotos del fondo: súbelas como
            public/imagenes/por-que/1.jpg a 8.jpg
          </p>
        )}
      </Container>
    </section>
  );
}