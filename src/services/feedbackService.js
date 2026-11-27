/**
 * Regista se uma resposta foi útil. Alimenta a avaliação da eficácia do agente.
 * Cada pessoa tem um voto por mensagem (o último prevalece).
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.services = K.services || {};

  /** Resolve true se ficou gravado. */
  function send(messageId, helpful) {
    return K.services.supabaseClient
      .getClient()
      .then(function (supabase) {
        if (!supabase || !messageId) return false;
        return K.services.auth.ensureSession().then(function (session) {
          if (!session) return false;
          return supabase
            .from("feedback")
            .upsert({ mensagem_id: messageId, util: helpful }, { onConflict: "mensagem_id,utilizador_id" })
            .then(function (res) {
              if (res.error) {
                console.warn("[feedback] não foi possível guardar:", res.error.message);
                return false;
              }
              return true;
            });
        });
      })
      .catch(function () { return false; });
  }

  K.services.feedback = { send: send };
})(window);
