// Configuración central — VegasBett (privado)
window.VEGASBETT_CONFIG = {
  // Gate de edad
  AGE_GATE_ENABLED: true,
  EDAD_MINIMA: 18,

  // Marca
  MARCA: "VegasBett",

  // Números (sin + ni espacios)
  NUMERO_PRINCIPAL: "5492233415879",
  NUMERO_RESPALDO: "5492233458173", // en caso de reclamo

  // Datos bancarios
  CBU: "0000003100056935839518",
  ALIAS: "Vegass.bet",
  TITULAR: "Priscila Correa",

  // Vista previa al compartir
  SHARE_PREVIEW: true,
  OG_IMAGE: "assets/portada_paginaweb.png",

  // Privacidad (no la publiques si no querés que Google la indexe)
  NO_INDEX: true,

  // Pixel Meta
  TRACKING_ENABLED: false, // poné true para habilitar
  PIXEL_ID: "24100361799629508",

  // Admin (PIN para panel rápido)
  EMERGENCY_PIN: "4321",

  // Promos / Banner
  SHOW_PROMO_TICKER: true,
  PROMOS: {
    MINIMO: 2000,
    MAXIMO: 20000,
    // por día (0=domingo .. 6=sábado)
    MAP: {
      "0": 25, // domingo
      "1": 20, // lunes
      "2": 15, // martes
      "3": 10, // miércoles
      "4": 10, // jueves
      "5": 20, // viernes
      "6": 20  // sábado
    },
    // Excepciones por fecha "YYYY-MM-DD": { off:true } o { percent: 30 }
    EXCEPTIONS: {
      // "2025-08-30": { "off": true },
      // "2025-09-01": { "percent": 30 }
    }
  }
};
