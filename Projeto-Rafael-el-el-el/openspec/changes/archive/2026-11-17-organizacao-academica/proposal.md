# Proposal

## Why

A change `edtech-adaptativa-fase-inicial` entregou um protótipo em que curso reúne conteúdo, matrícula e trilha adaptativa, e “turma” representa apenas os alunos daquele curso, sem disciplina nem período letivo. Para validar o uso em uma faculdade antes de evoluir o produto, precisamos representar cursos de graduação, disciplinas e suas ofertas em turmas, situando a aprendizagem adaptativa nos tópicos das disciplinas.

## What Changes

- **BREAKING**: redefinir Curso como graduação, por exemplo Sistemas de Informação, Agronomia, Psicologia ou Direito; cada curso possui disciplinas, e cada disciplina pode ter várias turmas, identificadas por período letivo. Exemplo: Sistemas de Informação → Algoritmos → turma A de 2026.2 → estudo do tópico Estruturas de repetição.
- Introduzir a organização e a manutenção básica de cursos, disciplinas, períodos letivos e turmas no protótipo, incluindo vínculos de professores e alunos às turmas e de coordenadores aos cursos.
- Permitir ao Coordenador editar dados dos cursos vinculados, criar e editar suas disciplinas e turmas, realizar matrículas e gerenciar vínculos docentes nesse escopo. Criação de graduações, períodos letivos, usuários, funções e atribuição de coordenadores permanecem sob administração global.
- **BREAKING**: substituir matrícula direta na unidade de conteúdo chamada curso por vínculo do aluno à turma de uma disciplina; o acesso às atividades decorre desse vínculo. Professores passam a atuar nas turmas vinculadas, e a coordenação tem acesso restrito aos cursos sob sua responsabilidade.
- **BREAKING**: transferir tópicos, materiais, questões e publicação de conteúdo para a disciplina. O professor mantém conteúdo das disciplinas em que leciona, conforme seus vínculos com turmas; a graduação deixa de ser criada e publicada como trilha pelo professor.
- Após a primeira resposta em qualquer turma da disciplina, bloquear adição, remoção e reordenação de tópicos e proteger questões respondidas contra exclusão ou mudanças de interpretação e avaliação. Permitir ajustes seguros em materiais, preservando históricos e todos os resultados já obtidos, inclusive conclusão e datas de conquistas.
- Validar toda alteração de conteúdo publicado: a disciplina deve continuar com tópicos e ao menos uma questão de cada dificuldade por tópico. Uma edição inválida deve ser rejeitada integralmente, preservando conteúdo anterior, publicação e dados dos alunos.
- **BREAKING**: contextualizar domínio por tópico, histórico, desbloqueios e conclusão da trilha na disciplina e na turma do aluno. Concluir uma trilha de estudo não significa concluir a graduação ou obter aprovação acadêmica na disciplina.
- Adequar catálogo, navegação, áreas por perfil e painéis básicos à hierarquia acadêmica; reposicionar XP, sequência de dias e conquistas no contexto de estudo da disciplina/turma.
- Na coordenação, exibir médias somente por turma, incluindo os matriculados que não iniciaram com valor zero. Calcular sobre valores sem arredondamento intermediário, arredondar apenas a exibição para o inteiro mais próximo e apresentar “Sem dados” para turma sem alunos; não oferecer média global entre turmas, disciplinas ou graduações.
- Preparar dados fictícios que demonstrem mais de uma disciplina por graduação e ofertas em turmas e períodos distintos, permitindo revisar a separação de vínculos, acessos e progresso.

**Fora desta primeira entrega:** diagnóstico inicial ou provas de nivelamento; monitoria, seleção de monitores e encaminhamentos; integrações institucionais com sistemas acadêmicos, AVA ou identidade institucional; indicadores avançados, como previsão de evasão, análises preditivas e comparações históricas institucionais. Permanecem apenas os indicadores básicos já demonstrados, como progresso, domínio por tópico e taxa de acertos, adaptados ao contexto acadêmico. Autenticação real, back-end, banco de dados, dados reais, pagamentos e aulas ao vivo continuam fora do escopo.

## Capabilities

### New Capabilities

A base consolidada `openspec/specs/` passou a conter as seis capacidades da entrega inicial (`edtech-adaptativa-fase-inicial`, arquivada em ação separada e autorizada). Somente uma capacidade é nova:

- `organizacao-academica`: estrutura de graduações, disciplinas, períodos letivos e turmas, com manutenção básica e vínculos aluno–turma, professor–turma e coordenador–curso.

### Modified Capabilities

As seis capacidades herdadas recebem deltas sobre a base real. `MODIFIED` traz o bloco completo, com o nome exato da base e seus cenários originais preservados; `ADDED` traz comportamento novo; `REMOVED` traz `Reason` e `Migration` para os comportamentos substituídos (perfil único, automatrícula e escopos por curso). `RENAMED` não é usado, pois nenhuma substituição foi apenas de nome.

