// Gera versões WebP em vários tamanhos de cada foto de public/img/.
// Roda sozinho antes do `npm run dev` e do `npm run build` (predev/prebuild).
// Cliente novo: só trocar os JPG/PNG em public/img/; este script cuida do resto.
//
// Saída:
//   public/img/otim/<nome>-<largura>.webp
//   src/data/imagens.json  ->  { "/img/hero.jpg": [360, 720, ...] } (usado pelo srcset)

import { readdir, stat, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAIZ = path.resolve(import.meta.dirname, "..");
const ORIGEM = path.join(RAIZ, "public/img");
const DESTINO = path.join(ORIGEM, "otim");
const MANIFESTO = path.join(RAIZ, "src/data/imagens.json");

// Larguras pensadas pros usos da página: miniatura do cardápio (72px a 3x),
// destaques, fotos de seção e hero em tela cheia.
const LARGURAS = [240, 480, 800, 1200, 1600, 2000];
const QUALIDADE = 76;

const atualizado = async (saida, origemMtime) => {
  try {
    return (await stat(saida)).mtimeMs >= origemMtime;
  } catch {
    return false;
  }
};

await mkdir(DESTINO, { recursive: true });
const arquivos = (await readdir(ORIGEM)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
const manifesto = {};
const esperados = new Set();
let geradas = 0;

for (const arquivo of arquivos) {
  const origem = path.join(ORIGEM, arquivo);
  const { mtimeMs } = await stat(origem);
  const { width } = await sharp(origem).metadata();
  const nome = arquivo.replace(/\.\w+$/, "");
  // Nunca aumenta a foto; a largura original entra como último degrau
  const larguras = [...new Set([...LARGURAS.filter((w) => w < width), Math.min(width, LARGURAS.at(-1))])];
  for (const w of larguras) {
    const saida = path.join(DESTINO, `${nome}-${w}.webp`);
    esperados.add(path.basename(saida));
    if (await atualizado(saida, mtimeMs)) continue;
    await sharp(origem).resize({ width: w }).webp({ quality: QUALIDADE, effort: 5 }).toFile(saida);
    geradas++;
  }
  manifesto[`/img/${arquivo}`] = larguras;
}

// Apaga versões de fotos que saíram da pasta
for (const f of await readdir(DESTINO)) if (!esperados.has(f)) await rm(path.join(DESTINO, f));

await writeFile(MANIFESTO, JSON.stringify(manifesto, null, 2) + "\n");
console.log(`imagens: ${arquivos.length} fotos, ${geradas} versões novas geradas`);
