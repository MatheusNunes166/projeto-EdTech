# perfis-acesso Specification

## Purpose
Define funções cumulativas, entrada simulada e permissões dependentes de vínculos, preservando a separação dos dados acadêmicos de cada pessoa e oferta.

## Requirements

### Requirement: Entrada simulada no protótipo
No protótipo, o sistema SHALL permitir entrar escolhendo uma pessoa ativa de demonstração, sem senha, e SHALL permitir sair e trocar de pessoa a qualquer momento. A entrada SHALL exibir apenas áreas permitidas às funções dessa pessoa. Sair MUST impedir consultas e operações restritas até uma nova entrada.

#### Scenario: Entrar como usuário de demonstração
- **WHEN** a pessoa seleciona Ana, ativa e com função Aluno, na tela de entrada
- **THEN** o sistema abre sua área com os dados fictícios e as turmas de Ana

#### Scenario: Trocar de usuário
- **WHEN** o usuário aciona Sair e tenta retornar a uma página restrita
- **THEN** o sistema solicita nova entrada e não exibe os dados da pessoa anterior

### Requirement: Administração de usuários
O Administrador SHALL poder listar, criar, editar e desativar pessoas e suas funções. Pessoas desativadas MUST NOT conseguir entrar nem continuar consultando ou alterando dados restritos. A verificação SHALL ocorrer também na próxima operação de uma sessão já aberta, preservando os históricos existentes.

#### Scenario: Desativar professor
- **WHEN** o Administrador desativa Paulo
- **THEN** Paulo deixa de ser opção de entrada, aparece como inativo na administração e seu histórico não é apagado

#### Scenario: Desativação durante sessão
- **GIVEN** Paulo com sessão de demonstração aberta
- **WHEN** Paulo tenta consultar uma turma depois de ter sido desativado
- **THEN** o sistema nega o acesso e solicita nova entrada

#### Scenario: Desativar usuário
- **WHEN** o Administrador desativa uma pessoa com a função Professor
- **THEN** ela deixa de aparecer como opção de entrada e é marcada como inativa na lista, preservando vínculos e histórico

### Requirement: Funções de usuário suportadas
O sistema SHALL suportar as funções Aluno, Professor, Coordenador, Administrador e Responsável. Cada pessoa ativa MUST ter uma ou mais funções e uma identidade única na demonstração. A mesma pessoa SHALL poder exercer simultaneamente Professor e Coordenador, com acesso às áreas autorizadas de ambas as funções.

#### Scenario: Pessoa com duas funções
- **GIVEN** Carla com funções Professor e Coordenador na mesma conta
- **WHEN** Carla entra na demonstração
- **THEN** o sistema oferece as áreas de docência e coordenação sem exigir outra conta

#### Scenario: Usuário sem função
- **WHEN** o Administrador tenta salvar uma pessoa ativa sem nenhuma função
- **THEN** o sistema rejeita a alteração e solicita ao menos uma função

### Requirement: Acesso restrito por função e vínculo
O sistema MUST autorizar cada consulta e alteração pela função e pelo vínculo aplicável ao recurso solicitado, inclusive por endereço direto. Uma tentativa não autorizada MUST NOT exibir dados restritos nem alterar dados, e SHALL informar acesso negado ou redirecionar a uma área permitida. Ocultar uma ação MUST NOT ser a única restrição.

#### Scenario: Aluno tenta acessar área do professor
- **WHEN** Ana, somente Aluno, navega diretamente para uma área de Professor
- **THEN** o sistema não exibe os dados e a redireciona à área do aluno

#### Scenario: Professor tenta acessar turma não vinculada
- **GIVEN** Paulo com vínculo apenas na turma A de Algoritmos
- **WHEN** Paulo acessa diretamente o painel ou o histórico de aluno da turma B de Algoritmos
- **THEN** o sistema nega o acesso mesmo sendo a mesma disciplina

#### Scenario: Aluno tenta registrar resposta por outro aluno
- **WHEN** Ana tenta registrar uma resposta atribuída a Bruno ou a uma turma em que Ana não está matriculada
- **THEN** o sistema rejeita a operação sem alterar históricos, progresso ou XP

### Requirement: Permissões cumulativas sem ampliação de vínculos
O sistema SHALL conceder a união das permissões válidas de cada função da pessoa. Um vínculo de coordenação MUST NOT conceder permissão docente; um vínculo docente MUST NOT conceder coordenação. O sistema MUST verificar a combinação função–vínculo que autoriza cada operação, independentemente da área em que a pessoa está navegando.

#### Scenario: Professor e coordenador em cursos diferentes
- **GIVEN** Carla professora apenas da turma A de Algoritmos em Sistemas de Informação e coordenadora apenas de Direito
- **WHEN** Carla consulta Direito e edita conteúdo de Algoritmos
- **THEN** as duas ações são permitidas pelos respectivos vínculos

#### Scenario: Coordenação não autoriza edição docente
- **GIVEN** Carla com as funções Professor e Coordenador, coordenadora de Direito, sem vínculo docente em suas disciplinas
- **WHEN** Carla tenta editar ou publicar conteúdo de uma disciplina de Direito
- **THEN** o sistema nega a edição pedagógica, mantendo a consulta e a gestão acadêmica de Direito

