# Ahninat Studio

Site institucional da Ahninat Studio, estúdio de tecnologia e produtos digitais. Página única, HTML, CSS e JavaScript sem build, publicada pelo GitHub Pages.

Direção: **Tecnologia que sustenta o próximo passo.** A página segue o Manual de Marca v1.0 (setembro de 2026): paleta petróleo, grafite, marfim e coral; Inter como fonte de apoio; grid de 8 px; coral só como acento; o sistema gráfico dos "campos que se encontram".

## Estrutura

```
index.html      a página (hero, produtos, soluções, processo, manifesto, sobre, contato)
styles.css      estilos, com os tokens da marca no :root
main.js         menu, link ativo, entrada suave, formulário de contato (mailto)
404.html        página de erro do GitHub Pages
assets/         logo (horizontal e vertical, grafite e marfim), símbolo SVG, ícones, imagem de compartilhamento
marca/          kit de marca: manual (PDF), estratégia e textos, tokens.json, logos em PNG
```

## Editar

- **Contatos:** `main.js`, bloco `CONFIG` (e-mail, Instagram, LinkedIn). Rede vazia não aparece na página.
- **Textos:** direto no `index.html`. Os textos vêm de `marca/Estrategia_e_Textos.md` (tom de voz: preciso, próximo e sereno; nada de números, clientes ou certificações sem evidência).
- **Cores, tipografia, cantos e movimento:** `styles.css`, `:root`, conforme `marca/tokens.json`.
- **Logo:** os PNG em `assets/` foram recortados da referência do manual (não existe o vetor original do lettering). O símbolo tem versão vetorial (`assets/simbolo.svg`).

Para ver localmente, basta abrir o `index.html` no navegador ou servir a pasta (`python3 -m http.server`).

## Verificar o SEO técnico

`node scripts/verificar-site.mjs` confere o `index.html` (âncoras, imagens, title/description,
endereço base consistente entre canonical/og/JSON-LD/robots.txt/sitemap.xml, JSON-LD válido,
hierarquia de títulos, travessão em texto visível e arquivos locais referenciados). Rode antes
de publicar qualquer mudança de marcação; ele falha com `exit 1` e lista o que corrigir.

## Verificação de propriedade (Google Search Console e Bing)

1. Criar a propriedade em [Google Search Console](https://search.google.com/search-console) e em
   [Bing Webmaster Tools](https://www.bing.com/webmasters), usando `https://bessaq.github.io/ahninat-studio/`
   (ou o domínio próprio, se já existir).
2. Cada ferramenta entrega um código de verificação por metatag. Colar o código nos lugares já
   comentados no `<head>` de `index.html`: `google-site-verification` e `msvalidate.01`.
3. Publicar o site (merge na `main`) e confirmar a verificação em cada painel.
4. Enviar `https://bessaq.github.io/ahninat-studio/sitemap.xml` como sitemap em cada ferramenta.

## Publicação

GitHub Pages, a partir da branch `main`, raiz do repositório. Com um domínio próprio: criar o arquivo `CNAME` com o domínio, apontar o DNS para o GitHub Pages e trocar as URLs em `index.html` (canonical, og:url, og:image, hreflang e JSON-LD), `robots.txt` e `sitemap.xml`.
