# Matriz de rastreabilidade — organização acadêmica

Cada requisito da base `openspec/specs/` (após o arquivamento de `organizacao-academica`) é ligado aos testes automatizados que o verificam (arquivos em `prototipo/src`) e lista seus cenários. A ligação é feita pelo nome do requisito citado nos blocos `describe` dos testes; cenários são cobertos pelos testes do requisito a que pertencem. Requisitos que dependem do navegador real têm também um roteiro manual na seção final.

Gerada a partir de `openspec/specs/*/spec.md` e dos arquivos `*.test.*`. Mostra cobertura por teste; a validação estrutural do OpenSpec não comprova comportamento.


## Acompanhamento de desempenho (`acompanhamento-desempenho`)

| Requisito | Cenários | Testes que o verificam |
| --- | --- | --- |
| Painel do aluno | Aluno consulta seu desempenho; Matrícula sem respostas | `dados/seed-historico.test.ts`, `desempenho/indicadores-academicos.test.ts`, `testes/aluno.test.tsx` |
| Alunos com dificuldade | Aluno destacado; Limite de atenção; Poucas respostas | `desempenho/indicadores-academicos.test.ts`, `testes/professor.test.tsx` |
| Detalhe de aluno para o professor | Ver detalhe do aluno; Mesmo aluno em turma não vinculada | `dados/historico-estudo.test.ts`, `desempenho/indicadores-academicos.test.ts` |
| Painel do responsável | Responsável acompanha aluno; Aluno sem atividade recente | `desempenho/indicadores-academicos.test.ts`, `testes/responsavel.test.tsx` |
| Visão geral do administrador | Totais com funções cumulativas; Totais acadêmicos; Administrador consulta visão geral | `testes/admin.test.tsx` |
| Painel do professor por turma | Professor com várias turmas; Média inclui alunos sem respostas | `testes/professor.test.tsx` |
| Turma sem alunos | Professor consulta turma vazia; Coordenador consulta oferta vazia | `desempenho/indicadores-academicos.test.ts`, `testes/professor.test.tsx` |
| Painel do coordenador | Coordenação consulta suas ofertas; Pessoa professora e coordenadora consulta painéis distintos; Gestão acadêmica a partir do painel; Navegação entre cursos não cria média global | `desempenho/indicadores-academicos.test.ts`, `testes/coordenacao.test.tsx` |
| Progresso médio por turma | Progresso de 80 e zero inclui quem não iniciou; Outra turma não influencia a média | `desempenho/indicadores-academicos.test.ts`, `testes/coordenacao.test.tsx` |
| Domínio médio por tópico da turma | Coordenação inclui zero no domínio médio; Mesmo tópico em outra oferta não influencia | `desempenho/indicadores-academicos.test.ts`, `testes/coordenacao.test.tsx` |
| Precisão e exibição das médias | Média usa progressos exatos; Arredondamento do domínio somente na exibição; Empate de meio ponto | `desempenho/indicadores-academicos.test.ts`, `testes/coordenacao.test.tsx` |

## Aprendizado adaptativo (`aprendizado-adaptativo`)

