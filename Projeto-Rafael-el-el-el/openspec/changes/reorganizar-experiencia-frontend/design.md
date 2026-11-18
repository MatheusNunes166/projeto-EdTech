# Design

## Context

A motivação está em [proposal.md](proposal.md). A base funcional é `prototipo/`, com React, TypeScript, React Router e persistência local acessada pelo repositório. As specs consolidadas representam graduações, disciplinas e turmas por período, com estudo e gamificação separados por matrícula.

Leitura que fundamenta as decisões:

- `../../../../index.html`, relativo a esta change: superfícies claras, bordas discretas, cabeçalho curto, questão em coluna principal e composição com coluna secundária. Sua troca de perfis fixos, matrícula direta, modelo por curso, controles expostos e regras de renderização não serão transportados ao React. As fontes externas e o tema escuro da prova de conceito também não são necessários para esta entrega.
- `Entrada.tsx` lista pessoas ativas antes da escolha de função e usa `areaInicial`, que escolhe a primeira função na ordem canônica. `Layout.tsx` já distingue áreas, oferece navegação por função e troca de área na mesma conta; os controles da demonstração ficam sempre expostos.
- `MinhasTurmas.tsx` combina `consultarMinhasTurmas` e `consultarPainelAluno`. Os indicadores já oferecem `totalRespostas`, `concluido` e progresso exato por `matriculaId`.
- `Trilha.tsx` já recebe contexto, estados dos tópicos, progresso, gamificação e `proxima` em `consultarTrilha`. A recomendação visual pode usar o `topicoId` dessa próxima atividade, sem recriar a seleção adaptativa.
- `Sessao.tsx` já mantém atividade, alternativa selecionada e resultado em estado local; isso conserva a questão respondida quando o comando invalida as consultas. `ResultadoResposta` já contém feedback, domínio, XP, revisão, desbloqueios, conquistas e conclusão.
- `Consulta`, `MensagemErro`, `BarraProgresso`, `EtiquetaDificuldade`, `Vazio`, `useAlvoDaRota` e `caminhoTurma` são pontos existentes de reaproveitamento. Os testes de `src/testes/` cobrem entrada, restauração, isolamento de matrículas e fluxos de estudo.

## Goals / Non-Goals

**Goals:**

- Resolver a hierarquia na camada de apresentação, com uma ação principal por contexto e detalhes disponíveis sob demanda.
- Reutilizar os contratos autorizados existentes; usar identidades de matrícula e turma em todos os destinos, sem agrupamento de estado por disciplina.
- Fazer a mudança por pequenos incrementos verificáveis, isolando estilos das telas do aluno e preservando os painéis dos demais perfis.

**Non-Goals:**

- Alterar motor, regras de domínio, publicação, autorização, matrícula, XP, sequência, conquistas ou contratos de armazenamento.
- Criar servidor, autenticação real, novas dependências, novas rotas acadêmicas ou um segundo aplicativo a partir do HTML.
- Persistir função selecionada na entrada, abertura de painéis ou outras preferências visuais. A sessão existente continua válida ao recarregar; voltar à entrada sem sessão começa pela escolha de função.
- Refazer o conteúdo específico dos painéis e formulários de outros perfis. O catálogo, os materiais e o desempenho do aluno recebem ajustes de integração e largura, preservando seus fluxos.

## Decisions

### D1 — Composição clara com componentes React existentes

Adotar fundo claro, cartões brancos com borda fina e raio próximo dos 10 px já usados, títulos em tinta escura e azul como destaque da ação principal. Usar a pilha de fontes de sistema atual e espaçamento consistente de 8, 12, 16 e 24 px. Texto secundário deve continuar legível e atender contraste; estados não serão representados só por opacidade.

O conteúdo poderá ocupar até cerca de 1180 px, centralizado, com 24 px de margem interna no desktop e 16 px em telas estreitas. O cabeçalho terá conteúdo curto e altura natural, sem fixação que esconda foco ou questão. Cartões terão títulos, contexto, estado e ações nessa ordem; não será acrescentada uma grade de indicadores acima da ação de estudo.

