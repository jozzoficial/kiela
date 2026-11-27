/**
 * Contactos, perguntas sugeridas e chaves de armazenamento.
 * IMPORTANTE: confirme os números antes de publicar.
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.config = K.config || {};

  K.config.contacts = Object.freeze({
    // Número usado nos botões de emergência. CONFIRMAR.
    emergencyPhone: "112",
    // Linha de saúde pública. Deixe vazio para não aparecer no cabeçalho. CONFIRMAR.
    healthLinePhone: "",
  });

  K.config.suggestedQuestions = Object.freeze([
    "Quais os sintomas de malária?",
    "Como me proteger da cólera?",
    "O que fazer se tiver vómitos e diarreia?",
    "Quando devo procurar uma unidade de saúde?",
  ]);

  K.config.storageKeys = Object.freeze({
    currentConversation: "kiela_conversation_id", // localStorage
  });
})(window);
