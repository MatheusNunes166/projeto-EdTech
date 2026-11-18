# Tasks

Este checklist é de implementação futura: todas as tarefas permanecem desmarcadas. Referências: NA = navegacao-acessivel; PA = perfis-acesso; CC = catalogo-cursos; AA = aprendizado-adaptativo; GC = gestao-conteudo-curso; OA = organizacao-academica; AC = acompanhamento-desempenho. Os títulos citados são cenários dos deltas desta change; regras consolidadas e das predecessoras continuam critérios de regressão.

Verificação visual significa navegador real a **1280, 768 e 360 px**, com teclado e evidência por rota/estado; jsdom não substitui essa verificação. Usar fixtures isoladas, manter armazenamento/seed/chaves e comparar documento/revisão nas operações sem efeito. Cada grupo entrega seus testes, evidências e notas de uso junto da funcionalidade. Rodar testes pertinentes e build ao fechar cada grupo, sem marcar tarefas que ainda tenham verificação pendente.

## 1. Base visual, grade e componentes de apresentação

Depende dos artefatos revisados. Conferir status/diff e baseline real antes da primeira alteração; preservar mudanças alheias e a demonstração existente.

- [ ] 1.1 Aplicar os tokens semânticos de D1, fonte, escala e tipografia de D2 em estilos compartilhados; verificar os contrastes nominais e renderizados de texto/foco/controles/estados em navegador nas três larguras, registrando pares e razões sem depender de cor como único sinal. Cenários: NA — «Contraste de estados renderizados» e «Seleção e estados por diferentes entradas».
- [ ] 1.2 Alinhar container interno do Layout e conteúdo, limitar textos de leitura e padronizar intervalos de seções/campos; verificar 25 destinos sem largura/altura artificial, títulos e nomes completos, inclusive fixture >100 caracteres, em 1280/768/360 px. Cenários: NA — «Nomes longos em registros comparáveis», «Composição intermediária e estreita» e «Leitura sem faixa excessiva ou espaços artificiais».
- [ ] 1.3 Evoluir Registro/DadoRegistro e variantes de listas para colunas estáveis por finalidade, mantendo uma renderização por item e adaptação a pares rotulados; verificar em testes semânticos rótulos/ações associados e no navegador nomes curtos/longos sem deslocar ações ou comprimir barras. Cenários: NA — «Nomes longos em registros comparáveis» e AC — «Lista docente com escala comparável».
- [ ] 1.4 Documentar tokens, variantes e escala em guia de componentes e registrar evidências da base, incluindo redução de movimento; verificar testes dos componentes e npm run build, sem alterar dados ou dependências. Cenários: NA — «Redução de movimento», «Composição intermediária e estreita» e «Contraste de estados renderizados».

## 2. Localização, retornos e contexto transitório

Depende do grupo 1. Reutilizar RouterProvider, guardas e useBlocker já implementados.

- [ ] 2.1 Entregar cabeçalho de página e breadcrumbs/retorno comuns para hierarquias, com nomes de destino e aria-current; testar link real, URL direta e ordem de foco e conferir geometria em 1280/768/360 px, incluindo sessão com retorno antes do título e no resumo da mesma matrícula. Cenários: NA — «Retorno por URL direta» e «Hierarquia docente até o aluno».
- [ ] 2.2 Entregar resolução tipada de origem/destino e fallback por área, validando turma/disciplinas por consultas autorizadas; testar editor vindo de turma B, editor docente direto e administrativo, origem externa/inexistente/fora do escopo e conta cumulativa sem mistura de áreas ou dados. Cenários: NA — «Conteúdo aberto a partir da turma» e «Origem administrativa e parâmetro indevido».
- [ ] 2.3 Entregar suporte transitório a critérios/seleção/registro de retorno por pessoa e finalidade, sem DTO global ou persistência pedagógica; testar lista–detalhe–lista, registro removido, volta/avanço e limpeza na troca de pessoa ou revogação. Cenários: NA — «Lista reencontrada após detalhe» e «Revogação e troca de pessoa».
- [ ] 2.4 Integrar os novos links ao guardião de rascunho, com Continuar editando/Descartar e sair; testar breadcrumb, retorno, Voltar do navegador, troca de área, Sair e restauração cancelada, preservando o conjunto e confirmações válidas; conferir foco em navegador com teclado nas três larguras. Cenários: NA — «Edição pendente ao usar breadcrumb», «Confirmação de saída e troca interna» e OA — «Restauração cancelada no novo visual».
- [ ] 2.5 Aplicar orientação comum às famílias do mapa e documentar destinos/fallbacks, sem criar novas rotas acadêmicas; verificar testes de shell/rotas, npm run build e evidências de menu aberto/fechado, Escape no botão e nos destinos com precedência do modal, URL direta autorizada e negada. Cenários: NA — «Retorno por URL direta», «Origem administrativa e parâmetro indevido», «Escape no acionador e no conteúdo do menu» e «Revogação e troca de pessoa».

