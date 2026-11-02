const { fields } = foundry.data;

export class HabilidadData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["CULTOS.Item"];

  static defineSchema() {
    return {
      valor: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      descripcion: new fields.HTMLField({ initial: "" })
    };
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
