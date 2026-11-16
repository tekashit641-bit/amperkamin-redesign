/*
 * AMPERKAMIN – additional shop categories and products
 *
 * HOW TO EDIT
 *  - categories: id (no spaces), German name, short German description (product page).
 *  - products: one block per product.
 *      id       unique, lowercase, no spaces (used in the product URL)
 *      title    German product name
 *      cat      category id from the list above
 *      img      image path (put the photo in assets/img/produkte/)
 *      price    price in euros incl. VAT (use a dot for decimals: 129.90)
 *      regular  optional original price (shows a crossed-out price and a −% badge)
 *      from     true = price is shown as "ab …" (starting price)
 *      request  true = no "add to cart": the button opens the contact form ("Anfragen")
 *      desc     optional German description for the product page
 *               (otherwise the category description is shown)
 *      specs    optional rows for the "Produktdetails" table: [["Label", "Value"], ...]
 *      example  true = sample product, shown with a yellow "Beispiel" badge.
 *               Remove this line once the real product data is filled in.
 *  - New German texts (titles, descriptions, spec labels/values) should also be added
 *    to assets/lang.js so they are translated into French, English and Spanish.
 */
window.CATEGORIES_EXTRA = [
  { id: "oefen",    name: "Öfen & Herde",       text: "Kaminöfen und Holz-Küchenherde für gemütliche Wärme und Kochen mit Holz. Wir beraten Sie gerne zu Leistung, Anschluss und Aufstellung." },
  { id: "zubehoer", name: "Lagerung & Zubehör", text: "Praktisches Zubehör für die saubere Lagerung und das bequeme Nachfüllen von Pellets und Brennholz." },
  { id: "werkzeug", name: "Werkzeug",           text: "Robustes Werkzeug für die Holzbearbeitung – vom Spalten bis zum Sägen von Brennholz." },
  { id: "klima",    name: "Heizen & Klima",     text: "Elektrische Heizgeräte und Klimageräte für angenehme Temperaturen zu jeder Jahreszeit." },
  { id: "rohholz",  name: "Rohholz",            text: "Rohes Stammholz, nach Volumen (m³) verkauft." }
];

