# Proposal

## Why

A interface atual já permite as jornadas acadêmicas, mas perde os filtros ao voltar do detalhe do catálogo, dispersa a orientação entre cabeçalho e conteúdo e afasta Salvar/Descartar no editor longo. A inspeção real das 25 rotas em 1280, 768 e 360 px fundamenta um refinamento de composição, navegação e feedback, preservando as funcionalidades entregues.

## What Changes

- Padronizar cabeçalho de página, contexto acadêmico, breadcrumbs úteis e retornos com destino explícito, inclusive por URL direta; preservar critérios, seleção e rascunhos nas transições aplicáveis.
- Alinhar cabeçalho, títulos, listas, indicadores, campos e ações; reservar colunas estáveis para dados comparáveis, tratar nomes extensos e limitar a largura dos textos de leitura.
- Evoluir a identidade existente com índigo para ação/seleção, verde azulado para contexto informativo e cores semânticas para sucesso, atenção e erro; definir hierarquia de botões, ícones consistentes, estados interativos e transições reduzíveis.
- Tornar resultados de comandos perceptíveis junto à tarefa, com operação/recurso identificados, carregamento textual, bloqueio de repetição e erros que mantêm os valores e orientam a correção.
- Aluno: preservar filtros ao voltar ao catálogo e melhorar o encadeamento próximo passo → seleção → envio → resultado → continuidade explícita, sem alterar o motor ou a contabilização do estudo.
- Professor/Administrador autor: localizar itens por texto e metadados do conteúdo autorizado, conservar o rascunho conjunto e alcançar Salvar/Descartar em formulários longos; proteger revisão textual, cobertura e resultados existentes.
- Administração/Coordenação: compor listas e filtros de forma consistente, com ações equivalentes alinhadas, cadastro acadêmico separado do conteúdo e retorno contextualizado da gestão aos indicadores.
- Responsável: reforçar a identificação aluno–oferta e explicar o significado de progresso, sequência e atividade, mantendo somente os vínculos permitidos. Entrada: evidenciar a sequência função → pessoa → entrar.
- Verificar as 25 rotas nas três larguras, teclado, foco, contraste AA, textos extensos, erros e preservação de dados; barras de ações não podem encobrir campos, mensagens ou foco.

**Diagnóstico e evidências:** [diagnostico.md](diagnostico.md) relaciona cada rota, ação afetada e captura. Em navegador, confirmou-se a perda da busca e dos filtros aplicados ao catálogo no retorno; Salvar aparece aproximadamente a 1767/1707/2069 px do topo nos editores a 1280/768/360 px; metadados de pessoas mudam de coluna conforme o conteúdo e as barras de progresso docentes ficam muito estreitas. Os retornos usam formatos distintos e a sessão os coloca no resumo lateral. Remover e Editar usam o mesmo tratamento azul em listas; Escape não fecha Menu quando o foco permanece no acionador. A escolha de uma paleta mais expressiva é direção proposta, não uma falha de contraste comprovada. A cobertura observada, os pontos já corretos e os limites da inspeção estão separados no diagnóstico.

## Capabilities

### New Capabilities

- `navegacao-acessivel`: acrescentar contratos de retorno determinístico, preservação segura do contexto, grade, papéis de ações, feedback próximo e movimento/foco sem obstrução. O nome já é usado nas duas changes de frontend, mas continua ausente de `openspec/specs/`; reaproveitá-lo evita criar capacidade concorrente.

### Modified Capabilities

- `perfis-acesso`: acrescentar orientação visual entre as etapas de entrada, sem modificar identidade, funções cumulativas ou autorização.
- `catalogo-cursos`: acrescentar preservação e restauração dos critérios no percurso catálogo–detalhe–retorno.
- `aprendizado-adaptativo`: acrescentar critérios de leitura e interação dos estados do estudo, sem mudar progressão, escolha de questão ou avaliação.
- `gestao-conteudo-curso`: acrescentar localização de itens no rascunho e acesso seguro às ações do editor longo.
- `organizacao-academica`: acrescentar padrões de busca/apresentação nas listas de gestão autorizadas e preservação do contexto de edição.
- `acompanhamento-desempenho`: acrescentar rótulos explicativos e alinhamento de indicadores individuais e por oferta.

Os requisitos desta change são incrementais e usam **ADDED** contra a base atual: nenhum substitui, remove ou renomeia um requisito consolidado. Os contratos válidos da base e dos dois frontends implementados continuam sendo critérios de regressão. Alterar a classificação das capacidades nesta proposta não substitui reconciliar os blocos de requisitos antes da consolidação.

## Impact

- Implementação futura em `prototipo/src/estilos.css`, `telas/Layout.tsx`, `app/areas.ts`, rotas e contexto transitório, `componentes/{Gestao,comuns,Confirmacao,Expansor}.tsx`, proteção de rascunho e telas dos cinco perfis. Reutilizar React Router já instalado, consultas/comandos autorizados e componentes atuais; nenhuma dependência nova é necessária.
- Preservar URLs, guardas por função/vínculo/recurso, DTOs mínimos, revisões, validação integral e persistência única. Estado de filtros da URL não concede acesso. Não acrescentar operações acadêmicas ou exclusões inexistentes.
- Manter esquema, chaves, seed e dados locais compatíveis, histórico imutável, domínio, desbloqueios, progresso, XP, sequência, conquistas e datas. Gamificação mantém seus requisitos sem novo delta; mudanças de composição não geram estudo, matrícula ou restauração.
- Fora de escopo: diagnóstico pedagógico, monitoria, integrações institucionais, indicadores avançados/globais, autenticação real, backend, autosave, recuperação de rascunho após fechamento forçado, paginação remota e nova regra de publicação.
- **Premissas:** usar 768 px como largura intermediária; localizar registros somente dentro dos dados já autorizados; preservar rascunho no ciclo de navegação já suportado; não persistir dados pedagógicos ou preferências em novas chaves. A barra do editor e os ícones são decisões de apresentação detalhadas no design.
- **Dependência documental:** `reorganizar-experiencia-frontend` (31/31) e `redesign-experiencia-edtech` (56/56) permanecem implementadas, sem consolidação/arquivamento. Antes de consolidar esta change, consolidar as predecessoras em ordem em uma rodada autorizada, reler a base real e reconciliar os três conjuntos de deltas, preservando cenários. Não presumir `navegacao-acessivel` consolidada. Não há decisão de produto pendente bloqueante; aceite visual, teclado real em outros navegadores e teclado virtual móvel continuam verificações futuras, não resultados desta rodada.

