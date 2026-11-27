(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.models = K.models || {};

  function Conversation(data) {
    var d = data || {};
    this.id = d.id || K.utils.dom.uuid();
    this.createdAt = d.createdAt || new Date();
  }

  K.models.Conversation = Conversation;
})(window);
