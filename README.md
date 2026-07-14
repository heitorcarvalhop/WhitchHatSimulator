# Arcane Forge — Interactive Spell Simulator

> Desenhe símbolos mágicos, sinta a energia se acumular sob a ponta do seu dedo (ou mouse) e observe feitiços vivos — fogo, água, luz, sombra, gelo e mais — irromperem em um grimório interativo.

Arcane Forge é uma demonstração de jogo indie construída inteiramente com tecnologias web: um simulador de conjuração onde o jogador desenha gestos com Pointer Events, um reconhecedor geométrico próprio interpreta o símbolo, e um motor de partículas em PixiJS transforma o resultado em um espetáculo visual e sonoro.

O nome do projeto é configurável em [`src/config/appConfig.ts`](src/config/appConfig.ts) — altere `APP_CONFIG.name` para rebatizar a aplicação em todas as telas.

## Capturas de tela

> _Substitua os espaços reservados abaixo por capturas de tela reais após executar o projeto localmente (`npm run dev`)._

| Tela principal                          | Conjurando um feitiço                   | Laboratório Arcano                     |
| --------------------------------------- | --------------------------------------- | -------------------------------------- |
| `docs/screenshots/home.png` (reservado) | `docs/screenshots/cast.png` (reservado) | `docs/screenshots/lab.png` (reservado) |

| Grimório                                    | Modo de treinamento                         | Mobile                                    |
| ------------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| `docs/screenshots/grimoire.png` (reservado) | `docs/screenshots/training.png` (reservado) | `docs/screenshots/mobile.png` (reservado) |

## Tecnologias

- **React 18 + TypeScript (strict)** — UI declarativa e tipada de ponta a ponta.
- **Vite** — dev server e bundler.
- **HTML5 Canvas** — captura e renderização das energias de traço em tempo real.
- **PixiJS 8** — motor de partículas 2D acelerado por WebGL, com pooling de objetos.
- **Web Audio API** — todo o áudio é sintetizado proceduralmente (osciladores + ruído filtrado), sem dependência de arquivos de mídia externos.
- **CSS moderno** — variáveis, `color-mix()`, `backdrop-filter`, animações declarativas.
- **Vitest + Testing Library** — testes unitários.
- **Playwright** — testes de ponta a ponta.
- **ESLint + Prettier** — qualidade e formatação de código.
- **LocalStorage** — persistência versionada de configurações, progresso e feitiços personalizados.

Nenhuma dependência de UI, ícones, áudio ou animação de terceiros foi utilizada além das listadas acima — todo o visual é gerado via Canvas, SVG e CSS.

## Estrutura do projeto

```text
src/
  app/            # Estado global (Context), regeneração de energia, toasts
  assets/         # (reservado para futuros assets estáticos)
  audio/          # Motor de áudio procedural (Web Audio API)
  canvas/         # Círculo mágico, brilho do cursor, névoa de fundo, camada de partículas
  combinations/   # Definições e motor de combinações de feitiços
  components/     # Componentes React organizados por área (grimoire, stats, lab, training…)
  config/         # Configuração central da aplicação (nome, versão…)
  drawing/        # Captura de gestos via Pointer Events + renderização de traços
  hooks/          # Hooks reutilizáveis (settings, progresso, atalhos de teclado…)
  pages/          # Páginas de alto nível (Home, Laboratório)
  particles/      # Motor de partículas (PixiJS) + presets por elemento
  progression/    # XP, níveis e desafios
  recognition/    # Reconhecedor geométrico de gestos (estilo $1/$N)
  services/       # Orquestração de conjuração + persistência
  spells/         # Definições dos 10 feitiços + templates de símbolos
  storage/        # Persistência versionada em localStorage + validação
  styles/         # CSS global, tema e animações
  tests/          # Setup compartilhado do Vitest
  types/          # Interfaces TypeScript centrais
  utils/          # Funções utilitárias puras
e2e/              # Testes de ponta a ponta (Playwright)
```

## Instalação

Pré-requisitos: Node.js 20+ e npm.

```bash
npm install
```

## Execução

```bash
npm run dev
```

Acesse `http://localhost:5173`. Nenhuma configuração adicional, chave de API ou serviço externo é necessária — o áudio é sintetizado no navegador e o progresso é salvo localmente.

## Testes

```bash
npm run test          # testes unitários (Vitest)
npm run test:watch    # modo watch
npm run test:e2e      # testes de ponta a ponta (Playwright) — builda e sobe um preview automaticamente
```

## Build de produção

```bash
npm run build     # gera ./dist
npm run preview   # serve o build de produção localmente
```

Outros comandos úteis: `npm run lint`, `npm run format`, `npm run typecheck`.

## Arquitetura

