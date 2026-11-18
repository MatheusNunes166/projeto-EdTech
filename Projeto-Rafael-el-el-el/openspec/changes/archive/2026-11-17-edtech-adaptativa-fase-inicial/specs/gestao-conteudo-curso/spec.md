# Spec Delta

## Purpose

Permite que professores criem e mantenham cursos — tópicos em sequência, materiais de estudo e um banco de questões classificado por tópico e dificuldade que alimenta o aprendizado adaptativo.

## ADDED Requirements

### Requirement: Criação de curso
O Professor SHALL poder criar um curso informando título, descrição, área e nível. Todo curso novo MUST começar com status "rascunho".

#### Scenario: Criar curso
- **WHEN** o Professor preenche os dados obrigatórios e salva um novo curso
- **THEN** o curso aparece na lista do Professor com status "rascunho"

#### Scenario: Dados obrigatórios ausentes
- **WHEN** o Professor tenta salvar um curso sem título
- **THEN** o sistema não salva e indica o campo obrigatório

### Requirement: Tópicos ordenados
O Professor SHALL poder adicionar, editar, remover e reordenar tópicos de um curso. A ordem dos tópicos MUST definir a sequência de desbloqueio na trilha adaptativa.

#### Scenario: Reordenar tópicos
- **WHEN** o Professor move o tópico "Frações" para antes de "Decimais"
- **THEN** a lista de tópicos do curso passa a exibir "Frações" antes de "Decimais"

### Requirement: Materiais por tópico
O Professor SHALL poder anexar a cada tópico materiais de estudo do tipo texto, vídeo (link) ou arquivo (link).

#### Scenario: Adicionar material
- **WHEN** o Professor adiciona um link de vídeo ao tópico "Frações"
- **THEN** o material aparece na lista de materiais desse tópico

### Requirement: Banco de questões classificado
O Professor SHALL poder cadastrar questões de múltipla escolha vinculadas a um tópico, com uma alternativa correta, uma explicação e um nível de dificuldade: Fácil, Médio ou Difícil.

#### Scenario: Cadastrar questão
- **WHEN** o Professor cadastra uma questão no tópico "Frações" com dificuldade "Médio"
- **THEN** a questão aparece no banco desse tópico com a etiqueta "Médio"

#### Scenario: Questão sem alternativa correta
- **WHEN** o Professor tenta salvar uma questão sem marcar a alternativa correta
- **THEN** o sistema não salva e informa que é preciso marcar uma alternativa correta

### Requirement: Publicação de curso
O Professor SHALL poder publicar um curso somente se cada tópico tiver ao menos uma questão de cada nível de dificuldade.

#### Scenario: Publicação bloqueada
- **WHEN** o Professor tenta publicar um curso com um tópico sem questões de nível "Difícil"
- **THEN** o sistema não publica e lista os tópicos e níveis faltantes

#### Scenario: Publicação bem-sucedida
- **WHEN** o Professor publica um curso que atende aos critérios
- **THEN** o status muda para "publicado" e o curso passa a aparecer no catálogo

### Requirement: Escopo do professor
O Professor MUST poder editar apenas os cursos aos quais está vinculado. O Administrador SHALL poder ver e editar todos os cursos.

#### Scenario: Professor sem vínculo
- **WHEN** um Professor tenta abrir a edição de um curso ao qual não está vinculado
- **THEN** o sistema não permite a edição
