import { AirVent, Cctv, CreditCard, Fan, Fuel, Lightbulb, Monitor, Plug, Refrigerator, Snowflake, type LucideProps } from "lucide-react";

/** Ícono de cada aparato del catálogo; los que no son del catálogo usan un enchufe. */
export function IconoAparato({ tipo, ...props }: { tipo?: string | null } & LucideProps) {
  switch (tipo) {
    case "nevera": return <Refrigerator {...props} />;
    case "congelador": return <Snowflake {...props} />;
    case "aire": return <AirVent {...props} />;
    case "computador": return <Monitor {...props} />;
    case "camaras": return <Cctv {...props} />;
    case "luces": return <Lightbulb {...props} />;
    case "ventilador": return <Fan {...props} />;
    case "datafono": return <CreditCard {...props} />;
    case "planta": return <Fuel {...props} />;
    default: return <Plug {...props} />;
  }
}
