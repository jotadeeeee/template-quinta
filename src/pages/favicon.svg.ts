import type { APIRoute } from "astro";
import { loja } from "../scripts/lib";

// Favicon genérico: inicial do nome da loja sobre a cor de ação.
// Pra trocar por um logo de verdade, apaga este arquivo e põe public/favicon.svg.
export const GET: APIRoute = () => {
  const letra = loja.nome.trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${loja.icone.fundo}"/>
  <text x="32" y="50" text-anchor="middle" font-family="Arial Black, Helvetica Neue, Arial, sans-serif" font-weight="900" font-size="50" fill="${loja.icone.letra}">${letra}</text>
</svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
};
