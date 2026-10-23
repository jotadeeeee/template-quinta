// Tipos e funções puras usadas tanto no build (Astro) quanto no navegador.

import cardapioRaw from "../data/cardapio.json";
import lojaRaw from "../data/loja.json";
import imagensRaw from "../data/imagens.json";

export interface Opcao {
  nome: string;
  preco: number;
  silencioso?: boolean; // escolha "nada" que não precisa ir pra mensagem (ex: sem borda)
}

export interface Grupo {
  id: string;
  nome: string;
  tipo: "unico" | "multiplo";
  obrigatorio: boolean;
  padrao?: number; // índice já marcado ao abrir o item
  pedir?: string; // texto do botão enquanto falta escolher ("Escolher o sabor")
  max?: number;
  opcoes: Opcao[];
}

export interface Item {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  foto?: string;
  destaque?: boolean;
  chamada?: string;
  tag?: string;
  meioAMeio?: boolean;
  indisponivel?: boolean;
  grupos: Grupo[];
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  itens: Item[];
}

export interface Horario {
  dia: number;
  abre: string;
  fecha: string;
}

export type Loja = typeof lojaRaw;

// Resolve grupos referenciados por id ("ponto-carne") para o objeto completo.
export function carregarCardapio(): Categoria[] {
  const compartilhados = cardapioRaw.grupos as Record<string, Omit<Grupo, "id">>;
  return cardapioRaw.categorias.map((cat) => ({
    ...cat,
    itens: cat.itens.map((item: any) => ({
      ...item,
      grupos: (item.grupos ?? []).map((g: any, i: number) =>
        typeof g === "string"
          ? { id: g, ...compartilhados[g] }
          : { id: `${item.id}-g${i}`, ...g },
      ),
    })),
  }));
}

export const loja: Loja = lojaRaw;

// Versões WebP geradas por scripts/otimizar-imagens.mjs (roda antes do dev e do build).
// Foto sem versão gerada (ou de fora de /img) fica só com o arquivo original.
const imagens = imagensRaw as Record<string, number[]>;
export const srcsetDe = (src?: string) =>
  src && imagens[src]
    ? imagens[src].map((w) => `${src.replace(/^\/img\/(.+)\.\w+$/, `/img/otim/$1-${w}.webp`)} ${w}w`).join(", ")
    : undefined;

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
// Espaço inquebrável entre "R$" e o valor: o "R$" nunca fica sozinho no fim da linha
export const formatarPreco = (v: number) => brl.format(v).replace(/\s/g, "\u00a0");

// Preço curto pro cardápio: "38" ou "38,50"
export const precoCurto = (v: number) =>
  Number.isInteger(v) ? String(v) : v.toFixed(2).replace(".", ",");

export const opcaoPreco = (p: number) => (p > 0 ? `+ ${formatarPreco(p)}` : "");

// ---------- Horário ----------

const minutos = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const horaLegivel = (hhmm: string) => {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
};

export interface Status {
  aberto: boolean;
  texto: string;
  curto: string; // versão pra telas estreitas
}

// Considera turnos que passam da meia-noite (ex: 18:00 às 01:00).
export function statusLoja(horarios: Horario[], agora = new Date()): Status {
  const dia = agora.getDay();
  const min = agora.getHours() * 60 + agora.getMinutes();
  const hoje = horarios.find((h) => h.dia === dia);
  const ontem = horarios.find((h) => h.dia === (dia + 6) % 7);

  if (ontem && minutos(ontem.fecha) < minutos(ontem.abre) && min < minutos(ontem.fecha)) {
    return { aberto: true, texto: `Aberto agora · até ${horaLegivel(ontem.fecha)}`, curto: `Aberto até ${horaLegivel(ontem.fecha)}` };
  }
  if (hoje) {
    const abre = minutos(hoje.abre);
    const fecha = minutos(hoje.fecha);
    const viraNoite = fecha < abre;
    if (min >= abre && (viraNoite || min < fecha)) {
      return { aberto: true, texto: `Aberto agora · até ${horaLegivel(hoje.fecha)}`, curto: `Aberto até ${horaLegivel(hoje.fecha)}` };
    }
    if (min < abre)
      return { aberto: false, texto: `Fechado · abre hoje às ${horaLegivel(hoje.abre)}`, curto: `Fechado · abre ${horaLegivel(hoje.abre)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const prox = horarios.find((h) => h.dia === (dia + i) % 7);
    if (prox) {
      const quando = i === 1 ? "amanhã" : DIAS[prox.dia].toLowerCase();
      return {
        aberto: false,
        texto: `Fechado · abre ${quando} às ${horaLegivel(prox.abre)}`,
        curto: `Fechado · abre ${i === 1 ? "amanhã" : DIAS[prox.dia].slice(0, 3).toLowerCase()} ${horaLegivel(prox.abre)}`,
      };
    }
  }
  return { aberto: false, texto: "Fechado", curto: "Fechado" };
}

export const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// Agrupa dias seguidos com o mesmo horário: "Dom a Qui · 11h30 às 23h30"
export function horariosAgrupados(horarios: Horario[]) {
  const curto = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const linhas: { dias: string; horas: string }[] = [];
  let bloco: number[] = [];
  let chave: string | null = null;
  const fechar = () => {
    if (!bloco.length) return;
    const ini = curto[bloco[0]];
    const fim = curto[bloco[bloco.length - 1]];
    const dias = bloco.length === 1 ? ini : bloco.length === 2 ? `${ini} e ${fim}` : `${ini} a ${fim}`;
    linhas.push({ dias, horas: chave || "Fechado" });
  };
  for (let d = 0; d < 7; d++) {
    const h = horarios.find((x) => x.dia === d);
    const k = h ? `${horaLegivel(h.abre)} às ${horaLegivel(h.fecha)}` : "";
    if (k !== chave) {
      fechar();
      bloco = [];
      chave = k;
    }
    bloco.push(d);
  }
  fechar();
  return linhas;
}

// Resumo de uma linha pro rodapé, sempre igual à tabela de horários
export const resumoHorario = (horarios: Horario[]) =>
  horariosAgrupados(horarios)
    .map((h) => `${h.dias} ${h.horas}`)
    .join(" · ");
