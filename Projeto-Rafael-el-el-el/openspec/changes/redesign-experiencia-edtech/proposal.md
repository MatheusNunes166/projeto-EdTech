# Proposal

## Why

A experiência React já orienta a entrada e o estudo do aluno, mas os demais perfis ainda encontram formulários simultâneos, ações extensas e pouco espaço para identificar registros e concluir tarefas. Um redesign de todo o frontend deve reduzir essa concorrência visual e tornar os percursos de consulta e gestão claros, preservando o produto acadêmico existente.

## What Changes

- Entrada por função e pessoa, cabeçalho compacto com localização, navegação consistente, menu recolhido no celular, troca de área e ações de conta previsíveis; controles da demonstração agrupados.
- Aluno: ofertas separadas em Minhas turmas, busca e filtros claros no catálogo, trilha orientada pelo próximo tópico e sessão centrada na questão, seleção e feedback; materiais, desempenho e conquistas continuam acessíveis.
- Professor e Administrador autor: separar Tópicos e materiais de Banco de questões; listas compactas e edição do item selecionado, alternativas alinhadas ao gabarito, campos amplos para textos; preservar o rascunho conjunto e confirmar seu descarte, com motivos de bloqueio junto às ações.
- Coordenação: selecionar graduação, disciplina, período e turma, consultar médias contextualizadas somente por turma e acessar a gestão da oferta analisada; distinguir turma vazia de busca sem resultado.
- Administração: resumos e listas antes de formulários de pessoas, vínculos e estrutura acadêmica; criar ou editar sob demanda; matrículas e docentes no contexto da turma; confirmar remoções identificando o registro afetado.
- Responsável: identificar cada aluno vinculado e suas ofertas por disciplina, turma e período, com progresso, sequência e última atividade, inclusive Sem atividade.
- Padrões comuns de listas, formulários, ações e mensagens; estados de carregamento, vazio, busca sem resultado, erro, sucesso, bloqueio e edição pendente; operação por teclado, foco visível, contraste AA e uso completo em desktop e a 360 px.

**Direção visual:** usar o `index.html` da raiz do repositório como referência de cabeçalho compacto, superfícies claras e foco na atividade. Fundo neutro, bordas discretas, hierarquia tipográfica e separação visível entre grupos; destaque reservado à ação principal e aos estados interativos. Usar cartões para agrupamentos úteis e linhas alinhadas nas listas de gestão, evitando cartões aninhados; campos dimensionados para seus conteúdos e rótulos curtos, como “Voltar às turmas”. Paleta exata, fontes, medidas, pontos de adaptação e esboços serão definidos no design.

## Capabilities

### New Capabilities

- `navegacao-acessivel`: padrões compartilhados de navegação, interação, estados, confirmações e acessibilidade em todo o frontend. Ainda não existe na base consolidada; reutiliza o nome e os requisitos da change anterior, com a dependência de reconciliação descrita abaixo.

### Modified Capabilities

- `perfis-acesso`: entrada por função/pessoa e apresentação focada da gestão de pessoas e vínculos, preservando funções cumulativas e autorização por recurso.
- `catalogo-cursos`: Minhas turmas orientada à ação, busca e filtros identificáveis e detalhe das ofertas com metadados separados do acesso ao estudo.
- `aprendizado-adaptativo`: apresentação da trilha, sessão e materiais, com feedback estável e avanço explícito, preservando o motor e o isolamento por matrícula.
- `gamificacao`: resumo de XP e sequência e conquistas sob demanda na turma atual.
- `acompanhamento-desempenho`: percursos e apresentação dos painéis de Aluno, Professor, Coordenador, Administrador e Responsável, mantendo os indicadores e suas fórmulas.
- `gestao-conteudo-curso`: edição focada por seção/item, preservação do rascunho conjunto, confirmação de descarte e comunicação das proteções e da publicação.
- `organizacao-academica`: apresentação de cadastros, matrículas, docentes e controles da demonstração, sem modificar o modelo ou suas regras.

Os deltas são classificados contra `openspec/specs/` efetivamente existente: requisitos alterados usam MODIFIED com o bloco completo; comportamentos de interface ainda ausentes usam ADDED nas capacidades correspondentes. Não há remoções ou renomeações de requisitos. Regras acadêmicas não alteradas continuam válidas, sem duplicação nesta change.

## Impact

### Mapa completo de telas e tarefas

Inventário das 25 rotas concretas de `prototipo/src/app/Rotas.tsx`. As rotas abaixo são pontos de entrada existentes; separar seções e abrir formulários não exige criar novas rotas nesta proposta. `:d`, `:t`, `:m` e `:p` representam, respectivamente, `:disciplinaId`, `:turmaId`, `:matriculaId` e `:topicoId`.

