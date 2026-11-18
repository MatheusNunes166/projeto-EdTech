# Spec Delta

## Purpose

Representa graduações, suas disciplinas e ofertas em turmas por período letivo, com matrículas e vínculos acadêmicos verificáveis em um protótipo de faculdade.

## ADDED Requirements

### Requirement: Cadastro de graduações
O sistema SHALL permitir ao Administrador criar, listar e editar graduações com código, nome, descrição e área. Código e nome SHALL ser obrigatórios, e o código SHALL ser único entre graduações. Curso SHALL representar uma graduação, sem tópicos ou matrícula direta.

#### Scenario: Criar graduação
- **WHEN** o Administrador cadastra código SI, nome Sistemas de Informação, descrição e área Tecnologia
- **THEN** a graduação é exibida na organização acadêmica com esses dados e sem trilha própria

#### Scenario: Dados obrigatórios ou código duplicado
- **WHEN** o Administrador tenta salvar uma graduação sem nome ou com código já utilizado
- **THEN** o sistema informa o problema e não cria nem altera a graduação

### Requirement: Gestão de graduação pela coordenação
O sistema SHALL permitir ao Coordenador editar código, nome, descrição e área apenas das graduações vinculadas, respeitando obrigatoriedade e unicidade. Criar graduações SHALL permanecer exclusivo do Administrador. O Coordenador MUST NOT alterar uma graduação não vinculada nem obter novos vínculos de coordenação por editar seus dados.

#### Scenario: Coordenador edita seu curso
- **GIVEN** Carla coordenadora de Direito
- **WHEN** Carla altera a descrição de Direito
- **THEN** o sistema salva a descrição e preserva as disciplinas, turmas e vínculos existentes

#### Scenario: Curso fora da coordenação
- **GIVEN** Carla coordenadora apenas de Direito
- **WHEN** Carla tenta editar Sistemas de Informação por endereço direto
- **THEN** o sistema nega a operação e não altera os dados de nenhuma graduação

### Requirement: Disciplinas de uma graduação
O Administrador ou Coordenador vinculado à graduação SHALL criar, listar e editar suas disciplinas com código, nome, descrição curta, descrição e nível pedagógico Iniciante, Intermediário ou Avançado. Código, nome e graduação SHALL ser obrigatórios; código SHALL ser único na graduação. Cada disciplina MUST pertencer a uma graduação e começar com conteúdo em rascunho. A coordenação MUST ter vínculo com origem e destino ao alterar a graduação.

#### Scenario: Criar disciplina
- **WHEN** o Administrador cadastra Algoritmos, código ALG, na graduação Sistemas de Informação, com nível Iniciante
- **THEN** a disciplina aparece nessa graduação com conteúdo em rascunho

#### Scenario: Graduação inexistente
- **WHEN** o Administrador tenta salvar uma disciplina vinculada a uma graduação inexistente
- **THEN** o sistema rejeita o cadastro e informa que a graduação é inválida

#### Scenario: Códigos em graduações distintas
- **GIVEN** uma disciplina de código EST na graduação Agronomia
- **WHEN** o Administrador cria uma disciplina de código EST na graduação Psicologia
- **THEN** ambas são mantidas como disciplinas distintas com conteúdos e turmas próprios

#### Scenario: Coordenador cria disciplina no próprio curso
- **GIVEN** Carla coordenadora de Direito
- **WHEN** cadastra Direito Civil com código CIV e nível Iniciante em Direito
- **THEN** o sistema cria a disciplina em Direito com conteúdo em rascunho

#### Scenario: Transferência para curso não coordenado
- **GIVEN** uma disciplina sem matrículas e Carla coordenadora somente de sua graduação atual
- **WHEN** Carla tenta transferir a disciplina para uma graduação que não coordena
- **THEN** o sistema rejeita a alteração e mantém a graduação original

### Requirement: Períodos letivos
O sistema SHALL permitir ao Administrador criar, listar e editar períodos letivos com identificador único, nome e datas de início e fim. Nome e datas SHALL ser obrigatórios; a data de fim MUST ser igual ou posterior à data de início. Período letivo SHALL identificar uma oferta, sem representar nível pedagógico ou semestre curricular.

#### Scenario: Cadastrar período válido
- **WHEN** o Administrador cadastra o período 2026.2 com início em 03/08/2026 e fim em 18/12/2026
- **THEN** o período fica disponível para vinculação de turmas

#### Scenario: Intervalo inválido
- **WHEN** o Administrador informa fim anterior ao início de um período
- **THEN** o sistema não salva e aponta o intervalo inválido

### Requirement: Ofertas de disciplinas em turmas
O Administrador ou Coordenador vinculado à graduação da disciplina SHALL criar, listar e editar turmas com código, disciplina e período existentes. Código SHALL ser obrigatório e único na combinação disciplina–período. Uma disciplina SHALL admitir várias turmas por período e em períodos distintos, com zero alunos ou professores. Alterações pela coordenação MUST manter origem e destino dentro de suas graduações vinculadas.