Reaproveitar e, quando necessário, compor componentes de contexto acadêmico, ação principal e expansor. Classes de layout específicas de entrada, trilha e sessão devem limitar efeitos sobre `cartao`, `indicadores`, tabelas e formulários globais. Ajustes globais ficam restritos aos tokens, foco e navegação compartilhada compatíveis com todos os perfis.

Alternativas consideradas: copiar a página inteira exigiria perder o modelo acadêmico atual; manter todos os indicadores no primeiro plano conservaria a concorrência visual. A composição proposta usa o HTML como referência e os componentes React como base de manutenção.

### D2 — Função é contexto de entrada, não identidade ou permissão

Na entrada sem sessão, carregar `listarPessoasEntrada`, que já retorna somente `id`, `nome` e `funcoes` de pessoas ativas. Derivar as funções disponíveis usando `FUNCOES` e os rótulos existentes; uma função sem candidatos ativos não aparece como disponível. Não consultar cadastros administrativos para montar a entrada.

O primeiro passo contém título, aviso de demonstração sem senha e botões de função. O segundo mostra a função escolhida, a lista filtrada de pessoas e **Voltar às funções**. Selecionar função não inicia sessão. Escolher outra função limpa seleções e mensagens da etapa anterior; carregamento, lista vazia por atualização e falha têm estados explícitos.

Ao selecionar uma pessoa, usar `entrar(id)` e conferir as funções retornadas antes de navegar para `AREA_DA_FUNCAO[funcaoEscolhida]`. Se a função tiver sido removida nesse intervalo, encerrar a entrada recém-iniciada, atualizar candidatos e informar indisponibilidade, sem navegar para área indevida. Uma pessoa desativada continua rejeitada pelo repositório. Para sessão já aberta e válida, manter o redirecionamento atual; a escolha de função vale para uma nova entrada.

Carla entra na Coordenação quando essa é a escolha, mesmo se Professor vier primeiro na ordem canônica. O seletor **Áreas da pessoa** permanece disponível com todas as funções válidas da mesma identidade; trocar de área não modifica vínculos nem exige sair. `areaInicial` continua sendo o fallback para sessão já existente ou redirecionamentos protegidos. Remoção de função ou vínculo continua tratada pelo fluxo de revogação existente.

Alternativa considerada: registrar uma nova sessão por função criaria um conceito de autorização desnecessário. A seleção será estado transitório de apresentação; a autorização continua função–vínculo a cada consulta e comando.

### D3 — Cabeçalho, localização e Demonstração

Reorganizar `Layout.tsx` em cabeçalho curto com marca, navegação da área e pessoa; mostrar sempre a área atual e oferecer acesso às outras áreas quando existirem. Manter todos os itens do menu atual, inclusive gestão e cadastros administrativos. **Sair** permanece diretamente acessível.

O item de navegação principal identifica sua seção de origem, e a página interna mostra um título ou caminho textual específico: **Trilha**, **Sessão de estudo**, **Materiais** ou **Desempenho**. Usar `NavLink` e indicação de página atual acessível, sem marcar todos os links do caminho como páginas atuais. Na área do aluno, Minhas turmas abrange trilha e estudo; Catálogo abrange seus detalhes. Nas outras áreas, mapear os destinos existentes sem refazer seus painéis.

**Demonstração** será um expansor nativo `details/summary`, inicialmente fechado, com data simulada, **Simular próximo dia** e `Restauracao`. A entrada terá o mesmo agrupamento, contendo somente a restauração permitida sem sessão. O estado aberto pode durar enquanto o componente estiver montado, mas não é persistido; atualizar um indicador não deve fechar um agrupamento em uso.

Reutilizar os comandos de data e restauração com a revisão atual, suas mensagens de erro e invalidação de consultas. A confirmação da restauração continua explícita, com título e aviso de perda de dados e encerramento de sessão. Pode permanecer como região de confirmação na página, com foco no título ao abrir e retorno ao acionador ao cancelar, sem convertê-la em um modal que exija nova biblioteca. O aviso inicial de dados incompatíveis, controlado pelo provedor, permanece fora dos detalhes e aparece antes da substituição.

