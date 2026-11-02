"use client";

import { useId } from "react";
import { BatteryCharging, HelpCircle, PlugZap, Sun } from "lucide-react";
import { ColombiaRegionMap } from "./ColombiaRegionMap";
import { BatteryExplainer } from "./BatteryExplainer";
import {
    REGION_DEPARTMENTS,
    REGION_KEYS,
    REGION_LABELS,
    regionForDepartment,
    } from "@/lib/geo/regions";
    import {
    DATOS_DEPARTAMENTO,
    datosDepartamento,
    hspParaCalculo,
    } from "@/lib/geo/departamentos";
    import { PERFORMANCE_RATIO } from "@/lib/config/pricing";
    import type {
    ConexionElectrica,
    ZonaNegocio,
    } from "@/lib/catalog/types";
    import styles from "./SolarWidgets.module.css";

    export interface SolarLocation {
    region: string;
    departamento: string;
    conexion: ConexionElectrica | "";
    zona: ZonaNegocio | "";
    municipio: string;
    }

    interface Props {
    value: SolarLocation;
    onChange: (location: SolarLocation) => void;
    }

    const fmt = (n: number) =>
    n.toLocaleString("es-CO", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });

    const TOTAL = Object.keys(DATOS_DEPARTAMENTO).length;

    const OPCIONES_CONEXION: {
    valor: ConexionElectrica;
    titulo: string;
    descripcion: string;
    icono: typeof Sun;
    }[] = [
    {
        valor: "estable",
        titulo: "Tengo red eléctrica estable",
        descripcion:
        "La energía casi nunca se corta. La prioridad es reducir la factura.",
        icono: PlugZap,
    },
    {
        valor: "intermitente",
        titulo: "Tengo red, pero hay cortes",
        descripcion:
        "A veces se va la luz y podría necesitar baterías de respaldo.",
        icono: BatteryCharging,
    },
    {
        valor: "sin_red",
        titulo: "No tengo conexión a la red",
        descripcion:
        "Necesito un sistema solar autónomo con baterías.",
        icono: Sun,
    },
    {
        valor: "no_se",
        titulo: "No estoy seguro",
        descripcion:
        "Te ayudamos a identificar cómo llega la energía a tu negocio.",
        icono: HelpCircle,
    },
    ];

    function puestoSol(departamento: string): number | undefined {
    const propio = hspParaCalculo(departamento);

    if (propio === undefined) return undefined;

    const mayores = Object.keys(DATOS_DEPARTAMENTO).filter(
        (d) => (hspParaCalculo(d) ?? 0) > propio,
    );

    return mayores.length + 1;
    }

    function SolDelDepartamento({
    departamento,
    }: {
    departamento: string;
    }) {
    const datos = datosDepartamento(departamento);
    const hsp = hspParaCalculo(departamento);

    if (!datos || hsp === undefined) return null;

    const kwhPorKwp = Math.round(hsp * PERFORMANCE_RATIO * 30);
    const puesto = puestoSol(departamento);

    const rango =
        datos.hspMin === datos.hspMax
        ? "Promedio del departamento."
        : `Rango departamental: ${fmt(datos.hspMin)} a ${fmt(
            datos.hspMax,
            )} HSP. Se usa el punto medio.`;

    return (
        <div className={styles.solDato}>
        <div className={styles.solVelo}>
            <div className={styles.solPrincipal}>
            <span className={styles.solIcono} aria-hidden="true">
                <Sun className="h-5 w-5" strokeWidth={1.75} />
            </span>

            <div className={styles.solTexto}>
                <p className={styles.solEtiqueta}>
                Horas de sol pico al día
                </p>

                <p className={styles.solCifra}>
                {fmt(hsp)}
                <span className={styles.solUnidad}>HSP</span>
                </p>

                <p className={styles.solSubtitulo}>
                En {departamento}
                {puesto !== undefined
                    ? ` · Puesto ${puesto} de ${TOTAL} a nivel nacional`
                    : ""}
                </p>
            </div>
            </div>

            <div className={styles.solDetalle}>
            <p>
                Cada kWp de paneles podría generar cerca de{" "}
                <b>{kwhPorKwp} kWh al mes</b>.
            </p>

            <p className={styles.solRango}>{rango}</p>
            </div>
        </div>
        </div>
    );
    }

    export function LocationSelector({ value, onChange }: Props) {
    const id = useId();

    const departamento = regionForDepartment(value.departamento)
        ? value.departamento
        : "";

    function select(nextDepartment: string) {
        const region = regionForDepartment(nextDepartment);

        onChange(
        region
            ? {
                ...value,
                region,
                departamento: nextDepartment,
            }
            : {
                ...value,
                region: "",
                departamento: "",
            },
        );
    }

    function seleccionarConexion(conexion: ConexionElectrica) {
        onChange({ ...value, conexion });
    }

    return (
        <section
        className={styles.location}
        aria-labelledby={`${id}-title`}
        >
        <h4 id={`${id}-title`} className={styles.pregunta}>
            ¿Dónde está tu negocio?
        </h4>

        <p className={styles.description}>
            La ubicación determina cuánta energía solar puede generar tu negocio.
        </p>

        {/* Primero: mapa y departamento */}
        <div className={styles.locationGrid}>
            <div className={styles.mapCanvas}>
            <ColombiaRegionMap
                departamento={departamento}
                onSelect={select}
            />
            </div>

            <div className={styles.locationFields}>
            <label htmlFor={`${id}-department`}>
                También puedes elegir tu departamento de la lista

                <select
                id={`${id}-department`}
                value={departamento}
                onChange={(event) => select(event.target.value)}
                >
                <option value="">Selecciona tu departamento</option>

                {REGION_KEYS.map((region) => (
                    <optgroup
                    key={region}
                    label={REGION_LABELS[region]}
                    >
                    {[...REGION_DEPARTMENTS[region]]
                        .sort((a, b) => a.localeCompare(b, "es"))
                        .map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                        ))}
                    </optgroup>
                ))}
                </select>
            </label>

            <div aria-live="polite" aria-atomic="true">
                {departamento ? (
                <SolDelDepartamento departamento={departamento} />
                ) : (
                <p className={styles.solVacio}>
                    Cuando elijas tu departamento, verás cuánto sol recibe y
                    cuánta energía podría generar cada kWp de paneles.
                </p>
                )}
            </div>

            <p className={styles.aviso}>
                Promedios orientativos del departamento. El instalador debe
                confirmarlos con tu dirección y las sombras de tu techo.
            </p>
            </div>
        </div>

        {/* Después: conexión eléctrica */}
        <div className="mt-7 border-t border-ink-950/10 pt-7">
            <h4
            id={`${id}-connection-title`}
            className={styles.pregunta}
            >
            ¿Cómo llega la energía a tu negocio?
            </h4>

            <p className={styles.description}>
            Cuéntanos si tienes electricidad de la red y qué tan confiable es.
            </p>

            <div
            className={styles.opcionesConexion}
            role="group"
            aria-labelledby={`${id}-connection-title`}
            >
            {OPCIONES_CONEXION.map((opcion) => {
                const Icono = opcion.icono;
                const seleccionada = value.conexion === opcion.valor;

                return (
                <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => seleccionarConexion(opcion.valor)}
                    aria-pressed={seleccionada}
                    className={`${styles.tarjetaOpcion} ${
                    seleccionada ? styles.tarjetaOpcionActiva : ""
                    }`}
                >
                    <span
                    className={styles.iconoOpcion}
                    aria-hidden="true"
                    >
                    <Icono
                        className="h-4 w-4"
                        strokeWidth={1.75}
                    />
                    </span>

                    <span className={styles.textoOpcion}>
                    <span className={styles.tituloOpcion}>
                        {opcion.titulo}
                    </span>

                    <span className={styles.descripcionOpcion}>
                        {opcion.descripcion}
                    </span>
                    </span>
                </button>
                );
            })}
            </div>

            <BatteryExplainer />


        </div>
        </section>
    );
}