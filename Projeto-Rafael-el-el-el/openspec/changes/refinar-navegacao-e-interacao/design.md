# Design

## Context

Ver [proposal.md](proposal.md) para escopo e [diagnostico.md](diagnostico.md) para observações por rota e evidências do navegador. Os sete deltas acrescentam critérios de UX/UI à base efetiva e aos dois frontends já implementados.

O React atual usa React 18, TypeScript, CSS próprio, Vite, React Router 6 com `createBrowserRouter`/`RouterProvider`, Vitest e Testing Library. `app/Rotas.tsx` conserva 25 destinos, `Layout.tsx` resolve área/seção e reúne Menu, Conta e Demonstração. `app/areas.ts` já centraliza os nomes da localização. A implementação atual difere do retrato inicial do design anterior: não há mais BrowserRouter, barra permanente de funções ou formulários de todos os itens abertos simultaneamente.

`Gestao.tsx` oferece ListaRegistros, Registro e PainelEdicao; cada Registro usa identificação flexível e ações, mas os metadados internos em flex não fixam colunas entre linhas. `comuns.tsx` já fornece Campo com erro associado, Consulta com recuperação, foco de página e progresso com precisão preservada. Confirmacao usa dialog nativo, e Expansor usa details. Reaproveitar esses componentes.

O catálogo guarda os quatro critérios em useState e perde-os ao desmontar. A Coordenação já guarda quatro IDs em parâmetros da URL e constrói retorno a partir da oferta; esse caminho funciona e será preservado, inclusive quando a gestão é aberta diretamente. O editor já mantém original, revisão, candidato conjunto, seção, seleção e confirmações; os botões de salvar/descartar ficam após o conteúdo. `app/rascunho.tsx` usa useBlocker e protege links, navegação interna, Sair e descarte. A sessão já mantém atividade/seleção/resultado estáveis e só registra resposta por comando explícito.

Consultas e comandos acadêmicos revalidam pessoa ativa, sessão, função, vínculo e recurso. Eles continuam sendo a autoridade. Nenhuma tela precisa ler o documento global para esta change. Fixtures e falhas usadas na inspeção foram isoladas em outro perfil do Chrome, sem editar o seed ou os dados locais existentes.

## Goals / Non-Goals

**Goals:**

- Evoluir os componentes existentes em composições pequenas com contratos de orientação, layout, ações e feedback reutilizáveis.
- Separar estado transitório de navegação de dados acadêmicos e rascunhos; manter URLs diretas seguras e retornos reproduzíveis.
- Fazer as mesmas composições funcionarem em 1280, 768 e 360 px, com testes de comportamento e verificação real de geometria, teclado e contraste.

**Non-Goals:**

- Trocar o roteador, motor, repositório, fórmulas, esquema, seed ou chaves; acrescentar biblioteca visual, fontes remotas, servidor ou autenticação.
- Persistir rascunhos, resultados ou listas autorizadas em URL, localStorage novo ou cache global; implementar autosave, merge ou recuperação após encerramento forçado.
- Transformar cadastros em autoria pedagógica, filtro em autorização, navegação em estudo ou confirmação em dispensa de revisão/validação.

## Decisions

### D1 — Paleta semântica e identidade

Manter **Trilha Adaptativa**, superfícies claras e tipografia local. Evoluir o azul atual para índigo, com verde azulado em contexto informativo e estados semânticos mais distintos. Aplicar cores aos papéis, não a perfis com supostas permissões diferentes. A marca e a ação principal compartilham índigo; painéis podem usar uma faixa/superfície informativa leve, sem colorir todo o conteúdo.

Valores propostos e razões calculadas com luminância sRGB; são combinações nominais, não medição da futura interface:

| Papel | Frente / fundo | Contraste |
| --- | --- | --- |
| Texto principal | #1e293b / #ffffff | 14,63:1 |
| Texto secundário no fundo | #475569 / #f8fafc | 7,24:1 |
| Ação principal | #ffffff / #4338ca | 7,90:1 |
| Hover principal | #ffffff / #3730a3 | 9,93:1 |
| Pressionado principal | #ffffff / #312e81 | 11,42:1 |
| Contexto informativo | #0f766e / #f0fdfa | 5,25:1 |
| Seleção | #3730a3 / #eef2ff | 8,88:1 |
| Sucesso | #166534 / #f0fdf4 | 6,81:1 |
| Atenção / pendente | #92400e / #fffbeb | 6,84:1 |
| Erro | #b91c1c / #fef2f2 | 5,91:1 |
| Confirmação destrutiva | #ffffff / #b91c1c | 6,47:1 |
| Contorno funcional | #64748b / #ffffff | 4,76:1 |
| Foco | #4338ca / #ffffff | 7,90:1 |
| Indisponível | #475569 / #e2e8f0 | 6,15:1 |

