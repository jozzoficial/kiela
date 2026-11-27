/**
 * Utilitários de DOM.
 * Todo o texto entra por textContent (nunca innerHTML), por isso conteúdo vindo do agente ou
 * da pessoa não consegue injectar HTML/JS (XSS).
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.utils = K.utils || {};

  /** Cria um elemento. props: className, text, dataset, onClick, e qualquer atributo. */
  function el(tag, props) {
    var node = document.createElement(tag);
    var p = props || {};
    Object.keys(p).forEach(function (key) {
      var value = p[key];
      if (value === undefined || value === null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "onClick") node.addEventListener("click", value);
      else if (key === "dataset") Object.keys(value).forEach(function (k) { node.dataset[k] = value[k]; });
      else node.setAttribute(key, value === true ? "" : value);
    });
    for (var i = 2; i < arguments.length; i++) append(node, arguments[i]);
    return node;
  }

  function append(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) child.forEach(function (c) { append(node, c); });
    else node.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  /** Ícone Material Symbols. O nome tem de estar na lista de ícones carregada em cada página. */
  function icon(name, modifiers) {
    return el("span", {
      className: "material-symbols-outlined icon " + (modifiers || ""),
      "aria-hidden": "true",
      text: name,
    });
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function formatTime(date) {
    var d = date || new Date();
    var h = String(d.getHours()).padStart(2, "0");
    var m = String(d.getMinutes()).padStart(2, "0");
    return h + ":" + m;
  }

  function uuid() {
    if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    // reserva para navegadores antigos
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /** Só aceita ligações http(s): impede URLs "javascript:" vindas de fontes externas. */
  function safeUrl(url) {
    try {
      var u = new URL(url);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Caminho até à raiz do projecto. As páginas dentro de pages/ declaram data-base="../" no <body>.
   * Assim os links funcionam ao abrir os ficheiros directamente (file://) e também no servidor.
   */
  function url(pathFromRoot) {
    var base = (document.body && document.body.dataset.base) || "";
    return base + pathFromRoot;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function inlineMarkdown(escaped) {
    return escaped
      // Converte quebras de linha explicitas enviadas pelo modelo (muito usadas dentro de tabelas)
      .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
      // Converte tags simples de formatação
      .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, "<strong>$1</strong>")
      .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, "<em>$1</em>")
      // Converte marcadores de lista após quebra de linha em marcadores visuais elegantes (•)
      .replace(/(^|<br\s*\/?>)\s*[-*]\s+/gi, "$1• ")
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^\*])\*([^\*\n]+?)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)\"\']+)\)/g, function (_, label, targetUrl) {
        var clean = safeUrl(targetUrl);
        return clean ? '<a href="' + clean + '" target="_blank" rel="noopener noreferrer">' + label + "</a>" : label;
      });
  }

  function isTableDelimiter(line) {
    var trimmed = line.trim();
    return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(trimmed);
  }

  function parseTableRow(line) {
    var trimmed = line.trim();
    if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
    if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
    return trimmed.split("|").map(function (c) { return c.trim(); });
  }

  /**
   * Converte Markdown básico em HTML seguro (anti-XSS por escape prévio estrito).
   * Suporta títulos (# a ######), tabelas (|...|), separadores (---), listas (*, -, 1.), citações (>),
   * negrito (**), itálico (*) e links.
   */
  function markdownToHtml(raw) {
    if (!raw) return "";
    var lines = String(raw).split(/\r?\n/);
    var html = [];
    var currentTable = null;
    var currentList = null; // 'ul' | 'ol'
    var currentPara = [];

    function flushPara() {
      if (currentPara.length) {
        html.push("<p>" + currentPara.join("<br>") + "</p>");
        currentPara = [];
      }
    }

    function closeList() {
      if (currentList) {
        html.push("</" + currentList + ">");
        currentList = null;
      }
    }

    function closeTable() {
      if (!currentTable) return;
      var tHtml = ['<div class="msg__table-wrap"><table class="msg__table">'];
      if (currentTable.headers.length) {
        tHtml.push("<thead><tr>");
        currentTable.headers.forEach(function (h, idx) {
          var align = currentTable.alignments[idx] || "left";
          var style = align !== "left" ? ' style="text-align:' + align + '"' : "";
          tHtml.push("<th" + style + ">" + inlineMarkdown(escapeHtml(h)) + "</th>");
        });
        tHtml.push("</tr></thead>");
      }
      if (currentTable.rows.length) {
        tHtml.push("<tbody>");
        currentTable.rows.forEach(function (row) {
          tHtml.push("<tr>");
          row.forEach(function (cell, idx) {
            var align = currentTable.alignments[idx] || "left";
            var style = align !== "left" ? ' style="text-align:' + align + '"' : "";
            tHtml.push("<td" + style + ">" + inlineMarkdown(escapeHtml(cell)) + "</td>");
          });
          tHtml.push("</tr>");
        });
        tHtml.push("</tbody>");
      }
      tHtml.push("</table></div>");
      html.push(tHtml.join(""));
      currentTable = null;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      // Linha de dados de uma tabela já aberta
      if (currentTable) {
        if (trimmed && trimmed.indexOf("|") !== -1) {
          currentTable.rows.push(parseTableRow(trimmed));
          continue;
        } else {
          closeTable();
        }
      }

      // Detecção de início de tabela (linha com pipes e linha seguinte com separador)
      if (trimmed && trimmed.indexOf("|") !== -1 && i + 1 < lines.length && isTableDelimiter(lines[i + 1])) {
        flushPara();
        closeList();
        closeTable();
        var headers = parseTableRow(trimmed);
        var delims = parseTableRow(lines[i + 1]);
        var alignments = delims.map(function (d) {
          var left = d.startsWith(":");
          var right = d.endsWith(":");
          if (left && right) return "center";
          if (right) return "right";
          return "left";
        });
        currentTable = { headers: headers, alignments: alignments, rows: [] };
        i++; // salta a linha delimitadora
        continue;
      }

      if (!trimmed) {
        flushPara();
        closeList();
        closeTable();
        continue;
      }

      // Separador horizontal (---, ___, ***)
      if (/^(?:---|___|\*\*\*)$/.test(trimmed)) {
        flushPara();
        closeList();
        closeTable();
        html.push("<hr>");
        continue;
      }

      // Títulos (# até ######)
      var headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/) || trimmed.match(/^(#{2,6})([^\s#].*)$/);
      if (headingMatch) {
        flushPara();
        closeList();
        closeTable();
        var level = headingMatch[1].length;
        var tag = level === 1 ? "h2" : (level === 2 ? "h3" : (level === 3 ? "h4" : (level === 4 ? "h5" : "h6")));
        html.push("<" + tag + ">" + inlineMarkdown(escapeHtml(headingMatch[2].trim())) + "</" + tag + ">");
        continue;
      }

      // Citações (> bloco)
      var quoteMatch = trimmed.match(/^>\s*(.+)$/);
      if (quoteMatch) {
        flushPara();
        closeList();
        closeTable();
        html.push("<blockquote>" + inlineMarkdown(escapeHtml(quoteMatch[1])) + "</blockquote>");
        continue;
      }

      // Listas de marcas (- ou *)
      var ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
      if (ulMatch) {
        flushPara();
        closeTable();
        if (currentList !== "ul") {
          closeList();
          html.push("<ul>");
          currentList = "ul";
        }
        var isNested = ulMatch[1].length >= 2;
        html.push('<li' + (isNested ? ' class="msg__li--sub"' : "") + ">" + inlineMarkdown(escapeHtml(ulMatch[2])) + "</li>");
        continue;
      }

      // Listas numeradas (1. 2.)
      var olMatch = line.match(/^\s*\d+\.\s+(.+)$/);
      if (olMatch) {
        flushPara();
        closeTable();
        if (currentList !== "ol") {
          closeList();
          html.push("<ol>");
          currentList = "ol";
        }
        html.push("<li>" + inlineMarkdown(escapeHtml(olMatch[1])) + "</li>");
        continue;
      }

      // Linha normal de parágrafo
      closeList();
      closeTable();
      currentPara.push(inlineMarkdown(escapeHtml(trimmed)));
    }

    flushPara();
    closeList();
    closeTable();
    return html.join("");
  }

  function renderMarkdown(raw) {
    var node = el("div", { className: "msg__text msg__text--markdown" });
    node.innerHTML = markdownToHtml(raw);
    return node;
  }

  K.utils.dom = {
    el: el,
    icon: icon,
    clear: clear,
    formatTime: formatTime,
    uuid: uuid,
    safeUrl: safeUrl,
    url: url,
    escapeHtml: escapeHtml,
    markdownToHtml: markdownToHtml,
    renderMarkdown: renderMarkdown,
  };
})(window);
