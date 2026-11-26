import { formatCOP } from "@/lib/format";

/**
 * Bono por referido: si la persona invitada instala paneles con SolarIA,
 * quien la invitó recibe este valor para sus propios paneles. Cámbialo aquí.
 */
export const BONO_REFERIDO_COP = 200_000;

export const TEXTO_BONO_REFERIDO = `Si tu socio instala paneles con SolarIA, te regalamos ${formatCOP(BONO_REFERIDO_COP)} para los tuyos.`;
