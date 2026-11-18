# Design

## Context

Ver `proposal.md`, especialmente o mapa das 25 rotas, para motivação, alcance e distinção entre informação imediata e detalhe. Este documento define a implementação futura das oito specs desta change; não altera seus contratos de produto.

- O aplicativo usa React 18, TypeScript, CSS próprio e React Router 6. A inicialização em `prototipo/src/main.tsx` usa `BrowserRouter`; `app/Rotas.tsx` reúne as 25 rotas e os fallbacks, com `RotaProtegida` por função. `app/areas.ts` já resolve área e seção atuais.
- `Layout.tsx` reúne navegação, conta e Demonstração, mas mantém uma barra adicional de áreas. `componentes/comuns.tsx` já contém consulta, mensagens, campos, progresso e foco. `estilos.css` combina regras globais e regras específicas do aluno; uma alteração global indiscriminada pode afetar formulários e estados já verificados.
- `useConsulta`/`useComando`, em `app/contexto.tsx`, revalidam acesso e atualizam consultas. Identidade, parâmetros e eventos de outra aba invalidam o retrato anterior. O editor atual fica dentro de `Consulta` e usa chave disciplina–revisão; remontagens podem perder alterações locais. A sessão do aluno já conserva seleção e feedback durante reautorização, ocultando conteúdo suspenso.
- `ConteudoEditavel` ainda não fornece os metadados de proteção necessários para explicar bloqueios antes de um comando. O painel da coordenação recebe médias com IDs dos tópicos, sem seus títulos; hoje exibe valores concatenados. São necessárias pequenas extensões de leitura, não novas regras ou novos dados persistidos.
- A referência visual é `../index.html`, na raiz do repositório. Seu cabeçalho, superfícies claras e hierarquia da atividade orientam este design; seus dados por curso, fontes remotas e funcionalidades não substituem o modelo acadêmico React.
- `reorganizar-experiencia-frontend` está implementada com 31/31 tarefas, mas ainda não consolidada. Sua documentação registra os fluxos do aluno e verificações anteriores. Esses resultados são referência de regressão, não validação desta futura implementação.

## Goals / Non-Goals

**Goals:**

- Compor o frontend existente com padrões reutilizáveis de página, lista, edição e acompanhamento, mantendo a tarefa principal reconhecível nas cinco funções.
- Separar estado transitório de interface dos dados autorizados e preservar rascunho, seleção e feedback quando apenas a apresentação ou uma consulta mudar.
- Tornar verificáveis a adaptação a 1280 px e 360 px, a navegação por teclado, os resultados de comandos e os limites de acesso.

**Non-Goals:**

- Não mudar motor, fórmulas, esquema ou chaves de armazenamento, seed, permissões, operações acadêmicas ou regras de conteúdo. Não introduzir autenticação, servidor, biblioteca visual ou persistência de preferências.
- Não fazer salvamento por item, autosave, mesclagem automática de conflitos ou recuperação de rascunho após encerramento forçado do navegador.
- Não acrescentar exclusões acadêmicas inexistentes nem conceder autoria pedagógica à Coordenação.

## Decisions

### D1 — Identidade visual clara com tokens próprios

Manter a marca **Trilha Adaptativa**, com títulos escuros, fundo neutro e azul reservado à ação principal, links, foco e seleção. Reaproveitar os nomes dos tokens atuais, completando-os para separar borda decorativa de contorno funcional. Não carregar fontes, ícones ou imagens de terceiros.

| Uso | Valor definido | Aplicação |
| --- | --- | --- |
| Fundo / superfície | `#eef2f5` / `#ffffff` | Fundo da página e painéis |
| Texto principal / secundário | `#13202a` / `#566874` | Conteúdo e metadados legíveis |
| Destaque / hover | `#2a55d4` / `#2448a8` | Botão principal com texto branco; links |
| Seleção suave | `#dfe7fb` | Linha ou opção selecionada com texto escuro/azul |
| Borda decorativa / funcional | `#d3dce3` / `#747e91` | Separadores versus campos, seleção e contorno de progresso |
| Sucesso | `#176540` sobre `#dcf1e7` | Texto e aviso de sucesso, sempre com rótulo |
| Erro | `#b42318` sobre `#fdecea` | Erro de campo, resposta e ação recusada |
| Atenção | `#805000` sobre `#fff4d6` | Edição pendente, revisão e avisos |
| Foco | `#2448a8`, 3 px e afastamento de 3 px | Controles, links e destinos de foco |

As combinações nominais calculadas nesta etapa dão, respectivamente: texto principal/branco 16,57:1; secundário/fundo 5,14:1; branco/destaque 6,27:1; sucesso 5,98:1; erro 5,75:1; atenção 6,25:1; contorno funcional/fundo 3,63:1; foco/branco 8,18:1. Essas contas não dispensam medir os pares efetivamente renderizados, inclusive hover, seleção, bloqueio e feedback. Não reduzir opacidade de um grupo inteiro para indicar bloqueio; manter texto e motivo legíveis. Bordas decorativas não serão a única identificação de um controle.

