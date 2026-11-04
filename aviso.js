(function () {
  "use strict";
  var CFG = window.PORTAFOLIO_CONFIG;
  var LECTOR = window.PORTAFOLIO_META;
  if (!CFG || !LECTOR) return;
  var T = CFG.TEXTOS;
  var M = CFG.META;
  var dialogo = null;
  var texto = null;
  var copiar = null;
  var pendiente = "";
  var reloj = 0;

  function el(tag, clase, contenido) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (contenido !== undefined) n.textContent = contenido;
    return n;
  }

  function slugDe(a) {
    var u;
    try { u = new URL(a.href, location.href); } catch (e) { return ""; }
    if (u.origin !== location.origin) return "";
    if (u.pathname === "/app/" || u.pathname === "/app/index.html") return u.searchParams.get("app") || "";
    var partes = u.pathname.split("/").filter(Boolean);
    return partes.length ? partes[0] : "";
  }

  function tarjetaDe(slug) {
    var cards = document.querySelectorAll(".card[data-app]");
    for (var i = 0; i < cards.length; i++) if (cards[i].getAttribute("data-app") === slug) return cards[i];
    return null;
  }

  function nombreDe(card, slug) {
    var h3 = card.querySelector("h3");
    if (!h3) return slug;
    var c = h3.cloneNode(true);
    c.querySelectorAll('[aria-hidden="true"]').forEach(function (n) { n.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim() || slug;
  }

  function lista(items) {
    return items.map(function (n, i) { return i + M.FASE_MIN + " " + n; }).join(", ");
  }

  function estados() {
    return CFG.ESTADOS.map(function (n, i) { return i + M.ESTADO_MIN + " " + n; }).join(", ");
  }

  function prompt(slug, nombre) {
    var ejemplo = {
      v: M.V,
      slug: slug,
      proyecto: {
        fase: M.FASE_DEFECTO,
        fase_estado: M.ESTADO_DEFECTO,
        fases_completadas: 0,
        objetivo: "Qué logra la app, en una frase",
        bloqueada: false,
        aportes: [
          { stat: "Programación", exp: 5, fuente: M.FUENTES[0] },
          { stat: "Diseño visual", exp: 3, fuente: M.FUENTES[0] },
          { stat: "Constancia", exp: 2, fuente: M.FUENTES[1] }
        ]
      }
    };
    var origen = location.origin + "/" + slug + "/";
    return [
      "En la app \"" + nombre + "\" (" + origen + "), haz que cada vez que cargue escriba en localStorage la clave exacta " + CFG.CLAVE_META + slug + " con este JSON:",
      "",
      JSON.stringify(ejemplo, null, 2),
      "",
      "Campos:",
      "- v: siempre " + M.V + ".",
      "- slug: exactamente \"" + slug + "\".",
      "- proyecto.fase: entero de " + M.FASE_MIN + " a " + M.FASE_MAX + ": " + lista(CFG.FASES) + ".",
      "- proyecto.fase_estado: entero de " + M.ESTADO_MIN + " a " + M.ESTADO_MAX + ": " + estados() + ".",
      "- proyecto.fases_completadas: entero de 0 a " + M.FASES_TOTAL + ".",
      "- proyecto.objetivo: una frase de hasta " + M.OBJETIVO_MAX + " caracteres.",
      "- proyecto.bloqueada: true solo si la app está bloqueada; si no, false.",
      "- proyecto.aportes: lista de { stat, exp, fuente }. stat es el nombre visible de una habilidad clara y medible (hasta " + CFG.STAT_NOMBRE_MAX + " caracteres); escríbelo igual en todas las apps que la comparten, porque el portafolio suma la EXP de los nombres idénticos. exp es un entero de " + CFG.EXP_MIN + " a " + CFG.EXP_MAX + ". fuente es \"" + M.FUENTES[0] + "\" (lo que se ejercitó al crear la app) o \"" + M.FUENTES[1] + "\" (lo que ejercita quien la usa).",
      "",
      "Reglas:",
      "- Escribe la clave en el mismo origen (" + location.origin + "), al cargar la app y también en modo demo o sin conexión.",
      "- Usa valores reales de esta app; no copies los del ejemplo.",
      "- Sube la versión de la app y actualiza el README en el mismo cambio.",
      "- Sin comentarios en el código."
    ].join("\n");
  }

  function aviso(mensaje) {
    clearTimeout(reloj);
    copiar.textContent = mensaje;
    reloj = setTimeout(function () { copiar.textContent = T.COPIAR_PROMPT; }, CFG.COPIADO_MS);
  }

  function respaldo(valor) {
    var area = el("textarea", "aviso-meta-copia");
    area.value = valor;
    area.setAttribute("readonly", "");
    dialogo.appendChild(area);
    area.select();
    area.setSelectionRange(0, valor.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    area.remove();
    copiar.focus();
    return ok;
  }

  function alCopiar() {
    var valor = dialogo._prompt || "";
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function" && window.isSecureContext) {
      navigator.clipboard.writeText(valor).then(function () { aviso(T.COPIADO); }, function () {
        aviso(respaldo(valor) ? T.COPIADO : T.NO_COPIADO);
      });
      return;
    }
    aviso(respaldo(valor) ? T.COPIADO : T.NO_COPIADO);
  }

  function cerrar() {
    if (typeof dialogo.close === "function" && dialogo.hasAttribute("open")) dialogo.close();
    else dialogo.removeAttribute("open");
  }

  function crear() {
    dialogo = el("dialog", "hoja aviso-meta");
    dialogo.setAttribute("aria-labelledby", "aviso-meta-titulo");
    dialogo.setAttribute("aria-describedby", "aviso-meta-texto");
    var h = el("h2", "", T.FALTA_TITULO);
    h.id = "aviso-meta-titulo";
    texto = el("p", "aviso-meta-texto");
    texto.id = "aviso-meta-texto";
    var acciones = el("div", "hoja-acciones aviso-meta-acciones");
    var cerrarB = el("button", "sec", T.CERRAR);
    cerrarB.type = "button";
    cerrarB.addEventListener("click", cerrar);
    copiar = el("button", "sec aviso-meta-copiar", T.COPIAR_PROMPT);
    copiar.type = "button";
    copiar.addEventListener("click", alCopiar);
    var listo = el("button", "btn", T.YA_LO_HICE);
    listo.type = "button";
    listo.addEventListener("click", function () {
      var destino = pendiente;
      pendiente = "";
      cerrar();
      if (destino) location.assign(destino);
    });
    acciones.appendChild(cerrarB);
    acciones.appendChild(copiar);
    acciones.appendChild(listo);
    dialogo.appendChild(h);
    dialogo.appendChild(texto);
    dialogo.appendChild(acciones);
    dialogo.addEventListener("click", function (e) { if (e.target === dialogo) cerrar(); });
    dialogo.addEventListener("close", function () {
      clearTimeout(reloj);
      copiar.textContent = T.COPIAR_PROMPT;
      if (dialogo._volver && dialogo._volver.isConnected && dialogo._volver.focus) dialogo._volver.focus();
    });
    document.body.appendChild(dialogo);
  }

  function abrir(slug, card, href, disparador) {
    if (!dialogo) crear();
    var nombre = nombreDe(card, slug);
    var pixel = document.documentElement.classList.contains("mazmorra");
    dialogo.classList.toggle("maz-dialog", pixel);
    dialogo.classList.toggle("maz-pixel", pixel);
    texto.textContent = T.FALTA_TEXTO.replace("{nombre}", nombre);
    dialogo._prompt = prompt(slug, nombre);
    dialogo._volver = disparador;
    pendiente = href;
    if (typeof dialogo.showModal === "function") dialogo.showModal();
    else dialogo.setAttribute("open", "");
    copiar.focus();
  }

  window.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || (dialogo && dialogo.contains(a))) return;
    var slug = slugDe(a);
    if (!LECTOR.slugValido(slug)) return;
    var card = tarjetaDe(slug);
    if (!card || LECTOR.leer(slug)) return;
    e.preventDefault();
    abrir(slug, card, a.href, a);
  });
})();
