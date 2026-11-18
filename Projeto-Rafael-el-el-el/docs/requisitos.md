# Requisitos — EdTech de Aprendizado Adaptativo por Curso

Fonte: specs da change `edtech-adaptativa-fase-inicial` (arquivada em `openspec/changes/archive/2026-11-17-edtech-adaptativa-fase-inicial/specs/`); a base vigente está em `openspec/specs/`.
Cada requisito funcional (RF) indica a **capability** de origem e o **requirement** da spec correspondente.

## Modelo acadêmico — organização acadêmica

Fonte do novo contrato: [spec de organização acadêmica](../openspec/specs/organizacao-academica/spec.md), [funções cumulativas](../openspec/specs/perfis-acesso/spec.md) e [design D1](../openspec/changes/archive/2026-11-17-organizacao-academica/design.md).

O grupo 1 introduz tipos e validações estruturais puras; o grupo 2 acrescenta políticas, infraestrutura, comandos e consultas acadêmicas isolados. As telas atuais continuam usando o repositório e os contratos legados explicitamente identificados. A integração e a substituição informada dos dados pertencem aos grupos seguintes. Esta entrega não muda o seed de produção, suas versões nem as chaves de armazenamento.

| Conceito | Contrato e relação |
| --- | --- |
| Graduação | `Graduacao`: curso superior com ID estável e código único; sem tópicos ou publicação de conteúdo. |
| Disciplina | `Disciplina`: pertence a uma graduação; código único nela; conteúdo começa em rascunho e é compartilhado por suas turmas. |
| Período letivo | `PeriodoLetivo`: ID global e datas civis válidas em `AAAA-MM-DD`, com fim igual ou posterior ao início; não é nível pedagógico. |
| Turma | `Turma`: uma disciplina e um período; código único nessa combinação. Pode existir sem alunos e professores. |
| Matrícula | `Matricula`: ID próprio e par aluno–turma único; repetir o par identifica o registro original. Nova oferta tem outro contexto. |
| Docência | `VinculoProfessor`: par professor–turma, admitindo vários vínculos por pessoa e por turma. |
| Coordenação | `VinculoCoordenador`: par coordenador–graduação, independente do vínculo docente. |
| Responsável | `VinculoResponsavel`: par Responsável–Aluno preservado do domínio anterior. |
| Pessoa e funções | `Usuario`: uma identidade e `funcoes[]`, entre Aluno, Professor, Coordenador, Administrador e Responsável. Funções são explícitas e não duplicadas; pessoa ativa precisa de ao menos uma. Um vínculo não atribui função automaticamente. |
| Documento acadêmico | `DadosAcademicos`: versão de esquema, versão de seed, revisão, data virtual e coleções separadas por entidade e vínculo. Tipos de resposta e revisão textual estão declarados; seus comportamentos ainda serão implementados nos grupos 3 e 4. |

IDs são referências; nomes e códigos editáveis não são chaves de matrícula ou histórico. Os validadores puros de relacionamentos verificam referências e identificam pares repetidos sem gravar, gerar IDs ou alterar listas. Os comandos acadêmicos verificam função, atividade no momento da atribuição e autorização do autor; pessoas hoje inativas continuam referenciáveis nos históricos.

`UsuarioLegado`, `MatriculaLegada`, `VinculoProfessorLegado`, `Curso` e `Dados` preservam somente a compatibilidade da aplicação anterior. Novos modelos usam os contratos acadêmicos sem tornar `perfil`/`funcoes` ou `cursoId`/`turmaId` opcionais no mesmo objeto. As fixtures de `prototipo/src/testes/fixtures-academicas.ts` são isoladas e não importam nem substituem o seed atual.

Os RFs abaixo registram a entrega inicial e sua rastreabilidade histórica. Regras substituídas, como perfil único e automatrícula em curso de conteúdo, não são requisitos do novo modelo; os grupos posteriores atualizarão os fluxos e a matriz completa ao integrar as novas funções.

## Matriz de autorização acadêmica — tarefas 2.1 e 2.2

Políticas puras em `prototipo/src/dominio/autorizacao.ts`, baseadas nas specs `perfis-acesso` e no design D2. A identidade consultada deve existir, estar ativa e ter funções válidas no estado atual. Primeiro é resolvida a cadeia real matrícula → turma → disciplina → graduação, incluindo o período; pais informados por URL que não correspondam aos dados causam negação, inclusive para Administrador.

