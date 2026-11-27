/** Resposta do assistente (à esquerda), com fontes e botões de feedback. */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.components = K.components || {};
  var d = K.utils.dom;

  function createSources(sources) {
    var chips = sources.map(function (s) {
      if (s.url) {
        return d.el("a", { className: "chip", href: s.url, target: "_blank", rel: "noopener noreferrer" },
          d.icon("open_in_new", "icon--sm"), d.el("span", { text: s.titulo }));
      }
      return d.el("span", { className: "chip" }, d.el("span", { text: s.titulo }));
    });
    return d.el("div", { className: "sources" },
      d.el("span", { className: "sources__title" }, d.icon("library_books", "icon--sm"), "Fontes consultadas:"),
      d.el("div", { className: "sources__list" }, chips)
    );
  }

  function createFeedback(onRate) {
    var actions = d.el("div", { className: "feedback__actions" });

    function button(helpful, iconName, label, extraClass) {
      return d.el("button", {
        type: "button",
        className: "feedback__button " + extraClass,
        onClick: function () {
          Array.prototype.forEach.call(actions.querySelectorAll("button"), function (b) { b.disabled = true; });
          Promise.resolve(onRate(helpful)).then(function () {
            d.clear(actions);
            actions.appendChild(
              d.el("div", { className: "feedback__thanks", role: "status" },
                d.icon("check_circle", "icon--sm"), d.el("span", { text: "Obrigado pelo seu feedback" }))
            );
          });
        },
      }, d.icon(iconName, "icon--md"), d.el("span", { text: label }));
    }

    actions.appendChild(button(true, "thumb_up", "Foi útil", ""));
    actions.appendChild(button(false, "thumb_down", "Não foi útil", "feedback__button--no"));
    return d.el("div", { className: "feedback" },
      d.el("span", { className: "feedback__label", text: "Esta orientação foi útil?" }), actions);
  }

  /** options.onRate(helpful): se não vier, não mostra os botões de feedback. */
  K.components.createAssistantBubble = function (message, options) {
    var onRate = options && options.onRate;
    return d.el("div", { className: "msg msg--assistant fade-in" },
      d.el("div", { className: "msg__avatar" }, d.icon("medical_services", "icon--md")),
      d.el("div", { className: "msg__bubble" },
        d.el("div", { className: "msg__header" },
          d.el("span", { className: "msg__name", text: "Kiela AI" }),
          d.el("span", { className: "msg__time", text: d.formatTime(message.createdAt) })
        ),
        d.el("p", { className: "msg__text", text: message.content }),
        message.sources.length ? createSources(message.sources) : null,
        onRate ? createFeedback(onRate) : null
      )
    );
  };
})(window);
