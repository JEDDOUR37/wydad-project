"use strict";
/* =====================================================
   i18n.js  -  multilingual support (EN / FR / AR)
   - Dictionaries live in data/lang/<code>.json  (loaded with fetch)
   - HTML:  <h2 data-i18n="results.title">Latest Results</h2>
            <input data-i18n-attr="placeholder:guess.placeholder;aria-label:guess.placeholder">
            <div data-i18n="quiz.badge" data-i18n-vars='{"n":10}'>
   - JS:    I18N.t("quiz.correct")            -> text in the current language
            I18N.t("quiz.counter", {n:1,total:10})   ({n} placeholders)
   - The chosen language is saved in localStorage ("wydad-lang") and
     an event "langchange" is fired on document each time it changes.
   To add a language: create data/lang/xx.json, add it to LANGS below
   and add a <button data-lang="xx"> to the [data-lang-switch] box in the HTML.
===================================================== */
(function () {
    const STORAGE_KEY = "wydad-lang";
    const DEFAULT_LANG = "en";
    const LANGS = {
        en: { dir: "ltr", locale: "en-GB" },
        fr: { dir: "ltr", locale: "fr-FR" },
        ar: { dir: "rtl", locale: "ar-MA" },
    };
    const cache = {};
    let current = DEFAULT_LANG;
    let initPromise = null;

    async function load(code) {
        if (code in cache)
            return cache[code];
        try {
            const res = await fetch(`data/lang/${code}.json`);
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            cache[code] = await res.json();
        }
        catch (err) {
            console.warn(`[WYDAD] language file "${code}" could not be loaded.`, err);
            cache[code] = null;
        }
        return cache[code];
    }
    function format(text, vars) {
        if (!vars)
            return text;
        return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    }
    function lookup(key) {
        return cache[current]?.strings?.[key] ?? cache[DEFAULT_LANG]?.strings?.[key];
    }
    /** Translate a key (returns the key itself if it does not exist). */
    function t(key, vars) {
        const s = lookup(key);
        return s === undefined ? key : format(s, vars);
    }
    /** Translate a plain English value found in the data (ex: "Goalkeeper" -> "Gardien"). */
    function tr(text, prefixes) {
        if (!text)
            return text;
        const en = cache[DEFAULT_LANG]?.strings;
        if (!en)
            return text;
        const key = Object.keys(en).find((k) => en[k] === text && prefixes.some((p) => k === p || k.startsWith(p)));
        return key ? t(key) : text;
    }
    /** Quiz texts (question, options, fact) for a question id like "q1". */
    function quiz(id) {
        return cache[current]?.quiz?.[id] ?? cache[DEFAULT_LANG]?.quiz?.[id] ?? null;
    }
    function applyDom() {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const s = lookup(el.dataset.i18n ?? "");
            if (s === undefined)
                return;
            let vars;
            if (el.dataset.i18nVars) {
                try {
                    vars = JSON.parse(el.dataset.i18nVars);
                }
                catch { /* ignore bad JSON */ }
            }
            el.textContent = format(s, vars);
        });
        document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
            (el.dataset.i18nAttr ?? "").split(";").forEach((pair) => {
                const i = pair.indexOf(":");
                if (i < 0)
                    return;
                const s = lookup(pair.slice(i + 1).trim());
                if (s !== undefined)
                    el.setAttribute(pair.slice(0, i).trim(), s);
            });
        });
    }
    function showBanner() {
        if (document.getElementById("i18nBanner"))
            return;
        const b = document.createElement("div");
        b.id = "i18nBanner";
        b.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#CC0000;color:#fff;padding:8px 12px;font:14px sans-serif;text-align:center";
        b.textContent = "Language files could not be loaded. Open the site with Live Server or GitHub Pages (not by double-click).";
        document.body.appendChild(b);
    }
    async function setLang(code, persist = true) {
        if (!(code in LANGS))
            code = DEFAULT_LANG;
        await Promise.all([load(DEFAULT_LANG), load(code)]);
        if (!cache[code])
            code = DEFAULT_LANG;
        if (!cache[code]) {
            showBanner();
            return false;
        }
        current = code;
        document.documentElement.lang = code;
        const scope = document.querySelector("[data-rtl-scope]") ?? document.documentElement;
        scope.dir = LANGS[code].dir;
        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, code);
            }
            catch { /* storage unavailable */ }
        }
        applyDom();
        document.querySelectorAll("[data-lang-switch] button[data-lang]").forEach((b) => {
            const on = b.dataset.lang === code;
            b.classList.toggle("active", on);
            b.setAttribute("aria-pressed", String(on));
        });
        document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: code } }));
        return true;
    }
    function init() {
        if (!initPromise) {
            initPromise = (async () => {
                let saved = null;
                try {
                    saved = localStorage.getItem(STORAGE_KEY);
                }
                catch { /* storage unavailable */ }
                await setLang(saved && saved in LANGS ? saved : DEFAULT_LANG, false);
                document.querySelectorAll("[data-lang-switch] button[data-lang]").forEach((btn) => {
                    btn.addEventListener("click", () => { void setLang(btn.dataset.lang ?? DEFAULT_LANG); });
                });
            })();
        }
        return initPromise;
    }
    window.I18N = { init, setLang, t, tr, quiz, lang: () => current, locale: () => LANGS[current].locale };
})();
