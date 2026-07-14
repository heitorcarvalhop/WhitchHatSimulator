# Criando feitiços

Há duas formas de adicionar um feitiço ao Arcane Forge: pelo **Laboratório Arcano** (recomendado, sem código) ou editando o código-fonte (para feitiços embutidos que devem vir de fábrica com o jogo).

## Pelo Laboratório Arcano

1. Abra o menu **Laboratório** na barra superior (ou o botão "Laboratório" no menu mobile).
2. No painel **Novo feitiço**, desenhe o símbolo desejado na área tracejada. Cada traço de caneta/mouse levantado conta como um traço distinto do template — símbolos com múltiplos traços (como o quadrado + ponto de Terra) são suportados.
3. Marque **"A ordem dos traços importa"** se a sequência em que os traços são desenhados deve ser respeitada durante o reconhecimento; desmarque para permitir qualquer ordem.
4. Preencha nome, elemento, dificuldade, custo de energia, nível necessário, preset de partículas, perfil sonoro, cor, descrição e história.
5. Use o painel **Testar** para redesenhar o símbolo e verificar a porcentagem de similaridade antes de salvar.
6. Clique em **Salvar feitiço**. Ele passa a aparecer no Grimório e pode ser conjurado normalmente, sujeito ao seu nível e energia.

Para editar, duplicar ou excluir, use os ícones ao lado de cada feitiço na lista **Feitiços personalizados**.

## Formato JSON (importação/exportação)

O botão **Exportar todos (JSON)** gera um arquivo com todos os seus feitiços personalizados; **Importar JSON** aceita tanto um único objeto quanto um array desses objetos. Cada feitiço importado é validado estruturalmente antes de ser aceito — qualquer erro é listado na tela, e feitiços inválidos são rejeitados individualmente (os válidos de um lote ainda são importados).

Formato esperado de um feitiço:

```json
{
  "id": "custom-spell-exemplo",
  "name": "Nova Aurora",
  "element": "light",
  "difficulty": "adept",
  "description": "Um clarão que revela caminhos ocultos.",
  "lore": "Criado por um aprendiz que temia o escuro.",
  "energyCost": 24,
  "color": "#ffe27a",
  "particlePresetId": "energy",
  "soundId": "light",
  "unlockLevel": 2,
  "template": {
    "orderMatters": false,
    "strokes": [
      [
        { "x": 50, "y": 10, "t": 0 },
        { "x": 90, "y": 90, "t": 16 },
        { "x": 10, "y": 90, "t": 32 }
      ]
    ]
  }
}
```

### Campos

| Campo                   | Tipo        | Restrições                                                                                                                                              |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                    | `string`    | Único, não vazio                                                                                                                                        |
| `name`                  | `string`    | 1–40 caracteres                                                                                                                                         |
| `element`               | `string`    | Um de: `fire`, `water`, `air`, `earth`, `light`, `shadow`, `electric`, `ice`, `nature`, `arcane`                                                        |
| `difficulty`            | `string`    | Um de: `novice`, `adept`, `expert`, `master`                                                                                                            |
| `description`           | `string`    | até 400 caracteres                                                                                                                                      |
| `lore`                  | `string`    | até 800 caracteres                                                                                                                                      |
| `energyCost`            | `number`    | 1–100                                                                                                                                                   |
| `color`                 | `string`    | Hexadecimal `#rrggbb`                                                                                                                                   |
| `particlePresetId`      | `string`    | Um de: `fire`, `smoke`, `spark`, `water`, `snow`, `dust`, `leaves`, `energy`, `shadow`, `electric`                                                      |
| `soundId`               | `string`    | Idealmente um dos mesmos 10 elementos — define qual dos 10 perfis sonoros do motor de áudio é usado (pode divergir de `element` para efeitos criativos) |
| `unlockLevel`           | `number`    | ≥ 0 — nível mínimo do jogador para o feitiço ficar disponível                                                                                           |
| `template.orderMatters` | `boolean`   | Se a ordem dos traços deve ser respeitada no reconhecimento                                                                                             |
| `template.strokes`      | `Point[][]` | Um array por traço; cada ponto precisa de `x` e `y` numéricos (`t` e `pressure` são opcionais)                                                          |

A escala e a origem dos pontos não importam — o reconhecedor normaliza automaticamente escala e posição, então você pode desenhar em qualquer sistema de coordenadas consistente.

## Adicionando um feitiço embutido (via código)

Para um feitiço que deve existir desde o primeiro carregamento do jogo (sem depender do LocalStorage do jogador):

1. Adicione o template do símbolo em [`src/spells/templates.ts`](src/spells/templates.ts), usando os helpers de [`shapeBuilders.ts`](src/spells/shapeBuilders.ts) (`line`, `arc`, `polyline`, `spiral`, `star`, `dot`).
2. Adicione a definição completa em [`src/spells/spellDefinitions.ts`](src/spells/spellDefinitions.ts), seguindo o mesmo formato dos 10 feitiços existentes.
3. Se necessário, crie um novo preset de partícula em `src/particles/presets/` e registre-o em `src/particles/presets/index.ts`.
4. Rode `npm run test` para garantir que os testes de reconhecimento e do motor de feitiços continuam passando.

## Criando um novo preset de partículas

Cada preset implementa a interface `ParticlePreset` (`src/types/particle.ts`): quantidade, velocidade, direção, gravidade, rotação, escala, opacidade, cores, blend mode, aceleração, turbulência, forma da textura, raio de emissão e tempo de vida. Veja [`src/particles/presets/fire.ts`](src/particles/presets/fire.ts) como referência mínima.

## Criando um novo perfil sonoro

Cada perfil é uma `TonePreset` em [`src/audio/soundPresets.ts`](src/audio/soundPresets.ts): forma de onda, frequências, envelope ADSR simplificado, filtro e mistura de ruído. Adicione uma entrada em `ELEMENT_TONE_PRESETS` (ou `UI_TONE_PRESETS` para efeitos de interface) — nenhum arquivo de áudio é necessário, tudo é sintetizado em tempo real pelo `AudioEngine`.