No celular, marca, pessoa e ações podem quebrar em linhas; menus quebram por item, sem faixa com rolagem horizontal. Nomes longos quebram e a navegação não sobrepõe conteúdo.

Alternativa considerada: manter uma barra de demonstração sempre aberta ocupa espaço em todas as telas. O expansor oferece acesso previsível sem disputar atenção com o estudo.

### D4 — Minhas turmas orientada à próxima ação

Cada cartão mostra disciplina como título; graduação, turma e período no contexto; progresso acompanhado de estado textual; uma ação principal e **Desempenho** secundário. Usar `matriculaId` para associar os indicadores à oferta.

| Condição autorizada da oferta | Estado visível | Ação principal | Destino |
| --- | --- | --- | --- |
| Conteúdo indisponível ou em rascunho | Conteúdo em preparação | Nenhuma ação de estudo | Nenhum |
| Indicadores carregando ou com erro | Carregando ou mensagem de erro | Aguardar indicadores | Nenhum rótulo de estado presumido |
| `concluido` verdadeiro | Trilha concluída · 100% | Ver trilha | Trilha da matrícula |
| Não concluída e `totalRespostas === 0` | Sem atividade · 0% | Começar trilha | Trilha da matrícula |
| Não concluída e `totalRespostas > 0` | Em andamento · progresso próprio | Continuar trilha | Trilha da matrícula |

A conclusão tem precedência sobre o número de respostas e depende do estado fornecido, não de comparar uma porcentagem arredondada com 100. Progresso de 0% com respostas é estudo em andamento: o indicador mede tópicos dominados, não questões respondidas. Os três verbos levam à trilha para dar orientação antes da sessão; abrir uma tela não grava respostas.

Preservar o estado vazio com orientação de matrícula pela coordenação ou administração. O catálogo mantém a ação **Continuar** nas ofertas matriculadas e não terá automatrícula. No desempenho, continuar exibindo todos os indicadores existentes e a distinção de atividade baseada em `totalRespostas`, sem recalcular taxas no componente.

Alternativa considerada: inferir início por XP ou progresso falha quando há somente erros ou ainda não há tópicos dominados. Os indicadores existentes permitem a distinção sem novo campo persistido.

### D5 — Trilha com recomendação derivada da próxima atividade

Ordem de leitura: retorno a Minhas turmas, identificação acadêmica, progresso e estado da trilha, próximo passo com ação **Estudar**, tópicos ordenados e acessos complementares. Em conclusão, substituir a ação de estudo pela mensagem de conclusão sem aprovação acadêmica. Se `proxima` for nula sem conclusão, informar indisponibilidade de questões, sem recomendação fictícia.

Comparar cada `topicoId` com `proxima.topicoId` para identificar **Próximo recomendado**. Preservar a ordem cadastrada, exibir domínio de 0 a 100 e os estados **Bloqueado**, **Desbloqueado** e **Dominado**. A recomendação acrescenta destaque ao estado; não reordena tópicos nem oferece escolha manual de questão ou tópico de estudo. O link **Estudar** usa a sessão da matrícula, que consulta novamente o motor autorizado; alterações externas podem atualizar a recomendação sem que a UI mantenha um alvo antigo forçado.

Materiais permanecem vinculados somente aos tópicos liberados, inclusive dominados, e **Desempenho** permanece uma ação secundária da turma. Não incluir enunciados na visão da trilha.

XP e sequência aparecem em uma linha compacta associada à oferta. Um `details` **Conquistas (N)** fica fechado inicialmente; ao abrir, mostra nomes e datas fornecidos ou **Nenhuma conquista ainda**. Não acrescentar conquistas pendentes fictícias ou totais entre turmas.

Alternativas consideradas: ordenar visualmente pelo menor domínio esconderia a sequência pedagógica; recalcular a recomendação nas telas duplicaria critérios do motor. A projeção `proxima` já fornece a referência necessária.

### D6 — Sessão com foco na questão e estado estável

