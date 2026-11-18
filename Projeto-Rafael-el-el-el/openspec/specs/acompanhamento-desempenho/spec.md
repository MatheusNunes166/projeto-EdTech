# acompanhamento-desempenho Specification

## Purpose
Oferece painéis básicos de progresso e desempenho com contexto de disciplina, turma e período, respeitando as funções e vínculos de cada pessoa.

## Requirements

### Requirement: Painel do aluno
O sistema SHALL exibir ao Aluno, para cada turma matriculada, progresso, domínio por tópico, taxa de acertos e XP próprios, identificando graduação, disciplina, turma e período. Taxa de acertos SHALL ser acertos divididos por respostas válidas dessa matrícula, em porcentagem arredondada; sem respostas SHALL apresentar zero e indicar ausência de atividade.

#### Scenario: Aluno consulta seu desempenho
- **GIVEN** Ana com um de dois tópicos dominados, três acertos em quatro respostas e 50 XP na turma A
- **WHEN** abre o painel dessa turma
- **THEN** vê progresso de 50%, taxa de acertos de 75%, domínio por tópico e 50 XP com identificação da oferta

#### Scenario: Matrícula sem respostas
- **WHEN** Ana consulta o painel de uma turma na qual ainda não respondeu
- **THEN** vê progresso, domínio e XP iguais a zero e taxa zero acompanhada da indicação Sem atividade

### Requirement: Alunos com dificuldade
O painel do Professor SHALL destacar como Precisa de atenção alunos com menos de 50% de acertos nas últimas até 10 respostas válidas da turma consultada. Se houver menos de 10, SHALL usar as disponíveis. Sem respostas, SHALL indicar Sem atividade e MUST NOT classificar por dificuldade. Esse destaque MUST NOT gerar diagnóstico ou encaminhamento de monitoria.

#### Scenario: Aluno destacado
- **GIVEN** Ana com três acertos nas últimas 10 respostas da turma A
- **WHEN** o Professor consulta A
- **THEN** Ana aparece como Precisa de atenção

#### Scenario: Limite de atenção
- **GIVEN** Ana com cinco acertos nas últimas 10 respostas de A e erros em outra turma
- **WHEN** o Professor consulta A
- **THEN** Ana não é destacada por dificuldade e os erros da outra turma não entram no cálculo

#### Scenario: Poucas respostas
- **GIVEN** Ana com duas respostas na turma, ambas incorretas
- **WHEN** o Professor consulta essa turma
- **THEN** Ana é destacada com base nas duas respostas disponíveis

### Requirement: Detalhe de aluno para o professor
O Professor SHALL poder abrir o detalhe de um Aluno matriculado em turma docente vinculada, vendo domínio por tópico e histórico das últimas até 10 respostas nessa turma, com data, questão, dificuldade e resultado. Ter o mesmo aluno em outra turma MUST NOT conceder acesso ao histórico de ofertas não vinculadas.

#### Scenario: Ver detalhe do aluno
- **WHEN** Paulo seleciona Ana no painel de sua turma A
- **THEN** vê o domínio por tópico e somente as últimas até 10 respostas de Ana em A

#### Scenario: Mesmo aluno em turma não vinculada
- **GIVEN** Paulo professor de A, Ana matriculada em A e B e Paulo sem vínculo com B
- **WHEN** Paulo tenta abrir o detalhe de Ana em B
- **THEN** o acesso é negado, mesmo que o detalhe de Ana em A seja permitido

### Requirement: Painel do responsável
O sistema SHALL exibir ao Responsável, para cada Aluno vinculado, as disciplinas e turmas matriculadas com graduação, período, progresso, sequência de dias e última atividade naquela turma. Sem respostas, SHALL indicar Sem atividade e sequência zero. A visualização MUST NOT incluir alunos não vinculados ou histórico detalhado de questões.

#### Scenario: Responsável acompanha aluno
- **GIVEN** um Responsável vinculado somente a Ana, matriculada em duas ofertas de Algoritmos
- **WHEN** abre seu painel
- **THEN** vê Ana com as duas ofertas, seus períodos e indicadores separados, sem dados de outros alunos

#### Scenario: Aluno sem atividade recente
- **WHEN** o Responsável consulta uma turma em que seu Aluno vinculado nunca respondeu
- **THEN** vê progresso zero, sequência zero e última atividade indicada como Sem atividade

### Requirement: Visão geral do administrador
O sistema SHALL exibir ao Administrador totais de pessoas distintas, pessoas por função, graduações, disciplinas por estado de publicação, períodos, turmas e matrículas. Uma pessoa com várias funções SHALL contar uma vez no total de pessoas e uma vez em cada função atribuída. Graduações MUST NOT ser contadas como conteúdo publicado ou rascunho.

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

### Requirement: Painel do professor por turma
O sistema SHALL exibir ao Professor apenas suas turmas vinculadas, com disciplina e período. Em cada turma, SHALL listar matriculados com progresso e taxa de acertos e domínio médio por tópico. As médias SHALL incluir todos os matriculados daquela turma, usando zero para quem não iniciou e as regras de precisão e exibição das médias, sem misturar ofertas.

#### Scenario: Professor com várias turmas
- **GIVEN** Paulo vinculado às turmas A e B de Algoritmos e C de Banco de Dados
- **WHEN** abre sua área e seleciona B
- **THEN** identifica as três ofertas e vê em B somente seus alunos e indicadores, sem matrículas ou respostas de A ou C

