# catalogo-cursos Specification

## Purpose
Permite consultar graduações, disciplinas publicadas e ofertas por período letivo, além de acessar as turmas em que o aluno já está matriculado.

## Requirements

### Requirement: Busca e filtro no catálogo
O sistema SHALL permitir buscar por nome de graduação ou disciplina e combinar filtros por área da graduação, nível pedagógico da disciplina e período das ofertas. Um filtro de período SHALL restringir os resultados às disciplinas com turma nesse período. Uma busca sem correspondência SHALL apresentar mensagem de resultado vazio.

#### Scenario: Combinar filtros
- **GIVEN** Algoritmos publicada, nível Iniciante, na área Tecnologia, com oferta em 2026.2
- **WHEN** o Aluno busca Algoritmos e filtra Tecnologia, Iniciante e 2026.2
- **THEN** o sistema apresenta a disciplina e apenas suas ofertas do período selecionado

#### Scenario: Busca sem resultados
- **WHEN** o Aluno busca um nome sem correspondência
- **THEN** o sistema informa que nenhum resultado foi encontrado

#### Scenario: Filtrar por área
- **WHEN** o Aluno filtra o catálogo pela área "Exatas"
- **THEN** somente as graduações dessa área e suas disciplinas publicadas são exibidas

### Requirement: Catálogo de graduações e disciplinas publicadas
O sistema SHALL apresentar ao Aluno as graduações com nome, descrição curta derivada da descrição e área, e as disciplinas com conteúdo publicado, identificando graduação, nível pedagógico e número de tópicos. Disciplinas em rascunho MUST NOT aparecer como conteúdo disponível no catálogo. Graduações SHALL ser entidades acadêmicas, sem estado de publicação de trilha.

#### Scenario: Aluno abre o catálogo
- **GIVEN** Algoritmos publicada e Banco de Dados em rascunho na graduação Sistemas de Informação
- **WHEN** o Aluno consulta as disciplinas dessa graduação no catálogo
- **THEN** Algoritmos aparece com nível e número de tópicos e Banco de Dados não aparece como conteúdo disponível

### Requirement: Detalhe acadêmico e ofertas
O sistema SHALL exibir no detalhe da graduação sua descrição e disciplinas publicadas. No detalhe da disciplina publicada, SHALL exibir descrição, graduação, tópicos ordenados e ofertas com código da turma, período e professores vinculados. Consultar metadados MUST NOT conceder acesso a materiais restritos, questões ou dados dos alunos de uma oferta.

#### Scenario: Ver detalhe da disciplina
- **WHEN** o Aluno abre Algoritmos publicada, com turmas A e B em 2026.2 e professores distintos
- **THEN** vê os tópicos ordenados e identifica o período e os professores de cada turma

#### Scenario: Oferta sem professor
- **WHEN** o Aluno consulta uma oferta sem professores vinculados
- **THEN** o sistema identifica a ausência de professor sem inventar um responsável pela disciplina

### Requirement: Acesso às turmas sem automatrícula
O catálogo MUST NOT oferecer matrícula direta em graduação ou turma nem solicitação de ingresso nesta entrega. Para uma turma em que o Aluno está matriculado e cujo conteúdo está publicado, SHALL oferecer Continuar; para as demais, SHALL informar a ausência de matrícula, sem liberar a trilha. A consulta MUST NOT criar matrículas.

#### Scenario: Aluno matriculado continua estudo
- **GIVEN** Ana matriculada na turma A de Algoritmos publicada
- **WHEN** consulta essa oferta no catálogo
- **THEN** pode acionar Continuar e retomar a trilha da turma A, sem criar nova matrícula

#### Scenario: Aluno não matriculado consulta oferta
- **WHEN** Ana consulta a turma B na qual não está matriculada
- **THEN** vê a informação de ausência de matrícula, sem ação de ingresso ou acesso à trilha

### Requirement: Minhas turmas
O sistema SHALL listar ao Aluno apenas suas turmas matriculadas, identificando graduação, disciplina, código, período e progresso próprio. Ofertas da mesma disciplina MUST aparecer separadamente, sem fundir progresso. Turmas com conteúdo em rascunho SHALL constar como conteúdo indisponível, sem ação de estudo ou exposição de materiais e questões.

#### Scenario: Mesma disciplina em períodos distintos
- **GIVEN** Ana matriculada em Algoritmos em 2026.2 com 50% e em 2027.1 com 0%
- **WHEN** abre Minhas turmas
- **THEN** vê duas ofertas com os respectivos períodos e progressos de 50% e 0%

#### Scenario: Matrícula anterior à publicação
- **GIVEN** Ana matriculada em uma turma cuja disciplina está em rascunho
- **WHEN** abre Minhas turmas ou tenta iniciar a trilha por endereço direto
- **THEN** a turma é identificada como conteúdo indisponível e o estudo é impedido

#### Scenario: Aluno sem matrículas
- **WHEN** um Aluno sem matrículas abre Minhas turmas
- **THEN** o sistema informa que não há turmas vinculadas, sem apresentar turmas de outros alunos
