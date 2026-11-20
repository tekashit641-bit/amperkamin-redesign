# AMPERKAMIN — paiement (Stripe + virement) sur Vercel

Le site reste en HTML statique. Les fichiers du dossier `api/` sont des fonctions Vercel : la clé secrète Stripe n'est jamais dans le HTML.

## Deux modes de paiement sur `kasse.html`

- **Online bezahlen** : paiement Stripe intégré à la page (Embedded Checkout). Les moyens proposés (carte, Apple Pay, Google Pay, Klarna…) sont ceux activés dans le Dashboard Stripe.
- **Banküberweisung** : le client télécharge un devis PDF (« Angebot ») et sa messagerie s'ouvre avec un e-mail prérempli demandant la Bankverbindung. La commande est livrée après réception du virement.

Pour masquer temporairement le paiement en ligne : `onlinePayment: false` dans `assets/shop-config.js`.

## À compléter avant la mise en ligne

Dans `assets/shop-config.js` : e-mail qui reçoit les commandes par virement, téléphone, adresse et mentions légales (raison sociale, USt-IdNr., Handelsregister). Ces données apparaissent sur le devis PDF.

## Variables d'environnement Vercel

**Project → Settings → Environment Variables** (Production) :

- `STRIPE_SECRET_KEY` : clé secrète `sk_live_…` (ou `sk_test_…` pour tester).
- `STRIPE_PUBLISHABLE_KEY` : clé publiable `pk_live_…` / `pk_test_…`, du **même mode** que la clé secrète.
- `SITE_URL` : adresse publique exacte du site, sans slash final (ex. `https://www.amperkamin.de`).
- `STRIPE_WEBHOOK_SECRET` : secret `whsec_…` du webhook ci-dessous.

Ne jamais mettre ces clés dans le code, GitHub ou un message. Redéployer après chaque changement de variable.

## Webhook Stripe

Dashboard Stripe → Developers → Webhooks : endpoint `https://<votre-domaine>/api/stripe-webhook`, événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`. Copier le secret `whsec_…` dans `STRIPE_WEBHOOK_SECRET`.

## Fonctionnement

- `POST /api/create-checkout-session` vérifie les coordonnées et les quantités et **recalcule les prix côté serveur** à partir de `data/catalogue.js` et `data/neue-produkte.js`. Les prix envoyés par le navigateur sont ignorés. Les produits « sur demande » (`request: true`) et d'exemple (`example: true`) ne peuvent pas être payés en ligne.
- Au retour de Stripe, `kasse.html` interroge `GET /api/checkout-session` et n'affiche « commande payée » que si Stripe confirme `payment_status = paid`.
- Les frais de livraison ne sont **pas** encaissés en ligne : le client paie les produits, la livraison est confirmée séparément (message affiché sur la page Stripe et sur le devis).
- Aucune base de données : les commandes payées se consultent dans le Dashboard Stripe (référence `AK-…` dans les métadonnées, avec adresse, téléphone et indications de livraison). Les commandes par virement arrivent par e-mail.
