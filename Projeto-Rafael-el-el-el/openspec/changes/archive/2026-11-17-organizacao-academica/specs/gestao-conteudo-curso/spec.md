# Spec Delta

## Purpose

Permite manter e publicar conteúdo de disciplinas, compartilhando tópicos, materiais e questões entre suas turmas com autorização docente por vínculo.

## ADDED Requirements

### Requirement: Conteúdo pertencente à disciplina
O sistema SHALL manter tópicos, materiais, questões e publicação na disciplina, compartilhados por suas turmas. O conteúdo SHALL começar em rascunho na criação pelo Administrador ou Coordenador autorizado. Criar turma MUST NOT duplicar conteúdo; somente alterações permitidas SHALL ser visíveis nas turmas, sem copiar, reinterpretar ou reiniciar históricos e resultados. Toda edição SHALL respeitar os bloqueios de estudo e a validade da publicação.

#### Scenario: Duas turmas compartilham conteúdo
- **GIVEN** turmas A e B de Algoritmos em períodos distintos
- **WHEN** um Professor autorizado altera o texto de um material de Algoritmos
- **THEN** o material atualizado fica disponível nas duas ofertas publicadas e os históricos de resposta permanecem separados e preservados

#### Scenario: Oferta nova usa o conteúdo existente
- **GIVEN** Algoritmos com tópicos, materiais e questões cadastrados
- **WHEN** o Administrador cria outra turma dessa disciplina
- **THEN** essa turma utiliza o mesmo conteúdo, sem criar uma segunda disciplina ou um segundo banco de questões

### Requirement: Bloqueio estrutural após início do estudo
A partir da primeira resposta válida registrada em qualquer turma da disciplina, o sistema MUST rejeitar adição, remoção e reordenação de tópicos dessa disciplina. O bloqueio SHALL valer para todas as ofertas e autores, inclusive Administrador, independentemente de a turma acessada estar vazia, sem respostas ou com trilhas concluídas. O sistema SHALL informar que o estudo já foi iniciado.

#### Scenario: Aluno com trilha em andamento
- **GIVEN** Ana com respostas e trilha em andamento na turma A de Algoritmos
- **WHEN** o Professor tenta adicionar um tópico, remover um tópico ou alterar sua ordem nessa disciplina
- **THEN** cada tentativa é rejeitada, com explicação do bloqueio e preservação da estrutura anterior

#### Scenario: Aluno já concluiu a trilha
- **GIVEN** Ana com trilha concluída na turma A de Algoritmos
- **WHEN** um Administrador tenta adicionar um tópico à disciplina
- **THEN** a adição é rejeitada e a trilha de Ana continua concluída com os mesmos tópicos

#### Scenario: Resposta em outra turma bloqueia oferta nova
- **GIVEN** turma A de Algoritmos com uma resposta e turma B da mesma disciplina em outro período, sem alunos
- **WHEN** o Professor vinculado somente a B tenta reordenar tópicos da disciplina
- **THEN** a alteração é rejeitada por existir estudo em A e a ordem permanece igual nas duas turmas

### Requirement: Proteção de questões com respostas
O sistema MUST rejeitar exclusão, reordenação de alternativas e mudanças de identidade, tópico, dificuldade ou gabarito de questão respondida em qualquer turma, mesmo com confirmação humana. Correções textuais SHALL seguir o requisito Correção textual de questões respondidas, sem mudar significado ou correspondência das alternativas. Questões sem respostas SHALL admitir edição e remoção por autor autorizado, respeitando cobertura publicada e resultados existentes.

#### Scenario: Mudança de gabarito de questão respondida
- **GIVEN** questão com resposta correta de Ana na turma A e resposta incorreta de Bruno em B, e confirmação humana apresentada pelo Professor autorizado
- **WHEN** o Professor tenta trocar seu gabarito mesmo com essa confirmação
- **THEN** a alteração é rejeitada, mantendo o gabarito, a interpretação e a avaliação originais das duas respostas

#### Scenario: Mudança de dificuldade afetaria domínio e XP
- **GIVEN** questão Difícil respondida em uma turma da disciplina
- **WHEN** um Administrador tenta reclassificá-la como Fácil ou vinculá-la a outro tópico
- **THEN** a alteração é rejeitada e dificuldade e tópico permanecem os originais em todas as turmas

