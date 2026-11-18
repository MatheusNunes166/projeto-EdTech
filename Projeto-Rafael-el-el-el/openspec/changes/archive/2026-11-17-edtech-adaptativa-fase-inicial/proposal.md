# Proposal

## Why

Queremos construir uma EdTech de **aprendizado adaptativo organizada por curso**: cada curso tem sua própria trilha adaptativa, que ajusta conteúdo e dificuldade ao desempenho do aluno naquele curso, sem misturar com o desempenho em outros cursos. Antes de investir em back-end e infraestrutura, precisamos alinhar o escopo com artefatos de análise (casos de uso, requisitos, fluxos) e validar a experiência com um protótipo navegável.

## What Changes

- Documentar o produto com **artefatos de análise**: diagrama de casos de uso por perfil, requisitos funcionais e não funcionais, e fluxos de usuário (jornadas e diagramas de atividade/sequência) dos fluxos principais.
- Construir um **protótipo front-end navegável** com dados fictícios e sem back-end real, cobrindo os quatro perfis: Aluno, Professor/Instrutor, Administrador e Responsável/Escola.
- Definir o comportamento do **motor adaptativo por curso** (domínio por tópico, ajuste de dificuldade, desbloqueio de tópicos), simulado no próprio protótipo.
- Incluir catálogo e matrícula em cursos, criação de conteúdo pelo professor, painéis de desempenho e gamificação básica (XP, sequência de dias, conquistas) por curso.

Fora de escopo nesta fase: autenticação real, banco de dados, pagamentos, aulas ao vivo, diagrama ER e diagrama de arquitetura.

## Capabilities

### New Capabilities

- `perfis-acesso`: perfis de usuário (Aluno, Professor, Administrador, Responsável), entrada no sistema e o que cada perfil pode ver e fazer; administração de usuários e vínculos (responsável ↔ aluno, professor ↔ curso).
- `catalogo-cursos`: listagem e detalhe de cursos, matrícula do aluno e visão "meus cursos".
- `gestao-conteudo-curso`: criação e edição de cursos pelo professor — tópicos em sequência, materiais e banco de questões classificado por tópico e dificuldade.
- `aprendizado-adaptativo`: trilha adaptativa independente por curso — nível de domínio por tópico, escolha da próxima atividade, ajuste de dificuldade e desbloqueio de tópicos.
- `gamificacao`: XP, sequência de dias de estudo e conquistas, contabilizados por curso.
- `acompanhamento-desempenho`: painéis de progresso para aluno, professor (turma) e responsável (alunos vinculados).

### Modified Capabilities

<!-- Nenhuma: projeto novo, sem specs existentes. -->

## Impact

- Projeto greenfield: não há código existente. Serão criados uma pasta de documentação (artefatos e diagramas) e uma aplicação front-end de protótipo.
- Novas dependências de desenvolvimento para o protótipo (ferramentas de front-end); nenhuma dependência de serviço externo.
- Os requisitos aqui definidos servirão de base para a futura fase de MVP com back-end.
