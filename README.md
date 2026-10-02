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

## Publicação

GitHub Pages, a partir da branch `main`, raiz do repositório. Com um domínio próprio: criar o arquivo `CNAME` com o domínio, apontar o DNS para o GitHub Pages e trocar as URLs em `index.html` (canonical, og:url, og:image e JSON-LD), `robots.txt` e `sitemap.xml`.