Fundo geral #f8fafc, superfície #ffffff, borda decorativa #cbd5e1. Borda decorativa não define sozinha um controle. Foco usa anel de 3 px e afastamento de 3 px, com separação clara em botões preenchidos. Usar os tokens existentes `--cor-*` onde o significado coincide e completar tokens de estado, sem substituir valores diretamente em cada tela.

Preservar texto e símbolo nos estados: check/“Salvo”, atenção/“Edição pendente”, erro/explicação, cadeado/“Bloqueado”. Não reduzir a opacidade do grupo inteiro para simular indisponibilidade. Medir texto comum >=4,5:1, texto grande >=3:1 e componentes/foco essenciais >=3:1 nos estados renderizados; conferir transparência, fundos reais e hover, não apenas a tabela.

**Alternativa considerada:** cores por perfil ou uma nova biblioteca visual. A primeira confunde significado e aumenta combinações a validar; a segunda acrescenta dependência e reescreve componentes já acessíveis. Tokens próprios permitem evolução incremental.

### D2 — Tipografia, espaçamento e grade

Fonte: `system-ui, -apple-system, 'Segoe UI', sans-serif`. Corpo/campos 16 px, entrelinha 1,5; metadados 14 px/1,5; H1 30/26 px desktop/celular, H2 22/20 px; enunciado 24/22 px, entrelinha 1,4. Pesos 400, 600 e 700. Números tabulares em indicadores, texto alinhado à esquerda; títulos e identidades sem altura fixa ou truncamento essencial.

Escala: 4, 8, 12, 16, 24, 32 e 48 px. Página e interior do cabeçalho compartilham o mesmo container externo máximo de 1180 px, centralizado, com 24 px de padding em 1280/768 e 16 px em 360. Em 1280, as bordas do conteúdo começam aproximadamente a 74 px; o cabeçalho passa a respeitar essa mesma linha. Painéis 24/16 px; seções 32 px; título/contexto 8 px; ações relacionadas 8 px; campos 16 px; linhas 12 px verticais/16 horizontais. Raios: 12 px em superfícies, 8 px em controles. Sombra leve só em menu destacado, modal e barra aderente; superfícies comuns usam borda.

Grade de 12 colunas no desktop, 8 na largura intermediária e 4 no celular como referência de alinhamento, sem exigir doze elementos reais. Definir composições por conteúdo:
- listas e indicadores podem ocupar a largura útil inteira;
- texto de leitura no máximo 68ch, aceitando 78ch como teto de requisito; questão/explicação usam até 78ch;
- editor em >=1100 px usa lista 320 px + formulário flexível com gap 24; abaixo disso, lista e edição alternam no mesmo fluxo, mantendo o proprietário do rascunho;
- cabeçalho compacto e sessão preservam breakpoint de 900 px; abaixo de 640, alternativas e filtros usam uma coluna; em 768, filtros usam duas;
- não impor altura mínima a cartões de leitura/listas vazias para preencher a tela.

Linhas de pessoas e acompanhamento definem um esquema de colunas por lista, compartilhado entre registros. Exemplo docente: identificação flexível, progresso minmax(128px, 160px), taxa 9ch, situação 15ch, atividade 12ch e ação. Se o total não couber, mudar toda a lista para outra composição, sem espremer a barra até poucos pixels. Em 360, usar os pares dt/dd de cada registro, com ações após seus dados. Em listas de duas ações, reservar a mesma área; ausência de ação não desloca as outras colunas. CSS grid e, se útil, subgrid somente com fallback testado, sem dependência obrigatória dessa funcionalidade.

**Alternativa considerada:** uma única grade genérica para qualquer Registro e os atuais metadados flexíveis. É simples, mas mantém colunas móveis e barras minúsculas. Variantes explícitas por finalidade tornam comparação previsível.

### D3 — Cabeçalho de página, hierarquia e retorno

Compor `CabecalhoPagina`, `CaminhoPagina` e `ContextoAcademico` a partir das primitivas atuais. A página tem ordem estável: breadcrumbs úteis → retorno nomeado → H1 → contexto → filtros/ação → conteúdo. Raízes, entrada e acompanhamento do Responsável não recebem breadcrumbs artificiais. A indicação área/seção continua no Layout; o contexto acadêmico usa dados da consulta autorizada do destino, sem nomes extraídos de IDs ou cache de outra pessoa.