- `perfis-acesso`: funções cumulativas e Coordenador, acesso por função e vínculo, gestão acadêmica restrita aos cursos coordenados; `MODIFIED`: entrada simulada e administração de usuários; `REMOVED`: perfis de usuário suportados, acesso restrito por perfil e vínculos entre usuários.
- `catalogo-cursos`: catálogo de graduações e disciplinas, ofertas e acesso às turmas sem automatrícula; `MODIFIED`: busca e filtro; `REMOVED`: catálogo e detalhe de cursos, **matrícula em curso** (migra para a matrícula administrativa em turma) e meus cursos.
- `gestao-conteudo-curso`: conteúdo por disciplina, bloqueio estrutural, proteção de questões respondidas, correção textual confirmada e validade contínua; `MODIFIED`: tópicos, materiais e banco de questões; `REMOVED`: criação e publicação de curso e escopo do professor.
- `aprendizado-adaptativo`: trilha por aluno e turma, retomada, preservação em edições e respostas somente no contexto autorizado; `MODIFIED`: domínio, dificuldade, escolha, desbloqueio, feedback e revisão; `REMOVED`: trilha por curso e conclusão do curso.
- `gamificacao`: XP, sequência e conquistas por turma; `MODIFIED`: sequência, conquistas e exibição; `REMOVED`: XP por curso.
- `acompanhamento-desempenho`: painéis por função e vínculo, médias por turma com precisão e "Sem dados"; `MODIFIED`: painel do aluno, alunos com dificuldade, detalhe de aluno, painel do responsável e visão geral do administrador; `REMOVED`: painel do professor por curso.

## Impact

- A base existente é um protótipo React/TypeScript/Vite em `prototipo/`, com repositório sobre `localStorage`. A evolução afetará os tipos e vínculos de domínio, dados de demonstração, repositório, rotas e permissões, catálogo, editor de conteúdo, motor adaptativo, gamificação, painéis e testes que hoje dependem de `cursoId`.
- A documentação em `docs/` precisará refletir os novos conceitos, atores, jornadas e rastreabilidade. A change anterior permanece como registro da primeira entrega; sua conclusão não implica compatibilidade com o novo modelo.
- Os dados locais atuais têm estrutura incompatível. Propõe-se restaurar uma nova base fictícia versionada, sem migrar históricos de demonstração; isso deve ser informado na experiência de atualização do protótipo.
- Não se prevê API pública, serviço externo ou nova dependência obrigatória para esta entrega. A change foi implementada nas tarefas 1–8 (ver `tasks.md` e `docs/validacao-final.md`).

### Premissas

- O produto continua sendo um protótipo navegável para uma faculdade fictícia, com entrada simulada, dados locais e restauração da demonstração.
- Inicialmente, cada disciplina pertence a um curso; cada turma pertence a uma disciplina e a um período letivo. Alunos e professores podem ter vínculos com várias turmas, e coordenadores com vários cursos.
- O conteúdo pertence à disciplina e é compartilhado entre suas turmas; progresso e gamificação ficam separados por aluno e turma, sem reaproveitamento automático entre períodos. As regras adaptativas básicas são mantidas, sem diagnóstico inicial.
- As funções são cumulativas por pessoa, incluindo Professor e Coordenador na mesma conta. O Coordenador gerencia os cursos vinculados, suas disciplinas, turmas, matrículas e vínculos docentes; o Administrador mantém o escopo global. O perfil Responsável permanece com acompanhamento básico dos alunos vinculados, contextualizado nas disciplinas/turmas.

### Decisões confirmadas na revisão

- Disciplinas têm cadastros próprios em cada graduação; seu conteúdo é compartilhado entre turmas da mesma disciplina, sem versões por oferta nesta entrega.
- A coordenação também gerencia os cursos e vínculos dentro de seu escopo. A atribuição de coordenadores a cursos permanece com o Administrador; o vínculo de coordenação, por si só, não autoriza editar ou publicar conteúdo pedagógico.
- O Responsável permanece e funções cumulativas são permitidas, preservando as permissões e os vínculos de cada função.
- Progresso e gamificação começam do zero em cada nova turma, inclusive em outro período, sem reaproveitamento automático.
- Matrículas são feitas pelo Administrador ou pelo Coordenador autorizado para o curso da turma; não há automatrícula nem solicitação de ingresso do aluno nesta entrega.
- Conteúdo compartilhado fica sujeito ao bloqueio estrutural após a primeira resposta em qualquer oferta, inclusive quando a edição parte de outra turma ou de um Administrador. Ajustes permitidos não reiniciam nem recalculam resultados anteriores.
- Correções em enunciado, texto das alternativas e explicação de questões respondidas exigem exibição da diferença e confirmação humana do próprio autor autorizado, sem segunda pessoa. A confirmação vale apenas para a alteração exata e a revisão original; novas alterações exigem nova confirmação. Significado, correspondência e ordem das alternativas são preservados; identidade, tópico, dificuldade, gabarito e exclusão continuam bloqueados. Respostas antigas exibem o conteúdo original sem alteração dos resultados ou datas.
- Progresso médio e domínio médio por tópico são calculados por turma, incluindo todos os seus matriculados; não haverá média global da coordenação nesta entrega.

### Dependência de consolidação (cumprida)

A change `edtech-adaptativa-fase-inicial` foi arquivada em ação separada e autorizada (`openspec/changes/archive/2026-11-17-edtech-adaptativa-fase-inicial`), o que criou a base `openspec/specs/`. Em seguida os deltas desta change foram reconciliados contra essa base, requisito a requisito, eliminando as regras de perfil único, automatrícula e escopo por curso, e a validação estrita foi repetida antes do arquivamento desta change.