## 3. Ações, feedback e recuperação compartilhados

Depende dos grupos 1–2.

- [ ] 3.1 Entregar variantes principal/secundária/navegação/destrutiva e ícones SVG locais com rótulos; testar nomes acessíveis, sem duplicação do anúncio do ícone e sem mudança de operações, e conferir hover/foco/active/selecionado/indisponível nas três larguras. Cenários: NA — «Hierarquia de criar editar navegar e remover», «Seleção e estados por diferentes entradas» e «Ícone não substitui o nome da ação».
- [ ] 3.2 Entregar estado textual de operação pendente com largura estável e impedimento de reenvio usando os comandos atuais; testar promessa lenta e repetição por clique/teclado em salvar/atribuir/responder, sem efeito duplicado ou sucesso antecipado. Cenário: NA — «Operação lenta e acionamento repetido».
- [ ] 3.3 Entregar região contextual de resultado/erro, associação de campos e acesso à correção, sem descarte em falha; testar persistência recusada, validação e revogação antes de confirmar, comparando documento/revisão e dados em memória, e conferir visibilidade/anúncio no navegador. Cenários: NA — «Sucesso identificado na região da tarefa», «Falha ao salvar com correção orientada» e «Autorização revogada antes da ação».
- [ ] 3.4 Documentar estados e regras de foco, e aplicar transições breves/reduzíveis aos componentes; verificar testes direcionados, npm run build e teclado/reduced-motion/contraste renderizado nas três larguras, incluindo dialog aberto e Cancelar. Cenários: NA — «Redução de movimento», «Teclado no formulário longo» e «Contraste de estados renderizados».

## 4. Entrada e jornadas de consulta e estudo do Aluno

Depende dos grupos 1–3.

- [ ] 4.1 Aplicar a orientação de etapas à Entrada com descrições das funções e destino da pessoa; testar função disponível, pessoa cumulativa, voltar por teclado, pessoa inelegível e falha/entrada lenta sem reenvio e conferir 1280/768/360 px. Cenários: PA — «Função e próxima ação identificáveis», «Pessoa escolhida na área correta» e «Retorno acessível e entrada pendente».
- [ ] 4.2 Mover critérios do catálogo para navegação serializada e restaurá-los no retorno do detalhe; testar combinação dos quatro filtros, Voltar/Avançar, limpar, detalhe direto e critérios inválidos/externos sem vazamento ou matrícula, com consultas autorizadas inalteradas. Cenários: CC — «Filtro preservado no retorno», «Voltar e avançar pelo navegador», «Detalhe direto e critérios inválidos» e «Limpar filtros e retornar novamente».
- [ ] 4.3 Aplicar grade/contexto/retorno a Minhas turmas, detalhe, trilha, materiais e desempenho; testar ofertas em dois períodos, conteúdo em rascunho, estados Começar/Continuar/Concluída, materiais liberados/bloqueados e recomendação real, sem mutação por consulta. Cenários: AA — «Próximo passo e tópico bloqueado», NA — «Retorno por URL direta» e AC — «Zero sem atividade e Sem dados», além das regressões vigentes de Minhas turmas.
- [ ] 4.4 Refinar seleção/envio/feedback/continuidade na sessão usando o estado atual; testar alternativa longa por teclado, resize sem perda, envio lento/duplicado/falho, dois erros, conquista e conclusão, com próxima questão somente explícita e efeitos restritos à matrícula. Cenários: AA — «Seleção visível sem avaliação antecipada», «Envio e recuperação sem duplicação», «Resultado estável e continuidade voluntária» e «Conclusão e retorno coerentes».
- [ ] 4.5 Atualizar testes de entrada/aluno e guia de navegação/estudo com filtros preservados; verificar testes direcionados e npm run build e percorrer as oito rotas de Entrada/Aluno nas três larguras, com teclado, leitura de material e registro de uma resposta em fixture isolada. Cenários: PA/CC/AA deste grupo e NA — «Composição intermediária e estreita».

