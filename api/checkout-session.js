// Called on return from Stripe: the order is only shown as paid after Stripe confirms it here.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "Methode nicht erlaubt." });
  const sessionId = String(req.query?.session_id || "");
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return res.status(400).json({ error: "Ungültige Sitzung." });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: "Zahlung nicht konfiguriert." });
  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: "Zahlung konnte nicht überprüft werden." });
    return res.status(200).json({
      paymentStatus: data.payment_status,
      status: data.status,
      orderReference: data.metadata?.order_reference || null,
      email: data.customer_details?.email || data.customer_email || null
    });
  } catch (_) {
    return res.status(502).json({ error: "Zahlung konnte nicht überprüft werden." });
  }
}
