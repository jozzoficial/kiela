/** Aviso laranja: o agente indicou que a pessoa deve procurar uma unidade de saúde. */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.components = K.components || {};
  var d = K.utils.dom;

  K.components.createAssistanceCard = function () {
    return d.el("div", { className: "alert alert--warning fade-in", role: "alert" },
      d.el("div", { className: "alert__icon" }, d.icon("warning", "icon--lg")),
      d.el("div", { className: "alert__body" },
        d.el("div", { className: "alert__head" },
          d.el("span", { className: "alert__title", text: "Atenção Médica Recomendada" }),
          d.el("span", { className: "alert__tag", text: "Procure ajuda" })
        ),
        d.el("p", { className: "alert__text",
          text: "Pelo que descreveu, procure assistência médica na unidade de saúde mais próxima para avaliação e tratamento adequados." }),
        d.el("a", { className: "btn alert__action", href: "tel:" + K.config.contacts.emergencyPhone },
          d.icon("call", "icon--sm"), d.el("span", { text: "Ligar para a emergência" }))
      )
    );
  };
})(window);