## 5. Editor pedagógico: localização, rascunho e ações longas

Depende dos grupos 1–4. O mesmo editor atende Professor e Administrador com autorizações distintas.

- [ ] 5.1 Entregar busca de tópicos/materiais e busca/filtros do banco por tópico/dificuldade sobre o candidato autorizado; testar localizar/selecionar/voltar, sem resultado/limpar e item em edição fora do filtro sem desmontagem ou ampliação de dados consultados. Cenários: GC — «Encontrar questão e recuperar a lista» e «Busca sem resultado conserva edição».
- [ ] 5.2 Preservar critérios, seleção, candidato inteiro e confirmações válidas entre seções, incluindo itens filtrados; testar material + questão pendentes, novo tópico + três dificuldades no mesmo salvamento, revisão obsoleta e revogação sem cache restrito. Cenários: GC — «Material e questão pendentes fora do filtro», «Revogação com item selecionado» e «Cobertura inválida com correção de item oculto».
- [ ] 5.3 Entregar região única de Salvar/Descartar/pendência/resultado aderente com reserva real de espaço, alvo de salto e fallback em fluxo para altura reduzida; testar semântica/acionamento e conferir no navegador 1280/768/360 px, texto 200%, último campo, links de erro, foco e teclado virtual quando disponível, registrando a limitação quando não houver dispositivo. Cenários: GC — «Ações disponíveis sem encobrir a edição» e NA — «Teclado no formulário longo» / «Celular com texto ampliado e confirmação».
- [ ] 5.4 Integrar erros de campos/itens e cobertura à região da tarefa com retorno à correção e nova tentativa; testar falha de persistência, validação integral e publicação bloqueada com rascunho, comparando documento/revisão/publicação/resultados anteriores e mantendo os campos. Cenários: GC — «Falha ao salvar no fim do formulário», «Cobertura inválida com correção de item oculto» e «Publicar não salva rascunho implicitamente».
- [ ] 5.5 Aplicar o padrão de comparação textual ao editor longo e manter confirmação do próprio autor para diferença exata/revisão original; testar aceitação, ausência de confirmação, outra diferença, nova edição, origem obsoleta, gabarito protegido mesmo com confirmação e descarte cancelado, com snapshot histórico/XP/datas intactos. Cenários: GC — «Correção textual confirmada pelo próprio autor», «Nova diferença exige nova confirmação» e «Descartar ou continuar editando».
- [ ] 5.6 Atualizar testes de professor/editor e guia de autoria/revisão, verificar testes direcionados e npm run build e percorrer ambas as rotas de conteúdo nas três larguras, com texto longo, filtro, rascunho, salvar, erro, publicar elegível e confirmação cancelada por teclado. Cenários: GC deste grupo e NA — «Conteúdo aberto a partir da turma», «Ação bloqueada compreensível» e «Sucesso identificado na região da tarefa».

## 6. Listas administrativas, cadastros e gestão acadêmica

Depende dos grupos 1–5 para reutilizar os padrões estabilizados. Não juntar cadastro estrutural e conteúdo.

- [ ] 6.1 Aplicar busca e filtros de função/situação a Pessoas, com colunas estáveis e formulário escolhido; testar nome/e-mail longo, funções cumulativas, salvar/erro/cancelar e retorno ao registro/critério, sem funções enviadas como autoridade. Cenários: OA — «Buscar registro e voltar da edição», NA — «Nomes longos em registros comparáveis» e «Falha ao salvar com correção orientada».
- [ ] 6.2 Aplicar busca e ações semânticas às listas separadas de Coordenação e Responsável–Aluno, mantendo candidatos por finalidade; testar atribuição, elegibilidade, remoção confirmada/cancelada, escopo de revogação e preservação de outros vínculos/históricos/revisão nas recusas. Cenários: OA — «Buscar registro e voltar da edição», «Busca e seleção no escopo da Coordenação» e «Confirmação e bloqueio preservam dados».
- [ ] 6.3 Aplicar busca por texto/relação aos cadastros de graduações/disciplinas e períodos/turmas, mantendo formulários/contextos separados; testar filtros preservados, datas de consulta legíveis sem conversão dos valores do comando, códigos duplicados, intervalo inválido, transferência de oferta bloqueada e manutenção exclusiva do Administrador ou no escopo coordenado. Cenários: OA — «Buscar registro e voltar da edição», «Datas legíveis sem mudar o período» e «Confirmação e bloqueio preservam dados», mais regras consolidadas de cadastro/identidade.
- [ ] 6.4 Aplicar busca/seletores por metadados à lista de ofertas e feedback consistente a matrícula/docência, preservando retorno da Coordenação; testar IDs incompatíveis, matrícula repetida sem perda, atribuição/remoção/revogação e turma vazia sem indicadores fictícios. Cenários: OA — «Origem dos indicadores e acesso direto à gestão», «Vazio filtrado e turma sem matriculados» e «Confirmação e bloqueio preservam dados».
- [ ] 6.5 Atualizar testes administrativos/gestão e guia dos cadastros, verificar testes direcionados e npm run build e conferir visão geral, pessoas, vínculos, dois cadastros e lista/detalhe de gestão em 1280/768/360 px por teclado, inclusive confirmação de remoção e restauração canceladas, sem substituir dados locais. Cenários: OA deste grupo, NA — «Hierarquia de criar editar navegar e remover» e OA — «Restauração cancelada no novo visual».

