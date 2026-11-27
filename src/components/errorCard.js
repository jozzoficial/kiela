/** Cartão vermelho de erro, com botão para tentar outra vez. */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.components = K.components || {};
  var d = K.utils.dom;

  /** options: { title, message, icon, onRetry } */
  K.components.createErrorCard = function (options) {
    return d.el("div", { className: "alert alert--error fade-in", role: "alert" },
      d.el("div", { className: "alert__icon" }, d.icon(options.icon || "wifi_off", "icon--md")),
      d.el("div", { className: "alert__body" },
        d.el("span", { className: "alert__title", text: options.title }),
        d.el("p", { className: "alert__text", text: options.message })
      ),
      options.onRetry
        ? d.el("button", { type: "button", className: "btn alert__action", onClick: options.onRetry },
            d.icon("sync", "icon--sm"), d.el("span", { text: "Tentar de novo" }))
        : null
    );
  };
})(window);
