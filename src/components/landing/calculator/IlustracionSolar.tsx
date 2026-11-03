import { useId } from "react";

/**
 * Ilustración propia (sin derechos de terceros): un negocio de barrio con
 * paneles en el techo. Usa la paleta de la marca y escala sin perder calidad.
 * El sol gira muy despacio, salvo si el usuario pidió reducir el movimiento.
 */
export function IlustracionSolar({ className }: { className?: string }) {
  const id = useId();
  const sol = `${id}-sol`;
  const brillo = `${id}-brillo`;

  // Paneles inclinados hacia el sol: base en y=112, borde alto en y=92.
  const paneles = [84, 136, 188];
  const tiras = Array.from({ length: 8 }, (_, i) => i);

  return (
    <svg
      viewBox="0 0 360 236"
      role="img"
      aria-label="Ilustración de un negocio con paneles solares en el techo"
      className={className}
    >
      <defs>
        <radialGradient id={sol} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f1d2a3" />
          <stop offset="60%" stopColor="#e2a152" />
          <stop offset="100%" stopColor="#d9842b" />
        </radialGradient>
        <linearGradient id={brillo} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Halo y sol */}
      <circle cx="292" cy="58" r="58" fill="#f1d2a3" opacity="0.32" />
      <g
        className="motion-safe:animate-[spin_48s_linear_infinite]"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          // Redondeado: el servidor y el navegador calculan senos con decimales distintos.
          const r = (n: number) => Math.round(n * 100) / 100;
          return (
            <line
              key={i}
              x1={r(292 + Math.cos(a) * 33)}
              y1={r(58 + Math.sin(a) * 33)}
              x2={r(292 + Math.cos(a) * 42)}
              y2={r(58 + Math.sin(a) * 42)}
              stroke="#e2a152"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx="292" cy="58" r="24" fill={`url(#${sol})`} />

      {/* Energía que baja del sol a los paneles */}
      <path
        d="M268 74 C 240 84, 222 86, 204 90"
        fill="none"
        stroke="#d9842b"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Suelo */}
      <ellipse cx="170" cy="213" rx="150" ry="9" fill="#efe4d0" />
      <line x1="24" y1="210" x2="336" y2="210" stroke="#1c2330" strokeWidth="1.5" strokeLinecap="round" />

      {/* Paneles */}
      {paneles.map((x) => (
        <g key={x}>
          <line x1={x + 46} y1={100} x2={x + 46} y2={110} stroke="#1c2330" strokeWidth="1.5" />
          <polygon
            points={`${x},112 ${x + 44},112 ${x + 52},92 ${x + 8},92`}
            fill="#11161f"
            stroke="#1c2330"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {[1, 2, 3].map((k) => (
            <line
              key={k}
              x1={x + 11 * k}
              y1={112}
              x2={x + 8 + 11 * k}
              y2={92}
              stroke="#3b4658"
              strokeWidth="0.8"
            />
          ))}
          <line x1={x + 4} y1={102} x2={x + 48} y2={102} stroke="#3b4658" strokeWidth="0.8" />
          <polygon points={`${x},112 ${x + 44},112 ${x + 52},92 ${x + 8},92`} fill={`url(#${brillo})`} />
        </g>
      ))}

      {/* Edificio */}
      <rect x="66" y="110" width="188" height="7" rx="2" fill="#1c2330" />
      <rect x="72" y="117" width="176" height="93" fill="#fdfbf7" stroke="#1c2330" strokeWidth="1.5" />

      {/* Toldo a rayas con borde ondulado */}
      {tiras.map((i) => {
        const ancho = 168 / tiras.length;
        const x = 76 + i * ancho;
        const color = i % 2 === 0 ? "#d9842b" : "#efe4d0";
        return (
          <g key={i}>
            <rect x={x} y={124} width={ancho} height={14} fill={color} />
            <path d={`M${x} 138 a ${ancho / 2} ${ancho / 2.4} 0 0 0 ${ancho} 0 Z`} fill={color} />
          </g>
        );
      })}
      <line x1="76" y1="124" x2="244" y2="124" stroke="#1c2330" strokeWidth="1.5" />

      {/* Vitrina */}
      <rect x="88" y="156" width="72" height="42" rx="2" fill="#f1d2a3" stroke="#1c2330" strokeWidth="1.5" />
      <line x1="124" y1="156" x2="124" y2="198" stroke="#1c2330" strokeWidth="1.2" />
      <line x1="88" y1="177" x2="160" y2="177" stroke="#1c2330" strokeWidth="1.2" />
      <rect x="95" y="167" width="8" height="10" rx="1" fill="#cc6a2e" opacity="0.8" />
      <rect x="106" y="163" width="7" height="14" rx="1" fill="#3f9c67" opacity="0.8" />
      <rect x="132" y="185" width="10" height="13" rx="1" fill="#2a3342" opacity="0.7" />
      <rect x="145" y="188" width="8" height="10" rx="1" fill="#cc6a2e" opacity="0.7" />

      {/* Puerta */}
      <rect x="178" y="152" width="48" height="58" rx="2" fill="#2a3342" />
      <rect x="184" y="158" width="36" height="22" rx="1.5" fill="#3b4658" />
      <circle cx="218" cy="186" r="2.2" fill="#e7b876" />

      {/* Matera */}
      <path d="M262 210 L282 210 L285 192 L259 192 Z" fill="#cc6a2e" />
      <ellipse cx="266" cy="180" rx="6" ry="13" fill="#3f9c67" transform="rotate(-18 266 180)" />
      <ellipse cx="279" cy="178" rx="6" ry="14" fill="#5fb983" transform="rotate(16 279 178)" />
      <ellipse cx="272" cy="174" rx="5" ry="15" fill="#2f7d50" />

      {/* Destellos */}
      <path d="M58 64 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#e7b876" />
      <path d="M36 98 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2 -4.5 -4.5 -2 4.5 -2 Z" fill="#f1d2a3" />
    </svg>
  );
}