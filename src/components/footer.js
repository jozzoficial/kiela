/** Rodapé com o aviso clínico de urgência, comum às três páginas. */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.components = K.components || {};

  function createFooter() {
    var footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="container site-footer__inner">' +
      '  <div class="urgent-notice">' +
      '    <span class="material-symbols-outlined icon" aria-hidden="true">emergency</span>' +
      "    <div>" +
      '      <p class="urgent-notice__title">Aviso Clínico de Urgência</p>' +
      '      <p class="urgent-notice__text">O Kiela AI não substitui a consulta médica presencial. Em situações de emergência, ' +
      "risco de vida ou trauma, dirija-se imediatamente à unidade de saúde mais próxima ou contacte os serviços de socorro.</p>" +
      "    </div>" +
      "  </div>" +
      '  <div class="site-footer__bottom">' +
      "    <div>" +
      '      <p class="site-footer__title">Kiela AI · Triagem Médica e Orientação Pública</p>' +
      '      <p class="site-footer__text">Informação de saúde em linguagem simples.</p>' +
      "    </div>" +
      '    <span class="badge badge--teal">Angola</span>' +
      "  </div>" +
      "</div>";
    return footer;
  }

  K.components.createFooter = createFooter;
})(window);