## 7. Acompanhamento do Professor

Depende dos grupos 1–6.

- [ ] 7.1 Aplicar busca/retorno contextual à lista docente e ligação ao conteúdo da mesma disciplina, com origem da turma validada; testar várias ofertas da mesma disciplina/períodos e URL direta, sem acesso às matrículas de outra turma não vinculada. Cenários: NA — «Conteúdo aberto a partir da turma» e «Lista reencontrada após detalhe».
- [ ] 7.2 Aplicar colunas e escala comum de progresso/taxa/situação/atividade ao painel, com rótulos e explicações; testar Sem atividade versus Precisa de atenção, limites existentes e layout de nomes longos, sem alterar médias. Cenários: AC — «Lista docente com escala comparável» e «Zero sem atividade e Sem dados».
- [ ] 7.3 Aplicar hierarquia/retorno e leitura limitada ao detalhe/histórico expandido do aluno; testar até dez respostas e snapshot original após correção textual, aluno em outra turma, retorno/seleção e documento/revisão inalterados pela consulta. Cenários: NA — «Hierarquia docente até o aluno» e AC — «Histórico expandido preserva a origem».
- [ ] 7.4 Atualizar testes e guia de acompanhamento docente, verificar testes direcionados e npm run build e percorrer lista → turma → aluno → turma → conteúdo em 1280/768/360 px por teclado, com menu/histórico abertos e nomes longos. Cenários: AC deste grupo e NA — «Composição intermediária e estreita».

## 8. Coordenação: seleção, indicadores e gestão da oferta

Depende dos grupos 1–7.

- [ ] 8.1 Aplicar hierarquia e rótulos aos quatro seletores existentes, preservando parâmetros e compatibilidade dos IDs; testar troca de graduação, resultado vazio e oferta de mesmo código em outro período, sem recaracterizar filtro como autorização. Cenários: OA — «Origem dos indicadores e acesso direto à gestão» e «Busca e seleção no escopo da Coordenação».
- [ ] 8.2 Aplicar alinhamento e explicações aos indicadores por turma/domínio por tópico usando as projeções e arredondamento atuais; testar 80% + 0% → 40%, outra turma sem influência, 100/6 sem arredondamento intermediário, empate 42,5 → 43 e turma vazia Sem dados, sem média global. Cenários: AC — «Médias da coordenação mantêm significado e precisão» e «Zero sem atividade e Sem dados», mais cenários consolidados de precisão.
- [ ] 8.3 Aplicar retornos/contexto aos cadastros e à gestão compartilhada da Coordenação; testar seleção preservada após comando, entrada direta, cancelamento e pessoa cumulativa em cursos diferentes, sem edição pedagógica ou histórico detalhado pelo vínculo de coordenação. Cenários: OA — «Origem dos indicadores e acesso direto à gestão», «Busca e seleção no escopo da Coordenação» e NA — «Origem administrativa e parâmetro indevido».
- [ ] 8.4 Atualizar testes e guia da Coordenação, verificar testes direcionados e npm run build e percorrer painel → seleção → gestão → retorno nas três larguras por teclado, incluindo turma sem alunos e busca sem resultados com mensagens distintas. Cenários: AC — «Médias da coordenação mantêm significado e precisão» e OA — «Vazio filtrado e turma sem matriculados».

## 9. Acompanhamento do Responsável

Depende dos grupos 1–8.

