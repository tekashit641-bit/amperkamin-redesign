/*
 * AMPERKAMIN – company details used on the checkout page
 * (PDF quote for bank transfer, pre-filled e-mail).
 * Replace every value in [brackets] with the real data before going live.
 */
window.SHOP = {
  name: "AMPERKAMIN",
  email: "info@example.com",            // address that receives bank-transfer orders
  phone: "+49 000 000 000",
  address: ["[Firmenname]", "[Straße Nr.]", "[PLZ Ort]", "Deutschland"],
  legal: ["[Firmenname, Rechtsform]", "USt-IdNr.: [DE000000000]", "Handelsregister: [Amtsgericht, HRB-Nr.]"],
  logo: "assets/img/logo-amperkamin.png",
  // false = hide the online payment option (e.g. while the Stripe account is not ready)
  onlinePayment: true
};