Tipografia: `system-ui, -apple-system, 'Segoe UI', sans-serif`; corpo e campos de 16 px, metadados e rótulos de 14 px, entrelinha de 1,5. H1 de 28 px no desktop e 24 px no celular; H2 de 22/20 px; enunciado de 24/22 px, com entrelinha de 1,4. Usar pesos 400, 600 e 700, números tabulares nos indicadores e fonte monoespaçada somente quando o próprio material precisar. Não fixar altura de títulos nem truncar identidade acadêmica com reticências.

**Justificativa e alternativa:** a paleta deriva da referência, ajustando cores de estado para contraste. Fontes de sistema mantêm funcionamento local e eliminam dependência de download; importar as fontes do HTML acrescentaria uma condição externa sem resolver as jornadas.

### D2 — Espaçamento, largura e hierarquia

Usar escala de 4, 8, 12, 16, 24, 32 e 48 px. A página terá largura máxima de 1180 px, centralizada, com 24 px de margem interna no desktop e 16 px em telas estreitas; a 360 px, o espaço útil mínimo de referência é 328 px. Separar seções por 32 px, painéis por 24 px, campos por 16 px e controles relacionados por 8–12 px. Painéis terão 24 px de preenchimento no desktop e 16 px no celular; linhas de gestão, 12 px verticais e 16 px horizontais. Raios de 10 px nos painéis e 8 px nos controles; borda fina e sem sombra de cartão sobre cartão.

Ordem comum: retorno específico → título e contexto → ação principal ou seletores → conteúdo/lista → detalhe/edição escolhido → resultado junto da operação. Cartões continuam úteis para ofertas do aluno e grupos de acompanhamento. Cadastros, vínculos e bancos de itens usam linhas alinhadas dentro de uma superfície, com separadores, em vez de cartões aninhados.

Campos de código e data têm largura preferencial de 12–18 caracteres; nome e e-mail, até a largura da coluna; descrição, enunciado e explicação ocupam a coluna disponível. Textareas de enunciado/explicação começam com pelo menos seis linhas e permitem expansão vertical. Em 360 px, todos respeitam `max-width: 100%`, inclusive selects; radio e checkbox mantêm tamanho natural e ficam junto do rótulo. Controles terão área de interação mínima de 44 px, sem altura fixa que corte texto.

Abaixo de 1024 px, listas com editor lateral passam a um único fluxo; ao editar, o painel selecionado substitui a área visual da lista e oferece **Voltar à lista**, sem desmontar o estado. A sessão conserva seu ponto de mudança em 900 px e alternativas empilhadas abaixo de 640 px. Colunas usam mínimos flexíveis e quebra de palavras/URLs; não usar `overflow-x: hidden` como correção de conteúdo cortado. Não fixar cabeçalho ou rodapé de ações sobre conteúdo/foco.

**Justificativa e alternativa:** espaços explícitos distinguem grupos sem multiplicar caixas. Um formulário permanente para cada registro ou uma tabela larga com rolagem da página manteria os problemas atuais. Os pontos de mudança são escolhas de layout; os contratos de aceitação continuam sendo 1280 px e 360 px.

### D3 — Navegação por função e proteção das transições

Manter as URLs do mapa da proposta e os fallbacks atuais. O cabeçalho mostra marca, área/seção, acesso às seções, conta e Demonstração, sem a barra permanente de troca de áreas. Em desktop, Aluno mostra Minhas turmas e Catálogo, Professor mostra Minhas turmas e Coordenação mostra Painel, Gestão e Cadastros. A Administração usa um expansor **Seções**, evitando comprimir seus seis destinos em uma linha. Abaixo de 900 px todos usam **Menu**, inicialmente fechado, em fluxo normal sob o cabeçalho. Área e seção ficam visíveis fora do expansor.

**Conta** ocupa a mesma posição relativa em todas as áreas, identifica a pessoa e reúne as áreas válidas e Sair; no celular seu acionador permanece junto de Menu. Demonstração é um expansor separado da conta: no desktop junto ao cabeçalho e no celular dentro da região de Menu, com seus controles recolhidos. Na entrada continua acessível com apenas a restauração autorizada. A abertura do menu não abre Demonstração. O aviso inicial de incompatibilidade permanece fora desses agrupamentos, visível antes de qualquer substituição. Nomes longos quebram naturalmente; o cabeçalho pode crescer sem virar várias barras de navegação independentes.

| Função | Seções e origem das páginas internas | Retornos específicos |
| --- | --- | --- |
| Aluno | Minhas turmas; Catálogo | Sessão, materiais e desempenho → trilha da matrícula; trilha → Minhas turmas; detalhe → Catálogo |
| Professor | Minhas turmas | Aluno → painel da turma; painel → turmas; conteúdo → origem docente autorizada |
| Coordenador | Painel; Gestão; Cadastros | Indicadores → gestão da mesma turma → indicadores com seleção preservada |
| Administrador | Visão geral; Pessoas; Vínculos; Graduações e disciplinas; Períodos e turmas; Matrículas e docentes | Gestão → lista de ofertas; conteúdo → Graduações e disciplinas |
| Responsável | Acompanhamento | Aluno/oferta identificados na própria página, sem rotas ou ações administrativas |

