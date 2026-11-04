(function () {
  "use strict";
  var CFG = window.PORTAFOLIO_CONFIG;
  var META = CFG.META;
  var FASES = CFG.FASES;
  var ESTADOS = CFG.ESTADOS;
  var TOTAL = META.FASES_TOTAL;
  var SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
  var PREFIX = CFG.CLAVE_META;
  var CONTROL_RE = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g;

  function entero(n, lo, hi) {
    return typeof n === "number" && isFinite(n) && Math.floor(n) === n && n >= lo && n <= hi;
  }

  function limpiarTexto(s, max) {
    if (typeof s !== "string") return "";
    var t = s.replace(CONTROL_RE, " ").replace(/\s+/g, " ").trim();
    var chars = Array.from(t);
    if (chars.length > max) t = chars.slice(0, max - 1).join("").trim() + "…";
    return t;
  }

  function objeto(o) {
    return !!o && typeof o === "object" && !Array.isArray(o);
  }

  function nombreStat(it) {
    var crudo = typeof it.stat === "string" ? it.stat : typeof it.id === "string" ? it.id : "";
    var t = crudo.replace(CONTROL_RE, " ").replace(/\s+/g, " ").trim();
    var n = Array.from(t).length;
    return n >= 1 && n <= CFG.STAT_NOMBRE_MAX ? t : "";
  }

  function leerAportes(lista) {
    if (!Array.isArray(lista)) return [];
    var mapa = {};
    var orden = [];
    for (var j = 0; j < lista.length; j++) {
      var it = lista[j];
      if (!objeto(it)) continue;
      var stat = nombreStat(it);
      var exp = it.exp !== undefined ? it.exp : it.aporte;
      var fuente = it.fuente;
      if (!stat || !entero(exp, CFG.EXP_MIN, CFG.EXP_MAX) || META.FUENTES.indexOf(fuente) < 0) continue;
      var clave = stat + "\n" + fuente;
      if (!mapa[clave]) {
        mapa[clave] = { stat: stat, exp: 0, fuente: fuente };
        orden.push(clave);
      }
      mapa[clave].exp = Math.min(CFG.EXP_MAX, mapa[clave].exp + exp);
    }
    return orden.map(function (k) { return mapa[k]; });
  }

  function leerProyecto(record, slug) {
    if (!objeto(record)) return null;
    if (record.v !== undefined && record.v !== META.V) return null;
    if (record.slug !== undefined && record.slug !== slug) return null;
    var p = record.proyecto;
    if (!objeto(p) || !entero(p.fase, META.FASE_MIN, META.FASE_MAX)) return null;
    var estado = entero(p.fase_estado, META.ESTADO_MIN, META.ESTADO_MAX) ? p.fase_estado : META.ESTADO_DEFECTO;
    var completadas = entero(p.fases_completadas, 0, TOTAL) ? p.fases_completadas : Math.min(TOTAL, p.fase - 1);
    return {
      fase: p.fase,
      estado: estado,
      completadas: completadas,
      objetivo: limpiarTexto(p.objetivo, META.OBJETIVO_MAX),
      bloqueada: p.bloqueada === true,
      aportes: leerAportes(p.aportes)
    };
  }

  function leerRegistro(slug) {
    var raw = null;
    try { raw = window.localStorage.getItem(PREFIX + slug); } catch (e) { return null; }
    if (typeof raw !== "string" || raw.length === 0 || raw.length > META.CRUDO_MAX) return null;
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
      linea.textContent = FASES[META.FASE_MAX - 1] + " · " + info.completadas + "/" + TOTAL + " fases";
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
    if (!info) return "";
    var ap = info.aportes.map(function (a) { return a.stat + ":" + a.fuente + ":" + a.exp; }).join("+");
    return [info.fase, info.estado, info.completadas, info.objetivo, info.bloqueada ? "b" : "", ap].join("|");
  }

  function marcarPausa(card, info) {
    card.classList.toggle("en-pausa", !!(info && info.fase !== 7 && info.estado === 2));
  }

  function ubicar(card, info) {
    if (card.classList.contains("abierta")) return;
    var fase = String(info ? info.fase : META.FASE_DEFECTO);
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

  function leerInfo(slug) {
    if (!SLUG_RE.test(slug || "")) return null;
    try { return leerProyecto(leerRegistro(slug), slug); } catch (e) { return null; }
  }

  window.PORTAFOLIO_META = Object.freeze({ leer: leerInfo, slugValido: function (s) { return SLUG_RE.test(s || ""); } });

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
