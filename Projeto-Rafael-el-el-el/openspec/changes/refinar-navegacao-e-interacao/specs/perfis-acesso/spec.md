# Spec Delta

## ADDED Requirements

### Requirement: Etapas de entrada com orientação visual
A entrada SHALL identificar a etapa atual, a função escolhida e a próxima ação na sequência Função → Pessoa → Entrar. Cada função SHALL ter apresentação consistente e descrição curta de sua finalidade. A escolha de pessoa SHALL identificar quem entrará e em qual área; voltar às funções SHALL ficar na região padronizada de retorno. Os filtros de elegibilidade e as funções cumulativas existentes MUST ser preservados.

#### Scenario: Função e próxima ação identificáveis
- **WHEN** a pessoa abre a entrada sem sessão em 1280, 768 ou 360 px
- **THEN** reconhece a etapa Função e a finalidade de cada função disponível antes de escolhê-la, com o aviso de dados fictícios e entrada simulada visível
- **AND** ainda não há pessoas nem ação que simule autenticação com senha

#### Scenario: Pessoa escolhida na área correta
- **GIVEN** Carla ativa com funções Professor e Coordenador
- **WHEN** escolhe Coordenador
- **THEN** a etapa Pessoa identifica Coordenador e a ação de Carla informa a pessoa e a área de destino
- **AND** entrar abre a Coordenação com seus vínculos reais, sem conceder autoria de disciplinas apenas pelo papel escolhido

#### Scenario: Retorno acessível e entrada pendente
- **GIVEN** opções de pessoas da função Professor abertas
- **WHEN** a pessoa volta às funções por teclado e escolhe Aluno
- **THEN** o foco chega à etapa atual, a escolha Professor deixa de ser seleção vigente e só alunos elegíveis são oferecidos
- **AND** durante a entrada há indicação textual e impedimento de reenvio; falha mantém a função escolhida e orienta nova tentativa, sem abrir área indevida