Reaproveitar `localizacaoDaPagina`, `NavLink` e os nomes de função. Só um destino principal recebe `aria-current="page"`. A área depende do caminho, não da primeira função da conta; o retorno do editor administrativo deve continuar administrativo mesmo se a pessoa também for Professor. Abrir/fechar expansores não altera dados. Escape fecha o expansor em uso e devolve foco ao acionador.

Para bloquear navegação com edição pendente, adaptar a inicialização para `createBrowserRouter`/`RouterProvider`, já disponíveis na dependência instalada, com rota de entrada `*` que hospeda `Rotas`; as rotas descendentes e seus guardas permanecem. Migrar o helper de testes para `createMemoryRouter` com a mesma composição. Isso permite `useBlocker` para links, navegação programática e Voltar/Avançar internos. Um único guardião de rascunho ativo no editor decide entre permanecer e prosseguir, sem substituir o mecanismo de autorização.

Sair e restauração têm efeitos antes da navegação: consultar o guardião antes de executar Sair; uma restauração confirmada deve explicitar também a perda do rascunho e não gerar uma segunda confirmação de descarte após apagar os dados. Cancelar não executa os efeitos. Redirecionamentos por sessão inválida ou revogação não podem ficar presos no bloqueador: suspendem a edição, removem dados restritos e liberam o encaminhamento seguro. Fechamento forçado do navegador segue a limitação registrada na proposta.

**Justificativa e alternativa:** um wrapper de Link não cobre Voltar/Avançar nem efeitos de Sair. Usar o bloqueador já instalado exige adaptar bootstrap e testes, mas mantém o roteamento em uma única infraestrutura; não exige biblioteca nova nem interceptação manual de `window.history`.

### D4 — Componentes de interação e contratos mínimos de leitura

Evoluir os componentes atuais e extrair composições pequenas: cabeçalho de página com contexto, lista de registros, painel de edição selecionado, estado de consulta e confirmação. Preservar `BarraProgresso`, `MensagemErro`, `Campo` e o foco de página; completar associação de erros por `aria-describedby`/`aria-invalid`, rótulos de campos e nomes das ações repetidas. Não construir um segundo sistema de formulários ou uma abstração de repositório nas telas.

Listas extensas usam `ul/li` com áreas de identificação, metadados e ações em CSS grid: colunas alinhadas no desktop; pares rótulo–valor em `dl` e ações abaixo no celular. Há um único conjunto de controles montado por registro. Comparações simples, como tópico e domínio, podem usar tabela nativa de duas colunas com caption. Não duplicar formulários desktop/mobile nem ocultar dados essenciais para fazer uma tabela caber.

Criar/editar abre um painel em fluxo, lateral quando houver espaço; o estado do formulário fica no proprietário da página. Nos cadastros, salvar envia o comando atual; erro recuperável mantém campos; sucesso atualiza a lista, identifica o registro e fecha a edição. Cancelar fecha a edição escolhida; o editor pedagógico permanece aberto após salvar e segue o estado conjunto e a proteção específica de D6. Botões por linha usam rótulos visuais curtos e nome acessível completo, como “Editar turma A de Algoritmos, 2026.2”.

Usar uma confirmação modal reutilizável baseada em `dialog` nativo para remoções, descarte e restauração, com título, contexto, efeito, Cancelar e ação específica. O foco inicial favorece Cancelar em ações destrutivas; Escape equivale a cancelar; fechar retorna ao acionador ou ao título da lista se esse registro deixou de existir. Em 360 px, o diálogo respeita a largura útil, rola verticalmente e mantém todas as ações alcançáveis. Somente uma confirmação pode ficar ativa; confirmação textual do conteúdo é parte do editor, não uma remoção genérica.

São necessárias três extensões somente de projeção, com testes de autorização e minimização:

- Em `consultarConteudoEditavel`, incluir proteção estrutural por estudo iniciado e indicação das questões já respondidas da disciplina. Derivar pelo estado real de todas as suas turmas dentro da consulta autorizada; devolver apenas flags/IDs dos itens já editáveis e motivo genérico, sem alunos, turmas de origem, contagens de respostas ou históricos. O frontend não deve tentar inferir isso consultando painéis de outras ofertas.
- Em `consultarIndicadoresCoordenacao`, incluir, por disciplina/oferta autorizada, a correspondência mínima entre ID e título de tópico para rotular médias. Manter `MediasTurma` e seus cálculos; não usar acesso ao banco de questões ou ao histórico para obter títulos.
- Em `consultarEstruturaAdministravel`, indicar identidade protegida das disciplinas e turmas do escopo quando já houver matrícula ou resposta, para explicar campos de transferência bloqueados. Devolver apenas a indicação necessária, sem anexar alunos, respostas ou conteúdo pedagógico ao cadastro.

Os comandos existentes continuam conferindo função, vínculo, pessoa ativa, revisão e candidato inteiro. As flags são informativas e podem ficar obsoletas; nunca autorizam uma alteração. Consultas ao catálogo continuam sem questões e gabaritos. Essas extensões não mudam esquema, versão, chave, seed ou documento persistido.

