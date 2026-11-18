# Design

## Context

Projeto greenfield: o repositório contém apenas a configuração do OpenSpec, sem código. Motivação e escopo estão em `proposal.md`; o comportamento esperado está nas specs desta change. Esta fase entrega duas coisas: (1) artefatos de análise — casos de uso, requisitos e fluxos de usuário — e (2) um protótipo front-end navegável, sem back-end, que simula o motor adaptativo por curso com dados fictícios.

**Premissa registrada:** a resposta sobre o tipo de protótipo veio ilegível; assumimos a opção recomendada, **front-end navegável com dados fictícios**. Se a intenção era wireframes estáticos ou um MVP com back-end, as tarefas do grupo de protótipo mudam e esta change deve ser revisada antes da implementação.

## Goals / Non-Goals

**Goals:**
- Artefatos versionados no repositório, legíveis no GitHub/VS Code sem ferramenta paga.
- Protótipo que roda localmente com um comando e cobre os fluxos principais dos quatro perfis.
- Motor adaptativo isolado e testável, para ser reaproveitado no MVP com back-end.

**Non-Goals:**
- Autenticação real, persistência em servidor, segurança de dados de produção.
- Diagrama ER e diagrama de arquitetura (ficam para a fase de MVP).
- Fidelidade visual final; o protótipo valida fluxo e comportamento, não a identidade visual.
- Responsividade avançada: foco em desktop, com layout que não quebre em celular.

## Decisions

### D1. Artefatos em Markdown + Mermaid em `docs/`
Diagramas de casos de uso, atividade e sequência escritos em Mermaid dentro de Markdown, em `docs/`:
- `docs/requisitos.md` — requisitos funcionais (RF) e não funcionais (RNF), cada RF rastreado para a capability/spec correspondente.
- `docs/casos-de-uso.md` — diagrama de casos de uso por perfil e descrição textual dos casos principais (ator, pré-condição, fluxo principal, fluxos alternativos).
- `docs/fluxos-usuario.md` — jornadas por perfil e diagramas de atividade/sequência dos fluxos: matrícula, sessão adaptativa, criação e publicação de curso, acompanhamento pelo professor e pelo responsável.

*Alternativas:* draw.io/Figma (melhor visual, mas binário/externo, difícil de revisar em diff) e PlantUML (UML mais completo, mas exige Java ou servidor para renderizar). Mermaid renderiza nativamente no GitHub. Como Mermaid não tem diagrama de casos de uso UML nativo, ele será representado com `flowchart` (atores à esquerda, casos de uso como elipses agrupados por subsistema).

### D2. Protótipo em React + TypeScript + Vite em `prototipo/`
SPA com React Router, uma área de rotas por perfil (`/aluno`, `/professor`, `/admin`, `/responsavel`) e um guard de rota que redireciona para a área do perfil atual (spec `perfis-acesso`).

*Alternativas:* HTML/JS puro (sem build, mas o estado compartilhado entre telas fica frágil) e Next.js (SSR e rotas de API desnecessários sem back-end). Vite + React é o caminho mais curto e evolui naturalmente para o MVP.

### D3. Dados fictícios com camada de repositório e `localStorage`
Um arquivo de seed (usuários de demonstração dos quatro perfis, 3 cursos publicados + 1 rascunho, tópicos, questões nos três níveis, matrículas e histórico parcial) carrega o estado inicial. Todo acesso passa por uma camada de repositório com interface assíncrona (`Promise`), persistindo em `localStorage`. Um botão "Restaurar dados de demonstração" recarrega o seed.

*Por quê:* a interface assíncrona permite trocar o `localStorage` por uma API real no MVP sem mexer nas telas. *Alternativa:* estado só em memória — perde tudo ao recarregar, o que atrapalha demonstrações.

### D4. Motor adaptativo como módulo puro
`prototipo/src/adaptativo/` contém funções puras, sem React: `atualizarDominio`, `faixaDificuldade`, `proximaQuestao`, `aplicarDesbloqueios`, `progressoCurso`. O estado é sempre indexado por `(alunoId, cursoId)`, o que garante a independência entre cursos.

Parâmetros (ajustáveis num único arquivo de configuração):

| Resultado | Fácil | Médio | Difícil |
|-----------|-------|-------|---------|
| Acerto    | +10   | +15   | +20     |
| Erro      | −15   | −10   | −5      |

Faixas: 0–39 Fácil, 40–69 Médio, 70–100 Difícil; dominado ≥ 80 (spec `aprendizado-adaptativo`). Com isso, um aluno que só acerta domina um tópico em cerca de 6 questões, tamanho bom para demonstração. Quando não houver questão inédita na dificuldade alvo, o motor reutiliza a menos recente da mesma dificuldade.

*Alternativas:* modelos estatísticos (IRT, Bayesian Knowledge Tracing) — mais precisos, mas exigem dados reais para calibrar. A regra por faixas é explicável e suficiente para validar a experiência; pode ser substituída no MVP mantendo a mesma interface.

### D5. Gamificação derivada do histórico
XP, sequência e conquistas são calculados a partir do histórico de respostas por `(alunoId, cursoId)`, não guardados como contadores soltos, evitando inconsistência. Para demonstrar a sequência de dias sem esperar dias reais, o protótipo tem um controle "Simular próximo dia" que avança uma data virtual usada por todo o app.

### D6. Testes com Vitest
Testes unitários para o motor adaptativo e a gamificação (cada cenário das specs vira um caso) e testes de componente leves (Testing Library) para o guard de rotas e o fluxo de resposta de questão.

## Risks / Trade-offs

- [Premissa sobre o tipo de protótipo pode estar errada] → Confirmar antes de iniciar o grupo de protótipo; os artefatos de documentação valem para qualquer opção.
- [Regra adaptativa simplista pode parecer "previsível"] → Parâmetros centralizados para ajuste após testes com usuários; registrar feedback para o MVP.
- [Mermaid limita a notação UML de casos de uso] → Usar convenção visual documentada no topo do arquivo; se a banca/cliente exigir UML estrito, exportar depois para PlantUML.
- [`localStorage` pode ficar inconsistente após mudanças de schema do seed] → Versionar o seed e recarregar automaticamente quando a versão mudar.
- [Escopo amplo para um protótipo (4 perfis)] → Priorizar o fluxo do Aluno (catálogo → matrícula → sessão adaptativa) e do Professor (criar e publicar curso); painéis de Responsável e Admin com escopo mínimo.

## Open Questions

- Nome e identidade visual da plataforma (não afeta fluxos; pode usar nome provisório).
- Conteúdo real dos cursos de exemplo — o seed usará conteúdo fictício de Matemática Básica, Inglês Inicial e Lógica de Programação até haver material definido.
