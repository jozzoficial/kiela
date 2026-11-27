/**
 * Cabeçalho fixo.
 *  - PC (>= 900px): barra de navegação completa com os links e o botão "Conversar".
 *  - Telemóvel: botão hambúrguer que abre um menu em gaveta.
 * `active` é "home" | "chat" | "about".
 */
(function (global) {
  "use strict";
  var K = (global.Kiela = global.Kiela || {});
  K.components = K.components || {};

  function createHeader(active) {
    var d = K.utils.dom;
    var healthLine = K.config.contacts.healthLinePhone;

    var links = [
      { id: "home", label: "Início", icon: "home", href: d.url("index.html") },
      { id: "chat", label: "Conversar", icon: "chat", href: d.url("pages/chat.html") },
      { id: "about", label: "Sobre", icon: "info", href: d.url("pages/about.html") },
    ];

    var current = function (id) { return id === active ? ' aria-current="page"' : ""; };

    var desktopLinks = links
      .map(function (l) {
        return '<a class="site-nav__link" href="' + l.href + '"' + current(l.id) + ">" + l.label + "</a>";
      })
      .join("");

    var mobileLinks = links
      .map(function (l) {
        return (
          '<a class="mobile-menu__link" href="' + l.href + '"' + current(l.id) + ">" +
          '<span class="material-symbols-outlined icon icon--md" aria-hidden="true">' + l.icon + "</span>" +
          l.label + "</a>"
        );
      })
      .join("");

    var healthLineHtml = healthLine
      ? '<a class="health-line" href="tel:' + healthLine + '">' +
        '<span class="health-line__label">Linha de Saúde</span>' +
        '<span class="health-line__number">' + healthLine + "</span></a>"
      : "";

    var header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML =
      '<div class="container site-header__bar">' +
      '  <div class="site-header__left">' +
      '    <a class="brand" href="' + d.url("index.html") + '" aria-label="Kiela AI, página inicial">' +
      '      <img class="brand__logo" src="' + d.url("assets/images/logo-shield.png") + '" alt="" width="32" height="40">' +
      '      <span class="brand__text"><span class="brand__name">Kiela AI</span>' +
      '      <span class="brand__tagline">Saúde e prevenção · Angola</span></span>' +
      "    </a>" +
      '    <nav class="site-nav" aria-label="Principal">' + desktopLinks + "</nav>" +
      "  </div>" +
      '  <div class="site-header__right">' + healthLineHtml +
      '    <a class="btn btn--primary site-header__cta" href="' + d.url("pages/chat.html") + '">' +
      '      <span class="material-symbols-outlined icon icon--sm" aria-hidden="true">chat_bubble</span>Conversar com o Assistente</a>' +
      '    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menu">' +
      '      <span class="menu-toggle__bars" aria-hidden="true"><span></span><span></span><span></span></span>' +
      "    </button>" +
      "  </div>" +
      "</div>" +
      '<nav class="mobile-menu" id="mobile-menu" aria-label="Menu">' + mobileLinks +
      '  <a class="btn btn--primary btn--lg btn--block mobile-menu__cta" href="' + d.url("pages/chat.html") + '">' +
      '    <span class="material-symbols-outlined icon icon--sm" aria-hidden="true">chat_bubble</span>Conversar com o Assistente</a>' +
      "</nav>";

    wireMenu(header);
    return header;
  }

  /** Abre e fecha o menu do telemóvel. */
  function wireMenu(header) {
    var toggle = header.querySelector(".menu-toggle");
    var menu = header.querySelector(".mobile-menu");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      menu.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    // se o ecrã passar a ser largo (por exemplo, ao rodar o telemóvel), fecha a gaveta
    var wide = global.matchMedia("(min-width: 900px)");
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener("change", onChange);
    else if (wide.addListener) wide.addListener(onChange);
  }

  K.components.createHeader = createHeader;
})(window);
