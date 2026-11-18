# Spec Delta

## Purpose

Mantém o aluno engajado com pontos de experiência, sequência de dias de estudo e conquistas, contabilizados separadamente em cada curso.

## ADDED Requirements

### Requirement: XP por curso
O sistema SHALL conceder XP ao Aluno por questão respondida corretamente, com valores de 10, 20 e 30 para Fácil, Médio e Difícil. O XP MUST ser contabilizado por curso.

#### Scenario: Acerto em questão difícil
- **WHEN** o Aluno acerta uma questão "Difícil" no curso "Matemática Básica"
- **THEN** o XP desse curso aumenta em 30 e o XP de outros cursos não muda

### Requirement: Sequência de dias de estudo
O sistema SHALL contar a sequência de dias consecutivos em que o Aluno respondeu ao menos uma questão no curso. Um dia sem atividade no curso MUST zerar a sequência desse curso.

#### Scenario: Sequência mantida
- **GIVEN** o Aluno tem sequência de 3 dias no curso
- **WHEN** ele responde uma questão no dia seguinte
- **THEN** a sequência do curso passa a 4 dias

#### Scenario: Sequência interrompida
- **GIVEN** o Aluno tem sequência de 3 dias no curso
- **WHEN** ele passa um dia inteiro sem responder questões nesse curso
- **THEN** a sequência do curso volta a 0

### Requirement: Conquistas
O sistema SHALL conceder conquistas por curso ao atingir marcos: primeira questão respondida, primeiro tópico dominado, sequência de 7 dias e curso concluído. Cada conquista MUST ser concedida no máximo uma vez por curso.

#### Scenario: Primeiro tópico dominado
- **WHEN** o Aluno domina o primeiro tópico de um curso
- **THEN** o sistema exibe a conquista "Primeiro tópico dominado" e a registra no perfil daquele curso

### Requirement: Exibição de gamificação
O sistema SHALL exibir XP, sequência e conquistas na tela da trilha de cada curso.

#### Scenario: Ver indicadores do curso
- **WHEN** o Aluno abre a trilha de um curso
- **THEN** o XP, a sequência de dias e as conquistas daquele curso ficam visíveis