| Ação | Função e vínculo necessários |
| --- | --- |
| Criar graduação, administrar períodos/usuários, atribuir coordenação ou Responsável–Aluno, consultar administração | Administrador, no escopo global. |
| Consultar estrutura e painel de coordenação | Coordenador vinculado à graduação do recurso ou Administrador. |
| Editar graduação, criar/editar disciplinas e turmas, matricular e atribuir professores | Administrador ou Coordenador do curso real de cada recurso envolvido. |
| Editar ou publicar conteúdo | Administrador ou Professor com ao menos uma turma da disciplina. |
| Painel docente e histórico detalhado de aluno | Professor vinculado à turma exata; histórico deve pertencer à matrícula dessa turma. |
| Catálogo | Função Aluno; a consulta futura deve retornar somente os metadados previstos. |
| Estudo e resposta | Aluno da própria matrícula em disciplina publicada. O futuro comando de estudo também deverá validar questão, pertencimento e desbloqueio. |
| Painel do Responsável | Função Responsável e vínculo com o aluno consultado, sem acesso a histórico detalhado. |

Funções são cumulativas por ação: Carla pode lecionar em Sistemas de Informação e coordenar Direito, mas esse vínculo de coordenação não lhe concede autoria pedagógica em Direito. A docência em uma turma não libera o painel de outra oferta, mesmo da mesma disciplina. Não há exceção universal de Administrador para histórico detalhado. Uma permissão não dispensa validação do conteúdo ou da operação de negócio; essas validações continuam previstas nas tarefas correspondentes.

Os comandos de cadastro estão disponíveis no módulo acadêmico isolado. Consultas de negócio e integração com telas continuam nas tarefas posteriores. Nenhuma política usa o contrato legado ou inicializa armazenamento.

## Infraestrutura acadêmica — tarefas 2.3 e 2.4

`prototipo/src/dados/repositorio-academico.ts` é uma base interna abstrata, separada do repositório legado usado pelas telas. Recebe portas explícitas de sessão e persistência; não escolhe chaves, não inicializa dados e não restaura nem migra documentos incompatíveis. As sondas de teste usam apenas fixtures acadêmicas em memória. A entrada simulada permanece sem senha e armazena somente a identidade; funções e vínculos são relidos do documento vigente em cada operação. Autor e funções enviados pelo formulário não comprovam permissão.

Consultas recebem retratos congelados e devolvem cópias independentes. A alteração protegida exige permissões de todos os recursos envolvidos, revisão original e um validador obrigatório do documento final inteiro. Cria uma cópia candidata, executa a transformação síncrona e valida uma segunda cópia congelada, sem compartilhar referências com a transformação. Metadados de esquema, seed e revisão não são editáveis pelo comando; somente a infraestrutura avança a revisão. Antes de persistir, confere novamente sessão, autorização e documento original. Uma alteração efetiva só devolve sucesso após uma única gravação integral. Repetição sem mudança também exige autorização, revisão e validação, mas não grava nem avança a revisão. Rejeição, exceção ou formulário obsoleto não grava nem modifica os retratos já retornados; falha de persistência não publica o candidato em cache.

Os callbacks protegidos são código interno dos comandos, nunca callbacks ou documentos recebidos da interface. Cada comando fornece a validação integral aplicável. A infraestrutura não substitui esses validadores: as regras de edição pedagógica, cobertura de publicação e revisão textual serão implementadas nas tarefas próprias.

A porta de persistência deve substituir o documento inteiro de forma síncrona ou lançar erro sem modificar o valor anterior. A seção crítica não tem `await` entre leitura e gravação e recusa reentrada na mesma instância. Conferir revisão e reler o documento evita sobrescrever um formulário obsoleto e detecta mudanças antes da gravação; não fornece transação ou exclusão mútua entre abas. Um escritor em outra aba ainda pode intercalar leitura e gravação. Eventos `storage`, adaptação para armazenamento do navegador e tratamento nas telas pertencem às etapas posteriores. Esta base não lê nem altera as chaves, versões ou dados da demonstração atual.

## Comandos acadêmicos — tarefas 2.5–2.9

