import { CULTOS } from "../config.mjs";

const { fields } = foundry.data;

/** Característica con aspecto. */
function rasgo() {
  return new fields.SchemaField({
    valor: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
    aspecto: new fields.StringField({ initial: "" }),
    gastado: new fields.BooleanField({ initial: false })
  });
}

/** Elemento narrativo que se puede gastar (hito, complicación). */
function narrativo() {
  return new fields.SchemaField({
    texto: new fields.StringField({ initial: "" }),
    gastado: new fields.BooleanField({ initial: false })
  });
}

function contador(initial, max) {
  return new fields.SchemaField({
    value: new fields.NumberField({ required: true, integer: true, initial, min: 0 }),
    max: new fields.NumberField({ required: true, integer: true, initial: max, min: 0 })
  });
}

function grupo(claves, factory) {
  return new fields.SchemaField(Object.fromEntries(Object.keys(claves).map(k => [k, factory()])));
}

/**
 * Campos comunes a personajes y PNJ.
 * TODO (reglas): Resistencia, Aguante, Estabilidad mental y Entereza son editables a mano;
 * cuando se definan sus fórmulas se calcularán en prepareDerivedData().
 */
function camposComunes() {
  return {
    caracteristicas: grupo(CULTOS.caracteristicas, rasgo),
    // Las habilidades son ítems de tipo "habilidad" (varios aspectos por habilidad básica).
    salud: new fields.SchemaField({
      resistencia: contador(15, 15),
      aguante: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      secuelas: new fields.StringField({ initial: "" })
    }),
    cordura: new fields.SchemaField({
      estabilidad: contador(15, 15),
      entereza: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      degeneracion: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      trastornos: new fields.StringField({ initial: "" })
    }),
    biografia: new fields.HTMLField({ initial: "" })
  };
}

export class PersonajeData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["CULTOS.Actor"];

  static defineSchema() {
    const hitos = {};
    for (let i = 1; i <= CULTOS.numHitos; i++) hitos[`hito${i}`] = narrativo();
    return {
      ...camposComunes(),
      concepto: new fields.StringField({ initial: "" }),
      hitos: new fields.SchemaField(hitos),
      complicacion: narrativo(),
      drama: contador(1, 5)
    };
  }
}

export class PnjData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["CULTOS.Actor"];

  static defineSchema() {
    return camposComunes();
  }
}
