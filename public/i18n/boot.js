/**
 * Vanilla page boot: set lang, mount TR/EN toggle.
 * Language change reloads the page so static Turkish source is never rewritten
 * in place. Gameplay saves live in other localStorage keys and stay intact.
 */
(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  ready(function () {
    var I = window.tlabI18n;
    if (!I) return;
    I.applyHtmlLang();
    var header = document.querySelector("header") || document.querySelector(".top") || document.querySelector("main") || document.body;
    I.mountLangToggle(header);
    if (I.getLang() === "en") I.applyPhrases(document.body);
    var first = true;
    I.onLang(function () {
      if (first) {
        first = false;
        return;
      }
      location.reload();
    });
  });
})();
