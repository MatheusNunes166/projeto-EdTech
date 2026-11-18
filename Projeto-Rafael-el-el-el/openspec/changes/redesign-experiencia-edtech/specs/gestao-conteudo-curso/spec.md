# Spec Delta

## ADDED Requirements

### Requirement: Navegação focada do editor pedagógico
O editor SHALL apresentar disciplina, graduação, publicação e compartilhamento entre turmas, separando Tópicos e materiais de Banco de questões. Cada seção SHALL começar com lista compacta e ações por item; criar ou editar SHALL abrir somente o item escolhido. Professor e Administrador SHALL usar esses mesmos padrões, respeitando suas autorizações.

#### Scenario: Abrir conteúdo sem todos os formulários
- **WHEN** um autor autorizado abre o conteúdo da disciplina
- **THEN** vê seu contexto e estado de publicação, os acessos às duas seções e a lista da seção selecionada, sem os formulários de todos os tópicos e questões expostos simultaneamente

#### Scenario: Editar material escolhido
- **GIVEN** disciplina com vários tópicos e materiais
- **WHEN** o autor abre um tópico e escolhe um material para editar
- **THEN** identifica o tópico e o material selecionados e vê campos adequados ao tipo texto, vídeo por link ou arquivo por link, sem abrir a edição dos demais materiais

#### Scenario: Mesmo editor na Administração
- **WHEN** o Administrador abre a rota administrativa de conteúdo sem vínculo docente
- **THEN** encontra as duas seções e a mesma edição focada, submetida às mesmas proteções e validações do editor docente

### Requirement: Rascunho conjunto entre seções e itens
Alterações do editor SHALL permanecer em um único rascunho da disciplina até Salvar alterações. Trocar seção ou item SHALL preservar campos e alterações pendentes, sem salvar automaticamente. Uma indicação textual de edição pendente SHALL permanecer acessível nas duas seções. Salvar SHALL submeter todo o conjunto às validações existentes, sem gravação parcial.

#### Scenario: Troca de seção preserva texto não salvo
- **GIVEN** autor que alterou um material e ainda não salvou
- **WHEN** abre Banco de questões, edita a explicação de uma questão e volta a Tópicos e materiais
- **THEN** reencontra o material alterado e a indicação de edição pendente, sem gravação por trocar de seção
- **AND** Salvar alterações inclui material e questão no mesmo conjunto

#### Scenario: Trocar item preserva edição anterior
- **GIVEN** dois materiais na mesma seção
- **WHEN** o autor altera o primeiro, abre o segundo e depois retorna ao primeiro
- **THEN** o primeiro conserva os valores editados e o rascunho continua pendente, sem substituir pelo último conteúdo salvo

#### Scenario: Montar cobertura antes de um único salvamento
- **GIVEN** disciplina publicada sem respostas e autor autorizado
- **WHEN** adiciona um tópico no rascunho, alterna ao banco, cria nele questões Fácil, Médio e Difícil válidas e aciona Salvar alterações
- **THEN** o tópico e suas questões são avaliados em conjunto e podem ser salvos de uma só vez, mantendo a publicação
- **AND** não se exige salvar o tópico isoladamente e invalidar a cobertura antes de criar suas questões

#### Scenario: Rejeição mantém rascunho e conteúdo válido
- **GIVEN** alteração de material e remoção da única questão Difícil ainda não respondida de um tópico publicado no mesmo rascunho
- **WHEN** o autor salva o conjunto
- **THEN** vê a rejeição com tópico e dificuldade faltante, conserva o rascunho para correção e não recebe sucesso
- **AND** material e questão persistidos, publicação, revisão, históricos e resultados permanecem anteriores, conforme Validade contínua do conteúdo publicado

### Requirement: Confirmação de descarte do editor
Uma tentativa de descartar alterações ou sair do editor com rascunho pendente por navegação controlada pelo aplicativo SHALL informar a disciplina e a perda das alterações não salvas, permitindo permanecer ou descartar. Permanecer SHALL conservar rascunho e foco. Descartar SHALL abandonar somente o rascunho, sem salvar ou alterar históricos. Trocar seção interna MUST NOT exigir descarte.

#### Scenario: Cancelar saída com edição pendente
- **GIVEN** Professor com material e questão alterados sem salvar
- **WHEN** aciona Voltar às turmas e escolhe permanecer na confirmação
- **THEN** continua no editor com ambos os itens alterados, o foco retorna ao acionador e nenhum comando de salvamento ou descarte é executado

#### Scenario: Confirmar saída para outro contexto
- **GIVEN** rascunho pendente em Algoritmos
- **WHEN** tenta abrir outra disciplina ou trocar de área e confirma o descarte identificado como sendo de Algoritmos
- **THEN** chega ao destino autorizado sem gravar o rascunho nem modificar conteúdo persistido, respostas, progresso, XP ou datas

#### Scenario: Descartar permanecendo no editor
- **WHEN** o autor aciona Descartar alterações e confirma
- **THEN** os campos retornam ao conteúdo salvo, a indicação de edição pendente é removida e os dados persistidos e sua revisão não mudam

