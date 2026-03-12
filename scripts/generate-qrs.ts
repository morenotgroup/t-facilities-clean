import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import { readRange } from "../lib/google";
import { SHEETS, env } from "../lib/config";
import { slugify } from "../lib/utils";

async function main() {
  const rows = await readRange(SHEETS.ambientes);
  const outDir = path.resolve(process.cwd(), "exports/qrs");
  fs.mkdirSync(outDir, { recursive: true });

  for (const row of rows) {
    if (!row[0]) continue;
    const nome = String(row[1] || "").trim();
    const rawSlug = String(row[7] || "").trim();
    const slug = rawSlug || slugify(nome);
    const url = `${env.appUrl}/ambientes/${slug}`;
    const svg = await QRCode.toString(url, { type: "svg", margin: 1, width: 512 });
    fs.writeFileSync(path.join(outDir, `${slug}.svg`), svg);
  }

  console.log(`QR Codes gerados em ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