`prototipo/src/dados/comandos-academicos.ts` estende a infraestrutura acadêmica e recebe as mesmas portas de persistência e sessão, sem adaptador padrão. Criação e edição são operações distintas: as identidades são geradas internamente e não podem ser trocadas pelo formulário. Todos os comandos exigem a revisão original. Campos excedentes são rejeitados, incluindo `id`, identidade do autor e conteúdo pedagógico em cadastros acadêmicos. A sessão determina o autor; as funções editáveis no cadastro de uma pessoa são dados do alvo, não prova de autorização do autor.

| Comandos | Validação de negócio e preservação |
| --- | --- |
| `criarGraduacao`, `editarGraduacao` | Código/nome obrigatórios e código único global. Criação exclusiva do Administrador; edição também pela coordenação do curso real. |
| `criarPeriodoLetivo`, `editarPeriodoLetivo` | Identidade única, nome/datas obrigatórios e intervalo civil válido; exclusivos do Administrador. |
| `criarDisciplina`, `editarDisciplina` | Graduação existente, código único nela, nome/código obrigatórios e nível válido. Criação em rascunho sem tópicos; edição preserva conteúdo/publicação. Transferência exige origem e destino autorizados e ausência de matrícula/resposta na disciplina. |
| `criarTurma`, `editarTurma` | Disciplina/período existentes e código obrigatório, único na combinação. Origem e destino autorizados; matrícula/resposta bloqueia troca de disciplina ou período. Renomear não troca identidade nem histórico. |
| `matricular` | Administrador ou coordenação da turma; aluno ativo com função Aluno. Retorna `matricula` e `jaExistia`. Duplicidade mantém registro/data originais sem gravação; nova matrícula usa data virtual e não copia respostas. Publicação não é condição de matrícula; a política de estudo recusa rascunho. |
| `definirVinculoProfessor` | Autoriza a turma real; atribuição exige Professor ativo. Par único professor–turma, com vários pares por pessoa/turma. |
| `criarUsuario`, `editarUsuario`, `definirAtivo` | Exclusivos do Administrador; funções válidas, explícitas e únicas, com ao menos uma para pessoa ativa. Desativar ou remover função preserva os vínculos e históricos; a política reavalia sua eficácia na próxima operação. |
| `definirVinculoCoordenador` | Exclusivo do Administrador; graduação existente e atribuição a Coordenador ativo, sem conceder função Professor. |
| `definirVinculoResponsavel` | Exclusivo do Administrador; atribuição a Responsável ativo e destino existente com função Aluno. Vínculo concede apenas o resumo do aluno. |

Os comandos de vínculo recebem atribuição/remoção explícita e retornam o par, `vinculado` e `alterado`. Repetir atribuição ou remover par ausente não grava nem altera revisão; atribuições repetidas continuam verificando elegibilidade atual. A remoção de vínculos existentes permite limpar vínculos ineficazes de pessoas inativas ou sem a função anterior, sem atribuir novos direitos, conforme D1 (atividade exigida na atribuição).

Os validadores em `validacao-comandos-academicos.ts` usam o candidato inteiro: validam todos os registros da coleção afetada, referências, unicidade e regras da operação e comparam as demais coleções com o original. Uma edição cadastral não pode alterar questões, respostas, tópicos, publicação ou vínculos não relacionados. Referências de recursos inexistentes/incompatíveis também podem ser recusadas pela autorização antes da transformação, sem revelar dados fora do escopo. Os testes de preservação usam históricos sintéticos identificados como tais; não substituem a geração alcançável pelo motor prevista para o seed.

Os fluxos de estudo dos grupos 3/5 e as telas continuam pendentes. O repositório legado e seus comportamentos permanecem usados pela demonstração atual; os comandos novos não importam seu seed ou armazenamento.

## Consultas acadêmicas — tarefa 2.10

`prototipo/src/dados/consultas-academicas.ts` oferece uma fachada de consultas sobre os comandos existentes. Todas usam a primitiva autorizada de leitura e devolvem `{ revisao, dados }`, com cópias independentes; a revisão permite conferir formulários futuros e invalidar leituras. Não há consulta pública de documento global ou seletor fornecido pela tela. Os DTOs enumeram seus campos em `contratos-consultas-academicas.ts`.

