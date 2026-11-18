# Documentação — EdTech de Aprendizado Adaptativo por Curso

Artefatos de análise da fase inicial (change OpenSpec `edtech-adaptativa-fase-inicial`).
Todos os diagramas são Mermaid e renderizam no GitHub e no preview Markdown do VS Code.

| Artefato | Conteúdo |
|----------|----------|
| [requisitos.md](requisitos.md) | Requisitos funcionais (RF01–RF34), cada um rastreado à capability/spec de origem, e não funcionais (RNF01–RNF08) |
| [casos-de-uso.md](casos-de-uso.md) | Diagrama de casos de uso por perfil (UC01–UC16), matriz ator × caso de uso e descrição dos casos principais |
| [fluxos-usuario.md](fluxos-usuario.md) | Jornadas por perfil (§1) e diagramas de atividade/sequência: matrícula (§2), sessão adaptativa (§3), criação e publicação de curso (§4), acompanhamento pelo professor (§5) e pelo responsável (§6) |
| [rastreabilidade.md](rastreabilidade.md) | Matriz de rastreabilidade da change `organizacao-academica`: cada requisito e cenário ligado aos testes automatizados (e roteiros manuais) |
| [validacao-final.md](validacao-final.md) | Validação integrada entre funções, evidências de comportamento e de build e revisão de coerência da change |
| [../prototipo/README.md](../prototipo/README.md) | Como executar o protótipo navegável e usuários de demonstração |

> **Organização acadêmica:** [casos-de-uso.md](casos-de-uso.md) (UC13/UC14, UC16 e UC17 atualizados), [fluxos-usuario.md](fluxos-usuario.md) (§4.1 edição e publicação do conteúdo; §7 jornadas do Aluno e da Coordenação) e [requisitos.md](requisitos.md) (modelo, matriz de autorização, estudo, indicadores) descrevem o comportamento atual; as seções por curso/perfil único são referência histórica. A rastreabilidade requisito → teste está em [rastreabilidade.md](rastreabilidade.md).

Especificações vigentes: [`openspec/specs/`](../openspec/specs/) (base consolidada). Registro das duas changes: [`2026-11-17-edtech-adaptativa-fase-inicial`](../openspec/changes/archive/2026-11-17-edtech-adaptativa-fase-inicial/) (entrega inicial) e [`2026-11-17-organizacao-academica`](../openspec/changes/archive/2026-11-17-organizacao-academica/) (organização acadêmica).

## Matriz de rastreabilidade RF → caso de uso → fluxo

| RF | Capability | Caso(s) de uso | Fluxo em [fluxos-usuario.md](fluxos-usuario.md) |
|----|------------|----------------|------------------------------------------------|
| RF01 | perfis-acesso | UC01 | §1 Jornadas (entrada de cada perfil) |
| RF02 | perfis-acesso | UC01 | §1 Jornadas |
| RF03 | perfis-acesso | UC01 (A2) | §1 Jornadas; §4 sequência (verificação de vínculo) |
| RF04 | perfis-acesso | UC13 | §1 Jornada do Administrador |
| RF05 | perfis-acesso | UC14, UC16 | §1 Jornada do Administrador; §6 Responsável |
| RF06 | catalogo-cursos | UC02 | §2 Matrícula |
| RF07 | catalogo-cursos | UC02 | §2 Matrícula |
| RF08 | catalogo-cursos | UC02, UC03 | §2 Matrícula |
| RF09 | catalogo-cursos | UC03 | §2 Matrícula |
| RF10 | catalogo-cursos | UC03 | §2 Matrícula |
| RF11 | gestao-conteudo-curso | UC08 | §4 Criação e publicação |
| RF12 | gestao-conteudo-curso | UC09 | §4 Criação e publicação |
| RF13 | gestao-conteudo-curso | UC09 | §4 Criação e publicação |
| RF14 | gestao-conteudo-curso | UC10 | §4 Criação e publicação |
| RF15 | gestao-conteudo-curso | UC11 | §4 Criação e publicação |
| RF16 | gestao-conteudo-curso | UC08 (A4) | §4 sequência (sem vínculo) |
| RF17 | aprendizado-adaptativo | UC04 | §3 Sessão adaptativa (sequência: estado por aluno+curso) |
| RF18 | aprendizado-adaptativo | UC04, UC05 | §3 Sessão adaptativa |
| RF19 | aprendizado-adaptativo | UC04 | §3 Sessão adaptativa |
| RF20 | aprendizado-adaptativo | UC04 | §3 Sessão adaptativa |
| RF21 | aprendizado-adaptativo | UC04 (A1) | §3 Sessão adaptativa |
| RF22 | aprendizado-adaptativo | UC05 | §3 Sessão adaptativa |
| RF23 | aprendizado-adaptativo | UC06 | §3 Sessão adaptativa (revisão sugerida) |
| RF24 | aprendizado-adaptativo | UC04 (A3) | §3 Sessão adaptativa |
| RF25 | gamificacao | UC04, UC07 | §3 Sessão adaptativa |
| RF26 | gamificacao | UC07 | §3 Sessão adaptativa (sequência: gamificação) |
| RF27 | gamificacao | UC04 (A1, A3), UC07 | §3 Sessão adaptativa |
| RF28 | gamificacao | UC04, UC07 | §3 Sessão adaptativa |
| RF29 | acompanhamento-desempenho | UC07 | §1 Jornada do Aluno (Evolução) |
| RF30 | acompanhamento-desempenho | UC12 | §5 Professor |
| RF31 | acompanhamento-desempenho | UC12 | §5 Professor |
| RF32 | acompanhamento-desempenho | UC12 | §5 Professor |
| RF33 | acompanhamento-desempenho | UC16 | §6 Responsável |
| RF34 | acompanhamento-desempenho | UC15 | §1 Jornada do Administrador |
