/** "Kiela AI a escrever a resposta..." com três pontos a saltar. */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.components = K.components || {};
  var d = K.utils.dom;

  K.components.createTypingIndicator = function () {
    return d.el("div", { className: "typing", role: "status" },
      d.el("div", { className: "msg__avatar" }, d.icon("smart_toy", "icon--md")),
      d.el("div", { className: "typing__bubble" },
        d.el("div", { className: "typing__dots", "aria-hidden": "true" }, d.el("span"), d.el("span"), d.el("span")),
        d.el("span", { className: "typing__text", text: "Kiela AI a escrever a resposta..." })
      )
    );
  };
})(window);