**Justificativa e alternativa:** `dialog` oferece modalidade e foco sem uma dependência; regiões improvisadas exigiriam gerenciar a interação de fundo. Metadados mínimos permitem explicar bloqueios e médias; distribuir o documento global ou derivar regras acadêmicas em componentes ampliaria exposição e divergências.

### D5 — Sessão e demais telas do Aluno

Reutilizar o estado estável já implementado em `Sessao.tsx`: atividade apresentada, seleção, resultado e bloqueio de envio ficam associados à matrícula. Redimensionamento, expansão do menu e atualização de indicadores não mudam a questão. A consulta continua suspendendo a exibição durante reautorização, e a recusa de acesso não deixa conteúdo antigo visível. Próxima questão consulta o motor novamente; somente essa ação troca a atividade e leva foco ao enunciado.

Preservar o resumo restrito à disciplina, turma, período, progresso e Ver trilha. O contexto precede a questão no DOM; CSS o posiciona à direita em desktop e acima no celular, sem duplicação. Feedback permanece após a questão, com anúncio educado e sem roubar foco. Selecionar não envia; responder bloqueia novo envio daquela questão; erro conserva seleção e não avança. Revisão sugerida, conclusão e avisos imediatos de gamificação seguem os contratos existentes.

Esboços estruturais; valores ilustrativos representam fixtures, não alterações do seed:

```text
SESSÃO — 1280 px
┌───────────────────────────────────────────────────────────────────────────┐
│ Trilha Adaptativa · Aluno / Sessão   Turmas  Catálogo   Conta ▾  Demo ▾    │
└───────────────────────────────────────────────────────────────────────────┘
  Sessão de estudo
┌────────────────────────────────────────────┐  ┌──────────────────────────┐
│ Vetores · Médio                            │  │ Algoritmos               │
│ Enunciado com espaço para leitura          │  │ Turma A · 2026.2         │
│ ○ Alternativa A      ○ Alternativa B       │  │ Progresso [─────] 50%   │
│ ○ Alternativa C      ○ Alternativa D       │  │ Ver trilha               │
│ [Responder]                                │  └──────────────────────────┘
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│ Resultado · explicação · domínio / XP      │  Apenas após resposta válida
│ [Próxima questão] ou revisão / Ver trilha  │
└────────────────────────────────────────────┘

SESSÃO — 360 px
┌───────────────────────────────┐
│ Trilha Adaptativa  Menu  Conta │
│ Aluno · Sessão de estudo      │
├───────────────────────────────┤
│ Algoritmos · A · 2026.2        │
│ Progresso 50% · Ver trilha     │
├───────────────────────────────┤
│ Vetores · Médio               │
│ Enunciado, sem corte          │
│ ○ Alternativa A longa         │
│ ○ Alternativa B longa         │
│ [Responder]                   │
├───────────────────────────────┤
│ Resultado e explicação        │
│ [Próxima questão]             │
└───────────────────────────────┘
```

Minhas turmas aplica os cartões de oferta com as três ações e os estados existentes, usando `totalRespostas` e `concluido`, sem inferência por XP ou porcentagem arredondada. Catálogo e detalhe usam busca/filtros identificados e linhas de oferta; manter Continuar somente nas matrículas permitidas. A trilha mantém ordem e próximo tópico do motor, com Conquistas (N) recolhidas, materiais e desempenho secundários. Materiais usam títulos/tipos e leitura em largura confortável; Desempenho usa contexto e indicadores já calculados. Todos os retornos carregam a mesma identidade de oferta, sem criar matrícula ou resposta por navegação.

**Justificativa e alternativa:** a implementação anterior já protege feedback e envio. Refazer o estado a partir de cada consulta para acompanhar o novo layout poderia apagar o resultado ou enviar novamente; alterar somente a composição preserva essas garantias.

### D6 — Editor docente: rascunho único e item selecionado

O proprietário do rascunho fica acima da renderização condicional de consulta e guarda pessoa, disciplina, original, revisão de origem, candidato completo, seção, item selecionado e confirmações textuais. Sua identidade não usa a revisão como chave de remontagem. Uma consulta atualizada só substitui original/candidato após primeiro carregamento, sucesso confirmado ou descarte explícito; falha, resize e troca de seção/item não reinicializam o rascunho.

Tópicos e materiais usa lista de tópicos; selecionar tópico mostra título e lista de materiais, e selecionar material abre sua edição. Banco de questões mostra enunciado resumido, tópico e dificuldade; somente a questão escolhida abre campos. Não criar limite fixo de quatro alternativas; manter a quantidade original e as operações já suportadas. Seleção de gabarito e texto de cada alternativa ficam na mesma linha lógica, com rótulos distintos e alinhamento superior para textos longos.

