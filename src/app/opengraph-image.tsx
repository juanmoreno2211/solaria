import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#070b14",
          backgroundImage:
            "radial-gradient(circle at 12% 10%, rgba(253,184,51,0.35) 0%, rgba(253,184,51,0) 55%), radial-gradient(circle at 88% 85%, rgba(34,197,94,0.28) 0%, rgba(34,197,94,0) 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #e2a152 0%, #d9842b 100%)",
            }}
          >
            <svg
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#070b14"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M17.66 17.66l1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M6.34 17.66l-1.41 1.41" />
              <path d="M19.07 4.93l-1.41 1.41" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 800, color: "white" }}>
            Solar<span style={{ color: "#e2a152" }}>IA</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 44,
            fontWeight: 700,
            color: "white",
            maxWidth: 920,
            lineHeight: 1.25,
          }}
        >
          ¿Le conviene la energía solar a tu negocio?
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 26,
            color: "rgba(255,255,255,0.6)",
            maxWidth: 860,
          }}
        >
          Con el recibo de luz de tu negocio, mira cuánto ahorrarías con
          paneles solares y pide una cotización.
        </div>
      </div>
    ),
    { ...size }
  );
}