| Requisito | Cenários | Testes que o verificam |
| --- | --- | --- |
| Nível de domínio por tópico | Acerto aumenta domínio; Erro diminui domínio sem ficar negativo; Acerto não excede o limite | `adaptativo/motor.test.ts` |
| Dificuldade conforme domínio | Domínio intermediário recebe questão média; Limites das faixas | `adaptativo/estudo.test.ts`, `adaptativo/motor.test.ts` |
| Escolha da próxima atividade | Foco no tópico mais fraco; Evitar repetição imediata; Reutilização sem questões inéditas | `adaptativo/estudo.test.ts`, `adaptativo/motor.test.ts` |
| Desbloqueio de tópicos | Dominar tópico desbloqueia o próximo; Tópico bloqueado por acesso direto | `adaptativo/motor.test.ts` |
| Feedback imediato | Feedback após erro | `adaptativo/estudo.test.ts`, `dados/comandos-estudo.test.ts`, `testes/aluno.test.tsx` |
| Revisão sugerida | Dois erros seguidos; Erros de períodos diferentes | `adaptativo/estudo.test.ts`, `adaptativo/motor.test.ts`, `testes/aluno.test.tsx` |
| Trilha independente por aluno e turma | Independência entre períodos; Turmas paralelas não se influenciam; Alunos não se influenciam; Disciplinas distintas não se influenciam | `dados/seed-historico.test.ts` |
| Inicialização e retomada da trilha | Início sem diagnóstico; Retomada preserva estado | `adaptativo/contexto-estudo.test.ts`, `testes/aluno.test.tsx` |
| Conclusão da trilha da turma | Progresso parcial; Trilha concluída; Exibição não reduz a precisão do progresso | `adaptativo/estudo.test.ts` |
| Preservação do estado de estudo em edições de conteúdo | Material ajustado com trilha em andamento; Conclusão preservada em outra turma; Tentativa de alteração estrutural preserva todas as ofertas; Histórico exibe o conteúdo anterior à correção | `dados/historico-estudo.test.ts` |
| Respostas somente no contexto autorizado | Questão de outra disciplina; Aluno sem matrícula | `dados/comandos-estudo.test.ts` |

## Catálogo (`catalogo-cursos`)

| Requisito | Cenários | Testes que o verificam |
| --- | --- | --- |
| Busca e filtro no catálogo | Combinar filtros; Busca sem resultados; Filtrar por área | `testes/aluno.test.tsx` |
| Catálogo de graduações e disciplinas publicadas | Aluno abre o catálogo | `testes/aluno.test.tsx` |
| Detalhe acadêmico e ofertas | Ver detalhe da disciplina; Oferta sem professor | `testes/aluno.test.tsx` |
| Acesso às turmas sem automatrícula | Aluno matriculado continua estudo; Aluno não matriculado consulta oferta | `testes/aluno.test.tsx`, `testes/shell.test.tsx` |
| Minhas turmas | Mesma disciplina em períodos distintos; Matrícula anterior à publicação; Aluno sem matrículas | `testes/aluno.test.tsx`, `testes/integracao-funcoes.test.tsx`, `testes/responsavel.test.tsx`, `testes/shell.test.tsx` |

## Gamificação (`gamificacao`)

| Requisito | Cenários | Testes que o verificam |
| --- | --- | --- |
| Sequência de dias de estudo | Sequência mantida; Várias respostas no mesmo dia; Sequência interrompida apesar de estudo em outra turma; Sequência interrompida | `gamificacao/gamificacao-matricula.test.ts`, `gamificacao/gamificacao.test.ts` |
| Conquistas | Primeiro tópico dominado; Conquista não é duplicada; Primeira questão mesmo com erro; Sequência e conclusão | `dados/seed-historico.test.ts`, `gamificacao/gamificacao-matricula.test.ts`, `gamificacao/gamificacao.test.ts` |
| Exibição de gamificação | Alternar entre ofertas; Ver indicadores do curso | `testes/aluno.test.tsx` |
| Gamificação independente por aluno e turma | Independência entre períodos; Independência entre alunos | `gamificacao/gamificacao-matricula.test.ts` |
| XP por turma | Acerto em questão difícil; Erro não concede XP | `gamificacao/gamificacao-matricula.test.ts` |
| Preservação da gamificação em edições de conteúdo | Material corrigido para aluno em andamento; Conquista de conclusão preservada entre turmas; Edição de questão respondida não recalcula XP | `dados/gamificacao-edicoes.test.ts` |

## Gestão de conteúdo (`gestao-conteudo-curso`)