Breadcrumbs usam nav com nome “Caminho da página”, lista ordenada, links somente nos ancestrais e `aria-current="page"` no item atual. Em celular, quebram em linhas legíveis; não usar trilha horizontal com corte/rolagem. O retorno é Link com ícone de seta e rótulo de destino, na mesma região antes do título. A sessão mantém adicionalmente o acesso à trilha no resumo, satisfazendo o contrato anterior; ambos apontam à mesma matrícula. Separar “Voltar à lista de questões” (troca interna) de “Voltar às turmas” (sair do editor).

No Layout, Menu e Conta formam um grupo compacto com largura dos controles ajustada ao rótulo, sem esticar Menu para preencher a linha intermediária. Manter estado aria-expanded e todos os destinos atuais. Tratar Escape no contexto do cabeçalho para cobrir acionador e links, devolvendo foco ao botão; confirmações modais mantêm precedência e não propagam Escape para fechar o menu ao fundo.

| Destino atual | Retorno seguro sem origem | Origem opcional válida |
| --- | --- | --- |
| Detalhe no catálogo | Catálogo, critérios padrão | Catálogo com critérios preservados |
| Trilha | Minhas turmas do aluno | Seleção da oferta nessa lista |
| Sessão / material / desempenho | Trilha da turma consultada | Mesma oferta, nunca turma arbitrária |
| Painel docente | Minhas turmas docentes | Critérios da lista docente |
| Detalhe do aluno | Painel da turma autorizada | Mesma oferta e registro |
| Editor docente | Minhas turmas docentes | Painel docente da turma de origem, se ainda autorizado |
| Editor administrativo | Graduações e disciplinas | Cadastro administrativo autorizado |
| Gestão de turma | Lista de ofertas da área atual | Indicadores e quatro critérios válidos na Coordenação |

Usar um tipo fechado de origem, com finalidade, IDs acadêmicos e critérios permitidos. Não aceitar `returnTo` livre nem URL arbitrária. Reconstruir destinos por funções de rota da aplicação. No editor docente, `origemTurma` pode carregar um ID; confirmar nas próprias turmas autorizadas que ele pertence à disciplina. Sem confirmação, usar a lista docente, sem expor o nome de recurso negado. A pessoa com funções cumulativas permanece na área do caminho, não da primeira função.

**Alternativa considerada:** `navigate(-1)` como retorno e breadcrumb calculado apenas pelo pathname. Ambos falham em entrada direta; o segundo ainda pode insinuar um recurso não autorizado. URLs conhecidas + contexto autorizado cobrem os dois casos.

### D4 — Estado transitório de filtros, seleção e rascunho

Catálogo: serializar busca/área/nível/período em URLSearchParams com nomes definidos e tipagem de valores, usando atualização replace enquanto digita. O link ao detalhe leva somente os critérios de catálogo necessários ao retorno, sem dados de questões ou listas. O retorno explícito reconstrói o catálogo com os critérios; Voltar/Avançar nativos também os recuperam. Limpar filtros limpa a URL e o estado atual. Critérios inexistentes/incompatíveis são descartados ou ajustados aos valores permitidos com mensagem curta quando necessário, sem controles mostrando uma seleção que não foi aplicada.

Outras listas: parâmetros próprios de finalidade para filtros compartilháveis; seleção, posição da lista e acionador em estado de navegação/memória limitado a pessoa + rota + finalidade. Retorno deve focar/revelar o registro ainda existente; se não existir mais, título da lista e mensagem do resultado. Não criar armazenamento durável de preferências. A Coordenação conserva seu mecanismo atual de quatro IDs e `selecaoDaOferta`; o refinamento completa hierarquia e apresentação, sem perder o retorno já entregue.

O editor mantém todo o candidato no atual proprietário pessoa–disciplina. Critérios e seleção do editor são locais a esse proprietário, preservados nas trocas de seção; não guardar rascunho ou confirmação na URL. Uma busca opera sobre os itens atuais do candidato, inclusive novos/editados, e a validação continua sobre o conjunto inteiro. Se um filtro ocultar o item aberto, mantê-lo com aviso “Item em edição fora dos filtros”; não descartá-lo nem esvaziar a seleção automaticamente. Link de erro abre o item e ajusta os critérios necessários para torná-lo localizável.

