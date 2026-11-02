/**
 * Tiradas del sistema Hitos.
 *
 * Tirada base: 3d10, dado central + característica + aspecto + modificador.
 * Crítico: al menos dos 10. Pifia: al menos dos 1. Críticos y pifias no se pueden repetir.
 *
 * Repeticiones (una por tirada): el jugador elige qué dados repetir.
 *  - A mejor (gasta 1 Drama o agota un aspecto): dado mayor, o suma de dados iguales si es mayor.
 *  - A peor (gana 1 Drama): dado menor; con doble/triple, se resta el valor repetido.
 *  Si tras repetir sale crítico o pifia, se aplica.
 */
const { DialogV2 } = foundry.applications.api;
const { renderTemplate } = foundry.applications.handlebars;

const SYS = "cultos-innombrables";
const TPL = `systems/${SYS}/templates`;

/* -------------------------------------------- */
/*  Reglas puras                                 */
/* -------------------------------------------- */

/** Crítico con dos o más 10; pifia con dos o más 1. Con 3 dados no pueden darse a la vez. */
export function resultadoEspecial(dados) {
  const cuenta = n => dados.filter(d => d === n).length;
  if (cuenta(10) >= 2) return "critico";
  if (cuenta(1) >= 2) return "pifia";
  return null;
}

function agrupar(dados) {
  const grupos = new Map();
  for (const d of dados) grupos.set(d, (grupos.get(d) ?? 0) + 1);
  return grupos;
}

/** Repetición a mejor: lo más alto entre el dado mayor y la suma de cada grupo de dados iguales. */
export function valorPositivo(dados) {
  const mayor = Math.max(...dados);
  let mejor = { valor: mayor, detalle: String(mayor) };
  for (const [v, n] of agrupar(dados)) {
    if (n >= 2 && v * n > mejor.valor) mejor = { valor: v * n, detalle: Array(n).fill(v).join(" + ") };
  }
  return mejor;
}

/** Repetición a peor: dado menor, salvo doble/triple, que resta el valor repetido. */
export function valorNegativo(dados) {
  for (const [v, n] of agrupar(dados)) {
    if (n >= 2) {
      const clave = n === 3 ? "CULTOS.Reroll.Triple" : "CULTOS.Reroll.Doble";
      return { valor: -v, detalle: game.i18n.format(clave, { valor: v }) };
    }
  }
  const menor = Math.min(...dados);
  return { valor: menor, detalle: String(menor) };
}

/* -------------------------------------------- */
/*  Utilidades                                   */
/* -------------------------------------------- */

async function tirarNd10(n) {
  const roll = await new Roll(`${n}d10`).evaluate();
  return { roll, resultados: roll.dice[0].results.map(r => r.result) };
}

function etiquetaEspecial(especial) {
  if (!especial) return null;
  return game.i18n.localize(especial === "critico" ? "CULTOS.Tirada.Critico" : "CULTOS.Tirada.Pifia");
}

function textoMod(m) {
  return m > 0 ? `+ ${m}` : m < 0 ? `− ${-m}` : "";
}

function formulario(button) {
  return new foundry.applications.ux.FormDataExtended(button.form).object;
}

/* -------------------------------------------- */
/*  Tirada base                                  */
/* -------------------------------------------- */

/**
 * Diálogo (característica + modificador) → 3d10 → mensaje al chat con botones de repetición.
 * @param {Actor} actor
 * @param {Item} aspecto   Ítem de tipo "habilidad"
 */
