# Cultos Innombrables — sistema Foundry VTT

Sistema de juego para Foundry VTT **v14** (mínimo v13), uso personal. Idioma del código y de la UI: español.

## Pila
- JavaScript ES modules (`.mjs`), plantillas Handlebars (`.hbs`), CSS plano. Sin build step.
- Datos: `foundry.abstract.TypeDataModel` (en `module/data/`), tipos declarados en `system.json` → `documentTypes` (no se usa `template.json`).
- Hojas: ApplicationV2 (`HandlebarsApplicationMixin(ActorSheetV2/ItemSheetV2)`) en `module/sheets/`. Acciones vía `data-action` + `DEFAULT_OPTIONS.actions`.
- Usar API con namespace (`foundry.applications.*`, `foundry.data.fields`), no globales deprecados (`Actors`, `ActorSheet`, `TextEditor`...).
- Textos en `lang/es.json`; etiquetas de campos con `LOCALIZATION_PREFIXES` → `CULTOS.<Doc>.FIELDS.<campo>.label`.

## Desarrollo
- El proyecto está enlazado (junction) en `%LOCALAPPDATA%\FoundryVTT\Data\systems\cultos-innombrables` (`npm run link`).
- Tras cambiar JS: recargar el mundo (F5). Cambios en `system.json`: reiniciar Foundry.
- `npm run lint` para ESLint.

## Reglas del juego
Pendiente: el modelo de datos actual (salud, concepto, habilidades con valor) es un marcador de posición hasta definir las reglas reales.
