// Gives the browser the publishable key (never the secret key).
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "Methode nicht erlaubt." });
  const publishable = process.env.STRIPE_PUBLISHABLE_KEY || "";
  const secret = process.env.STRIPE_SECRET_KEY || "";
  if (!/^pk_(test|live)_[A-Za-z0-9]+$/.test(publishable)) return res.status(503).json({ error: "Die Online-Zahlung ist derzeit nicht verfügbar. Bitte wählen Sie Banküberweisung oder versuchen Sie es später erneut." });
  // Publishable and secret key must be in the same mode (test or live)
  if (publishable.startsWith("pk_live_") !== secret.startsWith("sk_live_")) return res.status(503).json({ error: "Die Online-Zahlung ist derzeit nicht verfügbar. Bitte wählen Sie Banküberweisung oder versuchen Sie es später erneut." });
  return res.status(200).json({ publishableKey: publishable });
}