#### Scenario: Alteração de sentido ou correspondência das alternativas
- **GIVEN** questão já respondida pedindo a alternativa correta
- **WHEN** o Professor tenta mudar o enunciado para pedir a incorreta ou trocar alternativas de modo a reinterpretar a escolha registrada
- **THEN** cada alteração é rejeitada e as respostas continuam associadas ao enunciado e às escolhas originais

#### Scenario: Exclusão de questão com resposta em outra turma
- **GIVEN** uma questão respondida apenas na turma A
- **WHEN** um Professor vinculado à turma B da mesma disciplina tenta excluir a questão
- **THEN** a exclusão é rejeitada e a questão continua disponível para interpretação do histórico de A

#### Scenario: Reordenação não é correção textual permitida
- **GIVEN** questão respondida e autor autorizado que confirma a preservação de sentido
- **WHEN** o autor tenta trocar a ordem de duas alternativas, ainda que mantenha seus textos
- **THEN** o sistema rejeita a reordenação e mantém as posições e correspondências originais

#### Scenario: Edição de questão ainda não respondida
- **GIVEN** uma questão sem respostas em qualquer turma e cobertura válida de dificuldades
- **WHEN** o Professor autorizado ajusta seu enunciado sem alterar tópicos nem invalidar a cobertura publicada
- **THEN** a edição é aceita e todos os históricos e resultados anteriores permanecem inalterados

### Requirement: Correção textual de questões respondidas
O sistema SHALL permitir corrigir somente enunciado, texto das alternativas e explicação, preservando significado, quantidade, ordem e correspondência das alternativas. Antes de salvar, SHALL apresentar a diferença e exigir confirmação humana do próprio autor autorizado, sem segunda pessoa. A confirmação MUST se vincular à alteração exata e à revisão original; nova alteração ou mudança da revisão de origem SHALL exigir nova confirmação.

#### Scenario: Correção textual aceita pelo próprio autor
- **GIVEN** questão respondida com erro de digitação e Professor autorizado à sua edição
- **WHEN** o Professor corrige enunciado, texto de uma alternativa ou explicação, examina a diferença apresentada e confirma que significado e correspondência foram preservados
- **THEN** o sistema salva somente a correção confirmada, sem reordenar alternativas nem exigir outro revisor, mantendo publicação e resultados anteriores

#### Scenario: Correção sem confirmação
- **GIVEN** correção textual de questão respondida preparada por autor autorizado
- **WHEN** o autor tenta salvar sem confirmar a diferença apresentada
- **THEN** a edição é rejeitada e conteúdo anterior, publicação e dados dos alunos permanecem inalterados

#### Scenario: Confirmação de uma alteração diferente
- **GIVEN** confirmação do autor para uma correção do enunciado vinculada à revisão original
- **WHEN** é solicitado salvamento de outra diferença textual usando aquela confirmação
- **THEN** o sistema rejeita o salvamento e exige apresentação e confirmação da diferença exata solicitada

#### Scenario: Nova edição após confirmar
- **GIVEN** autor que já confirmou a diferença de uma correção textual
- **WHEN** o autor modifica também a explicação antes de salvar
- **THEN** a confirmação anterior deixa de valer e o sistema apresenta a nova diferença e exige nova confirmação

#### Scenario: Revisão original ficou desatualizada
- **GIVEN** confirmação vinculada à revisão R1 de uma questão respondida
- **WHEN** a questão passa à revisão R2 antes do salvamento e o autor tenta usar a confirmação de R1
- **THEN** o sistema rejeita a tentativa e exige nova comparação com R2 e nova confirmação, mesmo que o texto proposto não tenha mudado

#### Scenario: Confirmação não substitui autorização de edição
- **GIVEN** autor que confirmou a correção, mas perdeu seu último vínculo docente com a disciplina e não tem função Administrador
- **WHEN** tenta salvar a correção usando aquela confirmação
- **THEN** o sistema nega a edição por ausência de autorização e não altera o conteúdo nem os dados dos alunos

### Requirement: Publicação de conteúdo da disciplina
O Professor autorizado ou Administrador SHALL poder publicar o conteúdo de uma disciplina somente se houver ao menos um tópico e cada tópico tiver uma questão de cada dificuldade. A publicação SHALL disponibilizar a disciplina no catálogo e suas atividades para alunos matriculados, sem publicar uma graduação como trilha ou criar matrículas.

