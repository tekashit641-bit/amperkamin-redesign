(() => {
  const CAT_LABEL = { holzpellets: "Holzpellets", briketts: "Braunkohlebriketts", kaminholz: "Kaminholz" };
  const CAT_TEXT = {
    holzpellets: "Holzpellets aus naturbelassenem Restholz – gleichmäßig gepresst, staubarm und mit hohem Heizwert. Geliefert als Sackware auf Palette, ideal für Pelletöfen und Pelletheizungen.",
    briketts: "REKORD Braunkohlebriketts im 25-kg-Gebinde: lange Glutdauer, gleichmäßige Wärme und einfache Lagerung. Perfekt für Kaminöfen, Kachelöfen und Herde, die für Briketts zugelassen sind.",
    kaminholz: "Ofenfertiges Brennholz, gespalten und getrocknet – zündet leicht, brennt sauber und sorgt für ein schönes Flammenbild. Auf Palette geliefert und bereit zum Einlagern."
  };
  // Extra categories from data/neue-produkte.js
  const EXTRA_CATS = window.CATEGORIES_EXTRA || [];
  EXTRA_CATS.forEach(c => { CAT_LABEL[c.id] = c.name; CAT_TEXT[c.id] = c.text; });
  const CATEGORIES = [["holzpellets", "Holzpellets"], ["briketts", "Briketts"], ["kaminholz", "Kaminholz"], ...EXTRA_CATS.map(c => [c.id, c.name])];
  const eur = n => n.toLocaleString((window.I18N && window.I18N.locale) || "de-DE", { style: "currency", currency: "EUR" });
  const $ = s => document.querySelector(s);
  const slug = url => url.replace(/\/$/, "").split("/").pop();
  const imgOf = p => !p.img ? "assets/img/design/pellets.jpg" : p.img.includes("/") ? p.img : `assets/img/produkte/${encodeURIComponent(p.img)}`;
  const link = p => `produkt.html?id=${encodeURIComponent(p.id)}`;

  const products = [...(window.CATALOGUE || []), ...(window.CATALOGUE_EXTRA || [])].map((p, i) => ({
    ...p,
    id: p.id || slug(p.url),
    extra: !p.url,
    rank: i,
    discount: p.regular ? Math.round((1 - p.price / p.regular) * 100) : 0,
    specs: specsFor(p)
  }));
  // Short line under the card title: hand-written specs for new products, key facts for fuels
  const META_KEYS = ["Menge", "Scheitlänge", "Gewicht", "Trocknung"];
  products.forEach(p => {
    const rows = p.specs.slice(1);
    p.meta = (p.extra ? rows : rows.filter(s => META_KEYS.includes(s[0]))).map(s => s[1]).join(" · ");
  });

  // Facts read from the product title only – nothing invented
  function specsFor(p) {
    const t = p.title, s = [["Kategorie", CAT_LABEL[p.cat] || p.cat]];
    if (p.specs) return s.concat(p.specs);
    const brand = t.match(/von ([A-ZÄÖÜÉ][A-ZÄÖÜÉ +]+)/) || t.match(/(HOLZ HARRY|REKORD)/);
    if (brand) s.push(["Marke", brand[1].trim()]);
    const pal = t.match(/(\d+)\s*Palett/i);
    if (pal) s.push(["Menge", pal[1] + (pal[1] === "1" ? " Palette" : " Paletten")]);
    else if (/LKW/i.test(t)) s.push(["Menge", "ganze LKW-Ladung"]);
    else if (/Palette/i.test(t)) s.push(["Menge", "1 Palette"]);
    const len = t.match(/(\d+)\s*(cm|inch)/i); if (len) s.push(["Scheitlänge", len[1] + " " + len[2]]);
    const sacks = t.match(/(\d+)\s*Säcke/); if (sacks) s.push(["Gebinde", sacks[1] + " Säcke"]);
    if (/40×25/.test(t)) s.push(["Gebinde", "40 × 25 kg je Palette"]);
    const kg = t.match(/(\d+)\s*kg\)?$|(\d+)\s*kg[ ,)](?!.*kg)/); if (kg && !/40×25/.test(t)) s.push(["Gewicht", (kg[1] || kg[2]) + " kg"]);
    const tons = t.match(/(\d+)\s*t\b/); if (tons) s.push(["Gewicht", tons[1] + " t"]);
    const vol = t.match(/(\d+)\s*(Raummeter|Festmeter|m³|dm³)/); if (vol) s.push(["Volumen", vol[1] + " " + vol[2]]);
    if (/kammer/i.test(t)) s.push(["Trocknung", "kammergetrocknet"]); else if (/trocken/i.test(t)) s.push(["Trocknung", "trocken"]);
    if (/Buche/i.test(t)) s.push(["Holzart", "Buche"]); else if (/Birke/i.test(t)) s.push(["Holzart", "Birke"]); else if (/Weichholz/i.test(t)) s.push(["Holzart", "Weichholz"]);
    return s;
  }

  // ---------- Cart (shared by all pages) ----------
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem("ak_cart") || "{}"); } catch { cart = {}; }
  const save = () => { try { localStorage.setItem("ak_cart", JSON.stringify(cart)); } catch {} };
  const byId = id => products.find(p => p.id === id);

  function renderCart(bump) {
    const ids = Object.keys(cart).filter(byId);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    const badge = $("#cartCount");
    badge.textContent = count;
    if (bump) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }
    $("#cartList").innerHTML = ids.length ? ids.map(id => {
      const p = byId(id);
      return `<li><img src="${imgOf(p)}" alt="">
        <div><a class="t" href="${link(p)}">${p.title}</a>
          <div class="qty"><button data-dec="${id}" aria-label="Menge verringern">−</button><span>${cart[id]}</span><button data-inc="${id}" aria-label="Menge erhöhen">+</button></div></div>
        <div class="p">${eur(p.price * cart[id])}</div></li>`;
    }).join("") : `<li class="drawer__empty">Ihr Warenkorb ist leer.</li>`;
    $("#cartSum").textContent = eur(ids.reduce((s, id) => s + byId(id).price * cart[id], 0));
    $("#checkout").disabled = !ids.length;
    if (typeof updateOrderLinks === "function") updateOrderLinks();
    if (isCheckout) renderCheckout();
  }
  function addToCart(id, n = 1) { cart[id] = (cart[id] || 0) + n; save(); renderCart(true); openAdded(id, n); }
  const cartCount = () => Object.keys(cart).filter(byId).reduce((s, id) => s + cart[id], 0);
  const cartTotal = () => Object.keys(cart).filter(byId).reduce((s, id) => s + byId(id).price * cart[id], 0);

  // ---------- "Added to cart" dialog: order now or keep shopping ----------
  let addedDlg;
  function buildAdded() {
    addedDlg = document.createElement("dialog");
    addedDlg.className = "added";
    addedDlg.setAttribute("aria-labelledby", "addedTitle");
    addedDlg.innerHTML = `
      <div class="added__head">
        <span class="added__check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9"/></svg></span>
        <h2 id="addedTitle">Zum Warenkorb hinzugefügt</h2>
        <button class="icon" data-close aria-label="Schließen">✕</button>
      </div>
      <div class="added__item" id="addedItem"></div>
      <div class="added__sum"><span>Im Warenkorb</span><strong><span id="addedCount"></span> · <span id="addedTotal"></span></strong></div>
      <p class="muted small added__vat">inkl. MwSt., zzgl. Lieferkosten</p>
      <div class="added__btns">
        <a class="btn btn--orange" href="kasse.html">Jetzt bestellen</a>
        <button class="btn btn--ghost" data-close>Weiter einkaufen</button>
      </div>
      <button class="link added__cart" id="addedCart">Warenkorb ansehen</button>`;
    document.body.appendChild(addedDlg);
    addedDlg.addEventListener("click", e => {
      if (e.target === addedDlg || e.target.closest("[data-close]")) addedDlg.close();
    });
    addedDlg.querySelector("#addedCart").onclick = () => { addedDlg.close(); openCart(); };
  }
  function openAdded(id, n) {
    if (!addedDlg) buildAdded();
    const p = byId(id);
    addedDlg.querySelector("#addedItem").innerHTML = `
      <img src="${imgOf(p)}" alt="">
      <div><a href="${link(p)}" class="added__title">${p.title}</a>
        <span class="muted small"><span>Menge</span>: ${n}</span></div>
      <strong>${eur(p.price * n)}</strong>`;
    const c = cartCount();
    addedDlg.querySelector("#addedCount").textContent = c + (c === 1 ? " Artikel" : " Artikel");
    addedDlg.querySelector("#addedTotal").textContent = eur(cartTotal());
    if (!addedDlg.open) addedDlg.showModal();
    addedDlg.querySelector(".btn--orange").focus();
  }

  // ---------- Floating order button (mobile) ----------
  const isCheckout = !!document.getElementById("checkoutPage");
  let fab;
  if (!isCheckout) {
    fab = document.createElement("a");
    fab.className = "fab";
    fab.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11h11L21 7H6.2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg><span>Bestellen</span><b class="fab__n" aria-hidden="true"></b>`;
    document.body.appendChild(fab);
  }
  function updateOrderLinks() {
    const c = cartCount();
    const target = c ? "kasse.html" : "shop.html";
    document.querySelectorAll(".header__cta").forEach(a => a.href = target);
    if (fab) {
      fab.href = target;
      fab.querySelector(".fab__n").textContent = c || "";
      fab.classList.toggle("has-items", c > 0);
    }
  }

  let lastFocus;
  function openCart() {
    lastFocus = document.activeElement;
    $("#overlay").hidden = false; $("#drawer").classList.add("open"); $("#drawer").setAttribute("aria-hidden", "false");
    $("#closeCart").focus();
  }
  function closeCart() {
    $("#overlay").hidden = true; $("#drawer").classList.remove("open"); $("#drawer").setAttribute("aria-hidden", "true");
    lastFocus && lastFocus.focus();
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function flash(btn) {
    const label = btn.textContent;
    btn.textContent = "✓ Hinzugefügt"; btn.classList.add("added");
    setTimeout(() => { btn.textContent = label; btn.classList.remove("added"); }, 1400);
  }

  const priceHtml = p => (p.from ? `<span>ab</span> ` : "") + eur(p.price);
  const askLink = p => `kontakt.html?betreff=${encodeURIComponent("Anfrage: " + p.title)}`;

  function card(p) {
    const tag = p.example ? `<span class="tag tag--example">Beispiel</span>` : p.discount ? `<span class="tag tag--sale">−${p.discount}%</span>` : (p.rank < 3 ? `<span class="tag">Beliebt</span>` : "");
    return `<article class="card${p.example ? " is-example" : ""}">
      <a class="card__media" href="${link(p)}" tabindex="-1" aria-hidden="true">${tag}<img src="${imgOf(p)}" alt="" loading="lazy"></a>
      <div class="card__body">
        <span class="label">${CAT_LABEL[p.cat] || p.cat}</span>
        <h3><a href="${link(p)}">${p.title}</a></h3>
        <p class="card__meta">${p.meta}</p>
        <div class="price">
          <strong>${priceHtml(p)}</strong>${p.regular ? `<del aria-label="Statt ${eur(p.regular)}">${eur(p.regular)}</del>` : ""}
          <small>inkl. MwSt., zzgl. Lieferung</small>
        </div>
        ${p.request ? `<a class="btn" href="${askLink(p)}">Anfragen</a>` : `<button class="btn" data-add="${p.id}">In den Warenkorb</button>`}
      </div>
    </article>`;
  }

  // ---------- Shop page ----------
  const isShop = !!$("#grid");
  const params = new URLSearchParams(location.search);
  const state = { cat: params.get("cat") || "all", q: params.get("q") || "", sort: "pop" };

  function render() {
    const q = state.q.trim().toLowerCase();
    const list = products.filter(p => (state.cat === "all" || p.cat === state.cat) && (!q || p.title.toLowerCase().includes(q)));
    const sorters = {
      pop: (a, b) => a.rank - b.rank,
      asc: (a, b) => a.price - b.price,
      desc: (a, b) => b.price - a.price,
      sale: (a, b) => b.discount - a.discount || a.price - b.price
    };
    list.sort(sorters[state.sort]);
    $("#grid").innerHTML = list.map(card).join("");
    $("#empty").hidden = list.length > 0;
    $("#resultInfo").textContent = list.length + (list.length === 1 ? " Produkt" : " Produkte");
  }
  function setCat(cat) {
    state.cat = cat;
    document.querySelectorAll(".chip").forEach(c => {
      const on = c.dataset.cat === cat;
      c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", on);
    });
    centerChip();
    render();
  }

  // Keep the active category chip visible in the horizontally scrolling bar (phones)
  function centerChip() {
    requestAnimationFrame(() => {
      const bar = $("#chips"), c = bar && bar.querySelector(".is-on");
      if (!c || bar.scrollWidth <= bar.clientWidth) return;
      const a = c.getBoundingClientRect(), r = bar.getBoundingClientRect();
      bar.scrollLeft += (a.left + a.width / 2) - (r.left + r.width / 2);
    });
  }
  window.addEventListener("load", centerChip);
  document.addEventListener("langchange", centerChip);

  // ---------- Product page ----------
  function renderProduct() {
    const p = byId(params.get("id")) || products[0];
    document.title = `${p.title} – AMPERKAMIN`;
    $("#crumbCat").textContent = CAT_LABEL[p.cat];
    $("#crumbCat").href = `shop.html?cat=${p.cat}`;
    $("#crumbTitle").textContent = p.title;
    const tag = p.discount ? `<span class="tag tag--sale">−${p.discount}%</span>` : "";
    $("#pd").innerHTML = `
      <div class="pd__media">${tag}<img src="${imgOf(p)}" alt="${p.title}"></div>
      <div class="pd__info">
        <span class="label">${CAT_LABEL[p.cat]}</span>
        <h1>${p.title}</h1>
        <div class="price price--lg">
          <strong>${priceHtml(p)}</strong>${p.regular ? `<del aria-label="Statt ${eur(p.regular)}">${eur(p.regular)}</del><span class="save">Sie sparen ${eur(p.regular - p.price)}</span>` : ""}
          <small>inkl. MwSt., zzgl. Lieferkosten</small>
        </div>
        ${p.example ? `<p class="ph example-note">Beispielprodukt – Name, Preis, Foto und Details werden durch das echte Angebot ersetzt.</p>` : p.request ? `<p class="stock"><span class="dot"></span>Auf Anfrage</p>` : `<p class="stock"><span class="dot"></span>Auf Lager</p>`}
        <p class="pd__desc">${p.desc || CAT_TEXT[p.cat] || ""}</p>
        ${p.request ? `<div class="buy"><a class="btn" href="${askLink(p)}">Angebot anfragen</a></div>` : `<div class="buy">
          <div class="qty qty--lg" role="group" aria-label="Menge">
            <button type="button" id="qMinus" aria-label="Menge verringern">−</button>
            <span id="qVal" aria-live="polite">1</span>
            <button type="button" id="qPlus" aria-label="Menge erhöhen">+</button>
          </div>
          <button class="btn" id="buy">In den Warenkorb</button>
        </div>`}
        <ul class="pd__trust">
          <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/></svg><span><b>Lieferung per LKW</b>Liefertermin wird nach der Bestellung abgestimmt</span></li>
          <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg><span><b>Sichere Bezahlung</b>Verschlüsselte Übertragung Ihrer Daten</span></li>
          <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg><span><b>Fragen?</b><a href="tel:+491784322763">+49 178 4322763</a></span></li>
        </ul>
      </div>`;
    $("#specs").innerHTML = p.specs.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join("") +
      `<tr><th scope="row">Preis</th><td>${p.from ? "ab " : ""}${eur(p.price)} inkl. MwSt.</td></tr>`;
    const related = products.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    $("#related").innerHTML = related.map(card).join("");
    $("#related").closest("section").hidden = !related.length;

    if (p.request) return;
    let qty = 1;
    const setQty = n => { qty = Math.max(1, Math.min(99, n)); $("#qVal").textContent = qty; };
    $("#qMinus").onclick = () => setQty(qty - 1);
    $("#qPlus").onclick = () => setQty(qty + 1);
    $("#buy").onclick = e => { addToCart(p.id, qty); flash(e.currentTarget); };
  }

  // ---------- Events ----------
  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) { addToCart(add.dataset.add); flash(add); }
    const inc = e.target.closest("[data-inc]"); if (inc) { cart[inc.dataset.inc]++; save(); renderCart(); }
    const dec = e.target.closest("[data-dec]");
    if (dec) { const id = dec.dataset.dec; if (--cart[id] <= 0) delete cart[id]; save(); renderCart(); }
    const catBtn = e.target.closest("[data-cat]");
    if (catBtn && !catBtn.closest(".grid")) {
      e.preventDefault();
      if (!isShop) { location.href = `shop.html?cat=${catBtn.dataset.cat}`; return; }
      setCat(catBtn.dataset.cat);
    }
  });
  $("#openCart").onclick = openCart;
  $("#closeCart").onclick = closeCart;
  $("#overlay").onclick = closeCart;
  document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#drawer").classList.contains("open")) closeCart(); });
  $("#checkout").onclick = () => { location.href = "kasse.html"; };

  // Mobile menu
  const menuBtn = $("#menuBtn");
  if (menuBtn) {
    const setMenu = open => {
      document.body.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", open);
      menuBtn.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    };
    menuBtn.onclick = () => setMenu(!document.body.classList.contains("menu-open"));
    $("#nav").addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  }

  // Contact form (demo – no backend yet)
  const form = $("#contactForm");
  if (form) {
    const subj = params.get("betreff");
    if (subj) {
      const sel = $("#betreff");
      if (![...sel.options].some(o => o.text === subj)) sel.add(new Option(subj));
      sel.value = subj;
    }
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!validate(form, $("#formError"), "Bitte bestätigen Sie die Datenschutzerklärung.")) return;
      if (form.website.value) return; // honeypot: silently ignore bots
      $("#formOk").hidden = false;
    });
  }

  // Shared form validation (contact + checkout)
  function validate(f, err, checkboxMsg) {
    let first = null;
    f.querySelectorAll("[required]").forEach(x => {
      const bad = x.type === "checkbox" ? !x.checked : !x.value.trim() ||
        (x.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.value)) ||
        (x.name === "plz" && !/^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/.test(x.value.trim()));
      x.setAttribute("aria-invalid", bad);
      if (bad && !first) first = x;
    });
    if (first) {
      err.textContent = first.type === "checkbox" ? checkboxMsg :
        first.type === "email" ? "Bitte geben Sie eine gültige E-Mail-Adresse ein." :
        first.name === "plz" && first.value.trim() ? "Bitte geben Sie eine gültige Postleitzahl ein." :
        "Bitte füllen Sie alle Pflichtfelder aus.";
      err.hidden = false; first.focus(); return false;
    }
    err.hidden = true; return true;
  }
  document.addEventListener("input", e => { if (e.target.getAttribute && e.target.getAttribute("aria-invalid") === "true") e.target.setAttribute("aria-invalid", "false"); });

  // ---------- Checkout page ----------
  function renderCheckout() {
    const ids = Object.keys(cart).filter(byId);
    const done = !$("#orderDone").hidden || !$("#payEmbed").hidden;
    $("#coEmpty").hidden = ids.length > 0 || done;
    $("#coMain").hidden = !ids.length || done;
    if (!ids.length) return;
    $("#coItems").innerHTML = ids.map(id => {
      const p = byId(id);
      return `<li><img src="${imgOf(p)}" alt="">
        <div><a class="t" href="${link(p)}">${p.title}</a>
          <div class="qty"><button type="button" data-dec="${id}" aria-label="Menge verringern">−</button><span>${cart[id]}</span><button type="button" data-inc="${id}" aria-label="Menge erhöhen">+</button></div></div>
        <div class="p">${eur(p.price * cart[id])}</div></li>`;
    }).join("");
    $("#coSub").textContent = eur(cartTotal());
    $("#coTotal").textContent = eur(cartTotal());
  }
  if (isCheckout) {
    const SHOP = window.SHOP || { name: "AMPERKAMIN", email: "", address: [], legal: [], onlinePayment: true };
    const co = $("#checkoutForm");
    const submitBtn = co.querySelector(".co__submit");
    const submitLabel = submitBtn.textContent;
    const t = s => (window.I18N ? I18N.t(s) : s);
    const showError = msg => { const err = $("#coError"); err.textContent = t(msg); err.hidden = false; err.scrollIntoView({ behavior: "smooth", block: "center" }); };
    document.querySelectorAll(".shop-mail").forEach(a => { a.href = "mailto:" + SHOP.email; a.textContent = SHOP.email; });
    if (!SHOP.onlinePayment) {
      co.querySelector('input[value="online"]').closest(".payopt").hidden = true;
      co.querySelector('input[value="ueberweisung"]').checked = true;
    }

    function finish(ref, email, method) {
      $("#orderRef").textContent = ref;
      $("#orderMail").textContent = email;
      $("#orderMail").parentElement.hidden = method === "transfer" || !email;
      $("#doneOnline").hidden = method !== "online";
      $("#doneTransfer").hidden = method !== "transfer";
      $("#payEmbed").hidden = true;
      cart = {}; save();
      $("#orderDone").hidden = false;
      document.querySelectorAll(".steps-bar li").forEach((li, i) => {
        li.className = i < 2 ? "is-done" : "is-on";
        li.toggleAttribute("aria-current", i === 2);
        if (i === 2) li.setAttribute("aria-current", "step");
      });
      renderCart();
      window.scrollTo({ top: 0 });
    }

    // Snapshot of the order taken when the form is submitted
    function readOrder() {
      const v = n => co[n].value.trim();
      const d = new Date(), z = n => String(n).padStart(2, "0");
      const ids = Object.keys(cart).filter(byId);
      return {
        ref: `AK-${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`,
        date: `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()}`,
        name: `${v("vorname")} ${v("nachname")}`, email: v("email"), tel: v("tel"),
        street: v("strasse"), city: `${v("plz")} ${v("ort")}`, country: v("land"), note: v("hinweis"),
        lines: ids.map(id => ({ id, title: byId(id).title, qty: cart[id], price: byId(id).price })),
        total: cartTotal()
      };
    }

    // ----- Bank transfer: PDF quote + pre-filled e-mail -----
    let lastOrder = null, logoData = null;
    function loadLogo() {
      if (logoData !== null) return Promise.resolve(logoData);
      return new Promise(res => {
        const img = new Image();
        img.onload = () => {
          try {
            const c = document.createElement("canvas");
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            c.getContext("2d").drawImage(img, 0, 0);
            logoData = { url: c.toDataURL("image/png"), ratio: img.naturalHeight / img.naturalWidth };
          } catch { logoData = false; }
          res(logoData);
        };
        img.onerror = () => { logoData = false; res(false); };
        img.src = SHOP.logo;
      });
    }
    async function quotePdf(o) {
      const J = window.jspdf && window.jspdf.jsPDF;
      if (!J) throw new Error("no-pdf");
      const logo = await loadLogo();
      const doc = new J({ unit: "mm", format: "a4" });
      const L = 15, R = 195, money = n => eur(n).replace(/ | /g, " ");
      let y;
      const txt = (s, x, yy, o2, size, bold, col) => { doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size || 10); doc.setTextColor(col == null ? 30 : col); doc.text(s, x, yy, o2 || {}); };
      const need = h => { if (y + h > 282) { doc.addPage(); y = 18; } };
      const para = (s, size, col, gap) => { const l = doc.splitTextToSize(s, R - L); need(l.length * size * 0.42 + gap); txt(l, L, y, 0, size, 0, col); y += l.length * size * 0.42 + gap; };

      if (logo) doc.addImage(logo.url, "PNG", L, 12, 52, 52 * logo.ratio);
      doc.setFillColor(243, 234, 220); doc.rect(120, 14, 75, 18, "F");
      txt(t("ANGEBOT"), 157.5, 26, { align: "center" }, 15, 1, 43);
      txt(SHOP.address[0] || SHOP.name, L, 44, 0, 10, 1);
      SHOP.address.slice(1).concat([SHOP.email, SHOP.phone].filter(Boolean)).forEach((s, i) => txt(s, L, 49 + i * 5, 0, 9.5));
      txt(o.name, 120, 44, 0, 10, 1);
      const cl = [o.street, o.city, o.country, o.tel, o.email];
      cl.forEach((s, i) => txt(s, 120, 49 + i * 5, 0, 9.5));
      y = 49 + Math.max(cl.length, SHOP.address.length + 1) * 5 + 6;
      doc.setFillColor(243, 234, 220); doc.rect(L, y, R - L, 14, "F");
      txt(`${t("Angebotsnummer")}: ${o.ref}`, L + 3, y + 5.5, 0, 9.5);
      txt(`${t("Datum")}: ${o.date}`, L + 3, y + 10.5, 0, 9.5);
      y += 21;

      const cx = [L, 35, 140, 166], cw = [20, 105, 26, 29];
      doc.setDrawColor(200, 190, 175);
      const head = [t("Menge"), t("Artikel"), t("Einzelpreis"), t("Gesamt")];
      head.forEach((s, i) => { doc.setFillColor(243, 234, 220); doc.rect(cx[i], y, cw[i], 8, "FD"); txt(s, i > 1 ? cx[i] + cw[i] - 2 : cx[i] + 2, y + 5.3, i > 1 ? { align: "right" } : 0, 9, 1); });
      y += 8;
      o.lines.forEach(l => {
        const wl = doc.splitTextToSize(t(l.title), cw[1] - 4), h = Math.max(8, wl.length * 4.2 + 3.8);
        need(h);
        [String(l.qty), wl, money(l.price), money(l.price * l.qty)].forEach((s, i) => {
          doc.rect(cx[i], y, cw[i], h, "S");
          txt(s, i > 1 ? cx[i] + cw[i] - 2 : cx[i] + 2, y + 5.3, i > 1 ? { align: "right" } : 0, 9);
        });
        y += h;
      });
      need(30); y += 4;
      doc.rect(120, y, 75, 9); txt(t("Gesamtbetrag inkl. MwSt."), 122, y + 6, 0, 9.5, 1); txt(money(o.total), 193, y + 6, { align: "right" }, 9.5, 1);
      y += 16;
      para(t("Alle Preise inkl. gesetzl. MwSt. Die Lieferkosten richten sich nach Ihrer Lieferadresse und werden Ihnen vor der Lieferung bestätigt."), 8.5, 90, 4);
      if (o.note) para(`${t("Hinweise zur Lieferung")}: ${o.note}`, 9, 40, 4);
      para([t("Zahlung per Banküberweisung. Unsere Bankverbindung erhalten Sie per E-Mail."), t("Die Lieferung erfolgt nach Zahlungseingang; den Liefertermin stimmen wir mit Ihnen ab."), t("Bitte geben Sie bei der Überweisung die Angebotsnummer als Verwendungszweck an.")].join("\n"), 9, 40, 8);
      need(22);
      SHOP.legal.forEach((s, i) => txt(s, L, y + i * 4, 0, 7.5, 1, 90));
      return doc;
    }
    async function downloadQuote(o) {
      const blob = (await quotePdf(o)).output("blob");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `Angebot-${SHOP.name}-${o.ref}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
    const MAIL = {
      de: { s: "Bestellung per Überweisung – Angebot ", h: "Guten Tag,", b: "ich möchte meine Bestellung per Banküberweisung bezahlen. Bitte senden Sie mir Ihre Bankverbindung.", a: "Mein Angebot finden Sie im Anhang.", r: "Angebotsnummer", t: "Gesamtbetrag inkl. MwSt.", i: "Artikel", n: "Name", p: "Telefon", e: "E-Mail", d: "Lieferadresse", x: "Hinweise zur Lieferung", c: "Mit freundlichen Grüßen" },
      fr: { s: "Commande par virement – Devis ", h: "Bonjour,", b: "Je souhaite régler ma commande par virement bancaire. Merci de m’envoyer vos coordonnées bancaires.", a: "Vous trouverez mon devis en pièce jointe.", r: "Référence du devis", t: "Montant total TTC", i: "Articles", n: "Nom", p: "Téléphone", e: "E-mail", d: "Adresse de livraison", x: "Indications de livraison", c: "Cordialement," },
      en: { s: "Order by bank transfer – Quote ", h: "Hello,", b: "I would like to pay for my order by bank transfer. Please send me your bank details.", a: "Please find my quote attached.", r: "Quote number", t: "Total incl. VAT", i: "Items", n: "Name", p: "Phone", e: "E-mail", d: "Delivery address", x: "Delivery notes", c: "Kind regards," },
      es: { s: "Pedido por transferencia – Presupuesto ", h: "Buenos días:", b: "Deseo pagar mi pedido por transferencia bancaria. Por favor, envíenme sus datos bancarios.", a: "Adjunto mi presupuesto.", r: "Número de presupuesto", t: "Importe total con IVA", i: "Artículos", n: "Nombre", p: "Teléfono", e: "Correo electrónico", d: "Dirección de entrega", x: "Indicaciones de entrega", c: "Atentamente," }
    };
    async function payByTransfer(o) {
      lastOrder = o;
      try { await downloadQuote(o); }
      catch { showError("Das Angebot konnte nicht erstellt werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns."); return; }
      const m = MAIL[window.I18N ? I18N.lang : "de"] || MAIL.de, sep = ": ";
      const body = [m.h, "", m.b, "", m.a, "", m.r + sep + o.ref, m.t + sep + eur(o.total), "", m.i + ":"]
        .concat(o.lines.map(l => `- ${l.qty} × ${t(l.title)} – ${eur(l.price * l.qty)}`))
        .concat(["", m.n + sep + o.name, m.p + sep + o.tel, m.e + sep + o.email, m.d + sep + [o.street, o.city, o.country].join(", ")])
        .concat(o.note ? [m.x + sep + o.note] : [])
        .concat(["", m.c, o.name]).join("\r\n");
      finish(o.ref, o.email, "transfer");
      setTimeout(() => { location.href = `mailto:${SHOP.email}?subject=${encodeURIComponent(m.s + o.ref)}&body=${encodeURIComponent(body)}`; }, 700);
    }
    $("#quoteAgain").onclick = () => { if (lastOrder) downloadQuote(lastOrder).catch(() => toast(t("Das Angebot konnte nicht erstellt werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns."))); };

    // ----- Online payment: Stripe Embedded Checkout (api/ = Vercel functions) -----
    let stripeLoading = null, embedded = null;
    function loadStripe() {
      if (typeof Stripe === "function") return Promise.resolve();
      if (stripeLoading) return stripeLoading;
      stripeLoading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://js.stripe.com/v3/"; s.async = true;
        s.onload = () => typeof Stripe === "function" ? resolve() : reject(new Error("load"));
        s.onerror = () => { stripeLoading = null; reject(new Error("load")); };
        document.head.appendChild(s);
      });
      return stripeLoading;
    }
    function closeEmbed() {
      if (embedded) { try { embedded.destroy(); } catch {} embedded = null; }
      $("#payEmbed").hidden = true;
      renderCheckout();
    }
    async function payOnline(o) {
      submitBtn.disabled = true; submitBtn.textContent = t("Zahlung wird vorbereitet …");
      try {
        await loadStripe();
        const payload = {
          cart: o.lines.map(l => ({ id: l.id, quantity: l.qty })),
          locale: window.I18N ? I18N.lang : "de",
          customer: { name: o.name, email: o.email, phone: o.tel, address: [o.street, o.city, o.country].join(", "), note: o.note }
        };
        const [r1, r2] = await Promise.all([
          fetch("api/create-checkout-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
          fetch("api/stripe-config")
        ]);
        const data = await r1.json().catch(() => ({})), cfg = await r2.json().catch(() => ({}));
        // Only our own API messages are shown (validation, rate limit, Stripe refusal); anything else gets the generic message
        if (!r1.ok || !data.clientSecret) throw new Error([400, 429, 502].includes(r1.status) && data.error || "");
        if (!r2.ok || !cfg.publishableKey) throw new Error("");
        const stripe = Stripe(cfg.publishableKey, { locale: payload.locale });
        embedded = await stripe.initEmbeddedCheckout({ clientSecret: data.clientSecret });
        $("#coMain").hidden = true; $("#payEmbed").hidden = false;
        embedded.mount("#stripeCheckout");
        window.scrollTo({ top: 0 });
      } catch (err) {
        closeEmbed();
        showError((err && err.message) || "Die Online-Zahlung ist derzeit nicht verfügbar. Bitte wählen Sie Banküberweisung oder versuchen Sie es später erneut.");
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = submitLabel;
      }
    }
    $("#payCancel").onclick = closeEmbed;

    co.addEventListener("submit", e => {
      e.preventDefault();
      if (!validate(co, $("#coError"), "Bitte akzeptieren Sie die AGB und die Widerrufsbelehrung.")) return;
      const o = readOrder();
      if (!o.lines.length) return;
      if (co.zahlung.value === "ueberweisung") payByTransfer(o); else payOnline(o);
    });

    // Return from Stripe: confirm the payment on the server before showing success
    const ret = new URLSearchParams(location.search);
    if (ret.get("checkout") === "success") {
      const sid = ret.get("session_id") || "";
      history.replaceState(null, "", location.pathname);
      fetch("api/checkout-session?session_id=" + encodeURIComponent(sid))
        .then(r => r.json().then(d => { if (!r.ok) throw new Error(d.error); return d; }))
        .then(d => {
          if (d.paymentStatus === "paid") finish(d.orderReference || "–", d.email || "", "online");
          else showError("Ihre Zahlung ist noch nicht bestätigt. Sie erhalten eine E-Mail, sobald sie eingegangen ist.");
        })
        .catch(() => showError("Die Zahlung wurde übermittelt, konnte aber nicht überprüft werden. Bitte prüfen Sie Ihre E-Mails oder kontaktieren Sie uns, bevor Sie erneut bestellen."));
    }
  }

  if (isShop) {
    $("#chips").innerHTML = [["all", "Alle"], ...CATEGORIES].map(([id, name]) =>
      `<button class="chip" data-cat="${id}" aria-pressed="false">${name}</button>`).join("");
    if (state.cat !== "all" && !CAT_LABEL[state.cat]) state.cat = "all";
    const q = $("#q");
    q.value = state.q;
    q.addEventListener("input", e => { state.q = e.target.value; render(); });
    $("#sort").onchange = e => { state.sort = e.target.value; render(); };
    $("#reset").onclick = () => { state.q = ""; q.value = ""; setCat("all"); };
    setCat(state.cat);
  } else if ($("#pd")) {
    renderProduct();
  }
  renderCart();

  // Re-render price-formatted content when the language changes (texts are translated by i18n.js)
  document.addEventListener("langchange", () => {
    if (isShop) render(); else if ($("#pd")) renderProduct();
    renderCart();
  });
})();
