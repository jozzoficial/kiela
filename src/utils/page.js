/**
 * Preparação comum às páginas: monta cabeçalho e rodapé e preenche os números de emergência
 * a partir de um só sítio (config/contacts.js).
 * @param {"home"|"chat"|"about"} active
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.utils = K.utils || {};

  function prepare(active) {
    var header = document.getElementById("site-header");
    if (header) header.replaceWith(K.components.createHeader(active));
    var footer = document.getElementById("site-footer");
    if (footer) footer.replaceWith(K.components.createFooter());

    var phone = K.config.contacts.emergencyPhone;
    Array.prototype.forEach.call(document.querySelectorAll("[data-emergency-call]"), function (a) {
      a.href = "tel:" + phone;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-emergency-number]"), function (s) {
      s.textContent = phone;
    });
  }

  K.utils.page = { prepare: prepare };
})(window);
