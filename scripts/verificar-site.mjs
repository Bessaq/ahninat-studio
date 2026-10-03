#!/usr/bin/env node
// Verificador do site: Node puro, sem dependência. Lê index.html, robots.txt e sitemap.xml
// e falha (exit 1) quando a página deixa de atender ao SEO técnico mínimo combinado no README.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const caminhoIndex = join(raiz, "index.html");

const erros = [];
const avisos = [];

function lerArquivo(caminho) {
  return readFileSync(caminho, "utf8");
}

function extrairAtributo(tag, nome) {
  if (!tag) return null;
  const m = tag.match(new RegExp(`${nome}\\s*=\\s*"([^"]*)"`, "i"));
  return m ? m[1] : null;
}

function extrairTag(html, regex) {
  const m = html.match(regex);
  return m ? m[0] : null;
}

const html = lerArquivo(caminhoIndex);
// Para checagens de conteúdo visível e de tags, remove comentários primeiro.
const semComentarios = html.replace(/<!--[\s\S]*?-->/g, "");

// --- 1. Âncoras internas: toda href="#x" precisa de um id="x" em algum elemento ---
const idsExistentes = new Set();
for (const m of semComentarios.matchAll(/\sid\s*=\s*"([^"]+)"/g)) idsExistentes.add(m[1]);
for (const m of semComentarios.matchAll(/href\s*=\s*"#([^"]+)"/g)) {
  const alvo = m[1];
  if (!alvo) continue;
  if (!idsExistentes.has(alvo)) erros.push(`Âncora href="#${alvo}" não tem elemento com id="${alvo}".`);
}

// --- 2. Imagens: alt (decorativa leva alt=""), width e height ---
for (const m of semComentarios.matchAll(/<img\b[^>]*>/gi)) {
  const tag = m[0];
  const src = extrairAtributo(tag, "src") ?? tag;
  if (extrairAtributo(tag, "alt") === null) erros.push(`Imagem sem alt: ${src}`);
  if (!extrairAtributo(tag, "width")) erros.push(`Imagem sem width: ${src}`);
  if (!extrairAtributo(tag, "height")) erros.push(`Imagem sem height: ${src}`);
}

// --- 3. <title> (até 60 caracteres) e meta description (120 a 160) ---
const title = (semComentarios.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
if (!title) erros.push("Faltou <title>.");
else if (title.length > 60) erros.push(`<title> com ${title.length} caracteres (máx. 60): "${title}"`);

const metaDescricaoTag = extrairTag(semComentarios, /<meta\s+name="description"[^>]*>/i);
const metaDescricao = extrairAtributo(metaDescricaoTag, "content") || "";
if (!metaDescricao) erros.push("Faltou a meta description.");
else if (metaDescricao.length < 120 || metaDescricao.length > 160) {
  erros.push(`meta description com ${metaDescricao.length} caracteres (precisa de 120 a 160): "${metaDescricao}"`);
}

// --- 4. Canonical, og:url, og:image, JSON-LD, robots.txt e sitemap.xml no mesmo endereço base ---
const canonical = extrairAtributo(extrairTag(semComentarios, /<link\s+rel="canonical"[^>]*>/i), "href");
if (!canonical) erros.push("Faltou <link rel=\"canonical\">.");

const ogUrl = extrairAtributo(extrairTag(semComentarios, /<meta\s+property="og:url"[^>]*>/i), "content");
const ogImage = extrairAtributo(extrairTag(semComentarios, /<meta\s+property="og:image"[^>]*>/i), "content");

if (canonical) {
  if (ogUrl !== canonical) erros.push(`og:url ("${ogUrl}") não bate com o canonical ("${canonical}").`);
  if (!ogImage || !ogImage.startsWith(canonical)) erros.push(`og:image ("${ogImage}") não começa pelo endereço base do canonical ("${canonical}").`);

  const caminhoRobots = join(raiz, "robots.txt");
  if (existsSync(caminhoRobots)) {
    const robots = lerArquivo(caminhoRobots);
    const linhaSitemap = (robots.match(/Sitemap:\s*(\S+)/i) || [])[1];
    if (!linhaSitemap || !linhaSitemap.startsWith(canonical)) {
      erros.push(`robots.txt aponta o sitemap para "${linhaSitemap}", fora do endereço base do canonical ("${canonical}").`);
    }
  } else {
    erros.push("Faltou robots.txt na raiz do projeto.");
  }

  const caminhoSitemap = join(raiz, "sitemap.xml");
  if (existsSync(caminhoSitemap)) {
    const sitemap = lerArquivo(caminhoSitemap);
    for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (!m[1].startsWith(canonical)) erros.push(`sitemap.xml tem <loc>${m[1]}</loc> fora do endereço base do canonical ("${canonical}").`);
    }
  } else {
    erros.push("Faltou sitemap.xml na raiz do projeto.");
  }
}

// --- 5. JSON-LD precisa ser JSON válido ---
for (const m of semComentarios.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
  try {
    JSON.parse(m[1]);
  } catch (e) {
    erros.push(`JSON-LD inválido: ${e.message}`);
  }
}

// --- 6. Um único <h1> e sem salto de nível de título ---
const titulos = Array.from(semComentarios.matchAll(/<h([1-6])\b/gi)).map((m) => Number(m[1]));
const quantidadeH1 = titulos.filter((n) => n === 1).length;
if (quantidadeH1 !== 1) erros.push(`A página tem ${quantidadeH1} elemento(s) <h1> (precisa ter exatamente 1).`);

let nivelAnterior = 0;
for (const nivel of titulos) {
  if (nivel > nivelAnterior + 1) erros.push(`Salto de nível de título: de h${nivelAnterior} para h${nivel}.`);
  nivelAnterior = nivel;
}

// --- 7. Travessão (—) em texto visível ---
const semScripts = semComentarios.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
const textoVisivel = semScripts.replace(/<[^>]+>/g, " ");
if (textoVisivel.includes("—")) {
  const indice = textoVisivel.indexOf("—");
  const trecho = textoVisivel.slice(Math.max(0, indice - 30), indice + 30).trim();
  erros.push(`Travessão (—) encontrado em texto visível, perto de: "...${trecho}..."`);
}

// --- 8. Todo arquivo local citado em src/href precisa existir ---
for (const m of semComentarios.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/gi)) {
  const caminho = m[1];
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(caminho)) continue; // URL absoluta ou protocolo-relativa
  if (/^(mailto|tel|data):/i.test(caminho)) continue;
  if (caminho.startsWith("#") || caminho === "") continue;
  const semFragmento = caminho.split("#")[0].split("?")[0];
  if (!semFragmento) continue;
  const caminhoAbsoluto = join(raiz, semFragmento);
  if (!existsSync(caminhoAbsoluto)) erros.push(`Arquivo local referenciado não existe: ${caminho}`);
}

// --- Resumo ---
console.log(`Verificação de ${caminhoIndex}`);
console.log(`- <title>: ${title.length} caracteres`);
console.log(`- meta description: ${metaDescricao.length} caracteres`);
console.log(`- canonical: ${canonical ?? "(faltou)"}`);
console.log(`- <h1>: ${quantidadeH1}`);
console.log("");

if (avisos.length) {
  console.log(`Avisos (${avisos.length}):`);
  avisos.forEach((a) => console.log(`  - ${a}`));
  console.log("");
}

if (erros.length) {
  console.log(`Falhas (${erros.length}):`);
  erros.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
} else {
  console.log("Tudo certo: nenhuma falha encontrada.");
}
