# Spec Delta

## Purpose

Define os perfis de usuário da plataforma (Aluno, Professor, Administrador, Responsável), como cada um entra no sistema e quais áreas e ações cada perfil pode acessar.

## ADDED Requirements

### Requirement: Perfis de usuário suportados
O sistema SHALL suportar exatamente quatro perfis: Aluno, Professor, Administrador e Responsável. Cada usuário MUST ter um único perfil.

#### Scenario: Usuário com perfil definido
- **WHEN** um usuário entra no sistema
- **THEN** o sistema identifica seu perfil e exibe a área inicial correspondente a esse perfil

### Requirement: Entrada simulada no protótipo
No protótipo, o sistema SHALL permitir entrar escolhendo um usuário de demonstração de qualquer perfil, sem senha, e SHALL permitir sair e trocar de usuário a qualquer momento.

#### Scenario: Entrar como usuário de demonstração
- **WHEN** a pessoa escolhe o usuário de demonstração "Aluno" na tela de entrada
- **THEN** o sistema abre a área inicial do aluno com os dados fictícios desse usuário

#### Scenario: Trocar de usuário
- **WHEN** o usuário aciona "Sair"
- **THEN** o sistema volta à tela de entrada e nenhuma área restrita fica acessível até nova escolha

### Requirement: Acesso restrito por perfil
O sistema MUST exibir apenas as áreas e ações permitidas ao perfil do usuário atual.

#### Scenario: Aluno tenta acessar área do professor
- **WHEN** um usuário com perfil Aluno navega diretamente para o endereço de uma área de Professor
- **THEN** o sistema não exibe a área e redireciona para a área inicial do aluno

### Requirement: Administração de usuários
O Administrador SHALL poder listar, criar, editar e desativar usuários de qualquer perfil. Usuários desativados MUST NOT conseguir entrar.

#### Scenario: Desativar usuário
- **WHEN** o Administrador desativa um Professor
- **THEN** esse Professor deixa de aparecer como opção de entrada e é marcado como inativo na lista

### Requirement: Vínculos entre usuários
O Administrador SHALL poder vincular um Responsável a um ou mais Alunos e um Professor a um ou mais Cursos. Um Responsável MUST ver dados apenas dos alunos vinculados a ele.

#### Scenario: Responsável vê somente alunos vinculados
- **GIVEN** um Responsável vinculado apenas ao aluno "Ana"
- **WHEN** ele abre sua área inicial
- **THEN** o sistema exibe somente os dados de "Ana"
