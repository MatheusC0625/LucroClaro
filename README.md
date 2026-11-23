# Lucro Claro

Painel web que mostra o lucro real da loja de um MEI que vende em marketplaces, com números simples e visuais.

> Projeto em desenvolvimento. Este README será completado ao final do MVP, com prints, decisões técnicas e próximos passos.

## O problema

A Central do Vendedor mostra vendas, mas não responde perguntas como "quanto sobrou de verdade?" ou "qual produto está dando prejuízo?". Faltam os custos do produto, os custos extras de cada pedido (sacola, etiqueta, brinde) e a leitura em linguagem simples.

## A solução

O Lucro Claro lê os relatórios exportados da Central do Vendedor e calcula o lucro real por dia, semana, mês e produto, com metas, comparação entre períodos e controle do limite anual do MEI.

**Privacidade:** os dados de vendas ficam salvos só no navegador de quem usa. Não existe servidor e nada é enviado pela internet.

## Tecnologias

- React, TypeScript e Vite
- Tailwind CSS
- React Router
- Dexie (IndexedDB) para guardar os dados no navegador
- Vitest para testar os cálculos

## Como rodar

Pré-requisito: Node.js instalado.

```bash
npm install
npm run dev
```

Outros comandos:

```bash
npm test
npm run build
```

## Etapas do MVP

- [x] Projeto base, layout e formatadores de moeda e data
- [x] Tipos, cálculos de lucro e banco local
- [x] Modo demonstração
- [ ] Produtos, custos extras e taxas
- [ ] Visão geral com metas
- [ ] Importação de relatórios
- [ ] Comparação de períodos
- [ ] Lucro por produto
- [ ] Controle do MEI
