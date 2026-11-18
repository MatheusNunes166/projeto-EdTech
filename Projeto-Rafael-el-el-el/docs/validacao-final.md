# Validação final — change `organizacao-academica` (tarefas 8.2 a 8.4)

Este documento registra, **separadamente**, o que foi verificado por comportamento (testes e uso do aplicativo), o que foi verificado por build, e a revisão de coerência dos artefatos. A consolidação e o arquivamento (seção 5) foram feitos depois, em ação separada e autorizada.

## 1. Validação integrada entre funções (8.2)

Teste: [`prototipo/src/testes/integracao-funcoes.test.tsx`](../prototipo/src/testes/integracao-funcoes.test.tsx) — percorre a interface real (rotas, guards, consultas autorizadas e comandos) sobre o armazenamento do aplicativo.

| Etapa | Função | Resultado |
| --- | --- | --- |
| Cria a disciplina *Estruturas de Dados* (rascunho, sem tópicos), a turma A em 2026.2, atribui o professor e vincula Responsável–Aluno | Administrador | Aprovado |
| Matricula o aluno na turma do seu curso; não vê cursos que apenas leciona; não obtém o editor da disciplina (coordenação não concede autoria pedagógica) | Coordenador (também Professor) | Aprovado |
| Cria conteúdo completo (tópico + três dificuldades) e publica pela interface | Professor | Aprovado |
| Abre a trilha, recebe a primeira questão Fácil sem diagnóstico, responde e recebe feedback | Aluno | Aprovado |
| Vê a oferta, sequência e última atividade do aluno vinculado, sem histórico de questões | Responsável | Aprovado |
| Edição com material válido **e** novo tópico após a primeira resposta é rejeitada integralmente (documento persistido idêntico) | Professor | Aprovado |
| Correção textual confirmada pelo próprio autor; o detalhe docente do aluno continua exibindo o enunciado original | Professor | Aprovado |
| Revogação do vínculo docente com o editor aberto: o próximo carregamento mostra *Acesso negado*; matrícula e respostas permanecem | Administrador → Professor | Aprovado |
| Restauração cancelada: nenhuma alteração e pessoa mantida na sessão | Administrador | Aprovado |

Cenários correlatos têm testes próprios nos grupos 2–7 (ver [rastreabilidade.md](rastreabilidade.md)).

### Divergências encontradas durante a validação e corrigidas

| Divergência | Cenário afetado | Correção |
| --- | --- | --- |
| Cada comando invalidava a sessão e o provedor desmontava toda a árvore enquanto relia a pessoa, perdendo estado e **mensagens de erro** de formulários | Validade contínua do conteúdo; cadastros por campo | O provedor mantém a árvore montada e atualiza sessão e versão em lote; consultas mantêm o último resultado após comandos *próprios* e só escondem o retrato em troca de pessoa ou evento externo (`storage`) |
| Erro/aviso de salvamento do editor sumia quando a revisão mudava e o editor era remontado | Revisão original desatualizada; falha preserva o conjunto anterior | Estado do comando elevado ao componente pai |
| Mensagem de erro dentro do `<label>` impedia localizar o campo e duplicava o texto | Validação por campo | Erro fora do rótulo; a lista geral ignora campos já exibidos |
| `Repositorio.ler()` do legado repunha o seed em silêncio para versão diferente/JSON inválido | Demonstração fictícia e restauração | Substituição só pelo fluxo confirmado; leitura incompatível gera erro sem escrever |
| `(d ÷ T) × 100` difere em ponto flutuante de `100 × d ÷ T` (fórmula do design) | Exibição não reduz a precisão do progresso | Progresso calculado como `100 × d ÷ T` |

## 2. Evidências de comportamento (8.3)

Comando: `npm test` em `prototipo/` (Vitest + Testing Library, jsdom).

- **Resultado final:** 41 arquivos, **631 testes aprovados**, 0 falhas (executado também em repetição, sem oscilação, após o ajuste do `testTimeout` para 20 s nos fluxos longos de interface).
- **Testes de contratos substituídos** (todos atualizados, nenhum mantém exigência incompatível):
  - `testes/aluno.test.tsx` e `testes/perfis.test.tsx` (matrícula direta, trilha por curso, perfil único) → substituídos por `aluno`, `professor`, `coordenacao`, `admin`, `responsavel`, `shell` e `integracao-funcoes`;
  - `dados/repositorio.test.ts`: o teste de reposição automática por versão → substituído por testes de que dados incompatíveis **não** são repostos em silêncio;
  - `dados/seed.test.ts`: agora verifica o seed acadêmico; o teste do seed legado passou a `dados/seed-legado.test.ts`.