export async function tirarAspecto(actor, aspecto) {
  const cfg = CONFIG.CULTOS;
  const defecto = aspecto.system.caracteristicaPorDefecto;
  const habilidadLabel = game.i18n.localize(cfg.habilidades[aspecto.system.base]?.label ?? "");

  const caracteristicas = Object.entries(cfg.caracteristicas).map(([key, c]) => ({
    key,
    label: game.i18n.localize(c.label),
    valor: actor.system.caracteristicas[key]?.valor ?? 0,
    selected: key === defecto
  }));

  const content = await renderTemplate(`${TPL}/dialog/tirada.hbs`, {
    aspecto,
    habilidadLabel,
    caracteristicas,
    sinDefecto: !defecto
  });

  const datos = await DialogV2.wait({
    window: { title: `${aspecto.name} (${habilidadLabel})` },
    content,
    buttons: [{
      action: "tirar",
      label: game.i18n.localize("CULTOS.Tirada.Tirar"),
      icon: "fas fa-dice-d10",
      default: true,
      callback: (event, button) => formulario(button)
    }],
    rejectClose: false
  });
  if (!datos) return null;

  const carKey = datos.caracteristica || "";
  const tirada = {
    actorId: actor.id,
    aspectoId: aspecto.id,
    aspectoNombre: aspecto.name,
    habilidadLabel,
    caracteristicaLabel: carKey ? game.i18n.localize(cfg.caracteristicas[carKey].label) : null,
    valorCar: carKey ? (actor.system.caracteristicas[carKey]?.valor ?? 0) : 0,
    valorAspecto: aspecto.system.valor,
    modificador: Number(datos.modificador) || 0,
    dados: [],
    especial: null,
    repetida: false
  };

  const { roll, resultados } = await tirarNd10(3);
  tirada.dados = resultados.sort((a, b) => a - b);
  tirada.especial = resultadoEspecial(tirada.dados);
  const central = tirada.dados[1];
  const total = central + tirada.valorCar + tirada.valorAspecto + tirada.modificador;

  const html = await renderTemplate(`${TPL}/chat/tirada.hbs`, {
    ...tirada,
    dadosVista: tirada.dados.map((d, i) => ({ valor: d, destacado: i === 1, max: d === 10, min: d === 1 })),
    valorDados: central,
    detalleDados: game.i18n.localize("CULTOS.Tirada.Central"),
    modTexto: textoMod(tirada.modificador),
    especialLabel: etiquetaEspecial(tirada.especial),
    total,
    repetible: !tirada.especial
  });

  return roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: html,
    flags: { [SYS]: { tirada } }
  });
}

/* -------------------------------------------- */
/*  Repeticiones                                 */
/* -------------------------------------------- */

/** Aspectos que el actor puede agotar (características y habilidades no gastadas y con texto). */
function aspectosAgotables(actor) {
  const opciones = [];
  for (const [key, c] of Object.entries(actor.system.caracteristicas ?? {})) {
    if (c.aspecto && !c.gastado) {
      const label = game.i18n.localize(CONFIG.CULTOS.caracteristicas[key].label);
      opciones.push({ value: `car:${key}`, label: `${c.aspecto} (${label})` });
    }
  }
  for (const item of actor.itemTypes.habilidad ?? []) {
    if (!item.system.gastado) {
      const label = game.i18n.localize(CONFIG.CULTOS.habilidades[item.system.base]?.label ?? "");
      opciones.push({ value: `item:${item.id}`, label: `${item.name} (${label})`, id: item.id });
    }
  }
  return opciones;
}

/** Aplica el coste/beneficio de la repetición. Devuelve el texto descriptivo, o null si no se puede pagar. */
async function aplicarCoste(actor, tipo, pago) {
  const drama = actor.system.drama;

  if (tipo === "negativo") {
    if (!drama) return game.i18n.localize("CULTOS.Reroll.SinDrama");
    // cultosSinAviso: el mensaje de la repetición ya indica el coste.
    await actor.update({ "system.drama.value": Math.min(drama.max, drama.value + 1) }, { cultosSinAviso: true });
    return game.i18n.localize("CULTOS.Reroll.GanaDrama");
  }

  if (pago === "drama") {
    if (!drama || drama.value < 1) {
      ui.notifications.warn(game.i18n.localize("CULTOS.Reroll.NoDrama"));
      return null;
    }
    await actor.update({ "system.drama.value": drama.value - 1 }, { cultosSinAviso: true });
    return game.i18n.localize("CULTOS.Reroll.GastaDrama");
  }

  const [clase, id] = String(pago).split(":");
  if (clase === "car") {
    const c = actor.system.caracteristicas[id];
    if (!c || c.gastado) {
      ui.notifications.warn(game.i18n.localize("CULTOS.Reroll.AspectoNoDisponible"));
      return null;
    }
    await actor.update({ [`system.caracteristicas.${id}.gastado`]: true });
    return game.i18n.format("CULTOS.Reroll.AgotaAspecto", { aspecto: c.aspecto });
  }
  const item = actor.items.get(id);
  if (!item || item.system.gastado) {
    ui.notifications.warn(game.i18n.localize("CULTOS.Reroll.AspectoNoDisponible"));
    return null;
  }
  await item.update({ "system.gastado": true });
  return game.i18n.format("CULTOS.Reroll.AgotaAspecto", { aspecto: item.name });
}

