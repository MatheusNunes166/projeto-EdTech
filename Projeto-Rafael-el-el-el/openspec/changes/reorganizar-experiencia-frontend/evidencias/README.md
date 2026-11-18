# Revisão da implementação — 18/11/2026

Implementação em React, usando o HTML da raiz como referência de composição. Nenhuma dependência, rota acadêmica, versão de dados, chave de armazenamento ou regra de domínio foi alterada.

## Verificações por grupo

| Grupo | Evidência |
| --- | --- |
| 1 | Progresso com valor exato acessível e texto arredondado separado; 19 testes direcionados e build aprovados. [Medições com nomes longos a 360 px](grupo-1.json). |
| 2 | Entrada por função antes da pessoa; retorno de etapa, lista vazia/erro, seleção desatualizada e Carla entrando na Coordenação. 26 testes de shell/integração e build aprovados. [Navegador](grupo-2.json). |
| 3 | Menus das cinco funções e seção interna atual; Demonstração recolhida; avanço de um dia; cancelamento/falha preservam dados e sessão; foco da confirmação e retorno. 33 testes de shell/integração e build aprovados. [Navegador](grupo-3.json). |
| 4 | Ações Começar/Continuar/Ver trilha por matrícula, respostas com 0%, rascunho, carregamento e erro de indicadores; Desempenho secundário. 25 testes de aluno/integração e build aprovados. [Estados e destinos](grupo-4.json). |
| 5 | Ordem dos tópicos preservada; recomendação usa a próxima atividade recebida; conclusão e ausência de atividade; conquistas recolhidas e datas originais. 29 testes de aluno e build aprovados. [Navegador](grupo-5.json). |
| 6 | Questão principal e contexto restrito; alternativas longas/variáveis; seleção sem envio; uma resposta por envio; erro preserva seleção; feedback resiste à atualização/reautorização e resize; avanço explícito foca enunciado. 67 testes de aluno/shell e build aprovados. [Teclado e sessão](grupo-6.json). |
| 7 | 39 verificações de telas/estados em navegador, contraste, árvore de acessibilidade, preservação do documento, suíte completa e revisão do diff. [Relatório integrado](grupo-7.json). |

## Navegador, larguras e estados

Chrome headless instalado, controlado pelo protocolo DevTools (CDP), em perfil de revisão separado do navegador pessoal. Capturas integrais em [integracao/](integracao/), com largura no nome do arquivo:

- **1280, 768 e 360 px:** duas etapas de entrada, Minhas turmas, catálogo, detalhe, trilha, materiais, desempenho e sessão com feedback.
- **Detalhes:** Demonstração e Conquistas abertas/fechadas; os controles permanecem operáveis por teclado.
- **Textos longos:** nomes acadêmicos em uma fixture independente na origem local `localhost`; enunciados longos e oito alternativas na fixture da sessão. O seed do projeto não foi editado.
- **Resultado:** nenhuma página/cartão medido com rolagem horizontal, nenhum controle sobreposto e nenhuma colisão entre alternativas ou cartões irmãos. A questão ocupa a maior coluna no desktop; abaixo de 900 px o contexto fica acima da questão. Abaixo de 640 px as alternativas ficam em uma coluna.

Exemplos: [turmas a 360 px](integracao/360-minhas-turmas.png), [trilha a 1280 px](integracao/1280-trilha.png), [conquistas e foco a 360 px](integracao/360-foco-conquistas.png), [sessão a 1280 px](integracao/1280-sessao-feedback.png) e [sessão a 360 px](integracao/360-sessao-feedback.png).

## Teclado e acessibilidade

A passagem no navegador usou eventos reais de Tab, Shift+Tab, Enter, Espaço e setas: função → pessoa → turma → trilha → sessão → seleção → envio → Próxima questão → segundo erro/revisão. Não houve envio ao selecionar ou redimensionar; cada envio explícito gerou uma resposta. O enunciado recebeu foco após avançar. Foram verificados também salto ao conteúdo, expansores e confirmação/cancelamento da restauração, com retorno do foco ao acionador e sem gravação ao expandir/recolher.

A árvore de acessibilidade do Chrome confirmou nome/valor do progresso, seleção e desativação de rádios, e estados `expanded` dos expansores. Demonstração estava recolhida e Conquistas expandida/focada no registro integrado. Estados de seleção, acerto/erro, bloqueio, domínio e recomendação são textuais. O feedback permanece em região de anúncio educado e não recebe foco imperativo.

[Contrastes medidos](contraste.json): 21 pares essenciais passaram. Menor razão de texto comum: **4,68:1** (mínimo 4,5:1); menor razão entre os pares de componentes/indicadores medidos: **4,09:1** (mínimo 3:1). Foco azul sobre branco: **8,18:1**. Bordas decorativas e controles desativados não foram tratados como texto ou indicadores ativos.

## Preservação e regressão

A base compatível da revisão já tinha data avançada e respostas fictícias registradas pela interface. A verificação integrada não restaurou essa demonstração. Trocar pessoas/áreas, consultar ofertas, expandir detalhes, cancelar restauração e tentar endereços indevidos preservou **todos os bytes do documento**, incluindo revisão, matrículas, histórico e dados que originam progresso/XP/conquistas.

SHA-256 antes/depois: `c013356421a116f68a3a4222a6e48ac57cd0639363ae1b6aebc6218c1f8dad6b`. A data permaneceu 18/11/2026, com 61 respostas na fixture. Nenhuma leitura gerou resposta adicional. A fixture independente com nomes longos não alterou essa origem.

Menus das cinco funções conferidos. A passagem Carla Professor → Coordenador manteve a identidade. Acesso de Aluno à administração redirecionou à área permitida, e IDs disciplina/turma incompatíveis resultaram em acesso negado. Os testes existentes de Professor, Coordenador, Administrador e Responsável continuam passando, incluindo formulários e proteções. O diff desde `8e3cf93` não altera `dados`, `dominio`, `adaptativo`, `gamificacao`, `conteudo`, `desempenho`, dependências ou configuração de TypeScript.

## Comandos e ambiente

Baseline: **631 testes aprovados**. Resultado final: **662 testes aprovados em 42 arquivos**, sem falhas, além de tipagem/build aprovado e `openspec validate reorganizar-experiencia-frontend --strict` aprovado. A validação do OpenSpec é estrutural; a evidência de comportamento vem dos testes e da passagem em navegador.

No Node 26, foi mantido o ajuste local já conhecido para Vitest/jsdom, sem alterar configuração, dependências ou desativar testes:

```powershell
$env:NODE_OPTIONS = "$env:NODE_OPTIONS --no-experimental-webstorage"
npm test
npm run build
```

O CLI OpenSpec estava no PATH. O Chrome precisou executar fora do ambiente restrito para manter a sessão headless de verificação. A inspeção usou teclado e a árvore de acessibilidade do Chrome, sem alegar certificação por leitor de tela externo. O jsdom encontra nós dentro de `details` fechado; os testes verificam visibilidade, complementados por `checkVisibility()` e capturas no Chrome. Nenhuma política do sistema foi alterada.

Os sete grupos foram preparados em commits locais com arquivos selecionados e checklist verificado. Push e arquivamento continuam fora desta execução.