Reutilizar o guardião com useBlocker em links, breadcrumb, volta interna, troca de área, Sair e restauração. A confirmação de saída identifica a disciplina e usa **Continuar editando** / **Descartar e sair**; não salvar por navegação. Revogação ou troca de pessoa limpa dados restritos e não mantém bloqueio que impeça o redirecionamento seguro. Uma revisão obsoleta conserva o candidato somente enquanto ainda autorizado; não promover a revisão de origem nem reutilizar confirmação antiga.

**Alternativa considerada:** localStorage para todos os filtros ou estado de cada formulário independente. Criaria preferências persistidas/risco de mistura entre pessoas e fragmentaria a transação de conteúdo. URL limitada + estado transitório por proprietário preserva o alcance aprovado.

### D5 — Ações, ícones e feedback reutilizáveis

Evoluir variantes CSS e composições comuns, sem criar outro formulário/repositório:

| Papel | Aparência / comportamento |
| --- | --- |
| Principal | Preenchimento índigo, texto branco; uma ação dominante por tarefa/contexto |
| Secundário | Superfície branca, texto/contorno índigo; editar, cancelar não destrutivo |
| Navegação | Link com destino e seta opcional; nunca button apenas para abrir URL |
| Destrutivo | Texto/contorno vermelho na lista; confirmação final vermelha preenchida |
| Selecionado | Fundo índigo suave, contorno e texto, estado acessível |
| Pendente | Motivo textual e superfície âmbar; não equivale a sucesso |

Altura mínima 44 px, padding 10–16 px, ícone 20 px e gap 8 px, alinhamento central; textos longos podem quebrar e aumentar a altura. Conservar a largura da ação ao trocar “Salvar alterações” por “Salvando…”, usando área de label reservada. Hover muda superfície/contorno, active aprofunda a cor, foco tem anel independente. Desabilitado mantém contraste e motivo adjacente, inclusive quando sai da ordem de Tab. Usar disabled nativo onde adequado e bloqueio de comando já existente; `aria-disabled` sozinho não impede execução.

Nos controles secundários, hover usa #eef2ff com texto #3730a3 e pressionado usa #e0e7ff com texto #312e81. Na ação destrutiva de linha, hover usa #fef2f2 e pressionado #fee2e2, conservando texto/contorno #b91c1c e o rótulo. Transições: 120 ms para cor/seleção, até 160 ms para expansão/feedback, sem animar posição do foco ou altura de uma região em edição. Em prefers-reduced-motion: reduce, remover essas animações/transições e a rolagem suave; carregamento continua textual mesmo sem spinner animado. Não introduzir atraso artificial no comando para exibir uma animação.

Ícones SVG locais com viewBox e traço consistentes: seta, lápis, check, aviso, cadeado, lixeira para remoção suportada e indicador de carregamento. Elementos decorativos usam aria-hidden; nunca esconder o rótulo de retorno/salvar/remover no celular. Não usar emojis com desenho variável nem carregar pacote remoto. Confirmação continua nativa, com foco inicial seguro em Cancelar/Continuar editando, Escape cancela e retorno ao acionador ou título seguro.

Completar uma região de resultado por tarefa, junto aos controles, com `role="status"` educado para sucesso/carregamento; erro usa alerta e associação com campos. Mensagens persistem até nova operação/edição pertinente, sem sumir por tempo. Exemplo: “Material Variáveis e tipos salvo em Algoritmos”; “Marcos removido da turma A · 2026.2”. Sem resultados otimistas: atualizar depois de retorno aceito do comando. Mapear códigos/detalhes de validação já recebidos para campos e links de correção; não duplicar as regras de negócio no componente.

Não mover o foco para todo feedback. Se resultado ficar fora da área visível, revelá-lo com rolagem mínima, mantendo o acionador focado; erro de formulário pode levar ao resumo/primeiro inválido após envio. Na sessão, manter questão e resultado estáveis, sem deslocamento de foco para outra pergunta nem avanço automático. O próximo enunciado recebe foco somente após avanço explícito.

**Alternativa considerada:** notificações temporárias flutuantes e cores por verbo. Podem ser perdidas por leitores/rolagem e competir com o editor. Resultado contextual persistente e papéis semânticos são verificáveis e não alteram as operações.

### D6 — Editor longo com uma transação e ações alcançáveis

Reaproveitar `EditorConteudo` e suas funções de diferença/validação. Acrescentar busca nos tópicos/materiais e filtros texto/tópico/dificuldade no banco, trabalhando sobre o candidato já autorizado. A busca não consulta o catálogo nem o histórico. A lista mostra resumo e metadados, identifica o item selecionado e mantém nome completo acessível; formulário continua único e aberto sob demanda.

