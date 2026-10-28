(function () {
  "use strict";

  var vista = "";
  var velo = null;

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
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.setAttribute("aria-expanded", "false");
    asegurarCerrar(card);
  }

  function limpiar(card) {
    card.removeAttribute("role");
    card.removeAttribute("tabindex");
    card.removeAttribute("aria-expanded");
    card.removeAttribute("aria-modal");
    card.removeAttribute("aria-labelledby");
    card.classList.remove("abierta");
    var cerrar = card.querySelector(":scope > .cerrar");
    if (cerrar) cerrar.remove();
    if (card._hueco && card._hueco.parentNode) card._hueco.remove();
    card._hueco = null;
  }

  function sincronizar() {
    var widget = vista === "widget";
    var cards = document.querySelectorAll("li.card");
    for (var i = 0; i < cards.length; i++) {
      if (widget) preparar(cards[i]);
      else limpiar(cards[i]);
    }
    if (!widget || !document.querySelector(".card.abierta")) {
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
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.setAttribute("aria-expanded", "false");
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
    card.focus();
  }

  function abrir(card) {
    if (!card || card.classList.contains("abierta")) return;
    cerrarAbierta();
    var hueco = document.createElement("li");
    hueco.className = "hueco";
    hueco.setAttribute("aria-hidden", "true");
    card.after(hueco);
    card._hueco = hueco;
    document.body.appendChild(card);
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

  function alClick(e) {
    if (vista !== "widget") return;
    if (e.target.closest(".dejar, .aviso, .hoja, .agregar, .restaurar, .velo, .cerrar")) return;
    var card = e.target.closest(".card");
    if (!card || card.classList.contains("abierta")) return;
    e.preventDefault();
    abrir(card);
  }

  function alTecla(e) {
    if (vista !== "widget") return;
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
    if (vista === "widget") cerrarAbierta();
    vista = id;
    document.documentElement.setAttribute("data-vista", id);
    sincronizar();
  }

  function iniciar() {
    velo = document.createElement("button");
    velo.type = "button";
    velo.className = "velo";
    velo.hidden = true;
    velo.setAttribute("aria-label", "Cerrar");
    velo.addEventListener("click", cerrarAbierta);
    document.body.appendChild(velo);
    document.addEventListener("click", alClick);
    document.addEventListener("keydown", alTecla);
    document.addEventListener("portafolio:render", function () {
      var sueltas = document.querySelectorAll("body > .card");
      for (var i = 0; i < sueltas.length; i++) sueltas[i].remove();
      if (velo) velo.hidden = true;
      liberarFondo();
      sincronizar();
    });
    aplicar(vistaDe());
    var n = limites();
    for (var i = 0; i < n.length; i++) {
      window.matchMedia("(max-width: " + n[i] + "px)").addEventListener("change", function () {
        aplicar(vistaDe());
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
