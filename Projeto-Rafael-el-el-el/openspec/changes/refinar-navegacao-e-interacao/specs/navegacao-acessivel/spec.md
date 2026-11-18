# Spec Delta

## Purpose

Orienta a navegação e a interação nas áreas da EdTech com retornos seguros, composição consistente, feedback perceptível e ações acessíveis, preservando os dados e os contextos autorizados.

## ADDED Requirements

### Requirement: Retorno determinístico e hierarquia de páginas
Páginas internas SHALL apresentar retorno com destino nomeado antes do título, na mesma região visual. Hierarquias com detalhe de oferta, aluno ou conteúdo SHALL mostrar breadcrumbs com ancestrais autorizados e página atual identificada. Retorno SHALL funcionar sem histórico anterior, não aceitar destino externo e não escolher turma arbitrária. A sessão SHALL manter também o acesso à trilha em seu resumo.

#### Scenario: Retorno por URL direta
- **GIVEN** Ana autorizada que abre diretamente a sessão, materiais ou desempenho de Algoritmos A em 2026.2 sem visitar a lista
- **WHEN** aciona Voltar à trilha
- **THEN** chega à trilha de A em 2026.2, sem depender do botão anterior do navegador, registrar resposta ou abrir a oferta de 2027.1

#### Scenario: Hierarquia docente até o aluno
- **WHEN** o Professor abre diretamente o detalhe de Ana em uma turma autorizada
- **THEN** identifica Minhas turmas, a turma e o aluno na hierarquia e encontra Voltar à turma antes do título
- **AND** o ancestral da turma leva ao painel dessa oferta, com contexto acadêmico completo

#### Scenario: Conteúdo aberto a partir da turma
- **GIVEN** Professor que abriu conteúdo de Algoritmos pelo painel da turma B
- **WHEN** retorna sem edições pendentes
- **THEN** a ação nomeia e abre o painel de B; o breadcrumb identifica que o conteúdo é compartilhado pela disciplina, sem atribuir-lhe progresso de B
- **AND** abrindo o editor diretamente sem origem válida, encontra Voltar às turmas como destino docente seguro

#### Scenario: Origem administrativa e parâmetro indevido
- **GIVEN** editor administrativo aberto diretamente ou com origem externa, inexistente ou não autorizada informada no endereço
- **WHEN** a página resolve seu retorno
- **THEN** oferece Graduações e disciplinas na área administrativa, sem seguir a origem indevida, expor o nome de recurso negado ou trocar para área docente

### Requirement: Contexto de navegação preservado e seguro
Retornos SHALL restaurar critérios e seleção válidos do contexto de origem na mesma sessão, quando existentes, e identificar o registro de retorno. Abrir/fechar menus, redimensionar ou trocar item interno SHALL preservar a tarefa e os rascunhos já suportados. Contexto transitório MUST ser separado por pessoa e finalidade; dados revogados MUST deixar de ser exibidos. Descartes SHALL seguir a confirmação existente.

#### Scenario: Lista reencontrada após detalhe
- **GIVEN** uma lista de gestão filtrada, com registro escolhido
- **WHEN** a pessoa abre o detalhe e volta à lista
- **THEN** reencontra os critérios válidos e o registro identificável, sem reiniciar a busca ou mudar a seleção por uma oferta de mesmo nome

#### Scenario: Edição pendente ao usar breadcrumb
- **GIVEN** material e questão alterados no rascunho conjunto
- **WHEN** o autor aciona um ancestral que abandona o editor e escolhe Continuar editando
- **THEN** permanece com ambos os itens e suas confirmações textuais ainda válidas, sem gravação, e o foco retorna ao acionador

#### Scenario: Confirmação de saída e troca interna
- **GIVEN** rascunho pendente na disciplina A
- **WHEN** o autor troca somente a seção ou o item do editor
- **THEN** conserva o rascunho sem pedir descarte
- **AND** ao confirmar Descartar e sair para um destino autorizado, perde somente as alterações não salvas de A

#### Scenario: Revogação e troca de pessoa
- **GIVEN** critérios e seleção de uma pessoa que perdeu acesso a um recurso ou encerrou a sessão
- **WHEN** uma nova consulta ou entrada ocorre
- **THEN** nenhum dado restrito anterior é reapresentado como contexto válido, a autorização é reavaliada e outra pessoa não herda seleção, mensagens ou rascunho restritos

