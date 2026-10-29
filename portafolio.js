(function () {
  "use strict";
  var CLAVE = "portafolio.v1.proyectos";
  var VERSION_DATOS = 1;
  var SEMILLA_INICIAL = 1;
  var LIMITES = Object.freeze({ PROYECTOS: 60, NOMBRE: 60, DESCRIPCION: 180, URL: 2048, HTML: 2000000, ESPERA_MS: 10000, DESHACER_MS: 6000 });
  var TEXTOS = Object.freeze({
    AGREGAR: "＋ Agregar proyecto",
    TITULO_HOJA: "Agregar proyecto",
    ETIQUETA: "URL de GitHub Pages o usuario/repo",
    EJEMPLO: "usuario.github.io/repo",
    CANCELAR: "Cancelar",
    CONFIRMAR: "Agregar",
    CARGANDO: "Cargando…",
    ABRIR: "▶ Abrir",
    CODIGO: "Código",
    DEJAR: "Dejar de seguir",
    DESHACER: "Deshacer",
    RESTAURAR: "Restaurar proyectos por defecto",
    ERR_VACIO: "Escribe una URL de GitHub Pages o usuario/repo.",
    ERR_FORMATO: "No reconozco esa dirección. Usa usuario.github.io/repo, una URL de github.com o usuario/repo.",
    ERR_DUPLICADO: "Ya sigues ese proyecto.",
    ERR_LIMITE: "Llegaste al máximo de proyectos. Deja de seguir alguno primero.",
    ERR_CARGA: "No se pudo cargar {url}. Revisa que el proyecto tenga GitHub Pages activo y que estés en línea.",
    ERR_HTML: "{url} no devolvió una página web.",
    OK_AGREGADO: "Ahora sigues {nombre}",
    OK_QUITADO: "Dejaste de seguir {nombre}",
    OK_RESTAURADO: "Restauraste los proyectos por defecto"
  });
  var DUENO_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  var REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;
  var SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
  var CONTROL_RE = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g;

  function texto(plantilla, datos) {
    return plantilla.replace(/\{(\w+)\}/g, function (m, k) { return Object.prototype.hasOwnProperty.call(datos, k) ? datos[k] : m; });
  }

  function limpiar(s, max) {
    if (typeof s !== "string") return "";
    var t = s.replace(CONTROL_RE, " ").replace(/\s+/g, " ").trim();
    var chars = Array.from(t);
    if (chars.length > max) t = chars.slice(0, max - 1).join("").trim() + "…";
    return t;
  }

  function urlSegura(valor, base) {
    if (typeof valor !== "string" || !valor.trim() || valor.length > LIMITES.URL) return "";
    try {
      var u = new URL(valor.trim(), base);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
    } catch (e) { return ""; }
  }

  function leerDefaults() {
    var out = [];
    var cards = document.querySelectorAll("main section .grid > li.card[data-app]");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var seccion = card.closest("section");
      var h2 = seccion && seccion.querySelector("h2[id]");
      var codigo = card.querySelector("a.code");
      var m = codigo && /^https:\/\/github\.com\/([^/]+)\/([^/?#]+)/.exec(codigo.href);
      if (!h2 || !m) continue;
      out.push(Object.freeze({
        id: (m[1] + "/" + m[2]).toLowerCase(),
        dueno: m[1].toLowerCase(),
        semilla: Math.max(SEMILLA_INICIAL, parseInt(card.getAttribute("data-semilla"), 10) || SEMILLA_INICIAL),
        nodo: card.cloneNode(true)
      }));
    }
    return Object.freeze(out);
  }

  var DEFAULTS = leerDefaults();
  if (!DEFAULTS.length) return;
  var DUENO_SITIO = DEFAULTS[0].dueno;
  var MISMO_ORIGEN = location.hostname.toLowerCase() === DUENO_SITIO + ".github.io";
  var POR_ID = {};
  DEFAULTS.forEach(function (d) { POR_ID[d.id] = d; });
  var SEMILLA = DEFAULTS.reduce(function (n, d) { return Math.max(n, d.semilla); }, SEMILLA_INICIAL);

  function listaDefaults() {
    return DEFAULTS.map(function (d) { return { id: d.id }; });
  }

  function interpretar(entrada) {
    var t = (entrada || "").trim();
    if (!t || t.length > LIMITES.URL) return null;
    var dueno = "", repo = "";
    var corto = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)\/?$/.exec(t);
    if (corto) {
      dueno = corto[1]; repo = corto[2];
    } else {
      if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) t = "https://" + t;
      var u;
      try { u = new URL(t); } catch (e) { return null; }
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      var host = u.hostname.toLowerCase();
      var partes = u.pathname.split("/").filter(Boolean);
      if (host === "github.com" || host === "www.github.com") {
        if (partes.length < 2) return null;
        dueno = partes[0]; repo = partes[1].replace(/\.git$/i, "");
      } else if (/\.github\.io$/.test(host)) {
        dueno = host.slice(0, -".github.io".length);
        try { repo = partes.length ? decodeURIComponent(partes[0]) : ""; } catch (e) { return null; }
      } else {
        return null;
      }
    }
    if (!DUENO_RE.test(dueno) || !REPO_RE.test(repo) || repo === "." || repo === "..") return null;
    dueno = dueno.toLowerCase();
    if (repo.toLowerCase() === dueno + ".github.io") return null;
    return {
      id: (dueno + "/" + repo).toLowerCase(),
      dueno: dueno,
      repo: repo,
      url: "https://" + dueno + ".github.io/" + encodeURIComponent(repo) + "/"
    };
  }

  function validarAgregado(item) {
    if (!item || typeof item !== "object" || typeof item.id !== "string") return null;
    var ref = interpretar(item.dueno + "/" + item.repo);
    if (!ref || ref.id !== item.id) return null;
    return {
      id: ref.id,
      dueno: ref.dueno,
      repo: ref.repo,
      url: ref.url,
      nombre: limpiar(item.nombre, LIMITES.NOMBRE) || ref.repo,
      descripcion: limpiar(item.descripcion, LIMITES.DESCRIPCION),
      imagen: urlSegura(item.imagen, ref.url),
      icono: item.icono === true
    };
  }

  function normalizar(items) {
    if (!Array.isArray(items)) return null;
    var vistos = {};
    var out = [];
    for (var i = 0; i < items.length && out.length < LIMITES.PROYECTOS; i++) {
      var it = items[i];
      if (!it || typeof it !== "object" || typeof it.id !== "string") continue;
      var id = it.id.toLowerCase();
      if (vistos[id]) continue;
      var valido = POR_ID[id] ? { id: id } : validarAgregado(it);
      if (!valido) continue;
      vistos[id] = true;
      out.push(valido);
    }
    return out;
  }

  var memoria = null;

  function guardar(lista) {
    memoria = lista;
    try { window.localStorage.setItem(CLAVE, JSON.stringify({ v: VERSION_DATOS, semilla: SEMILLA, items: lista })); } catch (e) { }
  }

  function cargar() {
    var raw = null;
    try { raw = window.localStorage.getItem(CLAVE); } catch (e) { raw = null; }
    if (raw === null) {
      if (memoria) return memoria;
      var semilla = listaDefaults();
      guardar(semilla);
      return semilla;
    }
    var datos = null;
    try { datos = JSON.parse(raw); } catch (e) { datos = null; }
    var lista = datos && datos.v === VERSION_DATOS ? normalizar(datos.items) : null;
    if (!lista) {
      lista = listaDefaults();
      guardar(lista);
      return lista;
    }
    var vista = typeof datos.semilla === "number" && isFinite(datos.semilla) ? datos.semilla : SEMILLA_INICIAL;
    if (vista < SEMILLA) {
      lista = conNuevos(lista, vista);
      guardar(lista);
      return lista;
    }
    memoria = lista;
    return lista;
  }

  function conNuevos(lista, vista) {
    var out = lista.slice();
    DEFAULTS.forEach(function (d, i) {
      if (d.semilla <= vista || out.some(function (it) { return it.id === d.id; })) return;
      if (out.length >= LIMITES.PROYECTOS) return;
      var pos = 0;
      for (var j = i - 1; j >= 0; j--) {
        var k = out.findIndex(function (it) { return it.id === DEFAULTS[j].id; });
        if (k >= 0) { pos = k + 1; break; }
      }
      out.splice(pos, 0, { id: d.id });
    });
    return out;
  }

  function manualesDe(lista) {
    return lista.filter(function (i) { return !POR_ID[i.id]; });
  }

  function listaRestaurada(lista) {
    return listaDefaults().concat(manualesDe(lista).map(function (i) { return Object.assign({}, i); }));
  }

  function mismaLista(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i].id !== b[i].id) return false;
    return true;
  }

  function el(tag, clase, contenido) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (contenido) n.textContent = contenido;
    return n;
  }

  function enlaceJugar(item) {
    if (MISMO_ORIGEN && item.dueno === DUENO_SITIO && SLUG_RE.test(item.repo)) return "/app/?app=" + item.repo;
    return item.url;
  }

  function tarjetaAgregada(item) {
    var li = el("li", "card");
    if (item.dueno === DUENO_SITIO && SLUG_RE.test(item.repo)) li.setAttribute("data-app", item.repo);
    var jugar = enlaceJugar(item);
    var thumb = el("a", "thumb");
    thumb.href = jugar;
    thumb.tabIndex = -1;
    thumb.setAttribute("aria-hidden", "true");
    if (item.imagen) {
      if (item.icono) thumb.classList.add("icono");
      var img = el("img");
      img.alt = "";
      img.width = 480;
      img.height = 300;
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.src = item.imagen;
      img.addEventListener("error", function () {
        thumb.classList.remove("icono");
        thumb.replaceChildren(el("span", "thumb-letra", Array.from(item.nombre)[0].toUpperCase()));
      });
      thumb.appendChild(img);
    } else {
      thumb.appendChild(el("span", "thumb-letra", Array.from(item.nombre)[0].toUpperCase()));
    }
    li.appendChild(thumb);
    li.appendChild(el("h3", "", item.nombre));
    if (item.descripcion) li.appendChild(el("p", "", item.descripcion));
    var links = el("p", "links");
    var btn = el("a", "btn", TEXTOS.ABRIR);
    btn.href = jugar;
    var code = el("a", "code", TEXTOS.CODIGO);
    code.href = "https://github.com/" + item.dueno + "/" + item.repo;
    links.appendChild(btn);
    links.appendChild(document.createTextNode(" "));
    links.appendChild(code);
    li.appendChild(links);
    return li;
  }

  function nombreDe(item) {
    if (item.nombre) return item.nombre;
    var d = POR_ID[item.id];
    var h3 = d && d.nodo.querySelector("h3");
    if (!h3) return item.id;
    var c = h3.cloneNode(true);
    c.querySelectorAll('[aria-hidden="true"]').forEach(function (n) { n.remove(); });
    return c.textContent.trim() || item.id;
  }

  var grids = {};
  var ui = {};
  var deshacer = null;
  var temporizador = 0;

  function prepararSecciones() {
    var secs = document.querySelectorAll("main .fase");
    for (var i = 0; i < secs.length; i++) {
      grids[secs[i].getAttribute("data-fase")] = secs[i].querySelector(".grid");
    }
  }

  function botonDejar(li, item) {
    var b = el("button", "dejar", "✕");
    b.type = "button";
    b.title = TEXTOS.DEJAR;
    b.setAttribute("aria-label", TEXTOS.DEJAR + ": " + nombreDe(item));
    b.addEventListener("click", function () { quitar(item.id); });
    li.appendChild(b);
  }

  function pintar() {
    var lista = cargar();
    var fijos = Array.prototype.slice.call(document.querySelectorAll("li.card[data-fijo]"));
    Object.keys(grids).forEach(function (g) { grids[g].replaceChildren(); });
    var base = grids["0"];
    lista.forEach(function (item) {
      var d = POR_ID[item.id];
      var li = d ? d.nodo.cloneNode(true) : tarjetaAgregada(item);
      li.setAttribute("data-id", item.id);
      botonDejar(li, item);
      base.appendChild(li);
    });
    fijos.forEach(function (li) { base.appendChild(li); });
    ui.restaurar.hidden = mismaLista(lista, listaRestaurada(lista));
    document.dispatchEvent(new CustomEvent("portafolio:render"));
  }

  function avisar(mensaje, anterior) {
    clearTimeout(temporizador);
    deshacer = anterior || null;
    ui.avisoTexto.textContent = mensaje;
    ui.avisoBoton.hidden = !deshacer;
    ui.aviso.hidden = false;
    temporizador = setTimeout(function () { ui.aviso.hidden = true; deshacer = null; }, LIMITES.DESHACER_MS);
  }

  function copia(lista) { return lista.map(function (i) { return Object.assign({}, i); }); }

  function quitar(id) {
    var lista = cargar();
    var item = null;
    var resto = lista.filter(function (i) { if (i.id === id) { item = i; return false; } return true; });
    if (!item) return;
    var enfocado = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-id="' + CSS.escape(id) + '"]');
    var anterior = copia(lista);
    guardar(resto);
    pintar();
    avisar(texto(TEXTOS.OK_QUITADO, { nombre: nombreDe(item) }), anterior);
    if (enfocado) ui.avisoBoton.focus();
  }

  function restaurar() {
    var anterior = copia(cargar());
    guardar(listaRestaurada(anterior));
    pintar();
    avisar(TEXTOS.OK_RESTAURADO, anterior);
  }

  function cortarTitulo(t) {
    var partes = t.split(/\s+[|·—–-]\s+/);
    return partes[0] || t;
  }

  function extraer(html, ref) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    function meta(sel) {
      var n = doc.querySelector(sel);
      return n ? (n.getAttribute("content") || "").trim() : "";
    }
    function enlace(sel) {
      var n = doc.querySelector(sel);
      return n ? (n.getAttribute("href") || "").trim() : "";
    }
    var titulo = meta('meta[property="og:title"]') || (doc.querySelector("title") ? doc.querySelector("title").textContent : "");
    var imagen = urlSegura(meta('meta[property="og:image"]') || meta('meta[name="twitter:image"]'), ref.url);
    var icono = false;
    if (!imagen) {
      imagen = urlSegura(enlace('link[rel~="apple-touch-icon"]') || enlace('link[rel~="icon"][type="image/svg+xml"]') || enlace('link[rel~="icon"]'), ref.url);
      icono = !!imagen;
    }
    return {
      id: ref.id,
      dueno: ref.dueno,
      repo: ref.repo,
      url: ref.url,
      nombre: limpiar(cortarTitulo(limpiar(titulo, 200)), LIMITES.NOMBRE) || ref.repo,
      descripcion: limpiar(meta('meta[name="description"]') || meta('meta[property="og:description"]') || meta('meta[name="twitter:description"]'), LIMITES.DESCRIPCION),
      imagen: imagen,
      icono: icono
    };
  }

  function descargar(ref) {
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var reloj = setTimeout(function () { if (ctrl) ctrl.abort(); }, LIMITES.ESPERA_MS);
    return fetch(ref.url, { credentials: "omit", cache: "no-cache", redirect: "follow", signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        if (!res.ok) throw new Error(texto(TEXTOS.ERR_CARGA, { url: ref.url }));
        var tipo = (res.headers.get("content-type") || "").toLowerCase();
        if (tipo && tipo.indexOf("html") === -1) throw new Error(texto(TEXTOS.ERR_HTML, { url: ref.url }));
        return res.text();
      }, function () { throw new Error(texto(TEXTOS.ERR_CARGA, { url: ref.url })); })
      .then(function (html) { return extraer(html.slice(0, LIMITES.HTML), ref); })
      .finally(function () { clearTimeout(reloj); });
  }

  function error(msg) {
    ui.error.textContent = msg || "";
    ui.input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function ocupado(si) {
    ui.confirmar.disabled = si;
    ui.input.readOnly = si;
    ui.confirmar.textContent = si ? TEXTOS.CARGANDO : TEXTOS.CONFIRMAR;
  }

  function enviar(e) {
    e.preventDefault();
    if (ui.confirmar.disabled) return;
    var valor = ui.input.value.trim();
    if (!valor) { error(TEXTOS.ERR_VACIO); ui.input.focus(); return; }
    var ref = interpretar(valor);
    if (!ref) { error(TEXTOS.ERR_FORMATO); ui.input.focus(); return; }
    var lista = cargar();
    if (lista.some(function (i) { return i.id === ref.id; })) { error(TEXTOS.ERR_DUPLICADO); ui.input.focus(); return; }
    if (lista.length >= LIMITES.PROYECTOS) { error(TEXTOS.ERR_LIMITE); return; }
    error("");
    ocupado(true);
    descargar(ref).then(function (item) {
      var actual = cargar();
      if (actual.some(function (i) { return i.id === item.id; })) throw new Error(TEXTOS.ERR_DUPLICADO);
      var anterior = copia(actual);
      guardar(actual.concat([item]));
      ocupado(false);
      ui.hoja.close();
      pintar();
      avisar(texto(TEXTOS.OK_AGREGADO, { nombre: item.nombre }), anterior);
      var nueva = document.querySelector('[data-id="' + CSS.escape(item.id) + '"]');
      if (nueva) nueva.scrollIntoView({ block: "center", behavior: "smooth" });
    }).catch(function (err) {
      ocupado(false);
      error(err && err.message ? err.message : texto(TEXTOS.ERR_CARGA, { url: ref.url }));
      ui.input.focus();
    });
  }

  function abrirHoja() {
    ui.input.value = "";
    error("");
    ocupado(false);
    if (typeof ui.hoja.showModal === "function") ui.hoja.showModal();
    else ui.hoja.setAttribute("open", "");
    ui.input.focus();
  }

  function construirUI() {
    var hero = document.querySelector(".hero");
    var acciones = el("p", "hero-acciones");
    var agregar = el("button", "agregar", TEXTOS.AGREGAR);
    agregar.type = "button";
    agregar.setAttribute("aria-haspopup", "dialog");
    agregar.addEventListener("click", abrirHoja);
    acciones.appendChild(agregar);
    hero.appendChild(acciones);

    var hoja = el("dialog", "hoja");
    hoja.setAttribute("aria-labelledby", "hoja-titulo");
    var form = el("form");
    form.noValidate = true;
    var h2 = el("h2", "", TEXTOS.TITULO_HOJA);
    h2.id = "hoja-titulo";
    var label = el("label", "", TEXTOS.ETIQUETA);
    label.htmlFor = "hoja-url";
    var input = el("input");
    input.id = "hoja-url";
    input.type = "text";
    input.inputMode = "url";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.maxLength = LIMITES.URL;
    input.placeholder = TEXTOS.EJEMPLO;
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("enterkeyhint", "go");
    input.setAttribute("aria-describedby", "hoja-error");
    var err = el("p", "error");
    err.id = "hoja-error";
    err.setAttribute("role", "alert");
    var botones = el("div", "hoja-acciones");
    var cancelar = el("button", "sec", TEXTOS.CANCELAR);
    cancelar.type = "button";
    cancelar.addEventListener("click", function () { hoja.close(); });
    var confirmar = el("button", "btn", TEXTOS.CONFIRMAR);
    confirmar.type = "submit";
    botones.appendChild(cancelar);
    botones.appendChild(confirmar);
    form.appendChild(h2);
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(err);
    form.appendChild(botones);
    form.addEventListener("submit", enviar);
    input.addEventListener("input", function () { if (ui.error.textContent) error(""); });
    hoja.appendChild(form);
    hoja.addEventListener("click", function (e) { if (e.target === hoja) hoja.close(); });
    document.body.appendChild(hoja);

    var footer = document.querySelector("footer");
    var p = el("p");
    var rest = el("button", "restaurar", TEXTOS.RESTAURAR);
    rest.type = "button";
    rest.hidden = true;
    rest.addEventListener("click", restaurar);
    p.appendChild(rest);
    footer.appendChild(p);

    var aviso = el("div", "aviso");
    aviso.setAttribute("role", "status");
    aviso.setAttribute("aria-live", "polite");
    aviso.hidden = true;
    var avisoTexto = el("span");
    var avisoBoton = el("button", "", TEXTOS.DESHACER);
    avisoBoton.type = "button";
    avisoBoton.addEventListener("click", function () {
      if (!deshacer) return;
      var anterior = deshacer;
      deshacer = null;
      clearTimeout(temporizador);
      aviso.hidden = true;
      guardar(anterior);
      pintar();
    });
    aviso.appendChild(avisoTexto);
    aviso.appendChild(avisoBoton);
    document.body.appendChild(aviso);

    ui = { hoja: hoja, input: input, error: err, confirmar: confirmar, restaurar: rest, aviso: aviso, avisoTexto: avisoTexto, avisoBoton: avisoBoton };
  }

  prepararSecciones();
  construirUI();
  pintar();
  window.addEventListener("storage", function (e) {
    if (e.key === CLAVE || e.key === null) { memoria = null; pintar(); }
  });
})();
