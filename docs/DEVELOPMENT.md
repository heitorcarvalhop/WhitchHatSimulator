# Notas de desenvolvimento

Referência rápida de padrões e comandos usados neste projeto.

## Checks antes de commitar

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Para mudanças que tocam a interface, rode também os testes de ponta a ponta:

```bash
npm run test:e2e
```

## Padrões de código

- **TypeScript estrito**: `strict: true` está habilitado no `tsconfig`. Evite `any` — o ESLint falha o build (`@typescript-eslint/no-explicit-any`) se ele aparecer.
- **Sem comentários óbvios**: comente apenas o que não é evidente pelo código (uma decisão não intuitiva, um workaround, uma invariante escondida).
- **Componentes pequenos e focados**: se um componente React ultrapassar responsabilidades claramente distintas, extraia subcomponentes ou hooks.
- **Lógica de domínio fora do React**: reconhecimento, motor de feitiços, combinações, progressão e persistência devem permanecer livres de dependências de React, para continuarem testáveis isoladamente.
- **Prettier**: rode `npm run format` antes de commitar.

## Estrutura de commits

Mensagens no imperativo, descrevendo o "porquê" quando não for óbvio pelo "o quê":

```
Corrige cálculo de estabilidade para tier "fail"

A fórmula anterior podia gerar estabilidade negativa quando a precisão
ficava abaixo de 20%, quebrando a barra de estabilidade na UI.
```

## Adicionando testes

- Toda nova função pura em `recognition/`, `spells/`, `combinations/`, `progression/` ou `storage/` deve vir acompanhada de um arquivo `*.test.ts` colocalizado.
- Todo novo fluxo relevante (uma nova tela, uma nova ação principal) deve ganhar um cenário em `e2e/`.

## Feitiços personalizados vs. embutidos

- Feitiços personalizados: crie pelo [Laboratório Arcano](SPELL_CREATION.md), sem precisar tocar em código.
- Feitiços embutidos (padrão para todos os jogadores) ou novas combinações fixas: editados diretamente no código — veja o guia em [SPELL_CREATION.md](SPELL_CREATION.md).