- [ ] 9.1 Aplicar composição de aluno/oferta com rótulos, unidades e explicações de progresso/sequência/última atividade; testar dois alunos, ofertas em períodos diferentes, detalhe expandido e texto longo sem somar indicadores ou esconder identidade acadêmica. Cenário: AC — «Responsável compreende aluno oferta e indicadores».
- [ ] 9.2 Aplicar estados de ausência/falha e revalidação mantendo os acessos limitados aos vínculos; testar aluno sem turma/atividade, vínculo removido e pessoa também Administrador, sem questões/colegas ou perda de outros acessos válidos. Cenários: AC — «Zero sem atividade e Sem dados», NA — «Revogação e troca de pessoa» e regressões vigentes de Painel do responsável.
- [ ] 9.3 Atualizar testes e guia do Responsável, verificar testes direcionados e npm run build e conferir entrada, leitura/expansão de ofertas e saída nas três larguras por teclado, comparando documento/revisão para provar consulta sem efeitos. Cenário: AC — «Responsável compreende aluno oferta e indicadores».

## 10. Integração e aceite final

Depende dos grupos 1–9. A documentação/testes de cada família já devem ter sido entregues; aqui verificar cruzamentos e completude.

- [ ] 10.1 Percorrer e registrar as 25 rotas do diagnóstico nas três larguras, incluindo estados relevantes, retornos por URL direta, teclado, Menu/Conta/Demonstração, nomes longos, contraste, reduced-motion e texto 200%; verificar ausência de rolagem horizontal/obstrução e corrigir diferenças de grade e ações. Cenários: NA — «Retorno por URL direta», «Composição intermediária e estreita», «Celular com texto ampliado e confirmação» e «Contraste de estados renderizados».
- [ ] 10.2 Executar jornadas integradas dos cinco perfis com contexto/filtros preservados, editor pendente/falho/revisão textual, resposta/feedback/continuidade e remoção confirmada/cancelada; verificar permissões na próxima operação após revogação, sem cache de outra pessoa ou alteração em recursos indevidos. Cenários: NA — «Revogação e troca de pessoa», «Autorização revogada antes da ação», CC — «Filtro preservado no retorno» e GC — «Nova diferença exige nova confirmação».
- [ ] 10.3 Conferir preservação sobre cópia isolada de dados compatíveis já utilizados: comparar documento, revisão, respostas/snapshots, domínio, desbloqueios, progresso, XP, conquistas/datas após consultas, filtros, retorno, erro e cancelamentos; verificar também que uma edição/resposta válida muda somente seu contexto e que seed/esquema/chaves permanecem. Cenários: OA — «Restauração cancelada no novo visual», GC — «Cobertura inválida com correção de item oculto» e AA — «Conclusão e retorno coerentes».
- [ ] 10.4 Executar npm test completo e npm run build, registrar contagem real e comparação com baseline e documentar eventual ajuste de ambiente necessário sem desativar testes ou enfraquecer validações; verificar comportamento do roteador/dialog real separadamente do jsdom. Referências: D10 e cenários transversais de NA/GC/AA/AC.
- [ ] 10.5 Revisar diff e documentação/evidências, verificar que as 25 rotas e todos os cenários têm rastreio e executar openspec validate refinar-navegacao-e-interacao --strict e openspec status --change refinar-navegacao-e-interacao; registrar estrutura documental, resultados de comportamento e revisão visual separadamente, mantendo a dependência de consolidação pendente. Referências: D10, Migration Plan e todos os sete deltas.

## Workflow follow-up

- **Dependência antes da consolidação/arquivamento:** as changes reorganizar-experiencia-frontend e redesign-experiencia-edtech estão implementadas e ainda não consolidadas. Não resolver essa pendência automaticamente neste checklist.
- Em rodada posterior autorizada, consolidar a primeira, reconciliar/consolidar a segunda, reler a base real e reconciliar os requisitos desta change, especialmente navegacao-acessivel e preocupações de apresentação sobrepostas.
- Manter ADDED apenas para requisitos efetivamente novos; sobreposição que altere comportamento exige MODIFIED com requisito e cenários completos. Preservar requisitos anteriores válidos; REMOVED/RENAMED somente se houver mudança real aprovada, inexistente neste plano.
- Revalidar estrutura e conteúdo após reconciliar, antes de qualquer arquivamento. A revisão deste planejamento não autoriza implementação, consolidação, commits ou push nesta rodada.