/**
 * Repite la tirada guardada en un mensaje.
 * @param {ChatMessage} message
 * @param {"positivo"|"negativo"} tipo
 */
export async function repetirTirada(message, tipo) {
  const tirada = message.getFlag(SYS, "tirada");
  if (!tirada || tirada.repetida || tirada.especial) return;

  const actor = ChatMessage.getSpeakerActor(message.speaker) ?? game.actors.get(tirada.actorId);
  if (!actor?.isOwner) {
    ui.notifications.warn(game.i18n.localize("CULTOS.Reroll.SinPermiso"));
    return;
  }

  const positivo = tipo === "positivo";
  const aspectos = positivo ? aspectosAgotables(actor) : [];
  const drama = actor.system.drama;
  const content = await renderTemplate(`${TPL}/dialog/reroll.hbs`, {
    positivo,
    dados: tirada.dados.map((valor, i) => ({ valor, i })),
    puedeDrama: positivo && drama?.value > 0,
    drama,
    aspectos: aspectos.map(a => ({ ...a, selected: a.id === tirada.aspectoId }))
  });

  const titulo = game.i18n.localize(positivo ? "CULTOS.Reroll.Positivo" : "CULTOS.Reroll.Negativo");
  const datos = await DialogV2.wait({
    window: { title: titulo },
    content,
    buttons: [{
      action: "repetir",
      label: game.i18n.localize("CULTOS.Reroll.Repetir"),
      icon: "fas fa-dice",
      default: true,
      callback: (event, button) => formulario(button)
    }],
    rejectClose: false
  });
  if (!datos) return;

  const seleccion = [0, 1, 2].filter(i => datos[`repetir${i}`]);
  if (!seleccion.length) {
    ui.notifications.warn(game.i18n.localize("CULTOS.Reroll.NingunDado"));
    return;
  }
  if (positivo && !datos.pago) {
    ui.notifications.warn(game.i18n.localize("CULTOS.Reroll.SinPago"));
    return;
  }

  const coste = await aplicarCoste(actor, tipo, datos.pago);
  if (coste === null) return;

  // Marca la tirada original como repetida (oculta sus botones).
  await message.update({ [`flags.${SYS}.tirada.repetida`]: true });

  const { roll, resultados } = await tirarNd10(seleccion.length);
  const nuevos = [...resultados];
  const final = tirada.dados.map((d, i) => ({ valor: seleccion.includes(i) ? nuevos.shift() : d, nuevo: seleccion.includes(i) }));
  const valores = final.map(d => d.valor);
  const { valor: valorDados, detalle: detalleDados } = positivo ? valorPositivo(valores) : valorNegativo(valores);
  const especial = resultadoEspecial(valores);
  const total = valorDados + tirada.valorCar + tirada.valorAspecto + tirada.modificador;

  const html = await renderTemplate(`${TPL}/chat/tirada.hbs`, {
    ...tirada,
    reroll: { titulo, positivo, coste },
    originales: tirada.dados.map((valor, i) => ({ valor, repetido: seleccion.includes(i) })),
    dadosVista: final.map(d => ({ valor: d.valor, destacado: d.nuevo, max: d.valor === 10, min: d.valor === 1 })),
    valorDados,
    detalleDados,
    modTexto: textoMod(tirada.modificador),
    especialLabel: etiquetaEspecial(especial),
    especial,
    total,
    repetible: false
  });

  return roll.toMessage({
    speaker: message.speaker,
    content: html,
    flags: { [SYS]: { tirada: { ...tirada, dados: valores, especial, repetida: true } } }
  });
}

/** Hook renderChatMessageHTML: activa u oculta los botones de repetición. */
export function activarBotonesReroll(message, html) {
  const zona = html.querySelector(".cultos-rerolls");
  if (!zona) return;
  const tirada = message.getFlag(SYS, "tirada");
  if (!tirada || tirada.repetida || tirada.especial || !message.isOwner) {
    zona.remove();
    return;
  }
  for (const boton of zona.querySelectorAll("[data-reroll]")) {
    boton.addEventListener("click", event => {
      event.preventDefault();
      repetirTirada(message, boton.dataset.reroll);
    });
  }
}