| Consulta | Finalidade e campos permitidos |
| --- | --- |
| `consultarCatalogo` | Função Aluno. Graduações e disciplinas publicadas, quantidade de tópicos e ofertas com período/professores e matrícula do próprio aluno, sem dados de colegas. Busca por nome e filtros de área, nível e período; período restringe também as ofertas. A descrição curta da graduação usa o primeiro parágrafo da descrição. |
| `consultarMetadadosGraduacao`, `consultarMetadadosDisciplina`, `consultarMetadadosTurma` | Detalhes do catálogo, exigindo Aluno e relações reais. Tópicos somente com ID/título; sem materiais, questões ou gabarito. Disciplina/turma em rascunho não tem detalhe de catálogo disponível. |
| `consultarMinhasTurmas` | Matrículas do aluno da sessão, com identidade da oferta, período e disponibilidade do conteúdo, inclusive ofertas em rascunho. Sem projeção de progresso nesta etapa. |
| `consultarEstruturaAdministravel` | Administrador ou Coordenador, filtrando cada graduação pelo vínculo atual e validando o escopo opcional graduação/disciplina/turma. Cadastros, publicação, ofertas e professores vinculados; nenhum conteúdo pedagógico ou histórico. Períodos globais permitem selecionar uma oferta existente; Coordenador sem cursos recebe estrutura vazia. |
| `consultarTurmasDocentes`, `consultarMatriculados` | A lista docente usa só os vínculos Professor–Turma. A consulta de matriculados exige Professor daquela turma, Coordenador do curso ou Administrador e retorna apenas matrícula/data e identidade dos alunos daquela turma. Não retorna respostas ou indicadores. |
| `consultarAlunosVinculados`, `consultarTurmasAlunoVinculado` | Responsável apenas nos vínculos atuais, com identidade dos alunos e contexto de suas ofertas, sem colegas, IDs de matrícula ou respostas. |
| `consultarCandidatos` | Finalidades matrícula/docência exigem gestão da turma; coordenação e Responsável–Aluno exigem Administrador. Retorna somente ID/nome e a função pertinente à seleção, sem e-mail, outras funções ou histórico. Elegibilidade acompanha o comando: aluno/professor/coordenador/Responsável ativos nas respectivas atribuições; destino Aluno do Responsável pode estar inativo conforme o contrato existente. |
| `consultarConteudoEditavel` | Administrador ou Professor com turma da disciplina; retorna tópicos/materiais e questões atuais com gabarito/revisão para autoria, sem matrículas, respostas ou confirmações textuais de outros autores. Coordenação isolada não permite esta consulta. |

IDs aninhados precisam concordar com as relações reais, inclusive para Administrador. Campos extras não permitem pedir histórico ou trocar o autor. A edição cadastral `editarDisciplina` passou a devolver apenas campos cadastrais/publicação, preservando os tópicos persistidos sem expô-los à coordenação pelo retorno do comando.

Os contratos futuros `IndicadoresAlunoTurma`, `IndicadoresDocenciaTurma`, `IndicadoresCoordenacao`, `IndicadoresResponsavel` e `IndicadoresAdministracao` permanecem somente tipos. Médias são representadas por turma e distinguem ausência de matriculados de médias calculadas. Nenhuma consulta desta etapa calcula ou devolve progresso, XP, domínio, taxas ou médias provisórias; não usa zero ou “Sem dados” para representar uma implementação ainda ausente. Registro/leitura de histórico são trabalho do grupo 3, e projeções/indicadores, do grupo 5.

## Estudo por matrícula e histórico imutável — tarefas 3.1–3.4

**Contexto de estudo.** `adaptativo/contexto-estudo.ts` resolve `matriculaId` → aluno, turma, período e disciplina e entrega somente as respostas daquela matrícula. As funções de estudo recebem esse contexto; nenhuma aceita o histórico de uma disciplina inteira. Duas matrículas do mesmo aluno em turmas paralelas ou em períodos distintos da mesma disciplina compartilham conteúdo, mas nunca respostas, domínio ou desbloqueios. Uma matrícula nova começa com domínio 0, histórico vazio e somente o primeiro tópico desbloqueado.

