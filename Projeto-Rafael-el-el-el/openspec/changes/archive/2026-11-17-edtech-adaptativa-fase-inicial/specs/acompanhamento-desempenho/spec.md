# Spec Delta

## Purpose

Oferece painéis de progresso e desempenho adequados a cada perfil: o aluno vê sua própria evolução, o professor acompanha a turma de seus cursos e o responsável acompanha os alunos vinculados.

## ADDED Requirements

### Requirement: Painel do aluno
O sistema SHALL exibir ao Aluno, para cada curso matriculado, o progresso, o domínio por tópico, a taxa de acertos e o XP.

#### Scenario: Aluno consulta seu desempenho
- **WHEN** o Aluno abre o painel de desempenho de um curso
- **THEN** o sistema mostra o progresso, o domínio de cada tópico, a taxa de acertos e o XP daquele curso

### Requirement: Painel do professor por curso
O sistema SHALL exibir ao Professor, para cada curso vinculado, a lista de alunos matriculados com progresso e taxa de acertos, e o domínio médio da turma por tópico.

#### Scenario: Professor vê turma
- **WHEN** o Professor abre o painel de um curso seu
- **THEN** o sistema lista os alunos com progresso e taxa de acertos, e o domínio médio por tópico

### Requirement: Alunos com dificuldade
O painel do Professor SHALL destacar alunos com taxa de acertos abaixo de 50% nas últimas 10 respostas do curso.

#### Scenario: Aluno destacado
- **GIVEN** um aluno acertou 3 das últimas 10 questões do curso
- **WHEN** o Professor abre o painel do curso
- **THEN** esse aluno aparece destacado como "precisa de atenção"

### Requirement: Detalhe de aluno para o professor
O Professor SHALL poder abrir o detalhe de um aluno matriculado em seu curso, vendo domínio por tópico e histórico recente de respostas naquele curso.

#### Scenario: Ver detalhe do aluno
- **WHEN** o Professor seleciona um aluno no painel do curso
- **THEN** o sistema exibe o domínio por tópico e as respostas recentes do aluno nesse curso

### Requirement: Painel do responsável
O sistema SHALL exibir ao Responsável, para cada aluno vinculado, os cursos matriculados com progresso, sequência de dias e última atividade.

#### Scenario: Responsável acompanha aluno
- **WHEN** o Responsável abre seu painel
- **THEN** cada aluno vinculado aparece com seus cursos, progresso, sequência e data da última atividade

### Requirement: Visão geral do administrador
O sistema SHALL exibir ao Administrador totais de usuários por perfil, cursos por status e matrículas.

#### Scenario: Administrador consulta visão geral
- **WHEN** o Administrador abre seu painel inicial
- **THEN** o sistema exibe os totais de usuários por perfil, de cursos por status e de matrículas