#### Scenario: Turmas paralelas e oferta posterior
- **WHEN** o Administrador cria turmas A e B de Algoritmos em 2026.2 e turma A em 2027.1
- **THEN** o sistema mantém três turmas distintas com seus respectivos períodos

#### Scenario: Código duplicado na mesma oferta
- **GIVEN** a turma A de Algoritmos em 2026.2
- **WHEN** o Administrador tenta criar outra turma A da mesma disciplina no mesmo período
- **THEN** o sistema rejeita a duplicação sem alterar a turma existente

#### Scenario: Referência inexistente
- **WHEN** o Administrador tenta criar uma turma com disciplina ou período inexistente
- **THEN** o sistema rejeita o cadastro e identifica a referência inválida

#### Scenario: Coordenador cria oferta em período existente
- **GIVEN** Carla coordenadora de Direito e período 2027.1 já cadastrado
- **WHEN** cria a turma A de Direito Civil nesse período
- **THEN** a turma é criada em Direito Civil, sem alterar o cadastro global do período

### Requirement: Identidade das ofertas e histórico
O sistema MUST manter a identidade de cada oferta: após existir matrícula ou resposta, MUST NOT permitir trocar a disciplina ou o período da turma nem a graduação da disciplina. Uma nova oferta SHALL exigir uma turma distinta. Renomear códigos ou nomes MUST NOT reiniciar matrículas, vínculos ou progresso.

#### Scenario: Troca de período com histórico
- **GIVEN** uma turma de Algoritmos em 2026.2 com aluno matriculado
- **WHEN** o Administrador tenta mudar essa turma para 2027.1
- **THEN** o sistema rejeita a mudança e orienta criar outra turma

#### Scenario: Renomear sem perder vínculos
- **GIVEN** uma turma com matrículas e respostas
- **WHEN** o Administrador altera somente o código da turma para um código disponível
- **THEN** as matrículas, respostas e vínculos continuam associados à mesma turma

### Requirement: Matrícula administrativa em turma
O sistema SHALL permitir ao Administrador ou Coordenador vinculado à graduação da turma matricular uma pessoa ativa com função Aluno em turma existente. A matrícula SHALL registrar aluno, turma e data da demonstração, concedendo acesso apenas àquela oferta. Um aluno SHALL poder ter matrículas em várias turmas; disciplina em rascunho MUST NOT liberar atividades de estudo.

#### Scenario: Matrícula inicial
- **WHEN** o Administrador matricula Ana, ativa e com função Aluno, na turma A de Algoritmos em 2026.2
- **THEN** essa turma passa a constar entre as turmas de Ana, com histórico vazio e progresso e XP iguais a zero

#### Scenario: Pessoa sem função Aluno
- **WHEN** o Administrador tenta matricular uma pessoa inativa ou sem função Aluno
- **THEN** o sistema rejeita a matrícula e informa a condição impeditiva

#### Scenario: Aluno tenta matricular a si próprio
- **WHEN** um Aluno sem função Administrador nem permissão de coordenação para a turma tenta criar sua matrícula
- **THEN** o sistema nega a operação e não cria vínculo nem progresso

#### Scenario: Matrícula realizada pelo coordenador
- **GIVEN** Carla coordenadora de Direito e Ana ativa com função Aluno
- **WHEN** Carla matricula Ana na turma A de Direito Civil
- **THEN** a matrícula é criada com histórico vazio, progresso zero e XP zero nessa turma

#### Scenario: Coordenador tenta matrícula fora de seu curso
- **GIVEN** Carla coordenadora somente de Direito
- **WHEN** tenta matricular Ana em uma turma de Sistemas de Informação
- **THEN** o sistema nega a operação sem criar matrícula ou estado de estudo

### Requirement: Unicidade da matrícula
O sistema MUST manter no máximo uma matrícula por aluno e turma. Repetir uma matrícula existente SHALL informar que o aluno já está matriculado, sem criar outra matrícula nem reiniciar histórico, progresso ou gamificação. Matrículas em turmas distintas da mesma disciplina SHALL ser independentes.

#### Scenario: Matrícula duplicada preserva estudo
- **GIVEN** Ana matriculada na turma A com progresso de 50% e 30 XP
- **WHEN** o Administrador repete a matrícula de Ana nessa turma
- **THEN** continua existindo uma matrícula, com o mesmo histórico, progresso de 50% e 30 XP

#### Scenario: Matrícula em outro período
- **GIVEN** Ana matriculada em Algoritmos em 2026.2
- **WHEN** o Administrador matricula Ana em uma turma de Algoritmos em 2027.1
- **THEN** a segunda matrícula é criada e a primeira permanece inalterada

#### Scenario: Coordenador repete matrícula existente
- **GIVEN** Carla coordenadora de Direito e Ana já matriculada em Direito Civil com 50% de progresso e 30 XP
- **WHEN** Carla repete a matrícula de Ana nessa mesma turma
- **THEN** permanece uma única matrícula com histórico, progresso e XP preservados