Extrair uma região **Ações do conteúdo de [disciplina]** com estado pendente, resultado/erro, Salvar alterações e Descartar alterações. Usar uma única instância das ações do conjunto, aderente ao rodapé durante edição longa, com superfície opaca, contorno e espaçamento que a distingam. A barra ocupa área reservada; não cobrir o último campo, mensagens ou foco. Medir sua altura real quando quebrar linhas, incluindo zoom e mensagens, reservar o espaço correspondente e aplicar scroll-padding/scroll-margin para alvos focados e links de erro. Diálogo nativo permanece acima em sua top layer.

Em área vertical muito reduzida ou com teclado virtual, não manter uma barra que consuma os campos: passar ao fluxo normal e oferecer acesso “Ir às ações do conteúdo” por link de salto no início das seções/grupos do formulário. O autor continua podendo saltar diretamente sem percorrer todos os campos. Esse fallback deve ser conferido em navegador/dispositivo; não afirmar suporte a teclado virtual apenas por emulação de largura. No desktop e celular usuais a barra fica aderente; fallback é para manter os critérios de visibilidade.

A decisão substitui a recomendação técnica D2 do design anterior de não usar barra aderente: o editor atual mostrou distância >1700 px até suas ações. Mantém o contrato de uma ação de salvar o conjunto, sem autosave ou salvamento por item.

Publicar continua separado, somente sobre versão salva e com motivo de indisponibilidade enquanto houver alterações. A revisão textual continua na região da questão: original/proposto lado a lado no desktop e empilhados no celular, campos nomeados, ordem das alternativas preservada, confirmação pelo próprio autor para diferença exata/revisão original. Barra e filtro não contornam bloqueios de estrutura/questões respondidas ou cobertura publicada. Erro de um item filtrado pode abrir a região de revisão/correção; o salvamento permanece integral.

**Alternativa considerada:** duplicar botões no início/fim ou salvar automaticamente cada item. A duplicação fragmenta feedback/foco e autosave viola a transação. Uma região de ações reutiliza o mesmo comando e torna sua posição previsível, com custo explícito de validar obstrução.

### D7 — Esboços de navegação e lista de gestão

Esboços estruturais para revisão; os textos e valores são ilustrativos. Não representam mudança no seed. Em 768 px, cabeçalho usa Menu e filtros duas colunas; listas adotam composição única compatível, sem comprimir colunas antes de empilhar.

```text
NAVEGAÇÃO / RETORNO — 1280
┌───────────────────────────────────────────────────────────────────────┐
│ Trilha Adaptativa · Professor       Minhas turmas   Demo ▾   Conta ▾   │
└───────────────────────────────────────────────────────────────────────┘
  Minhas turmas / Algoritmos · A · 2026.2 / Ana Souza
  ← Voltar à turma
  Ana Souza
  Algoritmos · A · 2026.2 · Sistemas de Informação
  [Conteúdo autorizado da página...]

NAVEGAÇÃO / RETORNO — 360
┌──────────────────────────────┐
│ Trilha Adaptativa            │
│ Professor · Detalhe do aluno │
│ [Menu]               Conta ▾ │
├──────────────────────────────┤
│ Turmas / Algoritmos A        │
│ / Ana Souza                 │
│ ← Voltar à turma            │
│ Ana Souza                   │
│ Algoritmos · A · 2026.2      │
│ Sistemas de Informação      │
└──────────────────────────────┘

LISTA DE GESTÃO — 1280
  Administração / Pessoas
  Pessoas e funções                                      [+ Nova pessoa]
  Buscar [nome ou e-mail........]  Função [Todas]  Situação [Todas]
┌───────────────────────────────┬────────────────┬────────┬──────────────┐
│ Nome / e-mail                 │ Funções        │ Estado │ Ações        │
├───────────────────────────────┼────────────────┼────────┼──────────────┤
│ Ana Maria de Souza ...        │ Aluno          │ Ativa  │ Editar       │
│ nome completo quebra aqui     │                │        │ Desativar    │
│ ana@exemplo.com               │                │        │              │
│ Carla Dias                    │ Prof., Coord.  │ Ativa  │ Editar       │
│ carla@exemplo.com             │                │        │ Desativar    │
└───────────────────────────────┴────────────────┴────────┴──────────────┘
  Resultado da operação identificado, próximo da tarefa.

LISTA DE GESTÃO — 360
┌──────────────────────────────┐
│ Pessoas e funções            │
│ [+ Nova pessoa]              │
│ Buscar [...................] │
│ Função [Todas]               │
│ Situação [Todas]             │
├──────────────────────────────┤
│ Ana Maria de Souza           │
│ [restante do nome completo]  │
│ E-mail: ana@exemplo.com      │
│ Funções: Aluno               │
│ Situação: Ativa              │
│ [Editar]   [Desativar]       │
├──────────────────────────────┤
│ Próximo registro...          │
└──────────────────────────────┘
```

