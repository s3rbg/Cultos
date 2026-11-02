/**
 * Configuración estática del sistema. Se expone como CONFIG.CULTOS.
 * El orden de las claves es el orden en que aparecen en la hoja.
 */
export const CULTOS = {
  caracteristicas: {
    fortaleza: { label: "CULTOS.Caracteristica.fortaleza", abrev: "CULTOS.Caracteristica.fortalezaAbr" },
    reflejos: { label: "CULTOS.Caracteristica.reflejos", abrev: "CULTOS.Caracteristica.reflejosAbr" },
    voluntad: { label: "CULTOS.Caracteristica.voluntad", abrev: "CULTOS.Caracteristica.voluntadAbr" },
    intelecto: { label: "CULTOS.Caracteristica.intelecto", abrev: "CULTOS.Caracteristica.intelectoAbr" }
  },

  /**
   * `basica: false` marca las habilidades que no son básicas en reglas, aunque funcionen igual.
   * `caracteristica`: la que se preselecciona en el diálogo de tirada ("" = sin defecto).
   * Cada aspecto puede sobrescribirla con su propio `system.caracteristica`.
   */
  habilidades: {
    formaFisica: { label: "CULTOS.Habilidad.formaFisica", basica: true, caracteristica: "fortaleza" },
    combate: { label: "CULTOS.Habilidad.combate", basica: true, caracteristica: "reflejos" },
    interaccion: { label: "CULTOS.Habilidad.interaccion", basica: true, caracteristica: "voluntad" },
    percepcion: { label: "CULTOS.Habilidad.percepcion", basica: true, caracteristica: "intelecto" },
    subterfugio: { label: "CULTOS.Habilidad.subterfugio", basica: true, caracteristica: "reflejos" },
    cultura: { label: "CULTOS.Habilidad.cultura", basica: true, caracteristica: "intelecto" },
    profesion: { label: "CULTOS.Habilidad.profesion", basica: true, caracteristica: "" },
    ocultismo: { label: "CULTOS.Habilidad.ocultismo", basica: true, caracteristica: "intelecto" },
    arcana: { label: "CULTOS.Habilidad.arcana", basica: false, caracteristica: "voluntad" }
  },

  /** Número de hitos por personaje. */
  numHitos: 4
};
