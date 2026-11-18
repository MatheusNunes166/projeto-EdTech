# Spec Delta

## MODIFIED Requirements

### Requirement: Painel do aluno
O sistema SHALL exibir ao Aluno, para cada turma matriculada, progresso, domínio por tópico, taxa de acertos e XP próprios, identificando graduação, disciplina, turma e período. Taxa de acertos SHALL ser acertos divididos por respostas válidas dessa matrícula, em porcentagem arredondada; sem respostas SHALL apresentar zero e indicar ausência de atividade. Desempenho SHALL ser acessível como ação secundária em Minhas turmas e na trilha com conteúdo disponível, mantendo retorno à mesma trilha. Com respostas válidas, o sistema MUST NOT indicar Sem atividade apenas porque progresso ou taxa de acertos são 0%.

#### Scenario: Aluno consulta seu desempenho
- **GIVEN** Ana com um de dois tópicos dominados, três acertos em quatro respostas e 50 XP na turma A
- **WHEN** abre o painel dessa turma
- **THEN** vê progresso de 50%, taxa de acertos de 75%, domínio por tópico e 50 XP com identificação da oferta

#### Scenario: Matrícula sem respostas
- **WHEN** Ana consulta o painel de uma turma na qual ainda não respondeu
- **THEN** vê progresso, domínio e XP iguais a zero e taxa zero acompanhada da indicação Sem atividade

#### Scenario: Respostas sem acertos
- **GIVEN** um Aluno com duas respostas válidas incorretas na turma e nenhum tópico dominado
- **WHEN** abre Desempenho
- **THEN** vê progresso de 0%, taxa de acertos de 0% e XP zero, com indicação de atividade existente, sem o rótulo Sem atividade

#### Scenario: Acesso secundário preserva o contexto
- **GIVEN** um Aluno matriculado em duas ofertas publicadas da mesma disciplina
- **WHEN** aciona Desempenho em um cartão de Minhas turmas ou na trilha e depois volta à trilha
- **THEN** consulta os indicadores e retorna à trilha da oferta escolhida, sem misturar períodos ou alterar o histórico

### Requirement: Painel do professor por turma
O sistema SHALL exibir ao Professor apenas suas turmas vinculadas, com disciplina e período. Em cada turma, SHALL listar matriculados com progresso e taxa de acertos e domínio médio por tópico. As médias SHALL incluir todos os matriculados daquela turma, usando zero para quem não iniciou e as regras de precisão e exibição das médias, sem misturar ofertas. A seleção de turma SHALL preceder seus indicadores e alunos. A lista SHALL associar aluno, progresso, taxa e estado textual às ações de detalhe, mantendo conteúdo pedagógico como ação distinta. Domínios médios SHALL identificar seus tópicos.

#### Scenario: Professor com várias turmas
- **GIVEN** Paulo vinculado às turmas A e B de Algoritmos e C de Banco de Dados
- **WHEN** abre sua área e seleciona B
- **THEN** identifica as três ofertas e vê em B somente seus alunos e indicadores, sem matrículas ou respostas de A ou C

#### Scenario: Média inclui alunos sem respostas
- **GIVEN** uma turma com somente Ana com domínio 80 em Vetores e Bruno sem respostas
- **WHEN** o Professor consulta o domínio médio de Vetores nessa turma
- **THEN** o sistema apresenta 40

#### Scenario: Percurso da lista docente ao aluno
- **GIVEN** Paulo professor de A e B da mesma disciplina, com Ana em ambas
- **WHEN** escolhe A, identifica Ana e abre seu detalhe
- **THEN** cada tela mantém A e seu período identificados; o retorno aponta a A e não mistura indicadores ou respostas de B

#### Scenario: Diferenciar ausência de estudo e dificuldade
- **GIVEN** dois matriculados, um sem respostas e outro classificado como Precisa de atenção pelas regras existentes
- **WHEN** o Professor consulta a lista da turma
- **THEN** encontra os estados textuais Sem atividade e Precisa de atenção junto aos respectivos alunos, sem diagnóstico ou monitoria

### Requirement: Detalhe de aluno para o professor
O Professor SHALL poder abrir o detalhe de um Aluno matriculado em turma docente vinculada, vendo domínio por tópico e histórico das últimas até 10 respostas nessa turma, com data, questão, dificuldade e resultado. Ter o mesmo aluno em outra turma MUST NOT conceder acesso ao histórico de ofertas não vinculadas. A tela SHALL identificar aluno e oferta e oferecer retorno à turma de origem. O resumo de respostas SHALL permitir consultar o conteúdo originalmente apresentado sem abrir editores ou dados de outras matrículas.

