# Spec Delta

## Purpose

Permite navegar e concluir tarefas nas cinco áreas da EdTech com localização clara, ações contextualizadas, estados compreensíveis e interação acessível em desktop e celular.

## ADDED Requirements

### Requirement: Cabeçalho e localização atual
O sistema SHALL apresentar cabeçalho compacto com marca, área e seção atuais, navegação autorizada, pessoa, troca de área e Sair. A seção atual SHALL ter indicação textual e acessível. Conta e troca de área SHALL ocupar local previsível, sem barras permanentes redundantes. Todos os destinos existentes SHALL continuar acessíveis.

#### Scenario: Página interna do aluno
- **WHEN** o Aluno abre a sessão de uma turma por endereço direto
- **THEN** identifica a Área do Aluno e a seção Sessão de estudo, encontra Minhas turmas e Catálogo e pode voltar à trilha da mesma turma

#### Scenario: Navegação dos demais perfis
- **WHEN** uma pessoa autorizada abre uma página de Professor, Coordenador, Administrador ou Responsável
- **THEN** o cabeçalho indica a área e a seção atuais e mantém os destinos permitidos, a troca de área quando aplicável e Sair
- **AND** os painéis e formulários específicos permanecem disponíveis com suas funcionalidades

#### Scenario: Conta com funções cumulativas
- **GIVEN** Carla professora em Sistemas de Informação e coordenadora de Direito
- **WHEN** troca da área docente para a coordenação usando as ações de conta
- **THEN** mantém a mesma identidade, identifica a nova área e vê apenas os recursos autorizados pelos vínculos correspondentes
- **AND** a troca não cria vínculos ou grava dados acadêmicos

### Requirement: Menu compacto no celular
Em telas estreitas, o sistema SHALL oferecer menu inicialmente recolhido, com nome acessível e estado expandido identificável. Área e seção atuais SHALL permanecer visíveis com o menu fechado. Abrir o menu SHALL permitir alcançar todos os destinos e ações de conta sem sobrepor conteúdo inacessível; fechar SHALL preservar a tarefa em curso.

#### Scenario: Abrir e fechar a navegação a 360 px
- **GIVEN** Professor editando uma questão a 360 px
- **WHEN** abre o menu, consulta seus destinos e fecha sem navegar
- **THEN** a seção atual continua identificada, o rascunho permanece e o foco retorna ao acionador do menu

#### Scenario: Navegar com o menu compacto
- **WHEN** o Administrador abre o menu a 360 px e escolhe Períodos e turmas
- **THEN** chega ao cadastro correto com a seção atual identificada, sem uma sequência permanente de barras de navegação acima do formulário

### Requirement: Uso por teclado e gestão de foco
Em todas as telas, o sistema MUST permitir ações por teclado, com ordem de leitura coerente, foco visível e salto ao conteúdo. Expansores SHALL informar seu estado. Mudanças de etapa, página e questão SHALL levar o foco ao conteúdo de destino. Abrir edição SHALL focar seu início; cancelar confirmação SHALL retornar ao acionador. Não SHALL haver armadilha de foco.

#### Scenario: Percorrer o fluxo de estudo sem mouse
- **WHEN** o usuário usa Tab, Shift+Tab, Enter, Espaço e as setas aplicáveis para escolher função e pessoa, abrir turma, estudar, expandir detalhes e sair
- **THEN** consegue concluir o fluxo com foco visível, alternativas rotuladas e estado expandido ou recolhido reconhecível

#### Scenario: Mudar de questão
- **GIVEN** feedback de uma questão respondida
- **WHEN** o Aluno aciona Próxima questão ou Continuar mesmo assim
- **THEN** o foco chega ao início da nova questão, sem ficar em um controle removido

#### Scenario: Cancelar restauração por teclado
- **WHEN** a pessoa abre a confirmação e cancela a restauração usando teclado
- **THEN** o foco retorna ao acionador da restauração e a pessoa pode continuar navegando

#### Scenario: Operar gestão e editor sem mouse
- **WHEN** o Administrador percorre lista, abre edição, corrige um campo, salva, abre remoção de vínculo e cancela usando somente teclado
- **THEN** cada controle tem nome e foco reconhecíveis, a edição recebe foco ao abrir, o resultado é anunciado e o cancelamento retorna ao controle da linha correspondente

### Requirement: Contraste e estados compreensíveis
O sistema MUST atender contraste AA: 4,5:1 para texto comum, 3:1 para texto grande e 3:1 para componentes e indicadores visuais essenciais, incluindo foco. Seleção, recomendação, bloqueio, domínio, acerto, erro e indisponibilidade SHALL ter identificação textual. Campos SHALL ter rótulos associados, e progresso SHALL ter nome e valor acessíveis.

