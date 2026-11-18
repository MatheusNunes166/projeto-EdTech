# Verificações do redesign

## 1. Base visual

Baseline em `8e3a65c` com 662 testes em 42 arquivos e build aprovado. Node 26 com `--no-experimental-webstorage` somente no processo de testes. Em Chrome headless, Minhas turmas e Períodos e turmas foram conferidas a 1280 px e 360 px com nomes de disciplinas e graduações longos, em perfil isolado. Tab e Enter no salto para o conteúdo focaram o elemento principal. A inspeção visual detectou navegação estreita demais no cadastro e a composição foi ajustada. As quatro capturas do grupo registram a nova paleta e os campos com larguras distintas. O menu compacto e a edição sob demanda entram nos grupos seguintes.

## 2

34 testes de shell e integração e build aprovados. O ambiente Vitest mantém Request, AbortController e AbortSignal do Node da mesma origem para o novo roteador. No Chrome, 25 destinos abriram com os guardas atuais. Conta e Menu foram operados por teclado nas cinco áreas a 1280 px e 360 px, com foco retornando ao acionador e documento acadêmico idêntico. As capturas 02 mostram o menu administrativo.

## 3

36 testes de componentes e shell e build aprovados. Em Chrome, a restauração abriu com foco em Cancelar e Escape devolveu o foco ao acionador, com os mesmos dados, em 1280 px e 360 px. O jsdom recebeu apenas a adaptação de abertura e fechamento do diálogo. O navegador confirmou a modalidade nativa e revelou uma disputa de Escape com o expansor pai, corrigida no diálogo.

## 4

61 testes administrativos, de integração e revogação e build aprovados. A 1280 px e 360 px o teclado abriu somente o formulário escolhido e cancelou a remoção contextualizada com documento idêntico. Os testes confirmaram que candidatos incompatíveis não são apresentados, os comandos rejeitam pedidos inválidos e apenas a relação confirmada é removida.

## 5

87 testes direcionados e build aprovados, mais o teste de revogação com a confirmação docente aberta (arquivo de coordenação com 12 aprovados). Chrome conferiu 14 aberturas de formulários por teclado a 1280 px e 360 px, e a jornada completa de Administração criando graduação, atribuindo coordenação, cancelando e confirmando remoção. O teste de contrato distingue a indicação de identidade protegida da entrada editável do comando.

## 6

51 testes de Professor, shell e integração e build aprovados. A 1280 px e 360 px, o teclado percorreu turma, aluno, expansão da resposta e retorno à mesma turma. A consulta preservou o documento. O histórico detalhado agora inclui a explicação do conteúdo original e o teste de correção textual verifica a versão original visível.

## 7

149 testes direcionados e build aprovados. No Chrome a 1280 px e 360 px, o Professor entrou, consultou um aluno, editou material, alternou para o banco, voltou ao rascunho, cancelou a saída e salvou. O editor administrativo também foi aberto nas duas larguras. Os testes cobriram Voltar interno, Sair e restauração cancelados, falha de persistência, revisão e gabarito protegidos, cobertura indivisível e histórico imutável.

## 8

68 testes de Aluno, shell e integração e build aprovados. As sete rotas foram abertas em 1280 px e 360 px. A jornada por teclado passou por material, trilha, sessão e desempenho. O redimensionamento conservou seleção e feedback, a mudança de questão focou o enunciado e somente o envio registrou uma resposta.

## 9

79 testes direcionados e build aprovados. A projeção foi conferida separadamente com 15 testes após acrescentar a verificação dos títulos. A jornada em Chrome selecionou os quatro critérios, abriu os domínios, atribuiu uma docente e retornou à mesma oferta em 1280 px e 360 px. As respostas permaneceram idênticas. Os casos de 40%, precisão, turma vazia e filtro sem resultado passaram.

## 10

22 testes de Responsável, indicadores e integração e build aprovados. Chrome percorreu entrada, as ofertas de Ana nos dois períodos, o expansor e a saída por teclado em 1280 px e 360 px. Documento acadêmico idêntico. O teste de revogação removeu a oferta da tela na próxima consulta e confirmou histórico intacto.

## 11

Suíte completa com 669 testes aprovados em 43 arquivos (baseline de 662 em 42) e tipagem/build aprovados. Chrome abriu os 25 destinos a 1280 px e 360 px com nomes longos. As 50 medições registraram zero overflow de página ou das caixas verificadas. As jornadas das cinco funções e os controles por teclado estão registrados em cada grupo. A amostra de contraste dos elementos renderizados passou, incluindo foco, borda de campo e ação principal. Sobre a demonstração isolada após avanço de dia, cancelar remoção, restaurar e sair do editor preservou o rascunho quando aplicável, e acesso indevido manteve os dados ocultos. O documento acadêmico, com 57 respostas, teve o mesmo SHA-256 antes e depois nas duas larguras. OpenSpec estrito aprovado e status com 4/4 artefatos. A consolidação de reorganizar-experiencia-frontend e a reconciliação dos deltas continuam pendentes para a etapa de arquivamento.
