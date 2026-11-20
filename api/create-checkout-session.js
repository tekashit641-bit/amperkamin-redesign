import { catalogue } from "./_catalogue.js";

const LOCALES = ["de", "fr", "en", "es"];
const NOTE = {
  de: "Die Lieferkosten richten sich nach Ihrer Lieferadresse und werden Ihnen vor der Lieferung bestätigt.",
  fr: "Les frais de livraison dépendent de votre adresse et vous sont confirmés avant la livraison.",
  en: "Delivery costs depend on your address and will be confirmed before delivery.",
  es: "Los gastos de envío dependen de su dirección y se le confirmarán antes de la entrega."
};
const hits = new Map();

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ error: "Methode nicht erlaubt." });

  const site = (process.env.SITE_URL || "").replace(/\/$/, "");
  let validOrigin = false;
  try {
    const base = new URL(site), origin = new URL(req.headers.origin);
    const domain = base.hostname.replace(/^www\./, "");
    validOrigin = origin.protocol === base.protocol && [domain, `www.${domain}`].includes(origin.hostname);
  } catch (_) {}
  if (!validOrigin) return res.status(403).json({ error: "Die Online-Zahlung ist derzeit nicht verfügbar. Bitte wählen Sie Banküberweisung oder versuchen Sie es später erneut." });
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SECRET_KEY.startsWith("sk_"))
    return res.status(503).json({ error: "Die Online-Zahlung ist derzeit nicht verfügbar. Bitte wählen Sie Banküberweisung oder versuchen Sie es später erneut." });

  // Simple per-instance rate limit
  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now(), prior = hits.get(ip) || { start: now, count: 0 };
  if (now - prior.start > 5 * 60 * 1000) { prior.start = now; prior.count = 0; }
  if (++prior.count > 8) return res.status(429).json({ error: "Zu viele Versuche. Bitte versuchen Sie es in einigen Minuten erneut." });
  hits.set(ip, prior);

  try {
    const { cart, customer, locale } = req.body || {};
    const lang = LOCALES.includes(locale) ? locale : "de";
    if (!Array.isArray(cart) || cart.length < 1 || cart.length > 40) throw new Error("Ungültiger Warenkorb.");
    const clean = (v, n) => String(v || "").trim().slice(0, n);
    const name = clean(customer?.name, 100), email = clean(customer?.email, 254), phone = clean(customer?.phone, 40);
    const address = clean(customer?.address, 450), note = clean(customer?.note, 450);
    if (!name || !phone || !address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Bitte füllen Sie alle Pflichtfelder aus.");

    const products = catalogue(), seen = new Set();
    const items = cart.map((line) => {
      const p = products.get(String(line?.id || "")), qty = Number(line?.quantity);
      if (!p || seen.has(line.id) || !Number.isInteger(qty) || qty < 1 || qty > 99) throw new Error("Ungültiger Artikel oder ungültige Menge.");
      seen.add(line.id);
      return { name: p.name, amount: p.amount, qty };
    });

    const ref = `AK-${Date.now().toString(36).toUpperCase()}`;
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("locale", lang);
    form.set("return_url", `${site}/kasse.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
    form.set("customer_email", email);
    form.set("billing_address_collection", "auto");
    form.set("custom_text[submit][message]", NOTE[lang]);
    form.set("metadata[order_reference]", ref);
    form.set("metadata[customer_name]", name);
    form.set("metadata[customer_phone]", phone);
    form.set("metadata[delivery_address]", address);
    if (note) form.set("metadata[delivery_note]", note);
    form.set("payment_intent_data[description]", `AMPERKAMIN ${ref}`);
    items.forEach((it, i) => {
      form.set(`line_items[${i}][price_data][currency]`, "eur");
      form.set(`line_items[${i}][price_data][product_data][name]`, it.name);
      form.set(`line_items[${i}][price_data][unit_amount]`, String(it.amount));
      form.set(`line_items[${i}][quantity]`, String(it.qty));
    });

    // ui_mode depends on the Stripe API version of the account: "embedded_page" (recent) or "embedded" (older)
    async function createSession(uiMode) {
      form.set("ui_mode", uiMode);
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: form
      });
      return { response, data: await response.json() };
    }
    let { response, data } = await createSession("embedded_page");
    if (!response.ok && data.error?.param === "ui_mode") ({ response, data } = await createSession("embedded"));
    if (!response.ok || !data.client_secret) {
      console.error("Stripe Checkout error", data.error?.type, data.error?.code, data.error?.param, data.error?.message);
      const code = [data.error?.code, data.error?.param].filter(Boolean).join(" / ");
      return res.status(502).json({ error: "Stripe konnte die Zahlung nicht vorbereiten. Bitte wählen Sie Banküberweisung oder versuchen Sie es später erneut." + (code ? ` (Code: ${code})` : "") });
    }
    return res.status(200).json({ clientSecret: data.client_secret });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Ungültige Anfrage." });
  }
}
