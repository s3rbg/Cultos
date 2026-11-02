const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export class CultosItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cultos", "item"],
    position: { width: 480, height: 420 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  static PARTS = {
    sheet: { template: "systems/cultos-innombrables/templates/item/item-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.document;
    const TextEditor = foundry.applications.ux.TextEditor.implementation;
    return Object.assign(context, {
      item,
      system: item.system,
      fields: item.system.schema.fields,
      descripcionHTML: await TextEditor.enrichHTML(item.system.descripcion, { relativeTo: item })
    });
  }
}
