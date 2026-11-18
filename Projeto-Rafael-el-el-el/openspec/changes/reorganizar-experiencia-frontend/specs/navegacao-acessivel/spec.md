# Spec Delta

## Purpose

Permite identificar a localização atual e navegar pelas áreas autorizadas com uma interface compacta, acessível por teclado e adaptada a diferentes larguras, priorizando o conteúdo e as ações de estudo.

## ADDED Requirements

### Requirement: Cabeçalho e localização atual
O sistema SHALL apresentar cabeçalho compacto com marca, navegação da área, pessoa atual, acesso às demais áreas permitidas e Sair. SHALL identificar por texto a área e a seção atuais, inclusive em páginas internas, e marcar o destino atual para tecnologia assistiva. A navegação compartilhada SHALL manter todos os destinos existentes de cada função.

#### Scenario: Página interna do aluno
- **WHEN** o Aluno abre a sessão de uma turma por endereço direto
- **THEN** identifica a Área do Aluno e a seção Sessão de estudo, encontra Minhas turmas e Catálogo e pode voltar à trilha da mesma turma

#### Scenario: Navegação dos demais perfis
- **WHEN** uma pessoa autorizada abre uma página de Professor, Coordenador, Administrador ou Responsável
- **THEN** o cabeçalho indica a área e a seção atuais e mantém os destinos permitidos, a troca de área quando aplicável e Sair
- **AND** os painéis e formulários específicos permanecem disponíveis com suas funcionalidades

### Requirement: Uso por teclado e gestão de foco
Nas telas abrangidas, o sistema MUST permitir todas as ações por teclado, com foco visível e ordem coerente com a leitura. SHALL oferecer salto ao conteúdo. Expansores SHALL informar seu estado. Mudanças de etapa ou página e avanço de questão SHALL posicionar o foco no conteúdo de destino; cancelar uma confirmação SHALL devolvê-lo ao acionador. Não SHALL haver armadilha de foco.

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

### Requirement: Contraste e estados compreensíveis
Nas superfícies reorganizadas, o sistema MUST atender contraste AA: 4,5:1 para texto comum, 3:1 para texto grande e 3:1 para componentes e indicadores visuais essenciais, incluindo foco. Seleção, recomendação, bloqueio, domínio, acerto, erro e indisponibilidade SHALL ter identificação textual, sem depender somente de cor ou ícone. Progresso SHALL ter nome e valor acessíveis.

#### Scenario: Compreender estados sem cores
- **WHEN** o Aluno consulta a trilha e responde uma questão sem distinguir as cores da interface
- **THEN** reconhece por texto o tópico recomendado, os tópicos bloqueados e dominados, a alternativa selecionada, o resultado e a alternativa correta quando houver erro

#### Scenario: Conferir contraste dos componentes
- **WHEN** os pares de cores de texto, controles e foco das superfícies reorganizadas são medidos
- **THEN** cada par essencial atende à razão de contraste correspondente, inclusive nos estados selecionado e de feedback

### Requirement: Adaptação à largura nas telas abrangidas
A entrada, a navegação compartilhada e as telas do aluno SHALL funcionar a 360 px de largura CSS sem rolagem horizontal, corte de conteúdo essencial ou sobreposição de controles. Textos longos SHALL quebrar dentro dos componentes e ações SHALL continuar acessíveis. Redimensionar SHALL preservar a seleção da questão e o feedback presente. Painéis e formulários específicos dos demais perfis ficam fora deste requisito de reorganização.

#### Scenario: Usar a experiência a 360 px
- **WHEN** o usuário percorre entrada, Minhas turmas, catálogo, detalhe, trilha, materiais, desempenho e sessão a 360 px
- **THEN** lê os dados e aciona os controles sem rolagem horizontal da página ou dos cartões, inclusive com nomes acadêmicos e alternativas longos

#### Scenario: Redimensionar durante o estudo
- **GIVEN** alternativa selecionada ou feedback presente na sessão
- **WHEN** a largura muda entre desktop e celular
- **THEN** a seleção ou o feedback permanece e nenhuma resposta adicional é registrada
