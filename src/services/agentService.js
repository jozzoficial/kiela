/**
 * Fala com o agente (FastAPI no Render). Contrato completo em docs/agent-contract.md.
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.services = K.services || {};
  var env = K.config.env;
  var http = K.utils.http;

  /** Envia uma pergunta e devolve uma Promise com a Message de resposta. */
  function ask(text, conversationId) {
    if (env.USE_FAKE_AGENT) return K.services.fakeAgent.answer(text);

    return K.services.auth.getToken().then(function (token) {
      var sessionId = conversationId && conversationId.length >= 8
        ? conversationId
        : (K.utils.dom.uuid ? K.utils.dom.uuid() : "sess-" + Date.now());

      return http
        .requestJson(env.AGENT_URL + "/api/v1/triagem", {
          method: "POST",
          body: {
            pergunta: text,
            session_id: sessionId,
            mensagem: text,
            conversa_id: sessionId,
          },
          token: token,
          timeoutMs: env.AGENT_TIMEOUT_MS,
        })
        .then(function (json) {
          try {
            return K.models.Message.fromAgent(json);
          } catch (e) {
            throw http.NetworkError("server", "Resposta do agente inválida");
          }
        });
    });
  }

  /**
   * Pergunta ao agente se está de pé. Serve também para "acordar" o Render quando a página abre,
   * para a primeira pergunta ser mais rápida. Resolve "ready" ou "unavailable".
   */
  function checkHealth() {
    if (env.USE_FAKE_AGENT) return Promise.resolve("ready");
    return http
      .requestJson(env.AGENT_URL + "/health", { timeoutMs: env.AGENT_TIMEOUT_MS })
      .catch(function () {
        return http.requestJson(env.AGENT_URL + "/saude", { timeoutMs: env.AGENT_TIMEOUT_MS });
      })
      .then(function () { return "ready"; }, function () { return "unavailable"; });
  }

  K.services.agent = { ask: ask, checkHealth: checkHealth };
})(window);