**Resposta imutável.** `RespostaAcademica` é gravada uma única vez por `registrarResposta` e guarda: o conteúdo originalmente apresentado (`conteudoOriginal`: enunciado, alternativas na ordem, gabarito e explicação), a alternativa escolhida, a avaliação (`acertou`), a dificuldade, os efeitos concedidos (`variacaoDominio`, `xpConcedido`), a versão das regras, a data virtual e a ordem global (`momento`). A avaliação e os efeitos são calculados pelo domínio; o comando recebe apenas `questaoId` e `alternativa`, e recusa campos de autor, funções, tópico, avaliação ou XP. O validador do repositório trata a coleção como *append-only*: respostas existentes não podem ser alteradas nem removidas por nenhum comando.

**Conteúdo corrente × conteúdo apresentado.** O cadastro corrente (questões da disciplina) pode receber correções textuais autorizadas no grupo 4. O histórico não o consulta: `consultarHistoricoEstudo` (aluno, na própria matrícula) e `consultarHistoricoAlunoDocente` (professor vinculado à turma da matrícula) devolvem enunciado, alternativas, gabarito e explicação da cópia gravada, e usam `acertou`, `variacaoDominio` e `xpConcedido` registrados, sem reavaliar contra o gabarito ou a dificuldade atuais. Domínio e desbloqueios são reconstituídos aplicando os efeitos gravados na ordem histórica, limitados a 0–100; o progresso devolvido é exato (a formatação pertence à apresentação). O detalhe docente exige vínculo com a turma da matrícula: o mesmo aluno em turma não vinculada, ou outra turma da mesma disciplina, é negado.

**Aceitação de respostas.** A resposta é aceita apenas de pessoa ativa com função Aluno, na própria matrícula, com disciplina publicada, questão da disciplina da turma e tópico desbloqueado; alternativa inexistente é recusada. Qualquer recusa deixa o documento (respostas, domínio, progresso e XP) intacto.

## Motor adaptativo, gamificação e indicadores por turma — tarefas 5.1–5.9

Tudo é derivado do histórico imutável da matrícula (grupo 3), sem contadores gravados. Os valores numéricos permanecem exatos no motor e nos agregadores; somente `desempenho/apresentacao.ts` arredonda (`Math.round`: meio ponto sobe).

**Próxima atividade (`adaptativo/estudo.ts`).** Entre os tópicos desbloqueados e não dominados, escolhe o de menor domínio (desempate pela ordem da disciplina); a dificuldade segue a faixa do domínio (0–39 Fácil, 40–69 Médio, 70–100 Difícil); prefere questão inédita, evita repetir a última respondida quando há alternativa e, sem inédita, reutiliza a menos recente na dificuldade. Usa apenas o banco da disciplina do contexto. Como o desbloqueio é encadeado e tópico dominado permanece dominado, na prática há um único candidato por vez; a regra de menor domínio é testada com estado injetado.

**Feedback e revisão.** Após cada resposta: acerto/erro, explicação e alternativa correta (só no erro) a partir do conteúdo gravado na resposta, domínio anterior/atual e variação efetiva (limitada a 0–100), e se o tópico foi dominado. Dois erros consecutivos no mesmo tópico **da mesma matrícula** sugerem revisão; erros de outra turma, período ou aluno nunca compõem a sequência. O progresso é `100 × dominados ÷ tópicos` (exato; 1 de 6 = 100/6, exibido 17); concluída = todos dominados. Concluir a trilha não representa aprovação acadêmica nem conclusão da graduação.

**Gamificação (`gamificacao/gamificacao.ts`, por matrícula).**

| Elemento | Regra |
| --- | --- |
| XP | Soma dos `xpConcedido` das respostas da matrícula (Fácil 10, Médio 20, Difícil 30 por acerto; erro 0). Nova matrícula começa em 0. |
| Sequência | Dias distintos com resposta na matrícula, terminando na data virtual atual ou no dia anterior; um dia inteiro sem resposta a zera. Estudo em outra turma não conta. |
| Conquistas | Primeira questão (mesmo com erro), Primeiro tópico dominado, Sequência de 7 dias e Trilha concluída. Cada uma é concedida uma vez por matrícula, com a data da resposta que satisfez o marco (nunca a da consulta ou de uma edição). Reconstruir a projeção reproduz as mesmas datas. |

Edições de conteúdo permitidas ou rejeitadas não registram respostas e, portanto, não alteram XP, conquistas, datas ou sequência.

