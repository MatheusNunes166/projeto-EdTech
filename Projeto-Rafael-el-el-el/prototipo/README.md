# Protótipo EdTech de Aprendizado Adaptativo — organização acadêmica

Protótipo local (React + TypeScript + Vite) com dados **exclusivamente fictícios**, guardados no `localStorage` do navegador. Não há senha: a entrada é uma escolha simulada de pessoa de demonstração, e a autorização é um comportamento de protótipo, não uma fronteira de segurança.

## Comandos

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm test         # suíte de testes (Vitest)
npm run build    # verificação de tipos e build de produção
```

## Pessoas de demonstração

Cada pessoa tem funções explícitas e cumulativas (não há “perfil principal”). Vínculos não concedem funções.

Na entrada, escolha primeiro uma **função** disponível e depois uma **pessoa ativa** dessa função. A entrada é simulada, com dados fictícios e **sem senha**. Você pode usar **Voltar às funções** sem iniciar sessão. A área escolhida é aberta diretamente: escolher Coordenador e Carla abre a Coordenação. Em **Áreas da pessoa**, Carla pode trocar para Professor na mesma conta, mantendo os vínculos e permissões de cada função.

| Nome | E-mail | Funções | Vínculos |
| --- | --- | --- | --- |
| Ana Souza | ana@exemplo.com | Aluno | Algoritmos A e Inglês Inicial A (2026.2); Algoritmos A (2027.1, sem respostas) |
| Bruno Lima | bruno@exemplo.com | Aluno | Algoritmos B e Matemática Básica A (2026.2) |
| Elisa Prado | elisa@exemplo.com | Aluno | Algoritmos A (2026.2), trilha concluída |
| Diego Martins | diego@exemplo.com | Aluno | Algoritmos A (2026.2), sem respostas |
| Carla Dias | carla@exemplo.com | Professor, Coordenador | Professora de Matemática Básica (2026.2 e 2027.1); coordena Sistemas de Informação |
| Lúcia Ferraz | lucia@exemplo.com | Coordenador | Coordena a Licenciatura em Matemática (sem vínculo docente) |
| Marcos Silva | marcos@exemplo.com | Professor | Algoritmos A e B (2026.2) e A (2027.1) |
| Júlia Rocha | julia@exemplo.com | Professor | Inglês Inicial A e Geometria Plana A (rascunho) |
| Paulo Antunes | paulo@exemplo.com | Professor (inativo) | — |
| Renata Alves | renata@exemplo.com | Administrador | — |
| Helena Souza | helena@exemplo.com | Responsável | Acompanha Ana |
| Roberto Lima | roberto@exemplo.com | Responsável | Acompanha Bruno e Elisa |

Carla ilustra funções cumulativas em cursos diferentes: leciona Matemática Básica (Licenciatura em Matemática) e coordena Sistemas de Informação, sem que uma função amplie a outra.

## Estrutura acadêmica

| Graduação | Disciplina | Conteúdo |
| --- | --- | --- |
| Sistemas de Informação (SI) | Algoritmos (ALG) | publicado |
| Sistemas de Informação (SI) | Inglês Inicial (ING) | publicado |
| Licenciatura em Matemática (LM) | Matemática Básica (MAT) | publicado |
| Licenciatura em Matemática (LM) | Geometria Plana (GEO) | rascunho (cobertura incompleta, para demonstrar a publicação bloqueada) |

| Período | Início | Fim |
| --- | --- | --- |
| 2026.2 | 2026-08-03 | 2026-12-18 |
| 2027.1 | 2027-02-01 | 2027-06-30 |

| Disciplina | Turma | Período | Situação |
| --- | --- | --- | --- |
| ALG | A | 2026.2 | com alunos |
| ALG | B | 2026.2 | turma paralela |
| ALG | A | 2027.1 | mesma disciplina em outro período |
| ING | A | 2026.2 | com alunos |
| MAT | A | 2026.2 | com alunos |
| MAT | A | 2027.1 | turma vazia |
| GEO | A | 2026.2 | turma vazia, conteúdo em rascunho |

A data virtual inicial é **2026-11-17**. Os históricos de respostas são gerados pelo próprio motor adaptativo (nenhum contador é inventado), de modo que os painéis mostram progresso, XP, sequência e conquistas coerentes: Elisa concluiu a trilha com sete dias seguidos; Bruno aparece como “Precisa de atenção” em Algoritmos B; Diego e as matrículas de 2027.1 não têm respostas.

## Experiência de estudo

Em **Minhas turmas**, cada oferta tem seu próprio estado: **Começar trilha** sem respostas, **Continuar trilha** com atividade (mesmo a 0%) ou **Ver trilha** na conclusão. **Desempenho** continua disponível como ação secundária. Indicadores carregando ou com erro não são substituídos por zero.

A trilha mantém a ordem dos tópicos e destaca o **Próximo recomendado** informado pelo motor. XP e sequência aparecem em resumo; **Conquistas (N)** permite consultar nomes e datas. A sessão prioriza a questão e mantém o feedback até **Próxima questão**, **Continuar mesmo assim** ou saída. No celular, o contexto vira uma faixa acima da questão. A navegação oferece **Pular para conteúdo**, foco nos destinos e controles nativos por teclado.

As [evidências da reorganização](../openspec/changes/reorganizar-experiencia-frontend/evidencias/README.md) registram testes, capturas em três larguras, contraste e preservação dos dados locais.

## Dados locais, aviso de perda e restauração

O documento acadêmico usa o namespace `trilha-adaptativa:academico:*`. A versão anterior do protótipo usava `trilha-adaptativa:dados` e `trilha-adaptativa:sessao`.

- **Sem dados anteriores**, a demonstração nova é inicializada.
- **Com dados da versão anterior, de esquema incompatível ou JSON inválido**, nada é escrito durante a inspeção: o aplicativo avisa que o histórico fictício antigo **será apagado/substituído e não é migrado** para a estrutura de graduações, disciplinas e turmas. Só depois de **confirmar** a demonstração nova é gravada e a sessão antiga é encerrada. **Cancelar** não altera nenhuma chave nem abre sessão sobre dados incompatíveis.
- **Restaurar a demonstração** exige o mesmo aviso: as alterações atuais (cadastros, edições de conteúdo, respostas e data virtual) são descartadas ao confirmar, e a sessão é encerrada.
- Os controles ficam em **Demonstração**, recolhida por padrão em todas as áreas. Expanda para ver a data e **Simular próximo dia**, que avança exatamente um dia. Na entrada, Demonstração oferece somente a restauração, com aviso e confirmação; cancelar ou falhar preserva dados e sessão. Confirmar a restauração encerra a sessão e retorna à escolha de função. O aviso inicial de dados incompatíveis continua visível antes de qualquer substituição, fora do agrupamento recolhido.
- Os dados da versão anterior permanecem no navegador apenas como **cópia técnica de recuperação**; eles não aparecem no catálogo novo e não constituem migração. Uma falha de gravação não deixa estado parcialmente inicializado.

## Limite do rollback entre esquemas

Voltar ao código anterior exige o namespace legado preservado: a versão anterior lê somente `trilha-adaptativa:dados` e **não** consome o documento acadêmico. O estudo realizado no novo modelo não é transportado para a versão antiga, e o inverso também vale — nenhuma das duas versões reinterpreta os dados da outra.

## Limites conhecidos

A gravação de cada alteração é atômica dentro de uma aba (copia, valida e grava uma única vez, conferindo a revisão), mas o `localStorage` não oferece exclusão mútua entre abas: duas abas editando ao mesmo tempo podem disputar a escrita.
