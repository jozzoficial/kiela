/** Pedidos HTTP com tempo limite e erros classificados. */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.utils = K.utils || {};

  /** type: "network" | "timeout" | "rate_limit" | "server" | "auth" */
  function NetworkError(type, message, status) {
    var error = new Error(message);
    error.name = "NetworkError";
    error.type = type;
    error.status = status || null;
    return error;
  }

  /**
   * fetch com tempo limite. Usa AbortController (e não AbortSignal.timeout)
   * por compatibilidade com telemóveis mais antigos.
   */
  function requestJson(url, options) {
    var o = options || {};
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, o.timeoutMs || 30000);
    var headers = { Accept: "application/json" };
    if (o.body) headers["Content-Type"] = "application/json";
    if (o.token) headers.Authorization = "Bearer " + o.token;

    return fetch(url, {
      method: o.method || "GET",
      headers: headers,
      body: o.body ? JSON.stringify(o.body) : undefined,
      signal: controller.signal,
    })
      .then(function (response) {
        if (response.status === 429) throw NetworkError("rate_limit", "Demasiados pedidos", 429);
        if (response.status === 401 || response.status === 403) throw NetworkError("auth", "Acesso recusado", response.status);
        if (!response.ok) throw NetworkError("server", "Resposta " + response.status, response.status);
        return response.json();
      })
      .catch(function (error) {
        if (error && error.name === "NetworkError") throw error;
        if (error && error.name === "AbortError") throw NetworkError("timeout", "Tempo esgotado");
        throw NetworkError("network", "Sem ligação ao servidor");
      })
      .then(
        function (data) { clearTimeout(timer); return data; },
        function (error) { clearTimeout(timer); throw error; }
      );
  }

  K.utils.http = { NetworkError: NetworkError, requestJson: requestJson };
})(window);
