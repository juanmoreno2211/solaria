import {describe,it,expect} from "vitest";
import {proyectar20Anios} from "./projection";
describe("Proyección de veinte años",()=>{
    it("incluye exactamente inversión inicial y veinte cierres anuales",()=>{const p=proyectar20Anios({inversion:12_000,ahorroMensual:100,degradacionPct:0,mantenimientoAnualPct:0});expect(p.rows).toHaveLength(21);expect(p.rows[0].netoAcumulado).toBe(-12_000);expect(p.neto20).toBe(12_000);expect(p.retornoAnios).toBe(10);});
    it("descuenta mantenimiento y aplica degradación desde el segundo año",()=>{const p=proyectar20Anios({inversion:10_000,ahorroMensual:100,degradacionPct:1,mantenimientoAnualPct:2});expect(p.rows[1].ahorroNetoAnual).toBe(1000);expect(p.rows[2].ahorroBruto).toBe(1188);expect(p.rows[2].ahorroNetoAnual).toBe(988);});
    it("no inventa un retorno si el flujo no recupera la inversión",()=>{const p=proyectar20Anios({inversion:100_000,ahorroMensual:10});expect(p.retornoAnios).toBeNull();expect(p.neto20).toBeLessThan(0);});
    it("trata la variación como un supuesto editable",()=>{const p=proyectar20Anios({inversion:1000,ahorroMensual:100,variacionTarifaPct:5,degradacionPct:0,mantenimientoAnualPct:0});expect(p.rows[2].ahorroBruto).toBe(1260);});
    });
