(function () {
  "use strict";

  function congelar(o) {
    if (!o || typeof o !== "object") return o;
    var claves = Object.keys(o);
    for (var i = 0; i < claves.length; i++) congelar(o[claves[i]]);
    return Object.freeze(o);
  }

  window.PORTAFOLIO_CONFIG = congelar({
    VERSION: "13",
    CLAVE_MAZMORRA: "portafolio.v1.mazmorra",
    VALOR_ON: "1",
    VALOR_OFF: "0",
    FASE_ENERGIA: "6",
    FASE_RECICLAJE: "7",
    FUSION: { fases: ["2", "3"], fase: "23", nombre: "Definición y Diseño" },
    ANCHO_MOVIL: 519,
    ANCHO_TABLET: 899,
    COLS_MOVIL: 2,
    COLS_TABLET: 3,
    COLS_ANCHO: 4,
    GAP: 8,
    VISTA_OBJETO: "-22 -22 44 44",
    VISTA_PILA: "-28 -28 56 56",
    BESTIA_PASO: 0.45,
    ANTORCHA_PASO: 0.37,
    NIVELES: [
      { id: "ceniza", nombre: "Ceniza", min: 0, cupo: 2, fondo: "#070304", fuego: "#ff5a3a" },
      { id: "brasa", nombre: "Brasa", min: 2, cupo: 3, fondo: "#120403", fuego: "#ff8a3a" },
      { id: "llama", nombre: "Llama", min: 4, cupo: 4, fondo: "#1a0a06", fuego: "#ffb53a" },
      { id: "forja", nombre: "Forja", min: 7, cupo: 6, fondo: "#140c08", fuego: "#ffcf70" },
      { id: "faro", nombre: "Faro", min: 10, cupo: 8, fondo: "#1a1003", fuego: "#ffe08a" }
    ],
    DEFECTO: {
      objetos: ["cofre", "altar", "estatua"],
      tinte: "#c9a27a",
      opacidad: 0.05,
      titulo: "#f0e0cc",
      energia: false,
      reciclaje: false,
      sinLimite: false
    },
    TEMAS: {
      "0": { objetos: ["cofre", "altar", "estatua", "estante", "engranaje", "brasero"], tinte: "#c9a27a", opacidad: 0.05, titulo: "#f0e0cc", energia: false, reciclaje: false, sinLimite: false },
      "1": { objetos: ["altar", "urna", "pilar"], tinte: "#7c6cff", opacidad: 0.08, titulo: "#d7ccff", energia: false, reciclaje: false, sinLimite: false },
      "2": { objetos: ["estante", "espejo", "estatua", "caldero"], tinte: "#8ec4ff", opacidad: 0.08, titulo: "#d4e6ff", energia: false, reciclaje: false, sinLimite: false },
      "3": { objetos: ["estante", "espejo", "estatua", "caldero"], tinte: "#8ec4ff", opacidad: 0.08, titulo: "#d4e6ff", energia: false, reciclaje: false, sinLimite: false },
      "4": { objetos: ["engranaje", "brasero", "barril"], tinte: "#ffb15a", opacidad: 0.08, titulo: "#ffd7a8", energia: false, reciclaje: false, sinLimite: false },
      "5": { objetos: ["cofre", "pilar", "estante"], tinte: "#8fd08a", opacidad: 0.07, titulo: "#d9f5c8", energia: false, reciclaje: false, sinLimite: false },
      "6": { objetos: ["cristal", "brasero", "pilar"], tinte: "#ffcf70", opacidad: 0.14, titulo: "#ffe7a8", energia: true, reciclaje: false, sinLimite: true },
      "7": { objetos: ["contenedor", "chatarra", "barril"], tinte: "#6a8f62", opacidad: 0.16, titulo: "#d5e6c8", energia: false, reciclaje: true, sinLimite: true }
    },
    BESTIAS: [
      { id: "hada", nombre: "Hada farolera" },
      { id: "mano", nombre: "Mano reptante" },
      { id: "heraldo", nombre: "Heraldo de la trompeta" },
      { id: "murcielago", nombre: "Murciélago antena" },
      { id: "topo", nombre: "Topo minero" },
      { id: "mimico", nombre: "Mímico del cofre" },
      { id: "dragon", nombre: "Dragón vigía" },
      { id: "trasgo", nombre: "Trasgo glotón" }
    ],
    NIEBLA: {
      NUBES: 8,
      NUBES_MOVIL: 5,
      BRASAS: 20,
      BRASAS_MOVIL: 10,
      DPR_MAX: 1.5,
      DPR_MOVIL: 1,
      ANCHO_MIN: 400,
      RADIO_MIN: 0.25,
      RADIO_VAR: 0.3,
      VEL_MIN: 0.00003,
      VEL_VAR: 0.00006,
      RECORRIDO: 1.8,
      NUBE_PASO: 80,
      NUBE_CENTRO: "rgba(120,10,14,0.14)",
      NUBE_BORDE: "rgba(120,10,14,0)",
      BRASA_V_MIN: 0.00004,
      BRASA_V_VAR: 0.00012,
      BRASA_S_MIN: 0.6,
      BRASA_S_VAR: 1.5,
      BRASA_FASE: 0.004,
      BRASA_DERIVA: 6,
      BRASA_HOLGURA: 2,
      BRASA_MARGEN: 0.02,
      BRASA_ALFA_MIN: 0.3,
      BRASA_ALFA_VAR: 0.3,
      BRASA_ROJO: 255,
      BRASA_VERDE_MIN: 60,
      BRASA_VERDE_VAR: 60,
      BRASA_AZUL: 40,
      DT_MAX: 64,
      DT_INICIAL: 16
    },
    TEXTOS: {
      AJUSTES: "Ajustes",
      MAZMORRA: "Mazmorra",
      MAZMORRA_AYUDA: "Los proyectos se ven como objetos en las salas.",
      CERRAR: "Cerrar",
      VERSION: "Versión",
      PILA: "Pila",
      VACIO: "Aquí aparecerán los proyectos.",
      PROYECTOS: "proyectos"
    }
  });
})();
