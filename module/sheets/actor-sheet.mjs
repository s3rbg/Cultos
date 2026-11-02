const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class CultosActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cultos", "actor"],
    position: { width: 600, height: 650 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      crearItem: CultosActorSheet.#onCrearItem,
      editarItem: CultosActorSheet.#onEditarItem,
      borrarItem: CultosActorSheet.#onBorrarItem
    }
  };

  static PARTS = {
    sheet: { template: "systems/cultos-innombrables/templates/actor/actor-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const TextEditor = foundry.applications.ux.TextEditor.implementation;
    return Object.assign(context, {
      actor,
      system: actor.system,
      fields: actor.system.schema.fields,
      habilidades: actor.itemTypes.habilidad ?? [],
      equipo: actor.itemTypes.equipo ?? [],
      biografiaHTML: await TextEditor.enrichHTML(actor.system.biografia, {
        secrets: actor.isOwner,
        relativeTo: actor
      })
    });
  }

  static async #onCrearItem(event, target) {
    const type = target.dataset.type;
    await this.document.createEmbeddedDocuments("Item", [
      { name: game.i18n.localize(`TYPES.Item.${type}`), type }
    ]);
  }

  static #onEditarItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    this.document.items.get(id)?.sheet.render(true);
  }

  static async #onBorrarItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    await this.document.items.get(id)?.deleteDialog();
  }
}
