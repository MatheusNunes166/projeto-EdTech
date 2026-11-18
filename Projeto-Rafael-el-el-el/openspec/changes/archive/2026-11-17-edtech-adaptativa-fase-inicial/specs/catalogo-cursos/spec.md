# Spec Delta

## Purpose

Permite que alunos descubram cursos publicados, vejam seus detalhes, se matriculem e acessem rapidamente os cursos em que estão matriculados.

## ADDED Requirements

### Requirement: Catálogo de cursos publicados
O sistema SHALL listar para o Aluno todos os cursos com status "publicado", exibindo título, descrição curta, área, nível e número de tópicos. Cursos em rascunho MUST NOT aparecer no catálogo.

#### Scenario: Aluno abre o catálogo
- **WHEN** o Aluno acessa o catálogo
- **THEN** o sistema exibe apenas os cursos publicados com suas informações resumidas

### Requirement: Busca e filtro no catálogo
O sistema SHALL permitir buscar cursos por texto no título e filtrar por área e nível.

#### Scenario: Filtrar por área
- **WHEN** o Aluno filtra o catálogo pela área "Matemática"
- **THEN** somente cursos dessa área são exibidos

#### Scenario: Busca sem resultados
- **WHEN** o Aluno busca um termo que não corresponde a nenhum curso
- **THEN** o sistema exibe uma mensagem de que nenhum curso foi encontrado

### Requirement: Detalhe do curso
O sistema SHALL exibir a página de detalhe do curso com descrição completa, professor responsável e a lista ordenada de tópicos.

#### Scenario: Ver detalhe
- **WHEN** o Aluno seleciona um curso no catálogo
- **THEN** o sistema exibe o detalhe do curso e a ação de matrícula, ou "Continuar" se já estiver matriculado

### Requirement: Matrícula em curso
O Aluno SHALL poder se matricular em um curso publicado. A matrícula MUST criar uma trilha adaptativa nova e independente para aquele aluno naquele curso.

#### Scenario: Matrícula bem-sucedida
- **WHEN** o Aluno aciona "Matricular" em um curso em que não está matriculado
- **THEN** o curso passa a aparecer em "Meus cursos" com progresso 0% e o primeiro tópico desbloqueado

#### Scenario: Matrícula duplicada
- **WHEN** o Aluno já matriculado abre o detalhe do mesmo curso
- **THEN** o sistema não oferece nova matrícula e exibe a ação "Continuar"

### Requirement: Meus cursos
O sistema SHALL exibir ao Aluno a lista dos cursos em que está matriculado, com o progresso de cada um.

#### Scenario: Aluno com cursos matriculados
- **WHEN** o Aluno abre "Meus cursos"
- **THEN** cada curso aparece com sua porcentagem de progresso e acesso direto à trilha