```text
EDITOR — 1280 px
┌───────────────────────────────────────────────────────────────────────────┐
│ Professor / Conteúdo                            Conta ▾  Demonstração ▾  │
└───────────────────────────────────────────────────────────────────────────┘
  Voltar às turmas · Conteúdo de Algoritmos
  SI · Publicada · Compartilhado entre turmas · Edição pendente
  [Tópicos e materiais] [Banco de questões]
┌────────────────────────┐  ┌──────────────────────────────────────────────┐
│ Questões      [+ Nova] │  │ Questão selecionada · Vetores · Médio        │
│ > Questão selecionada │  │ Enunciado [texto em múltiplas linhas       ] │
│   Outra questão       │  │ Tópico [       ]  Dificuldade [          ]  │
│   ...                 │  │ ○ Correta  Alternativa 1 [texto           ] │
│                       │  │ ● Correta  Alternativa 2 [texto           ] │
│                       │  │ Explicação [texto em múltiplas linhas     ] │
└────────────────────────┘  │ Motivo de bloqueio / diferença textual      │
                            └──────────────────────────────────────────────┘
  [Salvar alterações]  Descartar alterações    Publicar (se aplicável)

EDITOR — 360 px
┌───────────────────────────────┐
│ Professor / Conteúdo          │
│ Menu                    Conta │
├───────────────────────────────┤
│ Algoritmos · Publicada        │
│ Edição pendente               │
│ [Tópicos e materiais]         │
│ [Banco de questões]           │
│ Voltar à lista de questões    │
│ Enunciado [                 ] │
│ Tópico [                    ] │
│ Dificuldade [               ] │
│ ○ Correta · Alternativa 1     │
│   [Texto da alternativa     ] │
│ Explicação [                ] │
│ Motivo / revisão textual      │
│ [Salvar alterações]           │
│ Descartar alterações          │
└───────────────────────────────┘
```

Na largura estreita, Voltar à lista muda apenas a seleção visual. O conteúdo de ambas as seções permanece no mesmo candidato, inclusive tópicos novos referenciados por questões ainda não salvas. Há uma única ação **Salvar alterações** para o conjunto; Publicar usa a versão salva e informa sua indisponibilidade enquanto houver edição pendente. Remoções confirmadas de itens só afetam o rascunho até o salvamento.

As proteções retornadas em D4 explicam restrições junto a adicionar/remover/reordenar e aos campos de questão. A autoridade continua em `salvarConteudo`/`publicarConteudo` e nas regras atuais de `conteudo/regras-disciplina.ts`. As diferenças textuais usam as funções compartilhadas já existentes: original/proposto, confirmação do próprio autor, alteração exata e revisão de origem. Trocar seção não altera a confirmação; mudar a diferença ou a origem a invalida. Nunca apresentar uma confirmação genérica como permissão de trocar gabarito, dificuldade, identidade, tópico, ordem ou excluir questão respondida.

No conflito de revisão, manter candidato e original visíveis somente após revalidar acesso, mostrar que o salvamento foi recusado e exigir recarregar a origem antes de nova comparação; não promover a revisão do rascunho silenciosamente. Recarregar com edição pendente passa pela confirmação de descarte. Em falha recuperável de consulta/comando, reter o rascunho sem anunciar sucesso e oferecer nova tentativa. Em troca de pessoa ou acesso negado, suspender a exibição imediatamente, limpar o estado restrito e não bloquear o redirecionamento seguro para preservar uma edição sem autorização.

**Justificativa e alternativa:** separar formulários não pode separar a transação. Estados independentes por formulário, salvamento por seção e chaves baseadas na revisão causariam perda de rascunho ou quebra de cobertura. Estado local da disciplina mantém a edição conjunta sem criar persistência adicional.

### D7 — Listas administrativas, cadastros e gestão de turma

Pessoas começa pela lista de nome, e-mail administrativo, funções e situação; Nova pessoa ou Editar abre o painel escolhido. Vínculos separa Coordenação de Responsável–Aluno, com atribuições sob demanda e candidatos da consulta de finalidade apropriada; não usar toda a lista de pessoas como opções indiscriminadas. Visão geral usa resumos por categoria com links para as listas, sem formulários embutidos.

Graduações/disciplinas e períodos/turmas continuam em contextos distintos. Na rota de Cadastros da Coordenação, usar seleção entre esses dois grupos e suas listas, sem quatro formulários simultâneos ou múltiplos H1. Campos acadêmicos não incluem questões, materiais ou publicação; conteúdo tem acesso separado quando autorizado. Oferta com identidade protegida mostra motivo junto à disciplina/período, preservando renomeações válidas.

```text
LISTA DE GESTÃO — 1280 px, edição após escolher uma linha
┌───────────────────────────────────────────────────────────────────────────┐
│ Administração / Pessoas                           Seções ▾    Conta ▾    │
└───────────────────────────────────────────────────────────────────────────┘
  Pessoas e funções                                         [Nova pessoa]
┌───────────────────────────────────────┐  ┌───────────────────────────────┐
│ Nome / Funções / Situação    Ações     │  │ Editar Carla                  │
│ Ana · Aluno · Ativa         Editar    │  │ Nome [                       ]│
│ Carla · Prof./Coord. · Ativa Editar   │  │ E-mail [                     ]│
│ Marcos · Professor · Ativa  Editar    │  │ Funções [x] Professor         │
│ ...                                   │  │         [x] Coordenador       │
└───────────────────────────────────────┘  │ [Salvar pessoa]  Cancelar     │
                                          └───────────────────────────────┘

LISTA DE GESTÃO — 360 px, estado inicial e edição escolhida
┌───────────────────────────────┐     ┌───────────────────────────────┐
│ Administração   Menu   Conta  │     │ Administração   Menu   Conta  │
│ Pessoas e funções             │     │ Voltar à lista                │
│ [Nova pessoa]                 │     │ Editar Carla                  │
│ Carla Dias                    │     │ Nome [                       ]│
│ Funções: Prof., Coord.        │ ──→ │ E-mail [                     ]│
│ Situação: Ativa               │     │ [x] Professor                 │
│ Editar · Desativar            │     │ [x] Coordenador               │
│ ────────────────────────────  │     │ [Salvar pessoa]               │
│ Próximo registro...           │     │ Cancelar                      │
└───────────────────────────────┘     └───────────────────────────────┘
```

