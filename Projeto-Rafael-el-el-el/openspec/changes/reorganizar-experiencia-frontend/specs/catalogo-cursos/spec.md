# Spec Delta

## MODIFIED Requirements

### Requirement: Minhas turmas
O sistema SHALL listar ao Aluno apenas suas turmas matriculadas, identificando graduação, disciplina, código, período e progresso próprio. Ofertas da mesma disciplina MUST aparecer separadamente, sem fundir progresso. Turmas com conteúdo em rascunho SHALL constar como conteúdo indisponível, sem ação de estudo ou exposição de materiais e questões. Para conteúdo disponível, cada turma SHALL destacar uma ação principal: Ver trilha se concluída; Começar trilha se não concluída e sem respostas válidas; Continuar trilha se não concluída e com respostas válidas, mesmo com progresso de 0%. As três ações SHALL abrir a trilha daquela matrícula sem registrar resposta. Desempenho SHALL permanecer acessível como ação secundária. O cartão SHALL distinguir por texto Sem atividade de Em andamento; carregar ou falhar ao consultar indicadores MUST NOT ser interpretado como ausência de respostas.

#### Scenario: Mesma disciplina em períodos distintos
- **GIVEN** Ana matriculada em Algoritmos em 2026.2 com 50% e em 2027.1 com 0%
- **WHEN** abre Minhas turmas
- **THEN** vê duas ofertas com os respectivos períodos e progressos de 50% e 0%

#### Scenario: Matrícula anterior à publicação
- **GIVEN** Ana matriculada em uma turma cuja disciplina está em rascunho
- **WHEN** abre Minhas turmas ou tenta iniciar a trilha por endereço direto
- **THEN** a turma é identificada como conteúdo indisponível e o estudo é impedido

#### Scenario: Aluno sem matrículas
- **WHEN** um Aluno sem matrículas abre Minhas turmas
- **THEN** o sistema informa que não há turmas vinculadas, sem apresentar turmas de outros alunos

#### Scenario: Começar uma trilha sem respostas
- **GIVEN** Diego matriculado em turma com conteúdo publicado, sem respostas válidas e progresso de 0%
- **WHEN** abre Minhas turmas
- **THEN** o cartão identifica Sem atividade, exibe 0%, destaca Começar trilha e oferece Desempenho como ação secundária
- **AND** Começar trilha abre a trilha correta sem diagnóstico ou criação de matrícula

#### Scenario: Continuar mesmo com progresso zero
- **GIVEN** um Aluno com respostas válidas na turma, nenhum tópico dominado e progresso de 0%
- **WHEN** abre Minhas turmas
- **THEN** o cartão identifica Em andamento, mantém 0% e destaca Continuar trilha, sem marcar Sem atividade

#### Scenario: Consultar trilha concluída
- **GIVEN** Elisa com todos os tópicos dominados na turma atual
- **WHEN** abre Minhas turmas
- **THEN** o cartão identifica Trilha concluída, mostra 100%, destaca Ver trilha e mantém Desempenho secundário
- **AND** Ver trilha não inicia uma nova atividade nem reinicia o progresso

#### Scenario: Indicadores ainda indisponíveis
- **WHEN** a lista de matrículas foi carregada, mas os indicadores da turma estão carregando ou falharam
- **THEN** o sistema mostra carregamento ou erro e não afirma Sem atividade, 0% ou Começar trilha por falta de dados

#### Scenario: Identificar a oferta antes de continuar
- **GIVEN** duas turmas da mesma disciplina com códigos ou períodos diferentes
- **WHEN** o Aluno aciona a ação principal ou Desempenho em um dos cartões
- **THEN** o destino corresponde à matrícula daquele cartão, com seus dados e progresso preservados