#### Scenario: Navegar sem rascunho pendente
- **WHEN** o autor salvo e sem alterações pendentes volta à lista de turmas
- **THEN** a navegação ocorre sem uma confirmação de perda inexistente

### Requirement: Formulário legível de questão selecionada
A edição da questão selecionada SHALL oferecer espaço para enunciado e explicação extensos e associar cada alternativa ao seu controle de gabarito na mesma linha lógica. Tópico, dificuldade e alternativa correta SHALL ser identificáveis. Selecionar outro item ou redimensionar MUST NOT trocar ordem, correspondência ou gabarito. A quantidade de alternativas SHALL respeitar o conteúdo, sem impor quatro alternativas.

#### Scenario: Associar gabarito à alternativa
- **GIVEN** questão sem respostas com três alternativas longas
- **WHEN** o autor abre sua edição e marca a segunda como correta
- **THEN** reconhece por rótulo e estado a associação à segunda alternativa, que continua correta ao redimensionar e trocar de seção
- **AND** a seleção fica no rascunho até o salvamento conjunto

#### Scenario: Texto longo em desktop e celular
- **WHEN** o autor edita enunciado e explicação extensos em 1280 px e 360 px
- **THEN** consegue ler e editar os textos em campos de múltiplas linhas e identificar todas as alternativas e a correta, sem controles sobrepostos ou conteúdo essencial cortado

### Requirement: Motivos de bloqueio e publicação contextualizados
O editor SHALL explicar junto à ação afetada as restrições de estudo iniciado, questão respondida, cobertura publicada ou edição pendente. Publicar SHALL indicar publicação atual e pendências de cobertura, com tópico e dificuldade. Controles indisponíveis SHALL ter motivo textual acessível. A apresentação MUST NOT substituir as validações de cada comando nem expor respostas de turmas não autorizadas.

#### Scenario: Estrutura bloqueada por estudo em outra turma
- **GIVEN** Professor vinculado somente à turma B e primeira resposta registrada em A da mesma disciplina
- **WHEN** abre a seção de tópicos
- **THEN** encontra a explicação de que adicionar, remover ou reordenar tópicos está bloqueado por estudo já iniciado em alguma turma, sem expor alunos ou respostas de A
- **AND** ajustes permitidos de materiais continuam acessíveis e os comandos ainda rejeitam tentativa estrutural direta

#### Scenario: Questão respondida tem ações protegidas
- **WHEN** o autor abre uma questão já respondida
- **THEN** identifica junto aos controles as mudanças protegidas e o acesso à correção textual permitida, sem apresentar confirmação humana como liberação de gabarito ou exclusão

#### Scenario: Publicação com pendências
- **WHEN** o autor solicita publicar conteúdo salvo com tópico sem questão Difícil
- **THEN** encontra o tópico e a dificuldade faltante junto ao fluxo de publicação, pode abrir o item para corrigir e não vê falso sucesso

#### Scenario: Publicar com rascunho local
- **GIVEN** disciplina em rascunho e alterações locais ainda não salvas
- **WHEN** o autor consulta a ação Publicar
- **THEN** lê que deve salvar as alterações antes de publicar, sem perder o rascunho nem publicar silenciosamente a versão anterior

### Requirement: Revisão textual integrada à edição focada
A confirmação textual SHALL permanecer acessível no fluxo do item editado, mostrando diferenças entre original e proposto e exigindo a manifestação do próprio autor autorizado. SHALL identificar a confirmação pendente ou invalidada conforme Correção textual de questões respondidas. Mudar seção SHALL preservar a revisão ainda válida; novas diferenças ou revisão de origem alterada SHALL exigir nova confirmação.

#### Scenario: Confirmar correção e salvar conjunto
- **GIVEN** questão respondida com erro textual e material também alterado no rascunho
- **WHEN** o autor consulta a diferença exata, confirma a preservação de sentido e salva o conjunto válido
- **THEN** as duas alterações são salvas conjuntamente sem exigir segunda pessoa, preservando o conteúdo original das respostas e os resultados anteriores

#### Scenario: Correção sem confirmação
- **WHEN** o autor tenta salvar correção textual de questão respondida sem confirmar a diferença
- **THEN** vê a exigência junto à revisão da questão, conserva o rascunho e não altera a versão persistida nem os resultados dos alunos

#### Scenario: Alteração posterior invalida confirmação
- **GIVEN** diferença textual confirmada para determinada revisão original
- **WHEN** o autor muda também a explicação antes de salvar
- **THEN** a confirmação anterior deixa de valer e a interface apresenta a nova diferença para confirmação, sem reutilizar a aprovação de outro texto

#### Scenario: Confirmação não supera proteção ou revisão obsoleta
- **GIVEN** correção textual confirmada
- **WHEN** o autor tenta mudar o gabarito ou salvar sobre revisão de origem que ficou desatualizada
- **THEN** o primeiro caso é rejeitado pela proteção e o segundo informa o conflito de revisão e exige nova comparação, sem sobrescrita silenciosa ou sucesso parcial
