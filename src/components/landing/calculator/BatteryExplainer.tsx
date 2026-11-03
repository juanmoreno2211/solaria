"use client";

import { useId, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BatteryCharging,
  Moon,
  PowerOff,
  Sun,
  Zap,
} from "lucide-react";
import { Desplegable } from "./Desplegable";
import { IlustracionNegocio } from "./IlustracionNegocio";
import styles from "./BatteryExplainer.module.css";

type Situacion = "dia" | "noche" | "corte";

const SITUACIONES: { id: Situacion; label: string; Icono: typeof Sun }[] = [
  { id: "dia", label: "Con sol", Icono: Sun },
  { id: "noche", label: "De noche", Icono: Moon },
  { id: "corte", label: "En un corte", Icono: PowerOff },
];

const EXPLICACION: Record<Situacion, { texto: string; bateria: string }> = {
  dia: {
    texto: "Los paneles generan electricidad. El inversor la adapta para tu negocio y, si hay energía disponible después del consumo, el sistema puede cargar la batería.",
    bateria: "Puede cargarse",
  },
  noche: {
    texto: "Sin sol, los paneles dejan de generar. La batería puede alimentar los equipos previstos mientras conserve carga. En un sistema conectado, la red también puede complementar el suministro.",
    bateria: "Entrega energía",
  },
  corte: {
    texto: "Con un inversor de respaldo y un circuito adecuado, la batería puede atender los equipos elegidos durante el corte. Los paneles pueden apoyar si hay sol. La duración depende de la carga disponible y del consumo.",
    bateria: "Respalda equipos",
  },
};

/** Ilustración vectorial del panel: los textos y las flechas se adaptan al ancho. */
function PanelSolar() {
  return (
    <svg viewBox="0 0 72 52" aria-hidden="true" focusable="false">
      <path d="M20 38 16 47M53 38l4 9M11 47h51" fill="none" stroke="#1c2330" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m14 9 46 0 8 29H6Z" fill="#2a3342" stroke="#1c2330" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M11 23h52M29 9l-2 29M44 9l2 29" fill="none" stroke="#9eacb9" strokeWidth="1.2" />
      <path d="M13 12h44" stroke="#f1d2a3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BatteryExplainer() {
  const id = useId();
  const [situacion, setSituacion] = useState<Situacion>("dia");
  const actual = EXPLICACION[situacion];
  const conSol = situacion === "dia";

  return (
    <Desplegable
      titulo="¿Cómo funcionan los paneles con baterías?"
      icono={<BatteryCharging className="h-4 w-4" aria-hidden="true" />}
      className={styles.explainer}
    >
      <div className={styles.switcher} role="group" aria-label="Situación del sistema solar">
        {SITUACIONES.map(({ id: opcion, label, Icono }) => (
          <button key={opcion} type="button" aria-pressed={situacion === opcion}
            className={`${styles.stateButton} ${situacion === opcion ? styles.activeState : ""}`}
            onClick={() => setSituacion(opcion)}>
            <Icono aria-hidden="true" />{label}
          </button>
        ))}
      </div>

      <figure className={styles.figure} aria-labelledby={`${id}-caption`}>
        <div className={styles.diagram} aria-hidden="true">
          <div className={`${styles.node} ${styles.panels} ${situacion === "noche" ? styles.inactiveNode : ""}`}>
            <span className={styles.drawing}><PanelSolar /></span>
            <span className={styles.nodeLabel}>Paneles solares</span>
          </div>
          <span className={`${styles.flow} ${styles.panelFlow} ${conSol ? styles.solarFlow : styles.inactiveFlow}`}><ArrowRight /></span>
          <div className={`${styles.node} ${styles.inverter}`}>
            <span className={styles.inverterDrawing}><Zap /></span>
            <span className={styles.nodeLabel}>Inversor</span>
          </div>
          <span className={`${styles.flow} ${styles.businessFlow} ${conSol ? styles.solarFlow : styles.storedFlow}`}><ArrowRight /></span>
          <div className={`${styles.node} ${styles.business}`}>
            <span className={styles.drawing}><IlustracionNegocio tipo="tienda" /></span>
            <span className={styles.nodeLabel}>{situacion === "corte" ? "Equipos elegidos" : "Tu negocio"}</span>
          </div>
          <span className={`${styles.flow} ${styles.batteryFlow} ${styles.storedFlow}`}>{conSol ? <ArrowDown /> : <ArrowUp />}</span>
          <div className={`${styles.node} ${styles.battery}`}>
            <span className={styles.batteryDrawing}><BatteryCharging /></span>
            <span className={styles.nodeLabel}>Batería</span>
            <span className={styles.nodeHint}>{actual.bateria}</span>
          </div>
        </div>
        <figcaption id={`${id}-caption`} className={styles.caption} aria-live="polite" aria-atomic="true">
          <span>{actual.texto}</span>
        </figcaption>
      </figure>
    </Desplegable>
  );
}