O painel lateral não existe antes da escolha da ação. Linhas usam o espaço para dados, não nomes inteiros repetidos nos rótulos visuais dos botões. Confirmações de remoção de vínculos identificam as duas partes e o escopo. Ativar/desativar continua sendo a operação atual, com resultado e estado textual; não se transforma em exclusão de pessoa.

Gestão de turma, compartilhada por Administração e Coordenação, inicia pela lista de ofertas e, no detalhe, mantém listas separadas de matriculados e professores. Só Matricular ou Atribuir professor abre candidatos; remoção docente usa D4. Guardar IDs reais da oferta consultada nos comandos, revisão e identidade pela sessão; confirmar não ignora mudanças posteriores de autorização. Repetições continuam idempotentes, com a mensagem atual de estudo preservado.

**Justificativa e alternativa:** composições comuns reduzem diferenças entre funções sem juntar suas permissões. Um cadastro monolítico com conteúdo pedagógico ou opções globais na Coordenação misturaria escopos que o repositório já separa.

### D8 — Acompanhamento contextualizado e seletores compatíveis

Professor percorre lista de ofertas → painel de turma → detalhe do aluno. No painel, apresentar resumo da oferta, quantidade de matriculados, progresso médio e lista de alunos; domínio médio por tópico fica em detalhe acessível. No detalhe do aluno, o domínio aparece antes de um histórico compacto; abrir uma resposta mostra o snapshot original completo, inclusive explicação, sem consultar a questão corrente.

Coordenação usa seletores de graduação, disciplina, período e turma derivados apenas das projeções autorizadas. Todos/Todas são filtros de linhas, não agregações. Ao mudar um seletor, limpar os IDs dependentes incompatíveis. Guardar os quatro critérios em parâmetros de busca da rota, sem `localStorage`, para preservar o retorno da gestão; revalidar parâmetros quando dados ou permissões mudarem. A ligação à gestão contém a turma concreta, e o retorno é construído para `/coordenacao` com critérios conhecidos, nunca uma URL arbitrária recebida do formulário. Acesso direto à gestão tem retorno à lista e pode construir Ver indicadores a partir da oferta autorizada, sem depender de histórico de navegação.

```text
PAINEL DE ACOMPANHAMENTO / COORDENAÇÃO — 1280 px
┌───────────────────────────────────────────────────────────────────────────┐
│ Coordenação / Painel                    Painel  Gestão  Cadastros  Conta │
└───────────────────────────────────────────────────────────────────────────┘
  Indicadores por turma
  Graduação [SI]  Disciplina [Algoritmos]  Período [2026.2]  Turma [Todas]
┌───────────────────────────────────────────────────────────────────────────┐
│ Algoritmos · Turma A · 2026.2      2 matriculados   Progresso médio: 40%   │
│ Médias incluem quem não iniciou   [Domínio por tópico ▾]   Gerir turma   │
├───────────────────────────────────────────────────────────────────────────┤
│ Outra oferta vazia                0 matriculados   Progresso: Sem dados │
│ Nenhum aluno matriculado          Domínio: Sem dados       Gerir turma   │
└───────────────────────────────────────────────────────────────────────────┘

PAINEL DE ACOMPANHAMENTO / COORDENAÇÃO — 360 px
┌───────────────────────────────┐
│ Coordenação     Menu    Conta │
│ Painel                        │
│ Graduação [SI               ] │
│ Disciplina [Algoritmos      ] │
│ Período [2026.2             ] │
│ Turma [A                   ] │
├───────────────────────────────┤
│ Algoritmos · A · 2026.2        │
│ Matriculados: 2               │
│ Progresso médio: 40%           │
│ Inclui quem não iniciou       │
│ Domínio por tópico ▾          │
│   Vetores: 40                 │
│   Matrizes: 0                 │
│ Gerir turma                   │
└───────────────────────────────┘
```

Não recalcular médias na interface. Continuar usando os valores exatos dos indicadores e `desempenho/apresentacao.ts` para arredondar somente a exibição; zero de matriculado sem estudo não equivale a Sem dados de turma sem alunos. Identificar cada tópico por título usando a extensão de D4. O caso 80% e 0% exibe 40%, independentemente de outras ofertas; manter as verificações existentes de 100/6, empate de meio ponto e ausência de média global.