#### Scenario: Ver detalhe do aluno
- **WHEN** Paulo seleciona Ana no painel de sua turma A
- **THEN** vê o domínio por tópico e somente as últimas até 10 respostas de Ana em A

#### Scenario: Mesmo aluno em turma não vinculada
- **GIVEN** Paulo professor de A, Ana matriculada em A e B e Paulo sem vínculo com B
- **WHEN** Paulo tenta abrir o detalhe de Ana em B
- **THEN** o acesso é negado, mesmo que o detalhe de Ana em A seja permitido

#### Scenario: Ler conteúdo histórico sem reinterpretar
- **GIVEN** resposta antiga cujo enunciado foi posteriormente corrigido por revisão textual autorizada
- **WHEN** o Professor abre a resposta no detalhe do aluno
- **THEN** lê o enunciado, alternativas e explicação originalmente apresentados, com data, dificuldade e resultado originais, sem substituir pelo conteúdo atual

#### Scenario: Aluno ainda sem respostas
- **WHEN** o Professor autorizado abre o detalhe de uma matrícula sem respostas
- **THEN** identifica aluno e oferta, vê os domínios iniciais e Sem atividade em vez de histórico fictício, mantendo o retorno à turma

### Requirement: Painel do coordenador
O sistema SHALL exibir ao Coordenador suas graduações vinculadas, disciplinas e turmas por período, com matrículas e médias somente por turma. MUST NOT apresentar média global entre turmas, disciplinas ou graduações, prever evasão, comparar séries históricas ou permitir editar resultados de estudo. O Coordenador SHALL acessar a gestão acadêmica desse escopo, sem acesso a históricos detalhados de respostas por essa função. A interface SHALL permitir selecionar graduação, disciplina, período e turma dentro do escopo, mantendo as relações compatíveis. Cada resultado SHALL identificar oferta, quantidade de matriculados, progresso médio e acesso ao domínio médio nomeado por tópico. Indicadores e gestão SHALL ser seções distintas, com ligação à turma analisada e retorno ao contexto selecionado.

#### Scenario: Coordenação consulta suas ofertas
- **GIVEN** Carla coordenadora somente de Direito
- **WHEN** abre seu painel
- **THEN** vê disciplinas e turmas de Direito com seus períodos e indicadores básicos, sem dados de Sistemas de Informação

#### Scenario: Pessoa professora e coordenadora consulta painéis distintos
- **GIVEN** Carla professora de Algoritmos em Sistemas de Informação e coordenadora de Direito
- **WHEN** consulta seu painel docente e seu painel de coordenação
- **THEN** o primeiro apresenta somente suas turmas docentes e o segundo somente os cursos coordenados, mantendo os respectivos escopos

#### Scenario: Gestão acadêmica a partir do painel
- **GIVEN** Carla coordenadora somente de Direito
- **WHEN** acessa a gestão de uma turma de Direito pelo painel e atribui um professor ativo com essa função
- **THEN** o vínculo docente é salvo e a consulta reflete a atualização, mantendo as respostas e os indicadores de estudo existentes

#### Scenario: Navegação entre cursos não cria média global
- **GIVEN** Carla coordenadora de duas graduações com várias disciplinas e turmas
- **WHEN** consulta a visão de seus cursos ou filtra por disciplina ou período
- **THEN** os resultados mostram médias identificadas por turma, sem média combinada dos cursos, disciplinas ou ofertas selecionados

#### Scenario: Seleção contextualizada e acesso à gestão
- **GIVEN** Carla coordenadora de Direito com várias disciplinas e ofertas
- **WHEN** seleciona Direito, Direito Civil, 2026.2 e turma A e aciona Gerir turma
- **THEN** abre a gestão de A com contexto completo e pode retornar ao painel com a mesma oferta selecionada

#### Scenario: Mudança de seleção incompatível
- **GIVEN** seleção completa de Direito Civil em Direito
- **WHEN** a pessoa escolhe outra graduação autorizada que não contém essa disciplina
- **THEN** a disciplina e turma anteriores deixam de ser seleções válidas; nenhum indicador antigo é apresentado como pertencente à nova graduação

#### Scenario: Médias com significado e tópico identificado
- **GIVEN** turma A com progressos 80% e 0% e outra turma com progresso 100%
- **WHEN** a Coordenação consulta A e abre o detalhamento de domínio
- **THEN** vê progresso médio 40%, quantidade de matriculados e cada domínio médio junto ao nome do tópico, com indicação de que as médias incluem quem não iniciou
- **AND** a outra turma não influencia os valores e o arredondamento continua seguindo Precisão e exibição das médias

