(function () {
  "use strict";

  var CFG = window.PORTAFOLIO_CONFIG;
  var vista = "";
  var pedido = 0;
  var FORMAS = [
    { id: "nombre", espacio: 8, ancho: 72, alto: 58, razon: 1.6 },
    { id: "icono", espacio: 6, ancho: 28, alto: 28, razon: 1 },
    { id: "punto", espacio: 2, ancho: 0, alto: 0, razon: 1 }
  ];

  function core() {
    return window.PORTAFOLIO;
  }

  function pedirIgualar() {
    if (pedido) return;
    pedido = requestAnimationFrame(function () {
      pedido = 0;
      igualar();
    });
  }

  function casillas(sec) {
    var grid = sec.querySelector(".grid");
    if (!grid) return 0;
    var n = 0;
    for (var i = 0; i < grid.children.length; i++) {
      var ch = grid.children[i];
      if (ch.classList.contains("card") || ch.classList.contains("hueco")) n++;
    }
    return n;
  }

  function llevaTitulo(sec) {
    var h = sec.querySelector(":scope > h2");
    if (!h) return false;
    var s = getComputedStyle(h);
    return s.display !== "none" && s.position !== "absolute";
  }

  function grupos(fases) {
    var out = [];
    var secs = fases.querySelectorAll(":scope > .fase");
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].hidden) continue;
      var n = casillas(secs[i]);
      if (!n) continue;
      var titulo = llevaTitulo(secs[i]) ? secs[i].querySelector(":scope > h2").getBoundingClientRect().height : 0;
      if (!titulo && out.length) out[out.length - 1].n += n;
      else out.push({ n: n, titulo: titulo });
    }
    return out;
  }

  function filasDe(lista, cols, fila) {
    var partes = [];
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].titulo) partes.push("auto");
      for (var r = 0; r < Math.ceil(lista[i].n / cols); r++) partes.push(fila);
    }
    return partes.join(" ");
  }

  function soltar(fases) {
    fases.removeAttribute("data-forma");
    fases.style.removeProperty("gap");
    fases.style.removeProperty("grid-template-columns");
  }

  function encajar(fases, lista) {
    var ancho = fases.clientWidth;
    var alto = fases.clientHeight;
    var titulos = 0;
    var cuantos = 0;
    var mayor = 0;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].titulo) {
        titulos += lista[i].titulo;
        cuantos++;
      }
      mayor = Math.max(mayor, lista[i].n);
    }
    var elegido = null;
    for (var f = 0; f < FORMAS.length && !elegido; f++) {
      var forma = FORMAS[f];
      for (var cols = 1; cols <= mayor; cols++) {
        var filas = 0;
        for (var j = 0; j < lista.length; j++) filas += Math.ceil(lista[j].n / cols);
        var w = (ancho - (cols - 1) * forma.espacio) / cols;
        var h = (alto - titulos - (filas + cuantos - 1) * forma.espacio) / filas;
        if (w <= 0 || h <= 0 || w < forma.ancho || h < forma.alto) continue;
        var valor = Math.min(w, h * forma.razon);
        if (!elegido || valor > elegido.valor) elegido = { forma: forma, cols: cols, valor: valor };
      }
    }
    if (!elegido) elegido = { forma: FORMAS[FORMAS.length - 1], cols: mayor };
    fases.setAttribute("data-forma", elegido.forma.id);
    fases.style.gap = elegido.forma.espacio + "px";
    fases.style.gridTemplateColumns = "repeat(" + elegido.cols + ",minmax(0,1fr))";
    fases.style.gridTemplateRows = filasDe(lista, elegido.cols, "minmax(0,1fr)");
  }

  function igualar() {
    var fases = document.querySelector(".fases");
    if (!fases || fases.hidden) return;
    if (document.documentElement.classList.contains("mazmorra")) return;
    var id = document.documentElement.getAttribute("data-vista");
    var lista = grupos(fases);
    if (!id || !lista.length) {
      soltar(fases);
      fases.style.removeProperty("grid-template-rows");
      return;
    }
    if (id === "widget") {
      encajar(fases, lista);
      return;
    }
    var crudas = getComputedStyle(fases).gridTemplateColumns;
    var pistas = crudas && crudas !== "none" ? crudas.split(" ").filter(Boolean) : [];
    var cols = pistas.length || 1;
    var fila = "minmax(0,1fr)";
    if (id === "compacta") fila = "minmax(64px,1fr)";
    else if (id === "media") fila = "minmax(110px,1fr)";
    else fila = "minmax(140px,1fr)";
    fases.style.gridTemplateRows = filasDe(lista, cols, fila);
  }

  function limites() {
    var partes = (document.documentElement.getAttribute("data-rangos") || "519 899 1199").split(/\s+/);
    var n = [];
    for (var i = 0; i < partes.length; i++) n.push(Number(partes[i]));
    return n;
  }

  function vistaDe() {
    var n = limites();
    if (window.matchMedia("(max-width: " + n[0] + "px)").matches) return "widget";
    if (window.matchMedia("(max-width: " + n[1] + "px)").matches) return "compacta";
    if (window.matchMedia("(max-width: " + n[2] + "px)").matches) return "media";
    return "completa";
  }

  function preparar(card) {
    if (card.classList.contains("abierta")) return;
    card.tabIndex = 0;
    if (vista === "widget") {
      card.setAttribute("role", "button");
      card.setAttribute("aria-expanded", "false");
    } else {
      card.removeAttribute("role");
      card.removeAttribute("aria-expanded");
    }
  }

  function sincronizar() {
    var cards = document.querySelectorAll("li.card");
    for (var i = 0; i < cards.length; i++) preparar(cards[i]);
  }

  function appsDeSeccion(sec) {
    var cards = sec.querySelectorAll(":scope > .grid > li.card");
    var out = [];
    var maz = window.PORTAFOLIO_MAZ;
    for (var i = 0; i < cards.length; i++) {
      if (maz && maz.leerApp) out.push(maz.leerApp(cards[i]));
      else {
        var h3 = cards[i].querySelector("h3");
        var nombre = "";
        if (h3) {
          var clon = h3.cloneNode(true);
          var ocultos = clon.querySelectorAll('[aria-hidden="true"]');
          for (var j = 0; j < ocultos.length; j++) ocultos[j].remove();
          nombre = clon.textContent.replace(/\s+/g, " ").trim();
        }
        out.push({
          id: cards[i].getAttribute("data-id") || cards[i].getAttribute("data-app") || "",
          slug: cards[i].getAttribute("data-app") || "",
          nombre: nombre
        });
      }
    }
    return out;
  }

  function atarPila(sec) {
    var h2 = sec.querySelector(":scope > h2");
    if (!h2) return;
    var b = h2.querySelector(":scope > .fase-pila");
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.className = "fase-pila";
      b.textContent = h2.textContent.replace(/\s+/g, " ").trim();
      h2.textContent = "";
      h2.appendChild(b);
      b.addEventListener("click", function () {
        var c = core();
        if (!c) return;
        c.abrirPila(b.textContent, appsDeSeccion(sec), b);
      });
    }
  }

  function atarPilas() {
    var secs = document.querySelectorAll("main .fases > .fase");
    for (var i = 0; i < secs.length; i++) atarPila(secs[i]);
  }

  function alClick(e) {
    if (e.defaultPrevented || e.button) return;
    if (e.target.closest(".dejar, .aviso, .hoja, .agregar, .restaurar, .velo, .cerrar, .links a, .fase-pila, .panel, .barra-ejecutivo")) return;
    var card = e.target.closest(".card");
    if (!card || card.classList.contains("abierta")) return;
    if (e.target.closest("a[href]") && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
    var sel = window.getSelection ? window.getSelection() : null;
    if (sel && !sel.isCollapsed && card.contains(sel.anchorNode)) return;
    var c = core();
    if (!c) return;
    e.preventDefault();
    c.abrirFicha(card, card);
  }

  function alTecla(e) {
    if (e.target && e.target.closest && e.target.closest("dialog[open], .panel.abierta")) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target && e.target.classList && e.target.classList.contains("card") && !e.target.classList.contains("abierta")) {
      var c = core();
      if (!c) return;
      e.preventDefault();
      c.abrirFicha(e.target, e.target);
    }
  }

  function aplicar(id) {
    if (id === vista) return;
    var c = core();
    if (c && c.abierto()) c.cerrar(true);
    vista = id;
    document.documentElement.setAttribute("data-vista", id);
    sincronizar();
    pedirIgualar();
  }

  function renderEjecutivo() {
    var fases = document.querySelector("main .fases");
    if (fases) fases.hidden = false;
    atarPilas();
    sincronizar();
    pedirIgualar();
  }

  function iniciar() {
    document.addEventListener("click", alClick);
    document.addEventListener("keydown", alTecla);
    document.addEventListener("portafolio:render", function () {
      sincronizar();
      pedirIgualar();
    });
    aplicar(vistaDe());
    var n = limites();
    for (var i = 0; i < n.length; i++) {
      window.matchMedia("(max-width: " + n[i] + "px)").addEventListener("change", function () {
        aplicar(vistaDe());
      });
    }
    var fases = document.querySelector(".fases");
    if (fases && typeof MutationObserver === "function") {
      new MutationObserver(pedirIgualar).observe(fases, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"] });
    }
    if (fases && typeof ResizeObserver === "function") {
      new ResizeObserver(pedirIgualar).observe(fases);
    }
    window.addEventListener("resize", pedirIgualar);
    window.matchMedia("(max-height: 520px)").addEventListener("change", pedirIgualar);
    if (core() && core().registrar && CFG) {
      core().registrar(CFG.MODO_EJECUTIVO, { render: renderEjecutivo });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