Responsável usa seção por aluno, com ofertas identificadas imediatamente por disciplina, turma e período, progresso e última atividade. Sequência também fica legível; um expansor opcional mostra o contexto completo sem esconder a identidade e os indicadores exigidos no resumo. Não adicionar links a respostas ou colegas. Visão geral administrativa usa os mesmos componentes de resumo, mas permanece separada desse acompanhamento, inclusive em contas cumulativas.

**Justificativa e alternativa:** seleção contextual e retorno por IDs permitem gerir a turma que motivou a consulta. Concatenar médias sem nomes ou criar uma média dos resultados filtrados removeria seu significado e contrariaria as specs. Parâmetros de busca preservam navegação sem criar preferência persistida em armazenamento.

### D9 — Estados, acessibilidade e revalidação

| Estado | Apresentação e efeito |
| --- | --- |
| Carregando | Mensagem com `role="status"`; não preencher métricas com zero |
| Lista vazia | Explicar ausência real e oferecer somente a ação autorizada aplicável |
| Busca sem resultado | Mostrar critérios ativos, ajustar/limpar filtros; não confundir com consulta falha |
| Erro recuperável | Mensagem com correção/nova tentativa; conservar campos e seleções; nunca anunciar sucesso |
| Sucesso | `role="status"` identificando operação e recurso após retorno bem-sucedido |
| Ação bloqueada | Motivo junto ao controle, associado por descrição; recusa real continua no comando |
| Edição pendente | Texto visível nas seções e guardião de descarte do editor |
| Acesso negado/sessão inválida | Retirar dados restritos, limpar o estado correspondente e seguir guarda de acesso |

Adicionar nova tentativa explícita às consultas recuperáveis, hoje ausente em `Consulta`, por uma atualização transitória de chave ou callback do hook; não alterar revisões de negócio. Suspender conteúdo durante reautorização externa e só reexibir após confirmação de acesso. Não criar cache global de resultados de pessoas anteriores para manter o novo layout.

Reaproveitar salto ao conteúdo e foco por página/etapa; focar título do painel ao abrir edição e enunciado ao avançar questão. Feedback não deve mover foco. Erros vinculam campos e podem oferecer resumo com links ao item afetado. Menus têm controles nativos, estado acessível e ordem natural; não usar `tabindex` positivo. Dialogs modalizam de fato, com cancelamento por Escape e retorno do foco. Se uma ação eliminar seu acionador, usar o título da lista como retorno seguro.

**Justificativa e alternativa:** estados explícitos evitam resultados fictícios e preservam correção de erros. Ocultar exceções, resetar formulário em toda atualização ou manter retratos restritos durante a revalidação reduziria confiabilidade e privacidade.

### D10 — Aplicação aos 25 destinos e pontos de alteração

O mapa completo da proposta permanece a referência de cobertura; cada família abaixo aplica os padrões acima a todos os seus destinos, e não somente às quatro telas esboçadas.

| Família / quantidade | Padrões e arquivos principais |
| --- | --- |
| Entrada / 1 | D1–D4/D9; `telas/Entrada.tsx`, `Restauracao.tsx`; etapas função/pessoa e controles recolhidos |
| Aluno / 7 | D5/D9; MinhasTurmas, Catalogo, DetalheDisciplina, Trilha, Sessao, Materiais, Desempenho; contexto por matrícula e retornos próprios |
| Professor / 4 | D6/D8; `professor/Turmas.tsx` e `EditorConteudo.tsx`; lista, turma, aluno e editor |
| Coordenação / 4 | D7/D8; `coordenacao/Painel.tsx`, `Gestao.tsx` e cadastros compartilhados; painel, lista, turma e cadastros |
| Administração / 8 | D6–D8; `admin/Admin.tsx`, `Cadastros.tsx`, gestão compartilhada e editor; visão geral, pessoas, vínculos, dois grupos de cadastros, lista, turma e conteúdo |
| Responsável / 1 | D8/D9; `responsavel/Painel.tsx`; alunos e ofertas separados |

Estender CSS por componentes e composições, reduzindo progressivamente a dependência de regras globais como `.linha`, `.cartao` e `.acoes`. Componentes recebem dados de finalidade específica; autorização e comandos ficam nas telas/hooks/repositório. Ajustar `main.tsx`, `app/Rotas.tsx` apenas na composição necessária ao roteador e `testes/renderizar.tsx` em conjunto para evitar uma arquitetura diferente em testes. Nenhum destino acadêmico novo é necessário.

**Justificativa e alternativa:** aplicar padrões às famílias cobre todo o frontend e permite entregas pequenas. Uma cópia do HTML ou uma nova aplicação paralela perderia os contratos, testes e identidades acadêmicas existentes.

### D11 — Verificação por entrega

Cada grupo de implementação entrega seus próprios testes de interação e documentação; o grupo final verifica integração. Reutilizar Vitest, Testing Library, `user-event`, `testes/renderizar.tsx`, fixtures e armazenamento espião. Adicionar cenários aos arquivos de aluno, shell, professor, administração, coordenação e responsável; extensões de consultas também recebem testes de projeção/escopo. Não alterar o seed para fabricar casos de teste.