window.CATALOGUE_EXTRA = [
  // ----- Öfen & Herde -----
  { id: "kaminofen-stahl-9-kw", title: "Kaminofen aus Stahl, 9 kW", cat: "oefen",
    img: "assets/img/produkte/kaminofen-stahl-9kw.jpg", price: 1095,
    desc: "Kaminofen aus Stahl mit 9 kW, umweltfreundlich konzipiert.",
    specs: [["Material", "Stahl"], ["Leistung", "9 kW"], ["Brennstoff", "Holz"]] },
  { id: "pelletofen-ardoria-13-kw-sannover", title: "Raumluftunabhängiger Pelletofen mit Backofen Ardoria 13 kW Sannover", cat: "oefen",
    img: "assets/img/produkte/pelletofen-ardoria-13kw-sannover.jpg", price: 1420,
    desc: "Raumluftunabhängiger Pelletofen mit Backofen, per WLAN fernsteuerbar.",
    specs: [["Marke", "Sannover"], ["Leistung", "13 kW"], ["Brennstoff", "Holzpellets"], ["Steuerung", "WLAN"]] },
  { id: "pelletofen-eurostove-78-s-line", title: "Pelletofen Eurostove 78 S-Line", cat: "oefen",
    img: "assets/img/produkte/pelletofen-eurostove-78-s-line.jpg", price: 855,
    desc: "Kompakter Ofen, ideal für kleine Räume.",
    specs: [["Marke", "Eurostove"], ["Brennstoff", "Holzpellets"]] },
  { id: "kuechenherd-interstoves-magnum-hydro-sg-steel", title: "Holz-Küchenherd Interstoves Magnum Hydro SG Steel", cat: "oefen",
    img: "assets/img/produkte/kuechenherd-interstoves-magnum-hydro.jpg", price: 1525,
    desc: "Holz-Küchenherd mit 10,5 kW – zum Kochen und Heizen.",
    specs: [["Marke", "Interstoves"], ["Leistung", "10,5 kW"], ["Brennstoff", "Holz"]] },
  { id: "kuechenherd-la-nordica-termorosa", title: "Holz-Küchenherd La Nordica TermoRosa", cat: "oefen",
    img: "assets/img/produkte/kuechenherd-la-nordica-termorosa.jpg", price: 2205,
    desc: "Holz-Küchenherd mit 10 kW, Ausführung in Stahl.",
    specs: [["Marke", "La Nordica"], ["Leistung", "10 kW"], ["Ausführung", "Stahl"], ["Brennstoff", "Holz"]] },

  // ----- Lagerung & Zubehör -----
  { id: "pelletkorb", title: "Pelletkorb", cat: "zubehoer",
    img: "assets/img/produkte/pelletkorb.jpg", price: 149 },
  { id: "tellerwaermer-milly-la-nordica", title: "Tellerwärmer MILLY – La Nordica", cat: "zubehoer",
    img: "assets/img/produkte/tellerwaermer-milly-la-nordica.jpg", price: 690,
    specs: [["Marke", "La Nordica"], ["Modell", "MILLY"]] },
  { id: "pellet-vorratsbox-55-kg-weiss", title: "Pellet-Vorratsbox 55 kg, weiß", cat: "zubehoer",
    img: "assets/img/produkte/pellet-vorratsbox-55kg-weiss.jpg", price: 180,
    desc: "Vorratsbox für Holzpellets mit 55 kg Fassungsvermögen, in schlichtem Weiß.",
    specs: [["Fassungsvermögen", "55 kg"], ["Farbe", "Weiß"]] },
  { id: "pellet-vorratsbox-55-kg-schwarz", title: "Pellet-Vorratsbox 55 kg, schwarz", cat: "zubehoer",
    img: "assets/img/produkte/pellet-vorratsbox-55kg-schwarz.jpg", price: 200,
    desc: "Vorratsbox für Holzpellets mit 55 kg Fassungsvermögen (ca. 3–4 Säcke à 15 kg).",
    specs: [["Fassungsvermögen", "55 kg"], ["Farbe", "Schwarz"]] },
  { id: "pellet-vorratskiste-gross", title: "Pellet-Vorratskiste, große Kapazität", cat: "zubehoer",
    img: "assets/img/produkte/pellet-vorratskiste-gross.jpg", price: 249,
    desc: "Vorratskiste für Holzpellets mit großem Fassungsvermögen.",
    specs: [["Farbe", "Schwarz"]] },

  // ----- Werkzeug -----
  { id: "benzin-motorsaege-35-cm", title: "Benzin-Motorsäge 35 cm", cat: "werkzeug",
    img: "assets/img/produkte/motorsaege-35-cm.jpg", price: 210,
    desc: "Motorsäge mit Benzinmotor und 35-cm-Schwert.",
    specs: [["Antrieb", "Benzin"], ["Schwertlänge", "35 cm"]] },
  { id: "saege-spalt-kombination", title: "Säge-Spalt-Kombination", cat: "werkzeug",
    img: "assets/img/produkte/saege-spalt-kombination.jpg", price: 1230,
    desc: "Vielseitige Maschine zum Sägen und Spalten von Brennholz in einem Arbeitsgang." },
  { id: "hydraulischer-holzspalter", title: "Hydraulischer Holzspalter", cat: "werkzeug",
    img: "assets/img/produkte/holzspalter-hydraulisch.jpg", price: 790,
    desc: "Hydraulischer Holzspalter mit hoher Spaltkraft zum mühelosen Spalten von Holz.",
    specs: [["Antrieb", "Hydraulisch"]] },
  { id: "elektrische-wippsaege", title: "Elektrische Wippsäge", cat: "werkzeug",
    img: "assets/img/produkte/wippsaege-elektrisch.jpg", price: 420,
    desc: "Elektrische Tischsäge zum schnellen und sicheren Zuschneiden von Brennholz.",
    specs: [["Antrieb", "Elektrisch"]] },

  // ----- Heizen & Klima -----
  { id: "elektro-heizkoerper-hudson-reed-sloane", title: "Elektro-Heizkörper Hudson Reed Sloane, horizontal, weiß", cat: "klima",
    img: "assets/img/produkte/heizkoerper-hudson-reed-sloane.jpg", price: 495,
    specs: [["Marke", "Hudson Reed"], ["Ausrichtung", "horizontal"], ["Farbe", "Weiß"]] },
  { id: "elektro-heizkoerper-equation-nesia-1500-w", title: "Elektroheizkörper mit Trockenspeicher 1500 W EQUATION Nesia", cat: "klima",
    img: "assets/img/produkte/heizkoerper-equation-nesia-1500w.jpg", price: 280,
    specs: [["Marke", "EQUATION"], ["Leistung", "1500 W"], ["Heiztechnik", "Trockenspeicher"]] },
  { id: "klimaanlage-samsung-ar35", title: "Klimaanlage SAMSUNG AR35 – 3,5 kW – 12.000 BTU – A++/A – R32", cat: "klima",
    img: "assets/img/produkte/klimaanlage-samsung-ar35.jpg", price: 400,
    desc: "Split-Klimaanlage Samsung AR35 (12.000 BTU / 3,5 kW) mit Digital-Inverter-Technologie.",
    specs: [["Marke", "Samsung"], ["Bauart", "Split"], ["Kühlleistung", "3,5 kW"], ["Energieeffizienz", "A++/A"], ["Kältemittel", "R32"]] },
  { id: "mobile-klimaanlage-zweischlauch-smart", title: "Mobile Zweischlauch-Klimaanlage, smart", cat: "klima",
    img: "assets/img/produkte/klimaanlage-mobil-zweischlauch.jpg", price: 399,
    desc: "Mobile Klimaanlage mit zusätzlichem Schlauch zum Ansaugen von Außenluft, per App steuerbar.",
    specs: [["Bauart", "Mobil, Zweischlauch"]] },
  { id: "mobile-monoblock-klimaanlage", title: "Mobile Monoblock-Klimaanlage", cat: "klima",
    img: "assets/img/produkte/klimaanlage-mobil-monoblock.jpg", price: 249,
    desc: "Mobile Klimaanlage ohne Außengerät – einfach an die Steckdose anschließen.",
    specs: [["Bauart", "Mobil, Monoblock"]] },
  { id: "leise-mobile-klimaanlage", title: "Leise mobile Klimaanlage", cat: "klima",
    img: "assets/img/produkte/klimaanlage-mobil-leise.jpg", price: 350,
    desc: "Mobile Klimaanlage der neuen Generation, entwickelt für einen besonders niedrigen Geräuschpegel.",
    specs: [["Bauart", "Mobil"]] },

  // ----- Rohholz -----
  { id: "stammholz", title: "Stammholz", cat: "rohholz",
    img: "assets/img/design/holzlager.jpg", price: 775, from: true, request: true,
    desc: "Rohes Stammholz, nach Volumen (m³) verkauft. Holzart und Menge nach Wahl – fragen Sie Ihr Angebot an.",
    specs: [["Verkauf", "nach Volumen (m³)"]] }
];
