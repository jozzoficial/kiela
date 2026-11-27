/**
 * Configuração do ambiente.
 *
 * Tudo o que está neste ficheiro é PÚBLICO (qualquer pessoa vê no navegador). Por isso só entram:
 *   - a URL do projecto Supabase e a chave "publishable" (feita para ser pública;
 *     quem protege os dados são as políticas RLS em database/002_rls_policies.sql);
 *   - a URL do agente no Render.
 * NUNCA ponha aqui a chave secreta do Supabase (sb_secret_..., ou service_role) nem chaves de modelos de IA.
 *
 * Enquanto os valores abaixo tiverem "YOUR-", o site corre em MODO DEMONSTRAÇÃO:
 * não grava nada no Supabase e usa um agente falso.
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.config = K.config || {};

  var SUPABASE_URL = "https://hovrblvtznttfldxdwrs.supabase.co";
  var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cOHUgS-ih0DZEjRM46lpeg_v-Kx9NWn";
  var AGENT_URL = "https://kiealeai-fidel.onrender.com";

  function isSet(value) {
    return Boolean(value) && value.indexOf("YOUR-") === -1;
  }

  K.config.env = Object.freeze({
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: SUPABASE_PUBLISHABLE_KEY,
    AGENT_URL: AGENT_URL.replace(/\/+$/, ""),

    SUPABASE_ENABLED: isSet(SUPABASE_URL) && isSet(SUPABASE_PUBLISHABLE_KEY),
    USE_FAKE_AGENT: !isSet(AGENT_URL),

    // O Render gratuito pode demorar cerca de um minuto a acordar, por isso o limite é generoso.
    AGENT_TIMEOUT_MS: 70000,
    // Passado este tempo, o chat mostra o aviso de "a acordar o assistente".
    LONG_WAIT_NOTICE_MS: 8000,
    MAX_QUESTION_LENGTH: 500,
  });
})(window);
