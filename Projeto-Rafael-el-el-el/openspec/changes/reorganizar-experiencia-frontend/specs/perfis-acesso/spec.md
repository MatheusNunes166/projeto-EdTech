# Spec Delta

## MODIFIED Requirements

### Requirement: Entrada simulada no protótipo
No protótipo, o sistema SHALL permitir entrar escolhendo uma pessoa ativa de demonstração, sem senha, e SHALL permitir sair e trocar de pessoa a qualquer momento. A entrada SHALL exibir apenas áreas permitidas às funções dessa pessoa. Sair MUST impedir consultas e operações restritas até uma nova entrada. Antes das pessoas, SHALL mostrar as funções disponíveis entre pessoas ativas. Após escolher uma função, SHALL listar somente pessoas ativas que a possuem e abrir a área dessa função após a entrada, inclusive para pessoas com funções cumulativas. SHALL permitir voltar à escolha de função sem iniciar sessão e trocar entre áreas autorizadas da mesma conta sem nova entrada. Escolher uma função MUST NOT conceder ou remover funções, vínculos ou permissões.

#### Scenario: Entrar como usuário de demonstração
- **WHEN** a pessoa escolhe Aluno e seleciona Ana, ativa e com função Aluno, na tela de entrada
- **THEN** o sistema abre sua área com os dados fictícios e as turmas de Ana

#### Scenario: Trocar de usuário
- **WHEN** o usuário aciona Sair e tenta retornar a uma página restrita
- **THEN** o sistema solicita nova entrada e não exibe os dados da pessoa anterior

#### Scenario: Funções antes de pessoas
- **WHEN** uma pessoa sem sessão abre a entrada
- **THEN** vê primeiro as funções disponíveis entre as pessoas ativas, sem a lista de pessoas
- **AND** a entrada informa que a escolha é simulada, com dados fictícios e sem senha

#### Scenario: Somente pessoas da função escolhida
- **GIVEN** Ana ativa com função Aluno, Marcos ativo com função Professor e Paulo inativo com função Professor
- **WHEN** a pessoa escolhe Professor
- **THEN** a lista inclui Marcos, exclui Ana e Paulo e apresenta apenas identificação e funções, sem e-mail ou vínculos acadêmicos

#### Scenario: Função sem pessoa ativa
- **GIVEN** nenhuma pessoa ativa possui a função Responsável
- **WHEN** a entrada mostra as funções disponíveis
- **THEN** Responsável não é oferecida como escolha disponível

#### Scenario: Voltar e escolher outra função
- **GIVEN** a pessoa escolheu Professor e está vendo seus candidatos
- **WHEN** volta à seleção de funções e escolhe Aluno
- **THEN** vê somente pessoas ativas com função Aluno, sem iniciar sessão com uma pessoa da seleção anterior

#### Scenario: Pessoa cumulativa entra na área escolhida
- **GIVEN** Carla ativa com funções Professor e Coordenador
- **WHEN** escolhe Coordenador e depois Carla
- **THEN** entra diretamente na Área da Coordenação e pode acessar a Área do Professor sem sair ou escolher outra conta
- **AND** a coordenação continua limitada às graduações vinculadas e a docência às turmas vinculadas

#### Scenario: Pessoa deixa de ser elegível antes da entrada
- **GIVEN** uma pessoa foi listada e depois desativada ou perdeu a função escolhida
- **WHEN** a entrada é solicitada com a seleção anterior
- **THEN** o sistema informa a indisponibilidade, atualiza as opções e não abre a área indevida nem exibe seus dados