**Indicadores por turma (`desempenho/indicadores-academicos.ts`).** Sempre sobre todos os matriculados da turma, inclusive quem não respondeu; matrículas e respostas de outra turma não entram na soma nem no divisor. Para `N > 0` matriculados, `T` tópicos e `d_i` tópicos dominados pelo matriculado `i`:

- progresso individual `p_i = 100 × d_i ÷ T` (0 se `T = 0`);
- progresso médio `Σ p_i ÷ N`; domínio médio do tópico `Σ domínio(i, t) ÷ N` (zero para quem não iniciou);
- sem matriculados: **Sem dados** (distinto de média zero), sem divisão por zero.

| Exemplo | Cálculo exato | Exibido |
| --- | --- | --- |
| Progressos 80% e 0% | (80 + 0) ÷ 2 | 40% |
| Domínios 80 e 0 | (80 + 0) ÷ 2 | 40 |
| Seis tópicos, alunos com 1, 1 e 4 dominados | (100/6 + 100/6 + 400/6) ÷ 3 = 33,33… | 33% (as barras 17, 17 e 67 dariam 34 e **não** alimentam a média) |
| Domínios 80, 0 e 0 | 80 ÷ 3 = 26,67 | 27 |
| Domínios 80 e 5 | 42,5 | 43 |
| Turma sem alunos | — | Sem dados |

Não existem médias globais: cada média pertence a uma turma, e filtros de graduação, disciplina ou período apenas selecionam linhas por turma.

**Taxa de acertos e destaque.** Taxa = acertos ÷ respostas válidas da matrícula (exata; 0 e “Sem atividade” sem respostas). “Precisa de atenção” = menos de 50% de acertos (razão sem arredondar) nas últimas até 10 respostas da matrícula consultada — usa as disponíveis se houver menos de 10; sem respostas é “Sem atividade” e não classifica. O detalhe docente traz as últimas até 10 respostas da turma vinculada; o aluno vê todo o próprio histórico.

**Consultas por função** (`ConsultasAcademicas`, todas autorizadas pelo recurso real):

| Consulta | Quem / escopo | Conteúdo |
| --- | --- | --- |
| `consultarPainelAluno`, `consultarIndicadoresAluno` | Aluno, matrículas próprias com conteúdo publicado | Progresso, domínio por tópico, taxa, XP, sequência, conquistas e última atividade por oferta, com graduação/disciplina/turma/período. |
| `consultarIndicadoresDocencia` | Professor vinculado à turma | Todos os matriculados com indicadores e situação, `quantidadeMatriculados` e médias da turma. |
| `consultarIndicadoresCoordenacao` | Coordenador (cursos vinculados) ou Administrador | Uma linha por turma: matrículas e médias; nenhum dado individual, resposta ou média global. Filtros por graduação, disciplina ou turma. |
| `consultarIndicadoresResponsavel` | Responsável, alunos vinculados | Por oferta: progresso, sequência e última atividade; sem histórico de questões. |
| `consultarIndicadoresAdministracao` | Administrador | Pessoas distintas (ativas ou não) e por função — quem tem duas funções conta uma vez no total e uma vez em cada função —, graduações, disciplinas por publicação (graduação não conta como rascunho/publicada), períodos, turmas e matrículas. |

## Revogação — tarefa 2.11

Consultas e comandos não guardam permissões em cache: a primitiva relê sessão, pessoa ativa, funções e vínculos antes de cada operação. A remoção de Professor–Turma revoga o acesso aos matriculados daquela turma na próxima consulta, preservando outras turmas. A autoria do conteúdo compartilhado continua válida enquanto outra turma da disciplina ou a função Administrador a autorizar. Retirar Coordenador preserva a função Professor e seus acessos independentes, e retirar Responsável não remove as matrículas da mesma pessoa com função Aluno.

Os testes de `revogacao-academica.test.ts` usam duas sessões no mesmo armazenamento isolado e os comandos reais de remoção de vínculo, edição de funções e desativação. Um editor cadastral aberto pela coordenação não consegue salvar depois da revogação, tanto usando sua revisão original quanto a revisão atual: a falta de autorização é verificada antes da conferência de revisão. O documento e a revisão resultantes da revogação permanecem intactos em cada operação recusada, assim como históricos e vínculos não removidos.