Testes devem verificar resultados observáveis e efeitos: lista antes da edição, foco e nomes acessíveis, confirmação cancelada sem gravação/revisão, diferença textual exata, rascunho intacto após falha, proteção de respostas e IDs aninhados. Comparar documento/revisão antes e depois de consultas, cancelamentos e comandos rejeitados, incluindo históricos, datas e gamificação. Na edição válida, conferir apenas a mudança pretendida e preservação dos resultados de estudo. Não substituir asserções de negócio por snapshots visuais.

O helper com roteador de memória deve exercitar o bloqueador com Voltar/Avançar, links e troca de área, além dos cenários já existentes. Se o jsdom não oferecer `showModal`/`close`, usar adaptação mínima explícita no ambiente de teste, cobrindo apenas abertura/fechamento; modalidade, foco real e Escape serão conferidos em navegador. Não simular layout em jsdom nem considerar troca de `innerWidth` prova de adaptação visual.

Realizar passagem em navegador a 1280 px e 360 px em cada família, com nomes extensos, estados abertos/fechados e teclado; registrar capturas e resultados por grupo em `evidencias/` durante a implementação futura. Usar origem/perfil isolados e fixture própria, preservando a demonstração pessoal existente. Ao final, executar os cinco fluxos completos de `navegacao-acessivel` em ambas as larguras e todos os 25 destinos; medir overflow, sobreposições, foco e contrastes efetivos.

Comandos em `prototipo/`: `npm test -- <arquivos do grupo>` e `npm run build`; encerramento com `npm test` completo e build. O README/evidências anteriores registram que Node 26 pode exigir `--no-experimental-webstorage` via `NODE_OPTIONS` para Vitest/jsdom. Reutilizar esse ajuste local somente se necessário, preservando o valor anterior e documentando-o; não alterar dependências ou enfraquecer testes. Levantar a baseline no início da implementação e distinguir falha anterior de regressão; os 662 testes aprovados documentados são evidência histórica, não resultado desta rodada.

**Justificativa e alternativa:** testes de interface verificam transações e estados; o navegador verifica layout e foco reais. Concentrar todas as verificações ao final adiaria a descoberta de regressões de shell e editor para as últimas jornadas.

## Risks / Trade-offs

- [CSS comum afetar telas ainda não adaptadas] → Introduzir tokens e componentes de forma incremental, revisar também as outras áreas a cada grupo e evitar seletores globais indiscriminados.
- [Roteador bloquear saída depois de já executar Sair ou restauração] → Guardar transição antes do efeito, usar uma confirmação contextual e testar cancelamento com dados/sessão intactos.
- [Rascunho sobreviver visualmente à revogação] → Separar retenção recuperável de autorização; ocultar durante revalidação e limpar ao negar acesso ou trocar identidade.
- [Confirmação textual reaproveitada para outro conteúdo] → Vincular às diferenças e revisões existentes; não atualizar a origem ou confirmação só por recarregar consultas.
- [Flags de proteção ficarem obsoletas entre consulta e comando] → Usá-las apenas para explicar a UI; validar novamente o estado real e a revisão no comando.
- [Menus recolhidos reduzirem descoberta] → Área/seção sempre visíveis, nomes explícitos e todos os destinos alcançáveis por teclado; Demonstração separada da conta.
- [Listas estreitas perderem relação entre valor e ação] → Um DOM por item com pares rótulo–valor e nomes acessíveis completos; passagem em navegador e árvore de acessibilidade.
- [Validação estrutural ser confundida com aceite funcional] → Relatar OpenSpec, testes de comportamento e revisão visual separadamente.

## Migration Plan

1. Antes da implementação, registrar estado do Git, baseline de testes/build e artefatos aprovados; preservar alterações alheias. Não inicializar ou restaurar demonstração para testar o novo layout.
2. Executar os grupos do checklist em ordem: base, shell/roteador, padrões de interação e famílias de telas. Fazer testes e documentação da própria entrega antes de avançar. As pequenas extensões de consultas são de leitura e não exigem migração de dados.
3. Validar a versão sobre armazenamento compatível já utilizado e sobre fixture isolada. A única substituição continua sendo o fluxo voluntário/incompatível já existente, com aviso e confirmação. Nenhuma nova versão de dados, chave ou seed é necessária.
4. Em eventual reversão técnica, voltar ao conjunto compatível de frontend, inicialização do roteador e helpers/contratos de leitura correspondente, preservando o documento acadêmico. A reversão não depende de restaurar dados nem deve apagar estudo realizado.
5. **Pendência antes da consolidação:** em operação posterior autorizada, consolidar `reorganizar-experiencia-frontend`, reler a base resultante e reconciliar os deltas desta change, especialmente `navegacao-acessivel`, trilha/sessão e requisitos de apresentação sobrepostos. Converter ADDED já incorporados em MODIFIED com blocos/cenários completos, mantendo novos requisitos como ADDED. Validar estrutura e revisar conteúdo novamente antes de arquivar esta change. Não consolidar, arquivar ou presumir essa dependência resolvida pelo status 4/4 de planejamento.

As escolhas que antes estavam adiadas — paleta, tipografia, espaçamento, menus, formulários e listas estreitas — ficam definidas neste design. Não há decisão de produto pendente que impeça decompor o trabalho; ajustes visuais de acabamento devem respeitar os contratos e medições descritos.
