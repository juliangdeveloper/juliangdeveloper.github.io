(function () {
  "use strict";

  var CFG = window.PORTAFOLIO_CONFIG;
  if (!CFG) return;

  var MODOS = {};
  var modoActual = "";
  var listo = false;
  var velo = null;
  var caja = null;
  var actual = null;
  var transicion = null;
  var nombrado = null;
  var proxy = null;
  var abiertaEn = 0;
  var GRACIA_MS = 450;
  var NOMBRE_VT = "panel";
  var ajustesBtn = null;
  var barraEjec = null;
  var api;

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  function escapeCss(s) {
    if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function leerModo() {
    try {
      var m = localStorage.getItem(CFG.CLAVE_MODO);
      if (m === CFG.MODO_MAZMORRA || m === CFG.MODO_EJECUTIVO) return m;
      if (localStorage.getItem(CFG.CLAVE_MAZMORRA) === CFG.VALOR_ON) return CFG.MODO_MAZMORRA;
    } catch (e) {}
    return CFG.MODO_EJECUTIVO;
  }

  function guardarModo(id) {
    try {
      localStorage.setItem(CFG.CLAVE_MODO, id);
      localStorage.setItem(CFG.CLAVE_MAZMORRA, id === CFG.MODO_MAZMORRA ? CFG.VALOR_ON : CFG.VALOR_OFF);
    } catch (e) {}
  }

  function puedeAnimar() {
    return typeof document.startViewTransition === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function cajaDe(nodo) {
    if (!nodo || !nodo.getBoundingClientRect) return null;
    var r = nodo.getBoundingClientRect();
    if (!(r.width > 0) && !(r.height > 0)) return null;
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function necesitaProxy(origen, nodo) {
    if (!origen || origen !== nodo || !origen.isConnected) return true;
    var n = origen.parentElement;
    while (n && n !== document.body) {
      var t = getComputedStyle(n).transform;
      if (t && t !== "none") return true;
      n = n.parentElement;
    }
    return false;
  }

  function soltarNombre() {
    if (!nombrado) return;
    nombrado.style.removeProperty("view-transition-name");
    nombrado = null;
  }

  function ponerNombre(nodo) {
    if (!nodo) return;
    if (nombrado && nombrado !== nodo) nombrado.style.removeProperty("view-transition-name");
    nombrado = nodo;
    nodo.style.setProperty("view-transition-name", NOMBRE_VT);
  }

  function soltarProxy() {
    if (!proxy) return;
    if (nombrado === proxy) nombrado = null;
    if (proxy.parentNode) proxy.remove();
    proxy = null;
  }

  function ponerProxy(rect) {
    soltarProxy();
    if (!rect) return null;
    proxy = el("div", "origen-vt");
    proxy.setAttribute("aria-hidden", "true");
    proxy.style.left = rect.left + "px";
    proxy.style.top = rect.top + "px";
    proxy.style.width = rect.width + "px";
    proxy.style.height = rect.height + "px";
    document.body.appendChild(proxy);
    ponerNombre(proxy);
    return proxy;
  }

  function saltarTransicion() {
    if (transicion && typeof transicion.skipTransition === "function") {
      try { transicion.skipTransition(); } catch (e) {}
    }
  }

  function despuesDeActualizar() {
    if (!transicion) return Promise.resolve();
    var p = transicion.updateCallbackDone || transicion.finished;
    return p && typeof p.then === "function" ? p.then(function () {}, function () {}) : Promise.resolve();
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
    var lista = document.querySelectorAll(".hero, main, footer, .aviso, .barra-ejecutivo");
    for (var i = 0; i < lista.length; i++) {
      lista[i].inert = true;
      lista[i].setAttribute("data-fondo", "");
    }
  }

  function visibleFoco(n) {
    if (n.disabled || n.hidden || n.tabIndex === -1) return false;
    if (n.closest("[hidden]")) return false;
    var s = getComputedStyle(n);
    return s.display !== "none" && s.visibility !== "hidden";
  }

  function focos(root) {
    var nodos = root.querySelectorAll('a[href], button:not([hidden]), input:not([hidden]):not([type="hidden"]), select:not([hidden]), textarea:not([hidden]), [tabindex]:not([tabindex="-1"])');
    var out = [];
    for (var i = 0; i < nodos.length; i++) {
      if (visibleFoco(nodos[i])) out.push(nodos[i]);
    }
    return out;
  }

  function panelVivo() {
    if (actual && actual.ficha) return document.querySelector(".card.abierta");
    if (caja && caja.classList.contains("abierta")) return caja;
    return document.querySelector(".card.abierta, .panel.abierta");
  }

  function emitir(abierto) {
    document.dispatchEvent(new CustomEvent("portafolio:panel", { detail: { abierto: !!abierto } }));
  }

  function cerrarDialogosNativos() {
    var ds = document.querySelectorAll("dialog[open]");
    for (var i = 0; i < ds.length; i++) {
      if (typeof ds[i].close === "function") ds[i].close();
      else ds[i].removeAttribute("open");
    }
  }

  function asegurarCerrar(card) {
    var b = card.querySelector(":scope > .cerrar");
    if (b) return b;
    b = el("button", "cerrar", CFG.TEXTOS.CERRAR);
    b.type = "button";
    b.hidden = true;
    b.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      cerrar();
    });
    card.insertBefore(b, card.firstChild);
    return b;
  }

  function asegurarCaja() {
    if (caja) return caja;
    caja = el("div", "panel");
    caja.hidden = true;
    var b = el("button", "cerrar", CFG.TEXTOS.CERRAR);
    b.type = "button";
    b.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      cerrar();
    });
    caja.appendChild(b);
    caja.appendChild(el("div", "panel-cuerpo"));
    document.body.appendChild(caja);
    return caja;
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

  function aplicarAbrirFicha(card) {
    var hueco = document.createElement("li");
    hueco.className = "hueco";
    hueco.setAttribute("aria-hidden", "true");
    var vista = document.documentElement.getAttribute("data-vista");
    if (vista === "completa") hueco.style.minHeight = card.getBoundingClientRect().height + "px";
    if (card.parentNode) card.after(hueco);
    card._hueco = hueco;
    document.body.appendChild(card);
    abiertaEn = Date.now();
    card.classList.add("abierta");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.removeAttribute("aria-expanded");
    card.removeAttribute("tabindex");
    tituloDe(card);
    var cerrarB = asegurarCerrar(card);
    if (cerrarB) {
      cerrarB.hidden = false;
      cerrarB.focus();
    }
    if (velo) velo.hidden = false;
    frenarFondo();
  }

  function aplicarCerrarFicha(card) {
    card.classList.remove("abierta");
    card.removeAttribute("role");
    card.removeAttribute("aria-modal");
    card.removeAttribute("aria-labelledby");
    var cerrarB = card.querySelector(":scope > .cerrar");
    if (cerrarB) cerrarB.hidden = true;
    if (card._hueco && card._hueco.parentNode) {
      card._hueco.parentNode.insertBefore(card, card._hueco);
      card._hueco.remove();
    }
    card._hueco = null;
    if (velo) velo.hidden = true;
    liberarFondo();
    if (document.documentElement.getAttribute("data-vista") === "widget") {
      card.setAttribute("role", "button");
      card.setAttribute("aria-expanded", "false");
    } else {
      card.removeAttribute("role");
      card.removeAttribute("aria-expanded");
    }
    card.tabIndex = 0;
  }

  function aplicarAbrirGenerico(contenido) {
    var p = asegurarCaja();
    var cuerpo = p.querySelector(":scope > .panel-cuerpo");
    cuerpo.replaceChildren();
    if (contenido) cuerpo.appendChild(contenido);
    var esMaz = modoActual === CFG.MODO_MAZMORRA;
    var tipo = contenido && contenido.getAttribute ? contenido.getAttribute("data-panel") : "";
    p.classList.toggle("maz-pixel", esMaz);
    p.classList.toggle("maz-dialog", esMaz);
    p.classList.toggle("panel-trono", tipo === "trono");
    var etiqueta = contenido && contenido.getAttribute ? contenido.getAttribute("aria-labelledby") : "";
    if (etiqueta) p.setAttribute("aria-labelledby", etiqueta);
    else p.removeAttribute("aria-labelledby");
    p.hidden = false;
    p.classList.add("abierta");
    p.setAttribute("role", "dialog");
    p.setAttribute("aria-modal", "true");
    abiertaEn = Date.now();
    if (velo) velo.hidden = false;
    frenarFondo();
    var b = p.querySelector(":scope > .cerrar");
    if (b) b.focus();
  }

  function aplicarCerrarGenerico() {
    if (!caja) return;
    caja.classList.remove("abierta", "maz-pixel", "maz-dialog", "panel-trono");
    caja.removeAttribute("role");
    caja.removeAttribute("aria-modal");
    caja.removeAttribute("aria-labelledby");
    caja.hidden = true;
    var cuerpo = caja.querySelector(":scope > .panel-cuerpo");
    if (cuerpo) cuerpo.replaceChildren();
    if (velo) velo.hidden = true;
    liberarFondo();
  }

  function animarApertura(origen, rect, nodoFinal, cambio) {
    saltarTransicion();
    despuesDeActualizar().then(function () {
      if (!puedeAnimar()) {
        soltarNombre();
        soltarProxy();
        cambio();
        transicion = null;
        return;
      }
      var usaProxy = necesitaProxy(origen, nodoFinal);
      if (usaProxy) ponerProxy(rect || cajaDe(origen));
      else if (origen) ponerNombre(origen);
      var t;
      var hecho = false;
      function unaVez() {
        if (hecho) return;
        hecho = true;
        cambio();
        if (usaProxy) {
          soltarProxy();
          var vivo = panelVivo();
          if (vivo) ponerNombre(vivo);
        }
      }
      try {
        t = document.startViewTransition(unaVez);
      } catch (e) {
        soltarNombre();
        soltarProxy();
        unaVez();
        transicion = null;
        return;
      }
      transicion = t;
      var fin = t.finished && typeof t.finished.then === "function" ? t.finished : Promise.resolve();
      return fin.then(function () {
        if (transicion === t) {
          transicion = null;
          soltarNombre();
        }
      }, function () {
        if (transicion === t) {
          transicion = null;
          soltarNombre();
        }
      });
    }).catch(function () {});
  }

  function animarCierre(nodo, origen, rect, fin) {
    saltarTransicion();
    despuesDeActualizar().then(function () {
      if (!puedeAnimar()) {
        soltarNombre();
        soltarProxy();
        fin();
        transicion = null;
        return;
      }
      var usaProxy = necesitaProxy(origen, nodo) || !(origen && origen.isConnected);
      ponerNombre(nodo);
      var t;
      var hecho = false;
      function unaVez() {
        if (hecho) return;
        hecho = true;
        if (usaProxy) {
          fin();
          if (rect) ponerProxy(rect);
          else soltarNombre();
        } else {
          fin();
        }
      }
      try {
        t = document.startViewTransition(unaVez);
      } catch (e) {
        soltarNombre();
        soltarProxy();
        unaVez();
        transicion = null;
        return;
      }
      transicion = t;
      var end = t.finished && typeof t.finished.then === "function" ? t.finished : Promise.resolve();
      return end.then(function () {
        if (transicion === t) {
          transicion = null;
          soltarNombre();
          soltarProxy();
        }
      }, function () {
        if (transicion === t) {
          transicion = null;
          soltarNombre();
          soltarProxy();
        }
      });
    }).catch(function () {});
  }

  function cerradoDe(estado) {
    return function () {
      if (estado.ficha && estado.nodo) aplicarCerrarFicha(estado.nodo);
      else aplicarCerrarGenerico();
      var origen = estado.origen;
      if (origen && origen.isConnected && typeof origen.focus === "function") {
        try { origen.focus(); } catch (e) {}
      }
      emitir(false);
    };
  }

  function cerrar(ya) {
    if (!actual) {
      var suelta = document.querySelector(".card.abierta");
      if (suelta) actual = { nodo: suelta, origen: suelta, ficha: true, rect: null };
      else if (caja && caja.classList.contains("abierta")) actual = { nodo: caja, origen: null, ficha: false, rect: null };
      else return;
    }
    var estado = actual;
    var nodo = estado.ficha ? estado.nodo : caja;
    var origen = estado.origen;
    var rect = (origen && origen.isConnected) ? cajaDe(origen) : estado.rect;
    actual = null;
    var fin = cerradoDe(estado);
    if (ya || !puedeAnimar() || !nodo) {
      saltarTransicion();
      soltarNombre();
      soltarProxy();
      fin();
      return;
    }
    animarCierre(nodo, origen, rect, fin);
  }

  function abrir(contenido, origen) {
    if (!contenido) return;
    var ficha = !!(contenido.classList && contenido.classList.contains("card"));
    if (ficha && actual && actual.nodo === contenido && contenido.classList.contains("abierta")) return;
    var rect = cajaDe(origen);
    cerrar(true);
    cerrarDialogosNativos();
    actual = { nodo: contenido, origen: origen || null, ficha: ficha, rect: rect };
    animarApertura(origen, rect, ficha ? contenido : asegurarCaja(), function () {
      if (!actual || actual.nodo !== contenido) return;
      if (ficha) {
        if (!contenido.classList.contains("abierta")) aplicarAbrirFicha(contenido);
      } else aplicarAbrirGenerico(contenido);
      emitir(true);
    });
  }

  function abierto() {
    return !!(actual || document.querySelector(".card.abierta, .panel.abierta"));
  }

  function cardDe(app) {
    if (!app) return null;
    var card = null;
    if (app.id) card = document.querySelector('li.card[data-id="' + escapeCss(app.id) + '"]');
    if (!card && app.slug) card = document.querySelector('li.card[data-app="' + escapeCss(app.slug) + '"]');
    return card;
  }

  function mazApi() {
    return window.PORTAFOLIO_MAZ || null;
  }

  function abrirFicha(card, origen) {
    if (!card) return;
    abrir(card, origen || card);
  }

  function filaPila(app) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "maz-fila";
    var m = mazApi();
    var ic = m && m.icono ? m.icono(app) : null;
    if (ic) b.appendChild(ic);
    b.appendChild(el("span", "", app.nombre));
    if (app.bloqueada) b.appendChild(el("span", "maz-marca", CFG.TEXTOS.BLOQUEADA));
    b.addEventListener("click", function () {
      var card = cardDe(app);
      if (card) abrirFicha(card, b);
    });
    li.appendChild(b);
    return li;
  }

  function abrirPila(nombre, apps, origen) {
    var nodoP = el("div");
    nodoP.setAttribute("data-panel", "pila");
    var h = el("h2", "", nombre || CFG.TEXTOS.PILA);
    h.id = "panel-pila-titulo";
    nodoP.setAttribute("aria-labelledby", h.id);
    nodoP.appendChild(h);
    if (!apps || !apps.length) {
      nodoP.appendChild(el("p", "maz-ayuda", CFG.TEXTOS.VACIO));
    } else {
      var ul = el("ul", "maz-lista");
      for (var i = 0; i < apps.length; i++) ul.appendChild(filaPila(apps[i]));
      nodoP.appendChild(ul);
    }
    abrir(nodoP, origen);
  }

  function insignia(texto) {
    return el("span", "maz-exp", texto);
  }

  function barra(valor, max) {
    var n = CFG.STAT_BARRA_PASOS;
    var on = max > 0 ? Math.max(1, Math.round((valor / max) * n)) : 0;
    var b = el("span", "maz-barra");
    b.setAttribute("aria-hidden", "true");
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      if (i < on) s.className = "maz-barra-on";
      b.appendChild(s);
    }
    return b;
  }

  function textoExp(n) {
    return n + " " + CFG.TEXTOS.EXP;
  }

  function marcarDesborde(ul) {
    function revisar() {
      ul.classList.toggle("maz-mas", ul.scrollTop + ul.clientHeight < ul.scrollHeight - 2);
    }
    ul.addEventListener("scroll", revisar, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(revisar).observe(ul);
    window.requestAnimationFrame(revisar);
  }

  function mostrarLista(cuerpo, stats) {
    cuerpo.replaceChildren();
    if (!stats.length) {
      cuerpo.appendChild(el("p", "maz-ayuda", CFG.TEXTOS.SIN_APORTE));
      return;
    }
    cuerpo.appendChild(el("p", "maz-ayuda", CFG.TEXTOS.TOCA_STAT));
    var ul = el("ul", "maz-stats");
    var max = stats[0].exp;
    stats.forEach(function (st) {
      var li = el("li");
      var b = el("button", "maz-stat");
      b.type = "button";
      b.setAttribute("aria-label", st.nombre + ", " + textoExp(st.exp));
      b.appendChild(el("span", "maz-stat-nombre", st.nombre));
      b.appendChild(insignia(textoExp(st.exp)));
      b.appendChild(barra(st.exp, max));
      b.addEventListener("click", function () { mostrarDesglose(cuerpo, st, stats); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    cuerpo.appendChild(ul);
    marcarDesborde(ul);
  }

  function mostrarDesglose(cuerpo, st, stats) {
    cuerpo.replaceChildren();
    var cab = el("div", "maz-desglose-cab");
    var volver = el("button", "maz-boton maz-volver", "‹ " + CFG.TEXTOS.VOLVER);
    volver.type = "button";
    volver.addEventListener("click", function () { mostrarLista(cuerpo, stats); });
    cab.appendChild(volver);
    var tit = el("p", "maz-desglose-titulo");
    tit.appendChild(el("span", "maz-stat-nombre", st.nombre));
    tit.appendChild(insignia(textoExp(st.exp)));
    cab.appendChild(tit);
    cuerpo.appendChild(cab);
    var ul = el("ul", "maz-stats maz-desglose");
    var m = mazApi();
    st.apps.forEach(function (it) {
      var li = el("li", "maz-aporte");
      var ic = m && m.icono ? m.icono(it.app) : null;
      if (ic) li.appendChild(ic);
      li.appendChild(el("span", "maz-aporte-app", it.app.nombre));
      li.appendChild(el("span", "maz-fuente-tag maz-fuente-" + it.fuente, it.fuente === "uso" ? CFG.TEXTOS.USO : CFG.TEXTOS.CREACION));
      li.appendChild(insignia("+" + it.exp));
      ul.appendChild(li);
    });
    cuerpo.appendChild(ul);
    marcarDesborde(ul);
    volver.focus();
  }

  function abrirTrono(origen) {
    var nodoP = el("div");
    nodoP.setAttribute("data-panel", "trono");
    var cab = el("div", "maz-trono-cab");
    var mini = el("span", "maz-trono-mini");
    mini.setAttribute("aria-hidden", "true");
    mini.style.backgroundImage = "url(\"img/mazmorra/trono.png?v=" + CFG.VERSION + "\")";
    var ht = el("h2", "", CFG.TEXTOS.TRONO);
    ht.id = "panel-trono-titulo";
    cab.appendChild(mini);
    cab.appendChild(ht);
    nodoP.setAttribute("aria-labelledby", ht.id);
    var cuerpo = el("div", "maz-trono-cuerpo");
    nodoP.appendChild(cab);
    nodoP.appendChild(cuerpo);
    var m = mazApi();
    mostrarLista(cuerpo, m && m.stats ? m.stats() : []);
    abrir(nodoP, origen);
  }

  function textoFaltan(n) {
    if (n === 1) return CFG.TEXTOS.FALTA_UNO;
    return CFG.TEXTOS.FALTAN.replace("{n}", String(n));
  }

  function abrirNiveles(origen) {
    var m = mazApi();
    var n = m && m.finalizados ? m.finalizados() : 0;
    var actualNv = m && m.nivel ? m.nivel() : CFG.NIVELES[0];
    var siguiente = null;
    var i;
    for (i = 0; i < CFG.NIVELES.length; i++) {
      if (CFG.NIVELES[i].min > n) { siguiente = CFG.NIVELES[i]; break; }
    }
    var nodoP = el("div");
    nodoP.setAttribute("data-panel", "niveles");
    var titulo = el("h2", "", CFG.TEXTOS.NIVELES);
    titulo.id = "panel-niveles-titulo";
    nodoP.setAttribute("aria-labelledby", titulo.id);
    var lista = el("ul", "maz-niveles");
    for (i = 0; i < CFG.NIVELES.length; i++) {
      var nv = CFG.NIVELES[i];
      var li = el("li", "maz-nivel");
      if (actualNv && nv.id === actualNv.id) li.classList.add("maz-nivel-actual");
      else if (nv.min > n && !(siguiente && nv.id === siguiente.id)) li.classList.add("maz-nivel-cerrado");
      li.appendChild(el("span", "maz-nivel-nombre", nv.nombre));
      if (actualNv && nv.id === actualNv.id) li.appendChild(el("span", "maz-marca", CFG.TEXTOS.ACTUAL));
      else if (siguiente && nv.id === siguiente.id) li.appendChild(el("span", "maz-nivel-falta", textoFaltan(nv.min - n)));
      li.appendChild(el("span", "maz-nivel-cond", nv.min + " " + CFG.TEXTOS.LANZAMIENTOS));
      lista.appendChild(li);
    }
    nodoP.appendChild(titulo);
    nodoP.appendChild(lista);
    abrir(nodoP, origen);
  }

  function abrirAjustes(origen) {
    var nodoP = el("div");
    nodoP.setAttribute("data-panel", "ajustes");
    var h = el("h2", "", CFG.TEXTOS.AJUSTES);
    h.id = "panel-ajustes-titulo";
    nodoP.setAttribute("aria-labelledby", h.id);
    var grupo = el("fieldset", "modo-sel");
    grupo.appendChild(el("legend", "", CFG.TEXTOS.MODO));
    function radio(id, etiqueta) {
      var lab = el("label", "modo-opcion");
      var inp = document.createElement("input");
      inp.type = "radio";
      inp.name = "portafolio-modo";
      inp.value = id;
      if (modoActual === id) inp.checked = true;
      inp.addEventListener("change", function () {
        if (inp.checked) ponerModo(id);
      });
      lab.appendChild(inp);
      lab.appendChild(document.createTextNode(etiqueta));
      return lab;
    }
    grupo.appendChild(radio(CFG.MODO_EJECUTIVO, CFG.TEXTOS.EJECUTIVO));
    grupo.appendChild(radio(CFG.MODO_MAZMORRA, CFG.TEXTOS.MAZMORRA));
    nodoP.appendChild(h);
    nodoP.appendChild(grupo);
    nodoP.appendChild(el("p", "ajuste-ayuda", CFG.TEXTOS.MODO_AYUDA));
    nodoP.appendChild(el("p", "ajuste-version", CFG.TEXTOS.VERSION + " " + CFG.VERSION));
    abrir(nodoP, origen);
  }

  function items() {
    var m = mazApi();
    if (m && typeof m.salas === "function") return m.salas();
    return [];
  }

  function aplicarClaseModo(id) {
    document.documentElement.setAttribute("data-modo", id);
    document.documentElement.classList.toggle("mazmorra", id === CFG.MODO_MAZMORRA);
  }

  function renderActivo() {
    var id;
    for (id in MODOS) {
      if (Object.prototype.hasOwnProperty.call(MODOS, id) && id !== modoActual && MODOS[id].ocultar) {
        try { MODOS[id].ocultar(); } catch (e) {}
      }
    }
    var modo = MODOS[modoActual];
    if (modo && typeof modo.render === "function") modo.render(items(), api);
    if (barraEjec) barraEjec.hidden = modoActual === CFG.MODO_MAZMORRA;
  }

  function ponerModo(id) {
    if (id !== CFG.MODO_MAZMORRA) id = CFG.MODO_EJECUTIVO;
    cerrar(true);
    modoActual = id;
    guardarModo(id);
    aplicarClaseModo(id);
    if (listo) renderActivo();
  }

  function registrar(id, modo) {
    if (!id || !modo) return;
    MODOS[id] = modo;
    if (listo && id === modoActual) renderActivo();
  }

  function alClickPrevio(e) {
    if (!abiertaEn || Date.now() - abiertaEn > GRACIA_MS) return;
    if (!e.target.closest(".card.abierta, .panel.abierta, .velo")) return;
    if (e.target.closest(".cerrar, .panel .modo-opcion, .panel button, .panel input")) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function alTecla(e) {
    if (e.target && e.target.closest && e.target.closest("dialog[open]")) return;
    var viva = panelVivo();
    if (e.key === "Escape") {
      if (!abierto()) return;
      e.preventDefault();
      cerrar();
      return;
    }
    if (e.key === "Tab" && viva) {
      var f = focos(viva);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    }
  }

  function montarAjustes() {
    var acciones = document.querySelector(".hero-acciones");
    if (!acciones || ajustesBtn) return;
    ajustesBtn = el("button", "agregar ajustes", CFG.TEXTOS.AJUSTES);
    ajustesBtn.type = "button";
    ajustesBtn.setAttribute("aria-haspopup", "dialog");
    ajustesBtn.addEventListener("click", function () { abrirAjustes(ajustesBtn); });
    acciones.appendChild(ajustesBtn);
  }

  function montarBarra() {
    if (barraEjec) return;
    var hero = document.querySelector(".hero");
    if (!hero || !hero.parentNode) return;
    barraEjec = el("div", "barra-ejecutivo");
    var trono = el("button", "agregar", CFG.TEXTOS.TRONO);
    trono.type = "button";
    trono.setAttribute("aria-haspopup", "dialog");
    trono.addEventListener("click", function () { abrirTrono(trono); });
    var niv = el("button", "agregar", CFG.TEXTOS.NIVELES);
    niv.type = "button";
    niv.setAttribute("aria-haspopup", "dialog");
    niv.addEventListener("click", function () { abrirNiveles(niv); });
    barraEjec.appendChild(trono);
    barraEjec.appendChild(niv);
    hero.after(barraEjec);
    barraEjec.hidden = modoActual === CFG.MODO_MAZMORRA;
  }

  api = {
    abrir: abrir,
    cerrar: cerrar,
    abierto: abierto,
    abrirFicha: abrirFicha,
    abrirPila: abrirPila,
    abrirTrono: abrirTrono,
    abrirNiveles: abrirNiveles,
    abrirAjustes: abrirAjustes,
    modo: function () { return modoActual; },
    ponerModo: ponerModo,
    registrar: registrar,
    items: items,
    cardDe: cardDe
  };

  function iniciar() {
    velo = el("button", "velo");
    velo.type = "button";
    velo.hidden = true;
    velo.setAttribute("aria-label", CFG.TEXTOS.CERRAR);
    velo.addEventListener("click", function () { cerrar(); });
    document.body.appendChild(velo);
    document.addEventListener("click", alClickPrevio, true);
    document.addEventListener("keydown", alTecla);
    document.addEventListener("portafolio:render", function () {
      saltarTransicion();
      soltarNombre();
      soltarProxy();
      if (actual && actual.ficha) {
        var card = actual.nodo;
        if (card && (card.classList.contains("abierta") || card._hueco)) aplicarCerrarFicha(card);
      } else if (caja && caja.classList.contains("abierta")) aplicarCerrarGenerico();
      actual = null;
      var sueltas = document.querySelectorAll("body > .card");
      for (var i = 0; i < sueltas.length; i++) sueltas[i].remove();
      if (velo) velo.hidden = true;
      liberarFondo();
      emitir(false);
      if (listo) renderActivo();
    });
    window.addEventListener("storage", function (e) {
      if (e.key && e.key !== CFG.CLAVE_MODO && e.key !== CFG.CLAVE_MAZMORRA) return;
      var id = leerModo();
      if (id === modoActual) return;
      cerrar(true);
      modoActual = id;
      aplicarClaseModo(id);
      if (listo) renderActivo();
    });
    montarAjustes();
    montarBarra();
    listo = true;
    renderActivo();
  }

  modoActual = leerModo();
  aplicarClaseModo(modoActual);
  window.PORTAFOLIO = api;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