A leitura de conteúdo editável também revalida o último vínculo docente. O teste de salvamento usa o editor cadastral e seu comando real já disponível; o salvamento pedagógico continua no grupo 4. Objetos retornados antes da revogação são cópias independentes e não concedem permissão para a próxima operação. A limpeza de retratos visuais e a invalidação de consultas em componentes permanecem no grupo 7, pois as telas ainda não usam esta fachada.

### Ambiente de verificação

Com Node 26, o Web Storage nativo conflita com o ambiente jsdom do Vitest 2. Executar os testes com a opção herdada pelos workers, sem modificar os testes existentes ou desativar suas validações:

```powershell
$env:NODE_OPTIONS = "$env:NODE_OPTIONS --no-experimental-webstorage"
npm.cmd test -- --run
```

O build continua com `npm.cmd run build` (TypeScript e Vite). A falha de seletor preexistente em `src/testes/aluno.test.tsx:43` (testes de matrícula e trilha por curso) deixou de existir na tarefa 7: os testes de interface legados (`aluno.test.tsx`, `perfis.test.tsx`) foram substituídos por testes dos novos fluxos acadêmicos. Resultados e evidências desta change estão em [validacao-final.md](validacao-final.md).

## Requisitos Funcionais da entrega inicial (referência histórica)

### Perfis e acesso — `perfis-acesso`

| ID | Requisito | Requirement de origem |
|----|-----------|-----------------------|
| RF01 | O sistema deve suportar os perfis Aluno, Professor, Administrador e Responsável, com um único perfil por usuário, e abrir a área inicial do perfil ao entrar. | Perfis de usuário suportados |
| RF02 | No protótipo, a entrada é feita escolhendo um usuário de demonstração, sem senha; deve ser possível sair e trocar de usuário. | Entrada simulada no protótipo |
| RF03 | O sistema deve exibir apenas áreas e ações permitidas ao perfil atual, redirecionando acessos indevidos para a área do perfil. | Acesso restrito por perfil |
| RF04 | O Administrador deve listar, criar, editar e desativar usuários; usuários desativados não podem entrar. | Administração de usuários |
| RF05 | O Administrador deve vincular Responsáveis a Alunos e Professores a Cursos; o Responsável vê apenas alunos vinculados. | Vínculos entre usuários |

### Catálogo de cursos — `catalogo-cursos`

| ID | Requisito | Requirement de origem |
|----|-----------|-----------------------|
| RF06 | O catálogo deve listar apenas cursos publicados, com título, descrição curta, área, nível e nº de tópicos. | Catálogo de cursos publicados |
| RF07 | O catálogo deve permitir busca por título e filtro por área e nível, com mensagem quando não houver resultados. | Busca e filtro no catálogo |
| RF08 | O detalhe do curso deve exibir descrição, professor e tópicos ordenados, com ação "Matricular" ou "Continuar". | Detalhe do curso |
| RF09 | O Aluno deve poder se matricular uma única vez por curso; a matrícula cria uma trilha adaptativa nova com o 1º tópico desbloqueado. | Matrícula em curso |
| RF10 | "Meus cursos" deve listar as matrículas do Aluno com progresso e acesso à trilha. | Meus cursos |

### Gestão de conteúdo — `gestao-conteudo-curso`

| ID | Requisito | Requirement de origem |
|----|-----------|-----------------------|
| RF11 | O Professor deve criar cursos (título, descrição, área, nível), que iniciam como "rascunho"; título é obrigatório. | Criação de curso |
| RF12 | O Professor deve adicionar, editar, remover e reordenar tópicos; a ordem define a sequência de desbloqueio. | Tópicos ordenados |
| RF13 | O Professor deve anexar materiais (texto, vídeo ou arquivo por link) a cada tópico. | Materiais por tópico |
| RF14 | O Professor deve cadastrar questões de múltipla escolha por tópico, com alternativa correta obrigatória, explicação e dificuldade (Fácil, Médio, Difícil). | Banco de questões classificado |
| RF15 | O curso só pode ser publicado se cada tópico tiver ao menos uma questão de cada nível; caso contrário, listar o que falta. | Publicação de curso |
| RF16 | O Professor edita apenas cursos vinculados a ele; o Administrador edita todos. | Escopo do professor |

