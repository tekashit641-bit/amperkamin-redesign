/*
 * Mini i18n engine – translates the page from German (source language)
 * using the dictionary in assets/lang.js.
 *  - Text nodes and the attributes placeholder / aria-label / alt / meta description
 *    are looked up by their exact German text.
 *  - Strings with numbers are handled by the regex patterns in LANG.patterns.
 *  - Content added later by app.js is translated automatically (MutationObserver).
 * Language choice: ?lang=xx  >  saved choice  >  browser language  >  German.
 */
(() => {
  const L = window.LANG;
  const CODES = Object.keys(L.languages);           // ["de","fr","en","es"]
  const IDX = { fr: 0, en: 1, es: 2 };              // column in L.dict arrays
  const ATTRS = ["placeholder", "aria-label", "alt", "content"];

  // Reverse index: any translated string -> German key (for re-translating already translated nodes)
  const reverse = new Map();
  for (const [de, arr] of Object.entries(L.dict)) arr.forEach(v => reverse.set(v, de));

  function pick() {
    const q = new URLSearchParams(location.search).get("lang");
    if (CODES.includes(q)) return q;
    try { const s = localStorage.getItem("ak_lang"); if (CODES.includes(s)) return s; } catch {}
    const nav = (navigator.language || "de").slice(0, 2).toLowerCase();
    return CODES.includes(nav) ? nav : "de";
  }
  let lang = pick();

  function tr(de) {
    if (lang === "de" || !de) return de;
    const hit = L.dict[de];
    if (hit) return hit[IDX[lang]] || de;
    for (const [re, fns] of L.patterns) {
      const m = de.match(re);
      if (m && fns[lang]) return fns[lang](m, tr);
    }
    if (de.includes(" · ")) return de.split(" · ").map(tr).join(" · ");
    return de;
  }

  // Original German text of each node / attribute
  const origText = new WeakMap();
  const origAttr = new WeakMap();
  const sourceOf = s => reverse.get(s) || s;

  function doText(node) {
    const raw = node.nodeValue;
    const t = raw.trim();
    if (!t || !/[A-Za-zÄÖÜäöü]/.test(t)) return;
    if (!origText.has(node)) origText.set(node, sourceOf(t.replace(/\s+/g, " ")));
    const out = tr(origText.get(node));
    const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
    const next = lead + out + trail;
    if (raw !== next) node.nodeValue = next;
  }
  function doAttrs(el) {
    let store = origAttr.get(el);
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      if (a === "content" && !(el.tagName === "META" && el.name === "description")) continue;
      if (!store) { store = {}; origAttr.set(el, store); }
      if (!(a in store)) store[a] = sourceOf(el.getAttribute(a));
      const out = tr(store[a]);
      if (el.getAttribute(a) !== out) el.setAttribute(a, out);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { if (root.parentNode && !/^(SCRIPT|STYLE)$/.test(root.parentNode.nodeName)) doText(root); return; }
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(root.nodeName)) return;
    doAttrs(root);
    root.querySelectorAll("*").forEach(doAttrs);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let n; while ((n = w.nextNode())) doText(n);
  }

  let docTitle = sourceOf(document.title);
  function applyTitle() { document.title = tr(docTitle); }

  const obs = new MutationObserver(muts => {
    obs.disconnect();
    for (const m of muts) {
      if (m.type === "childList") m.addedNodes.forEach(walk);
      else if (m.type === "characterData") { origText.delete(m.target); doText(m.target); }
      else if (m.type === "attributes") {
        const st = origAttr.get(m.target); if (st) delete st[m.attributeName];
        doAttrs(m.target);
      }
    }
    if (document.title !== tr(docTitle)) { docTitle = sourceOf(document.title); applyTitle(); }
    observe();
  });
  const observe = () => obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "alt"] });

  function apply() {
    obs.disconnect();
    document.documentElement.lang = lang;
    walk(document.head); walk(document.body); applyTitle();
    const sel = document.getElementById("langSel"); if (sel) sel.value = lang;
    observe();
  }

  // Language switcher, inserted into every page header
  function buildSwitcher() {
    const host = document.querySelector(".header__in");
    if (!host || document.getElementById("langSel")) return;
    const wrap = document.createElement("label");
    wrap.className = "lang";
    wrap.innerHTML = `<span class="sr">Sprache</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>
      <select id="langSel">${CODES.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join("")}</select>`;
    const sel = wrap.querySelector("select");
    CODES.forEach((c, i) => sel.options[i].title = L.languages[c]);
    sel.value = lang;
    sel.addEventListener("change", () => window.I18N.set(sel.value));
    host.insertBefore(wrap, document.getElementById("openCart"));
  }

  window.I18N = {
    get lang() { return lang; },
    get locale() { return L.locales[lang]; },
    t: tr,
    set(code) {
      if (!CODES.includes(code) || code === lang) return;
      lang = code;
      try { localStorage.setItem("ak_lang", code); } catch {}
      apply();
      document.dispatchEvent(new CustomEvent("langchange", { detail: code }));
    }
  };

  buildSwitcher();
  apply();
})();