- **Testes das regras válidas preservados:** `adaptativo/motor.test.ts` (faixas, domínio, desbloqueio, revisão), `gamificacao/gamificacao.test.ts` (XP, sequência, conquistas) e `dados/repositorio.test.ts` (persistência do legado) seguem verdes, e as mesmas regras são cobertas para a matrícula em `estudo.test.ts`, `gamificacao-matricula.test.ts` e `contexto-estudo.test.ts`.
- **Demonstração limpa seguindo o README** (navegador real, servidor de desenvolvimento, armazenamento limpo): a demonstração inicializou **sem aviso** e a entrada listou as 11 pessoas ativas (Paulo Antunes, inativo, não aparece); *Entrar como Ana Souza* abriu *Minhas turmas* (Algoritmos 2026.2 em 33%, Algoritmos 2027.1 em 0% com “Sem atividade”, Inglês Inicial); *Simular próximo dia* avançou para 18/11/2026; **cancelar** a restauração manteve data e pessoa; **confirmar** voltou à entrada, sem sessão e com a data inicial 2026-11-17; com dados legados gravados, o **aviso apareceu antes de qualquer alteração**, cancelar manteve as chaves, confirmar criou o namespace novo, preservou os dados legados e encerrou a sessão antiga. Diego respondeu uma questão Fácil (feedback com explicação e +10 XP, sem gabarito antes) e o editor do professor abriu com 3 tópicos e 18 questões. Nenhum erro no console.

## 3. Evidências de build (8.3)

Comando: `npm run build` em `prototipo/` (`tsc -b` e `vite build`) — **aprovado**: 0 erros de tipo e bundle de produção gerado (`dist/assets/index-*.js` ≈ 304 kB, 91 kB gzip). Esta evidência comprova tipagem e empacotamento, não o comportamento.

## 4. Revisão de coerência (8.4)

Revisados proposal, as sete specs, design e checklist contra o comportamento entregue:

- **Coerente:** funções cumulativas e Coordenador; conteúdo por disciplina; bloqueios após resposta e proteção de questões; confirmação textual do próprio autor; validade contínua; estudo, XP, sequência e conquistas por matrícula; médias por turma com precisão e “Sem dados”; entrada simulada; demonstração com aviso e restauração.
- **Ajuste feito nos artefatos:** o design (D9 e Migration Plan) falava só em implementação “futura” e “entrega documental”; foram acrescentadas notas de implementação indicando que o plano foi seguido e que consolidação, reconciliação de D10 e arquivamento foram executados depois (seção 5).
- **Decisões de interpretação (specs silenciosas) a confirmar:** (a) a visão geral conta pessoas distintas **ativas ou inativas**; (b) o contrato de *Visão geral* e dos demais painéis usa valores exatos e só a apresentação arredonda; (c) a coordenação edita graduações, disciplinas e turmas do seu escopo em *Cadastros* (períodos e novas graduações são do Administrador); (d) qualquer pessoa autenticada pode avançar a data virtual (controle de demonstração já existente).
- **Limitações conhecidas:** o painel da coordenação mostra o domínio médio por tópico como números em ordem, sem rótulos; não há exclusão mútua entre abas (documentado no README); o código legado (`Repositorio`, `Dados`, motor por curso, seed legado) permanece como cópia técnica/reuso de conteúdo e não é usado pelas telas.
- **Validação estrutural do OpenSpec — executada** (CLI `@fission-ai/openspec` 2.1.0, instalado a pedido): `openspec validate organizacao-academica --strict` → válida; `openspec status` → 4/4 artefatos completos. Isso valida apenas a **estrutura** e **não comprova comportamento** (seções 1–3).

## 5. Consolidação e arquivamento (ação separada e autorizada)

1. `openspec archive edtech-adaptativa-fase-inicial` → criou a base `openspec/specs/` (6 capacidades, 34 requisitos) e arquivou a change em `openspec/changes/archive/2026-11-17-edtech-adaptativa-fase-inicial`.
2. Reconciliação (D10): os deltas de `organizacao-academica` foram reescritos contra a base — `MODIFIED` com bloco completo e cenários originais preservados (20), `ADDED` para novidades (44), `REMOVED` com `Reason` e `Migration` para os comportamentos substituídos (14: perfil único, automatrícula e escopos por curso); `RENAMED` não foi necessário. Proposal, `tasks.md` e design foram atualizados.
3. `openspec archive organizacao-academica` → aplicou os deltas (+44, ~20, −14) e arquivou em `openspec/changes/archive/2026-11-17-organizacao-academica`; o `Purpose` das seis capacidades herdadas foi atualizado na base.
4. `openspec validate --all --strict` → 7 specs válidas; a base resultante não contém regras de perfil único nem de automatrícula (só o requisito *Acesso às turmas sem automatrícula*) e tem 64 requisitos, todos com teste em [rastreabilidade.md](rastreabilidade.md).
