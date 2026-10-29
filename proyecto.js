(function () {
  "use strict";
  var FASES = ["Idea", "Definición", "Diseño", "Construcción", "Validación", "Lanzamiento"];
  var ESTADOS = ["Pendiente", "En curso", "En pausa", "En revisión", "Completada"];
  var TOTAL = 6;
  var MAX_OBJETIVO = 140;
  var SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
  var PREFIX = "meta.v1.";
  var SEMILLAS = {
    "piano-transcribe": {
      v: 1,
      slug: "piano-transcribe",
      proyecto: {
        fase: 6,
        fase_estado: 1,
        fases_completadas: 5,
        objetivo: "Motor open source de captura y escritura musical, mantenido por la comunidad"
      }
    },
    "diff-review": {
      v: 1,
      slug: "diff-review",
      proyecto: {
        fase: 4,
        fase_estado: 1,
        fases_completadas: 3,
        objetivo: "Open source para revisar diffs de commits en el celular y aprobar, rechazar o comentar."
      }
    }
  };

  function entero(n, lo, hi) {
    return typeof n === "number" && isFinite(n) && Math.floor(n) === n && n >= lo && n <= hi;
  }

  function limpiarTexto(s) {
    if (typeof s !== "string") return "";
    var t = s.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, " ").replace(/\s+/g, " ").trim();
    var chars = Array.from(t);
    if (chars.length > MAX_OBJETIVO) t = chars.slice(0, MAX_OBJETIVO - 1).join("").trim() + "…";
    return t;
  }

  function leerProyecto(record, slug) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return null;
    if (record.v !== 1 || record.slug !== slug) return null;
    var p = record.proyecto;
    if (!p || typeof p !== "object" || Array.isArray(p)) return null;
    if (!entero(p.fase, 1, 7) || !entero(p.fase_estado, 0, 4) || !entero(p.fases_completadas, 0, TOTAL)) return null;
    return {
      fase: p.fase,
      estado: p.fase_estado,
      completadas: p.fases_completadas,
      objetivo: limpiarTexto(p.objetivo)
    };
  }

  function leerRegistro(slug) {
    var raw = null;
    try { raw = window.localStorage.getItem(PREFIX + slug); } catch (e) { return null; }
    if (typeof raw !== "string" || raw.length === 0 || raw.length > 200000) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function construir(info) {
    var box = document.createElement("div");
    box.className = "proyecto";
    var descartada = info.fase === 7;
    if (descartada) box.classList.add("descartada");

    var linea = document.createElement("p");
    linea.className = "proyecto-fase";
    if (descartada) {
      linea.textContent = "Descartada · " + info.completadas + "/" + TOTAL + " fases";
    } else {
      linea.textContent = "Fase " + info.fase + "/" + TOTAL + " · " + FASES[info.fase - 1] + " · " + ESTADOS[info.estado];
      box.classList.add("estado-" + info.estado);
    }
    box.appendChild(linea);

    var barra = document.createElement("div");
    barra.className = "proyecto-barra";
    barra.setAttribute("role", "progressbar");
    barra.setAttribute("aria-label", "Fases completadas");
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", String(TOTAL));
    barra.setAttribute("aria-valuenow", String(info.completadas));
    barra.setAttribute("aria-valuetext", info.completadas + " de " + TOTAL + " fases completadas");
    var relleno = document.createElement("span");
    relleno.style.width = Math.round((info.completadas / TOTAL) * 100) + "%";
    barra.appendChild(relleno);
    box.appendChild(barra);

    if (info.objetivo) {
      var obj = document.createElement("p");
      obj.className = "proyecto-objetivo";
      obj.textContent = info.objetivo;
      obj.title = info.objetivo;
      box.appendChild(obj);
    }
    return box;
  }

  function firma(info) {
    return info ? [info.fase, info.estado, info.completadas, info.objetivo].join("|") : "";
  }

  function marcarPausa(card, info) {
    card.classList.toggle("en-pausa", !!(info && info.fase !== 7 && info.estado === 2));
  }

  function ubicar(card, info) {
    if (card.classList.contains("abierta")) return;
    var fase = info && info.fase >= 1 && info.fase <= 7 ? String(info.fase) : "0";
    var grid = document.querySelector('.fase[data-fase="' + fase + '"] .grid');
    if (grid && card.parentNode !== grid) grid.appendChild(card);
  }

  function ocupada(sec) {
    var grid = sec.querySelector(".grid");
    if (!grid) return false;
    for (var i = 0; i < grid.children.length; i++) {
      var ch = grid.children[i];
      if (ch.classList.contains("card") || ch.classList.contains("hueco")) return true;
    }
    return false;
  }

  function mostrarFases() {
    var secs = document.querySelectorAll("main .fase");
    for (var i = 0; i < secs.length; i++) secs[i].hidden = !ocupada(secs[i]);
  }

  function pintar(card, info) {
    marcarPausa(card, info);
    ubicar(card, info);
    var actual = card.querySelector(":scope > .proyecto");
    var nueva = firma(info);
    if ((card.getAttribute("data-proyecto") || "") === nueva && (!!actual === !!info)) {
      mostrarFases();
      return;
    }
    if (actual) actual.remove();
    if (info) {
      var links = card.querySelector(":scope > .links");
      card.insertBefore(construir(info), links);
      card.setAttribute("data-proyecto", nueva);
    } else {
      card.removeAttribute("data-proyecto");
    }
    mostrarFases();
  }

  function tarjetas(slug) {
    var all = document.querySelectorAll(".card[data-app]");
    var out = [];
    for (var i = 0; i < all.length; i++) {
      var s = all[i].getAttribute("data-app");
      if (SLUG_RE.test(s) && (!slug || s === slug)) out.push(all[i]);
    }
    return out;
  }

  function sinRegistro(slug) {
    try { return window.localStorage.getItem(PREFIX + slug) === null; } catch (e) { return true; }
  }

  function leerInfo(slug) {
    var info = leerProyecto(leerRegistro(slug), slug);
    if (info || !sinRegistro(slug)) return info;
    if (!Object.prototype.hasOwnProperty.call(SEMILLAS, slug)) return null;
    return leerProyecto(SEMILLAS[slug], slug);
  }

  function refrescar(slug) {
    var cards = tarjetas(slug);
    for (var i = 0; i < cards.length; i++) {
      var s = cards[i].getAttribute("data-app");
      try { pintar(cards[i], leerInfo(s)); } catch (e) { }
    }
  }

  function slugDeClave(key) {
    if (typeof key !== "string" || key.indexOf(PREFIX) !== 0) return null;
    var s = key.slice(PREFIX.length);
    return SLUG_RE.test(s) ? s : null;
  }

  function iniciar() {
    refrescar();
    document.addEventListener("portafolio:render", function () { refrescar(); });
    window.addEventListener("storage", function (e) {
      if (e.storageArea && e.storageArea !== window.localStorage) return;
      if (e.key === null) { refrescar(); return; }
      var s = slugDeClave(e.key);
      if (s) refrescar(s);
    });
    window.addEventListener("message", function (e) {
      if (e.origin !== location.origin) return;
      var d = e.data;
      if (!d || typeof d !== "object" || d.type !== "meta") return;
      var s = slugDeClave(d.key);
      if (!s) return;
      var cards = tarjetas(s);
      if (!cards.length) return;
      var info = null;
      try { info = leerProyecto(d.data, s); } catch (err) { info = null; }
      if (!info) { refrescar(s); return; }
      for (var i = 0; i < cards.length; i++) pintar(cards[i], info);
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted) refrescar(); });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") refrescar();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
