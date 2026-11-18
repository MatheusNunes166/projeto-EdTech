# Spec Delta

## ADDED Requirements

### Requirement: Indicadores identificados e comparáveis na oferta
Painéis SHALL associar cada indicador ao aluno ou turma, com rótulo, unidade e explicação acessível do seu significado. Dados comparáveis SHALL usar posições e escala visual consistentes, sem barras reduzidas ao comprimento do número. Coordenação SHALL manter médias por turma e Responsável SHALL manter aluno e oferta identificáveis, inclusive no detalhe expandido. Apresentação MUST NOT mudar fórmulas, precisão, escopos ou conteúdo histórico.

#### Scenario: Lista docente com escala comparável
- **GIVEN** turma com Ana em andamento, Elisa concluída e Diego sem atividade
- **WHEN** o Professor consulta a lista em 1280 ou 768 px
- **THEN** compara progresso, taxa, situação e atividade nas mesmas colunas, com barras de largura comum e rótulos inequívocos
- **AND** em 360 px cada linha vira pares rótulo–valor da mesma matrícula, mantendo acesso ao detalhe autorizado sem expor outra turma

#### Scenario: Médias da coordenação mantêm significado e precisão
- **GIVEN** turma A com progressos exatos de 80% e 0% e turma B com 100%
- **WHEN** a Coordenação consulta A e expande o domínio por tópico
- **THEN** vê 40% em Progresso médio de A, os títulos dos tópicos com seus próprios domínios médios e a explicação de que todos os matriculados compõem as médias, inclusive quem não iniciou
- **AND** B não altera soma ou divisor; valores exatos permanecem no cálculo e somente a exibição é arredondada, sem média global

#### Scenario: Responsável compreende aluno oferta e indicadores
- **GIVEN** Responsável vinculado a dois alunos e com ofertas da mesma disciplina em períodos distintos
- **WHEN** lê o painel e abre os detalhes de uma oferta
- **THEN** identifica aluno, graduação, disciplina, turma e período sem ambiguidade e encontra explicações de Progresso como tópicos dominados, Sequência como dias consecutivos com resposta naquela turma e Última atividade como data de resposta válida
- **AND** não encontra questões, respostas detalhadas, colegas ou indicadores somados entre ofertas

#### Scenario: Zero sem atividade e Sem dados
- **WHEN** uma matrícula tem 0% com respostas ou sem respostas, ou uma turma não tem matriculados
- **THEN** a apresentação diferencia Em andamento/atividade existente de Sem atividade na matrícula e apresenta Sem dados nas médias da turma vazia
- **AND** carregamento e falha não são convertidos em zero nem em ausência de atividade

#### Scenario: Histórico expandido preserva a origem
- **GIVEN** resposta antiga de aluno autorizado cujo texto atual da questão foi corrigido
- **WHEN** o Professor abre a resposta e retorna ao painel da turma
- **THEN** lê o snapshot original e a oferta identificada, reencontra a turma e sua seleção válida e nenhuma consulta altera histórico, resultados, XP ou datas

