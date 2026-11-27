/**
 * Agente de DEMONSTRAÇÃO, usado enquanto AGENT_URL não estiver configurado.
 * As respostas são genéricas de propósito e vêm marcadas como demonstração: não são orientação médica.
 *
 * Truques para testar os estados do ecrã:
 *   escreva "#lento"  -> demora 12 s (mostra o aviso de espera longa)
 *   escreva "#erro"   -> falha de rede (mostra o cartão de erro com "Tentar de novo")
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.services = K.services || {};

  var ALERT_SIGNS = /febre|sangue|sangra|convuls|desidrata|vómit|vomit|diarre|falta de ar/i;

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function answer(text) {
    var lower = text.toLowerCase();
    return sleep(lower.indexOf("#lento") !== -1 ? 12000 : 1200).then(function () {
      if (lower.indexOf("#erro") !== -1) throw K.utils.http.NetworkError("network", "Falha simulada");
      return new K.models.Message({
        role: K.models.ROLE.ASSISTANT,
        content:
          "[Resposta de demonstração] O agente real ainda não está ligado. " +
          "Quando estiver, esta resposta virá do assistente com base em fontes de saúde oficiais. " +
          "Por agora, serve para testar o aspecto e o funcionamento do chat.",
        sources: [{ titulo: "Organização Mundial da Saúde", url: "https://www.who.int" }],
        seekCare: ALERT_SIGNS.test(text),
      });
    });
  }

  K.services.fakeAgent = { answer: answer };
})(window);
