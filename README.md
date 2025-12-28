# Estimativa - Placar Digital

PWA para controle de pontuação do jogo de cartas **Estimativa**.

## Sobre o Jogo

Estimativa é um jogo de cartas brasileiro onde os jogadores devem prever quantas rodadas irão vencer. A habilidade está em avaliar corretamente a força da sua mão e acertar a estimativa.

## Funcionalidades

- Cadastro de 2 a 10 jogadores com posições na mesa
- Cálculo automático de rodadas (crescente par, decrescente ímpar)
- Coleta de estimativas na ordem correta (sentido anti-horário, começando à direita do dealer)
- Registro de vitórias com validação automática
- Sistema de pontuação:
  - **Acertou**: +10 × vitórias
  - **Zero certeiro**: +5 pontos
  - **Errou**: -10 × diferença
- Histórico de partidas com persistência local
- Interface skeumórfica (mesa de feltro verde)
- Suporte offline via PWA

## Stack Tecnológica

- React 18 + TypeScript
- Vite 7
- Tailwind CSS v4
- Zustand (gerenciamento de estado)
- React Router v7
- PWA com vite-plugin-pwa

## Instalação

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Licença

MIT
