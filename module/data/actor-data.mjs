const { fields } = foundry.data;

/**
 * Campos comunes a todos los actores.
 * TODO: sustituir por las características reales del reglamento de Cultos Innombrables.
 */
function camposBase() {
  return {
    salud: new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, initial: 10, min: 0 }),
      max: new fields.NumberField({ required: true, integer: true, initial: 10, min: 0 })
    }),
    biografia: new fields.HTMLField({ initial: "" })
  };
}

export class PersonajeData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["CULTOS.Actor"];

  static defineSchema() {
    return {
      ...camposBase(),
      concepto: new fields.StringField({ initial: "" })
    };
  }
}

export class PnjData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["CULTOS.Actor"];

  static defineSchema() {
    return camposBase();
  }
}