### Requirement: Composição visual alinhada e leitura proporcional
Cabeçalho, orientação e conteúdo SHALL compartilhar uma grade alinhada. Listas da mesma finalidade SHALL manter colunas e posições equivalentes de ações, independentemente do tamanho dos textos. Nomes acadêmicos e de pessoas MUST continuar completos e legíveis; textos de leitura SHALL ter largura limitada. Grupos relacionados SHALL usar espaçamento consistente e adaptar-se a 1280, 768 e 360 px sem rolagem horizontal.

#### Scenario: Nomes longos em registros comparáveis
- **GIVEN** nomes de pessoas e disciplinas com mais de 100 caracteres e metadados de comprimentos diferentes
- **WHEN** a pessoa consulta as listas em 1280 px
- **THEN** os nomes quebram sem reticências sobre informação essencial, dados comparáveis começam nas mesmas colunas e ações equivalentes continuam alinhadas no fim da linha
- **AND** os botões não invadem nem encobrem os textos

#### Scenario: Composição intermediária e estreita
- **WHEN** as mesmas listas, filtros e formulários são exibidos em 768 e 360 px
- **THEN** mudam para colunas compatíveis com o espaço, mantendo rótulo, valor e ações de cada registro associados, sem sobreposição ou rolagem horizontal da página

#### Scenario: Leitura sem faixa excessiva ou espaços artificiais
- **WHEN** a pessoa abre descrição de disciplina, material, explicação ou histórico expandido no desktop
- **THEN** o texto de leitura fica limitado a no máximo 78 caracteres tipográficos de largura, sem obrigar listas e indicadores a essa mesma largura
- **AND** uma página curta não recebe altura mínima artificial para afastar sua próxima ação

### Requirement: Papéis visuais e estados de ações
Ações SHALL distinguir por apresentação consistente a principal, secundárias, navegação e destrutivas. Controles equivalentes SHALL compartilhar altura mínima de 44 px, alinhamento e espaçamento de ícone/texto, admitindo quebra de rótulo. Hover, foco, pressionamento, seleção, carregamento e indisponibilidade SHALL ter sinais próprios. Cor ou ícone MUST NOT ser a única comunicação; bloqueios SHALL ter motivo acessível.

#### Scenario: Hierarquia de criar editar navegar e remover
- **WHEN** a pessoa consulta uma lista com Nova pessoa, Editar, abrir detalhe e Remover vínculo
- **THEN** identifica a ação principal, a edição secundária, o destino de navegação e o caráter destrutivo da remoção antes de executá-las
- **AND** Remover continua limitado às operações existentes e exige a confirmação contextualizada já prevista

#### Scenario: Seleção e estados por diferentes entradas
- **WHEN** um controle elegível recebe ponteiro, foco por Tab, pressionamento por teclado ou seleção
- **THEN** cada estado aplicável é perceptível, o foco permanece visível e seleção é informada por texto e estado acessível, sem deslocar a composição

#### Scenario: Ação bloqueada compreensível
- **GIVEN** adicionar tópico bloqueado por estudo iniciado ou salvar indisponível por revisão obsoleta
- **WHEN** o autor consulta a ação inclusive sem poder focar um botão desabilitado
- **THEN** encontra o motivo em texto adjacente, associado acessivelmente ao controle, sem necessidade de hover e sem autorização ampliada

#### Scenario: Ícone não substitui o nome da ação
- **WHEN** uma ação de retorno, salvar, edição ou remoção apresenta ícone
- **THEN** utiliza o mesmo símbolo para o mesmo significado e conserva rótulo compreensível; o ícone decorativo não repete o anúncio do controle

### Requirement: Resultado perceptível e recuperação próxima da ação
Operações SHALL mostrar carregamento textual e impedir reenvio enquanto pendentes. Após resposta real, SHALL identificar operação e recurso em mensagem perceptível na região da tarefa e anunciada acessivelmente. Falha recuperável MUST conservar campos, seleção e rascunho, indicar correção ou nova tentativa e não anunciar sucesso. Erros de campo SHALL ficar associados aos respectivos campos.