A reticência do esboço indica continuação ilustrativa, não truncamento do nome na implementação. Filtros específicos são oferecidos quando os metadados existem na finalidade: Pessoas por função/situação; ofertas por graduação/disciplina/período; vínculos por partes/tipo dentro da lista correspondente; cadastros por texto e relação já consultada. Todos filtram somente projeções autorizadas, sem paginação remota nova. Não juntar listas de Coordenação e Responsável–Aluno numa seleção indiscriminada de candidatos.

### D8 — Esboços de editor e sessão

```text
EDITOR LONGO — 1280
  Turmas / Algoritmos / Conteúdo compartilhado
  ← Voltar à turma A
  Conteúdo de Algoritmos · Publicada
  [Tópicos e materiais] [Banco de questões]
┌───────────────────────┐ ┌────────────────────────────────────────────┐
│ Buscar [...........]  │ │ Editar questão · Variáveis · Fácil         │
│ Tópico [Todos]        │ │ Questão respondida: gabarito protegido.    │
│ Dificuldade [Todas]   │ │ Enunciado [texto........................]  │
│ > Questão selecionada │ │ Tópico [...]  Dificuldade [...]            │
│   Outra questão      │ │ ○ Correta · Alternativa 1 [texto........]  │
│   ...                │ │ ● Correta · Alternativa 2 [texto........]  │
│                       │ │ Explicação [.............................] │
└───────────────────────┘ │ Diferença original / proposta · confirmar │
                          └────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────┐
│ Algoritmos · Edição pendente    [Salvar alterações]  Descartar        │
│ Resultado/erro e acesso ao item para correção                        │
└──────────────────────────────────────────────────────────────────────┘
  Região de ações aderente com espaço reservado e foco desobstruído.

EDITOR LONGO — 360
┌──────────────────────────────┐
│ Conteúdo de Algoritmos       │
│ ← Voltar às turmas           │
│ [Tópicos] [Questões]          │
│ ← Voltar à lista de questões │
│ Questão · Variáveis · Fácil  │
│ Ir às ações do conteúdo      │
│ Enunciado [................] │
│ ○ Correta · Alternativa 1    │
│   [texto em várias linhas]   │
│ Explicação [...............] │
│ Original / Proposta          │
│ [ ] Confirmo o sentido       │
├──────────────────────────────┤
│ Edição pendente · Algoritmos  │
│ [Salvar alterações]          │
│ [Descartar alterações]       │
│ Erro / sucesso contextual    │
└──────────────────────────────┘
  Barra não cobre o último campo; fallback em fluxo com link de salto
  se teclado/altura reduzida tornarem a barra obstrutiva.

SESSÃO DE ESTUDO — 1280
  Minhas turmas / Algoritmos A · 2026.2 / Sessão
  ← Voltar à trilha
  Sessão de estudo
┌───────────────────────────────────────────┐ ┌────────────────────────┐
│ Condicionais · Fácil                      │ │ Algoritmos             │
│ Enunciado com largura de leitura          │ │ A · 2026.2             │
│ ○ Alternativa 1        ● Alternativa 2    │ │ Progresso [───] 33%   │
│                        Selecionada        │ │ Ver trilha             │
│ [Responder] → [Enviando…]                 │ └────────────────────────┘
├───────────────────────────────────────────┤
│ ✓ Acertou / ! Errou · Explicação          │
│ Efeitos reais de domínio/XP/conquista      │
│ [Próxima questão] ou [Ver trilha]          │
└───────────────────────────────────────────┘

SESSÃO DE ESTUDO — 360
┌──────────────────────────────┐
│ Aluno · Sessão  Menu  Conta  │
├──────────────────────────────┤
│ Turmas / Algoritmos A        │
│ ← Voltar à trilha            │
│ Sessão de estudo             │
│ Algoritmos · A · 2026.2       │
│ Progresso [─────] 33%        │
│ Ver trilha                   │
│ Condicionais · Fácil         │
│ Enunciado legível            │
│ ○ Alternativa 1              │
│ ● Alternativa 2 · Selecionada │
│ [Responder / Enviando…]       │
│ Resultado e explicação       │
│ [Próxima questão]            │
└──────────────────────────────┘
```