#### Scenario: Turma vazia não é busca sem resultado
- **GIVEN** A sem alunos e uma combinação de filtros que não encontra qualquer turma
- **WHEN** a Coordenação consulta A e depois essa combinação
- **THEN** A apresenta zero matrículas, Nenhum aluno matriculado e médias Sem dados; a combinação sem ofertas apresenta ausência de resultados e permite ajustar os filtros

### Requirement: Visão geral do administrador
O sistema SHALL exibir ao Administrador totais de pessoas distintas, pessoas por função, graduações, disciplinas por estado de publicação, períodos, turmas e matrículas. Uma pessoa com várias funções SHALL contar uma vez no total de pessoas e uma vez em cada função atribuída. Graduações MUST NOT ser contadas como conteúdo publicado ou rascunho. A visão SHALL apresentar primeiro resumos por categoria e acessos aos cadastros correspondentes, sem formulários de criação simultâneos nem substituir o painel do Responsável.

#### Scenario: Totais com funções cumulativas
- **GIVEN** somente Ana como Aluno e Carla como Professor e Coordenador
- **WHEN** o Administrador consulta os totais de pessoas
- **THEN** vê duas pessoas distintas, um Aluno, um Professor e um Coordenador

#### Scenario: Totais acadêmicos
- **GIVEN** duas graduações, três disciplinas publicadas, uma em rascunho, dois períodos, cinco turmas e oito matrículas
- **WHEN** o Administrador consulta a visão geral
- **THEN** o sistema apresenta exatamente esses totais nas respectivas categorias

#### Scenario: Administrador consulta visão geral
- **WHEN** o Administrador abre seu painel inicial
- **THEN** o sistema exibe os totais de pessoas distintas e por função, de graduações, de disciplinas por estado de publicação, de períodos letivos, de turmas e de matrículas

#### Scenario: Passar do resumo à tarefa administrativa
- **WHEN** o Administrador abre a visão geral e escolhe Pessoas, Graduações e disciplinas, Períodos e turmas ou Matrículas e docentes
- **THEN** acessa a respectiva lista de gestão sem abrir automaticamente um formulário de criação

#### Scenario: Separação do acompanhamento do Responsável
- **GIVEN** pessoa com funções Administrador e Responsável
- **WHEN** alterna entre Visão geral e a área do Responsável
- **THEN** a primeira mostra totais administrativos e a segunda somente alunos vinculados com indicadores por oferta, sem fundir as duas finalidades

### Requirement: Painel do responsável
O sistema SHALL exibir ao Responsável, para cada Aluno vinculado, as disciplinas e turmas matriculadas com graduação, período, progresso, sequência de dias e última atividade naquela turma. Sem respostas, SHALL indicar Sem atividade e sequência zero. A visualização MUST NOT incluir alunos não vinculados ou histórico detalhado de questões. A identidade do aluno SHALL preceder suas ofertas e permanecer associada aos indicadores. Detalhes recolhidos SHALL manter aluno, disciplina, turma, período, progresso e última atividade identificáveis no resumo.

#### Scenario: Responsável acompanha aluno
- **GIVEN** um Responsável vinculado somente a Ana, matriculada em duas ofertas de Algoritmos
- **WHEN** abre seu painel
- **THEN** vê Ana com as duas ofertas, seus períodos e indicadores separados, sem dados de outros alunos

#### Scenario: Aluno sem atividade recente
- **WHEN** o Responsável consulta uma turma em que seu Aluno vinculado nunca respondeu
- **THEN** vê progresso zero, sequência zero e última atividade indicada como Sem atividade

#### Scenario: Dois alunos e duas ofertas sem mistura
- **GIVEN** Responsável vinculado a Ana e Bruno, com Ana em Algoritmos de 2026.2 e 2027.1
- **WHEN** consulta os blocos de cada aluno e expande uma oferta de Ana
- **THEN** reconhece aluno, turma e período de cada progresso e data, sem total combinado ou dados de Bruno no detalhe de Ana

#### Scenario: Sem alunos ou sem turmas
- **WHEN** um Responsável não tem alunos vinculados ou um aluno vinculado não tem matrículas
- **THEN** o primeiro caso informa Nenhum aluno vinculado e o segundo mantém o nome do aluno com Sem turmas, sem indicadores inventados