#### Scenario: Publicação bloqueada por cobertura
- **WHEN** o Professor tenta publicar conteúdo com tópico sem questão Difícil
- **THEN** o sistema mantém o conteúdo em rascunho e lista os tópicos e dificuldades faltantes

#### Scenario: Disciplina sem tópicos
- **WHEN** o Professor tenta publicar conteúdo de uma disciplina sem tópicos
- **THEN** o sistema rejeita a publicação e informa a necessidade de tópicos

#### Scenario: Publicação bem-sucedida
- **WHEN** o Professor publica conteúdo que atende aos critérios
- **THEN** a disciplina passa a publicada, aparece no catálogo e fica disponível para estudo nas suas turmas com alunos matriculados

### Requirement: Validade contínua do conteúdo publicado
O sistema MUST validar o estado final de toda edição de conteúdo de disciplina publicada, inclusive alterações posteriores à publicação. O salvamento SHALL exigir ao menos um tópico e uma questão válida de cada dificuldade por tópico, além dos bloqueios de estudo. Edição inválida MUST ser rejeitada integralmente, sem salvar parte da alteração, despublicar a disciplina ou modificar conteúdo válido anterior e dados dos alunos.

#### Scenario: Edição válida após publicação
- **GIVEN** disciplina publicada com cobertura válida e nenhuma resposta à questão que será editada
- **WHEN** o Professor autorizado corrige essa questão, mantendo tópico, dificuldade e cobertura válidos
- **THEN** o conteúdo atualizado é salvo, a disciplina continua publicada e os resultados dos alunos permanecem inalterados

#### Scenario: Edição quebra cobertura de dificuldade
- **GIVEN** disciplina publicada com uma única questão Difícil em Vetores, ainda sem respostas nessa questão
- **WHEN** o Professor tenta excluir essa questão ou mudar sua dificuldade para Médio
- **THEN** cada tentativa é rejeitada com indicação de Vetores e dificuldade Difícil faltante, preservando a questão anterior, a publicação e os dados dos alunos

#### Scenario: Remoção deixaria disciplina publicada sem tópicos
- **GIVEN** disciplina publicada com um único tópico e nenhuma resposta em qualquer turma
- **WHEN** o Professor tenta remover esse tópico
- **THEN** o sistema rejeita a alteração e mantém o tópico, suas questões e a disciplina publicada

#### Scenario: Falha preserva o conjunto anterior
- **GIVEN** disciplina publicada e dados de estudo de alunos em suas turmas
- **WHEN** o autor salva em conjunto uma correção de material e a remoção da única questão Fácil não respondida de um tópico
- **THEN** toda a edição é rejeitada, o material e a questão anteriores são mantidos e publicação, históricos e resultados dos alunos não mudam

### Requirement: Escopo do professor sobre conteúdo
O Professor SHALL poder manter e publicar conteúdo apenas de disciplinas com turma docente vinculada. O Administrador SHALL poder editar qualquer disciplina. Ambos MUST respeitar bloqueios de estudo, proteção de questões respondidas e validade do conteúdo publicado. O vínculo docente MUST NOT permitir consultar matrículas, progresso ou respostas de outras turmas, mesmo com conteúdo compartilhado.

#### Scenario: Professor sem vínculo
- **WHEN** um Professor tenta abrir ou alterar conteúdo de disciplina sem vínculo docente em nenhuma de suas turmas
- **THEN** o sistema nega a edição e mantém o conteúdo inalterado

#### Scenario: Professor com várias turmas da mesma disciplina
- **GIVEN** Paulo professor das turmas A e B de Algoritmos
- **WHEN** Paulo abre a edição de conteúdo por qualquer uma dessas turmas
- **THEN** encontra o mesmo conteúdo da disciplina, sem duplicação de tópicos ou questões

#### Scenario: Último vínculo docente removido
- **GIVEN** Paulo professor apenas da turma A de Algoritmos
- **WHEN** tenta editar Algoritmos após a remoção desse vínculo
- **THEN** a edição é negada, salvo se outra função válida, como Administrador, autorizar a operação

