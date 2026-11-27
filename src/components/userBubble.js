/** Mensagem da pessoa (à direita, cor principal). */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.components = K.components || {};
  var d = K.utils.dom;

  K.components.createUserBubble = function (message) {
    return d.el("div", { className: "msg msg--user fade-in" },
      d.el("div", { className: "msg__bubble" },
        d.el("span", { className: "msg__label", text: "Você" }),
        d.el("p", { className: "msg__text", text: message.content }),
        d.el("div", { className: "msg__meta" },
          d.el("span", { text: d.formatTime(message.createdAt) }),
          d.icon("done", "icon--sm")
        )
      )
    );
  };
})(window);
