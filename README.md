# Template alimentício (Astro)

Landing page com cardápio e pedido finalizado no WhatsApp. Um template
só pra hamburgueria, pizzaria, restaurante e cafeteria.

## Rodar localmente

```
npm install
npm run dev
```

## Adaptar pra um cliente novo

Nada de código precisa mudar. São 4 lugares:

1. **`src/data/loja.json`**: nome, WhatsApp (só números, com 55 e DDD),
   endereço, horários (0 = domingo), bairros e taxas de entrega
   (`taxa: null` = "a combinar"), formas de pagamento e todos os textos
   das seções.
2. **`src/data/cardapio.json`**: categorias e itens.
   - `grupos` no topo do arquivo são opções reutilizáveis (tamanho,
     borda, adicionais...). No item, referencia pelo nome:
     `"grupos": ["tamanho-pizza", "borda-pizza"]`, ou escreve o grupo
     direto dentro do item.
   - `tipo`: `"unico"` (escolhe 1) ou `"multiplo"` (com `max`).
   - `obrigatorio: true` obriga a escolher antes de adicionar.
   - `meioAMeio: true` libera meio a meio com os outros itens da mesma
     categoria que também tenham a flag. Cobra o preço do mais caro.
   - `destaque: true` coloca o item nos destaques com foto grande (máx 4).
   - `indisponivel: true` mostra "Esgotado hoje".
3. **`src/styles/global.css`**: paletas no topo. As cores são por
   função (fundo, texto, título, botão, faixas de cada seção). Pra um
   cliente novo, copia um bloco `[data-paleta="..."]`, troca os hex e
   aponta `"paleta"` no `loja.json`. Paletas prontas: `tomate` (padrão)
   e `vinho` (a primeira versão). Pra comparar no navegador sem mexer
   em nada: `?paleta=vinho` no fim da URL.
4. **`public/img/`**: fotos do cliente (hero 2000px, itens 900x900).
   A vitrine que passa na seção "Sobre" é a lista `sobre.vitrine` no
   `loja.json` (quantas fotos quiser).

## Campos novos no loja.json

- `pagamentosInfo`: frase que aparece quando a pessoa escolhe cada forma
  de pagamento (ex: como funciona o Pix)
- `bairroCombinar`: aviso pra bairro sem taxa fixa (`taxa: null`)
- O resumo de horário do rodapé e do hero é gerado da tabela `horarios`,
  não precisa digitar
- No cardápio, itens em destaque aceitam `chamada` (frase curta de venda)
- `tempoResposta`: aparece na tela final ("a gente costuma responder em...")
- `cardapioIntro.titulo` aceita `{itens}`, que vira o número de itens disponíveis
- `visita.chamada`: frase falada acima do título da visita. Se o título for
  igual a `endereco.rua`, a rua não se repete na lista de informações
- Os quatro títulos têm formatos diferentes de propósito (número, pergunta,
  frase longa, endereço). Ao trocar o texto, manter formas diferentes
- `pedidoMinimo`: valor mínimo em produtos pra entrega (0 desliga). Retirada não tem mínimo
- `icone`: cores do favicon gerado (`src/pages/favicon.svg.ts` usa a inicial do nome).
  Com logo de verdade, apaga esse arquivo e coloca `public/favicon.svg`. O
  `public/apple-touch-icon.png` (180x180, ícone no iPhone) precisa ser refeito por cliente
- `hero.comanda`: o papel de pedido no hero. `destaque` (frase curta em letra
  grande, ex: "Sem taxa de app") e `texto` (uma linha de apoio). No celular
  aparece só isso; no desktop o papel também mostra bairro e horários
- Bairro com `"outro": true` (ex: "Outro bairro") pede o nome do bairro num campo
  próprio, e esse nome vai pra mensagem
- Formas de pagamento valem pra entrega e retirada ao mesmo tempo: use nomes
  neutros ("Cartão", não "Cartão na entrega") e explique a diferença em `pagamentosInfo`
- Fotos: basta colocar em `public/img/`. O `npm run dev`/`build` gera as versões
  WebP em `public/img/otim/` e o `src/data/imagens.json` sozinho (`npm run imagens`
  roda à mão). Pra boa nitidez, fotos de item com pelo menos 900px
- `--foto-filtro` (em cada paleta do global.css): tratamento de cor aplicado nas fotos
  do cardápio pra fotos de origens diferentes combinarem. `none` desliga
- Itens sem nenhum grupo de opção entram direto no pedido pelo "+", sem abrir o painel
- Opções com `"silencioso": true` (ex: "Sem borda recheada") contam no preço mas não aparecem na mensagem
- Grupos obrigatórios sem `padrao` aceitam `pedir` (texto do botão enquanto
  falta escolher, ex: "Escolhe o sabor")

## Como o pedido funciona

- Carrinho salvo no navegador (não perde se fechar a página)
- Qualquer item da sacola pode ser editado (opções, quantidade, obs)
- Barra fixa no topo mostra "aberto/fechado" durante a rolagem inteira
- Dados do cliente (nome, endereço) ficam salvos pro próximo pedido
- Fora do horário: aviso no hero, na barra e no pedido desde o começo;
  o botão de enviar bloqueia (`aceitarPedidoFechado: true` libera)
- Ao abrir a página, o pedido salvo é conferido com o cardápio atual:
  preço atualizado e item esgotado saem com aviso
- Nome, endereço e pagamento ficam salvos enquanto a pessoa digita
- Depois de abrir o WhatsApp o pedido continua salvo, com botão pra
  abrir de novo; só limpa em "Já mandei, começar outro pedido"
- No celular, arrastar o topo do painel pra baixo fecha
- A mensagem abre no WhatsApp já formatada com itens, opções, taxa,
  total, endereço e pagamento

## Referência

[MORNI (Framer)](https://mornibali.framer.website/): usada como
referência de linha visual (hero escuro com título condensado, blocos
de cor chapada, cardápio em lista com linhas finas, logo gigante no
rodapé). Nada foi copiado, só o padrão.

## Fotos

Fotos de demonstração. Trocar pelas fotos reais do cliente.

- Unsplash (licença livre, sem crédito obrigatório): todas, menos as duas abaixo
- Wikimedia Commons (pedem crédito se forem pra um site publicado):
  - `pao-de-queijo.jpg`: "Cheesebread", Murilo Manzini, CC BY-SA 4.0
  - `pudim.jpg`: "Bar Guanabara - pudim de leite", Monica Kaneko, CC BY-SA 2.0
