/**
 * Cliente Supabase (único e reutilizado).
 * A biblioteca é carregada do CDN por <script> só quando o Supabase está configurado,
 * para o modo demonstração não gastar dados. Versão fixa de propósito.
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.services = K.services || {};
  var env = K.config.env;

  var LIB_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js";
  var clientPromise = null;

  function loadLibrary() {
    if (global.supabase && global.supabase.createClient) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = LIB_URL;
      script.onload = resolve;
      script.onerror = function () { reject(new Error("não foi possível carregar o Supabase")); };
      document.head.appendChild(script);
    });
  }

  /** Devolve uma Promise com o cliente, ou null no modo demonstração / se falhar. */
  function getClient() {
    if (!env.SUPABASE_ENABLED) return Promise.resolve(null);
    if (!clientPromise) {
      clientPromise = loadLibrary()
        .then(function () {
          return global.supabase.createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
            auth: { persistSession: true, autoRefreshToken: true },
          });
        })
        .catch(function (error) {
          console.error("[supabase]", error);
          return null;
        });
    }
    return clientPromise;
  }

  K.services.supabaseClient = { getClient: getClient };
})(window);
