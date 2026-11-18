# Proposal

## Why

A entrada por uma lista de pessoas e a exposição simultânea de controles da demonstração, ações de estudo e indicadores tornam o próximo passo pouco evidente. Reorganizar a experiência do aluno, usando a composição do `../../../../index.html` como referência visual e o React atual como base funcional, permitirá priorizar a ação de aprendizagem e consultar os detalhes quando necessário.

## What Changes

- Entrada em duas etapas: escolher uma função disponível e depois uma pessoa ativa com essa função; entrar na área escolhida e manter a troca de áreas da mesma conta.
- Cabeçalho compacto com identificação da seção, pessoa e área; data simulada, avanço de dia e restauração reunidos em **Demonstração**, recolhida por padrão, com aviso e confirmação preservados.
- Minhas turmas com identificação acadêmica completa, estado textual e ação principal **Começar trilha**, **Continuar trilha** ou **Ver trilha**; **Desempenho** permanece secundário. Ausência de respostas será distinta de estudo iniciado com progresso de 0%.
- Trilha com progresso, tópicos ordenados, estados e próximo tópico recomendado pelo motor; materiais liberados e desempenho acessíveis; XP e sequência compactos e detalhes de conquistas recolhidos.
- Sessão com questão e alternativas em primeiro plano; resumo lateral restrito a disciplina, turma, período, progresso e **Ver trilha** no desktop, convertido em faixa compacta no celular. Feedback, revisão sugerida e avanço explícito permanecem.
- Navegação por teclado, foco visível, contraste AA, estados textuais e uso a 360 px sem rolagem horizontal nas telas abrangidas.

O cabeçalho e a navegação compartilhada podem mudar em todos os perfis. Painéis e formulários específicos de Professor, Coordenador, Administrador e Responsável ficam fora do redesign. Catálogo, materiais e desempenho do aluno mantêm suas funcionalidades e recebem somente a integração visual e de navegação necessária.

## Capabilities

### New Capabilities

- `navegacao-acessivel`: navegação compartilhada com localização atual, hierarquia visual compacta e critérios de teclado, contraste e adaptação de largura nas superfícies reorganizadas.

### Modified Capabilities

- `perfis-acesso`: evoluir **Entrada simulada no protótipo** para função antes de pessoa, sem modificar permissões cumulativas ou vínculos.
- `organizacao-academica`: evoluir **Demonstração fictícia e restauração** para controles recolhidos e restauração com os mesmos efeitos e proteções.
- `catalogo-cursos`: evoluir **Minhas turmas** para estados e ações principais por matrícula, mantendo identificação das ofertas, rascunhos e ausência de automatrícula.
- `aprendizado-adaptativo`: acrescentar apresentação da trilha e sessão; evoluir **Feedback imediato** com permanência da questão e avanço explícito, preservando todos os critérios do motor e de revisão.
- `gamificacao`: evoluir **Exibição de gamificação** com resumo e detalhes sob demanda, mantendo contabilização por Aluno–Turma.
- `acompanhamento-desempenho`: evoluir **Painel do aluno** para acesso secundário e distinção textual entre ausência de respostas e taxa de acertos zero com atividade.

Os deltas mantêm os títulos dos requisitos existentes que mudam. Requisitos não mencionados continuam válidos, inclusive os de `gestao-conteudo-curso`; nenhuma capacidade é removida ou renomeada.

## Impact

- Implementação futura concentrada em `prototipo/src/telas/Entrada.tsx`, `Layout.tsx`, `Restauracao.tsx`, telas de aluno, `app/areas.ts`, `componentes/comuns.tsx` e estilos. Rotas existentes e consultas/comandos autorizados serão reaproveitados.
- Reaproveitar os indicadores por matrícula e a próxima atividade já fornecidos pelo repositório, sem leitura direta de armazenamento nas telas ou duplicação do motor no frontend.
- Preservar pessoas, funções, vínculos, matrículas, histórico, dados iniciais fictícios, progressos, aprendizagem e gamificação. Não introduzir migração, limpeza automática, nova autenticação, dependências ou persistência de preferências visuais.
- Adaptar testes de interface que hoje entram diretamente por pessoa ou esperam controles sempre expostos; manter verificações de autorização e isolamento entre turmas.
- Esta etapa entrega somente documentos da change para revisão. A implementação ocorrerá em etapa posterior.
