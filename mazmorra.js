(function () {
  "use strict";

  var CFG = window.PORTAFOLIO_CONFIG;
  if (!CFG) return;

  var SVGNS = "http://www.w3.org/2000/svg";
  var TRAZO = 'stroke="#171110" stroke-width="1.2" stroke-linejoin="round"';
  var S1 = "#4a423e";
  var S2 = "#3b3431";
  var S3 = "#5a504a";
  var K = "#171110";
  var HL = "#6e645c";
  var ANCHO = 352;
  var HUECO = 16;
  var MURO = 8;
  var MARGEN = 12;
  var CAB = 22;
  var BANDA_BESTIAS = 34;
  var OBJ = 64;
  var PLACA_W = 76;
  var PLACA_H = 26;
  var CELDA_W = 84;
  var CELDA_H = 112;
  var fases = null;
  var raiz = null;
  var placa = null;
  var placaTexto = null;
  var enVista = true;
  var lienzoEl = null;
  var escalaEl = null;
  var salasEl = null;
  var encendida = false;
  var firmaActual = "";
  var pedido = 0;
  var relojResize = 0;
  var observador = null;
  var caja = null;
  var dialogoAjustes = null;
  var dialogoPila = null;
  var tituloPila = null;
  var listaPila = null;
  var dialogoTrono = null;
  var detalleTrono = null;
  var dialogoNiveles = null;
  var tituloNiveles = null;
  var listaNiveles = null;
  var atlas = null;
  var atlasImg = null;
  var atlasCss = "";
  var atlasEstado = "cargando";
  var placaCache = {};

  var COLORES = {
    b: "#bfe8f0",
    B: "#4a7aa0",
    p: "#f0d8c0",
    e: "#1a120c",
    c: "#ffd23a",
    Y: "#ffd76a",
    y: "#d4a54a",
    w: "#f3ede2",
    k: "#140a09",
    r: "#c0161d",
    m: "#4a3a52",
    a: "#7a4a2a",
    U: "#68224f",
    u: "#b8447f",
    G: "#3d6a26",
    g: "#7ec85a",
    n: "#6a4a32",
    o: "#e8dcc8"
  };

  var ARTE = {
    hada: [
      "................",
      ".oo.........oo..",
      "obbo..oooo.obbo.",
      "obBbooaaaaobBbo.",
      "obBBbaaaaaabBBbo",
      ".obBbappppabBbo.",
      "..obbpeppepbbo..",
      "...ooppppppooo..",
      ".....oBppBo.oyo.",
      "....oBBBBBBooyo.",
      "...opBBbbBBpYYYo",
      "....oBBBBBBoYcYo",
      "...oBBBBBBBBYYYo",
      "....oppooppoooo.",
      "....oppooppo....",
      "................"
    ],
    mano: [
      "......ee.ee.....",
      "...eeeooeooeee..",
      "..eooeppeppeooe.",
      "..eppeppeppeppe.",
      "..eppeppeppeppe.",
      "..eppeppeppeppe.",
      "..epaepaepaepae.",
      ".eepppppppppppe.",
      "eppepppppppppe..",
      "epppppwwwppppe..",
      ".eppppwcewpppe..",
      "..epppwwwppppe..",
      "..epppppppppe...",
      "...euuuuuuue....",
      "...errrrrrre....",
      "................"
    ],
    heraldo: [
      "......oooo......",
      ".....owwwwo.....",
      "....owwwwwwo....",
      "...owwkkkkwwo...",
      "...owkrkkrkwo...",
      "...owkkkkkkwo...",
      "....owwwwwwo....",
      "...orrrrrro...o.",
      "..orrrrrrrpoooYo",
      "..orrYYYYrpYYYYo",
      "..orrrrrrrooooYo",
      "...orrrrrro...o.",
      "....oYooYo......",
      "....oYooYo......",
      "...oYYooYYo.....",
      "................"
    ],
    murcielago: [
      "................",
      "................",
      "................",
      ".......oo.......",
      "......oYYo......",
      "......okoo......",
      ".o...ommmmo...o.",
      "omo.ommmmmmo.omo",
      "ommommrmmrmmommo",
      "ommmmmmmmmmmmmmo",
      "omUmmmmwwmmmmUmo",
      "omUommmmmmmmoUmo",
      "omo.ommmmmmo.omo",
      ".o...ommmmo...o.",
      ".....oyooyo.....",
      "................"
    ],
    topo: [
      "................",
      "................",
      ".......oo.......",
      ".....ooccoo.....",
      "....oYYccYYo....",
      "...oYyyyyyyYo...",
      "...oYnnnnnnYo...",
      "...onnennenno...",
      "...onnnppnnnoo..",
      "....onnppnnoaao.",
      "...onnnnnnnnaao.",
      "..oonnnnnnnnoao.",
      "..oonnnnnnnnoo..",
      "...onnnnnnnno...",
      "...okkkookkko...",
      "................"
    ],
    mimico: [
      "................",
      "................",
      "................",
      ".....oooooo.....",
      "...ooaaaaaaoo...",
      "..oaaYyyyyYaao..",
      ".oaYccyyyyccYao.",
      ".oaYceyyyyecYao.",
      ".oaYYYYYYYYYYao.",
      ".oawkwkwkwkwkao.",
      ".oakkkrrrrkkkao.",
      ".oawkwkwkwkwkao.",
      ".oaYYYYcYYYYYao.",
      ".oaaaaaaaaaaaao.",
      "..oaaooooooaao..",
      "................"
    ],
    dragon: [
      "................",
      ".......oo..o....",
      "......oUUooUo...",
      ".....oUuuUUo....",
      "....oUuuuuuUo...",
      "....ouucuuucUo..",
      ".oo.ouuuuuuuuo..",
      "oUUo.ouuoouuo...",
      "oUuUooUuuuuUo...",
      "oUuuUUuuuuuuUo..",
      ".oUuuUuuoouuUoo.",
      "..oUUuuuoouuUouo",
      "...oouuuuuuuUuUo",
      "....oUUoooUUUoo.",
      "....oooo.oooo...",
      "................"
    ],
    trasgo: [
      ".o............o.",
      "oGo..oooooo..oGo",
      "oGGooGGGGGGooGGo",
      ".oGgGggggggGgGo.",
      "..oGgggggggggo..",
      "..oggcegggcego..",
      "..oggggggggggo..",
      "...oggrwwrggo...",
      "....oggggggooo..",
      "...onnnnnnnnaao.",
      "..ognnnnnnnnaao.",
      "..ognnnnnnnngo..",
      "...onnnnnnnno...",
      "...oGGooooGGo...",
      "...onno..onno...",
      "................"
    ]
  };

  var VARS = {
    juego: ["cofre", "dado", "tablero"],
    herramienta: ["yunque", "maquina", "caja"],
    musica: ["organo", "arpa", "campana"],
    datos: ["balanza", "frasco", "reloj"],
    generico: ["estatua", "urna", "barril"]
  };
  var RAMPAS = ["calido", "frio", "neutro"];
  var EMOJIS = {
    musica: ["🎹", "🎼", "🎵", "🎸", "🥁"],
    juego: ["🎮", "🐱", "🃏", "🎲", "🧩", "🟦"],
    herramienta: ["🔍", "🛠", "🧹", "⚙", "💻"],
    datos: ["📊", "⚖", "🍎", "💪", "❤"]
  };
  var REGLAS = [
    [/piano|musica|melodia|audio|midi/, "musica"],
    [/juego|jugar|puzzle|party|rpg|nivel/, "juego"],
    [/motor|engine|api|cli|diff|ruta|editor/, "herramienta"],
    [/salud|comida|habito|balance|finanza|registro/, "datos"]
  ];
  var DECOS = {
    ceniza: ["telarana", "huesos", "ceniza-monton", "viga-caida"],
    brasa: ["brasero", "cadena", "vela", "grieta"],
    llama: ["estandarte", "alfombra", "aplique"],
    forja: ["horno", "herramientas-pared", "tuberia", "rejilla"],
    faro: ["estandarte", "hiedra", "espejo", "vitral"]
  };
  var ALTAS = { estandarte: 1, cadena: 1, aplique: 1, vitral: 1, espejo: 1, "herramientas-pared": 1 };

  function engranaje() {
    var d = '<g fill="' + S1 + '">';
    for (var i = 0; i < 8; i++) d += '<rect x="-3" y="-15" width="6" height="5" transform="rotate(' + (i * 45) + ')"/>';
    d += '<circle r="11"/></g><circle r="4.5" fill="' + S2 + '"/>';
    return d;
  }

  var OBJETOS = {
    altar: '<rect x="-15" y="-1" width="30" height="15" fill="' + S2 + '"/><path d="M-6 2 h12 v9 h-12 Z" fill="' + S1 + '"/><rect x="-17" y="-6" width="34" height="6" fill="' + S3 + '"/><rect x="-14" y="-12" width="3.5" height="6" fill="' + S1 + '"/><rect x="10.5" y="-12" width="3.5" height="6" fill="' + S1 + '"/>',
    sarcofago: '<path d="M-8 -16 H8 L13 -6 L9 15 H-9 L-13 -6 Z" fill="' + S1 + '"/><path d="M-5 -12 H5 L9 -6 L6 11 H-6 L-9 -6 Z" fill="none" stroke="' + S2 + '"/><path d="M0 -3 V8 M-4 1 H4" stroke="' + S2 + '" stroke-width="1.6"/>',
    lapida: '<rect x="-13" y="11" width="26" height="5" fill="' + S2 + '"/><path d="M-9 12 V-5 A9 9 0 0 1 9 -5 V12 Z" fill="' + S1 + '"/><path d="M-4 -3 h8 M-4 2 h8 M-4 6 h5" stroke="' + S2 + '"/>',
    cofre: '<rect x="-14" y="-2" width="28" height="16" fill="' + S2 + '"/><path d="M-14 -2 Q-14 -11 0 -11 Q14 -11 14 -2 Z" fill="' + S3 + '"/><path d="M-7 -10 V14 M7 -10 V14" stroke="' + HL + '" stroke-width="1.6"/><rect x="-2.5" y="-4" width="5" height="5" fill="' + S1 + '"/>',
    pilar: '<rect x="-12" y="10" width="24" height="5" fill="' + S2 + '"/><rect x="-8" y="-12" width="16" height="22" fill="' + S1 + '"/><path d="M-3 -11 V9 M3 -11 V9" stroke="' + S2 + '"/><path d="M-11 -12 V-17 H11 V-14 L7 -12 Z" fill="' + S3 + '"/>',
    estatua: '<rect x="-11" y="7" width="22" height="8" fill="' + S2 + '"/><path d="M-4 -4 L-9 3 M4 -4 L9 -1 L10 -7" stroke="' + S1 + '" stroke-width="2.5" fill="none"/><path d="M-6 7 L-4 -5 H4 L6 7 Z" fill="' + S1 + '"/><circle cy="-9" r="4" fill="' + S3 + '"/>',
    urna: '<path d="M-7 14 Q-13 3 -8 -5 H8 Q13 3 7 14 Z" fill="' + S1 + '"/><rect x="-5" y="-10" width="10" height="5" fill="' + S3 + '"/><path d="M-9 4 H9" stroke="' + S2 + '"/>',
    caldero: '<path d="M-9 9 L-12 15 M9 9 L12 15" stroke="' + S2 + '" stroke-width="2.5"/><ellipse cy="3" rx="14" ry="10" fill="' + S2 + '"/><ellipse cy="-5" rx="12.5" ry="3.5" fill="#211b19"/>',
    estante: '<rect x="-13" y="-16" width="26" height="31" fill="' + S2 + '"/><path d="M-12 -6 H12 M-12 4 H12" stroke="' + K + '" stroke-width="1.6"/><rect x="-10" y="-14" width="3" height="7" fill="' + S3 + '"/><rect x="-6" y="-14" width="3" height="7" fill="' + S1 + '"/><rect x="-2" y="-14" width="3" height="7" fill="' + S3 + '"/><rect x="3" y="-14" width="3" height="7" fill="' + S1 + '"/><rect x="7" y="-14" width="3" height="7" fill="' + S3 + '"/><rect x="-10" y="-4" width="3" height="7" fill="' + S1 + '"/><rect x="-5" y="-4" width="3" height="7" fill="' + S3 + '"/><rect x="-1" y="-4" width="3" height="7" fill="' + S1 + '"/><rect x="4" y="-4" width="3" height="7" fill="' + S3 + '"/><rect x="8" y="-4" width="3" height="7" fill="' + S1 + '"/><rect x="-9" y="6" width="3" height="8" fill="' + S3 + '"/><rect x="-4" y="6" width="3" height="8" fill="' + S1 + '"/><rect x="3" y="6" width="3" height="8" fill="' + S3 + '"/><rect x="7" y="6" width="3" height="8" fill="' + S1 + '"/>',
    brasero: '<path d="M-3 4 L-7 15 H7 L3 4 Z" fill="' + S2 + '"/><path d="M-13 -4 H13 L9 4 H-9 Z" fill="' + S3 + '"/><path d="M-9 -4 q4 -4 9 -1 q4 -3 9 1" fill="#2a2220"/>',
    craneos: '<path d="M-14 14 Q-12 6 -6 8 Q0 4 6 8 Q12 6 14 14 Z" fill="' + S2 + '"/><g transform="translate(-6 5)"><circle r="4.2" fill="' + HL + '"/><circle cx="-1.5" cy="-0.3" r="1" fill="' + K + '" stroke="none"/><circle cx="1.5" cy="-0.3" r="1" fill="' + K + '" stroke="none"/></g><g transform="translate(5 6)"><circle r="4.2" fill="' + HL + '"/><circle cx="-1.5" cy="-0.3" r="1" fill="' + K + '" stroke="none"/><circle cx="1.5" cy="-0.3" r="1" fill="' + K + '" stroke="none"/></g>',
    barril: '<rect x="-10" y="-13" width="20" height="27" rx="5" fill="' + S2 + '"/><path d="M-10 -6 H10 M-10 7 H10" stroke="' + HL + '"/>',
    engranaje: engranaje,
    espejo: '<rect x="-2" y="9" width="4" height="5" fill="' + S2 + '"/><rect x="-8" y="13" width="16" height="3" fill="' + S2 + '"/><ellipse cy="-3" rx="10" ry="13" fill="' + S3 + '"/><ellipse cy="-3" rx="6.5" ry="9" fill="#1c1716"/>',
    caja: '<rect x="-13" y="-13" width="26" height="27" rx="2" fill="' + S2 + '"/><rect x="-9" y="-9" width="18" height="19" fill="' + S1 + '"/><circle cx="3" cy="0" r="3.5" fill="' + S3 + '"/><path d="M-12 -7 h2 M-12 6 h2" stroke="' + HL + '" stroke-width="2"/>',
    cristal: '<polygon points="0,-16 9,-2 6,14 -6,14 -9,-2" fill="#fff1c2"/><polygon points="0,-16 9,-2 0,4 -9,-2" fill="#ffe08a"/><polygon points="0,-12 3,-2 0,8" fill="#fff" opacity="0.7" stroke="none"/><rect x="-8" y="14" width="16" height="3" fill="' + S3 + '"/>',
    contenedor: '<path d="M-14 -2 H14 L11 16 H-11 Z" fill="#3d6a26"/><rect x="-16" y="-6" width="32" height="5" rx="1" fill="#5f8f3a"/><path d="M-6 2 H6 M-5 7 H5" stroke="#cfe3c4" stroke-width="1.2"/><path d="M-3 11 a4 4 0 1 1 6 -1" fill="none" stroke="#e7f5d8" stroke-width="1.3"/><path d="M3 8 l2 2 l-3 1 Z" fill="#e7f5d8" stroke="none"/>',
    chatarra: '<rect x="-14" y="2" width="12" height="8" fill="' + S3 + '" transform="rotate(-18 -8 6)"/><circle cx="6" cy="1" r="7" fill="' + S3 + '"/><circle cx="6" cy="1" r="2.4" fill="#2a2422" stroke="none"/><rect x="1" y="-14" width="5" height="8" fill="' + HL + '" transform="rotate(28 4 -10)"/><path d="M-6 8 L8 14" stroke="' + HL + '" stroke-width="3"/>'
  };

  function crearSvg(inner, viewBox) {
    var doc = new DOMParser().parseFromString(
      '<svg xmlns="' + SVGNS + '" viewBox="' + viewBox + '" aria-hidden="true" focusable="false">' + inner + "</svg>",
      "image/svg+xml"
    );
    return document.importNode(doc.documentElement, true);
  }

  function cuerpo(tipo) {
    var v = OBJETOS[tipo] || OBJETOS.cofre;
    return typeof v === "function" ? v() : v;
  }

  function spriteObjeto(tipo) {
    return crearSvg(
      '<g ' + TRAZO + '><ellipse cy="16" rx="13" ry="3" fill="#000" opacity="0.4" stroke="none"/>' + cuerpo(tipo) + "</g>",
      CFG.VISTA_OBJETO
    );
  }

  function spritePila(tipo) {
    var u = cuerpo(tipo);
    var g = '<g ' + TRAZO + ">" +
      '<g transform="translate(-5 8) scale(0.62)">' + u + "</g>" +
      '<g transform="translate(6 6) scale(0.7)">' + u + "</g>" +
      '<g transform="translate(0 -1) scale(0.8)">' + u + "</g></g>";
    return crearSvg(g, CFG.VISTA_PILA);
  }

  function spritePixel(filas) {
    var alto = filas.length;
    var ancho = filas[0].length;
    var partes = [];
    for (var y = 0; y < alto; y++) {
      var fila = filas[y];
      for (var x = 0; x < ancho; x++) {
        var color = COLORES[fila.charAt(x)];
        if (!color) continue;
        partes.push('<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + color + '"/>');
      }
    }
    return crearSvg(partes.join(""), "0 0 " + ancho + " " + alto);
  }

  function utf8(s) {
    var out = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) {
        var c2 = s.charCodeAt(i + 1);
        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
          c = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00);
          i++;
        }
      }
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xC0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }

  function fnv(s) {
    var h = 0x811c9dc5;
    var b = utf8(String(s));
    for (var i = 0; i < b.length; i++) {
      h ^= b[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), (t | 1)) >>> 0;
      var m = Math.imul(t ^ (t >>> 7), (t | 61)) >>> 0;
      t = (t ^ ((t + m) >>> 0)) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pyRound(v) {
    var neg = v < 0;
    var a = Math.abs(v);
    var f = Math.floor(a);
    var d = a - f;
    var r = d > 0.5 ? f + 1 : d < 0.5 ? f : (f % 2 === 0 ? f : f + 1);
    return neg ? -r : r;
  }

  function snap(v, s) {
    s = s || 8;
    return pyRound(v / s) * s;
  }

  function cruza(a, b) {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  }

  function huella(cx, by) {
    return { x: cx - PLACA_W / 2, y: by - OBJ, w: PLACA_W, h: OBJ + 4 + PLACA_H };
  }

  function muescaRect(s, e, m) {
    return {
      x: s.x + (e === "ne" || e === "se" ? s.w - m : 0),
      y: s.y + (e === "so" || e === "se" ? s.h - m : 0),
      w: m,
      h: m
    };
  }

  function medir(sala) {
    var k = sala.slots;
    if (k < 1) k = 1;
    var h = fnv(sala.fase);
    var w = k <= 2 ? 128 + (h % 2) * 16 : k <= 4 ? 208 + (h % 2) * 16 : ANCHO;
    var porFila = Math.max(1, Math.floor((w - 2 * (MURO + MARGEN)) / CELDA_W));
    var filas = Math.ceil(k / porFila);
    var alto = CAB + 2 * MURO + 2 * MARGEN + filas * CELDA_H + BANDA_BESTIAS + (fnv(sala.fase + "h") % 2) * 16;
    sala.w = w;
    sala.h = snap(alto, 16);
    sala.porFila = porFila;
    sala.filas = filas;
    sala.muescas = [];
  }

  function sumaAnchos(arr) {
    var n = 0;
    for (var i = 0; i < arr.length; i++) n += arr[i].w;
    return n;
  }

  function ubicar(salas) {
    var y = 0;
    var banda = [];
    var bandas = [];
    var i;
    for (i = 0; i < salas.length; i++) {
      medir(salas[i]);
      if (banda.length && sumaAnchos(banda) + HUECO * banda.length + salas[i].w > ANCHO) {
        bandas.push(banda);
        banda = [];
      }
      banda.push(salas[i]);
    }
    if (banda.length) bandas.push(banda);
    for (i = 0; i < bandas.length; i++) {
      var grupo = bandas[i];
      var libre = ANCHO - sumaAnchos(grupo) - HUECO * (grupo.length - 1);
      var clave = "banda";
      for (var j = 0; j < grupo.length; j++) clave += grupo[j].fase;
      var x = libre > 0 ? snap(libre * (i % 2 ? 0.75 : 0.25) + (fnv(clave) % 17) - 8) : 0;
      if (x < 0) x = 0;
      if (x > libre) x = libre;
      var altoB = 0;
      for (j = 0; j < grupo.length; j++) {
        var s = grupo[j];
        s.x = 12 + x;
        s.y = y;
        x += s.w + HUECO;
        var bajo = s.y + s.h - y;
        if (bajo > altoB) altoB = bajo;
      }
      y += altoB + 8;
    }
    return y;
  }

  function pasillos(salas) {
    var segmentos = [];
    var puertas = [];
    for (var i = 0; i < salas.length - 1; i++) {
      var a = salas[i];
      var b = salas[i + 1];
      if (Math.abs(a.y - b.y) < 40 && b.x > a.x) {
        var top = Math.max(a.y, b.y) + CAB + MURO + 8;
        var bot = Math.min(a.y + a.h, b.y + b.h) - 40;
        var yy = snap((top + bot) / 2, 8);
        segmentos.push({ x: a.x + a.w, y: yy, w: b.x - (a.x + a.w), h: 16 });
        puertas.push({ sala: a, tipo: "v", x: a.x + a.w - 8, y: yy - 4 });
        puertas.push({ sala: b, tipo: "v", x: b.x, y: yy - 4 });
      } else {
        var lo = Math.max(a.x, b.x) + 24;
        var hi = Math.min(a.x + a.w, b.x + b.w) - 40;
        var y0 = a.y + a.h;
        var y1 = b.y;
        if (hi - lo >= 0) {
          var xx = snap((lo + hi) / 2, 8);
          segmentos.push({ x: xx, y: y0, w: 16, h: y1 - y0 });
          puertas.push({ sala: a, tipo: "h", x: xx - 4, y: a.y + a.h - 8 });
          puertas.push({ sala: b, tipo: "h", x: xx - 4, y: b.y });
        } else {
          var ax = snap(a.x + a.w / 2, 8);
          var bx = snap(b.x + b.w / 2, 8);
          var my = snap((y0 + y1) / 2, 8) - 8;
          segmentos.push({ x: ax, y: y0, w: 16, h: my - y0 + 16 });
          segmentos.push({ x: Math.min(ax, bx), y: my, w: Math.abs(bx - ax) + 16, h: 16 });
          segmentos.push({ x: bx, y: my, w: 16, h: y1 - my });
          puertas.push({ sala: a, tipo: "h", x: ax - 4, y: a.y + a.h - 8 });
          puertas.push({ sala: b, tipo: "h", x: bx - 4, y: b.y });
        }
      }
    }
    return { segmentos: segmentos, puertas: puertas };
  }

  function colocarSlots(sala, nivel) {
    var x0 = sala.x + MURO + MARGEN;
    var y0 = sala.y + MURO + CAB;
    var x1 = sala.x + sala.w - MURO - MARGEN;
    var y1 = sala.y + sala.h - MURO - BANDA_BESTIAS;
    var rnd = mulberry(fnv(sala.fase + "|" + nivel));
    var k = sala.slots;
    var altoFila = (y1 - y0) / sala.filas;
    var out = [];
    var r, c, n, libre, off, cx, holg, by;
    for (r = 0; r < sala.filas; r++) {
      n = Math.min(sala.porFila, k - r * sala.porFila);
      libre = (x1 - x0) - n * CELDA_W;
      off = libre * rnd();
      for (c = 0; c < n; c++) {
        cx = x0 + off + (c + 0.5) * CELDA_W + (rnd() - 0.5) * (CELDA_W - PLACA_W);
        holg = altoFila - (OBJ + 4 + PLACA_H);
        by = y0 + r * altoFila + OBJ + rnd() * holg;
        out.push([Math.round(cx), Math.round(by)]);
      }
    }
    out.sort(function (p, q) { return p[1] - q[1] || p[0] - q[0]; });
    var cand = ["ne", "so", "se"];
    var o = fnv(sala.fase + "e") % 3;
    var quiere = fnv(sala.fase + "n") % 3;
    for (var i = 0; i < 3; i++) {
      if (sala.muescas.length >= quiere) break;
      var e = cand[(o + i) % 3];
      var m = muescaRect(sala, e, 32 + MARGEN);
      var toca = false;
      for (var p = 0; p < out.length; p++) if (cruza(huella(out[p][0], out[p][1]), m)) toca = true;
      if (!toca) sala.muescas.push(e);
    }
    return out;
  }

  function ordenar(proyectos) {
    return proyectos.slice().sort(function (a, b) {
      if (!!a.bloqueada !== !!b.bloqueada) return a.bloqueada ? -1 : 1;
      var ha = fnv(a.id || a.nombre);
      var hb = fnv(b.id || b.nombre);
      return ha < hb ? -1 : ha > hb ? 1 : 0;
    });
  }

  function asignar(proyectos, sl, cupo) {
    var proys = ordenar(proyectos);
    var hay = proys.length > cupo && sl.length > 0;
    var nLibres = sl.length - (hay ? 1 : 0);
    if (nLibres < 0) nLibres = 0;
    var vis = proys.slice(0, nLibres);
    var resto = proys.slice(nLibres);
    var usados = [];
    var mapa = {};
    for (var i = 0; i < vis.length; i++) {
      if (!nLibres) break;
      var p = vis[i];
      var k = fnv((p.id || p.nombre) + "s") % nLibres;
      var guard = 0;
      while (usados.indexOf(k) >= 0 && guard < nLibres) {
        k = (k + 1) % nLibres;
        guard++;
      }
      usados.push(k);
      mapa[p.id] = sl[k];
    }
    return { mapa: mapa, pila: hay ? sl[sl.length - 1] : null, resto: resto };
  }

  function semillaDe(app) {
    return app.id || app.nombre || "";
  }

  function normalizar(s) {
    var t = String(s || "").toLowerCase();
    try { t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {}
    return t;
  }

  function familiaDe(app) {
    var em = String(app.emoji || "").replace(/\uFE0F/g, "");
    var grupos = ["musica", "juego", "herramienta", "datos"];
    var g, i, lista;
    for (g = 0; g < grupos.length; g++) {
      lista = EMOJIS[grupos[g]];
      for (i = 0; i < lista.length; i++) {
        if (em.indexOf(lista[i].replace(/\uFE0F/g, "")) >= 0) return grupos[g];
      }
    }
    var texto = normalizar((app.nombre || "") + " " + (app.descripcion || ""));
    for (i = 0; i < REGLAS.length; i++) if (REGLAS[i][0].test(texto)) return REGLAS[i][1];
    var btn = normalizar(app.boton);
    if (btn.indexOf("jugar") >= 0) return "juego";
    if (btn.indexOf("probar") >= 0) return "herramienta";
    return "generico";
  }

  function aspecto(app) {
    var id = semillaDe(app);
    var fam = familiaDe(app);
    var i = fnv(id) % 3;
    var rampa = RAMPAS[fnv(id + "c") % 3];
    return {
      fam: fam,
      rampa: rampa,
      objeto: "obj/" + fam + "/" + i + "-" + VARS[fam][i] + "/" + rampa,
      mini: "pila/mini/" + fam + "/" + rampa,
      icono: "icono/" + fam
    };
  }

  function estadoSprite(estado) {
    if (estado === 2) return "estado/telarana";
    if (estado === 3) return "estado/ojo";
    if (estado === 4) return "estado/chispa";
    return "";
  }

  function fragmentoDe(n) {
    if (n >= 5) return "lanz/fragmento/alto";
    if (n >= 3) return "lanz/fragmento/medio";
    return "lanz/fragmento/bajo";
  }

  function temaDe(fase) {
    return CFG.TEMAS[fase] || CFG.TEMAS["0"] || CFG.DEFECTO;
  }

  function nivelDe(n) {
    var nivel = CFG.NIVELES[0];
    for (var i = 0; i < CFG.NIVELES.length; i++) {
      if (n >= CFG.NIVELES[i].min) nivel = CFG.NIVELES[i];
    }
    return nivel;
  }

  function slotsVisibles(sala, cupo) {
    var n = sala.apps.length;
    if (sala.fase === CFG.FASE_ENERGIA) return Math.min(n, 6) + 1;
    if (sala.fase === CFG.FASE_RECICLAJE) return Math.min(n, 6);
    return Math.min(n, cupo);
  }

  function leerApp(card) {
    var h3 = card.querySelector("h3");
    var nombre = "";
    var emoji = "";
    if (h3) {
      var em = h3.querySelector('[aria-hidden="true"]');
      if (em) emoji = em.textContent.trim();
      var clon = h3.cloneNode(true);
      var ocultos = clon.querySelectorAll('[aria-hidden="true"]');
      for (var i = 0; i < ocultos.length; i++) ocultos[i].remove();
      nombre = clon.textContent.replace(/\s+/g, " ").trim();
    }
    var desc = "";
    var ps = card.querySelectorAll(":scope > p");
    for (i = 0; i < ps.length; i++) {
      if (ps[i].classList.contains("links")) continue;
      desc = ps[i].textContent.replace(/\s+/g, " ").trim();
      break;
    }
    var btn = card.querySelector(".links a.btn");
    var id = (card.getAttribute("data-id") || card.getAttribute("data-app") || nombre || "").toLowerCase();
    var slug = (card.getAttribute("data-app") || "").toLowerCase();
    if (!slug) {
      var corte = id.lastIndexOf("/");
      slug = corte >= 0 ? id.slice(corte + 1) : id;
    }
    var meta = (card.getAttribute("data-proyecto") || "").split("|");
    var estado = parseInt(meta[1], 10);
    var comp = parseInt(meta[2], 10);
    if (!(estado >= 0 && estado <= 4)) estado = 0;
    if (!(comp >= 0 && comp <= 6)) comp = 0;
    var extra = extrasMeta(slug);
    return {
      id: id,
      slug: slug,
      nombre: nombre || id,
      href: btn ? btn.href : "",
      emoji: emoji,
      descripcion: desc,
      boton: btn ? btn.textContent.replace(/\s+/g, " ").trim() : "",
      estado: estado,
      completadas: comp,
      bloqueada: extra.bloqueada,
      aportes: extra.aportes
    };
  }

  function entero(n, lo, hi) {
    return typeof n === "number" && isFinite(n) && Math.floor(n) === n && n >= lo && n <= hi;
  }

  function metaCruda(slug) {
    if (!slug || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(slug)) return null;
    var raw = null;
    try { raw = window.localStorage.getItem(CFG.CLAVE_META + slug); } catch (e) { return null; }
    if (typeof raw !== "string" || !raw || raw.length > 200000) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function idStat(s) {
    if (typeof s !== "string") return "";
    var t = s.trim().toLowerCase();
    if (t.length < 1 || t.length > CFG.STAT_ID_MAX) return "";
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(t)) return "";
    return t;
  }

  function fuenteDe(s) {
    return s === "creacion" || s === "uso" ? s : "";
  }

  function aportesDe(lista) {
    if (!Array.isArray(lista)) return [];
    var mapa = {};
    var orden = [];
    for (var j = 0; j < lista.length; j++) {
      var it = lista[j];
      if (!it || typeof it !== "object") continue;
      var id = idStat(it.id);
      if (!id || !entero(it.aporte, 1, CFG.APORTE_MAX)) continue;
      var fuente = fuenteDe(it.fuente);
      var clave = id + "|" + fuente;
      if (!mapa[clave]) {
        mapa[clave] = { id: id, aporte: 0, fuente: fuente };
        orden.push(clave);
      }
      mapa[clave].aporte += it.aporte;
    }
    var out = [];
    for (var i = 0; i < orden.length; i++) out.push(mapa[orden[i]]);
    return out;
  }

  function extrasMeta(slug) {
    var rec = metaCruda(slug);
    var p = rec && rec.v === 1 && rec.slug === slug && rec.proyecto && typeof rec.proyecto === "object" && !Array.isArray(rec.proyecto) ? rec.proyecto : null;
    if (!p) return { bloqueada: false, aportes: [] };
    return { bloqueada: p.bloqueada === true, aportes: aportesDe(p.aportes) };
  }

  function leerSalas() {
    var secs = document.querySelectorAll("main .fases > .fase");
    var salas = [];
    for (var i = 0; i < secs.length; i++) {
      var sec = secs[i];
      var grid = sec.querySelector(":scope > .grid");
      if (!grid) continue;
      var cards = grid.querySelectorAll(":scope > li.card");
      if (!cards.length) continue;
      var h2 = sec.querySelector(":scope > h2");
      var apps = [];
      for (var j = 0; j < cards.length; j++) apps.push(leerApp(cards[j]));
      salas.push({
        fase: sec.getAttribute("data-fase") || "0",
        nombre: h2 ? h2.textContent.replace(/\s+/g, " ").trim() : "",
        apps: apps
      });
    }
    return fusionar(salas);
  }

  function fusionar(salas) {
    var fusion = CFG.FUSION;
    var apps = [];
    var hay = false;
    var i;
    for (i = 0; i < salas.length; i++) {
      if (fusion.fases.indexOf(salas[i].fase) < 0) continue;
      hay = true;
      apps = apps.concat(salas[i].apps);
    }
    if (!hay) return salas;
    var salida = [];
    var puesta = false;
    for (i = 0; i < salas.length; i++) {
      if (fusion.fases.indexOf(salas[i].fase) >= 0) {
        if (!puesta) {
          salida.push({ fase: fusion.fase, nombre: fusion.nombre, apps: apps });
          puesta = true;
        }
      } else salida.push(salas[i]);
    }
    return salida;
  }

  function finalizados(salas) {
    for (var i = 0; i < salas.length; i++) {
      if (salas[i].fase === CFG.FASE_ENERGIA) return salas[i].apps.length;
    }
    return 0;
  }

  function preparar(salas, nivel) {
    var copias = [];
    for (var i = 0; i < salas.length; i++) {
      copias.push({
        fase: salas[i].fase || "0",
        nombre: salas[i].nombre,
        apps: salas[i].apps,
        slots: slotsVisibles(salas[i], nivel.cupo)
      });
    }
    var alto = ubicar(copias);
    var corr = pasillos(copias);
    for (i = 0; i < copias.length; i++) copias[i].pts = colocarSlots(copias[i], nivel.id);
    return { salas: copias, alto: alto, corr: corr };
  }

  function hayDibujo() {
    return atlasEstado === "listo" && atlas && atlasImg;
  }

  function frame(nombre) {
    return atlas && atlas.frames ? atlas.frames[nombre] : null;
  }

  function dprDe() {
    var ancho = lienzoEl ? lienzoEl.clientWidth : window.innerWidth;
    var max = ancho <= CFG.ANCHO_MOVIL ? CFG.NIEBLA.DPR_MOVIL : CFG.NIEBLA.DPR_MAX;
    return Math.min(window.devicePixelRatio || 1, max || 1);
  }

  function blit(ctx, nombre, dx, dy, escala) {
    var f = frame(nombre);
    if (!f) return;
    var sc = escala || 1;
    ctx.drawImage(atlasImg, f.x, f.y, f.w, f.h, Math.round(dx), Math.round(dy), Math.round(f.w * sc), Math.round(f.h * sc));
  }

  function tile(ctx, nombre, x, y, w, h) {
    var f = frame(nombre);
    if (!f || w < 1 || h < 1) return;
    var x0 = Math.round(x);
    var y0 = Math.round(y);
    var x1 = Math.round(x + w);
    var y1 = Math.round(y + h);
    for (var yy = y0; yy < y1; yy += f.h) {
      for (var xx = x0; xx < x1; xx += f.w) {
        var cw = Math.min(f.w, x1 - xx);
        var ch = Math.min(f.h, y1 - yy);
        if (cw > 0 && ch > 0) ctx.drawImage(atlasImg, f.x, f.y, cw, ch, xx, yy, cw, ch);
      }
    }
  }

  function lienzoDe(w, h) {
    var c = document.createElement("canvas");
    var dpr = dprDe();
    c.width = Math.max(1, Math.floor(w * dpr));
    c.height = Math.max(1, Math.floor(h * dpr));
    c.style.width = w + "px";
    c.style.height = h + "px";
    var ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    c.setAttribute("aria-hidden", "true");
    return { canvas: c, ctx: ctx };
  }

  function muescaLocal(sala, e, m) {
    var r = muescaRect(sala, e, m);
    return { x: r.x - sala.x, y: r.y - sala.y, w: r.w, h: r.h };
  }

  function dibujarMuesca(ctx, nivel, m, e) {
    ctx.clearRect(m.x, m.y, m.w, m.h);
    var N = nivel + "/muro/";
    if (e === "ne") {
      tile(ctx, N + "h", m.x - 8, m.y + m.h - 8, m.w + 8, 8);
      tile(ctx, N + "v", m.x - 8, m.y, 8, m.h);
      blit(ctx, N + "int-se", m.x - 8, m.y + m.h - 8, 1);
    } else if (e === "se") {
      tile(ctx, N + "h", m.x - 8, m.y, m.w + 8, 8);
      tile(ctx, N + "v", m.x - 8, m.y, 8, m.h);
      blit(ctx, N + "int-ne", m.x - 8, m.y, 1);
    } else if (e === "so") {
      tile(ctx, N + "h", m.x, m.y, m.w + 8, 8);
      tile(ctx, N + "v", m.x + m.w, m.y, 8, m.h);
      blit(ctx, N + "int-no", m.x + m.w, m.y, 1);
    }
  }

  function planDeco(sala, nivel) {
    var lista = DECOS[nivel] || [];
    var out = [];
    if (!lista.length) return out;
    for (var j = 0; j < 2; j++) {
      var nombre = lista[fnv(sala.fase + nivel + String(j)) % lista.length];
      var f = frame(nivel + "/deco/" + nombre);
      var fw = f ? f.w : 16;
      var fh = f ? f.h : 16;
      var alta = !!ALTAS[nombre];
      var x = alta ? sala.w - 28 - j * 22 : 10 + j * (sala.w - 36);
      var y = alta ? 8 : sala.h - 8 - fh - 2;
      if (x < 8) x = 8;
      if (x + fw > sala.w - 8) x = Math.max(8, sala.w - 8 - fw);
      if (y < 8) y = 8;
      out.push({ nombre: nombre, x: x, y: y, fw: fw, fh: fh });
    }
    return out;
  }

  function dibujarFondo(sala, nivel, puertas, decos) {
    var box = lienzoDe(sala.w, sala.h);
    var ctx = box.ctx;
    var i;
    if (!hayDibujo()) {
      ctx.fillStyle = "#241c1a";
      ctx.fillRect(0, 0, sala.w, sala.h);
      ctx.strokeStyle = "#100c0b";
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, sala.w - 8, sala.h - 8);
      for (i = 0; i < sala.muescas.length; i++) {
        var hueco = muescaLocal(sala, sala.muescas[i], 32);
        ctx.clearRect(hueco.x, hueco.y, hueco.w, hueco.h);
      }
      return box.canvas;
    }
    var N = nivel.id;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, sala.w, sala.h);
    ctx.clip();
    var ty, tx, wx, wy;
    for (ty = 0; ty < sala.h; ty += 32) {
      for (tx = 0; tx < sala.w; tx += 32) {
        wx = sala.x + tx;
        wy = sala.y + ty;
        blit(ctx, N + "/piso/" + (fnv(sala.fase + String(wx) + String(wy)) % 5 === 0 ? "b" : "a"), tx, ty, 1);
      }
    }
    for (i = 0; i < sala.muescas.length; i++) {
      var n0 = muescaLocal(sala, sala.muescas[i], 32);
      ctx.clearRect(n0.x, n0.y, n0.w, n0.h);
    }
    tile(ctx, N + "/muro/h", 0, 0, sala.w, 8);
    tile(ctx, N + "/muro/h", 0, sala.h - 8, sala.w, 8);
    tile(ctx, N + "/muro/v", 0, 0, 8, sala.h);
    tile(ctx, N + "/muro/v", sala.w - 8, 0, 8, sala.h);
    for (i = 0; i < sala.muescas.length; i++) dibujarMuesca(ctx, N, muescaLocal(sala, sala.muescas[i], 32), sala.muescas[i]);
    var esquinas = [["esq-no", 0, 0], ["esq-ne", sala.w - 8, 0], ["esq-so", 0, sala.h - 8], ["esq-se", sala.w - 8, sala.h - 8]];
    for (i = 0; i < esquinas.length; i++) {
      var esq = { x: esquinas[i][1], y: esquinas[i][2], w: 8, h: 8 };
      var tapa = false;
      for (var k = 0; k < sala.muescas.length; k++) if (cruza(esq, muescaLocal(sala, sala.muescas[k], 32))) tapa = true;
      if (!tapa) blit(ctx, N + "/muro/" + esquinas[i][0], esq.x, esq.y, 1);
    }
    for (i = 0; i < puertas.length; i++) {
      if (puertas[i].sala !== sala) continue;
      blit(ctx, N + "/puerta/" + puertas[i].tipo, puertas[i].x - sala.x, puertas[i].y - sala.y, 1);
    }
    var det = frame(N + "/piso/detalle");
    if (det && fnv(sala.fase + "d") % 2 === 0) {
      var rx0 = MURO + MARGEN;
      var ry0 = MURO + CAB;
      var rx1 = sala.w - MURO - MARGEN - det.w;
      var ry1 = sala.h - MURO - BANDA_BESTIAS - det.h;
      if (rx1 > rx0 && ry1 > ry0) {
        var rnd = mulberry(fnv(sala.fase + "|det|" + N));
        for (var t = 0; t < 6; t++) {
          var dx = Math.round(rx0 + rnd() * (rx1 - rx0));
          var dy = Math.round(ry0 + rnd() * (ry1 - ry0));
          var boxD = { x: dx, y: dy, w: det.w, h: det.h };
          var libre = true;
          for (k = 0; k < sala.pts.length; k++) {
            var hf = huella(sala.pts[k][0], sala.pts[k][1]);
            hf.x -= sala.x;
            hf.y -= sala.y;
            if (cruza(boxD, hf)) libre = false;
          }
          if (libre) {
            blit(ctx, N + "/piso/detalle", dx, dy, 1);
            break;
          }
        }
      }
    }
    for (i = 0; i < decos.length; i++) {
      var d = decos[i];
      if ((nivel.id === "brasa" && d.nombre === "brasero") || (nivel.id === "llama" && d.nombre === "aplique")) {
        blit(ctx, N + "/luz/charco", d.x + d.fw / 2 - 16, d.y + d.fh - 8, 1);
        continue;
      }
      blit(ctx, N + "/deco/" + d.nombre, d.x, d.y, 1);
    }
    if (nivel.id === "forja" || nivel.id === "faro") blit(ctx, N + "/luz/charco", sala.w / 2 - 16, 26, 1);
    ctx.restore();
    return box.canvas;
  }

  function pasilloEl(seg, nivel) {
    var w = Math.round(seg.w);
    var h = Math.round(seg.h);
    if (w < 1 || h < 1) return null;
    var box = lienzoDe(w, h);
    box.canvas.className = "maz-pasillo";
    box.canvas.style.left = seg.x + "px";
    box.canvas.style.top = seg.y + "px";
    box.canvas.style.zIndex = "0";
    if (hayDibujo()) tile(box.ctx, nivel.id + "/pasillo", 0, 0, w, h);
    else {
      box.ctx.fillStyle = "#3a302c";
      box.ctx.fillRect(0, 0, w, h);
    }
    return box.canvas;
  }

  function spriteEl(nombre, escala) {
    var f = frame(nombre);
    if (!f || !atlasCss) return null;
    var s = document.createElement("span");
    s.className = "maz-px";
    s.setAttribute("aria-hidden", "true");
    var sc = escala || 1;
    s.style.width = (f.w * sc) + "px";
    s.style.height = (f.h * sc) + "px";
    s.style.backgroundImage = atlasCss;
    s.style.backgroundPosition = (-f.x * sc) + "px " + (-f.y * sc) + "px";
    s.style.backgroundSize = (atlas.size[0] * sc) + "px " + (atlas.size[1] * sc) + "px";
    return s;
  }

  function fondoNueve(nombre, w, h) {
    var clave = nombre + "@" + w + "x" + h;
    if (Object.prototype.hasOwnProperty.call(placaCache, clave)) return placaCache[clave];
    var f = frame(nombre);
    if (!f || !hayDibujo()) {
      placaCache[clave] = "";
      return "";
    }
    try {
      var b = (atlas.nine_slice && (atlas.nine_slice[nombre] || atlas.nine_slice["placa/*-9s"])) || 4;
      var c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      var ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      function parte(sx, sy, sw, sh, dx, dy, dw, dh) {
        if (sw > 0 && sh > 0 && dw > 0 && dh > 0) ctx.drawImage(atlasImg, f.x + sx, f.y + sy, sw, sh, dx, dy, dw, dh);
      }
      var W = f.w;
      var H = f.h;
      parte(0, 0, b, b, 0, 0, b, b);
      parte(b, 0, W - 2 * b, b, b, 0, w - 2 * b, b);
      parte(W - b, 0, b, b, w - b, 0, b, b);
      parte(0, b, b, H - 2 * b, 0, b, b, h - 2 * b);
      parte(b, b, W - 2 * b, H - 2 * b, b, b, w - 2 * b, h - 2 * b);
      parte(W - b, b, b, H - 2 * b, w - b, b, b, h - 2 * b);
      parte(0, H - b, b, b, 0, h - b, b, b);
      parte(b, H - b, W - 2 * b, b, b, h - b, w - 2 * b, b);
      parte(W - b, H - b, b, b, w - b, h - b, b, b);
      placaCache[clave] = c.toDataURL();
    } catch (e) {
      placaCache[clave] = "";
    }
    return placaCache[clave];
  }

  function rotulo(nombre, nivel) {
    var el = document.createElement("span");
    el.className = "maz-rotulo";
    el.setAttribute("aria-hidden", "true");
    var url = fondoNueve("placa/" + nivel + "-9s", PLACA_W, PLACA_H);
    if (url) el.style.backgroundImage = "url(" + url + ")";
    else el.classList.add("maz-rotulo-simple");
    var t = document.createElement("span");
    t.textContent = nombre;
    el.appendChild(t);
    return el;
  }

  function etiqueta(texto) {
    var el = document.createElement("span");
    el.className = "maz-etiqueta";
    el.textContent = texto;
    var w = Math.max(22, 10 + String(texto).length * 6);
    var h = 14;
    var url = fondoNueve("pila/etiqueta-9s", w, h);
    if (url) el.style.backgroundImage = "url(" + url + ")";
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.style.left = "18px";
    el.style.top = "72px";
    return el;
  }

  function baseEl(tag, clase, sala, cx, by) {
    var el = document.createElement(tag);
    el.className = clase;
    el.style.left = (cx - sala.x - PLACA_W / 2) + "px";
    el.style.top = (by - sala.y - OBJ) + "px";
    el.style.zIndex = String(10000 + by);
    return el;
  }

  function ponerEstado(el, app, left, top) {
    var nombre = estadoSprite(app.estado);
    if (!nombre) return;
    var sp = spriteEl(nombre, 2);
    if (!sp) return;
    sp.style.position = "absolute";
    sp.style.left = left + "px";
    sp.style.top = top + "px";
    sp.style.zIndex = "3";
    el.appendChild(sp);
  }

  function respaldo(el, tipo, left, top, w, h) {
    var s = document.createElement("span");
    s.className = "maz-sprite";
    s.style.left = left + "px";
    s.style.top = top + "px";
    s.style.width = w + "px";
    s.style.height = h + "px";
    s.appendChild(spriteObjeto(tipo));
    el.appendChild(s);
  }

  function claseEstado(app) {
    return app.bloqueada ? "maz-bloqueada" : "maz-estado-" + app.estado;
  }

  function marcarEstado(el, app) {
    el.classList.add(claseEstado(app));
    if (app.bloqueada) el.setAttribute("aria-label", app.nombre + ", " + CFG.TEXTOS.BLOQUEADA);
    if (!app.bloqueada) return;
    var c = document.createElement("img");
    c.className = "maz-candado";
    c.alt = "";
    c.width = CFG.CANDADO_PX;
    c.height = CFG.CANDADO_PX;
    c.decoding = "async";
    c.src = "img/mazmorra/candado.png?v=" + CFG.VERSION;
    el.appendChild(c);
  }

  function objetoEl(sala, app, cx, by, nivel) {
    var el = app.href ? document.createElement("a") : document.createElement("span");
    if (app.href) el.href = app.href;
    el.className = "maz-obj " + claseEstado(app);
    el.style.left = (cx - sala.x - PLACA_W / 2) + "px";
    el.style.top = (by - sala.y - OBJ) + "px";
    el.style.zIndex = String(10000 + by);
    el.title = app.nombre;
    el.setAttribute("aria-label", app.nombre);
    var asp = aspecto(app);
    var sp = spriteEl(asp.objeto, 2);
    if (sp) {
      var peana = spriteEl("peana/" + (sala.fase === "2" || sala.fase === "3" ? "23" : sala.fase), 2);
      if (peana) {
        peana.style.position = "absolute";
        peana.style.left = "6px";
        peana.style.top = "48px";
        peana.style.zIndex = "0";
        el.appendChild(peana);
      }
      sp.style.position = "absolute";
      sp.style.left = "6px";
      sp.style.top = "0";
      sp.style.zIndex = "1";
      el.appendChild(sp);
      if (!app.bloqueada) ponerEstado(el, app, 54, 0);
    } else {
      var tema = temaDe(sala.fase === "23" ? "2" : sala.fase);
      var tipos = tema.objetos || ["cofre"];
      respaldo(el, tipos[fnv(semillaDe(app)) % tipos.length], 6, 0, 64, 64);
    }
    if (app.bloqueada) marcarEstado(el, app);
    el.appendChild(rotulo(app.nombre, nivel.id));
    return el;
  }

  function fragmentoEl(sala, app, cx, by, nivel) {
    var el = app.href ? document.createElement("a") : document.createElement("span");
    if (app.href) el.href = app.href;
    el.className = "maz-obj " + claseEstado(app);
    el.style.left = (cx - sala.x - PLACA_W / 2) + "px";
    el.style.top = (by - sala.y - OBJ) + "px";
    el.style.zIndex = String(10000 + by);
    el.title = app.nombre;
    el.setAttribute("aria-label", app.nombre);
    var sp = spriteEl(fragmentoDe(app.completadas), 2);
    if (sp) {
      sp.style.position = "absolute";
      sp.style.left = "22px";
      sp.style.top = "0";
      el.appendChild(sp);
      if (!app.bloqueada) ponerEstado(el, app, 38, 0);
    } else respaldo(el, "cristal", 6, 0, 64, 64);
    if (app.bloqueada) marcarEstado(el, app);
    el.appendChild(rotulo(app.nombre, nivel.id));
    return el;
  }

  function cajaEl(sala, app, cx, by, nivel) {
    var el = app.href ? document.createElement("a") : document.createElement("span");
    if (app.href) el.href = app.href;
    el.className = "maz-obj " + claseEstado(app);
    el.style.left = (cx - sala.x - PLACA_W / 2) + "px";
    el.style.top = (by - sala.y - OBJ) + "px";
    el.style.zIndex = String(10000 + by);
    el.title = app.nombre;
    el.setAttribute("aria-label", app.nombre);
    var asp = aspecto(app);
    var sp = spriteEl("desc/caja/" + (fnv(semillaDe(app)) % 2), 2);
    if (sp) {
      sp.style.position = "absolute";
      sp.style.left = "14px";
      sp.style.top = "16px";
      el.appendChild(sp);
      var ic = spriteEl(asp.icono, 2);
      if (ic) {
        ic.style.position = "absolute";
        ic.style.left = "30px";
        ic.style.top = "36px";
        ic.style.zIndex = "2";
        el.appendChild(ic);
      }
      if (!app.bloqueada) ponerEstado(el, app, 46, 16);
    } else respaldo(el, "caja", 6, 0, 64, 64);
    if (app.bloqueada) marcarEstado(el, app);
    el.appendChild(rotulo(app.nombre, nivel.id));
    return el;
  }

  function minis(el, resto) {
    var n = Math.min(3, resto.length);
    for (var j = 0; j < n; j++) {
      var sp = spriteEl(aspecto(resto[j]).mini, 1);
      if (!sp) continue;
      sp.style.position = "absolute";
      sp.style.left = (8 + j * 18) + "px";
      sp.style.top = (14 + (j % 2) * 8) + "px";
      sp.style.zIndex = String(j + 1);
      el.appendChild(sp);
    }
  }

  function pilaEl(sala, todas, cuenta, cx, by, nivel, racimo) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "maz-pila";
    el.style.left = (cx - sala.x - PLACA_W / 2) + "px";
    el.style.top = (by - sala.y - OBJ) + "px";
    el.style.zIndex = String(10000 + by);
    el.setAttribute("aria-label", sala.nombre + ", +" + cuenta);
    var arte = pilaImg(sala.fase);
    if (arte) el.appendChild(arte);
    else if (racimo) {
      var sp = spriteEl("lanz/racimo-pila", 2);
      if (sp) {
        sp.style.position = "absolute";
        sp.style.left = "14px";
        sp.style.top = "8px";
        el.appendChild(sp);
      }
    }
    if (!el.querySelector(".maz-px, .maz-sprite, .maz-pila-sprite")) {
      var tema = temaDe(sala.fase === "23" ? "2" : sala.fase);
      var tipos = tema.objetos || ["cofre"];
      respaldo(el, tipos[0], 10, 6, 52, 52);
    }
    var et = etiqueta("+" + cuenta);
    et.style.left = "auto";
    et.style.right = "2px";
    et.style.top = "2px";
    el.appendChild(et);
    el.addEventListener("click", function () { abrirPila(sala.nombre, todas, el); });
    return el;
  }

  function pilaImg(fase) {
    var nombre = CFG.PILAS[fase];
    if (!nombre) return null;
    var img = document.createElement("img");
    img.className = "maz-pila-sprite";
    img.alt = "";
    img.width = CFG.PILA_PX;
    img.height = CFG.PILA_PX;
    img.decoding = "async";
    img.src = "img/mazmorra/" + nombre + "?v=" + CFG.VERSION;
    return img;
  }

  function binRect(sala) {
    return { x: sala.w - 68, y: sala.h - 60, w: 48, h: 48 };
  }

  function binEl(sala, resto, nivel) {
    var r = binRect(sala);
    var el = resto.length ? document.createElement("button") : document.createElement("span");
    el.className = "maz-bin";
    el.style.left = r.x + "px";
    el.style.top = r.y + "px";
    el.style.zIndex = "30000";
    var sp = spriteEl("desc/contenedor/" + (resto.length ? "lleno" : "vacio"), 1.5);
    if (sp) el.appendChild(sp);
    else el.appendChild(spriteObjeto(resto.length ? "contenedor" : "chatarra"));
    if (resto.length) {
      el.type = "button";
      el.setAttribute("aria-label", sala.nombre + ", +" + resto.length);
      var et = etiqueta("+" + resto.length);
      et.style.left = "4px";
      et.style.top = "32px";
      el.appendChild(et);
      el.addEventListener("click", function () { abrirPila(sala.nombre, sala.apps, el); });
    } else el.setAttribute("aria-hidden", "true");
    return el;
  }

  function fuenteEl(sala, pt, apps) {
    var cx = pt[0];
    var by = pt[1];
    var el = document.createElement("button");
    el.type = "button";
    el.className = "maz-fuente";
    el.style.left = (cx - sala.x - 36) + "px";
    el.style.top = (by - sala.y - 72) + "px";
    el.style.zIndex = String(10000 + by);
    el.setAttribute("aria-label", sala.nombre);
    var halo = spriteEl("lanz/halo", 1.5);
    if (halo) {
      halo.classList.add("maz-halo-brillo");
      halo.style.position = "absolute";
      halo.style.left = "0";
      halo.style.top = "4px";
      el.appendChild(halo);
    }
    var fuente = spriteEl("lanz/fuente", 1.5);
    if (fuente) {
      fuente.style.position = "absolute";
      fuente.style.left = "12px";
      fuente.style.top = "0";
      el.appendChild(fuente);
    } else {
      respaldo(el, "cristal", 4, 8, 64, 64);
    }
    el.addEventListener("click", function () { abrirPila(sala.nombre, apps, el); });
    return el;
  }

  function elegirFuente(sala, sl) {
    var best = sl[0];
    var mejor = Infinity;
    var cx = sala.x + sala.w / 2;
    for (var i = 0; i < sl.length; i++) {
      var d = Math.abs(sl[i][0] - cx) + Math.abs(sl[i][1] - sala.y) * 0.5;
      if (d < mejor) {
        mejor = d;
        best = sl[i];
      }
    }
    return best;
  }

  function bestiaEl(sala, nivel) {
    var info = CFG.BESTIAS[fnv(sala.fase) % CFG.BESTIAS.length];
    var el = document.createElement("span");
    el.className = "maz-bestia";
    if (nivel.id === "ceniza") el.classList.add("maz-bestia-ceniza");
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", info.nombre);
    var x = MURO + MARGEN + 4 + (fnv(sala.fase + "b") % Math.max(1, sala.w - 60));
    if (sala.fase === CFG.FASE_RECICLAJE) {
      var bin = binRect(sala);
      if (x + 28 > bin.x && x < bin.x + bin.w) x = Math.max(8, bin.x - 32);
    }
    el.style.left = x + "px";
    el.style.top = (sala.h - 38) + "px";
    var sp = spriteEl("bestia/" + info.id, 1.75);
    if (sp) el.appendChild(sp);
    else if (ARTE[info.id]) {
      var cajaB = document.createElement("span");
      cajaB.className = "maz-px";
      cajaB.style.width = "28px";
      cajaB.style.height = "28px";
      cajaB.appendChild(spritePixel(ARTE[info.id]));
      el.appendChild(cajaB);
    }
    var extra = nivel.id === "ceniza" ? "bestia/extra/zzz" : nivel.id === "forja" ? "bestia/extra/casco" : nivel.id === "faro" ? "bestia/extra/halo" : "";
    if (extra && atlas && atlas.anchors && atlas.anchors["bestia/" + info.id]) {
      var ov = spriteEl(extra, 1.75);
      var an = atlas.anchors["bestia/" + info.id].cabeza;
      var f = frame(extra);
      if (ov && an && f) {
        ov.style.position = "absolute";
        ov.style.left = (an[0] * 1.75 - f.w * 1.75 / 2) + "px";
        ov.style.top = (an[1] * 1.75 - f.h * 1.75) + "px";
        el.appendChild(ov);
      }
    }
    return el;
  }

  function luzEl(sala, nivel) {
    if (nivel.id === "forja" || nivel.id === "faro") return null;
    var luz = spriteEl(nivel.id + "/luz/charco", 1);
    if (!luz) return null;
    luz.classList.add("maz-parpadeo");
    luz.style.position = "absolute";
    luz.style.left = (sala.w / 2 - 16) + "px";
    luz.style.top = "26px";
    luz.style.zIndex = "2";
    luz.style.animationDelay = ((fnv(sala.fase) % 13) / 10) + "s";
    return luz;
  }

  function decoViva(sec, sala, nivel, decos) {
    for (var i = 0; i < decos.length; i++) {
      var d = decos[i];
      var viva = (nivel.id === "brasa" && d.nombre === "brasero") || (nivel.id === "llama" && d.nombre === "aplique");
      if (!viva) continue;
      var sp = spriteEl(nivel.id + "/deco/" + d.nombre, 1);
      if (!sp) continue;
      sp.classList.add("maz-parpadeo");
      sp.style.position = "absolute";
      sp.style.left = d.x + "px";
      sp.style.top = d.y + "px";
      sp.style.zIndex = "3";
      sp.style.animationDelay = ((fnv(sala.fase + d.nombre) % 10) / 10) + "s";
      sec.appendChild(sp);
    }
  }

  function particulas(sec, sala, nivel, n) {
    var rnd = mulberry(fnv(sala.fase + "|p|" + nivel.id));
    for (var i = 0; i < n; i++) {
      var p = spriteEl(nivel.id + "/particula", 1);
      if (!p) return;
      p.classList.add("maz-mota");
      p.style.position = "absolute";
      p.style.left = Math.round(14 + rnd() * Math.max(8, sala.w - 28)) + "px";
      p.style.top = Math.round(28 + rnd() * Math.max(8, sala.h * 0.55)) + "px";
      p.style.zIndex = "3";
      p.style.animationDelay = (rnd() * 2).toFixed(2) + "s";
      sec.appendChild(p);
    }
  }

  function crearSala(sala, nivel, puertas) {
    var sec = document.createElement("section");
    sec.className = "maz-sala";
    sec.setAttribute("data-fase", sala.fase);
    sec.style.left = sala.x + "px";
    sec.style.top = sala.y + "px";
    sec.style.width = sala.w + "px";
    sec.style.height = sala.h + "px";
    sec.style.zIndex = String(Math.round(sala.y) + 1);
    var titulo = document.createElement("h3");
    titulo.id = "maz-" + sala.fase;
    titulo.textContent = sala.nombre;
    titulo.title = sala.nombre;
    sec.setAttribute("aria-labelledby", titulo.id);
    var decos = hayDibujo() ? planDeco(sala, nivel.id) : [];
    sec.appendChild(dibujarFondo(sala, nivel, puertas, decos));
    sec.appendChild(titulo);
    var luz = luzEl(sala, nivel);
    if (luz) sec.appendChild(luz);
    decoViva(sec, sala, nivel, decos);
    if (nivel.id === "forja" || nivel.id === "faro") particulas(sec, sala, nivel, 2);
    if (nivel.id === "faro" && sala.fase === CFG.FASE_ENERGIA) {
      var haz = spriteEl("faro/luz/haz", 1);
      if (haz) {
        haz.classList.add("maz-vaiven");
        haz.style.position = "absolute";
        haz.style.left = ((sala.w - 48) / 2) + "px";
        haz.style.top = "0";
        haz.style.zIndex = "2";
        sec.appendChild(haz);
      }
    }
    if (sala.fase === CFG.FASE_ENERGIA) {
      var sl = sala.pts.slice();
      var fuente = elegirFuente(sala, sl);
      sl = sl.filter(function (p) { return p !== fuente; });
      sec.appendChild(fuenteEl(sala, fuente, sala.apps));
      var asg = asignar(sala.apps, sl, 6);
      sala.apps.forEach(function (app) {
        if (asg.mapa[app.id]) sec.appendChild(fragmentoEl(sala, app, asg.mapa[app.id][0], asg.mapa[app.id][1], nivel));
      });
      if (asg.pila) sec.appendChild(pilaEl(sala, sala.apps, asg.resto.length, asg.pila[0], asg.pila[1], nivel, true));
    } else if (sala.fase === CFG.FASE_RECICLAJE) {
      var orden = ordenar(sala.apps);
      var vis = orden.slice(0, Math.min(6, orden.length));
      var resto = orden.slice(vis.length);
      var cajas = asignar(vis, sala.pts, vis.length);
      vis.forEach(function (app) {
        if (cajas.mapa[app.id]) sec.appendChild(cajaEl(sala, app, cajas.mapa[app.id][0], cajas.mapa[app.id][1], nivel));
      });
      sec.appendChild(binEl(sala, resto, nivel));
    } else {
      var normal = asignar(sala.apps, sala.pts, nivel.cupo);
      sala.apps.forEach(function (app) {
        if (normal.mapa[app.id]) sec.appendChild(objetoEl(sala, app, normal.mapa[app.id][0], normal.mapa[app.id][1], nivel));
      });
      if (normal.pila) sec.appendChild(pilaEl(sala, sala.apps, normal.resto.length, normal.pila[0], normal.pila[1], nivel, false));
    }
    sec.appendChild(bestiaEl(sala, nivel));
    return sec;
  }

  function escalaDe(ancho, altoLibre, altoMundo) {
    var ew = ancho > 0 ? ancho / 375 : 1;
    var eh = altoMundo > 0 && altoLibre > 8 ? altoLibre / altoMundo : 1;
    var e = Math.min(ew, eh);
    if (!(e > 0)) e = 1;
    return e;
  }

  function dibujar(salas, nivel, ancho) {
    salasEl.replaceChildren();
    if (!salas.length) {
      escalaEl.style.height = "auto";
      salasEl.style.transform = "none";
      salasEl.style.height = "auto";
      salasEl.style.width = "100%";
      var vacio = document.createElement("p");
      vacio.className = "maz-vacio";
      vacio.textContent = CFG.TEXTOS.VACIO;
      salasEl.appendChild(vacio);
      return;
    }
    var plan = preparar(salas, nivel);
    var altoLibre = lienzoEl ? lienzoEl.clientHeight : 0;
    var e = escalaDe(ancho, altoLibre, plan.alto);
    salasEl.style.width = "375px";
    salasEl.style.height = plan.alto + "px";
    salasEl.style.transform = "scale(" + e + ")";
    salasEl.style.transformOrigin = "top center";
    escalaEl.style.height = Math.floor(plan.alto * e) + "px";
    for (var i = 0; i < plan.corr.segmentos.length; i++) {
      var pas = pasilloEl(plan.corr.segmentos[i], nivel);
      if (pas) salasEl.appendChild(pas);
    }
    for (i = 0; i < plan.salas.length; i++) salasEl.appendChild(crearSala(plan.salas[i], nivel, plan.corr.puertas));
  }

  function aplicarNivel(nivel) {
    var html = document.documentElement;
    html.setAttribute("data-nivel", nivel.id);
    html.style.setProperty("--maz-fondo", nivel.fondo);
    html.style.setProperty("--maz-fuego", nivel.fuego);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", nivel.fondo);
  }

  function limpiarNivel() {
    var html = document.documentElement;
    html.removeAttribute("data-nivel");
    html.style.removeProperty("--maz-fondo");
    html.style.removeProperty("--maz-fuego");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && temaOriginal) meta.setAttribute("content", temaOriginal);
  }

  var temaOriginal = "";

  function firmaDe(salas, nivel, ancho) {
    var partes = [String(ancho), nivel.id, atlasEstado];
    for (var i = 0; i < salas.length; i++) {
      var ids = [];
      for (var j = 0; j < salas[i].apps.length; j++) {
        var app = salas[i].apps[j];
        var ap = [];
        for (var k = 0; k < (app.aportes || []).length; k++) ap.push(app.aportes[k].id + ":" + app.aportes[k].fuente + ":" + app.aportes[k].aporte);
        ids.push([app.id, app.href, app.nombre, app.estado, app.completadas, app.bloqueada ? "b" : "", ap.join("+"), app.emoji, app.boton, app.descripcion].join("@"));
      }
      partes.push(salas[i].fase + ":" + ids.join(","));
    }
    return partes.join("|");
  }

  function pintar(forzar) {
    if (!raiz) return;
    var salas = leerSalas();
    var nivel = nivelDe(finalizados(salas));
    aplicarNivel(nivel);
    if (placaTexto) placaTexto.textContent = CFG.TEXTOS.MAZMORRA + " · " + nivel.nombre;
    if (atlasEstado === "cargando") return;
    var ancho = (lienzoEl && lienzoEl.clientWidth) || window.innerWidth;
    var firma = firmaDe(salas, nivel, ancho);
    if (!forzar && firma === firmaActual) return;
    firmaActual = firma;
    if (dialogoPila && dialogoPila.hasAttribute("open")) cerrarDialogo(dialogoPila);
    dibujar(salas, nivel, ancho);
  }

  function programar() {
    if (!encendida) return;
    if (pedido) return;
    pedido = requestAnimationFrame(function () {
      pedido = 0;
      if (encendida) pintar(false);
    });
  }

  function alResize() {
    if (!encendida) return;
    clearTimeout(relojResize);
    relojResize = setTimeout(function () { if (encendida) pintar(false); }, 150);
  }

  function asset(nombre) {
    return "img/mazmorra/" + nombre + "?v=" + CFG.VERSION;
  }

  function cargarImagen(src) {
    return new Promise(function (ok, mal) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { mal(); };
      img.src = src;
    });
  }

  function cargarAtlas() {
    var json = fetch(asset("mazmorra-atlas.json")).then(function (r) {
      if (!r.ok) throw new Error("atlas");
      return r.json();
    });
    var img = cargarImagen(asset("mazmorra-atlas.webp")).catch(function () {
      return cargarImagen(asset("mazmorra-atlas.png"));
    });
    Promise.all([json, img]).then(function (res) {
      atlas = res[0];
      atlasImg = res[1];
      atlasCss = "url(\"" + atlasImg.src + "\")";
      atlasEstado = "listo";
      if (encendida) pintar(true);
    }).catch(function () {
      atlas = null;
      atlasImg = null;
      atlasEstado = "fallo";
      if (encendida) pintar(true);
    });
  }

  function cerrarFicha() {
    var b = document.querySelector(".card.abierta .cerrar");
    if (b) b.click();
  }

  function sincronizarPausa() {
    var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var quieto = encendida && (document.hidden || !enVista || reduce);
    document.documentElement.classList.toggle("maz-pausa", quieto);
  }

  function encender() {
    encendida = true;
    document.documentElement.classList.add("mazmorra");
    cerrarFicha();
    if (fases) fases.hidden = true;
    asegurarRaiz();
    sincronizarPausa();
    pintar(true);
  }

  function apagar() {
    var estaba = encendida || document.documentElement.classList.contains("mazmorra");
    encendida = false;
    document.documentElement.classList.remove("mazmorra", "maz-pausa");
    limpiarNivel();
    clearTimeout(relojResize);
    if (observador) {
      observador.disconnect();
      observador = null;
    }
    if (raiz) {
      raiz.remove();
      raiz = null;
      lienzoEl = null;
      escalaEl = null;
      salasEl = null;
    }
    firmaActual = "";
    if (fases) fases.hidden = false;
    if (dialogoPila && dialogoPila.hasAttribute("open")) cerrarDialogo(dialogoPila);
    if (estaba) window.dispatchEvent(new Event("resize"));
  }

  function aplicar(on) {
    if (on) encender();
    else apagar();
  }

  function leerOn() {
    try { return localStorage.getItem(CFG.CLAVE_MAZMORRA) === CFG.VALOR_ON; } catch (e) { return false; }
  }

  function guardarOn(on) {
    try { localStorage.setItem(CFG.CLAVE_MAZMORRA, on ? CFG.VALOR_ON : CFG.VALOR_OFF); } catch (e) {}
  }

  function ajustarHoja(d) {
    var tope = window.innerHeight - 16;
    d.style.height = "auto";
    if (d.scrollHeight > tope) d.style.height = tope + "px";
  }

  function abrirDialogo(d) {
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  }

  function cerrarDialogo(d) {
    if (typeof d.close === "function" && d.hasAttribute("open")) d.close();
    else d.removeAttribute("open");
  }

  function filaPila(app) {
    var li = document.createElement("li");
    var nodo = app.href ? document.createElement("a") : document.createElement("span");
    if (!app.href) nodo.className = "maz-fila";
    if (app.href) nodo.href = app.href;
    var ic = spriteEl(aspecto(app).icono, 2);
    if (ic) nodo.appendChild(ic);
    var tx = document.createElement("span");
    tx.textContent = app.nombre;
    nodo.appendChild(tx);
    if (app.bloqueada) {
      var marca = document.createElement("span");
      marca.className = "maz-marca";
      marca.textContent = CFG.TEXTOS.BLOQUEADA;
      nodo.appendChild(marca);
    }
    li.appendChild(nodo);
    return li;
  }

  function abrirPila(nombre, apps, disparador) {
    tituloPila.textContent = nombre;
    listaPila.replaceChildren();
    for (var i = 0; i < apps.length; i++) listaPila.appendChild(filaPila(apps[i]));
    dialogoPila._volver = disparador;
    abrirDialogo(dialogoPila);
  }

  function dialogobase(id) {
    var d = document.createElement("dialog");
    d.className = "hoja maz-dialog";
    d.setAttribute("aria-labelledby", id);
    d.addEventListener("click", function (e) { if (e.target === d) cerrarDialogo(d); });
    return d;
  }

  function botonCerrar(d) {
    var acciones = document.createElement("div");
    acciones.className = "hoja-acciones";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "sec";
    b.textContent = CFG.TEXTOS.CERRAR;
    b.addEventListener("click", function () { cerrarDialogo(d); });
    acciones.appendChild(b);
    return acciones;
  }

  function nombreStat(id) {
    for (var i = 0; i < CFG.STATS.length; i++) {
      if (CFG.STATS[i].id === id) return CFG.STATS[i].nombre;
    }
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  function nivelBase(id) {
    for (var i = 0; i < CFG.STATS.length; i++) {
      if (CFG.STATS[i].id !== id) continue;
      return entero(CFG.STATS[i].nivel, 0, CFG.NIVEL_MAX) ? CFG.STATS[i].nivel : 0;
    }
    return 0;
  }

  function tieneNivel(id) {
    for (var i = 0; i < CFG.STATS.length; i++) {
      if (CFG.STATS[i].id === id && entero(CFG.STATS[i].nivel, 0, CFG.NIVEL_MAX)) return true;
    }
    return false;
  }

  function statsVisibles(salas) {
    var reportados = {};
    var i, j, k, app, lista;
    for (i = 0; i < salas.length; i++) {
      for (j = 0; j < salas[i].apps.length; j++) {
        lista = salas[i].apps[j].aportes || [];
        for (k = 0; k < lista.length; k++) reportados[lista[k].id] = true;
      }
    }
    var conocidos = {};
    var out = [];
    for (i = 0; i < CFG.STATS.length; i++) {
      var id = CFG.STATS[i].id;
      conocidos[id] = true;
      if (!tieneNivel(id) && !reportados[id]) continue;
      out.push({ id: id, nombre: CFG.STATS[i].nombre, nivel: nivelBase(id) });
    }
    var extra = Object.keys(reportados).filter(function (id) { return !conocidos[id]; }).sort();
    for (i = 0; i < extra.length; i++) out.push({ id: extra[i], nombre: nombreStat(extra[i]), nivel: 0 });
    return out;
  }

  function aportesVisibles(statId) {
    var salas = leerSalas();
    var out = [];
    var visto = {};
    var i, j, k, app;
    for (i = 0; i < salas.length; i++) {
      for (j = 0; j < salas[i].apps.length; j++) {
        app = salas[i].apps[j];
        var clave = app.slug || app.id;
        if (visto[clave]) continue;
        var lista = app.aportes || [];
        var creacion = 0;
        var uso = 0;
        var suelto = 0;
        var toca = false;
        for (k = 0; k < lista.length; k++) {
          if (lista[k].id !== statId) continue;
          toca = true;
          if (lista[k].fuente === "creacion") creacion += lista[k].aporte;
          else if (lista[k].fuente === "uso") uso += lista[k].aporte;
          else suelto += lista[k].aporte;
        }
        if (!toca) continue;
        visto[clave] = true;
        out.push({ nombre: app.nombre, creacion: creacion, uso: uso, suelto: suelto });
      }
    }
    return out;
  }

  function textoFaltan(n) {
    if (n === 1) return CFG.TEXTOS.FALTA_UNO;
    return CFG.TEXTOS.FALTAN.replace("{n}", String(n));
  }

  function abrirNiveles(disparador) {
    var n = finalizados(leerSalas());
    var actual = nivelDe(n);
    var siguiente = null;
    var i;
    for (i = 0; i < CFG.NIVELES.length; i++) {
      if (CFG.NIVELES[i].min > n) { siguiente = CFG.NIVELES[i]; break; }
    }
    tituloNiveles.textContent = CFG.TEXTOS.NIVELES;
    listaNiveles.replaceChildren();
    for (i = 0; i < CFG.NIVELES.length; i++) {
      var nv = CFG.NIVELES[i];
      var li = document.createElement("li");
      li.className = "maz-nivel";
      if (nv.id === actual.id) li.classList.add("maz-nivel-actual");
      else if (nv.min > n && !(siguiente && nv.id === siguiente.id)) li.classList.add("maz-nivel-cerrado");
      var nombre = document.createElement("span");
      nombre.className = "maz-nivel-nombre";
      nombre.textContent = nv.nombre;
      var cond = document.createElement("span");
      cond.className = "maz-nivel-cond";
      cond.textContent = nv.min + " " + CFG.TEXTOS.LANZAMIENTOS + " · " + nv.cupo + " " + CFG.TEXTOS.POR_SALA;
      li.appendChild(nombre);
      if (nv.id === actual.id) {
        var marca = document.createElement("span");
        marca.className = "maz-marca";
        marca.textContent = CFG.TEXTOS.ACTUAL;
        li.appendChild(marca);
      } else if (siguiente && nv.id === siguiente.id) {
        var falta = document.createElement("span");
        falta.className = "maz-nivel-falta";
        falta.textContent = textoFaltan(nv.min - n);
        li.appendChild(falta);
      }
      li.appendChild(cond);
      listaNiveles.appendChild(li);
    }
    dialogoNiveles._volver = disparador;
    abrirDialogo(dialogoNiveles);
    ajustarHoja(dialogoNiveles);
  }

  function mostrarAportes(st) {
    detalleTrono.replaceChildren();
    var h = document.createElement("p");
    h.className = "ajuste-ayuda";
    h.textContent = st.nombre;
    detalleTrono.appendChild(h);
    var ul = document.createElement("ul");
    ul.className = "maz-lista";
    var items = aportesVisibles(st.id);
    if (!items.length) {
      var vacio = document.createElement("li");
      vacio.className = "maz-fila";
      vacio.textContent = CFG.TEXTOS.SIN_APORTE;
      ul.appendChild(vacio);
    }
    for (var i = 0; i < items.length; i++) {
      var li = document.createElement("li");
      li.className = "maz-fila";
      var nom = document.createElement("span");
      nom.textContent = items[i].nombre;
      var n = document.createElement("span");
      n.className = "maz-marca";
      var partes = [];
      if (items[i].creacion) partes.push(CFG.TEXTOS.CREACION + " " + items[i].creacion);
      if (items[i].uso) partes.push(CFG.TEXTOS.USO + " " + items[i].uso);
      if (items[i].suelto) partes.push(String(items[i].suelto));
      n.textContent = partes.join(" · ");
      li.appendChild(nom);
      li.appendChild(n);
      ul.appendChild(li);
    }
    detalleTrono.appendChild(ul);
    if (dialogoTrono && dialogoTrono.hasAttribute("open")) ajustarHoja(dialogoTrono);
  }

  function abrirTrono(disparador) {
    var cajaStats = dialogoTrono.querySelector(".maz-stats");
    cajaStats.replaceChildren();
    detalleTrono.replaceChildren();
    var visibles = statsVisibles(leerSalas());
    for (var i = 0; i < visibles.length; i++) {
      (function (st) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "maz-stat";
        var nom = document.createElement("span");
        nom.textContent = st.nombre;
        var n = document.createElement("span");
        n.textContent = st.nivel + "/" + CFG.NIVEL_MAX;
        b.appendChild(nom);
        b.appendChild(n);
        b.addEventListener("click", function () { mostrarAportes(st); });
        cajaStats.appendChild(b);
      })(visibles[i]);
    }
    dialogoTrono._volver = disparador;
    abrirDialogo(dialogoTrono);
    ajustarHoja(dialogoTrono);
  }

  function crearDialogos() {
    dialogoAjustes = dialogobase("maz-ajustes-titulo");
    var h = document.createElement("h2");
    h.id = "maz-ajustes-titulo";
    h.textContent = CFG.TEXTOS.AJUSTES;
    var fila = document.createElement("label");
    fila.className = "ajuste-fila";
    caja = document.createElement("input");
    caja.type = "checkbox";
    var nombre = document.createElement("span");
    nombre.textContent = CFG.TEXTOS.MAZMORRA;
    fila.appendChild(caja);
    fila.appendChild(nombre);
    var ayuda = document.createElement("p");
    ayuda.className = "ajuste-ayuda";
    ayuda.textContent = CFG.TEXTOS.MAZMORRA_AYUDA;
    var version = document.createElement("p");
    version.className = "ajuste-version";
    version.textContent = CFG.TEXTOS.VERSION + " " + CFG.VERSION;
    dialogoAjustes.appendChild(h);
    dialogoAjustes.appendChild(fila);
    dialogoAjustes.appendChild(ayuda);
    dialogoAjustes.appendChild(version);
    dialogoAjustes.appendChild(botonCerrar(dialogoAjustes));
    caja.addEventListener("change", function () {
      guardarOn(caja.checked);
      aplicar(caja.checked);
    });
    dialogoPila = dialogobase("maz-pila-titulo");
    tituloPila = document.createElement("h2");
    tituloPila.id = "maz-pila-titulo";
    listaPila = document.createElement("ul");
    listaPila.className = "maz-lista";
    dialogoPila.appendChild(tituloPila);
    dialogoPila.appendChild(listaPila);
    dialogoPila.appendChild(botonCerrar(dialogoPila));
    dialogoPila.addEventListener("close", function () {
      if (dialogoPila._volver && dialogoPila._volver.focus) dialogoPila._volver.focus();
    });
    dialogoTrono = dialogobase("maz-trono-titulo");
    dialogoTrono.classList.add("maz-hoja-fit");
    var ht = document.createElement("h2");
    ht.id = "maz-trono-titulo";
    ht.textContent = CFG.TEXTOS.TRONO;
    var stats = document.createElement("div");
    stats.className = "maz-stats";
    detalleTrono = document.createElement("div");
    detalleTrono.className = "maz-detalle";
    dialogoTrono.appendChild(ht);
    dialogoTrono.appendChild(stats);
    dialogoTrono.appendChild(detalleTrono);
    dialogoTrono.appendChild(botonCerrar(dialogoTrono));
    dialogoTrono.addEventListener("close", function () {
      if (dialogoTrono._volver && dialogoTrono._volver.focus) dialogoTrono._volver.focus();
    });
    dialogoNiveles = dialogobase("maz-niveles-titulo");
    tituloNiveles = document.createElement("h2");
    tituloNiveles.id = "maz-niveles-titulo";
    tituloNiveles.textContent = CFG.TEXTOS.NIVELES;
    listaNiveles = document.createElement("ul");
    listaNiveles.className = "maz-niveles";
    dialogoNiveles.appendChild(tituloNiveles);
    dialogoNiveles.appendChild(listaNiveles);
    dialogoNiveles.appendChild(botonCerrar(dialogoNiveles));
    dialogoNiveles.addEventListener("close", function () {
      if (dialogoNiveles._volver && dialogoNiveles._volver.focus) dialogoNiveles._volver.focus();
    });
    document.body.appendChild(dialogoAjustes);
    document.body.appendChild(dialogoPila);
    document.body.appendChild(dialogoTrono);
    document.body.appendChild(dialogoNiveles);
  }

  function montarBoton() {
    var acciones = document.querySelector(".hero-acciones");
    if (!acciones) return;
    var boton = document.createElement("button");
    boton.type = "button";
    boton.className = "agregar ajustes";
    boton.textContent = CFG.TEXTOS.AJUSTES;
    boton.setAttribute("aria-haspopup", "dialog");
    boton.addEventListener("click", function () {
      caja.checked = leerOn();
      abrirDialogo(dialogoAjustes);
      caja.focus();
    });
    acciones.appendChild(boton);
  }

  function asegurarRaiz() {
    if (raiz && raiz.isConnected) return;
    raiz = document.createElement("div");
    raiz.className = "mazmorra";
    placa = document.createElement("p");
    placa.className = "maz-placa";
    var trono = document.createElement("button");
    trono.type = "button";
    trono.className = "maz-trono";
    trono.setAttribute("aria-label", CFG.TEXTOS.TRONO);
    var sprite = document.createElement("span");
    sprite.className = "maz-trono-sprite";
    sprite.setAttribute("aria-hidden", "true");
    sprite.style.backgroundImage = "url(\"img/mazmorra/trono.png?v=" + CFG.VERSION + "\")";
    trono.appendChild(sprite);
    trono.addEventListener("click", function () { abrirTrono(trono); });
    placaTexto = document.createElement("button");
    placaTexto.type = "button";
    placaTexto.className = "maz-placa-texto";
    placaTexto.addEventListener("click", function () { abrirNiveles(placaTexto); });
    placa.appendChild(trono);
    placa.appendChild(placaTexto);
    lienzoEl = document.createElement("div");
    lienzoEl.className = "maz-lienzo";
    escalaEl = document.createElement("div");
    escalaEl.className = "maz-escala";
    salasEl = document.createElement("div");
    salasEl.className = "maz-mundo";
    escalaEl.appendChild(salasEl);
    lienzoEl.appendChild(escalaEl);
    raiz.appendChild(placa);
    raiz.appendChild(lienzoEl);
    document.querySelector("main").appendChild(raiz);
    if (window.ResizeObserver) {
      observador = new ResizeObserver(alResize);
      observador.observe(lienzoEl);
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (ents) {
        enVista = false;
        for (var i = 0; i < ents.length; i++) if (ents[i].isIntersecting) enVista = true;
        sincronizarPausa();
      }).observe(lienzoEl);
    }
  }

  function observar() {
    if (fases && window.MutationObserver) {
      new MutationObserver(function () { programar(); }).observe(fases, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["data-proyecto", "data-id"]
      });
    }
    document.addEventListener("portafolio:render", programar);
    window.addEventListener("resize", alResize);
    document.addEventListener("visibilitychange", sincronizarPausa);
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.addEventListener) mq.addEventListener("change", sincronizarPausa);
    }
    window.addEventListener("storage", function (e) {
      if (e.key && e.key.indexOf(CFG.CLAVE_META) === 0) programar();
      if (e.key !== CFG.CLAVE_MAZMORRA && e.key !== null) return;
      var on = leerOn();
      if (caja) caja.checked = on;
      if (on !== encendida) aplicar(on);
    });
  }

  function iniciar() {
    fases = document.querySelector("main .fases");
    var meta = document.querySelector('meta[name="theme-color"]');
    temaOriginal = meta ? (meta.getAttribute("content") || "") : "";
    crearDialogos();
    montarBoton();
    observar();
    cargarAtlas();
    if (leerOn()) encender();
  }

  iniciar();
})();
