import { CULTOS } from "../config.mjs";

const { fields } = foundry.data;

/**
 * Aspecto de habilidad. El nombre del ítem es el texto del aspecto ("Oído felino");
 * `base` indica a qué habilidad básica pertenece. Un actor puede tener varios por habilidad.
 */
export class HabilidadData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["CULTOS.Item"];

  static defineSchema() {
    return {
      base: new fields.StringField({
        required: true,
        blank: false,
        initial: Object.keys(CULTOS.habilidades)[0],
        choices: () => Object.fromEntries(Object.entries(CULTOS.habilidades).map(([k, v]) => [k, v.label]))
      }),
      valor: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      gastado: new fields.BooleanField({ initial: false }),
      /** Característica propia del aspecto; vacía = la por defecto de su habilidad base. */
      caracteristica: new fields.StringField({
        required: true,
        blank: true,
        initial: "",
        choices: () => Object.fromEntries(Object.entries(CULTOS.caracteristicas).map(([k, v]) => [k, v.label]))
      }),
      descripcion: new fields.HTMLField({ initial: "" })
    };
  }

  /** Característica que se preselecciona al tirar con este aspecto. */
  get caracteristicaPorDefecto() {
    return this.caracteristica || CULTOS.habilidades[this.base]?.caracteristica || "";
  }
}

export class EquipoData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["CULTOS.Item"];

  static defineSchema() {
    return {
      cantidad: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),
      descripcion: new fields.HTMLField({ initial: "" })
    };
  }
}