#### Scenario: Compreender estados sem cores
- **WHEN** o Aluno consulta a trilha e responde uma questão sem distinguir as cores da interface
- **THEN** reconhece por texto o tópico recomendado, os tópicos bloqueados e dominados, a alternativa selecionada, o resultado e a alternativa correta quando houver erro

#### Scenario: Conferir contraste dos componentes
- **WHEN** os pares de cores de texto, controles e foco de todas as áreas são medidos
- **THEN** cada par essencial atende à razão de contraste correspondente, inclusive nos estados selecionado, inválido, bloqueado e de feedback

#### Scenario: Diferenciar estados administrativos
- **WHEN** o Administrador consulta uma pessoa inativa ou uma alteração impedida
- **THEN** lê Inativa ou o motivo do bloqueio sem depender de cor ou ícone, e identifica os campos pela associação de seus rótulos

### Requirement: Adaptação à largura nas telas abrangidas
Todas as rotas SHALL funcionar em desktop e a 360 px CSS sem rolagem horizontal da página, corte de conteúdo essencial ou sobreposição. Nomes, campos e ações longos SHALL permanecer legíveis e operáveis. Redimensionar SHALL preservar seleção, feedback, filtros e rascunhos. Listas estreitas SHALL manter a relação entre cada dado, seu rótulo e suas ações.

#### Scenario: Usar a experiência a 360 px
- **WHEN** o usuário percorre entrada, Minhas turmas, catálogo, detalhe, trilha, materiais, desempenho e sessão a 360 px
- **THEN** lê os dados e aciona os controles sem rolagem horizontal da página ou dos cartões, inclusive com nomes acadêmicos e alternativas longos

#### Scenario: Redimensionar durante o estudo
- **GIVEN** alternativa selecionada ou feedback presente na sessão
- **WHEN** a largura muda entre desktop e celular
- **THEN** a seleção ou o feedback permanece e nenhuma resposta adicional é registrada

#### Scenario: Ler e editar registros longos nas outras áreas
- **GIVEN** nomes longos de pessoas, graduações e disciplinas, explicação extensa e vários vínculos autorizados
- **WHEN** Professor, Coordenador, Administrador e Responsável percorrem suas respectivas rotas a 1280 px e a 360 px
- **THEN** identificam cada registro e ação, leem os textos e preenchem os campos sem corte, sobreposição ou rolagem horizontal da página
- **AND** abrir detalhe ou edição não torna ações de confirmação ou cancelamento inacessíveis

### Requirement: Listas e formulários orientados à ação
Telas de gestão SHALL apresentar primeiro lista ou resumo, com ações associadas a cada registro. Formulários SHALL abrir apenas ao escolher criar ou editar, mostrando o item selecionado, com uma edição ativa por contexto. A ação principal SHALL se distinguir das secundárias por hierarquia e rótulo específico. Ações repetidas SHALL ter nome acessível que identifique o registro.

#### Scenario: Lista antes da edição
- **WHEN** o Administrador abre um cadastro e escolhe editar uma disciplina
- **THEN** encontra inicialmente a lista sem formulários de criação abertos e depois vê somente o formulário da disciplina escolhida, com Salvar e Cancelar identificáveis
- **AND** os campos de código, data e descrição não recebem indiscriminadamente a mesma largura, e as ações permanecem associadas ao registro

#### Scenario: Ações curtas sem ambiguidade
- **WHEN** o Professor consulta uma lista com várias turmas de nomes longos
- **THEN** as ações visíveis usam rótulos curtos no contexto da linha e seus nomes acessíveis distinguem as ofertas sem depender apenas da posição

### Requirement: Estados e recuperação de falhas
Cada consulta ou comando SHALL distinguir carregamento, vazio, busca sem resultado, erro, sucesso, bloqueio e edição pendente quando aplicáveis. Falha recuperável SHALL manter campos e seleções e indicar correção ou nova tentativa. Sucesso SHALL identificar a operação concluída somente após confirmação real. Carregamento e erro MUST NOT ser apresentados como zero ou vazio confirmado.

#### Scenario: Distinguir carregamento e ausência de registros
- **WHEN** uma lista está carregando, falha, retorna vazia ou tem todos os itens excluídos pelos filtros
- **THEN** apresenta, respectivamente, carregamento, erro com nova tentativa, ausência de registros ou ausência de resultados com opção de ajustar critérios

#### Scenario: Erro de validação mantém campos
- **GIVEN** formulário de período com datas preenchidas em intervalo inválido
- **WHEN** o Administrador tenta salvar
- **THEN** os valores permanecem, o erro identifica o intervalo e o campo afetado, e não há mensagem de sucesso nem gravação parcial

#### Scenario: Falha de persistência não anuncia sucesso
- **GIVEN** alteração válida preparada no editor
- **WHEN** o salvamento falha
- **THEN** o rascunho permanece recuperável, a falha e a opção de nova tentativa são apresentadas e o conteúdo persistido não aparece como alterado