#### Scenario: Média inclui alunos sem respostas
- **GIVEN** uma turma com somente Ana com domínio 80 em Vetores e Bruno sem respostas
- **WHEN** o Professor consulta o domínio médio de Vetores nessa turma
- **THEN** o sistema apresenta 40

### Requirement: Turma sem alunos
Ao consultar uma turma sem alunos, o sistema SHALL mostrar zero matrículas e mensagem Nenhum aluno matriculado. Painéis de Professor, Coordenador e Administrador SHALL tratar médias e taxas agregadas como Sem dados, sem divisão por zero, valores inválidos ou inclusão de alunos de outra turma da mesma disciplina.

#### Scenario: Professor consulta turma vazia
- **GIVEN** turmas A com alunos e B sem alunos da mesma disciplina, ambas vinculadas a Paulo
- **WHEN** Paulo abre o painel de B
- **THEN** vê zero matrículas, Nenhum aluno matriculado e indicadores agregados Sem dados, sem dados de A

#### Scenario: Coordenador consulta oferta vazia
- **WHEN** um Coordenador autorizado abre uma turma sem alunos de sua graduação
- **THEN** vê zero matrículas, Nenhum aluno matriculado e progresso médio e domínio médio por tópico apresentados como “Sem dados”, sem indicador inválido

### Requirement: Painel do coordenador
O sistema SHALL exibir ao Coordenador suas graduações vinculadas, disciplinas e turmas por período, com matrículas e médias somente por turma. MUST NOT apresentar média global entre turmas, disciplinas ou graduações, prever evasão, comparar séries históricas ou permitir editar resultados de estudo. O Coordenador SHALL acessar a gestão acadêmica desse escopo, sem acesso a históricos detalhados de respostas por essa função.

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

### Requirement: Progresso médio por turma
O progresso médio da turma SHALL ser a soma dos progressos individuais de todos os seus matriculados dividida pelo número de matriculados. Cada progresso individual SHALL usar a porcentagem exata de tópicos dominados, sem arredondamento prévio; quem não iniciou SHALL contribuir com zero. Matrículas e progressos de outras turmas MUST NOT compor soma ou divisor. Sem matriculados, SHALL exibir “Sem dados”.

#### Scenario: Progresso de 80 e zero inclui quem não iniciou
- **GIVEN** uma turma de cinco tópicos com apenas Ana, que dominou quatro e tem progresso 80%, e Bruno, que não iniciou e tem progresso 0%
- **WHEN** o Coordenador consulta o progresso médio da turma
- **THEN** o sistema exibe 40%, calculado por (80 + 0) / 2

#### Scenario: Outra turma não influencia a média
- **GIVEN** turma A com progressos 80% e 0% e turma B da mesma disciplina com progressos 100% e 100%
- **WHEN** o Coordenador consulta A e depois outra pessoa com progresso 0% é matriculada em B
- **THEN** a média de A permanece 40%, usando somente suas duas matrículas, sem média combinada com B

### Requirement: Domínio médio por tópico da turma
O domínio médio de cada tópico SHALL ser a soma dos domínios desse tópico de todos os matriculados na turma dividida pelo número de matriculados. Aluno que não iniciou o tópico SHALL contribuir com domínio zero. Domínios de outro tópico, aluno não matriculado ou outra turma MUST NOT participar do cálculo. Sem matriculados, cada domínio médio SHALL ser apresentado como “Sem dados”.

#### Scenario: Coordenação inclui zero no domínio médio
- **GIVEN** turma A com Ana com domínio 80 em Vetores e Bruno sem respostas nesse tópico
- **WHEN** o Coordenador consulta o domínio médio de Vetores em A
- **THEN** vê 40, calculado por (80 + 0) / 2

#### Scenario: Mesmo tópico em outra oferta não influencia
- **GIVEN** turma A com domínios 80 e 0 em Vetores e turma B da mesma disciplina com domínio 100 para todos os alunos
- **WHEN** o Coordenador consulta Vetores em A
- **THEN** a média é 40 e os domínios de B não participam da soma nem do divisor

### Requirement: Precisão e exibição das médias
O sistema MUST somar valores sem arredondamento intermediário e dividir pelo total de matriculados antes de arredondar. Somente o resultado exibido de progresso médio e domínio médio por tópico SHALL ser arredondado ao inteiro mais próximo; em empate de meio ponto, SHALL arredondar para cima. Percentuais individuais já arredondados para exibição MUST NOT alimentar os cálculos das médias.

#### Scenario: Média usa progressos exatos
- **GIVEN** uma turma de seis tópicos com três alunos que dominaram um, um e quatro tópicos, respectivamente
- **WHEN** o Coordenador consulta o progresso médio
- **THEN** vê 33%, calculado por ((100/6) + (100/6) + (400/6)) / 3, sem usar os valores individuais exibidos de 17%, 17% e 67%, que produziriam 34%

#### Scenario: Arredondamento do domínio somente na exibição
- **GIVEN** somente três matriculados com domínios 80, 0 e 0 no mesmo tópico
- **WHEN** o Coordenador consulta o domínio médio desse tópico
- **THEN** o sistema calcula 80/3 e exibe 27, sem arredondar parcelas ou resultados intermediários

#### Scenario: Empate de meio ponto
- **GIVEN** somente dois matriculados com domínios 80 e 5 no mesmo tópico
- **WHEN** o Coordenador consulta o domínio médio desse tópico
- **THEN** o sistema calcula 42,5 e exibe 43