#### Scenario: Docência não autoriza consulta de outras turmas
- **GIVEN** Carla professora da turma A de Sistemas de Informação e coordenadora somente de Direito
- **WHEN** Carla tenta consultar o desempenho da turma B de Sistemas de Informação
- **THEN** o sistema nega o acesso por ausência de vínculo docente com B ou de coordenação com essa graduação

### Requirement: Escopo de gestão da coordenação
O Coordenador SHALL consultar os painéis básicos e editar dados das graduações vinculadas, criar e editar suas disciplinas e turmas, matricular alunos e gerenciar vínculos docentes. A permissão MUST ser verificada pelo curso de cada recurso, inclusive por endereço direto. Sem graduação vinculada, a área SHALL apresentar estado vazio e MUST NOT exibir dados ou permitir gestão de outras graduações.

#### Scenario: Coordenador gerencia vínculo em seu curso
- **WHEN** uma pessoa somente Coordenador tenta matricular um aluno ou atribuir um professor em curso que coordena
- **THEN** o sistema permite a operação para pessoas ativas com a função correspondente, sem exigir função Administrador

#### Scenario: Coordenador gerencia estrutura de seu curso
- **GIVEN** Carla coordenadora de Direito
- **WHEN** Carla edita a descrição de Direito e cria uma disciplina e uma turma em período existente
- **THEN** as operações são permitidas dentro de Direito e não concedem acesso de gestão a outros cursos

#### Scenario: Acesso direto a gestão de outro curso
- **GIVEN** Carla coordenadora apenas de Direito
- **WHEN** tenta alterar uma turma, matrícula ou vínculo docente de Sistemas de Informação por endereço direto
- **THEN** o sistema nega a operação sem expor dados restritos nem alterar registros

#### Scenario: Coordenador sem graduação
- **WHEN** um Coordenador sem vínculos abre sua área
- **THEN** o sistema informa que não há graduações vinculadas e não mostra painéis institucionais gerais

### Requirement: Administração estrutural e de conteúdo
O Administrador SHALL poder manter a organização acadêmica, usuários, matrículas e vínculos e consultar seus painéis básicos. SHALL também manter e publicar conteúdo de qualquer disciplina, respeitando as mesmas validações de conteúdo exigidas dos professores. As demais funções MUST NOT receber essas permissões administrativas implicitamente.

#### Scenario: Administrador publica conteúdo válido
- **GIVEN** uma disciplina cujo conteúdo atende aos critérios de publicação
- **WHEN** o Administrador solicita sua publicação sem possuir vínculo docente
- **THEN** o sistema permite a publicação

#### Scenario: Professor tenta criar graduação
- **WHEN** um Professor sem função Administrador tenta cadastrar uma graduação
- **THEN** o sistema nega a operação sem criar graduação

### Requirement: Limites globais da gestão de coordenação
Criar graduações, manter períodos letivos globais, administrar usuários e funções, atribuir coordenadores a graduações e gerenciar vínculos Responsável–Aluno SHALL permanecer exclusivos do Administrador. A função Coordenador MUST NOT conceder essas permissões, edição de conteúdo pedagógico ou alteração direta de respostas, progresso e gamificação.

#### Scenario: Coordenador tenta alterar período global
- **GIVEN** Carla coordenadora de Direito sem função Administrador
- **WHEN** tenta criar um período letivo ou alterar as datas de um período existente
- **THEN** o sistema nega a operação e preserva as datas utilizadas por todas as graduações

#### Scenario: Coordenador tenta conceder função a si próprio
- **GIVEN** Carla somente Coordenador
- **WHEN** tenta atribuir a si a função Professor ou Administrador
- **THEN** o sistema rejeita a alteração e mantém suas funções originais

#### Scenario: Coordenação não altera resultados de estudo
- **GIVEN** Carla coordenadora de Direito e Ana com respostas e XP em uma turma desse curso
- **WHEN** Carla tenta editar diretamente uma resposta, domínio ou XP de Ana
- **THEN** o sistema nega a operação e preserva o histórico e seus indicadores

### Requirement: Vínculos entre responsável e alunos
O Administrador SHALL poder vincular e desvincular um Responsável ativo a um ou mais Alunos, sem duplicações. O Responsável SHALL consultar somente o painel básico dos alunos vinculados, por disciplina e turma. Esse vínculo MUST NOT conceder acesso ao histórico detalhado de questões, a colegas de turma ou à edição de dados acadêmicos.

#### Scenario: Responsável vê somente alunos vinculados
- **GIVEN** um Responsável vinculado apenas a Ana
- **WHEN** abre sua área ou tenta acessar diretamente o painel de Bruno
- **THEN** vê apenas o painel de Ana e o acesso ao painel de Bruno é negado

#### Scenario: Vínculo removido
- **GIVEN** um Responsável consultando o painel de Ana
- **WHEN** tenta consultá-lo novamente após o Administrador remover esse vínculo
- **THEN** o sistema nega a consulta e mantém intacto o histórico de Ana
