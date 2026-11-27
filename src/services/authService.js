/**
 * Sessão anónima. O Kiela AI não pede registo: cada visitante recebe uma sessão ANÓNIMA do Supabase
 * (um token por dispositivo). Isso permite que o RLS isole as conversas de cada pessoa e que o
 * agente valide quem lhe fala. Sem Supabase (ou se falhar), o chat continua a funcionar.
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.services = K.services || {};

  var sessionPromise = null;

  function ensureSession() {
    if (!sessionPromise) {
      sessionPromise = K.services.supabaseClient.getClient().then(function (supabase) {
        if (!supabase) return null;
        return supabase.auth
          .getSession()
          .then(function (result) {
            if (result.data.session) return result.data.session;
            return supabase.auth.signInAnonymously().then(function (res) {
              if (res.error) throw res.error;
              return res.data.session;
            });
          })
          .catch(function (error) {
            console.warn("[auth] sem sessão anónima:", error && error.message ? error.message : error);
            return null;
          });
      });
    }
    return sessionPromise;
  }

  /** Token actual (renovado automaticamente pelo Supabase) ou null. */
  function getToken() {
    return K.services.supabaseClient.getClient().then(function (supabase) {
      if (!supabase) return null;
      return ensureSession()
        .then(function () { return supabase.auth.getSession(); })
        .then(function (result) { return result.data.session ? result.data.session.access_token : null; });
    });
  }

  K.services.auth = { ensureSession: ensureSession, getToken: getToken };
})(window);
