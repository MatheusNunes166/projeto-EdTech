# Tasks

Lista de implementação futura, após revisão desta change. Nenhuma tarefa foi executada nesta etapa documental. Os comandos de teste e build abaixo partem de `prototipo/`. Cada grupo entrega também as verificações e a documentação necessárias à mudança daquele grupo.

## 1. Base visual e componentes de apresentação

- [x] 1.1 Ajustar tokens de fundo claro, superfícies, bordas, espaçamento e foco conforme D1, com classes de layout específicas para entrada e telas do aluno; verificar em navegador cartões e cabeçalho sem sobreposição e sem alteração da estrutura dos formulários dos demais perfis.
- [x] 1.2 Reaproveitar ou compor contexto acadêmico e progresso a partir dos componentes atuais, mantendo o valor exato nos dados e o arredondamento somente na apresentação; verificar `BarraProgresso` com nome, valor acessível e porcentagem legível fora de preenchimento com contraste variável.
- [x] 1.3 Aplicar limites flexíveis e quebra de textos nas telas do aluno, incluindo catálogo, detalhe, materiais e desempenho; verificar cada uma a 360 px com nomes longos, sem corte ou rolagem horizontal da página ou dos cartões.

## 2. Entrada por função e pessoa

- [x] 2.1 Reorganizar `Entrada.tsx` para derivar funções disponíveis da consulta pública existente e filtrar candidatos ativos após a escolha; verificar ausência de pessoas na primeira etapa, exclusão de Paulo inativo e ausência de e-mails ou vínculos na segunda.
- [x] 2.2 Implementar Voltar às funções, estados de carregamento, erro e lista vazia após atualização; verificar a troca Professor → Aluno sem iniciar sessão e sem conservar candidatos ou mensagens da função anterior.
- [x] 2.3 Navegar para a função selecionada após conferir as funções retornadas pela entrada, tratando perda da função ou desativação entre listagem e seleção; verificar Carla entrando diretamente em Coordenação, troca para Professor na mesma conta e rejeição da seleção desatualizada sem dados restritos.
- [x] 2.4 Adaptar os helpers de entrada e os testes afetados em `src/testes/`, acrescentando cenários de função sem candidatos, volta de etapa, seleção desatualizada e entrada cumulativa; verificar `npm test -- src/testes/shell.test.tsx src/testes/integracao-funcoes.test.tsx` sem remover as asserções de autorização, saída ou revogação.
- [x] 2.5 Atualizar a orientação de entrada no `README.md` do protótipo; verificar que descreve função antes da pessoa, dados fictícios sem senha, área escolhida e troca de áreas da mesma conta.

## 3. Navegação compartilhada e Demonstração

- [x] 3.1 Reorganizar `Layout.tsx` com cabeçalho compacto, área e seção atuais, menu completo, pessoa, troca de área e Sair; verificar navegação por links e endereços diretos nas cinco funções, incluindo seções internas de estudo, conteúdo e gestão, sem destinos perdidos.
- [x] 3.2 Agrupar os controles autenticados de data e restauração em Demonstração inicialmente recolhida e oferecer somente restauração no agrupamento da entrada; verificar que abrir e fechar não grava dados e que Simular próximo dia avança exatamente um dia usando a revisão atual.
- [x] 3.3 Reaproveitar `Restauracao` com confirmação explícita, aviso de perda de histórico e encerramento da sessão; verificar foco ao abrir e cancelar, preservação de dados e sessão ao cancelar ou falhar e retorno à entrada após confirmação bem-sucedida.
- [x] 3.4 Atualizar os testes de shell para expandir os controles antes de usá-los e cobrir seção atual, conteúdo recolhido, restauração e aviso inicial de incompatibilidade; verificar `npm test -- src/testes/shell.test.tsx`, inclusive falha de gravação sem estado parcial ou substituição automática.
- [x] 3.5 Documentar o novo acesso aos controles no `README.md` do protótipo; verificar que informa onde avançar o dia e restaurar, os efeitos de confirmar e a preservação do aviso inicial para dados incompatíveis.

## 4. Minhas turmas e acesso ao desempenho

- [x] 4.1 Reorganizar os cartões de `MinhasTurmas.tsx` com identificação acadêmica completa e associação dos indicadores por `matriculaId`; verificar ofertas de Ana em 2026.2 e 2027.1 separadas e mensagens de carregamento ou erro sem valores zero presumidos.
- [x] 4.2 Aplicar a tabela de estados de D4 e os rótulos Começar trilha, Continuar trilha e Ver trilha com Desempenho secundário; verificar Diego sem respostas, fixture com respostas e 0% de progresso, Elisa concluída e conteúdo em rascunho sem ação de estudo.
- [x] 4.3 Preservar o painel `Desempenho.tsx`, seu retorno à matrícula e a distinção entre taxa zero com e sem respostas; verificar indicadores acadêmicos completos, Sem atividade somente sem respostas e indicação de atividade para fixture com apenas erros.
- [x] 4.4 Adaptar e ampliar os testes correspondentes em `src/testes/aluno.test.tsx`; verificar `npm test -- src/testes/aluno.test.tsx` com os três destinos na matrícula correta, estado vazio, rascunho, atraso/falha de indicadores e catálogo sem automatrícula.

