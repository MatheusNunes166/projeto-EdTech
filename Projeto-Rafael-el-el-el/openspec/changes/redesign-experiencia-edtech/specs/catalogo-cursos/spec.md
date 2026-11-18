# Spec Delta

## MODIFIED Requirements

### Requirement: Busca e filtro no catálogo
O sistema SHALL permitir buscar por nome de graduação ou disciplina e combinar filtros por área da graduação, nível pedagógico da disciplina e período das ofertas. Um filtro de período SHALL restringir os resultados às disciplinas com turma nesse período. Busca e filtros SHALL ter rótulos e critérios ativos identificáveis, permitindo limpar critérios. Uma busca sem correspondência SHALL apresentar mensagem de resultado vazio, distinta de erro ou carregamento.

#### Scenario: Combinar filtros
- **GIVEN** Algoritmos publicada, nível Iniciante, na área Tecnologia, com oferta em 2026.2
- **WHEN** o Aluno busca Algoritmos e filtra Tecnologia, Iniciante e 2026.2
- **THEN** o sistema apresenta a disciplina e apenas suas ofertas do período selecionado

#### Scenario: Busca sem resultados
- **WHEN** o Aluno busca um nome sem correspondência
- **THEN** o sistema informa que nenhum resultado foi encontrado e permite ajustar ou limpar os critérios sem sugerir falha de consulta

#### Scenario: Filtrar por área
- **WHEN** o Aluno filtra o catálogo pela área "Exatas"
- **THEN** somente as graduações dessa área e suas disciplinas publicadas são exibidas

#### Scenario: Corrigir critérios no celular
- **WHEN** o Aluno combina busca e filtros a 360 px, não encontra resultados e limpa os critérios
- **THEN** todos os campos e ações continuam legíveis e operáveis e os resultados são atualizados sem criar matrícula ou alterar seu estudo

### Requirement: Detalhe acadêmico e ofertas
O sistema SHALL exibir no detalhe da graduação sua descrição e disciplinas publicadas. No detalhe da disciplina publicada, SHALL exibir descrição, graduação, tópicos ordenados e ofertas identificadas por código da turma, período, professores e situação de matrícula do Aluno. Ofertas SHALL ter contexto e ações associados sem ambiguidade. Consultar metadados MUST NOT conceder acesso a materiais restritos, questões ou dados dos alunos de uma oferta.

#### Scenario: Ver detalhe da disciplina
- **WHEN** o Aluno abre Algoritmos publicada, com turmas A e B em 2026.2 e professores distintos
- **THEN** vê os tópicos ordenados e identifica o período e os professores de cada turma

#### Scenario: Oferta sem professor
- **WHEN** o Aluno consulta uma oferta sem professores vinculados
- **THEN** o sistema identifica a ausência de professor sem inventar um responsável pela disciplina

#### Scenario: Distinguir ofertas da mesma disciplina
- **GIVEN** Ana matriculada somente em A de 2026.2, com outras ofertas A de 2027.1 e B de 2026.2
- **WHEN** consulta o detalhe da disciplina em desktop ou a 360 px
- **THEN** associa Continuar somente a A de 2026.2 e lê a ausência de matrícula nas demais, sem dados de colegas ou questões e sem ação de ingresso

### Requirement: Minhas turmas
O sistema SHALL listar ao Aluno apenas suas turmas matriculadas, identificando graduação, disciplina, código, período e progresso próprio. Ofertas da mesma disciplina MUST aparecer separadamente, sem fundir progresso. Turmas com conteúdo em rascunho SHALL constar como conteúdo indisponível, sem ação de estudo ou exposição de materiais e questões. Para conteúdo disponível, cada turma SHALL destacar uma ação principal: Ver trilha se concluída; Começar trilha se não concluída e sem respostas válidas; Continuar trilha se não concluída e com respostas válidas, mesmo com progresso de 0%. As três ações SHALL abrir a trilha daquela matrícula sem registrar resposta. Desempenho SHALL permanecer acessível como ação secundária. O cartão SHALL distinguir por texto Sem atividade de Em andamento; carregar ou falhar ao consultar indicadores MUST NOT ser interpretado como ausência de respostas.

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

#### Scenario: Começar uma trilha sem respostas
- **GIVEN** Diego matriculado em turma com conteúdo publicado, sem respostas válidas e progresso de 0%
- **WHEN** abre Minhas turmas
- **THEN** o cartão identifica Sem atividade, exibe 0%, destaca Começar trilha e oferece Desempenho como ação secundária
- **AND** Começar trilha abre a trilha correta sem diagnóstico ou criação de matrícula

#### Scenario: Continuar mesmo com progresso zero
- **GIVEN** um Aluno com respostas válidas na turma, nenhum tópico dominado e progresso de 0%
- **WHEN** abre Minhas turmas
- **THEN** o cartão identifica Em andamento, mantém 0% e destaca Continuar trilha, sem marcar Sem atividade

#### Scenario: Consultar trilha concluída
- **GIVEN** Elisa com todos os tópicos dominados na turma atual
- **WHEN** abre Minhas turmas
- **THEN** o cartão identifica Trilha concluída, mostra 100%, destaca Ver trilha e mantém Desempenho secundário
- **AND** Ver trilha não inicia uma nova atividade nem reinicia o progresso

#### Scenario: Indicadores ainda indisponíveis
- **WHEN** a lista de matrículas foi carregada, mas os indicadores da turma estão carregando ou falharam
- **THEN** o sistema mostra carregamento ou erro e não afirma Sem atividade, 0% ou Começar trilha por falta de dados

#### Scenario: Identificar a oferta antes de continuar
- **GIVEN** duas turmas da mesma disciplina com códigos ou períodos diferentes
- **WHEN** o Aluno aciona a ação principal ou Desempenho em um dos cartões
- **THEN** o destino corresponde à matrícula daquele cartão, com seus dados e progresso preservados