No esboço do editor celular, “Conteúdo de Algoritmos” representa a localização do cabeçalho; o H1 da página continua depois da região de retorno, conforme D3. Nenhum esboço autoriza abreviar rótulos reais a ponto de esconder seu significado.

A sessão conserva seu resumo restrito: sem XP, sequência, conquistas ou tópicos nessa coluna/faixa. Esses resultados continuam no feedback/trilha. O novo breadcrumb não acrescenta questões ou dados do aluno ao cabeçalho global. Não duplicar formulário de alternativas entre breakpoints nem gerar outro estado para mobile.

### D9 — Aplicação às demais telas e contratos

| Família / rotas | Aplicação dos padrões |
| --- | --- |
| Entrada / 1 | Etapas identificadas, descrições curtas, função escolhida e destino da pessoa; retorno e carregamento comuns |
| Aluno / 7 | Ofertas com ações alinhadas; catálogo com critérios na URL; detalhe com leitura limitada; trilha com estados; materiais/desempenho com retorno padrão; sessão D8 |
| Professor / 4 | Lista com busca da oferta, painel com colunas comparáveis, aluno com snapshot original e breadcrumb; editor D6 |
| Coordenação / 4 | Seletores existentes preservados, médias nomeadas e explicação, ligação gestão/indicadores, listas/cadastros no escopo |
| Administração / 8 | Totais por categoria, Pessoas/Vínculos com busca e ações semânticas, cadastros separados, gestão da oferta e mesmo editor autorizado |
| Responsável / 1 | Seção por aluno, identificação completa da oferta, progresso/atividade/ sequência com explicações acessíveis, sem dados de questões |

Reutilizar `consultarCatalogo`, `consultarMinhasTurmas`, estrutura administrável, consultas de candidatos, conteúdo editável e projeções de indicadores já disponíveis. Filtrar no cliente os metadados retornados pela consulta de finalidade apropriada, sem solicitar escopos mais amplos. Não estender DTOs sem evidência de campo faltante; o código atual já fornece nomes, contextos e flags necessários.

Na consulta dos períodos, separar rótulos Início/Fim e reutilizar a formatação de datas de apresentação já existente. Conservar os valores canônicos e a validação do comando no formulário; uma data formatada não deve ser reenviada como se fosse a identidade ou valor original do período.

Professor: alinhar valores e dar escala útil às barras; “Precisa de atenção” mantém o limiar existente, não vira diagnóstico. Detalhe do aluno mantém até dez respostas originais. Coordenação: explicar progresso médio/domínio por tópico e zeros de quem não iniciou; não recalcular ou combinar médias na UI. Responsável: manter aluno e oferta juntos, trocar linha concatenada por pares rotulados e explicações em details acessível, sem tooltip obrigatório. Administração: usar as mesmas primitivas, sem incorporar o painel do Responsável. Pessoas cumulativas têm união de permissões por função/vínculo, não união indiscriminada dos dados entre áreas.

### D10 — Testes e evidências por entrega

Reutilizar os testes atuais de telas e domínio, `testes/renderizar.tsx` com createMemoryRouter e fixtures isoladas. Cada entrega inclui testes de interação e efeitos: destino real de Link, URLs diretas, Voltar/Avançar, filtro restaurado, origem indevida, foco no retorno, envio único, campos após erro, confirmação cancelada e documento/revisão intactos.

Para conteúdo: verificar material + questão no mesmo candidato; item filtrado continua validado; falha/persistência/revisão obsoleta; cobertura publicada rejeitada integralmente; confirmação textual exata/revisão original pelo autor; texto novo exige nova confirmação; gabarito protegido apesar de confirmar; histórico original e gamificação intactos. Revogação deve negar o próximo comando e não reapresentar rascunho restrito.

Fixtures de layout: nomes com >100 caracteres, e-mails e URLs extensos, questão com >=3 alternativas longas, explicação longa, múltiplos perfis/vínculos e ofertas com mesmo código em períodos diferentes. Na Coordenação verificar 80% + 0% → 40%, 100/6 sem arredondamento intermediário, empate 42,5 → 43 e Sem dados em turma vazia, sem média global. Consultas, filtros, expansão e cancelamentos não mudam revisão.

