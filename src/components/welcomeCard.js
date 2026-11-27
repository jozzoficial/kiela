/** Cartão de boas-vindas com perguntas sugeridas. */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.components = K.components || {};
  var d = K.utils.dom;

  /** options: { questions: string[], onPick(question) } */
  K.components.createWelcomeCard = function (options) {
    var buttons = options.questions.map(function (q) {
      return d.el("button", { type: "button", className: "suggestion", onClick: function () { options.onPick(q); } },
        d.el("span", { text: q }), d.icon("arrow_forward", "icon--md"));
    });

    return d.el("div", { className: "welcome" },
      d.el("div", { className: "welcome__head" },
        d.el("div", { className: "icon-tile icon-tile--solid" }, d.icon("health_and_safety", "icon--lg")),
        d.el("div", {},
          d.el("div", { className: "welcome__title-row" },
            d.el("span", { className: "welcome__name", text: "Kiela AI" }),
            d.el("span", { className: "welcome__tag", text: "Triagem" })
          ),
          d.el("p", { className: "welcome__text", text: "Olá, sou o Kiela AI. Em que posso ajudar hoje com dúvidas sobre saúde ou epidemias?" })
        )
      ),
      d.el("div", { className: "welcome__note" }, d.icon("info", "icon--md"),
        d.el("p", {}, "Serviço automatizado baseado em recomendações de saúde pública da ",
          d.el("strong", { text: "OMS" }), " e do ", d.el("strong", { text: "Ministério da Saúde de Angola" }), ".")),
      d.el("div", {},
        d.el("span", { className: "welcome__label", text: "Perguntas frequentes:" }),
        d.el("div", { className: "suggestions" }, buttons))
    );
  };
})(window);
