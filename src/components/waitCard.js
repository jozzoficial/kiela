/** Aparece quando a resposta demora (rede lenta ou servidor a acordar). */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.components = K.components || {};
  var d = K.utils.dom;

  K.components.createWaitCard = function () {
    return d.el("div", { className: "alert alert--wait", role: "status" },
      d.el("div", { className: "alert__icon" }, d.icon("hourglass_top", "icon--md spin")),
      d.el("div", { className: "alert__body" },
        d.el("span", { className: "alert__title", text: "A demorar mais do que o normal" }),
        d.el("p", { className: "alert__text",
          text: "A acordar o assistente. Isto pode demorar até um minuto na primeira pergunta, sobretudo com ligação lenta. Por favor, aguarde um momento." })
      )
    );
  };
})(window);
