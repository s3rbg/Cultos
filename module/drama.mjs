/**
 * Puntos de Drama: cambios manuales y aviso público en el chat.
 *
 * Cualquier cambio de system.drama.value (botones +/−, edición directa en la hoja, macros…)
 * genera un mensaje de chat visible para todos. Las repeticiones de tirada ya indican su
 * coste en su propio mensaje, así que se actualizan con la opción `cultosSinAviso`.
 */
const SYS = "cultos-innombrables";

/** Suma (o resta, con delta negativo) puntos de Drama respetando 0 ≤ valor ≤ máximo. */
export async function ajustarDrama(actor, delta) {
  const drama = actor.system.drama;
  if (!drama) return;
  const value = Math.clamp(drama.value + delta, 0, drama.max);
  if (value === drama.value) {
    ui.notifications.info(game.i18n.localize(delta > 0 ? "CULTOS.Drama.EnMaximo" : "CULTOS.Drama.SinPuntos"));
    return;
  }
  await actor.update({ "system.drama.value": value });
}

/** Hook preUpdateActor: guarda el valor anterior para poder anunciar la diferencia. */
function guardarDramaAnterior(actor, changes, options) {
  if (!actor.system.drama) return;
  if (!foundry.utils.hasProperty(changes, "system.drama.value")) return;
  options[SYS] = { dramaAnterior: actor.system.drama.value };
}

/** Hook updateActor: solo el cliente que hizo el cambio publica el mensaje. */
async function anunciarDrama(actor, changes, options, userId) {
  if (userId !== game.user.id || options.cultosSinAviso) return;
  const anterior = options[SYS]?.dramaAnterior;
  if (anterior === undefined) return;
  const actual = actor.system.drama.value;
  const delta = actual - anterior;
  if (!delta) return;

  const clave = delta > 0 ? "CULTOS.Drama.Gana" : "CULTOS.Drama.Gasta";
  const texto = game.i18n.format(clave, { nombre: actor.name, n: Math.abs(delta), anterior, actual });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="cultos cultos-chat-drama ${delta > 0 ? "gana" : "gasta"}">
      <i class="fas fa-masks-theater"></i> ${texto}
    </div>`
  });
}

export function registrarHooksDrama() {
  Hooks.on("preUpdateActor", guardarDramaAnterior);
  Hooks.on("updateActor", anunciarDrama);
}