### Requirement: Vínculos de professores às turmas
O Administrador ou Coordenador vinculado à graduação da turma SHALL vincular e desvincular pessoas ativas com função Professor a turmas existentes, sem vínculos duplicados. Um professor SHALL poder atuar em várias turmas e cada turma SHALL admitir vários professores. O vínculo SHALL identificar a turma, não apenas a graduação ou a disciplina.

#### Scenario: Professor com várias turmas
- **WHEN** o Administrador vincula Paulo às turmas A e B de Algoritmos e C de Banco de Dados
- **THEN** Paulo tem três vínculos independentes e consegue identificar disciplina e período de cada turma

#### Scenario: Vínculo repetido
- **GIVEN** Paulo vinculado à turma A
- **WHEN** o Administrador repete esse vínculo
- **THEN** permanece somente um vínculo de Paulo com a turma A

#### Scenario: Função necessária para vínculo
- **WHEN** o Administrador tenta vincular como professor uma pessoa sem função Professor
- **THEN** o sistema rejeita o vínculo sem conceder acesso à turma

#### Scenario: Coordenador atribui professor no próprio curso
- **GIVEN** Carla coordenadora de Direito e Paulo ativo com função Professor
- **WHEN** Carla vincula Paulo às turmas A e B de Direito Civil
- **THEN** Paulo recebe os dois vínculos docentes sem alteração das turmas de outras graduações

#### Scenario: Coordenador tenta remover vínculo de outro curso
- **GIVEN** Carla coordenadora apenas de Direito e Paulo professor de Algoritmos em Sistemas de Informação
- **WHEN** Carla tenta remover o vínculo de Paulo com a turma de Algoritmos
- **THEN** o sistema nega a operação e mantém o vínculo docente

### Requirement: Vínculos de coordenadores às graduações
Somente o Administrador SHALL vincular e desvincular pessoas ativas com função Coordenador a graduações existentes, sem duplicações. Um coordenador SHALL poder gerir várias graduações e uma graduação SHALL admitir vários coordenadores. O vínculo SHALL conceder gestão acadêmica restrita ao curso, mas MUST NOT conceder função Professor nem edição de conteúdo pedagógico.

#### Scenario: Coordenação de vários cursos
- **WHEN** o Administrador vincula Carla a Sistemas de Informação e Direito como Coordenadora
- **THEN** Carla pode consultar e gerir essas graduações, suas disciplinas, turmas, matrículas e vínculos docentes, sem gerir graduações não vinculadas

#### Scenario: Coordenador sem função correspondente
- **WHEN** o Administrador tenta criar vínculo de coordenação para pessoa sem função Coordenador
- **THEN** o sistema rejeita a operação sem criar vínculo

#### Scenario: Coordenador tenta atribuir coordenação
- **GIVEN** Carla coordenadora de Direito sem função Administrador
- **WHEN** Carla tenta atribuir a si ou a outra pessoa a coordenação de qualquer graduação
- **THEN** o sistema nega a operação e preserva os vínculos de coordenação existentes

### Requirement: Revogação de vínculos acadêmicos
Ao remover um vínculo de Professor ou Coordenador, o sistema MUST revogar o acesso concedido por esse vínculo na próxima consulta ou operação, mantendo os demais vínculos e os históricos dos alunos. Remover a função correspondente MUST tornar seus vínculos ineficazes, mesmo que a pessoa continue ativa com outra função.

#### Scenario: Professor perde uma de várias turmas
- **GIVEN** Paulo vinculado às turmas A e B
- **WHEN** o Administrador remove o vínculo de Paulo com A
- **THEN** Paulo perde o acesso ao painel de A, mantém acesso a B e os históricos dos alunos não são alterados

#### Scenario: Função removida com outra função mantida
- **GIVEN** Carla com funções Professor e Coordenador e respectivos vínculos
- **WHEN** o Administrador remove a função Coordenador de Carla
- **THEN** os vínculos de coordenação deixam de conceder acesso e os vínculos docentes continuam válidos

#### Scenario: Coordenador perde autorização de gestão
- **GIVEN** Carla com a coordenação de Direito removida pelo Administrador
- **WHEN** Carla tenta alterar uma turma, criar uma matrícula ou remover um vínculo docente de Direito
- **THEN** as operações são negadas e os dados existentes permanecem intactos

### Requirement: Demonstração fictícia e restauração
O protótipo SHALL oferecer dados exclusivamente fictícios, com pelo menos duas graduações, duas disciplinas por graduação, dois períodos, turmas paralelas, uma turma vazia e uma pessoa Professor e Coordenador. SHALL permitir restaurar a demonstração e informar antes da restauração ou substituição de dados locais que o histórico fictício será apagado, sem migração da estrutura anterior.

#### Scenario: Dados suficientes para validar a organização
- **WHEN** o usuário inicia a demonstração restaurada
- **THEN** encontra os exemplos acadêmicos e a pessoa com funções cumulativas, incluindo ofertas da mesma disciplina em períodos distintos

#### Scenario: Restaurar demonstração
- **GIVEN** dados fictícios alterados durante a demonstração
- **WHEN** o usuário confirma a restauração após o aviso de perda de histórico
- **THEN** o sistema recupera os dados iniciais fictícios e remove as alterações locais da demonstração