| Perfil / rota | Tarefa principal | Visível de imediato | Por detalhe ou início de ação |
| --- | --- | --- | --- |
| Entrada — `/` | Entrar na demonstração | Escolha de função e aviso de dados fictícios sem senha | Pessoas ativas da função; Demonstração e restauração |
| Aluno — `/aluno` | Começar ou retomar uma oferta | Disciplina, graduação, turma, período, progresso, estado e ação principal | Trilha da matrícula; desempenho secundário |
| Aluno — `/aluno/catalogo` | Encontrar uma disciplina/oferta | Busca, filtros, critérios ativos e resultados publicados identificados | Descrição completa, tópicos e ofertas da disciplina |
| Aluno — `/aluno/catalogo/disciplinas/:d` | Identificar a oferta disponível | Disciplina, graduação, descrição, tópicos e ofertas com período, docentes e situação de matrícula | Continuar na turma matriculada; sem ação de ingresso |
| Aluno — `/aluno/disciplinas/:d/turmas/:t` | Saber o próximo passo de estudo | Contexto da oferta, progresso, próximo recomendado, tópicos e estados; XP e sequência compactos | Sessão, materiais liberados, desempenho e conquistas com datas |
| Aluno — `/aluno/disciplinas/:d/turmas/:t/sessao` | Responder e compreender o resultado | Questão, tópico, dificuldade, alternativas, Responder e contexto compacto | Feedback após envio; revisão, avanço explícito ou retorno à trilha |
| Aluno — `/aluno/disciplinas/:d/turmas/:t/desempenho` | Consultar seu desempenho | Oferta, progresso, domínio por tópico, taxa de acertos, XP e estado de atividade | Retorno à trilha da mesma oferta |
| Aluno — `/aluno/disciplinas/:d/turmas/:t/topicos/:p` | Revisar materiais liberados | Oferta, tópico, títulos e tipos dos materiais | Ler texto ou abrir link de material; retornar à trilha |
| Professor — `/professor` | Escolher turma para acompanhar/editar | Ofertas docentes com graduação, disciplina, turma, período e publicação | Painel da turma ou conteúdo compartilhado da disciplina |
| Professor — `/professor/disciplinas/:d/turmas/:t` | Identificar quem precisa de atenção | Oferta, médias identificadas e lista de alunos com progresso, taxa e estado | Domínio médio por tópico, detalhe do aluno e edição de conteúdo |
| Professor — `/professor/disciplinas/:d/turmas/:t/alunos/:m` | Entender o desempenho daquele aluno | Aluno, oferta e domínio por tópico; resumo das últimas respostas | Conteúdo original da resposta selecionada; voltar à turma |
| Professor — `/professor/disciplinas/:d/conteudo` | Manter conteúdo válido da disciplina | Disciplina, compartilhamento, publicação, edição pendente, seções e lista da seção escolhida | Editor de um tópico/material ou questão, diferença textual, confirmações e erros associados |
| Coordenação — `/coordenacao` | Consultar uma oferta sob sua coordenação | Seletores de graduação, disciplina, período e turma; resultados por oferta e progresso médio | Domínio médio identificado por tópico; gerir a mesma turma |
| Coordenação — `/coordenacao/gestao` | Escolher turma para gestão | Lista de ofertas no escopo com identificação completa | Matrículas e docentes da turma selecionada |
| Coordenação — `/coordenacao/gestao/turmas/:t` | Gerir matrículas e docentes | Contexto, matriculados e professores em listas separadas | Selecionar candidato a matrícula/docência; confirmar remoção docente; voltar aos indicadores da oferta |
| Coordenação — `/coordenacao/cadastros` | Manter estrutura do curso | Seções distintas de graduações/disciplinas e períodos/turmas; listas no escopo e ações autorizadas | Editar graduação, criar/editar disciplina ou turma; consultar períodos existentes sem gestão global |
| Administração — `/admin` | Entender o estado da demonstração | Totais de pessoas/funções e estrutura, com categorias claras | Navegar para pessoas, vínculos e cadastros correspondentes |
| Administração — `/admin/usuarios` | Manter pessoa e funções | Lista de pessoas, funções, situação e ações por linha | Criar/editar pessoa; ativar/desativar com resultado identificado |
| Administração — `/admin/vinculos` | Manter coordenação e Responsável–Aluno | Listas separadas dos dois tipos de vínculo, identificando as partes | Abrir atribuição com candidatos elegíveis ou confirmar remoção de um vínculo |
| Administração — `/admin/graduacoes` | Manter graduações e disciplinas | Seções/listas com código, nome, relação e publicação da disciplina | Criar/editar o registro escolhido; acessar editor pedagógico autorizado |
| Administração — `/admin/periodos` | Manter períodos e ofertas | Listas distintas de períodos e turmas com datas e identidade da oferta | Criar/editar período ou turma selecionada |
| Administração — `/admin/gestao` | Escolher oferta para matrículas/docentes | Lista identificada de turmas administráveis | Gestão da turma escolhida |
| Administração — `/admin/gestao/turmas/:t` | Gerir matrículas e docentes | Contexto da oferta, lista de matriculados e lista de professores | Matricular, atribuir docente ou confirmar sua remoção |
| Administração — `/admin/disciplinas/:d/conteudo` | Manter/publicar conteúdo | Mesmo resumo, seções e listas do editor docente | Edição focada e revisão textual, sob as mesmas proteções |
| Responsável — `/responsavel` | Acompanhar alunos vinculados | Identidade de cada aluno, ofertas separadas com período, progresso, sequência e última atividade | Expandir a oferta/aluno para leitura completa, sem histórico de questões |

