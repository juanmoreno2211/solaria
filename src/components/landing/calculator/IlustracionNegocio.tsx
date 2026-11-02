import type { TipoNegocio } from "@/lib/savings/types";

const TINTA = "#1c2330";
const CREMA = "#fdfbf7";
const ARENA = "#efe4d0";
const SOL = "#d9842b";
const BRASA = "#cc6a2e";
const LUZ = "#f1d2a3";
const HOJA = "#3f9c67";
const PUERTA = "#2a3342";

const trazo = { stroke: TINTA, strokeWidth: 1.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Suelo() {
  return <line x1="6" y1="44" x2="66" y2="44" {...trazo} />;
}

function Tienda() {
  const franjas = [0, 1, 2, 3, 4, 5];
  return (
    <>
      <rect x="14" y="17" width="44" height="27" fill={CREMA} {...trazo} />
      <rect x="12" y="13" width="48" height="4" rx="1" fill={TINTA} />
      {franjas.map((i) => {
        const x = 14 + i * (44 / 6);
        const color = i % 2 === 0 ? SOL : ARENA;
        return (
          <g key={i}>
            <rect x={x} y="19" width={44 / 6} height="5" fill={color} />
            <path d={`M${x} 24 a ${44 / 12} 2.6 0 0 0 ${44 / 6} 0 Z`} fill={color} />
          </g>
        );
      })}
      <rect x="19" y="30" width="15" height="9" rx="1" fill={LUZ} {...trazo} />
      <rect x="40" y="29" width="11" height="15" rx="1" fill={PUERTA} />
      <Suelo />
    </>
  );
}

function Restaurante() {
  return (
    <>
      <path d="M30 8 c-3 3 3 5 0 8 M36 6 c-3 3 3 5 0 8 M42 8 c-3 3 3 5 0 8" fill="none" stroke={SOL} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="36" cy="40" rx="22" ry="4" fill={ARENA} {...trazo} />
      <path d="M22 20 h28 v8 a14 11 0 0 1 -28 0 Z" fill={CREMA} {...trazo} />
      <ellipse cx="36" cy="20" rx="14" ry="2.6" fill={BRASA} {...trazo} />
      <path d="M50 23 a5.5 5.5 0 0 1 0 11" fill="none" {...trazo} />
    </>
  );
}

function Consultorio() {
  return (
    <>
      <rect x="15" y="14" width="42" height="30" fill={CREMA} {...trazo} />
      <rect x="13" y="11" width="46" height="4" rx="1" fill={TINTA} />
      <circle cx="36" cy="23" r="6.5" fill={HOJA} />
      <rect x="34.6" y="19" width="2.8" height="8" rx="0.6" fill={CREMA} />
      <rect x="32" y="21.6" width="8" height="2.8" rx="0.6" fill={CREMA} />
      <rect x="19" y="32" width="8" height="6" rx="1" fill={LUZ} {...trazo} />
      <rect x="45" y="32" width="8" height="6" rx="1" fill={LUZ} {...trazo} />
      <rect x="31.5" y="33" width="9" height="11" rx="1" fill={PUERTA} />
      <Suelo />
    </>
  );
}

function Taller() {
  return (
    <>
      <path d="M28 22 v-6 a2 2 0 0 1 2 -2 h12 a2 2 0 0 1 2 2 v6" fill="none" {...trazo} />
      <rect x="13" y="22" width="46" height="20" rx="2.5" fill={SOL} {...trazo} />
      <rect x="13" y="22" width="46" height="6" rx="2.5" fill={BRASA} {...trazo} />
      <rect x="32" y="26" width="8" height="5" rx="1" fill={LUZ} {...trazo} />
      <Suelo />
    </>
  );
}

function Finca() {
  return (
    <>
      <circle cx="57" cy="11" r="5" fill="#e2a152" />
      <path d="M12 44 V27 L23 18 L34 27 V44 Z" fill={BRASA} {...trazo} />
      <rect x="18" y="32" width="10" height="12" fill={CREMA} {...trazo} />
      <path d="M18 32 L28 44 M28 32 L18 44" {...trazo} />
      <path d="M38 44 q10 -6 28 -6 M38 39 q10 -5 28 -5 M40 34 q9 -4 26 -4" fill="none" stroke={HOJA} strokeWidth="1.8" strokeLinecap="round" />
      <Suelo />
    </>
  );
}

function Otro() {
  return (
    <>
      <path d="M16 44 V24 L36 12 L56 24 V44" fill={CREMA} stroke={TINTA} strokeWidth="1.5" strokeDasharray="3 3" strokeLinejoin="round" />
      <circle cx="29" cy="32" r="2" fill={SOL} />
      <circle cx="36" cy="32" r="2" fill={SOL} />
      <circle cx="43" cy="32" r="2" fill={SOL} />
      <Suelo />
    </>
  );
}

const DIBUJOS: Record<TipoNegocio, () => React.ReactElement> = {
  tienda: Tienda,
  restaurante: Restaurante,
  consultorio: Consultorio,
  taller: Taller,
  finca: Finca,
  otro: Otro,
};

/** Dibujo pequeño del tipo de negocio, en el mismo estilo que la ilustración principal. */
export function IlustracionNegocio({ tipo, className }: { tipo: TipoNegocio; className?: string }) {
  const Dibujo = DIBUJOS[tipo];
  return (
    <svg viewBox="0 0 72 48" aria-hidden="true" className={className}>
      <Dibujo />
    </svg>
  );
}
