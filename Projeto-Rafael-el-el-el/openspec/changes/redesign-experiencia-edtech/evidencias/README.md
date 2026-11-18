# Verificações do redesign

## 1. Base visual

Baseline em `8e3a65c` com 662 testes em 42 arquivos e build aprovado. Node 26 com `--no-experimental-webstorage` somente no processo de testes. Em Chrome headless, Minhas turmas e Períodos e turmas foram conferidas a 1280 px e 360 px com nomes de disciplinas e graduações longos, em perfil isolado. Tab e Enter no salto para o conteúdo focaram o elemento principal. A inspeção visual detectou navegação estreita demais no cadastro e a composição foi ajustada. As quatro capturas do grupo registram a nova paleta e os campos com larguras distintas. O menu compacto e a edição sob demanda entram nos grupos seguintes.

## 2

34 testes de shell e integração e build aprovados. O ambiente Vitest mantém Request, AbortController e AbortSignal do Node da mesma origem para o novo roteador. No Chrome, 25 destinos abriram com os guardas atuais. Conta e Menu foram operados por teclado nas cinco áreas a 1280 px e 360 px, com foco retornando ao acionador e documento acadêmico idêntico. As capturas 02 mostram o menu administrativo.

## 3

36 testes de componentes e shell e build aprovados. Em Chrome, a restauração abriu com foco em Cancelar e Escape devolveu o foco ao acionador, com os mesmos dados, em 1280 px e 360 px. O jsdom recebeu apenas a adaptação de abertura e fechamento do diálogo. O navegador confirmou a modalidade nativa e revelou uma disputa de Escape com o expansor pai, corrigida no diálogo.