### Aprendizado adaptativo — `aprendizado-adaptativo`

| ID | Requisito | Requirement de origem |
|----|-----------|-----------------------|
| RF17 | O estado adaptativo deve ser independente para cada par aluno + curso. | Trilha independente por curso |
| RF18 | Cada tópico tem domínio 0–100 (inicia em 0); acertos aumentam e erros diminuem, sem sair dos limites. | Nível de domínio por tópico |
| RF19 | A dificuldade da próxima questão segue a faixa de domínio: 0–39 Fácil, 40–69 Médio, 70–100 Difícil. | Dificuldade conforme domínio |
| RF20 | A próxima questão vem do tópico desbloqueado e não dominado de menor domínio, evitando repetir a última questão. | Escolha da próxima atividade |
| RF21 | Domínio ≥ 80 marca o tópico como dominado e desbloqueia o seguinte. | Desbloqueio de tópicos |
| RF22 | Após cada resposta, exibir acerto/erro, alternativa correta, explicação e variação do domínio. | Feedback imediato |
| RF23 | Após 2 erros seguidos no mesmo tópico, sugerir revisão dos materiais. | Revisão sugerida |
| RF24 | O progresso é a % de tópicos dominados; com todos dominados, o curso é concluído. | Conclusão do curso |

### Gamificação — `gamificacao`

| ID | Requisito | Requirement de origem |
|----|-----------|-----------------------|
| RF25 | Conceder XP por acerto (10/20/30 para Fácil/Médio/Difícil), contabilizado por curso. | XP por curso |
| RF26 | Contar a sequência de dias consecutivos com atividade no curso, zerando após um dia sem atividade. | Sequência de dias de estudo |
| RF27 | Conceder, uma vez por curso, as conquistas: primeira questão, primeiro tópico dominado, sequência de 7 dias e curso concluído. | Conquistas |
| RF28 | Exibir XP, sequência e conquistas na tela da trilha de cada curso. | Exibição de gamificação |

### Acompanhamento de desempenho — `acompanhamento-desempenho`

| ID | Requisito | Requirement de origem |
|----|-----------|-----------------------|
| RF29 | Painel do Aluno por curso: progresso, domínio por tópico, taxa de acertos e XP. | Painel do aluno |
| RF30 | Painel do Professor por curso: alunos com progresso e taxa de acertos, e domínio médio por tópico. | Painel do professor por curso |
| RF31 | Destacar alunos com menos de 50% de acertos nas últimas 10 respostas do curso. | Alunos com dificuldade |
| RF32 | O Professor pode abrir o detalhe de um aluno: domínio por tópico e respostas recentes no curso. | Detalhe de aluno para o professor |
| RF33 | Painel do Responsável: por aluno vinculado, cursos com progresso, sequência e última atividade. | Painel do responsável |
| RF34 | Visão geral do Administrador: usuários por perfil, cursos por status e total de matrículas. | Visão geral do administrador |

## Requisitos Não Funcionais

| ID | Categoria | Requisito |
|----|-----------|-----------|
| RNF01 | Usabilidade | Interface em português do Brasil, com linguagem simples; cada fluxo principal concluível em no máximo 3 cliques a partir da área inicial do perfil. |
| RNF02 | Usabilidade / Acessibilidade | Contraste mínimo WCAG AA, navegação por teclado nos elementos interativos e rótulos em todos os campos de formulário. |
| RNF03 | Desempenho percebido | Feedback de resposta e troca de tela em menos de 200 ms no protótipo (dados locais). |
| RNF04 | Privacidade | Dados de desempenho de um aluno visíveis apenas para ele, professores dos seus cursos, responsáveis vinculados e administradores (alinhado à LGPD para a fase de MVP). |
| RNF05 | Compatibilidade | Funcionar nas duas últimas versões de Chrome, Edge e Firefox; layout utilizável a partir de 360 px de largura. |
| RNF06 | Manutenibilidade | Motor adaptativo isolado da interface, com parâmetros centralizados e testes automatizados. |
| RNF07 | Portabilidade de dados | Camada de dados com interface assíncrona, permitindo trocar o armazenamento local por uma API sem alterar telas. |
| RNF08 | Protótipo | Rodar localmente com um único comando, sem serviços externos, e permitir restaurar os dados de demonstração. |