## 5. Trilha e gamificação sob demanda

- [ ] 5.1 Reorganizar `Trilha.tsx` com progresso, ação principal e tópicos ordenados com domínio e estados textuais; verificar sequência cadastrada, materiais somente dos tópicos liberados e Desempenho da mesma turma acessível.
- [ ] 5.2 Destacar Próximo recomendado usando `proxima.topicoId`, sem reproduzir o motor ou reordenar a lista; verificar menor domínio, empate por ordem, trilha concluída sem atividade e próxima atividade ausente sem falsa conclusão, usando fixtures sem alterar o seed.
- [ ] 5.3 Exibir XP e sequência compactos e Conquistas (N) em detalhes inicialmente recolhidos; verificar nomes e datas ao expandir, mensagem sem conquistas e independência dos indicadores entre períodos, sem gravações provocadas pela expansão.
- [ ] 5.4 Atualizar os testes de trilha em `src/testes/aluno.test.tsx` para a recomendação, conclusão, materiais e conquistas recolhidas; verificar o comando direcionado desse arquivo com preservação das asserções de XP, datas, retomada e bloqueios de tópico.

## 6. Sessão de estudo e interação acessível

- [ ] 6.1 Montar a sessão em duas colunas a partir de 900 px e faixa compacta abaixo disso, com somente os cinco elementos de contexto definidos em D6; verificar a 1280 px e 360 px a questão com maior destaque e ausência de indicadores extras no resumo.
- [ ] 6.2 Adaptar o cartão para alternativas em grade quando houver espaço e empilhadas abaixo de 640 px, mantendo rádio, ordem original e envio explícito; verificar 360 px com texto longo e quantidade variável de alternativas, seleção sem envio e Responder indisponível sem seleção ou durante envio.
- [ ] 6.3 Preservar atividade, seleção e resultado locais durante atualização de consultas e redimensionamento; verificar uma única resposta por envio, erro sem perda da seleção, feedback completo e nenhuma troca automática de questão.
- [ ] 6.4 Manter revisão sugerida com acesso a materiais e Continuar mesmo assim, Próxima questão nos outros casos e Ver trilha na conclusão; verificar segundo erro no mesmo tópico/turma, avanço somente explícito e fim de trilha sem nova atividade.
- [ ] 6.5 Implementar salto ao conteúdo e foco em transições de etapa, página e questão, completando rótulos textuais e anúncios de feedback; verificar por teclado entrada → turma → trilha → sessão → avanço, expansores e cancelamento da restauração, sem perda de foco ou dependência de cor.
- [ ] 6.6 Atualizar os testes de sessão e foco nos arquivos de aluno e shell; verificar `npm test -- src/testes/aluno.test.tsx src/testes/shell.test.tsx`, cobrindo feedback estável após invalidação, envio duplicado, revisão, conclusão e destino do foco após avanço.

## 7. Verificação integrada e evidências para revisão

- [ ] 7.1 Percorrer o fluxo completo a 1280 px, 768 px e 360 px, incluindo as duas etapas de entrada e todas as telas do aluno, com Demonstração e Conquistas abertas e fechadas; verificar ausência de rolagem horizontal e sobreposição, preservação do feedback ao redimensionar e registrar capturas com larguras e estados usados na revisão da implementação.
- [ ] 7.2 Medir os contrastes e realizar uma passagem por teclado e leitura dos nomes/estados acessíveis; verificar razões AA definidas na spec, foco visível, seleção e resultados identificados por texto, estado dos expansores e progresso com nome e valor; registrar os resultados junto às evidências da implementação.
- [ ] 7.3 Verificar regressão com dados locais compatíveis já alterados, sem restaurar a demonstração, alternando pessoas, áreas e ofertas; confirmar histórico, matrículas, progresso, XP e conquistas preservados, acesso negado por endereço indevido, menus dos cinco perfis funcionais e painéis/formulários dos demais perfis intactos.
- [ ] 7.4 Executar `npm test` e `npm run build` e revisar o diff final; verificar ambos com saída bem-sucedida, documentação coerente e ausência de mudanças no seed, armazenamento, motor, regras acadêmicas, permissões e gamificação além da apresentação prevista.
