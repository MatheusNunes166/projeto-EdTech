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