#### Scenario: Sucesso identificado na região da tarefa
- **WHEN** salvar material, remover vínculo ou atribuir docente termina com sucesso
- **THEN** a pessoa vê e recebe anúncio do resultado identificado junto à região da operação, sem precisar procurar mensagem fora da área visível
- **AND** somente o recurso autorizado muda; remover não exclui a pessoa nem seus históricos

#### Scenario: Operação lenta e acionamento repetido
- **GIVEN** comando de salvar, matricular, atribuir ou responder ainda pendente
- **WHEN** a pessoa tenta acioná-lo novamente por clique ou teclado
- **THEN** lê Salvando, Matriculando, Atribuindo ou Enviando conforme a tarefa e nenhum segundo envio é iniciado
- **AND** finalizar a operação atualiza o estado sem saltos de largura que desloquem os controles

#### Scenario: Falha ao salvar com correção orientada
- **GIVEN** formulário com valores digitados e falha de persistência ou validação rejeitada
- **WHEN** o resultado é apresentado
- **THEN** os valores permanecem, há erro perceptível junto à tarefa e, para campo inválido, junto ao campo com orientação de correção
- **AND** a pessoa pode corrigir ou tentar novamente sem mudança parcial do documento, revisão ou histórico

#### Scenario: Autorização revogada antes da ação
- **GIVEN** edição ou confirmação aberta antes da retirada do último vínculo que a autorizava
- **WHEN** a pessoa tenta confirmar
- **THEN** recebe recusa sem sucesso, não vê dados restritos como se continuassem autorizados e nenhum dado ou revisão é alterado
- **AND** permissões válidas de outra função e vínculo continuam independentes

### Requirement: Movimento discreto e interação sem obstrução
Transições de seleção, expansão e feedback SHALL ser breves e dispensáveis, respeitando redução de movimento. Todas as ações SHALL funcionar por teclado, com foco visível e contraste AA conforme os limites existentes. Barras de ações MUST NOT encobrir campos, mensagens, foco ou o último controle. Em 360 px as ações essenciais SHALL permanecer alcançáveis, inclusive ao ampliar texto e abrir confirmações.

#### Scenario: Redução de movimento
- **WHEN** a preferência de redução de movimento está ativa
- **THEN** expansões, seleção e feedback aparecem sem animação de movimento ou rolagem suave obrigatória, sem atrasar resposta, foco ou disponibilidade da ação

#### Scenario: Escape no acionador e no conteúdo do menu
- **GIVEN** Menu aberto por teclado, com foco no seu acionador ou em um de seus destinos
- **WHEN** a pessoa pressiona Escape
- **THEN** o menu fecha, seu estado expandido é atualizado e o foco fica no acionador, sem navegar, executar comando ou perder seleção, filtro ou rascunho
- **AND** se uma confirmação modal estiver aberta, Escape cancela somente essa confirmação conforme suas regras, sem fechar indevidamente o menu ao fundo

#### Scenario: Teclado no formulário longo
- **WHEN** o autor percorre o editor com Tab e Shift+Tab, abre uma confirmação e cancela
- **THEN** cada campo focado, erro e ação fica visível fora da barra de ações, a confirmação contém o foco enquanto aberta e o cancelamento devolve foco ao acionador
- **AND** não há armadilha de foco nem ordem dependente apenas da disposição visual

#### Scenario: Celular com texto ampliado e confirmação
- **WHEN** a pessoa usa a 360 px texto ampliado a 200%, abre Menu, formulário longo ou confirmação de remoção
- **THEN** rótulos, campos, mensagens e ações essenciais continuam legíveis e alcançáveis por rolagem vertical, sem rolagem horizontal da página ou sobreposição
- **AND** o último campo e a ação Cancelar podem receber foco sem ficarem cobertos

#### Scenario: Contraste de estados renderizados
- **WHEN** os pares efetivos de texto, foco, bordas funcionais, seleção e feedback são medidos nas três larguras
- **THEN** atendem 4,5:1 em texto comum, 3:1 em texto grande e 3:1 nos indicadores visuais essenciais e foco, sempre com rótulo adicional ao significado da cor

