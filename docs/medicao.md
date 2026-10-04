# Medição de uso (BES-329)

O dono quer saber quantas pessoas chegam ao site e o que fazem nele, respeitando a LGPD.
Ele ainda não tem conta em nenhum serviço de análise: a medição entra **desligada** e só
liga quando `CONFIG.medicao` (em `main.js`) for preenchido.

```js
medicao: { provedor: "", id: "" },
```

Com `provedor` vazio, `iniciarMedicao()` retorna na primeira linha: nenhum script é pedido,
nenhum evento é enviado, a faixa de consentimento nunca aparece.

## Como ligar

| Provedor | `provedor` | `id` | Usa cookie? |
|---|---|---|---|
| Google Analytics 4 | `ga4` | ID de medição, ex. `G-XXXXXXX` | Sim |
| Plausible | `plausible` | domínio do site, ex. `ahninat.com.br` | Não |
| GoatCounter | `goatcounter` | código da conta, ex. `ahninat` | Não |
| Cloudflare Web Analytics | `cloudflare` | token do Web Analytics | Não |

Edite só essas duas linhas em `main.js` e publique. **Nunca escreva um identificador real
no repositório**: ele é público. Quem cria a conta e preenche o valor é o dono.

## O carregador (main.js)

Todo pedido de rede para um provedor de terceiros fica dentro de um único bloco, marcado
pelos comentários `// --- Carregador de medição ... ---` / `// --- Fim do carregador ... ---`
em `main.js`. O verificador (`scripts/verificar-site.mjs`) falha se:

- existir um `<script src>` de medição fixo em `index.html` (o carregamento tem que
  depender do `CONFIG.medicao`, não estar sempre presente na página);
- algum domínio de provedor (`googletagmanager.com`, `google-analytics.com`,
  `plausible.io`, `goatcounter.com`, `cloudflareinsights.com`) aparecer em `main.js` fora
  desse bloco;
- a faixa de consentimento não tiver `role="dialog"`, rótulo acessível ou os botões
  Aceitar/Recusar.

## Consentimento

Só o GA4 usa cookie, então só ele pede consentimento. Plausible, GoatCounter e Cloudflare
não usam cookie e carregam direto quando configurados, mas ainda respeitam um sinal
explícito de recusa do navegador (`navigator.globalPrivacyControl` ou `doNotTrack`): com
qualquer um dos dois ligados, nada é carregado, nem a faixa aparece.

Para o GA4:

1. No carregamento da página, `main.js` define o Consent Mode v2 com tudo negado
   (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`). Isso só
   organiza estado local (`dataLayer`); nenhum pedido sai da página aqui.
2. Se não houver sinal de recusa do navegador, a página consulta a escolha salva em
   `localStorage` (chave `ahninat:medicao`, com `aceitou` e a data). Sem escolha salva, a
   faixa aparece no rodapé da tela (`role="dialog"`, sem travar o resto da página).
3. Só depois do clique em "Aceitar" o `gtag.js` é pedido de fato e o consentimento muda
   para concedido. Em "Recusar", a escolha é salva e nada é carregado.
4. O link "Privacidade e medição" no rodapé reabre a faixa a qualquer momento, mesmo
   depois de uma escolha salva, para o visitante mudar de ideia.

## Eventos

Todos passam por uma função única, `medir(nome, dados)`, que não faz nada sem
consentimento (quando o provedor exige) nem sem o provedor carregado. **Nunca** entra
nome, e-mail, mensagem do formulário ou qualquer texto digitado pelo visitante.

| Evento | Quando dispara | Dados enviados |
|---|---|---|
| `cta_clique` | clique em qualquer `.botao` da página | `botao` (texto do botão), `secao` (id da seção, `cabecalho` ou `rodape`) |
| `produto_interesse` | clique em "Quero saber mais" / "Receber novidades" de um produto | `produto` (nome do produto ou "Parceria") |
| `contato_envio` | envio do formulário de contato (antes de abrir o `mailto:`) | `assunto` (opção escolhida no select, nunca o texto da mensagem) |
| `link_externo` | clique em link com `target="_blank"` (Instagram, LinkedIn) | `dominio` (host da URL, nunca a URL inteira) |
| `secao_vista` | primeira vez que 50% de uma seção entra na tela | `secao` (id da seção), uma vez por seção por visita |
| `rolagem` | a página passa de 50% ou de 90% de rolagem | `percentual` (50 ou 90), uma vez cada por visita |

### Por provedor

- **GA4**: `gtag("event", nome, dados)`.
- **Plausible**: `plausible(nome, { props: dados })`.
- **GoatCounter**: `goatcounter.count({ path, event: true })` (a API do GoatCounter não
  tem campos extras por evento; os dados viram parte do `path`, nunca texto livre).
- **Cloudflare Web Analytics**: o script público da Cloudflare não tem API de eventos
  personalizados, só contagem automática de página vista. Com `provedor: "cloudflare"`,
  `medir()` fica sem efeito para os seis eventos acima; só a visita à página é contada.

## O que muda com e sem consentimento

| Situação | Script de terceiro pedido? | Eventos enviados? |
|---|---|---|
| `provedor` vazio | Não, nunca | Não |
| Provedor sem cookie (`plausible`, `goatcounter`, `cloudflare`), sem sinal de recusa | Sim, direto | Sim |
| Provedor sem cookie, com `globalPrivacyControl`/`doNotTrack` ligado | Não | Não |
| `ga4`, antes de qualquer escolha | Não (só o `dataLayer` local) | Não |
| `ga4`, visitante aceita | Sim, a partir do aceite | Sim, a partir do aceite |
| `ga4`, visitante recusa (ou `globalPrivacyControl`/`doNotTrack` ligado) | Não | Não |

## Demonstração (provedor vazio, estado atual do repositório)

`<script src>` externos em `index.html`, antes e depois desta tarefa: nenhum (só
`main.js`, local, e a folha de estilo da Inter, que não é `<script>`). A tarefa não
adicionou nenhum `<script src>` fixo de medição: o único jeito de um pedido sair da página
é preencher `CONFIG.medicao` e um visitante aceitar (quando o provedor exigir).
`node scripts/verificar-site.mjs` confirma isso (seção "Saída do verificador" no
`README.md` e no comentário final da entrega).

## Para o dono decidir

- **Qual provedor**: Plausible e GoatCounter são os mais simples de ligar sem faixa de
  consentimento (sem cookie, sem conta Google). O GA4 tem mais relatórios prontos, mas
  exige a faixa e uma conta Google. A Cloudflare só serve se o domínio já estiver atrás da
  Cloudflare e o dono aceitar não ter eventos personalizados.
- **Metas de conversão**: hoje os eventos existem, mas nenhum está marcado como "meta" no
  provedor (isso se configura no painel de cada serviço, depois de criar a conta). O
  candidato mais natural é `contato_envio`; `produto_interesse` complementa mostrando qual
  produto puxou mais o visitante.
- **Domínio próprio**: quando o domínio mudar (ver `README.md`), o Plausible e o
  GoatCounter podem exigir atualizar o valor de `CONFIG.medicao.id` para o novo domínio
  configurado na conta do provedor.
