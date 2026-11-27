/** Conversas e mensagens no Supabase. Falhar a gravar nunca deve estragar o chat. */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.services = K.services || {};

  /** Devolve { supabase, session } ou null (modo demonstração / sem sessão). */
  function context() {
    return K.services.supabaseClient.getClient().then(function (supabase) {
      if (!supabase) return null;
      return K.services.auth.ensureSession().then(function (session) {
        return session ? { supabase: supabase, session: session } : null;
      });
    });
  }

  /** Cria uma conversa. No modo demonstração fica só em memória. */
  function createConversation() {
    return context().then(function (ctx) {
      if (!ctx) return new K.models.Conversation();
      return ctx.supabase
        .from("conversas")
        .insert({})
        .select("id, criada_em")
        .single()
        .then(function (res) {
          if (res.error) {
            console.warn("[conversa] não foi possível guardar:", res.error.message);
            return new K.models.Conversation();
          }
          return new K.models.Conversation({ id: res.data.id, createdAt: new Date(res.data.criada_em) });
        });
    });
  }

  function saveMessage(conversationId, message) {
    return context()
      .then(function (ctx) {
        if (!ctx) return false;
        return ctx.supabase.from("mensagens").insert(message.toRecord(conversationId)).then(function (res) {
          if (res.error) {
            console.warn("[mensagem] não foi possível guardar:", res.error.message);
            return false;
          }
          return true;
        });
      })
      .catch(function () { return false; });
  }

  /** Carrega as mensagens de uma conversa (para retomar depois de recarregar a página). */
  function loadMessages(conversationId) {
    return context()
      .then(function (ctx) {
        if (!ctx) return [];
        return ctx.supabase
          .from("mensagens")
          .select("id, papel, conteudo, fontes, procurar_assistencia, criada_em")
          .eq("conversa_id", conversationId)
          .order("criada_em", { ascending: true })
          .limit(100)
          .then(function (res) {
            if (res.error) {
              console.warn("[mensagens] não foi possível carregar:", res.error.message);
              return [];
            }
            return res.data.map(K.models.Message.fromRecord);
          });
      })
      .catch(function () { return []; });
  }

  K.services.conversations = { createConversation: createConversation, saveMessage: saveMessage, loadMessages: loadMessages };
})(window);
