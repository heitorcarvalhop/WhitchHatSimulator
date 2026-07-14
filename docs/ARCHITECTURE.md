# Arquitetura

Este documento descreve como as camadas do Arcane Forge se conectam. Para instalação e execução, veja o [README](README.md).

## Visão geral

```
Pointer Events ──▶ drawing/ ──▶ Gesture ──▶ recognition/ ──▶ RecognitionOutcome
                                                   │
                                                   ▼
                                     services/spellExecutionService.ts
                                        (orquestra: energia, tiers,
                                         combinações, XP, desafios)
                                                   │
                       ┌───────────────────────────┼───────────────────────────┐
                       ▼                            ▼                           ▼
                particles/ (PixiJS)           audio/ (Web Audio)      app/ (estado React)
```

Nada em `recognition/`, `spells/`, `combinations/`, `progression/` ou `services/` depende de React — são módulos puros e testáveis isoladamente. A camada React (`app/`, `components/`, `pages/`) consome esses módulos e cuida de efeitos colaterais (renderização, áudio, partículas).

## Captura de gestos (`drawing/`)

- `useDrawing.ts` liga eventos `pointerdown/move/up/cancel` a uma lista mutável de `Stroke[]` guardada em `useRef` — o traço em progresso **não** vive no estado do React, para que `pointermove` nunca dispare um re-render.
- `DrawingCanvas.tsx` roda um loop próprio de `requestAnimationFrame` que lê esses refs a cada quadro e desenha via `strokeRenderer.ts`, produzindo o efeito de "linha de energia" (glow duplo, largura reativa à velocidade, fade opcional).
- `strokeAnalysis.ts` deriva velocidade, direção, curvatura e bounding box de um traço — usado tanto para o visual quanto para feedback ao jogador.
- Ao finalizar (`getGesture()`), o componente expõe um `Gesture` imutável (cópia dos pontos) para o resto do sistema.

## Reconhecimento (`recognition/`)

- `geometry.ts`: funções puras de geometria (distância, reamostragem, normalização, busca de ângulo ótimo).
- `recognizer.ts`: `GestureRecognizer.recognize(gesture, templates, tolerance)` — compara um gesto contra uma lista de `RecognizableTemplate` e retorna os três candidatos mais próximos, o melhor match (se acima da tolerância) e um motivo de rejeição textual.
- É genérico o suficiente para reconhecer tanto os 10 feitiços embutidos quanto feitiços criados no Laboratório Arcano — ambos viram `RecognizableTemplate` da mesma forma.

## Feitiços (`spells/`)

- `templates.ts` + `shapeBuilders.ts`: geram os pontos de cada símbolo embutido de forma paramétrica (arcos, espirais, estrelas, polilinhas), num grid arbitrário 0–100 — o reconhecedor normaliza escala e posição, então a unidade não importa.
- `spellDefinitions.ts`: metadados de cada feitiço (elemento, dificuldade, custo, cor, preset de partícula, perfil sonoro).
- `spellEngine.ts`: mapeia precisão → tier (`fail`…`legendary`) segundo as faixas fixas do design, e calcula poder, custo de energia efetivo, estabilidade e chance de efeito especial.

## Combinações (`combinations/`)

- `combinationDefinitions.ts`: os pares fixos (Fogo+Ar, Água+Eletricidade…) mais um gerador dinâmico para "Aether + qualquer elemento".
- `combinationEngine.ts`: `detectCombination(previousCast, currentCast, spellsById)` — compara o par mais recente de conjurações dentro da janela de tempo de cada combinação.

## Orquestração (`services/spellExecutionService.ts`)

`executeCast(input)` é o único ponto que junta tudo: chama o reconhecedor, decide se há energia suficiente, calcula tier/poder, detecta combinação, atualiza XP/desafios/streak e devolve um `CastOutcome` imutável. É uma função pura (exceto por `Date.now()`), o que a torna trivial de testar (`spellExecutionService.test.ts`) sem precisar montar componentes React.

## Partículas (`particles/`)

- `ParticleSystem.ts`: engine com _object pooling_ — sprites são criados até `maxParticles` e reciclados indefinidamente; nunca aloca um novo `Sprite` em regime permanente.
- `presets/*.ts`: um preset por categoria obrigatória (fogo, fumaça, faísca, água, neve, poeira, folhas, energia, sombra, eletricidade), cada um implementando a interface comum `ParticlePreset`.
- `spellEffectMap.ts`: cada feitiço combina 2 presets (primário + acento), então todos os 10 presets obrigatórios são usados pelo elenco de feitiços.
- `textureFactory.ts`: gera texturas base (círculo, faísca, folha, estrela…) uma única vez via `Graphics.generateTexture`, e a cor vem do `tint` do sprite — mantém o cache pequeno independentemente de quantas cores diferentes existam.

## Áudio (`audio/`)

- `soundPresets.ts`: uma receita de síntese (osciladores + ruído filtrado) por elemento — 10 perfis sonoros distintos, mais efeitos de UI (clique, falha, perfeito, descoberta, carregamento).
- `AudioEngine.ts`: cria o grafo de áudio sob demanda (`AudioContext` só é criado/retomado após uma interação do usuário, respeitando as políticas de autoplay dos navegadores), mistura master/efeitos/ambiente, e aplica variação de pitch e panorâmica estéreo por conjuração.
- Nenhum arquivo de áudio externo é necessário — a aplicação funciona 100% com síntese em tempo real.

## Progressão e persistência (`progression/`, `storage/`)

- `progression/xp.ts`: curva de níveis e cálculo de XP por evento.
- `progression/challenges.ts`: avalia os 7 desafios a cada conjuração, de forma pura e sem regressão de progresso já conquistado.
- `storage/storage.ts`: leitura/escrita versionada no `localStorage` (`{ version, payload }`), com migração incremental (`migrations.ts`) pronta para novas versões do schema, exportação/importação de progresso e reset com confirmação.
- `storage/validation.ts`: valida estruturalmente qualquer feitiço customizado antes de ser aceito (import JSON ou formulário do Laboratório).

## Estado React (`app/`)

- `context.ts` define o shape do contexto (`AppStateValue`) e o `AppStateContext` em si — mantido separado do provider para não quebrar o _fast refresh_ do Vite.
- `AppStateContext.tsx` (`AppStateProvider`) combina os hooks de settings/progresso/feitiços customizados, controla a regeneração de energia (intervalo de 250 ms) e expõe `resolveCast`/`commitCastOutcome` para os componentes de UI.
- `useAppState.ts`: hook de consumo (`useContext` com checagem de provider ausente).

## Componentes (`components/`)

Organizados por área: `layout/` (casca da aplicação, painéis colapsáveis, navegação mobile), `center/` (palco de conjuração), `grimoire/`, `stats/`, `training/`, `lab/`, `settings/`, `common/` (primitivos reutilizáveis: botão, modal, slider, toggle, ícone).

## Testes

- **Unitários** (`*.test.ts` colocalizados): cobrem geometria, reconhecimento, engine de feitiços, combinações, XP, desafios, storage e validação — toda a lógica de domínio é testável sem DOM.
- **E2E** (`e2e/*.spec.ts`, Playwright): cobrem os fluxos de usuário — desenhar, limpar, reconhecer, abrir o grimório, alterar configurações, treinar e salvar um feitiço customizado — contra o build de produção real.
