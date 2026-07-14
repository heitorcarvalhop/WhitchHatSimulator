# Changelog

Este projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/) e o formato de [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [0.1.0] — Lançamento inicial

### Adicionado

- Sistema de desenho multi-traço via Pointer Events, com renderização em "linha de energia" (brilho duplo, largura reativa à velocidade, fade opcional).
- Reconhecedor geométrico próprio (inspirado no `$1`/`$N`), com suporte a múltiplos traços, invariância rotacional limitada e explicação de rejeição.
- Dez feitiços embutidos (Ignis, Aqua, Ventus, Terra, Lux, Umbra, Fulmen, Glacies, Vita, Aether), cada um com símbolo, elemento, dificuldade, custo de energia e efeitos visuais/sonoros próprios.
- Motor de partículas em PixiJS com _object pooling_ e dez presets obrigatórios (fogo, fumaça, faísca, água, neve, poeira, folhas, energia, sombra, eletricidade).
- Motor de áudio 100% procedural via Web Audio API — dez perfis sonoros elementais, variação de pitch, panorâmica estéreo, som de desenho, carregamento, falha, perfeição e descoberta.
- Sistema de combinações (Fogo+Ar, Água+Eletricidade, Água+Gelo, Terra+Fogo, Luz+Sombra, Ar+Gelo, Natureza+Água, Aether+qualquer elemento).
- Sistema de energia com regeneração contínua, bônus de precisão e restauração parcial via Vita.
- Seis faixas de precisão (falha → lendário) afetando intensidade, tamanho, duração, partículas, energia e estabilidade.
- Modo de treinamento com quatro níveis de ajuda (guia completo, pontos principais, símbolo transparente, sem ajuda).
- Modo livre de conjuração e descoberta.
- Laboratório Arcano: criação, edição, duplicação, exclusão, teste, exportação e importação (com validação) de feitiços personalizados.
- Grimório com busca, filtro por elemento, favoritos, estatísticas de conclusão e páginas de detalhe por feitiço.
- Progressão local (XP, níveis) e sete desafios.
- Painel de configurações completo: gráficos, áudio, sensibilidade de desenho, tolerância de reconhecimento, acessibilidade (alto contraste, redução de movimento/flashes, vibração, FPS), idioma e gerenciamento de dados (exportar/importar/restaurar com confirmação).
- Persistência versionada em LocalStorage com infraestrutura de migração.
- Layout totalmente responsivo, com painéis laterais colapsáveis no desktop e menus deslizantes no mobile.
- Suíte de testes unitários (Vitest) cobrindo geometria, reconhecimento, motor de feitiços, combinações, progressão, storage e validação.
- Suíte de testes de ponta a ponta (Playwright) cobrindo desenho, reconhecimento, grimório, configurações, treinamento e laboratório.
