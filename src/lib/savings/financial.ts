import { presupuestoSolar, REFERENCIAS_COSTOS, SUPUESTOS_FINANCIEROS as S } from "@/lib/config/costs";
import { COBERTURA_POR_HORARIO, MANTENIMIENTO_ANUAL } from "@/lib/config/pricing";
import { errorFinanzas } from "./financial-validation";
import { proyectar20Anios, type ProjectionInput } from "./projection";
import type { AnalisisFinanciero } from "./financial-types";
import type { AnalisisInput, AlternativaResultado, OrientacionEnergetica } from "./types";

export function calcularFinanzas(input: AnalisisInput, energia: OrientacionEnergetica, valorMensual: number, paneles: AlternativaResultado): AnalisisFinanciero {
  const f = input.negocio.finanzas ?? {};
  const error = errorFinanzas(f);
  if (error) throw new RangeError(error);
  const conBateria = energia.conexion === "intermitente" || energia.conexion === "sin_red";
  const solar = presupuestoSolar(Math.max(energia.potenciaSolarBaseKwp, .0001));
  const modulo = REFERENCIAS_COSTOS.bateria;
  const modulosBateria = conBateria && energia.bateriaNominalKwh ? Math.ceil(energia.bateriaNominalKwh / modulo.capacidadNominalKwh) : 0;
  const bateria = modulosBateria * modulo.precioEquipoCOP;
  const adecuacion = conBateria ? solar.base * S.adecuacionRespaldoPct : 0;
  const adicionales = f.costosAdicionalesCOP ?? 0;
  const oferta = !conBateria ? paneles.mejorOferta : undefined;
  const cotizada = f.inversionTotalCOP !== undefined;
  const base = cotizada ? f.inversionTotalCOP! : oferta ? oferta.inversion + adicionales : solar.base + bateria + adecuacion + adicionales;
  const minimo = cotizada ? base : oferta ? oferta.inversionMin + adicionales : solar.minimo + bateria * .9 + adecuacion * .8 + adicionales;
  const maximo = cotizada ? base : oferta ? oferta.inversionMax + adicionales : solar.maximo + bateria * 1.1 + adecuacion * 1.2 + adicionales;
  const reposicionBateriaCOP = conBateria ? f.reposicionBateriaCOP ?? bateria * (1 + S.instalacionReposicionPct) : 0;
  const aniosReposicionBateria = f.aniosReposicionBateria ?? S.reposicionBateriaAnios;
  const supuestos = [
    "Presupuesto de referencia: no es una oferta de un proveedor ni un diseño definitivo.",
    "Los importes se interpretan como desembolso total con impuestos aplicables. No se suma ni se resta automáticamente otro 19 % de IVA.",
    "Los rangos solares son una calibración del simulador por tamaño; no una tarifa nacional ni una cotización verificada.",
    "Se trabaja en pesos de hoy, con variación real de tarifa 0 % y degradación solar de 0,5 % anual.",
  ];
  if (cotizada) supuestos.push("Se usa el total instalado ingresado. No se vuelven a sumar baterías, adecuaciones ni adicionales a ese total.");
  else if (conBateria) supuestos.push("La base solar incluye un inversor convencional. Se añade un margen del 20 % de esa base para adecuación de respaldo, no otro inversor completo; este margen requiere cotización.");
  if (!cotizada && f.costosAdicionalesCOP === undefined) supuestos.push("Transporte rural, refuerzo del techo y obras especiales no están incluidos: ingrésalos como costos adicionales o usa una cotización total.");
  if (conBateria) supuestos.push(`Presupuesto de equipo en módulos de ${modulo.capacidadNominalKwh} kWh nominales. La compatibilidad, potencia y cantidad permitida deben validarse; no garantiza autonomía de todo el negocio.`);
  if (conBateria && f.reposicionBateriaCOP === undefined) supuestos.push("Reposición: precio de los módulos más una reserva del 10 % para montaje, supuesto editable. Se repone antes del final de los 20 años; no se compra un banco nuevo al cerrar el año 20.");
  const r: AnalisisFinanciero = {
    estado: "incompleto", origen: cotizada ? "cotizacion_usuario" : oferta ? "catalogo" : "referencia",
    inversion: null, inversionMin: null, inversionMax: null, solar: solar.base, bateria, adecuacion, adicionales,
    modulosBateria, capacidadPresupuestadaKwh: modulosBateria * modulo.capacidadNominalKwh,
    mantenimientoAnual: null, ahorroMensualBase: null, reposicionBateriaCOP, aniosReposicionBateria,
    reposicionInversorCOP: f.reposicionInversorCOP ?? 0, aniosReposicionInversor: f.aniosReposicionInversor ?? 12,
    simulacionTributaria: false, supuestos,
  };
  if (energia.conexion === "no_se") return { ...r, motivo: "Primero confirma cómo llega la energía a tu negocio." };
  if (energia.potenciaSolarBaseKwp > 500 && !cotizada) return { ...r, motivo: "Para más de 500 kWp, ingresa un presupuesto instalado o solicita un estudio específico." };
  if (conBateria && !energia.bateriaNominalKwh && !(cotizada && f.reposicionBateriaCOP !== undefined)) return { ...r, motivo: "Indica potencia media y horas de respaldo para presupuestar la batería, o ingresa una cotización total y su costo de reposición." };
  r.estado = "estimado";
  r.inversion = base; r.inversionMin = minimo; r.inversionMax = maximo;
  r.mantenimientoAnual = f.mantenimientoAnualCOP ?? base * MANTENIMIENTO_ANUAL;
  if (f.mantenimientoAnualCOP === undefined) supuestos.push("Mantenimiento anual: 1,5 % de la inversión total, dentro de un rango de referencia de 1–2 %. No se añade otro mantenimiento porcentual a las baterías.");
  if (energia.conexion === "sin_red") {
    if (f.costoEnergiaActualCOP === undefined || f.porcentajeCostoEvitable === undefined) return { ...r, motivo: "Para comparar ahorro sin red, indica el costo actual de energía y la parte de ese gasto que se sustituiría. No se usa una tarifa urbana para el diésel." };
    r.costoEnergiaActualCOP = f.costoEnergiaActualCOP;
    r.porcentajeCostoEvitable = f.porcentajeCostoEvitable;
    r.ahorroMensualBase = f.costoEnergiaActualCOP * f.porcentajeCostoEvitable / 100;
    supuestos.push("Sin red: ahorro sobre el gasto y porcentaje sustituible ingresados. No se supone que la generación solar elimina todo el combustible.");
  } else {
    r.ahorroMensualBase = oferta && !cotizada ? oferta.ahorroMensual : valorMensual * COBERTURA_POR_HORARIO[input.negocio.horario];
    supuestos.push("Las baterías se valoran como respaldo. No se suma ahorro adicional por cortes evitados, ventas recuperadas o carga desde la red.");
  }
  const reposiciones: NonNullable<ProjectionInput["reposiciones"]> = [];
  if (conBateria) for (let anio = aniosReposicionBateria; anio < 20; anio += aniosReposicionBateria) reposiciones.push({ anio, costo: reposicionBateriaCOP, concepto: "Reposición del banco de baterías" });
  if (f.reposicionInversorCOP !== undefined) reposiciones.push({ anio: f.aniosReposicionInversor ?? 12, costo: f.reposicionInversorCOP, concepto: "Reposición del inversor" });
  else supuestos.push("La reposición del inversor no tiene costo confirmado. No se incluye si no se ingresa; el saldo futuro puede ser menor al mostrado.");
  const parametros: ProjectionInput = {
    inversion: base, ahorroMensual: r.ahorroMensualBase, degradacionPct: S.degradacionAnualPct,
    variacionTarifaPct: 0, mantenimientoAnualCOP: r.mantenimientoAnual, reposiciones,
  };
  if (f.simularDeduccion) {
    if (f.baseElegibleCOP === undefined || f.tarifaRentaPct === undefined || f.rentaLiquidaAnualCOP === undefined) throw new RangeError("Para simular renta, completa base elegible, tarifa de renta y renta líquida anual.");
    if (f.baseElegibleCOP > base) throw new RangeError("La base elegible no puede superar la inversión total. Revisa el presupuesto o ingresa la cotización completa.");
    parametros.deduccionRenta = { baseElegibleCOP: f.baseElegibleCOP, tarifaRentaPct: f.tarifaRentaPct, rentaLiquidaAnualCOP: f.rentaLiquidaAnualCOP };
    r.simulacionTributaria = true;
    supuestos.push("Simulación tributaria opcional: deducción total máxima del 50 % de la base elegible, limitada al 50 % de renta líquida por año durante hasta 15 años. Se supone renta y tarifa constantes; requiere validación del contador y certificación UPME.");
  }
  supuestos.push("IVA y aranceles no se restan automáticamente. La depreciación acelerada no se suma como un ingreso adicional; depende de activos, régimen y validación tributaria.");
  r.parametrosProyeccion = parametros;
  r.proyeccion = proyectar20Anios(parametros);
  return r;
}