| Requisito | Cenários | Testes que o verificam |
| --- | --- | --- |
| Tópicos ordenados | Reordenar tópicos; Tópico sem título | `dados/conteudo-estrutura.test.ts`, `testes/professor.test.tsx` |
| Materiais por tópico | Adicionar material; Ajuste seguro após estudo em várias turmas | `dados/conteudo-publicacao.test.ts` |
| Banco de questões classificado | Cadastrar questão; Questão sem alternativa correta; Questão com tópico de outra disciplina | `dados/conteudo-questoes.test.ts` |
| Conteúdo pertencente à disciplina | Duas turmas compartilham conteúdo; Oferta nova usa o conteúdo existente | `dados/conteudo-estrutura.test.ts` |
| Bloqueio estrutural após início do estudo | Aluno com trilha em andamento; Aluno já concluiu a trilha; Resposta em outra turma bloqueia oferta nova | `dados/conteudo-estrutura.test.ts`, `testes/professor.test.tsx` |
| Proteção de questões com respostas | Mudança de gabarito de questão respondida; Mudança de dificuldade afetaria domínio e XP; Alteração de sentido ou correspondência das alternativas; Exclusão de questão com resposta em outra turma; Reordenação não é correção textual permitida; Edição de questão ainda não respondida | `dados/conteudo-questoes.test.ts`, `testes/professor.test.tsx` |
| Correção textual de questões respondidas | Correção textual aceita pelo próprio autor; Correção sem confirmação; Confirmação de uma alteração diferente; Nova edição após confirmar; Revisão original ficou desatualizada; Confirmação não substitui autorização de edição | `dados/conteudo-questoes.test.ts`, `testes/professor.test.tsx` |
| Publicação de conteúdo da disciplina | Publicação bloqueada por cobertura; Disciplina sem tópicos; Publicação bem-sucedida | `dados/conteudo-publicacao.test.ts` |
| Validade contínua do conteúdo publicado | Edição válida após publicação; Edição quebra cobertura de dificuldade; Remoção deixaria disciplina publicada sem tópicos; Falha preserva o conjunto anterior | `dados/conteudo-publicacao.test.ts`, `testes/professor.test.tsx` |
| Escopo do professor sobre conteúdo | Professor sem vínculo; Professor com várias turmas da mesma disciplina; Último vínculo docente removido; Criar disciplina não concede autoria pedagógica | `dados/conteudo-estrutura.test.ts` |

## Organização acadêmica (`organizacao-academica`)

| Requisito | Cenários | Testes que o verificam |
| --- | --- | --- |
| Cadastro de graduações | Criar graduação; Dados obrigatórios ou código duplicado | `dominio/academico.test.ts`, `testes/admin.test.tsx` |
| Gestão de graduação pela coordenação | Coordenador edita seu curso; Curso fora da coordenação | `testes/coordenacao.test.tsx` |
| Disciplinas de uma graduação | Criar disciplina; Graduação inexistente; Códigos em graduações distintas; Coordenador cria disciplina no próprio curso; Transferência para curso não coordenado | `dominio/academico.test.ts`, `testes/admin.test.tsx` |
| Períodos letivos | Cadastrar período válido; Intervalo inválido | `dominio/academico.test.ts`, `testes/admin.test.tsx` |
| Ofertas de disciplinas em turmas | Turmas paralelas e oferta posterior; Código duplicado na mesma oferta; Referência inexistente; Coordenador cria oferta em período existente | `dominio/academico.test.ts`, `testes/admin.test.tsx` |
| Identidade das ofertas e histórico | Troca de período com histórico; Renomear sem perder vínculos | `testes/admin.test.tsx` |
| Matrícula administrativa em turma | Matrícula inicial; Pessoa sem função Aluno; Aluno tenta matricular a si próprio; Matrícula realizada pelo coordenador; Coordenador tenta matrícula fora de seu curso | `dados/comandos-matriculas.test.ts`, `testes/coordenacao.test.tsx` |
| Unicidade da matrícula | Matrícula duplicada preserva estudo; Matrícula em outro período; Coordenador repete matrícula existente | `dominio/relacionamentos.test.ts`, `testes/coordenacao.test.tsx` |
| Vínculos de professores às turmas | Professor com várias turmas; Vínculo repetido; Função necessária para vínculo; Coordenador atribui professor no próprio curso; Coordenador tenta remover vínculo de outro curso | `dados/comandos-docentes.test.ts`, `testes/coordenacao.test.tsx` |
| Vínculos de coordenadores às graduações | Coordenação de vários cursos; Coordenador sem função correspondente; Coordenador tenta atribuir coordenação | `testes/admin.test.tsx` |
| Revogação de vínculos acadêmicos | Professor perde uma de várias turmas; Função removida com outra função mantida; Coordenador perde autorização de gestão | `dados/revogacao-academica.test.ts`, `testes/shell.test.tsx` |
| Demonstração fictícia e restauração | Dados suficientes para validar a organização; Restaurar demonstração | `dados/armazenamento-academico.test.ts`, `dados/readme-demonstracao.test.ts`, `dados/seed.test.ts`, `testes/shell.test.tsx` |

