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
Sistema Hitos (Nosolorol). Listas fijas en `module/config.mjs` (`CONFIG.CULTOS`):
- Características: Fortaleza, Reflejos, Voluntad, Intelecto.
- Habilidades básicas: Forma física, Combate, Interacción, Percepción, Subterfugio, Cultura, Profesión, Ocultismo y Arcana (Arcana no es básica en reglas, `basica: false`, pero funciona igual).
- Características: campo fijo `{ valor, aspecto, gastado }` por cada una.
- Habilidades: ítems tipo `habilidad` (nombre = aspecto, `system.base` = clave de habilidad básica, `valor`, `gastado`). Un actor puede tener varios aspectos de la misma habilidad (p.ej. Percepción: "Oído felino" 5 y "Cataratas" 1). Personaje además: 4 hitos, complicación, drama.
- Salud (resistencia, aguante, secuelas) y cordura (estabilidad, entereza, degeneración, trastornos): editables a mano, fórmulas derivadas pendientes.
- Referencia (solo consulta, no copiar código): sistema `hitos` instalado en `Data\systems\hitos`.
- Tirada (`module/dice.mjs`): clic en aspecto → diálogo (característica preseleccionada + modificador) → 3d10, dado central + característica + aspecto + mod → chat. Característica por defecto en `CONFIG.CULTOS.habilidades[x].caracteristica`; el aspecto puede sobrescribirla (`system.caracteristica`, vacío = defecto).
- Crítico: ≥2 dieces. Pifia: ≥2 unos (`resultadoEspecial` en dice.mjs).
- Repeticiones (botones en el mensaje de chat, una por tirada; críticos y pifias no se repiten). El jugador elige qué dados repetir.
  - A mejor: gasta 1 Drama o agota un aspecto. Resultado = max(dado mayor, suma de cada grupo de dados iguales).
  - A peor: gana 1 Drama (tope en drama.max). Resultado = dado menor; con doble/triple, −valor repetido.
  - Agotar aspectos sin repetir: casilla "gastado" en la hoja. Botón "Nueva sesión" en la hoja los recupera.
- Drama: botones +/− en la hoja (`module/drama.mjs`, tope 0..max). Todo cambio de drama.value publica un mensaje de chat para todos (hooks pre/updateActor), salvo updates con opción `cultosSinAviso` (repeticiones, que ya indican su coste).
- Pendiente: efecto de los hitos, de la complicación y de crítico/pifia en el total.
