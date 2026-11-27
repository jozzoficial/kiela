/**
 * Controlador do chat: liga a página (HTML), os serviços (agente, Supabase) e os componentes.
 */
(function (global) {
  "use strict";
  var K = global.Kiela;
  var env = K.config.env;
  var d = K.utils.dom;
  var C = K.components;
  var S = K.services;
  var ROLE = K.models.ROLE;

  K.utils.page.prepare("chat");

  var list = document.getElementById("message-list");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("question-input");
  var sendButton = document.getElementById("send-button");
  var newChatButton = document.getElementById("new-chat-button");
  var statusPill = document.getElementById("agent-status");
  var statusText = document.getElementById("agent-status-text");

  var STATUS_TEXT = {
    demo: "Modo de demonstração",
    connecting: "A ligar ao assistente...",
    ready: "Kiela AI Activo",
    unavailable: "Assistente indisponível",
  };

  var ERROR_INFO = {
    network: { title: "Falha de conectividade", message: "Não foi possível obter resposta devido à ligação. Tente novamente.", icon: "wifi_off" },
    timeout: { title: "O assistente demorou a responder", message: "O servidor não respondeu a tempo. Tente de novo dentro de instantes.", icon: "hourglass_top" },
    rate_limit: { title: "Muitas perguntas seguidas", message: "Aguarde um pouco antes de fazer outra pergunta.", icon: "hourglass_top" },
    auth: { title: "Sessão inválida", message: "Recarregue a página e tente de novo.", icon: "error" },
    server: { title: "O assistente não conseguiu responder", message: "Ocorreu um problema no servidor. Tente de novo.", icon: "error" },
  };

  var state = {
    conversation: null,
    busy: false,
    hasMessages: false,
    saveQueue: Promise.resolve(),
  };

  // ---------- ecrã ----------

  function readStorage(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }
  function writeStorage(storage, key, value) {
    try { value === null ? storage.removeItem(key) : storage.setItem(key, value); } catch (e) { /* sem armazenamento */ }
  }

  function append(node) {
    list.appendChild(node);
    var reduce = global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
    return node;
  }

  function setStatus(name) {
    statusPill.dataset.state = name;
    statusText.textContent = STATUS_TEXT[name];
  }

  function refreshControls() {
    sendButton.disabled = state.busy;
    newChatButton.disabled = state.busy;
    form.setAttribute("aria-busy", String(state.busy));
  }

  function showWelcome() {
    d.clear(list);
    state.hasMessages = false;
    list.appendChild(C.createWelcomeCard({ questions: K.config.suggestedQuestions, onPick: send }));
  }

  /** Guarda as mensagens uma a uma, pela ordem certa. Nunca rejeita. */
  function saveInOrder(message) {
    var conversationId = state.conversation.id;
    var task = state.saveQueue
      .then(function () { return S.conversations.saveMessage(conversationId, message); })
      .catch(function () { return false; });
    state.saveQueue = task;
    return task;
  }

  function renderAssistant(message, saving) {
    var onRate = saving
      ? function (helpful) {
          // o voto só pode ser gravado depois de a mensagem existir na base de dados
          return saving.then(function () { return S.feedback.send(message.id, helpful); });
        }
      : null;
    append(C.createAssistantBubble(message, { onRate: onRate }));
    if (message.seekCare) append(C.createAssistanceCard());
  }

  // ---------- fluxo principal ----------

  function ensureConversation() {
    if (state.conversation) return Promise.resolve();
    return S.conversations.createConversation().then(function (conversation) {
      state.conversation = conversation;
      writeStorage(localStorage, K.config.storageKeys.currentConversation, conversation.id);
    });
  }

  async function send(text) {
    text = String(text).trim().slice(0, env.MAX_QUESTION_LENGTH);
    if (!text || state.busy) return;

    state.busy = true;
    refreshControls();
    if (!state.hasMessages) {
      d.clear(list); // primeira pergunta: troca o cartão de boas-vindas pela conversa
      state.hasMessages = true;
    }
    input.value = "";

    var question = K.models.Message.fromUser(text);
    append(C.createUserBubble(question));
    await ensureConversation();
    saveInOrder(question);
    await answer(text);
  }

  async function answer(text) {
    state.busy = true;
    refreshControls();

    var typing = append(C.createTypingIndicator());
    var waitCard = null;
    var timer = setTimeout(function () { waitCard = append(C.createWaitCard()); }, env.LONG_WAIT_NOTICE_MS);

    try {
      var reply = await S.agent.ask(text, state.conversation.id);
      renderAssistant(reply, saveInOrder(reply));
    } catch (error) {
      var info = ERROR_INFO[error && error.type] || ERROR_INFO.server;
      var card = append(C.createErrorCard({
        title: info.title, message: info.message, icon: info.icon,
        onRetry: function () { card.remove(); answer(text); },
      }));
    } finally {
      clearTimeout(timer);
      typing.remove();
      if (waitCard) waitCard.remove();
      state.busy = false;
      refreshControls();
      input.focus({ preventScroll: true });
    }
  }

  function newConversation() {
    if (state.busy) return;
    state.conversation = null;
    writeStorage(localStorage, K.config.storageKeys.currentConversation, null);
    showWelcome();
    input.value = "";
    input.focus();
    global.scrollTo(0, 0);
  }

  /** Retoma a conversa anterior (só com Supabase activo). */
  async function resumeConversation() {
    var id = readStorage(localStorage, K.config.storageKeys.currentConversation);
    if (!id || !env.SUPABASE_ENABLED) return false;
    var messages = await S.conversations.loadMessages(id);
    if (!messages.length) return false;
    state.conversation = new K.models.Conversation({ id: id });
    d.clear(list);
    state.hasMessages = true;
    messages.forEach(function (m) {
      if (m.role === ROLE.USER) append(C.createUserBubble(m));
      else renderAssistant(m, null);
    });
    return true;
  }

  /** Pergunta que veio da página inicial (pages/chat.html?q=...). */
  function takeInitialQuestion() {
    var q = null;
    try { q = new URLSearchParams(global.location.search).get("q"); } catch (e) { return null; }
    if (q) {
      try { global.history.replaceState(null, "", global.location.pathname); } catch (e) { /* file:// pode recusar */ }
    }
    return q;
  }

  // ---------- arranque ----------

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    send(input.value);
  });
  newChatButton.addEventListener("click", newConversation);
  input.maxLength = env.MAX_QUESTION_LENGTH;

  async function init() {
    var initialQuestion = takeInitialQuestion();
    showWelcome();
    setStatus(env.USE_FAKE_AGENT ? "demo" : "connecting");

    // Em paralelo: acorda o agente (Render) e prepara a sessão anónima.
    if (!env.USE_FAKE_AGENT) S.agent.checkHealth().then(setStatus);
    await S.auth.ensureSession();
    await resumeConversation();

    if (initialQuestion) send(initialQuestion);
  }
  init();
})(window);
