/**
 * Utilitários de DOM.
 * Todo o texto entra por textContent (nunca innerHTML), por isso conteúdo vindo do agente ou
 * da pessoa não consegue injectar HTML/JS (XSS).
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.utils = K.utils || {};

  /** Cria um elemento. props: className, text, dataset, onClick, e qualquer atributo. */
  function el(tag, props) {
    var node = document.createElement(tag);
    var p = props || {};
    Object.keys(p).forEach(function (key) {
      var value = p[key];
      if (value === undefined || value === null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "onClick") node.addEventListener("click", value);
      else if (key === "dataset") Object.keys(value).forEach(function (k) { node.dataset[k] = value[k]; });
      else node.setAttribute(key, value === true ? "" : value);
    });
    for (var i = 2; i < arguments.length; i++) append(node, arguments[i]);
    return node;
  }

  function append(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) child.forEach(function (c) { append(node, c); });
    else node.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  /** Ícone Material Symbols. O nome tem de estar na lista de ícones carregada em cada página. */
  function icon(name, modifiers) {
    return el("span", {
      className: "material-symbols-outlined icon " + (modifiers || ""),
      "aria-hidden": "true",
      text: name,
    });
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function formatTime(date) {
    var d = date || new Date();
    var h = String(d.getHours()).padStart(2, "0");
    var m = String(d.getMinutes()).padStart(2, "0");
    return h + ":" + m;
  }

  function uuid() {
    if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    // reserva para navegadores antigos
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /** Só aceita ligações http(s): impede URLs "javascript:" vindas de fontes externas. */
  function safeUrl(url) {
    try {
      var u = new URL(url);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Caminho até à raiz do projecto. As páginas dentro de pages/ declaram data-base="../" no <body>.
   * Assim os links funcionam ao abrir os ficheiros directamente (file://) e também no servidor.
   */
  function url(pathFromRoot) {
    var base = (document.body && document.body.dataset.base) || "";
    return base + pathFromRoot;
  }

  K.utils.dom = { el: el, icon: icon, clear: clear, formatTime: formatTime, uuid: uuid, safeUrl: safeUrl, url: url };
})(window);
