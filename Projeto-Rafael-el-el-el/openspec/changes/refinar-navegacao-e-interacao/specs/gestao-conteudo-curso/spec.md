# Spec Delta

## ADDED Requirements

### Requirement: Localização de itens no rascunho pedagógico
O editor SHALL permitir localizar tópicos, materiais e questões por texto identificável e metadados já autorizados, com filtros de tópico e dificuldade no banco. Critérios e item selecionado SHALL ser reconhecíveis. Filtrar, limpar, trocar seção ou selecionar outro item MUST preservar o candidato conjunto e confirmações textuais ainda válidas. Itens ocultos por filtro MUST continuar incluídos no salvamento e na validação.

#### Scenario: Encontrar questão e recuperar a lista
- **GIVEN** banco com questões de vários tópicos e dificuldades
- **WHEN** o autor combina texto, tópico e dificuldade, abre uma questão e volta à lista
- **THEN** reencontra os critérios e o item escolhido com contexto identificável; limpar filtros reapresenta os demais itens autorizados
- **AND** a busca usa somente conteúdo editável, sem alunos, respostas individuais ou ampliação de escopo

#### Scenario: Material e questão pendentes fora do filtro
- **GIVEN** material alterado e questão alterada em outra seção do mesmo rascunho
- **WHEN** o autor filtra a lista de modo que os itens alterados não apareçam
- **THEN** a indicação de alterações pendentes continua visível e Salvar alterações ainda inclui ambos, mesmo que ocultos
- **AND** filtros e troca de seção não gravam, descartam ou alteram revisões

#### Scenario: Busca sem resultado conserva edição
- **GIVEN** item em edição com texto ainda não salvo
- **WHEN** o autor aplica critério sem correspondência
- **THEN** a lista informa Nenhum item encontrado e permite limpar os critérios, sem substituir o rascunho por vazio nem fechar silenciosamente a edição
- **AND** erros de itens fora do filtro oferecem acesso à correção sem perder as demais alterações

#### Scenario: Revogação com item selecionado
- **GIVEN** editor filtrado com rascunho pendente
- **WHEN** a próxima consulta detecta perda da última autorização de autoria
- **THEN** o conteúdo restrito e o rascunho deixam de ser exibidos e salvar é negado; critérios não servem como cache para reapresentar o conteúdo

### Requirement: Ações de salvamento acessíveis no editor longo
O editor SHALL manter estado pendente, Salvar alterações e Descartar alterações alcançáveis durante formulários longos, sem percorrer todos os campos. Resultado e correções SHALL ficar próximos dessas ações; barras MUST respeitar foco, mensagens e área útil. Salvar SHALL continuar uma transação do rascunho inteiro. Descartar SHALL confirmar a perda antes de agir. Publicar MUST permanecer distinto e respeitar conteúdo salvo e cobertura.

#### Scenario: Ações disponíveis sem encobrir a edição
- **GIVEN** questão com enunciado, alternativas e explicação extensos
- **WHEN** o autor percorre o formulário em 1280, 768 e 360 px, inclusive por teclado
- **THEN** alcança Salvar e Descartar sem percorrer todos os campos, identifica a disciplina e o estado pendente e mantém o último campo, erros e foco visíveis
- **AND** ampliar texto ou reduzir a área visível não oculta Cancelar nem cria rolagem horizontal da página

#### Scenario: Falha ao salvar no fim do formulário
- **GIVEN** candidato conjunto válido e autor no final de uma explicação longa
- **WHEN** Salvar alterações falha por persistência
- **THEN** o erro aparece junto à região das ações e é anunciado, sem sucesso, mantendo campos, seleção, seção, critérios e possibilidade de nova tentativa
- **AND** documento persistido, revisão, publicação e resultados dos alunos ficam anteriores

#### Scenario: Cobertura inválida com correção de item oculto
- **GIVEN** disciplina publicada e rascunho cuja edição remove a única questão Difícil de um tópico, oculto pelo filtro atual
- **WHEN** o autor salva
- **THEN** recebe rejeição integral, identifica o tópico e a dificuldade faltante e consegue acessar sua correção sem perder o candidato
- **AND** não há gravação parcial, despublicação ou modificação de respostas antigas, domínio, desbloqueios, progresso, XP, conquistas e datas

#### Scenario: Correção textual confirmada pelo próprio autor
- **GIVEN** questão respondida com correção de enunciado, texto das alternativas ou explicação
- **WHEN** o autor autorizado consulta a diferença original/proposta na edição e confirma a preservação de significado e correspondência antes de salvar
- **THEN** somente a diferença exata e a revisão de origem confirmadas podem ser salvas, sem segunda pessoa e sem reordenação de alternativas
- **AND** identidade, tópico, dificuldade, gabarito e exclusão continuam protegidos; o histórico exibe o conteúdo originalmente apresentado

#### Scenario: Nova diferença exige nova confirmação
- **GIVEN** correção textual já confirmada
- **WHEN** o autor altera novamente a explicação ou a revisão original muda antes de salvar
- **THEN** a confirmação anterior não permite o salvamento; a nova diferença e origem precisam de apresentação e nova confirmação
- **AND** ausência de confirmação, confirmação de outro texto e tentativa de mudar gabarito mesmo confirmada são rejeitadas sem perda do conteúdo válido anterior

#### Scenario: Descartar ou continuar editando
- **GIVEN** material e questão alterados no conjunto
- **WHEN** o autor solicita Descartar alterações e escolhe Continuar editando
- **THEN** os dois itens e suas confirmações ainda válidas permanecem, com foco devolvido ao acionador e nenhuma gravação
- **AND** confirmar o descarte posteriormente remove somente o rascunho e mantém conteúdo persistido, históricos e revisão

#### Scenario: Publicar não salva rascunho implicitamente
- **GIVEN** conteúdo ainda em rascunho e alterações locais não salvas
- **WHEN** o autor consulta Publicar na região das ações
- **THEN** identifica que deve salvar antes, com a publicação atual e as pendências acessíveis, sem publicar a versão anterior ou gravar por item
- **AND** sucesso de salvamento ou publicação identifica a disciplina e somente é anunciado após confirmação real do comando

