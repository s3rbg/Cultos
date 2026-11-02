import { tirarAspecto } from "../dice.mjs";
import { ajustarDrama } from "../drama.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class CultosActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cultos", "actor"],
    position: { width: 720, height: 800 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      crearItem: CultosActorSheet.#onCrearItem,
      editarItem: CultosActorSheet.#onEditarItem,
      borrarItem: CultosActorSheet.#onBorrarItem,
      tirarAspecto: CultosActorSheet.#onTirarAspecto,
      nuevaSesion: CultosActorSheet.#onNuevaSesion,
      dramaMas: function () { return ajustarDrama(this.document, 1); },
      dramaMenos: function () { return ajustarDrama(this.document, -1); }
    }
  };

  static PARTS = {
    sheet: { template: "systems/cultos-innombrables/templates/actor/actor-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const system = actor.system;
    const TextEditor = foundry.applications.ux.TextEditor.implementation;

    const caracteristicas = Object.entries(CONFIG.CULTOS.caracteristicas).map(([key, cfg]) => ({
      key,
      ...cfg,
      ...system.caracteristicas[key],
      path: `system.caracteristicas.${key}`
    }));

    // Aspectos de habilidad agrupados por habilidad básica, en el orden de CONFIG.
    const aspectos = (actor.itemTypes.habilidad ?? []).sort((a, b) => a.sort - b.sort);
    const habilidades = Object.entries(CONFIG.CULTOS.habilidades).map(([key, cfg]) => ({
      key,
      ...cfg,
      aspectos: aspectos.filter(i => i.system.base === key)
    }));

    return Object.assign(context, {
      actor,
      system,
      fields: system.schema.fields,
      esPersonaje: actor.type === "personaje",
      caracteristicas,
      habilidades,
      hitos: system.hitos
        ? Object.entries(system.hitos).map(([key, h]) => ({ ...h, path: `system.hitos.${key}` }))
        : [],
      equipo: actor.itemTypes.equipo ?? [],
      biografiaHTML: await TextEditor.enrichHTML(system.biografia, {
        secrets: actor.isOwner,
        relativeTo: actor
      })
    });
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    // Edición en línea de ítems: inputs con data-field (sin name, para no mezclarse con el formulario del actor).
    for (const input of this.element.querySelectorAll("[data-item-id] [data-field]")) {
      input.addEventListener("change", this.#onEditarCampoItem.bind(this));
    }
  }

  async #onEditarCampoItem(event) {
    event.stopPropagation();
    const input = event.currentTarget;
    const item = this.document.items.get(input.closest("[data-item-id]").dataset.itemId);
    if (!item) return;
    const value = input.type === "checkbox" ? input.checked
      : input.type === "number" ? Number(input.value)
        : input.value;
    await item.update({ [input.dataset.field]: value });
  }

  static async #onCrearItem(event, target) {
    const { type, base } = target.dataset;
    const data = { type, name: game.i18n.localize(type === "habilidad" ? "CULTOS.NuevoAspecto" : `TYPES.Item.${type}`) };
    if (base) data.system = { base };
    await this.document.createEmbeddedDocuments("Item", [data]);
  }

  static #onEditarItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    this.document.items.get(id)?.sheet.render(true);
  }

  static async #onTirarAspecto(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const aspecto = this.document.items.get(id);
    if (aspecto) await tirarAspecto(this.document, aspecto);
  }

  /** Recupera todos los aspectos agotados (características y habilidades). */
  static async #onNuevaSesion() {
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("CULTOS.NuevaSesion.Titulo") },
      content: `<p>${game.i18n.localize("CULTOS.NuevaSesion.Confirmar")}</p>`
    });
    if (!ok) return;
    const actor = this.document;
    const cambios = {};
    for (const key of Object.keys(actor.system.caracteristicas)) cambios[`system.caracteristicas.${key}.gastado`] = false;
    await actor.update(cambios);
    const items = (actor.itemTypes.habilidad ?? []).filter(i => i.system.gastado)
      .map(i => ({ _id: i.id, "system.gastado": false }));
    if (items.length) await actor.updateEmbeddedDocuments("Item", items);
  }

  static async #onBorrarItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    await this.document.items.get(id)?.deleteDialog();
  }
}
