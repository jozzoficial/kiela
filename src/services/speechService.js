/**
 * Serviço de Leitura em Voz Alta (Text-to-Speech nativo via Web Speech API).
 * Permite que cidadãos ouçam as orientações do assistente em português sem necessidade de servidor externo.
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.services = K.services || {};

  var currentId = null;
  var currentCallback = null;

  function isSupported() {
    return Boolean(
      global.speechSynthesis &&
      global.SpeechSynthesisUtterance &&
      typeof global.speechSynthesis.speak === "function"
    );
  }

  /**
   * Converte o texto Markdown em texto fonético limpo para leitura fluida:
   * remove caracteres estruturais (#, *, |, ---, URLs) e pontua devidamente as pausas.
   */
  function cleanForSpeech(raw) {
    if (!raw) return "";
    return String(raw)
      // Substitui links mantendo apenas o texto visível: [texto](url) -> texto
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Substitui tags HTML (<br>, etc.) por pausas
      .replace(/<br\s*\/?>/gi, ". ")
      .replace(/<[^>]+>/g, " ")
      // Tabelas: remove linhas delimitadoras (|---|---|)
      .replace(/^\|?\s*:?-{2,}:?\s*(\|\s*:?-+:?\s*)+\|?$/gm, "")
      // Tabelas: substitui barras divisórias por pausas
      .replace(/\|/g, ", ")
      // Remove marcadores de cabeçalhos (# até ######)
      .replace(/^#{1,6}\s*/gm, "")
      // Substitui marcadores de lista por pequenas pausas
      .replace(/^(\s*)[-*+•]\s+/gm, "")
      .replace(/^(\s*)\d+\.\s+/gm, "")
      // Remove separadores horizontais (---)
      .replace(/^(?:---|___|\*\*\*)$/gm, "")
      // Remove negrito e itálico (* e _)
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      // Normaliza espaços e pontuação para pausas naturais
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n/g, ". ")
      .replace(/\n/g, ". ")
      .replace(/\.{2,}/g, ".")
      .replace(/\s+,/g, ",")
      .replace(/,\s*,/g, ",")
      .trim();
  }

  function getPortugueseVoice() {
    if (!isSupported()) return null;
    var voices = global.speechSynthesis.getVoices() || [];
    // Prioridade: vozes em português de Portugal / Angola, depois qualquer voz em português
    return (
      voices.find(function (v) { return v.lang === "pt-PT" || v.lang === "pt-AO"; }) ||
      voices.find(function (v) { return v.lang && v.lang.toLowerCase().indexOf("pt") === 0; }) ||
      null
    );
  }

  function stop() {
    if (isSupported()) {
      try {
        global.speechSynthesis.cancel();
      } catch (e) {
        /* silencia falhas de cancelamento */
      }
    }
    if (typeof currentCallback === "function") {
      currentCallback(false);
    }
    currentId = null;
    currentCallback = null;
  }

  /**
   * Lê o texto em voz alta.
   * Se a mesma mensagem já estiver a tocar, pausa/cancela (toggle).
   * @param {string} id - Identificador único da mensagem.
   * @param {string} text - Conteúdo original da mensagem (Markdown).
   * @param {function(boolean):void} onStateChange - Notificado com true (início) ou false (fim/paragem).
   */
  function speak(id, text, onStateChange) {
    if (!isSupported()) return;

    // Se já estiver a ler esta mesma mensagem, para
    if (currentId === id) {
      stop();
      return;
    }

    // Se outra mensagem estava a tocar, interrompe-a primeiro
    stop();

    var clean = cleanForSpeech(text);
    if (!clean) return;

    var utterance = new global.SpeechSynthesisUtterance(clean);
    var voice = getPortugueseVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "pt-PT";
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = function () {
      currentId = id;
      currentCallback = onStateChange;
      if (typeof onStateChange === "function") onStateChange(true);
    };

    utterance.onend = function () {
      if (currentId === id) {
        currentId = null;
        currentCallback = null;
        if (typeof onStateChange === "function") onStateChange(false);
      }
    };

    utterance.onerror = function () {
      if (currentId === id) {
        currentId = null;
        currentCallback = null;
        if (typeof onStateChange === "function") onStateChange(false);
      }
    };

    try {
      global.speechSynthesis.speak(utterance);
    } catch (e) {
      stop();
    }
  }

  function isSpeaking(id) {
    return isSupported() && global.speechSynthesis.speaking && currentId === id;
  }

  K.services.speech = {
    isSupported: isSupported,
    cleanForSpeech: cleanForSpeech,
    speak: speak,
    stop: stop,
    isSpeaking: isSpeaking,
  };
})(window);
