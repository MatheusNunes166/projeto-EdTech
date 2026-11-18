# Evidências de diagnóstico

Estas evidências mostram a interface anterior à implementação de refinar-navegacao-e-interacao, em Chrome 157.0.8103.51, acessando http://localhost:5173/ em 18/11/2026. Não são capturas de uma implementação desta change.

- [Diagnóstico por rota](../diagnostico.md): inventário completo e relação problema/ação/captura.
- [Inventário renderizado](rotas-observadas.json): 75 registros, 25 rotas × 1280/768/360 px; nenhuma página com largura maior que o viewport nas amostras.
- [Jornadas por perfil](jornadas-por-perfil.json): 15 passagens pela entrada, cinco perfis × três larguras, com seleção por teclado e consulta/abertura de edição; documento inalterado em cada percurso. Inclui recusa por acesso direto fora do vínculo.
- [Estados exercitados](fluxos-observados.json): 29 estados únicos, incluindo perda de busca no retorno, seleção/resposta, rascunho, descarte cancelado, falha injetada, salvamento, retorno da coordenação, validação rejeitada e textos longos. Coordenadas das ações são relativas à área observada no estado registrado, com viewport de 960 px de altura.
- [Estados complementares](estados-complementares.json): seção de períodos/turmas da Coordenação nas três larguras, remoção efetivamente cancelada e diferença de Escape entre acionador e links do Menu.
- [Preservação](preservacao.json): dados do perfil isolado restaurados ao snapshot entre os ensaios; salvamento do material não alterou respostas antigas.
- [Contrastes propostos](contrastes-propostos.json): cálculo nominal da nova paleta do design, separado da inspeção do CSS atual.

São 111 PNGs: 75 de inventário e 36 de estados/variações. Os arquivos 01–25 têm sufixo de largura; 26–51 registram estados específicos. A tabela do diagnóstico liga as 25 rotas às três capturas; os demais nomes descrevem o estado.

Reprodução: iniciar o Vite sem editar fontes; abrir perfil de navegador vazio, entrar pelas pessoas fictícias do seed e seguir as rotas/percursos do diagnóstico. Para falha de persistência, usar somente fixture/perfil isolado e recusar a gravação acadêmica com QuotaExceededError, restaurando a persistência antes da nova tentativa. Para nomes longos, usar cópia isolada do documento fictício e restaurar o snapshot depois. Não executar esses ensaios no armazenamento pessoal existente.

A inspeção usa navegador de verdade controlado por CDP, com capturas e DOM/geometria renderizados, além de cliques e teclado. Headless/emulação de largura não comprova touch, leitor de tela ou teclado virtual de dispositivo. Código foi lido para fundamentar decisões, sem ser apresentado como prova visual. Testes/npm build não foram executados nesta rodada exclusivamente documental; a verificação executada é a inspeção atual e a validação estrutural dos artefatos.