Veja [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para uma descrição detalhada de cada camada (desenho, reconhecimento, partículas, áudio, progressão, persistência) e como elas se conectam através do `AppStateContext`.

## Sistema de reconhecimento

O reconhecedor (`src/recognition/`) é uma implementação própria inspirada no algoritmo **$1 Unistroke Recognizer**, estendida para suportar **múltiplos traços**:

1. Cada traço é capturado como uma sequência de pontos `{x, y, t, pressure}`.
2. Para símbolos com mais de um traço, o reconhecedor gera candidatos combinando **todas as ordens plausíveis** e **todas as direções de traçado** (com um teto de segurança para evitar explosão combinatória), imitando a ideia central do algoritmo `$N`.
3. Cada candidato é normalizado: pontos redundantes são removidos, o caminho é reamostrado para 64 pontos equidistantes, escalado para um quadrado de referência e centralizado.
4. A distância entre o traçado do jogador e cada modelo de feitiço é calculada com invariância rotacional limitada (busca da seção áurea, como no `$1`), preservando símbolos que dependem de orientação (ex.: a lua minguante invertida de Umbra).
5. A menor distância vira uma pontuação de 0–100%, usada tanto para decidir **qual** feitiço foi desenhado quanto **quão bem** ele foi desenhado (precisão → tier: falha, instável, comum, poderoso, perfeito, lendário).
6. Os três candidatos mais próximos são sempre retornados, permitindo que a interface explique por que um desenho não foi reconhecido.

O reconhecedor é desacoplado de React e de qualquer detalhe de spell (`GestureRecognizer.recognize(gesture, templates, tolerance)`), então pode ser substituído por um modelo de machine learning no futuro sem tocar na UI — basta implementar a mesma interface de saída (`RecognitionOutcome`).

## Criação de feitiços (Laboratório Arcano)

O **Laboratório Arcano** (`/` → botão "Laboratório") permite:

- Desenhar um símbolo novo (multi-traço, com opção de "a ordem importa").
- Configurar nome, elemento, dificuldade, custo de energia, nível de desbloqueio, preset de partículas, perfil sonoro e cor.
- Testar o reconhecimento do símbolo em tempo real antes de salvar.
- Salvar, editar, duplicar e excluir feitiços personalizados.
- Exportar/importar feitiços como JSON — todo dado importado passa por validação estrutural (`src/storage/validation.ts`) antes de ser aceito.

Veja [docs/SPELL_CREATION.md](docs/SPELL_CREATION.md) para o guia completo, incluindo o formato JSON esperado.

## Personalização

- **Nome do app**: `src/config/appConfig.ts`.
- **Paleta e tema**: `src/styles/theme.css` (variáveis `--af-*`).
- **Novos presets de partículas**: adicione um arquivo em `src/particles/presets/` seguindo o padrão dos existentes.
- **Novos feitiços embutidos**: adicione uma entrada em `src/spells/spellDefinitions.ts` e o template correspondente em `src/spells/templates.ts` (ou crie via Laboratório Arcano, sem editar código).

## Decisões técnicas

- **Reconhecimento geométrico próprio em vez de ML**: mantém o projeto 100% funcional offline, sem modelos pesados ou dependências de treinamento, e é totalmente explicável (cada rejeição tem um motivo claro).
- **Áudio 100% procedural**: elimina qualquer questão de direitos autorais e garante que a aplicação nunca "quebre" por um asset ausente — todo som nasce de osciladores e ruído filtrado no momento da reprodução.
- **Object pooling de partículas**: sprites são criados uma vez até o limite configurado e reciclados para sempre, mantendo o _frame rate_ estável mesmo em combos intensos.
- **Refs mutáveis para o traçado ativo**: o traço em andamento é mantido fora do estado do React (em `useRef`) e desenhado via `requestAnimationFrame`, evitando um re-render do componente a cada evento `pointermove`.
- **Contexto único de estado (`AppStateContext`)**: energia, progresso, configurações e feitiços customizados vivem num único provider, evitando _prop drilling_ profundo entre grimório, stage e painel de estatísticas.
- **Sem roteador**: a aplicação tem poucas telas de alto nível; um `useState` simples alterna entre "Jogar" e "Laboratório", evitando uma dependência extra.

## Melhorias futuras

- Reconhecimento assistido por um modelo leve de ML (ex.: um classificador treinado sobre as features já extraídas), mantendo o motor geométrico como fallback.
- Multiplayer cooperativo/competitivo de conjuração em tempo real.
- Editor visual de presets de partículas dentro do próprio Laboratório Arcano.
- Internacionalização completa (a estrutura de `UserSettings.language` já reserva o campo).
- Modo campanha com desafios sequenciais e narrativa.