No desktop, a partir de 900 px, usar grade com coluna principal flexível e coluna de contexto de aproximadamente 280 px, intervalo de 20 a 24 px. O cartão da questão sempre ocupa a maior coluna. A coluna principal contém tópico, dificuldade, enunciado, alternativas e **Responder**; o feedback vem logo depois da questão, na mesma coluna. Manter um título de página **Sessão de estudo** e a hierarquia semântica do enunciado.

A coluna secundária contém exclusivamente disciplina, turma, período, progresso da matrícula e **Ver trilha**. Não terá graduação, professor, XP, sequência, conquistas, tópicos ou materiais; o contexto acadêmico completo continua na trilha, acessível pelo link. Os avisos de XP e conquistas decorrentes da resposta continuam no feedback, conforme as regras atuais.

Abaixo de 900 px, remover a coluna lateral e mostrar o mesmo resumo como faixa compacta acima da questão. Ela pode quebrar em poucas linhas e deve conservar todos os seus campos, sem virar um grande cartão de indicadores. Abaixo de 640 px, alternativas ficam em uma coluna; em larguras maiores, podem ocupar duas colunas iguais quando o texto couber. Não limitar a duas ou quatro alternativas: renderizar todas as alternativas fornecidas, na ordem original.

Preservar `fieldset`, `legend`, entradas de rádio e botão **Responder**. Seleção não envia resposta; o botão fica indisponível sem seleção e durante envio. Um envio válido bloqueia novos envios da mesma questão; falha mantém a seleção e a mensagem de erro. Identificar seleção, alternativa correta e escolha incorreta com texto acessível, além das cores.

Manter atividade apresentada, seleção e resultado no estado local da sessão atual. Uma atualização de consultas não substitui a questão respondida por `proxima`. Não atrelar o estado a chaves que mudem ao redimensionar ou atualizar progresso. No feedback, conservar explicação, domínio anterior e atual, variação, XP aplicável, desbloqueios, novas conquistas e conclusão. Depois do segundo erro no mesmo tópico, preservar o link para materiais e **Continuar mesmo assim**. Nos demais casos não concluídos, usar **Próxima questão**; na conclusão, **Ver trilha**.

O avanço explícito limpa o resultado e a seleção e apresenta a próxima atividade da consulta atualizada, mantendo as validações de contexto e revisão do comando. Ao navegar para materiais, trilha ou outra tela, o estado local pode ser descartado como hoje; não será criada persistência de sessão parcial ou feedback entre páginas. O histórico já gravado permanece.

Alternativas consideradas: mover todos os indicadores da trilha para a lateral da sessão repetiria a densidade atual; derivar a questão diretamente da consulta a cada render apagaria o feedback após responder. O resumo restrito e o estado local existente atendem aos dois casos.

### D7 — Acessibilidade integrada à composição

Usar elementos nativos e nomes acessíveis. Ordem de foco sem `tabindex` positivo, link **Pular para conteúdo**, `main` com destino de foco e títulos hierárquicos. Ao mudar a etapa de entrada ou a página, direcionar foco ao título correspondente; ao avançar questão, ao enunciado. Expandir detalhes conserva foco no `summary`; feedback usa anúncio educado, sem deslocar foco inesperadamente; erros usam a mensagem acessível existente.

Medir contraste para texto, foco, controles e estados, com os limites da spec `navegacao-acessivel`. A porcentagem pode ficar ao lado da barra para evitar texto com contraste variável sobre o preenchimento, preservando nome e valor acessíveis de `BarraProgresso`. Status, seleção e correção precisam de texto e não só cor, ícone ou decoração.

Aplicar `min-width: 0` às colunas, quebra de palavras longas e larguras flexíveis, sem mínimos maiores que o espaço útil. A 360 px, verificar também catálogo, detalhe, materiais e desempenho, incluindo filtros e textos longos. Não usar `overflow-x: hidden` para mascarar conteúdo cortado. Reduzir animações se houver preferência de movimento reduzido.

Alternativa considerada: controles customizados exigiriam implementar novamente teclado e semântica já oferecidos por links, botões, rádio e `details`.

### D8 — Reaproveitamento e invariantes de dados