Navegador: em cada família percorrer 1280/768/360 px, medir document.scrollWidth <= innerWidth, posições de campos/mensagens/foco contra a barra e alinhamento entre linhas. Registrar teclado (Tab, Shift+Tab, Enter, Espaço, setas e Escape), menu/dialog, foco do último campo, texto ampliado a 200%, preferência de redução de movimento e pares de contraste efetivos. jsdom não prova layout, modalidade real ou teclado virtual; capturas e relatório de navegador complementam os testes.

Usar o ambiente atual `testes/ambiente-router.ts`, que mantém Request/AbortController/AbortSignal no mesmo realm, e o suporte mínimo a dialog já documentado. Node 26 pode exigir `--no-experimental-webstorage` no NODE_OPTIONS dos testes; manter o valor anterior e documentar o uso local. Não substituir globals ou validações para mascarar regressões. Os 669 testes do frontend anterior são evidência histórica; levantar e registrar a baseline real no início da implementação.

Verificar testes relevantes e build por grupo; no final, npm test completo, npm run build, as 25 rotas e validação OpenSpec. Registrar resultados separados: estrutura documental, testes de comportamento e inspeção visual. As capturas desta rodada mostram o estado anterior ao refinamento, não aceite da futura implementação.

**Alternativa considerada:** snapshots de tela como única verificação ou todos os testes no final. Não cobrem autorização/transação e atrasam regressões; a combinação por entrega é necessária.

## Risks / Trade-offs

- [Filtros na URL virarem acesso a recurso] → Permitir somente critérios/IDs tipados, reconstruir destinos locais e revalidar na consulta/comando; nenhuma URL livre ou DTO restrito serializado.
- [CSS comum alterar formulários já corretos] → Variantes por finalidade, adaptação incremental e passagem em outras áreas após mudanças comuns.
- [Barra cobrir foco, erro ou teclado virtual] → Espaço medido, scroll-padding/margin, alvos de erro visíveis e fallback em fluxo com salto; testar o último campo nas três larguras e registrar limite de emulação.
- [Filtro perder alteração oculta] → Candidato único independente dos resultados filtrados; validação sempre integral.
- [Confirmação antiga reaproveitada] → Reutilizar vínculo à diferença exata e revisão, invalidar nas mudanças pertinentes, sem segunda pessoa nem liberação de gabarito.
- [Retorno restaurar dado revogado] → Contexto transitório contém critérios e IDs, não conteúdo; limpar por pessoa e revalidar recurso antes de rótulos e renderização.
- [Mais ícones/cores criarem ruído] → Paleta por significado, ícones locais com rótulo e superfícies informativas discretas; revisar hierarquia em cada captura.
- [Validação estrita confundida com produto pronto] → Checklist desmarcado até implementação/verificação, evidências atuais identificadas como diagnóstico.

## Migration Plan

1. Implementação futura começa com status/diff e baseline; preservar arquivos alheios, armazenamento compatível e artefatos aprovados. Nenhum seed/restauração automática é necessário.
2. Aplicar tokens e composições, depois navegação/feedback e as famílias na ordem do checklist. Manter os mesmos comandos e IDs; entregar testes junto da funcionalidade.
3. Verificar dados compatíveis já utilizados por cópia isolada, além dos casos vazios/longos/falhos. Não criar versão de schema/seed ou chave para o refinamento.
4. Reversão do frontend deve voltar componentes/estilos/contexto de navegação ao conjunto compatível anterior sem restaurar dados; estudo e cadastros válidos realizados durante uso continuam no mesmo formato.
5. Antes da consolidação/arquivamento desta change, em etapa posterior autorizada: consolidar primeiro `reorganizar-experiencia-frontend`, reconciliar e consolidar `redesign-experiencia-edtech`, reler a base e reconciliar estes deltas. Requisitos já existentes na nova base não podem ser readicionados; se houver sobreposição semântica, usar MODIFIED com o bloco e cenários completos. Manter ADDED somente para incrementos efetivamente novos e preservar todas as regras anteriores. Revalidar estrutura e conteúdo antes de arquivar. Esta rodada não executa essa sequência.

## Open Questions

- Verificação em dispositivo móvel com teclado virtual e em navegador além do Chrome continua pendente de disponibilidade no aceite futuro. O fallback e os critérios de não obstrução já estão definidos; essa verificação não altera o produto ou a ordem das tarefas.
- O aceite estético das combinações e esboços será feito na revisão desta proposta. Ajustes finos de densidade devem manter escala, contraste e critérios das specs; não há decisão de produto bloqueante adiada.

