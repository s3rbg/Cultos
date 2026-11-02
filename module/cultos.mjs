/**
 * Cultos Innombrables — punto de entrada del sistema.
 */
import { PersonajeData, PnjData } from "./data/actor-data.mjs";
import { HabilidadData, EquipoData } from "./data/item-data.mjs";
import { CultosActorSheet } from "./sheets/actor-sheet.mjs";
import { CultosItemSheet } from "./sheets/item-sheet.mjs";

export const SYSTEM_ID = "cultos-innombrables";

Hooks.once("init", () => {
  console.log(`${SYSTEM_ID} | Inicializando Cultos Innombrables`);

  // Modelos de datos por tipo de documento
  Object.assign(CONFIG.Actor.dataModels, {
    personaje: PersonajeData,
    pnj: PnjData
  });
  Object.assign(CONFIG.Item.dataModels, {
    habilidad: HabilidadData,
    equipo: EquipoData
  });

  // Hojas
  const { DocumentSheetConfig } = foundry.applications.apps;
  DocumentSheetConfig.registerSheet(Actor, SYSTEM_ID, CultosActorSheet, {
    types: ["personaje", "pnj"],
    makeDefault: true,
    label: "CULTOS.Sheet.Actor"
  });
  DocumentSheetConfig.registerSheet(Item, SYSTEM_ID, CultosItemSheet, {
    types: ["habilidad", "equipo"],
    makeDefault: true,
    label: "CULTOS.Sheet.Item"
  });
});

Hooks.once("ready", () => {
  console.log(`${SYSTEM_ID} | Listo`);
});
