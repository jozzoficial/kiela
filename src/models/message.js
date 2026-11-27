/** Modelo de uma mensagem (da pessoa ou do assistente), com validação do que vem do agente. */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.models = K.models || {};
  var dom = K.utils.dom;

  var ROLE = Object.freeze({ USER: "utilizador", ASSISTANT: "assistente" }); // valores gravados na base de dados

  function Message(data) {
    this.id = data.id || dom.uuid();
    this.role = data.role;
    this.content = data.content;
    this.sources = data.sources || [];
    this.seekCare = Boolean(data.seekCare);
    this.createdAt = data.createdAt || new Date();
  }

  Message.fromUser = function (text) {
    return new Message({ role: ROLE.USER, content: text });
  };

  /** Converte a resposta JSON do agente (ver docs/agent-contract.md). Nunca confia cegamente no que vem de fora. */
  Message.fromAgent = function (json) {
    if (!json) throw new Error("Resposta do agente inválida");
    var content = typeof json.resposta === "string" ? json.resposta :
                  (typeof json.response === "string" ? json.response : "");
    if (!content.trim()) {
      throw new Error("Resposta do agente inválida");
    }
    var sources = (Array.isArray(json.fontes) ? json.fontes : [])
      .filter(function (f) { return f && typeof f.titulo === "string" && f.titulo.trim(); })
      .slice(0, 6)
      .map(function (f) {
        return { titulo: f.titulo.trim().slice(0, 120), url: typeof f.url === "string" ? dom.safeUrl(f.url) : null };
      });

    // Se o agente enviar contagem de fontes RAG mas sem URLs explícitas
    if (!sources.length && typeof json.fontes_rag === "number" && json.fontes_rag > 0) {
      sources.push({
        titulo: json.fontes_rag + " fontes consultadas (Base Epidemiológica)",
        url: null,
      });
    }

    var seekCare = json.procurar_assistencia === true ||
      json.urgencia === "vermelho" ||
      json.urgencia === "laranja" ||
      (Array.isArray(json.red_flags) && json.red_flags.length > 0) ||
      json.rota === "EMERGENCY_RED_FLAG";

    return new Message({
      role: ROLE.ASSISTANT,
      content: content.trim(),
      sources: sources,
      seekCare: seekCare,
    });
  };

  /** Linha da tabela public.mensagens. */
  Message.fromRecord = function (row) {
    return new Message({
      id: row.id,
      role: row.papel,
      content: row.conteudo,
      sources: Array.isArray(row.fontes) ? row.fontes : [],
      seekCare: Boolean(row.procurar_assistencia),
      createdAt: new Date(row.criada_em),
    });
  };

  Message.prototype.toRecord = function (conversationId) {
    return {
      id: this.id,
      conversa_id: conversationId,
      papel: this.role,
      conteudo: this.content,
      fontes: this.sources,
      procurar_assistencia: this.seekCare,
    };
  };

  K.models.Message = Message;
  K.models.ROLE = ROLE;
})(window);
