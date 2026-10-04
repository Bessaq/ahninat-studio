# SEO técnico

O que foi feito nesta rodada (BES-328), sem mudar a identidade visual nem o logo líquido.

## O que mudou

1. **Verificador** (`scripts/verificar-site.mjs`, Node puro, sem dependência): confere
   âncoras internas, `alt`/`width`/`height` de imagens, tamanho do `<title>` e da
   `meta description`, o mesmo endereço base em canonical/`og:url`/`og:image`/JSON-LD/
   `robots.txt`/`sitemap.xml`, validade do JSON-LD, hierarquia de títulos (um único `<h1>`,
   sem salto de nível), ausência de travessão em texto visível e existência dos arquivos
   locais citados em `src`/`href`.
2. **Dados estruturados**: o JSON-LD virou um `@graph` com `Organization` (já existia),
   `WebSite`, `WebPage` e um `SoftwareApplication` para o Astrologic e para o Numerologic
   (nome, descrição, categoria e idioma). Sem nota, preço, número de usuários, endereço,
   telefone ou redes inventados.
3. **Desempenho e estabilidade visual**: todas as imagens já tinham `width`/`height`;
   adicionado `fetchpriority="high"` no logo do cabeçalho (primeiro elemento visível) e
   `defer` no `<script src="main.js">`. O `preconnect` da fonte já existia. O `loading="lazy"`
   e `decoding="async"` já estavam no logo do rodapé.
4. **Rastreamento**: `sitemap.xml` ganhou `lastmod`; `robots.txt` já apontava o sitemap;
   `404.html` já tinha `noindex` e `<html lang="pt-BR">`. Adicionado `meta name="robots"
   content="index, follow"` na página principal e `<link rel="alternate" hreflang="pt-BR">`
   mais `hreflang="x-default"` autorreferentes.
5. **Semântica**: landmarks (`header`, `nav`, `main`, `footer`) e um único `<h1>` já
   existiam; corrigido um salto de nível (os títulos do rodapé, "Produtos" e "Estúdio",
   eram `<h4>` sem um `<h3>` antes na ordem do documento; viraram `<h3>`).
6. **Título e descrição**: a `meta description` tinha 232 caracteres (fora dos 120 a 160
   recomendados); reduzida para 142 caracteres, mantendo o que o estúdio faz e os dois
   produtos próprios. O `<title>` já estava dentro do limite (56 caracteres).
7. **Verificação de propriedade**: deixados no `<head>` os lugares comentados para as
   metatags do Google Search Console (`google-site-verification`) e do Bing
   (`msvalidate.01`), com o passo a passo no `README.md`.

## Saída do verificador

**Antes** (`node scripts/verificar-site.mjs` rodado contra o `index.html` da `main`):

```
Verificação de index.html
- <title>: 56 caracteres
- meta description: 232 caracteres
- canonical: https://bessaq.github.io/ahninat-studio/
- <h1>: 1

Falhas (2):
  - meta description com 232 caracteres (precisa de 120 a 160): "Ahninat Studio é um estúdio de tecnologia e produtos digitais. Estratégia, design e desenvolvimento para produtos, sistemas e integrações, com processo claro e preparado para a continuidade. Criadores do Astrologic e do Numerologic."
  - Salto de nível de título: de h2 para h4.
exit 1
```

**Depois:**

```
Verificação de index.html
- <title>: 56 caracteres
- meta description: 142 caracteres
- canonical: https://bessaq.github.io/ahninat-studio/
- <h1>: 1

Tudo certo: nenhuma falha encontrada.
exit 0
```

`node --check main.js` também passa sem erro.

## O que não foi feito

- **Peso das imagens**: o ambiente desta rodada não tinha `pngquant`, `optipng` nem
  `cwebp` instalados, então os PNG em `assets/` (principalmente `logo-horizontal.png`,
  104 KB, e `logo-vertical.png`, 52 KB) não foram recomprimidos. Mantidos os nomes de
  arquivo; rodar `pngquant --quality=70-90 --ext .png --force assets/*.png` localmente
  antes da próxima publicação, comparando visualmente o resultado.

## Para o dono decidir

- **Domínio próprio**: hoje todas as URLs (canonical, Open Graph, JSON-LD, `robots.txt`,
  `sitemap.xml`, hreflang) apontam para `https://bessaq.github.io/ahninat-studio/`. Com um
  domínio próprio, todas precisam mudar juntas (o `README.md` já descreve o passo a passo).
- **Search Console e Bing Webmaster Tools**: os lugares para colar os códigos de
  verificação já estão comentados no `<head>`; falta criar as propriedades e colar os
  códigos (passo a passo no `README.md`).
- **Perfis nas redes para o `sameAs`**: o JSON-LD da `Organization` pode ganhar um campo
  `sameAs` com os perfis reais do Instagram e do LinkedIn assim que existirem (hoje
  `CONFIG.instagram` e `CONFIG.linkedin` estão vazios em `main.js`).
- **Perguntas frequentes**: uma seção de FAQ (com `FAQPage` no JSON-LD) ajudaria a
  capturar buscas sobre o que são Astrologic e Numerologic, mas precisa de perguntas e
  respostas reais definidas pelo dono, não inventadas aqui.
- **Páginas próprias por produto**: hoje Astrologic e Numerologic são seções da página
  única. Páginas dedicadas (`/astrologic`, `/numerologic`) dariam URLs próprias para
  indexação e compartilhamento, mas mudam a estrutura do site (fora do escopo desta
  tarefa, que pediu não mudar a identidade visual nem a arquitetura da página).
