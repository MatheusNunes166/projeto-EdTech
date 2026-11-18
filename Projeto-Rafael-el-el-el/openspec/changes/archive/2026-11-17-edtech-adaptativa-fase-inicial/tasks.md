# Tasks

## 1. Artefatos de análise (docs/)

- [x] 1.1 Criar `docs/requisitos.md` com RFs numerados (um ou mais por requirement das 6 specs, cada um citando a capability de origem) e RNFs (usabilidade, desempenho percebido, privacidade dos dados do aluno, compatibilidade de navegador); verificar que todo requirement das specs aparece em ao menos um RF
- [x] 1.2 Criar `docs/casos-de-uso.md` com diagrama Mermaid de casos de uso (atores Aluno, Professor, Administrador, Responsável; convenção visual explicada no topo) e descrição textual dos casos principais com fluxos alternativos; verificar que o diagrama renderiza no preview Markdown do VS Code/GitHub
- [x] 1.3 Criar `docs/fluxos-usuario.md` com jornada por perfil e diagramas de atividade/sequência para: matrícula, sessão adaptativa (incluindo revisão sugerida e desbloqueio), criação e publicação de curso, acompanhamento pelo professor e pelo responsável; verificar que todos os diagramas renderizam
- [x] 1.4 Criar `docs/README.md` indexando os artefatos e a matriz de rastreabilidade RF → caso de uso → fluxo; verificar que todos os links funcionam

## 2. Base do protótipo

- [x] 2.1 Criar `prototipo/` com Vite + React + TypeScript, React Router, Vitest e Testing Library; verificar que `npm run dev`, `npm run build` e `npm test` executam sem erro
- [x] 2.2 Definir tipos de domínio (Usuário, Curso, Tópico, Material, Questão, Matrícula, Resposta) e o seed versionado com usuários dos 4 perfis, 3 cursos publicados + 1 rascunho com questões nos 3 níveis, vínculos e histórico parcial; verificar com teste que o seed atende ao critério de publicação para os cursos publicados
- [x] 2.3 Implementar a camada de repositório assíncrona sobre `localStorage`, com recarga automática por versão do seed, botão "Restaurar dados de demonstração" e data virtual com "Simular próximo dia"; verificar com testes de leitura/escrita e de restauração
- [x] 2.4 Criar `prototipo/README.md` com instruções de execução e lista dos usuários de demonstração; verificar seguindo o passo a passo numa cópia limpa

## 3. Perfis e acesso (spec perfis-acesso)

- [x] 3.1 Implementar tela de entrada com usuários de demonstração (excluindo inativos), sair/trocar usuário e layout por perfil; verificar manualmente entrando com cada perfil
- [x] 3.2 Implementar guard de rotas por perfil com redirecionamento; verificar com teste de componente que um Aluno acessando `/professor` é redirecionado para `/aluno`
- [x] 3.3 Implementar área do Administrador: CRUD e desativação de usuários, vínculos Responsável ↔ Aluno e Professor ↔ Curso; verificar que usuário desativado some da entrada e que o Responsável só vê alunos vinculados

## 4. Motor adaptativo e gamificação (specs aprendizado-adaptativo, gamificacao)

- [x] 4.1 Implementar `prototipo/src/adaptativo/` (domínio, faixa de dificuldade, próxima questão, desbloqueio, progresso, conclusão) com parâmetros centralizados; verificar com testes Vitest cobrindo cada cenário da spec `aprendizado-adaptativo`, incluindo independência entre cursos e limites 0–100
- [x] 4.2 Implementar cálculo de XP, sequência de dias (usando a data virtual) e conquistas por curso a partir do histórico; verificar com testes cobrindo cada cenário da spec `gamificacao`, incluindo conquista concedida uma única vez

## 5. Experiência do aluno (specs catalogo-cursos, aprendizado-adaptativo, gamificacao)

- [x] 5.1 Implementar catálogo com busca e filtros por área e nível, estado vazio e detalhe do curso; verificar que cursos em rascunho não aparecem e que a busca sem resultado mostra a mensagem
- [x] 5.2 Implementar matrícula e "Meus cursos" com progresso; verificar que matricular cria trilha com primeiro tópico desbloqueado e que não é possível matricular duas vezes
- [x] 5.3 Implementar tela da trilha (tópicos bloqueados/desbloqueados/dominados, XP, sequência, conquistas) e sessão de questões com feedback imediato, explicação, variação de domínio e sugestão de revisão após 2 erros seguidos; verificar com teste de componente do fluxo responder → feedback e manualmente até dominar um tópico e desbloquear o próximo
- [x] 5.4 Implementar painel de desempenho do aluno por curso; verificar que os números batem com o histórico do seed

## 6. Experiência do professor (specs gestao-conteudo-curso, acompanhamento-desempenho)

- [x] 6.1 Implementar criação/edição de curso, tópicos com reordenação e materiais; verificar validação de título obrigatório e que a reordenação altera a ordem de desbloqueio numa nova matrícula
- [x] 6.2 Implementar banco de questões por tópico com dificuldade, alternativa correta obrigatória e explicação; verificar a validação de alternativa correta
- [x] 6.3 Implementar publicação com verificação de cobertura de níveis por tópico e restrição de edição a cursos vinculados; verificar com teste que a publicação é bloqueada listando faltantes e que o curso publicado aparece no catálogo
- [x] 6.4 Implementar painel da turma (progresso, taxa de acertos, domínio médio por tópico, destaque "precisa de atenção" < 50% nas últimas 10) e detalhe do aluno; verificar com teste do cálculo de destaque e manualmente com o seed

## 7. Responsável e administrador (spec acompanhamento-desempenho)

- [x] 7.1 Implementar painel do Responsável com alunos vinculados, cursos, progresso, sequência e última atividade; verificar que só aparecem alunos vinculados
- [x] 7.2 Implementar visão geral do Administrador com totais por perfil, por status de curso e de matrículas; verificar que os totais batem com o seed

## 8. Integração e validação

- [x] 8.1 Percorrer os fluxos de `docs/fluxos-usuario.md` no protótipo com cada perfil e registrar divergências; verificar que não há divergência aberta ou que cada uma foi corrigida no protótipo ou nos documentos
- [x] 8.2 Executar `npm run build` e `npm test` em `prototipo/` e `openspec validate edtech-adaptativa-fase-inicial`; verificar que todos passam

## Workflow follow-up

- Revisar artefatos e protótipo com o time antes de arquivar.
- Arquivar a change após a aprovação e verificar as specs geradas em `openspec/specs/`.
