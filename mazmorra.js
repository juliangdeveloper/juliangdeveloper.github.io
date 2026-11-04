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
  var fases = null;
  var raiz = null;
  var placa = null;
  var salasEl = null;
  var encendida = false;
  var enVista = true;
  var firmaActual = "";
  var pedido = 0;
  var ambiente = null;
  var metaTema = null;
  var temaOriginal = "";
  var caja = null;
  var dialogoAjustes = null;
  var dialogoPila = null;
  var tituloPila = null;
  var listaPila = null;

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
      "....bbbb..bbbb..",
      "...bbbbbbbbbbbb.",
      "....bbb....bbb..",
      "......BppppB....",
      "......ppccep....",
      "......pppppp....",
      ".......BBBB.....",
      ".......BppB.....",
      "......YYYYYY....",
      ".......YYYY.....",
      "........YY......"
    ],
    mano: [
      "................",
      ".....pppppp.....",
      "....ppcccppp....",
      "...pppccepppp...",
      "..ppppppppppp...",
      "..pppppppppppp..",
      "...pppp..pppp...",
      "....pp....pp....",
      "....pp....pp....",
      "....nn....nn...."
    ],
    heraldo: [
      "......wwww......",
      ".....wkkkkw.....",
      ".....wkrrkw.....",
      "......wwww......",
      "......rrrr......",
      ".....rYYYYr.....",
      ".....rrrrrr.....",
      "......rrrr......",
      "......YYYY......",
      "......Y..Y......",
      "......Y..Y......",
      ".....YY..YY....."
    ],
    murcielago: [
      ".....kkkkkk.....",
      "......mmmm......",
      "....mmmmmmmm....",
      "...mmmmmmmmmm...",
      "..mmmmmmmmmmmm..",
      "...mmmrmmmrmm...",
      "....mmmmmmmm....",
      ".....mmmmmm.....",
      "......mmmm......",
      ".......yy.......",
      "......yyyy......",
      ".......YY......."
    ],
    topo: [
      "......YYYY......",
      ".....YyyyyY.....",
      ".....YnppnY.....",
      "......pppp......",
      "......pccep.....",
      ".....nnnnnn.....",
      "....nnnnnnnn....",
      "...kkkkkkkkkk...",
      "..kkkkkkkkkkkk..",
      "...kkk....kkk..."
    ],
    mimico: [
      "......aaaa......",
      "....aYYYYYYa....",
      "...aYccYYccYa...",
      "...aYYYYYYYYa...",
      "...aawwawwawa...",
      "...aaaaaaaaaa...",
      "....aYYYYYYa....",
      ".....aaaaaa.....",
      "......a..a......"
    ],
    dragon: [
      "........UUU.....",
      ".......UcccU....",
      "......UuuuuUU...",
      ".....UuuuuuuU...",
      "....uUUUuuuu....",
      "...uUUUUu.......",
      "..uUUUU.........",
      "...UUU..........",
      "....UU....UU....",
      ".....U....U.....",
      ".....oo..oo....."
    ],
    trasgo: [
      "....G......G....",
      "...GG......GG...",
      "...GggggggggG...",
      "..GgcgggggcggG..",
      "..GggggggggggG..",
      "...GggGrrGggG...",
      "....GggggggG....",
      "...gggggggggg...",
      "...GGGGGGGGGG...",
      "....GG....GG....",
      "....nn....nn...."
    ]
  };

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

  function crearSvg(inner, viewBox, clase, extra) {
    var doc = new DOMParser().parseFromString(
      '<svg xmlns="' + SVGNS + '" viewBox="' + viewBox + '"' +
      (clase ? ' class="' + clase + '"' : "") +
      (extra || "") +
      ' aria-hidden="true" focusable="false">' + inner + "</svg>",
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
    var partes = ['<ellipse cx="' + (ancho / 2) + '" cy="' + (alto - 1) + '" rx="' + (ancho / 3.2).toFixed(1) + '" ry="1.1" fill="#000" opacity="0.45"/>'];
    for (var y = 0; y < alto; y++) {
      var fila = filas[y];
      if (fila.length < ancho) fila += "................".slice(0, ancho - fila.length);
      for (var x = 0; x < ancho; x++) {
        var color = COLORES[fila.charAt(x)];
        if (!color) continue;
        partes.push('<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + color + '"/>');
      }
    }
    return crearSvg(partes.join(""), "0 0 " + ancho + " " + alto, "", ' shape-rendering="crispEdges"');
  }

  function indice(id, n) {
    var h = 2166136261;
    var s = String(id);
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return n ? (h >>> 0) % n : 0;
  }

  function temaDe(fase) {
    return CFG.TEMAS[fase] || CFG.DEFECTO;
  }

  function nivelDe(n) {
    var nivel = CFG.NIVELES[0];
    for (var i = 0; i < CFG.NIVELES.length; i++) {
      if (n >= CFG.NIVELES[i].min) nivel = CFG.NIVELES[i];
    }
    return nivel;
  }

  function cubo(ancho) {
    if (ancho <= CFG.ANCHO_MOVIL) return "m";
    if (ancho <= CFG.ANCHO_TABLET) return "t";
    return "a";
  }

  function grilla(n, ancho) {
    var max = ancho <= CFG.ANCHO_MOVIL ? CFG.COLS_MOVIL : ancho <= CFG.ANCHO_TABLET ? CFG.COLS_TABLET : CFG.COLS_ANCHO;
    var cols = Math.max(1, Math.min(n, max));
    var filas = Math.ceil(n / cols);
    var spans = [];
    var resto = n % cols;
    var llenos = resto === 0 ? n : n - resto;
    var i;
    for (i = 0; i < llenos; i++) spans.push(1);
    if (resto) {
      var base = Math.floor(cols / resto);
      var extra = cols % resto;
      for (i = 0; i < resto; i++) spans.push(base + (i < extra ? 1 : 0));
    }
    return { cols: cols, filas: filas, spans: spans };
  }

  function antorchas(sec, i) {
    ["izq", "der"].forEach(function (lado, k) {
      var s = document.createElement("span");
      s.className = "maz-antorcha maz-antorcha-" + lado;
      s.setAttribute("aria-hidden", "true");
      var halo = document.createElement("span");
      halo.className = "maz-halo";
      var llama = document.createElement("span");
      llama.className = "maz-llama";
      llama.style.animationDelay = ((i + k) * CFG.ANTORCHA_PASO).toFixed(2) + "s";
      var tea = document.createElement("span");
      tea.className = "maz-tea";
      s.appendChild(halo);
      s.appendChild(llama);
      s.appendChild(tea);
      sec.appendChild(s);
    });
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
    var btn = card.querySelector(".links a.btn");
    var id = card.getAttribute("data-id") || card.getAttribute("data-app") || nombre;
    return { id: id, nombre: nombre || id, href: btn ? btn.href : "", emoji: emoji };
  }

  function repartirBestias(salas) {
    for (var i = 0; i < salas.length; i++) salas[i].bestias = [];
    if (!salas.length) return;
    for (var b = 0; b < CFG.BESTIAS.length; b++) salas[b % salas.length].bestias.push(CFG.BESTIAS[b]);
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
        fase: sec.getAttribute("data-fase") || "",
        nombre: h2 ? h2.textContent.replace(/\s+/g, " ").trim() : "",
        apps: apps,
        bestias: []
      });
    }
    salas = fusionar(salas);
    repartirBestias(salas);
    return salas;
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
          salida.push({ fase: fusion.fase, nombre: fusion.nombre, apps: apps, bestias: [] });
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

  function rotulo(app) {
    return app.emoji ? app.emoji + " " + app.nombre : app.nombre;
  }

  function itemObjeto(app, tipo) {
    var li = document.createElement("li");
    var nodo;
    if (app.href) {
      nodo = document.createElement("a");
      nodo.href = app.href;
    } else {
      nodo = document.createElement("span");
    }
    nodo.className = "maz-obj";
    nodo.title = app.nombre;
    var sprite = document.createElement("span");
    sprite.className = "maz-sprite";
    sprite.setAttribute("aria-hidden", "true");
    sprite.appendChild(spriteObjeto(tipo));
    var et = document.createElement("span");
    et.className = "maz-etiq";
    et.textContent = app.nombre;
    nodo.appendChild(sprite);
    nodo.appendChild(et);
    li.appendChild(nodo);
    return li;
  }

  function itemPila(sala, tema, sobra) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "maz-pila";
    b.setAttribute("aria-label", CFG.TEXTOS.PILA + " de " + sala.nombre + ", " + sala.apps.length + " " + CFG.TEXTOS.PROYECTOS);
    var sprite = document.createElement("span");
    sprite.className = "maz-sprite";
    sprite.setAttribute("aria-hidden", "true");
    sprite.appendChild(spritePila(tema.objetos[0]));
    var et = document.createElement("span");
    et.className = "maz-etiq";
    et.textContent = "+" + sobra;
    b.appendChild(sprite);
    b.appendChild(et);
    b.addEventListener("click", function () { abrirPila(sala, b); });
    li.appendChild(b);
    return li;
  }

  function ponerBestia(b, i) {
    var s = document.createElement("span");
    s.className = "maz-bestia";
    s.setAttribute("data-bicho", b.id);
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", b.nombre);
    s.style.animationDelay = (i * CFG.BESTIA_PASO).toFixed(2) + "s";
    var filas = ARTE[b.id];
    if (filas) s.appendChild(spritePixel(filas));
    return s;
  }

  function crearSala(sala, span, nivel, indiceSala) {
    var tema = temaDe(sala.fase);
    var sec = document.createElement("section");
    sec.className = "maz-sala";
    if (tema.energia) sec.classList.add("maz-energia");
    if (tema.reciclaje) sec.classList.add("maz-reciclaje");
    if (tema.sinLimite) sec.classList.add("maz-sin-limite");
    sec.style.gridColumn = "span " + span;
    sec.style.setProperty("--sala-tinte", tema.tinte);
    sec.style.setProperty("--sala-op", String(tema.opacidad));
    var titulo = document.createElement("h3");
    titulo.id = "maz-" + sala.fase + "-" + indiceSala;
    titulo.textContent = sala.nombre;
    titulo.style.color = tema.titulo;
    sec.setAttribute("aria-labelledby", titulo.id);
    if (tema.reciclaje) {
      var chatarra = document.createElement("span");
      chatarra.className = "maz-chatarra";
      chatarra.setAttribute("aria-hidden", "true");
      sec.appendChild(chatarra);
    }
    sec.appendChild(titulo);
    antorchas(sec, indiceSala);
    var cosas = document.createElement("ul");
    cosas.className = "maz-cosas";
    var cupo = tema.sinLimite ? sala.apps.length : nivel.cupo;
    var visibles = sala.apps.slice(0, cupo);
    var sobra = sala.apps.length - visibles.length;
    for (var i = 0; i < visibles.length; i++) cosas.appendChild(itemObjeto(visibles[i], tema.objetos[indice(visibles[i].id, tema.objetos.length)]));
    if (sobra > 0) cosas.appendChild(itemPila(sala, tema, sobra));
    sec.appendChild(cosas);
    if (sala.bestias.length) {
      var fauna = document.createElement("div");
      fauna.className = "maz-fauna";
      for (var j = 0; j < sala.bestias.length; j++) fauna.appendChild(ponerBestia(sala.bestias[j], indiceSala + j));
      sec.appendChild(fauna);
    }
    return sec;
  }

  function dibujarSalas(salas, nivel, ancho) {
    salasEl.replaceChildren();
    if (!salas.length) {
      salasEl.style.display = "flex";
      var vacio = document.createElement("p");
      vacio.className = "maz-vacio";
      vacio.textContent = CFG.TEXTOS.VACIO;
      salasEl.appendChild(vacio);
      return;
    }
    salasEl.style.display = "";
    var g = grilla(salas.length, ancho);
    salasEl.style.gridTemplateColumns = "repeat(" + g.cols + ",minmax(0,1fr))";
    salasEl.style.gridTemplateRows = "repeat(" + g.filas + ",minmax(0,1fr))";
    salasEl.style.gap = CFG.GAP + "px";
    for (var i = 0; i < salas.length; i++) salasEl.appendChild(crearSala(salas[i], g.spans[i], nivel, i));
  }

  function aplicarNivel(nivel) {
    var html = document.documentElement;
    html.setAttribute("data-nivel", nivel.id);
    html.style.setProperty("--maz-fondo", nivel.fondo);
    html.style.setProperty("--maz-fuego", nivel.fuego);
    if (metaTema) metaTema.setAttribute("content", nivel.fondo);
  }

  function limpiarNivel() {
    var html = document.documentElement;
    html.removeAttribute("data-nivel");
    html.style.removeProperty("--maz-fondo");
    html.style.removeProperty("--maz-fuego");
    if (metaTema) metaTema.setAttribute("content", temaOriginal);
  }

  function firmaDe(salas, nivel, ancho) {
    var partes = [cubo(ancho), nivel.id];
    for (var i = 0; i < salas.length; i++) {
      var ids = [];
      for (var j = 0; j < salas[i].apps.length; j++) {
        var app = salas[i].apps[j];
        ids.push(app.id + "@" + app.href + "@" + app.nombre);
      }
      partes.push(salas[i].fase + ":" + ids.join(","));
    }
    return partes.join("|");
  }

  function pintar(forzar) {
    if (!raiz) return;
    var salas = leerSalas();
    var nivel = nivelDe(finalizados(salas));
    var ancho = raiz.clientWidth || window.innerWidth;
    var firma = firmaDe(salas, nivel, ancho);
    aplicarNivel(nivel);
    placa.textContent = CFG.TEXTOS.MAZMORRA + " · " + nivel.nombre;
    if (!forzar && firma === firmaActual) {
      medirRayos();
      return;
    }
    firmaActual = firma;
    if (dialogoPila && dialogoPila.hasAttribute("open")) cerrarDialogo(dialogoPila);
    dibujarSalas(salas, nivel, ancho);
    requestAnimationFrame(medirRayos);
  }

  function programar() {
    if (!encendida) return;
    if (pedido) return;
    pedido = requestAnimationFrame(function () {
      pedido = 0;
      if (encendida) pintar(false);
    });
  }

  function relativo(el, base) {
    var r = el.getBoundingClientRect();
    return {
      left: r.left - base.left,
      top: r.top - base.top,
      right: r.right - base.left,
      bottom: r.bottom - base.top,
      width: r.width,
      height: r.height
    };
  }

  function centroRect(r) {
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function punto(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  function salir(desde, hacia, rect) {
    var dx = hacia.x - desde.x;
    var dy = hacia.y - desde.y;
    var t = Infinity;
    if (dx > 0.001) t = Math.min(t, (rect.right - desde.x) / dx);
    else if (dx < -0.001) t = Math.min(t, (rect.left - desde.x) / dx);
    if (dy > 0.001) t = Math.min(t, (rect.bottom - desde.y) / dy);
    else if (dy < -0.001) t = Math.min(t, (rect.top - desde.y) / dy);
    if (!isFinite(t) || t < 0) return 1;
    return t;
  }

  function trazo(a, b, ancho, op, fino) {
    var linea = document.createElementNS(SVGNS, "line");
    linea.setAttribute("x1", a.x.toFixed(1));
    linea.setAttribute("y1", a.y.toFixed(1));
    linea.setAttribute("x2", b.x.toFixed(1));
    linea.setAttribute("y2", b.y.toFixed(1));
    linea.setAttribute("stroke", "var(--maz-fuego)");
    linea.setAttribute("stroke-width", String(ancho));
    linea.setAttribute("stroke-linecap", "round");
    if (!fino) linea.setAttribute("opacity", String(op));
    if (fino) linea.setAttribute("class", "maz-rayo");
    return linea;
  }

  function medirRayos() {
    if (!raiz) return;
    var svg = raiz.querySelector(".maz-rayos");
    var lienzo = raiz.querySelector(".maz-lienzo");
    if (!svg || !lienzo) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var origen = raiz.querySelector(".maz-energia");
    if (!origen) return;
    var base = lienzo.getBoundingClientRect();
    if (base.width < 1 || base.height < 1) return;
    svg.setAttribute("viewBox", "0 0 " + base.width.toFixed(1) + " " + base.height.toFixed(1));
    svg.setAttribute("preserveAspectRatio", "none");
    var oRect = relativo(origen, base);
    var oc = centroRect(oRect);
    var otros = raiz.querySelectorAll(".maz-sala:not(.maz-energia)");
    for (var i = 0; i < otros.length; i++) {
      var dRect = relativo(otros[i], base);
      var dc = centroRect(dRect);
      var t0 = salir(oc, dc, oRect);
      var t1 = salir(dc, oc, dRect);
      var p0 = punto(oc, dc, Math.min(0.98, Math.max(0.02, t0 - CFG.RAYO_STUB)));
      var p1 = punto(dc, oc, Math.min(0.98, Math.max(0.02, t1 - CFG.RAYO_STUB)));
      svg.appendChild(trazo(p0, p1, CFG.RAYO_ANCHO, CFG.RAYO_OPACIDAD, false));
      svg.appendChild(trazo(p0, p1, CFG.RAYO_FINO, 1, true));
      svg.appendChild(nodo(p0));
      svg.appendChild(nodo(p1));
    }
  }

  function nodo(p) {
    var c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("cx", p.x.toFixed(1));
    c.setAttribute("cy", p.y.toFixed(1));
    c.setAttribute("r", String(CFG.RAYO_NODO));
    c.setAttribute("fill", "var(--maz-fuego)");
    c.setAttribute("class", "maz-rayo");
    return c;
  }

  function reduceMov() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function crearNubes(capa, ancho, reduce) {
    capa.replaceChildren();
    var niebla = CFG.NIEBLA;
    var n = ancho <= CFG.ANCHO_MOVIL ? niebla.NUBES_MOVIL : niebla.NUBES;
    var dpr = Math.min(window.devicePixelRatio || 1, ancho <= CFG.ANCHO_MOVIL ? niebla.DPR_MOVIL : niebla.DPR_MAX);
    for (var i = 0; i < n; i++) {
      var nube = {
        x: Math.random(),
        y: Math.random(),
        r: niebla.RADIO_MIN + Math.random() * niebla.RADIO_VAR,
        v: (niebla.VEL_MIN + Math.random() * niebla.VEL_VAR) * (i % 2 ? 1 : -1)
      };
      var radio = nube.r * Math.max(ancho, niebla.ANCHO_MIN);
      var lado = Math.ceil(2 * radio * dpr) + 2;
      var cv = document.createElement("canvas");
      cv.width = lado;
      cv.height = lado;
      var ctx = cv.getContext("2d");
      if (ctx) {
        var g = ctx.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, radio * dpr);
        g.addColorStop(0, niebla.NUBE_CENTRO);
        g.addColorStop(1, niebla.NUBE_BORDE);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, lado, lado);
      }
      var px = lado / dpr;
      cv.style.width = px + "px";
      cv.style.height = px + "px";
      cv.style.position = "absolute";
      cv.style.left = (-px / 2) + "px";
      cv.style.top = (-px / 2) + "px";
      var mov = document.createElement("div");
      mov.className = "maz-nube";
      mov.style.top = (nube.y * 100) + "%";
      if (reduce) {
        mov.style.transform = "translateX(" + (nube.x * 100) + "%)";
      } else {
        var dur = niebla.RECORRIDO / Math.abs(nube.v);
        var q = (nube.x + 0.4) / niebla.RECORRIDO;
        mov.classList.add("maz-nube-viva");
        mov.style.animationDuration = dur.toFixed(0) + "ms";
        mov.style.animationDelay = (-(nube.v > 0 ? q : 1 - q) * dur).toFixed(0) + "ms";
        mov.style.animationDirection = nube.v > 0 ? "normal" : "reverse";
      }
      mov.appendChild(cv);
      capa.appendChild(mov);
    }
  }

  function destruirAmbiente() {
    var viejo = ambiente;
    ambiente = null;
    if (!viejo) return;
    if (viejo.raf) cancelAnimationFrame(viejo.raf);
    if (viejo.io) viejo.io.disconnect();
    if (viejo.ro) viejo.ro.disconnect();
    document.removeEventListener("visibilitychange", viejo.alVer);
    document.documentElement.classList.remove("maz-pausa");
  }

  function iniciarAmbiente() {
    destruirAmbiente();
    var capa = raiz.querySelector(".maz-niebla");
    if (!capa) return;
    capa.replaceChildren();
    var nubes = document.createElement("div");
    nubes.className = "maz-nubes";
    var cv = document.createElement("canvas");
    cv.className = "maz-brasas";
    capa.appendChild(nubes);
    capa.appendChild(cv);
    var ctx = cv.getContext("2d", { alpha: true });
    var niebla = CFG.NIEBLA;
    var dpr = 1;
    var w = 0;
    var h = 0;
    var prev = [];
    var bucket = -1;
    var reduce = reduceMov();
    var brasas = [];
    var ultimo = 0;
    var estado = { raf: 0, io: null, ro: null, alVer: null };
    ambiente = estado;

    function sembrar() {
      var n = (raiz.clientWidth || w) <= CFG.ANCHO_MOVIL ? niebla.BRASAS_MOVIL : niebla.BRASAS;
      brasas = [];
      for (var i = 0; i < n; i++) {
        brasas.push({
          x: Math.random(),
          y: Math.random(),
          s: niebla.BRASA_S_MIN + Math.random() * niebla.BRASA_S_VAR,
          v: niebla.BRASA_V_MIN + Math.random() * niebla.BRASA_V_VAR,
          f: Math.random() * Math.PI * 2
        });
      }
    }

    function redimensionar() {
      var rect = capa.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, (raiz.clientWidth || window.innerWidth) <= CFG.ANCHO_MOVIL ? niebla.DPR_MOVIL : niebla.DPR_MAX);
      cv.width = Math.max(1, Math.floor(w * dpr));
      cv.height = Math.max(1, Math.floor(h * dpr));
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      prev = [];
      var b = Math.round(w / niebla.NUBE_PASO);
      if (b !== bucket) {
        bucket = b;
        crearNubes(nubes, w, reduce);
      }
      if (!brasas.length) sembrar();
    }

    function activo() {
      return encendida && ambiente === estado && !reduce && !document.hidden && enVista;
    }

    function dibujar(t) {
      estado.raf = 0;
      if (ambiente !== estado || !ctx) return;
      if (!w || !h) {
        if (activo()) estado.raf = requestAnimationFrame(dibujar);
        return;
      }
      var dt = ultimo ? Math.min(niebla.DT_MAX, t - ultimo) : niebla.DT_INICIAL;
      ultimo = t;
      var i;
      for (i = 0; i < prev.length; i += 4) ctx.clearRect(prev[i], prev[i + 1], prev[i + 2], prev[i + 3]);
      var sig = [];
      for (i = 0; i < brasas.length; i++) {
        var br = brasas[i];
        if (!reduce) {
          br.y -= br.v * dt;
          br.f += dt * niebla.BRASA_FASE;
          if (br.y < -niebla.BRASA_MARGEN) {
            br.y = 1 + niebla.BRASA_MARGEN;
            br.x = Math.random();
          }
        }
        var alfa = niebla.BRASA_ALFA_MIN + niebla.BRASA_ALFA_VAR * Math.sin(br.f);
        var cx = br.x * w + Math.sin(br.f) * niebla.BRASA_DERIVA;
        var cy = br.y * h;
        var verde = niebla.BRASA_VERDE_MIN + Math.floor(niebla.BRASA_VERDE_VAR * alfa);
        ctx.fillStyle = "rgba(" + niebla.BRASA_ROJO + "," + verde + "," + niebla.BRASA_AZUL + "," + alfa.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(cx, cy, br.s, 0, Math.PI * 2);
        ctx.fill();
        var m = br.s + niebla.BRASA_HOLGURA;
        sig.push(Math.floor(cx - m), Math.floor(cy - m), Math.ceil(2 * m) + 1, Math.ceil(2 * m) + 1);
      }
      prev = sig;
      if (activo()) estado.raf = requestAnimationFrame(dibujar);
    }

    function arrancar() {
      if (estado.raf || ambiente !== estado || !ctx) return;
      if (!activo() && !reduce) return;
      ultimo = 0;
      estado.raf = requestAnimationFrame(dibujar);
    }

    function alVer() {
      if (ambiente !== estado) return;
      var pausa = document.hidden || !enVista || reduce;
      document.documentElement.classList.toggle("maz-pausa", pausa);
      if (activo() || reduce) arrancar();
    }

    estado.alVer = alVer;
    redimensionar();
    if (window.ResizeObserver) {
      estado.ro = new ResizeObserver(function () { redimensionar(); });
      estado.ro.observe(capa);
    }
    if (window.IntersectionObserver) {
      estado.io = new IntersectionObserver(function (entries) {
        enVista = false;
        for (var i = 0; i < entries.length; i++) if (entries[i].isIntersecting) enVista = true;
        alVer();
      });
      estado.io.observe(capa);
    }
    document.addEventListener("visibilitychange", alVer);
    alVer();
  }

  function asegurarRaiz() {
    if (raiz && raiz.isConnected) return;
    raiz = document.createElement("div");
    raiz.className = "mazmorra";
    placa = document.createElement("p");
    placa.className = "maz-placa";
    var lienzo = document.createElement("div");
    lienzo.className = "maz-lienzo";
    salasEl = document.createElement("div");
    salasEl.className = "maz-salas";
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "maz-rayos");
    svg.setAttribute("aria-hidden", "true");
    var niebla = document.createElement("div");
    niebla.className = "maz-niebla";
    niebla.setAttribute("aria-hidden", "true");
    lienzo.appendChild(salasEl);
    lienzo.appendChild(svg);
    lienzo.appendChild(niebla);
    raiz.appendChild(placa);
    raiz.appendChild(lienzo);
    document.querySelector("main").appendChild(raiz);
  }

  function cerrarFicha() {
    var b = document.querySelector(".card.abierta .cerrar");
    if (b) b.click();
  }

  function encender() {
    encendida = true;
    document.documentElement.classList.add("mazmorra");
    cerrarFicha();
    if (fases) fases.hidden = true;
    asegurarRaiz();
    pintar(true);
    iniciarAmbiente();
  }

  function apagar() {
    var estaba = encendida || document.documentElement.classList.contains("mazmorra");
    encendida = false;
    enVista = true;
    document.documentElement.classList.remove("mazmorra", "maz-pausa");
    destruirAmbiente();
    limpiarNivel();
    if (raiz) {
      raiz.remove();
      raiz = null;
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

  function abrirDialogo(d) {
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  }

  function cerrarDialogo(d) {
    if (typeof d.close === "function" && d.hasAttribute("open")) d.close();
    else d.removeAttribute("open");
  }

  function abrirPila(sala, disparador) {
    tituloPila.textContent = sala.nombre;
    listaPila.replaceChildren();
    for (var i = 0; i < sala.apps.length; i++) {
      var app = sala.apps[i];
      var li = document.createElement("li");
      if (app.href) {
        var a = document.createElement("a");
        a.href = app.href;
        a.textContent = rotulo(app);
        li.appendChild(a);
      } else {
        li.textContent = rotulo(app);
      }
      listaPila.appendChild(li);
    }
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
    document.body.appendChild(dialogoAjustes);
    document.body.appendChild(dialogoPila);
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

  function observar() {
    if (fases && window.MutationObserver) {
      new MutationObserver(function () { programar(); }).observe(fases, { subtree: true, childList: true });
    }
    document.addEventListener("portafolio:render", programar);
    window.addEventListener("resize", programar);
    window.addEventListener("storage", function (e) {
      if (e.key !== CFG.CLAVE_MAZMORRA && e.key !== null) return;
      var on = leerOn();
      if (caja) caja.checked = on;
      if (on !== encendida) aplicar(on);
    });
  }

  function iniciar() {
    fases = document.querySelector("main .fases");
    metaTema = document.querySelector('meta[name="theme-color"]');
    temaOriginal = metaTema ? (metaTema.getAttribute("content") || "") : "";
    crearDialogos();
    montarBoton();
    observar();
    if (leerOn()) encender();
  }

  iniciar();
})();