## Perfis e acesso (`perfis-acesso`)

| Requisito | Cenários | Testes que o verificam |
| --- | --- | --- |
| Entrada simulada no protótipo | Entrar como usuário de demonstração; Trocar de usuário | `dados/armazenamento-academico.test.ts` |
| Administração de usuários | Desativar professor; Desativação durante sessão; Desativar usuário | `dados/comandos-administracao.test.ts`, `testes/admin.test.tsx` |
| Funções de usuário suportadas | Pessoa com duas funções; Usuário sem função | `dominio/usuarios.test.ts`, `testes/shell.test.tsx` |
| Acesso restrito por função e vínculo | Aluno tenta acessar área do professor; Professor tenta acessar turma não vinculada; Aluno tenta registrar resposta por outro aluno | `dados/indicadores-consultas.test.ts`, `testes/shell.test.tsx` |
| Permissões cumulativas sem ampliação de vínculos | Professor e coordenador em cursos diferentes; Coordenação não autoriza edição docente; Docência não autoriza consulta de outras turmas | `testes/shell.test.tsx` |
| Escopo de gestão da coordenação | Coordenador gerencia vínculo em seu curso; Coordenador gerencia estrutura de seu curso; Acesso direto a gestão de outro curso; Coordenador sem graduação | `dados/comandos-docentes.test.ts`, `testes/coordenacao.test.tsx` |
| Administração estrutural e de conteúdo | Administrador publica conteúdo válido; Professor tenta criar graduação | `dados/comandos-administracao.test.ts`, `dados/conteudo-publicacao.test.ts`, `dominio/academico.test.ts`, `testes/admin.test.tsx` |
| Limites globais da gestão de coordenação | Coordenador tenta alterar período global; Coordenador tenta conceder função a si próprio; Coordenação não altera resultados de estudo | `dados/comandos-administracao.test.ts`, `dados/comandos-cadastros.test.ts`, `testes/admin.test.tsx` |
| Vínculos entre responsável e alunos | Responsável vê somente alunos vinculados; Vínculo removido | `testes/responsavel.test.tsx` |

**Resumo:** 64 requisitos; 64 com testes automatizados; sem cobertura: nenhum.


## Roteiros manuais (navegador real)

Os testes de interface rodam em jsdom. Dois comportamentos recebem, além disso, o roteiro abaixo (resultado em [validacao-final.md](validacao-final.md)):

1. **Demonstração limpa** (OA — Demonstração fictícia e restauração; PA — Entrada simulada): limpar o armazenamento local do navegador, abrir o aplicativo, conferir que a demonstração é inicializada sem aviso; entrar como cada pessoa listada no README; restaurar com cancelamento (nada muda) e com confirmação (volta ao estado inicial e à tela de entrada).
2. **Dados da versão anterior**: gravar `trilha-adaptativa:dados` no navegador, abrir o aplicativo e conferir o aviso de substituição antes de qualquer alteração; cancelar mantém as chaves; confirmar grava o namespace novo e preserva o legado.
