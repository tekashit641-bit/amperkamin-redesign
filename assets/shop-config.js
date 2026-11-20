/*
 * AMPERKAMIN – company details used on the checkout page
 * (PDF quote for bank transfer, pre-filled e-mail).
 * Same data as impressum.html – update both if something changes.
 */
window.SHOP = {
  name: "AMPERKAMIN",
  email: "de.kontakt@amperkamin.com",   // address that receives bank-transfer orders
  phone: "+49 178 4322763",
  address: ["Ampersand GmbH", "Sachsstraße 22", "50259 Pulheim", "Deutschland"],
  legal: ["Ampersand GmbH · Geschäftsführer: Marcel Nießen", "Amtsgericht Aachen, HRB 22273", "USt-IdNr.: DE319956711"],
  logo: "assets/img/logo-amperkamin.png",
  // false = hide the online payment option (e.g. while the Stripe account is not ready)
  onlinePayment: true
};