### Requirement: Confirmação de remoções existentes
Antes de efetivar remoção suportada, o sistema SHALL identificar o registro, a relação ou contexto e o efeito da operação, oferecendo Confirmar e Cancelar. Cancelar MUST preservar dados, revisão e demais edições. Confirmar SHALL respeitar autorização e validações atuais. No editor, confirmar remoção SHALL alterar apenas o rascunho até o salvamento conjunto.

#### Scenario: Cancelar remoção docente
- **GIVEN** Paulo vinculado às turmas A e B
- **WHEN** a Coordenação solicita remover Paulo de A e cancela a confirmação que identifica Paulo, disciplina, A e período
- **THEN** nenhum vínculo é removido, a revisão e os históricos permanecem iguais e o foco retorna à ação de A

#### Scenario: Confirmar remoção de um vínculo global
- **WHEN** o Administrador confirma a remoção do vínculo Responsável–Aluno identificado na confirmação
- **THEN** recebe resultado da remoção daquele vínculo, sem excluir as pessoas, outras relações ou históricos

#### Scenario: Remover questão do rascunho
- **GIVEN** questão sem respostas e autor autorizado
- **WHEN** o autor confirma sua remoção no editor
- **THEN** ela é retirada somente do rascunho e a edição fica pendente até Salvar alterações
- **AND** se a remoção invalidar a cobertura publicada, o salvamento é integralmente rejeitado conforme as regras existentes

#### Scenario: Autorização removida durante confirmação
- **GIVEN** confirmação de remoção docente aberta e último vínculo de coordenação revogado
- **WHEN** a pessoa confirma
- **THEN** a operação é negada, não há sucesso, nenhuma remoção é gravada e os históricos ficam intactos

### Requirement: Jornadas completas nas cinco funções
O sistema SHALL permitir concluir as jornadas descritas nos cenários em desktop a 1280 px e em celular a 360 px, preservando contexto, permissões e dados. Cada percurso SHALL ser executável em ambas as larguras, incluindo abertura de detalhes, menu quando necessário, resultados e retornos identificáveis, sem depender de acesso a outra função.

#### Scenario: Jornada completa do Aluno em desktop e celular
- **GIVEN** Ana ativa, com matrícula e conteúdo publicado, e uma próxima atividade disponível
- **WHEN** em cada largura, 1280 px e 360 px, escolhe Aluno e Ana, abre Minhas turmas, identifica a oferta, entra na trilha, consulta um material liberado, volta, estuda, seleciona e envia uma resposta, lê o feedback, avança explicitamente quando não concluída e consulta Desempenho
- **THEN** conclui o percurso e volta à trilha correta; somente o envio registra resposta e os indicadores pertencem à mesma matrícula

#### Scenario: Jornada completa do Professor em desktop e celular
- **GIVEN** Paulo ativo, vinculado à turma A com alunos e autorizado à disciplina
- **WHEN** em cada largura, 1280 px e 360 px, entra como Professor, abre A, consulta o detalhe de um aluno, volta à turma, abre conteúdo, escolhe um material, edita, alterna para Banco de questões e retorna a Tópicos e materiais antes de salvar
- **THEN** mantém oferta e aluno identificados nos painéis, reencontra o rascunho do material e salva o conjunto com resultado anunciado, sem alterar respostas antigas

#### Scenario: Jornada completa da Coordenação em desktop e celular
- **GIVEN** Carla coordenadora de Direito e candidato ativo elegível a docente
- **WHEN** em cada largura, 1280 px e 360 px, entra em Coordenação, seleciona graduação, disciplina, período e turma A, consulta as médias, abre a gestão de A, atribui o professor e retorna aos indicadores
- **THEN** vê sucesso da atribuição, retorna à mesma oferta e encontra médias por turma, sem histórico detalhado de respostas ou média global

#### Scenario: Jornada completa da Administração em desktop e celular
- **GIVEN** Administrador ativo, período existente e pessoa elegível à coordenação
- **WHEN** em cada largura, 1280 px e 360 px, entra, consulta a visão geral, cria uma graduação pelo cadastro, abre Vínculos e atribui a coordenação, solicita remover esse vínculo, cancela, solicita novamente e confirma
- **THEN** cada salvamento tem resultado identificado, o cancelamento conserva o vínculo e somente a confirmação final o remove, preservando a graduação, a pessoa e seus demais vínculos

#### Scenario: Jornada completa do Responsável em desktop e celular
- **GIVEN** Responsável vinculado a Ana, com ofertas da mesma disciplina em dois períodos, uma sem atividade
- **WHEN** em cada largura, 1280 px e 360 px, entra como Responsável, identifica Ana, consulta progresso, sequência e última atividade de ambas as ofertas e sai
- **THEN** reconhece aluno, turma e período de cada conjunto de indicadores, lê Sem atividade na oferta não iniciada e sai sem exposição de questões ou dados de alunos não vinculados