| Superfície | Dados e componentes reaproveitados | Limite preservado |
| --- | --- | --- |
| Entrada | `listarPessoasEntrada`, `entrar`, `FUNCOES`, `AREA_DA_FUNCAO` | Atividade e funções verificadas; função escolhida não cria vínculo |
| Cabeçalho e Demonstração | `Layout`, `Restauracao`, consultas/comandos de data, contexto de aplicação | Mesmas permissões, revisões, confirmação e tratamento de falha |
| Minhas turmas | `consultarMinhasTurmas`, `consultarPainelAluno`, `BarraProgresso` | Associação por matrícula e conteúdo disponível |
| Trilha | `consultarTrilha`, contexto acadêmico, `proxima`, estados e gamificação | Motor único; materiais respeitam desbloqueio |
| Sessão | `useAlvoDaRota`, `caminhoTurma`, `responderQuestao`, `ResultadoResposta` | Alvo autorizado, ordem original de alternativas e estado local |
| Desempenho e materiais | Consultas e telas atuais, `Consulta`, `MensagemErro`, `Vazio` | Mesmo escopo, indicadores e bloqueios |

Todos os estados derivam do repositório; telas não leem `localStorage` diretamente, não recalculam domínio/XP e não acessam históricos para adivinhar se houve atividade. Mantêm-se `RotaProtegida`, validações do alvo aninhado e invalidação por mudança de pessoa, revisão ou outra aba. Não mostrar dados anteriores durante recarga de consulta ou após revogação.

Os deltas modificam somente os requisitos listados. Todo o restante das sete specs consolidadas continua válido: estrutura acadêmica, autoria/publicação, proteção do histórico, matrículas administrativas, progressos exatos e regras de aprendizagem e gamificação. A nova capacidade `navegacao-acessivel` concentra o contrato de navegação e acessibilidade; não substitui capacidades acadêmicas.

## Risks / Trade-offs

- **Estilos globais afetarem outros perfis** → Usar classes de layout específicas e verificar menus e fluxos dos cinco perfis; não reorganizar seus painéis ou formulários.
- **Dados parciais exibirem Começar trilha indevidamente** → Aguardar indicadores autorizados por matrícula e tratar falha como erro, sem substituir por zero.
- **Entrada cumulativa ignorar a função escolhida** → Navegar pela função selecionada somente após conferir a pessoa retornada; manter os testes de Carla e de revogação.
- **Recomendação divergir da sessão após atualização externa** → Usar a próxima atividade fornecida em cada consulta, sem impor um tópico no endereço nem duplicar o motor.
- **Feedback desaparecer com nova consulta ou layout** → Preservar o estado local de atividade e resultado; testar resposta, atualização, redimensionamento e avanço explícito.
- **Detalhes recolhidos perderem descobribilidade** → Manter rótulos textuais Demonstração e Conquistas (N), estado acessível e foco visível.
- **Listas longas e conteúdo de questão variarem em tamanho** → Não fixar alturas; aceitar rolagem vertical, testar textos longos e alternativas em quantidade variável a 360 px.

## Migration Plan

Esta etapa cria somente artefatos OpenSpec. Após revisão, implementar conforme `tasks.md`, começando pela base visual e navegação e avançando para entrada, turmas, trilha e sessão.

Não há migração de dados: manter versão do documento, chaves de armazenamento e seed acadêmico. Carregar dados compatíveis existentes sem aviso novo, restauração automática ou perda de histórico. O aviso de dados já incompatíveis permanece no fluxo atual.

Para verificar, usar fixtures de interface para estados adicionais, mantendo a demonstração original. Executar testes direcionados a cada etapa e, ao concluir, `npm test` e `npm run build` em `prototipo/`, além das verificações em navegador registradas nas tarefas. A suíte em DOM não prova contraste, foco visual ou ausência de rolagem horizontal; esses critérios exigem inspeção em navegador com evidência das larguras.

Reversão consiste em reverter os arquivos de apresentação, navegação e testes alterados pela implementação, sem restaurar o armazenamento. Respostas válidas registradas durante a demonstração continuam pertencendo às matrículas existentes. Esta change não será arquivada nem aplicada durante a revisão dos documentos.