Cabeçalho, conta, troca de área e Demonstração são superfícies compartilhadas, não novas rotas. As rotas de fallback continuam encaminhando à área permitida ou à entrada; URLs antigas por curso não escolhem uma oferta arbitrária. Acesso direto continua sujeito à autorização e à compatibilidade dos identificadores aninhados.

### Base observada e alcance técnico

- React existente em `prototipo/`: cabeçalho em `telas/Layout.tsx`, telas dos cinco perfis, componentes comuns e estilos. O editor atual mantém um candidato conjunto, mas apresenta tópicos e questões simultaneamente; cadastros abrem formulários junto às listas; algumas remoções de vínculos não pedem confirmação. O painel da coordenação filtra graduação e período e aponta à gestão geral, sem vínculo direto à linha analisada.
- A implementação futura deve reutilizar consultas e comandos autorizados, identificação por matrícula/turma, salvamento conjunto e revisões. Não deve ler o documento global nas telas nem duplicar cálculos do motor ou das médias para montar o novo layout.
- Preservar armazenamento e dados locais compatíveis, pessoas/funções/vínculos, matrículas, conteúdo, históricos e suas versões/datas, domínio, desbloqueios, progresso, XP, sequência e conquistas. A mudança visual não restaura nem substitui dados; a restauração voluntária e o aviso inicial de incompatibilidade mantêm suas regras.
- Mantêm-se todas as operações existentes; confirmação de remoção se aplica a operações já suportadas, não cria exclusão de graduações, disciplinas, períodos, turmas ou matrículas. Diagnóstico, monitoria, integrações institucionais e indicadores avançados continuam fora do escopo. Não se propõem autenticação real, migração, novas regras acadêmicas ou persistência de preferências visuais.
- A revisão futura deverá cobrir todas as rotas, estados, teclado, desktop e 360 px, com dados longos e erros recuperáveis. Nesta etapa são entregues somente proposta e specs, sem design, tarefas ou implementação.

### Dependência e reconciliação

`reorganizar-experiencia-frontend` está implementada com 31/31 tarefas, mas não consolidada nem arquivada. A base atual contém sete capacidades acadêmicas e ainda não contém `navegacao-acessivel`. Esta change parte funcionalmente do React resultante e preserva os cenários da change anterior nos requisitos sobrepostos.

Antes de uma futura consolidação/arquivamento desta change, será necessário consolidar a predecessora em operação própria autorizada, reler a base resultante e reconciliar os deltas sobrepostos: converter os requisitos já incorporados de ADDED para MODIFIED, especialmente navegação e apresentação de trilha/sessão, preservar seus blocos e cenários completos e manter ADDED somente para os comportamentos ainda novos. Executar novamente a validação estrita e a revisão semântica; não aplicar duas adições concorrentes da mesma capacidade/requisito. Nenhuma consolidação ou arquivamento é feita nesta etapa.

### Premissas e decisões posteriores

- A demonstração continua exclusivamente fictícia e utiliza as cinco funções e os vínculos atuais; a seleção de área não concede permissões.
- Separar seções do editor preserva um único rascunho em memória e uma ação de salvamento conjunto. A confirmação de descarte vale para saída/cancelamento sob controle do aplicativo; recuperação após fechamento forçado do navegador não é acrescentada ao escopo.
- A etapa de design decidirá composição dos menus e conta, apresentação dos formulários selecionados, comportamento visual das tabelas estreitas, tokens e esboços. Nenhuma dessas escolhas altera operações, permissões ou critérios de aceitação definidos nas specs.
