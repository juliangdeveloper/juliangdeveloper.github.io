(function () {
  "use strict";

  var vista = "";
  var velo = null;
  var pedido = 0;
  var abiertaEn = 0;
  var GRACIA_MS = 450;

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

  function igualar() {
    var fases = document.querySelector(".fases");
    if (!fases) return;
    var id = document.documentElement.getAttribute("data-vista");
    if (!id || id === "completa") {
      fases.style.removeProperty("grid-template-rows");
      return;
    }
    var crudas = getComputedStyle(fases).gridTemplateColumns;
    var cols = crudas && crudas !== "none" ? crudas.split(" ").filter(Boolean).length : 1;
    if (!cols) cols = 1;
    var partes = [];
    var secs = fases.querySelectorAll(":scope > .fase");
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].hidden) continue;
      var n = casillas(secs[i]);
      if (!n) continue;
      if (llevaTitulo(secs[i])) partes.push("auto");
      var filas = Math.ceil(n / cols);
      var piso = id === "widget" ? "96px" : id === "compacta" ? "52px" : "128px";
      for (var r = 0; r < filas; r++) partes.push("minmax(" + piso + ",1fr)");
    }
    if (partes.length) fases.style.gridTemplateRows = partes.join(" ");
    else fases.style.removeProperty("grid-template-rows");
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

  function liberarFondo() {
    var nodos = document.querySelectorAll("[data-fondo]");
    for (var i = 0; i < nodos.length; i++) {
      nodos[i].inert = false;
      nodos[i].removeAttribute("data-fondo");
    }
  }

  function frenarFondo() {
    liberarFondo();
    var lista = document.querySelectorAll(".hero, main, footer, .aviso");
    for (var i = 0; i < lista.length; i++) {
      lista[i].inert = true;
      lista[i].setAttribute("data-fondo", "");
    }
  }

  function tituloDe(card) {
    var h3 = card.querySelector("h3");
    if (!h3) return;
    if (!h3.id) {
      var clave = card.getAttribute("data-id") || card.getAttribute("data-app") || "proyecto";
      h3.id = "proy-" + clave.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    card.setAttribute("aria-labelledby", h3.id);
  }

  function asegurarCerrar(card) {
    if (card.querySelector(":scope > .cerrar")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "cerrar";
    b.textContent = "Cerrar";
    b.hidden = true;
    b.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      cerrarAbierta();
    });
    card.insertBefore(b, card.firstChild);
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
    asegurarCerrar(card);
  }

  function sincronizar() {
    var cards = document.querySelectorAll("li.card");
    for (var i = 0; i < cards.length; i++) preparar(cards[i]);
    if (!document.querySelector(".card.abierta")) {
      if (velo) velo.hidden = true;
      liberarFondo();
    }
  }

  function focos(card) {
    var nodos = card.querySelectorAll("a[href], button:not([hidden])");
    var out = [];
    for (var i = 0; i < nodos.length; i++) {
      if (nodos[i].tabIndex !== -1) out.push(nodos[i]);
    }
    return out;
  }

  function cerrarAbierta() {
    var card = document.querySelector(".card.abierta");
    if (!card) return;
    card.classList.remove("abierta");
    card.removeAttribute("role");
    card.removeAttribute("aria-modal");
    card.removeAttribute("aria-labelledby");
    var cerrar = card.querySelector(":scope > .cerrar");
    if (cerrar) cerrar.hidden = true;
    if (card._hueco && card._hueco.parentNode) {
      card._hueco.parentNode.insertBefore(card, card._hueco);
      card._hueco.remove();
    }
    card._hueco = null;
    if (velo) velo.hidden = true;
    liberarFondo();
    preparar(card);
    card.focus();
  }

  function abrir(card) {
    if (!card || card.classList.contains("abierta")) return;
    cerrarAbierta();
    var hueco = document.createElement("li");
    hueco.className = "hueco";
    hueco.setAttribute("aria-hidden", "true");
    if (vista === "completa") hueco.style.minHeight = card.getBoundingClientRect().height + "px";
    card.after(hueco);
    card._hueco = hueco;
    document.body.appendChild(card);
    abiertaEn = Date.now();
    card.classList.add("abierta");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.removeAttribute("aria-expanded");
    card.removeAttribute("tabindex");
    tituloDe(card);
    var cerrar = card.querySelector(":scope > .cerrar");
    if (cerrar) cerrar.hidden = false;
    if (velo) velo.hidden = false;
    frenarFondo();
    if (cerrar) cerrar.focus();
  }

  function alClickPrevio(e) {
    if (!abiertaEn || Date.now() - abiertaEn > GRACIA_MS) return;
    if (!e.target.closest(".card.abierta, .velo")) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function alClick(e) {
    if (e.defaultPrevented || e.button) return;
    if (e.target.closest(".dejar, .aviso, .hoja, .agregar, .restaurar, .velo, .cerrar, .links a")) return;
    var card = e.target.closest(".card");
    if (!card || card.classList.contains("abierta")) return;
    if (e.target.closest("a[href]") && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
    var sel = window.getSelection ? window.getSelection() : null;
    if (sel && !sel.isCollapsed && card.contains(sel.anchorNode)) return;
    e.preventDefault();
    abrir(card);
  }

  function alTecla(e) {
    var abierta = document.querySelector(".card.abierta");
    if (e.key === "Escape") {
      if (!abierta) return;
      e.preventDefault();
      cerrarAbierta();
      return;
    }
    if (e.key === "Tab" && abierta) {
      var f = focos(abierta);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
      return;
    }
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target && e.target.classList && e.target.classList.contains("card") && !e.target.classList.contains("abierta")) {
      e.preventDefault();
      abrir(e.target);
    }
  }

  function aplicar(id) {
    if (id === vista) return;
    cerrarAbierta();
    vista = id;
    document.documentElement.setAttribute("data-vista", id);
    sincronizar();
    pedirIgualar();
  }

  function iniciar() {
    velo = document.createElement("button");
    velo.type = "button";
    velo.className = "velo";
    velo.hidden = true;
    velo.setAttribute("aria-label", "Cerrar");
    velo.addEventListener("click", cerrarAbierta);
    document.body.appendChild(velo);
    document.addEventListener("click", alClickPrevio, true);
    document.addEventListener("click", alClick);
    document.addEventListener("keydown", alTecla);
    document.addEventListener("portafolio:render", function () {
      var sueltas = document.querySelectorAll("body > .card");
      for (var i = 0; i < sueltas.length; i++) sueltas[i].remove();
      if (velo) velo.hidden = true;
      liberarFondo();
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
    window.addEventListener("resize", pedirIgualar);
    window.matchMedia("(max-height: 520px)").addEventListener("change", pedirIgualar);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
