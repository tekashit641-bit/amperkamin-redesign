// Server-side price list, read from the same data files as the shop.
// Prices sent by the browser are never trusted: amounts always come from here.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

let cache = null;

export function catalogue() {
  if (cache) return cache;
  const ctx = vm.createContext({ window: {} });
  for (const file of ["catalogue.js", "neue-produkte.js"]) {
    vm.runInContext(fs.readFileSync(path.join(process.cwd(), "data", file), "utf8"), ctx, { filename: file });
  }
  const w = ctx.window, map = new Map();
  [...(w.CATALOGUE || []), ...(w.CATALOGUE_EXTRA || [])].forEach((p) => {
    const id = p.id || String(p.url || "").replace(/\/$/, "").split("/").pop();
    // Products "on request", sample products and products without a price cannot be paid online
    if (!id || p.request || p.example || !(Number(p.price) > 0)) return;
    map.set(id, { name: String(p.title).slice(0, 250), amount: Math.round(Number(p.price) * 100) });
  });
  cache = map;
  return map;
}
