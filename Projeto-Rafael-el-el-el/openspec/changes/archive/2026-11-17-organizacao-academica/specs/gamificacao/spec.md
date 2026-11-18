# Spec Delta

## Purpose

Mantém o engajamento com XP, sequência de dias e conquistas básicas, contabilizados exclusivamente para cada aluno em cada turma de uma disciplina.

## ADDED Requirements

### Requirement: Gamificação independente por aluno e turma
O sistema MUST manter XP, sequência de dias e conquistas separados por Aluno–Turma. Novas matrículas SHALL começar com zero XP, sequência zero e nenhuma conquista. Atividades em outras turmas, inclusive da mesma disciplina em outro período, ou de outros alunos MUST NOT alterar esses indicadores.

#### Scenario: Independência entre períodos
- **GIVEN** Ana com 100 XP, sequência de 3 dias e uma conquista em Algoritmos de 2026.2
- **WHEN** é matriculada em Algoritmos de 2027.1
- **THEN** a nova turma começa com zero XP, sequência zero e nenhuma conquista, e os indicadores de 2026.2 permanecem inalterados

#### Scenario: Independência entre alunos
- **WHEN** Ana recebe XP ou conquista em uma turma compartilhada com Bruno
- **THEN** os indicadores de Bruno permanecem inalterados

### Requirement: XP por turma
O sistema SHALL conceder ao Aluno 10, 20 ou 30 XP por resposta correta de dificuldade Fácil, Médio ou Difícil, respectivamente, na turma em que respondeu. Resposta errada SHALL conceder zero XP. O total exibido SHALL corresponder ao histórico válido de respostas daquele aluno naquela turma.

#### Scenario: Acerto em questão difícil
- **GIVEN** Ana com 20 XP na turma A e 40 XP na turma B
- **WHEN** acerta uma questão Difícil na turma A
- **THEN** o total de A passa a 50 XP e o de B permanece em 40 XP

#### Scenario: Erro não concede XP
- **GIVEN** Ana com 20 XP na turma A
- **WHEN** erra uma questão nessa turma
- **THEN** seu total permanece em 20 XP

### Requirement: Preservação da gamificação em edições de conteúdo
Edições permitidas e tentativas rejeitadas de conteúdo MUST preservar XP, conquistas e suas datas originais em todas as combinações Aluno–Turma. Edições MUST NOT conceder novamente ou revogar conquistas, alterar XP de respostas anteriores nem contar como estudo. A sequência SHALL continuar dependente somente de respostas válidas e da data da demonstração, sem reinício ou incremento provocado pela edição.

#### Scenario: Material corrigido para aluno em andamento
- **GIVEN** Ana em andamento em A, com 150 XP, sequência de 3 dias e conquista Primeiro tópico dominado obtida em 10/11/2026
- **WHEN** um autor corrige um link de material sem mudar a data da demonstração ou registrar respostas
- **THEN** Ana mantém 150 XP, sequência de 3 dias e a mesma conquista com data de 10/11/2026

#### Scenario: Conquista de conclusão preservada entre turmas
- **GIVEN** Ana em andamento em A e Bruno com trilha concluída em B da mesma disciplina, com 200 XP e conquista Trilha concluída de 12/11/2026
- **WHEN** o Professor ajusta um material ou tenta adicionar um tópico, sendo a adição rejeitada
- **THEN** ambos mantêm XP e conquistas anteriores, e Bruno mantém uma única conquista de conclusão com data de 12/11/2026

#### Scenario: Edição de questão respondida não recalcula XP
- **GIVEN** Ana com 30 XP por acerto em questão Difícil na turma A e Bruno com respostas à mesma questão em B
- **WHEN** o autor tenta mudar a dificuldade da questão e a alteração é rejeitada
- **THEN** os XP, as conquistas e suas datas de Ana e Bruno permanecem inalterados em suas respectivas turmas

## MODIFIED Requirements

### Requirement: Sequência de dias de estudo
O sistema SHALL contar dias consecutivos com ao menos uma resposta válida do Aluno na turma, usando a data da demonstração. Várias respostas no mesmo dia SHALL contar um único dia. Um dia inteiro sem resposta nessa turma MUST zerar a sequência; antes de o dia atual terminar, uma sequência encerrada ontem SHALL permanecer visível.

#### Scenario: Sequência mantida
- **GIVEN** Ana com sequência de 3 dias na turma A
- **WHEN** responde uma questão nessa turma no dia seguinte
- **THEN** a sequência passa a 4 dias

#### Scenario: Várias respostas no mesmo dia
- **GIVEN** Ana com sequência de 4 dias incluindo o dia atual
- **WHEN** responde mais duas questões na mesma turma nesse dia
- **THEN** a sequência permanece em 4 dias

#### Scenario: Sequência interrompida apesar de estudo em outra turma
- **GIVEN** Ana com sequência de 3 dias em A e respostas somente em B no dia seguinte
- **WHEN** esse dia termina e a demonstração avança para o próximo dia
- **THEN** a sequência em A é zero, independentemente do estudo em B

#### Scenario: Sequência interrompida
- **GIVEN** o Aluno tem sequência de 3 dias na turma
- **WHEN** ele passa um dia inteiro sem responder questões nessa turma
- **THEN** a sequência da turma volta a 0

### Requirement: Conquistas
O sistema SHALL conceder conquistas por Aluno–Turma para primeira questão respondida, primeiro tópico dominado, sequência de 7 dias e trilha concluída. Cada conquista MUST ser concedida no máximo uma vez nessa combinação, com data de obtenção; marcos de outra turma MUST NOT ser utilizados.

#### Scenario: Primeiro tópico dominado
- **WHEN** Ana domina pela primeira vez um tópico na turma A
- **THEN** o sistema registra e exibe a conquista Primeiro tópico dominado apenas para Ana em A

#### Scenario: Conquista não é duplicada
- **GIVEN** Ana com a conquista Primeiro tópico dominado na turma A
- **WHEN** domina outro tópico nessa turma
- **THEN** a mesma conquista permanece registrada uma única vez, com a data original

#### Scenario: Primeira questão mesmo com erro
- **WHEN** Ana responde incorretamente sua primeira questão válida na turma A
- **THEN** recebe a conquista Primeira questão, sem receber XP pelo erro

#### Scenario: Sequência e conclusão
- **WHEN** Ana atinge sete dias consecutivos de estudo e depois conclui todos os tópicos de sua turma
- **THEN** recebe as conquistas Sequência de 7 dias e Trilha concluída nessa turma, cada uma com sua data de obtenção

### Requirement: Exibição de gamificação
O sistema SHALL exibir XP, sequência e conquistas na trilha da turma atual, identificando disciplina, código da turma e período. Os números MUST corresponder apenas ao Aluno dessa trilha, sem apresentar total combinado de ofertas como se fosse progresso de uma turma.

#### Scenario: Alternar entre ofertas
- **GIVEN** Ana com 100 XP em Algoritmos de 2026.2 e zero XP em 2027.1
- **WHEN** alterna a visualização das duas trilhas
- **THEN** cada uma mostra seu próprio XP, sequência e conquistas com identificação do período

#### Scenario: Ver indicadores do curso
- **WHEN** o Aluno abre a trilha de uma turma
- **THEN** o XP, a sequência de dias e as conquistas daquela turma ficam visíveis, com identificação da disciplina, do código da turma e do período

## REMOVED Requirements

### Requirement: XP por curso
**Reason**: A unidade de estudo passou de curso para a matrícula (aluno + turma de uma disciplina). O XP passa a ser contabilizado por aluno e turma.
**Migration**: Use o requisito "XP por turma".