#### Scenario: Criar disciplina não concede autoria pedagógica
- **GIVEN** Carla somente Coordenador, vinculada a Direito, e criadora do cadastro de Direito Civil
- **WHEN** tenta adicionar tópicos ou publicar conteúdo dessa disciplina
- **THEN** o sistema nega a operação, mantendo a permissão de Carla para editar dados cadastrais, turmas, matrículas e vínculos docentes de Direito

## MODIFIED Requirements

### Requirement: Tópicos ordenados
O Professor autorizado SHALL poder adicionar, remover e reordenar tópicos somente enquanto não houver resposta registrada em nenhuma turma da disciplina. O título SHALL ser obrigatório e sua edição MUST preservar o significado de tópicos com respostas. A ordem SHALL definir a sequência de desbloqueio nas turmas. Toda alteração SHALL respeitar a cobertura exigida para conteúdo publicado.

#### Scenario: Reordenar tópicos
- **GIVEN** nenhuma resposta registrada em qualquer turma da disciplina e conteúdo com cobertura válida
- **WHEN** o Professor autorizado move Estruturas de repetição para antes de Vetores
- **THEN** a disciplina apresenta essa ordem e uma nova matrícula começa com o primeiro tópico dessa sequência desbloqueado

#### Scenario: Tópico sem título
- **WHEN** o Professor tenta salvar um tópico sem título
- **THEN** o sistema rejeita o cadastro e indica o campo obrigatório

### Requirement: Materiais por tópico
O Professor autorizado SHALL poder adicionar e ajustar materiais de texto, vídeo por link ou arquivo por link, inclusive após início ou conclusão do estudo. Esses ajustes MUST NOT modificar tópicos, questões, regras de avaliação ou resultados anteriores. Os materiais SHALL ser consultáveis pelo Aluno matriculado em turma da disciplina publicada, sem acesso a dados de colegas.

#### Scenario: Adicionar material
- **WHEN** o Professor adiciona um link de vídeo ao tópico Estruturas de repetição
- **THEN** o material aparece nesse tópico para os alunos matriculados nas turmas da disciplina publicada

#### Scenario: Ajuste seguro após estudo em várias turmas
- **GIVEN** Ana em andamento em A e Bruno com trilha concluída em B, ambas de Algoritmos
- **WHEN** o Professor autorizado corrige um link de vídeo sem alterar tópicos, questões ou regras de avaliação
- **THEN** o novo link fica disponível nas duas turmas, sem modificar os históricos ou resultados de Ana e Bruno

### Requirement: Banco de questões classificado
O Professor autorizado SHALL poder cadastrar questões de múltipla escolha vinculadas a um tópico da disciplina, com enunciado, ao menos duas alternativas, exatamente uma alternativa correta, explicação e dificuldade Fácil, Médio ou Difícil. O sistema MUST rejeitar questão sem alternativa correta válida, explicação ou tópico pertencente à disciplina.

#### Scenario: Cadastrar questão
- **WHEN** o Professor cadastra uma questão válida no tópico Vetores com dificuldade Médio
- **THEN** a questão aparece no banco desse tópico com a dificuldade informada

#### Scenario: Questão sem alternativa correta
- **WHEN** o Professor tenta salvar uma questão sem indicar uma alternativa correta preenchida
- **THEN** o sistema não salva e informa que é preciso marcar uma alternativa correta válida

#### Scenario: Questão com tópico de outra disciplina
- **WHEN** o Professor tenta cadastrar em Algoritmos uma questão vinculada a tópico de Direito Civil
- **THEN** o sistema rejeita a associação e não altera nenhum dos bancos de questões

## REMOVED Requirements

### Requirement: Criação de curso
**Reason**: Tópicos, materiais, questões e publicação pertencem à disciplina; a graduação deixa de ser criada como trilha pelo professor.
**Migration**: Use o requisito "Conteúdo pertencente à disciplina".

### Requirement: Publicação de curso
**Reason**: A publicação passa a ser do conteúdo da disciplina, sem publicar uma graduação como trilha.
**Migration**: Use o requisito "Publicação de conteúdo da disciplina".

### Requirement: Escopo do professor
**Reason**: A autoria passa a decorrer do vínculo com turma da disciplina, não de vínculo com curso.
**Migration**: Use o requisito "Escopo do professor sobre conteúdo".
