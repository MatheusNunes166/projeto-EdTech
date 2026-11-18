# Fluxos de Usuário

Jornadas por perfil e diagramas de atividade/sequência dos fluxos principais. Os IDs entre parênteses referem-se a [requisitos.md](requisitos.md) e [casos-de-uso.md](casos-de-uso.md).

## 1. Jornadas por perfil

> **Referência histórica** (entrega inicial `edtech-adaptativa-fase-inicial`): perfil único por pessoa, matrícula pelo próprio aluno e estudo por curso; veja a §7 (Aluno e Coordenação) e a §4.1 (conteúdo) para a organização acadêmica. Não descreve o comportamento atual.

### Aluno
```mermaid
journey
    title Jornada do Aluno
    section Descoberta
      Entrar como aluno: 4: Aluno
      Buscar e filtrar cursos: 4: Aluno
      Ver detalhe do curso: 4: Aluno
    section Início
      Matricular-se: 5: Aluno
      Abrir trilha do curso: 4: Aluno
    section Estudo
      Responder questões adaptadas: 4: Aluno
      Receber feedback e explicação: 5: Aluno
      Revisar materiais após erros: 3: Aluno
      Dominar tópico e desbloquear o próximo: 5: Aluno
    section Evolução
      Ganhar XP e conquistas: 5: Aluno
      Consultar painel de desempenho: 4: Aluno
```

### Professor
```mermaid
journey
    title Jornada do Professor
    section Conteúdo
      Criar curso (rascunho): 4: Professor
      Organizar tópicos e materiais: 3: Professor
      Cadastrar questões por dificuldade: 3: Professor
      Publicar curso: 5: Professor
    section Acompanhamento
      Ver painel da turma: 4: Professor
      Identificar alunos com dificuldade: 5: Professor
      Ver detalhe de um aluno: 4: Professor
```

### Responsável
```mermaid
journey
    title Jornada do Responsável
    section Acompanhamento
      Entrar como responsável: 4: Responsável
      Ver alunos vinculados: 5: Responsável
      Conferir progresso e sequência: 4: Responsável
      Ver última atividade: 4: Responsável
```

### Administrador
```mermaid
journey
    title Jornada do Administrador
    section Gestão
      Ver visão geral da plataforma: 4: Admin
      Criar e editar usuários: 4: Admin
      Desativar usuário: 3: Admin
      Vincular responsável a aluno: 4: Admin
      Vincular professor a curso: 4: Admin
```

## 2. Matrícula em curso (UC02, UC03 — RF06–RF10)

> **Referência histórica** (entrega inicial `edtech-adaptativa-fase-inicial`): a matrícula direta em curso (automatrícula) foi substituída pela matrícula **administrativa em turma** — veja a §7.2 e o UC18. Não descreve o comportamento atual.

```mermaid
flowchart TD
    I([Início]) --> C[Aluno abre o catálogo]
    C --> F{Busca ou filtro?}
    F -- Sim --> B[Aplicar busca / filtros]
    B --> R{Há resultados?}
    R -- Não --> V[Exibir 'Nenhum curso encontrado'] --> F
    R -- Sim --> L
    F -- Não --> L[Lista de cursos publicados]
    L --> D[Abrir detalhe do curso]
    D --> M{Já matriculado?}
    M -- Sim --> CO[Ação 'Continuar'] --> T[Abrir trilha do curso]
    M -- Não --> MA[Ação 'Matricular']
    MA --> CR[Criar matrícula e trilha nova<br/>domínio 0 em todos os tópicos<br/>1º tópico desbloqueado]
    CR --> MC[Curso aparece em 'Meus cursos' com 0%]
    MC --> T
    T --> FIM([Fim])
```

## 3. Sessão adaptativa (UC04, UC05, UC06 — RF17–RF28)

> **Referência histórica** (entrega inicial `edtech-adaptativa-fase-inicial`): as regras numéricas continuam valendo, mas o estudo agora é por matrícula (aluno + turma) — veja a §7.1. Não descreve o comportamento atual.

### Atividade
```mermaid
flowchart TD
    I([Aluno abre a trilha]) --> P[Pedir próxima atividade]
    P --> S[Selecionar tópico desbloqueado<br/>não dominado de menor domínio]
    S --> D[Dificuldade pela faixa:<br/>0–39 Fácil · 40–69 Médio · 70–100 Difícil]
    D --> Q[Escolher questão da dificuldade<br/>evitando repetir a última]
    Q --> RESP[Aluno responde]
    RESP --> OK{Acertou?}
    OK -- Sim --> UP[Domínio + 10/15/20<br/>XP + 10/20/30]
    OK -- Não --> DOWN[Domínio − 15/10/5<br/>limitado a 0]
    UP --> FB[Feedback: resultado, alternativa correta,<br/>explicação, variação de domínio]
    DOWN --> FB
    FB --> E2{2 erros seguidos<br/>no tópico?}
    E2 -- Sim --> REV[Sugerir revisão dos materiais]
    REV --> RV{Aluno revisa?}
    RV -- Sim --> MAT[Abrir materiais do tópico] --> P
    RV -- Não --> DOM
    E2 -- Não --> DOM{Domínio ≥ 80?}
    DOM -- Não --> P
    DOM -- Sim --> MARK[Marcar tópico dominado<br/>desbloquear o próximo<br/>verificar conquistas]
    MARK --> ALL{Todos os tópicos<br/>dominados?}
    ALL -- Não --> P
    ALL -- Sim --> FIM([Curso concluído · 100%<br/>conquista 'Curso concluído'])
```

### Sequência
```mermaid
sequenceDiagram
    actor A as Aluno
    participant UI as Tela da trilha
    participant M as Motor adaptativo
    participant G as Gamificação
    participant DB as Repositório (aluno+curso)

    A->>UI: Próxima atividade
    UI->>DB: Carregar estado do par aluno+curso
    DB-->>UI: Domínio por tópico, histórico
    UI->>M: proximaQuestao(estado, curso)
    M-->>UI: Questão (tópico, dificuldade)
    A->>UI: Responde alternativa
    UI->>M: atualizarDominio(estado, questão, acertou)
    M->>M: Aplicar limites 0–100 e desbloqueios
    M-->>UI: Novo estado + variação
    UI->>DB: Salvar resposta e novo estado
    UI->>G: Calcular XP, sequência e conquistas (histórico do curso)
    G-->>UI: Indicadores + conquistas novas
    UI-->>A: Feedback, explicação, domínio, XP
    opt 2 erros seguidos no tópico
        UI-->>A: Sugerir revisão dos materiais
    end
```

## 4. Criação e publicação de curso (UC08–UC11 — RF11–RF16)

> **Referência histórica** (entrega inicial `edtech-adaptativa-fase-inicial`): o conteúdo agora pertence à disciplina — veja a §4.1. Não descreve o comportamento atual.

```mermaid
flowchart TD
    I([Professor na sua área]) --> N[Novo curso]
    N --> DADOS[Preencher título, descrição, área, nível]
    DADOS --> VT{Título preenchido?}
    VT -- Não --> ERR1[Indicar campo obrigatório] --> DADOS
    VT -- Sim --> RAS[Salvar como 'rascunho']
    RAS --> TOP[Adicionar / ordenar tópicos]
    TOP --> MAT[Anexar materiais por tópico]
    MAT --> QUE[Cadastrar questão:<br/>enunciado, alternativas, correta,<br/>explicação, dificuldade]
    QUE --> VC{Alternativa correta<br/>marcada?}
    VC -- Não --> ERR2[Informar que é preciso marcar] --> QUE
    VC -- Sim --> MAIS{Mais questões?}
    MAIS -- Sim --> QUE
    MAIS -- Não --> PUB[Acionar 'Publicar']
    PUB --> COB{Cada tópico tem<br/>Fácil, Médio e Difícil?}
    COB -- Não --> FALT[Listar tópicos e níveis faltantes] --> QUE
    COB -- Sim --> OK[Status 'publicado'<br/>curso aparece no catálogo]
    OK --> FIM([Fim])
```

```mermaid
sequenceDiagram
    actor P as Professor
    participant UI as Editor de curso
    participant DB as Repositório

    P->>UI: Abrir edição do curso
    UI->>DB: Verificar vínculo professor↔curso
    alt Sem vínculo
        DB-->>UI: Negado
        UI-->>P: Edição não permitida
    else Vinculado
        DB-->>UI: Curso, tópicos, questões
        P->>UI: Publicar
        UI->>UI: Validar cobertura de níveis por tópico
        alt Cobertura incompleta
            UI-->>P: Lista de faltantes
        else Completa
            UI->>DB: status = publicado
            UI-->>P: Curso publicado
        end
    end
```

## 4.1 Edição e publicação do conteúdo da disciplina (organização acadêmica — tarefas 4.1–4.7)

Substitui, para a organização acadêmica, o fluxo por curso da seção 4 (mantida como referência histórica): o conteúdo pertence à **disciplina** e é compartilhado por todas as turmas. O editor prepara o conteúdo inteiro e o salva de uma só vez (`salvarConteudo`); a publicação é um comando separado (`publicarConteudo`) e ajustes de material têm comando próprio (`salvarMateriais`).

```mermaid
flowchart TD
    I([Professor vinculado a uma turma<br/>ou Administrador]) --> AB[Abrir conteúdo da disciplina]
    AB --> AUT{Autorizado?<br/>vínculo docente ou admin}
    AUT -- Não --> NEG[Negado; conteúdo intacto<br/>Coordenação sem vínculo docente não edita]
    AUT -- Sim --> PREP[Preparar alterações no editor:<br/>tópicos, materiais, questões]
    PREP --> SALVAR[Salvar alterações: candidato completo]
    SALVAR --> EST{Há resposta em qualquer<br/>turma da disciplina?}
    EST -- Sim --> ESTR{Adiciona, remove ou<br/>reordena tópicos?}
    ESTR -- Sim --> R1[Rejeitar: estudo já iniciado<br/>vale também para o Administrador]
    ESTR -- Não --> QR
    EST -- Não --> QR{Altera questão respondida?}
    QR -- Exclui, muda tópico, dificuldade,<br/>gabarito, ordem ou quantidade --> R2[Rejeitar, mesmo com confirmação]
    QR -- Corrige só texto --> DIF[Apresentar a diferença exata]
    DIF --> CONF{Autor confirma<br/>a diferença e a revisão original?}
    CONF -- Não / outra diferença / revisão antiga --> R3[Rejeitar; exigir nova confirmação]
    CONF -- Sim --> PUBL
    QR -- Não --> PUBL{Disciplina publicada?}
    PUBL -- Sim --> COB{≥1 tópico e cada tópico com<br/>Fácil, Médio e Difícil?}
    COB -- Não --> R4[Rejeitar tudo: indicar tópico e nível faltantes<br/>não despublica]
    COB -- Sim --> GRAV
    PUBL -- Não --> GRAV[Gravar uma única vez<br/>histórico e resultados dos alunos intactos]
    R1 --> FIM([Conteúdo anterior preservado])
    R2 --> FIM
    R3 --> FIM
    R4 --> FIM
```

Regras do fluxo:

- **Tudo ou nada.** Uma edição que mistura uma parte válida (por exemplo, correção de material) com outra inválida (por exemplo, remover a única questão Fácil de um tópico) é rejeitada por inteiro: o documento persistido, a publicação e os dados dos alunos permanecem idênticos, e a interface não exibe sucesso. Falha de gravação tem o mesmo efeito.
- **Publicar** exige ao menos um tópico e as três dificuldades em cada tópico; se faltar algo, a disciplina continua em rascunho e a rejeição lista os tópicos e níveis faltantes. A cobertura é verificada de novo em todo salvamento de disciplina já publicada.
- **Confirmação textual.** Apenas enunciado, texto das alternativas e explicação de questão respondida (e título de tópico com respostas) podem ser corrigidos, após o próprio autor examinar a diferença e confirmar que significado e correspondência foram preservados. Não há segundo revisor. Nova alteração, outra diferença ou outra revisão de origem exigem nova confirmação; a confirmação não substitui a autorização de edição. O histórico dos alunos continua exibindo o conteúdo originalmente apresentado.
- **Materiais** podem ser corrigidos a qualquer momento (inclusive com trilhas em andamento ou concluídas) sem alterar tópicos, questões ou resultados.

## 5. Acompanhamento pelo professor (UC12 — RF30–RF32)

> **Referência histórica** (entrega inicial `edtech-adaptativa-fase-inicial`): o painel é por turma vinculada, com médias da turma — veja `requisitos.md` (indicadores por turma). Não descreve o comportamento atual.

```mermaid
flowchart TD
    I([Professor]) --> C[Escolher curso vinculado]
    C --> PN[Painel da turma:<br/>alunos, progresso, taxa de acertos,<br/>domínio médio por tópico]
    PN --> AT{Aluno com &lt; 50% de acertos<br/>nas últimas 10 respostas?}
    AT -- Sim --> DEST[Destacar 'precisa de atenção']
    AT -- Não --> NORM[Exibir normalmente]
    DEST --> SEL[Selecionar aluno]
    NORM --> SEL
    SEL --> DET[Detalhe: domínio por tópico<br/>e respostas recentes no curso]
    DET --> FIM([Fim])
```

## 6. Acompanhamento pelo responsável (UC16 — RF33)

> **Referência histórica** (entrega inicial `edtech-adaptativa-fase-inicial`): o painel traz uma linha por oferta — veja o UC16 atualizado em `casos-de-uso.md`. Não descreve o comportamento atual.

```mermaid
sequenceDiagram
    actor R as Responsável
    participant UI as Painel do responsável
    participant DB as Repositório

    R->>UI: Abrir painel
    UI->>DB: Buscar alunos vinculados ao responsável
    DB-->>UI: Somente alunos vinculados
    loop Para cada aluno vinculado
        UI->>DB: Matrículas e histórico
        DB-->>UI: Cursos, progresso, sequência, última atividade
    end
    UI-->>R: Cards por aluno com seus cursos
```

## 7. Jornadas da organização acadêmica (tarefas 7.7 e 7.10)

As jornadas abaixo substituem, para a organização acadêmica, a matrícula em curso (§2) e a sessão por curso (§3): o estudo acontece **por matrícula** (aluno + turma), e a matrícula é um ato administrativo.

### 7.1 Jornada do Aluno (7.10)

```mermaid
journey
    title Jornada do Aluno por turma
    section Acesso
      Entrar como pessoa de demonstração: 4: Aluno
      Ver Minhas turmas (graduação, disciplina, turma, período): 5: Aluno
      Consultar o catálogo e as ofertas (sem se matricular): 4: Aluno
    section Estudo na turma
      Abrir a trilha da turma (primeiro tópico desbloqueado): 5: Aluno
      Responder questão adaptada: 4: Aluno
      Receber feedback, explicação e variação do domínio: 5: Aluno
      Revisar materiais após dois erros seguidos: 3: Aluno
      Dominar o tópico e desbloquear o próximo: 5: Aluno
    section Evolução da turma
      Ganhar XP, sequência e conquistas da turma: 5: Aluno
      Concluir a trilha da turma (sem aprovação acadêmica): 5: Aluno
```

Pontos de atenção: cada turma tem trilha, XP, sequência e conquistas próprios — mesma disciplina em outro período recomeça do zero; a URL do estudo é `/aluno/disciplinas/:disciplinaId/turmas/:turmaId` e IDs que não correspondem a uma matrícula do aluno resultam em acesso negado; turmas cujo conteúdo está em rascunho aparecem sem ação de estudo; URLs antigas por curso levam a *Minhas turmas*, sem escolher uma turma arbitrária. A questão exibida nunca traz gabarito nem explicação antes da resposta.

### 7.2 Jornada da Coordenação (7.7)

```mermaid
flowchart TD
    I([Pessoa com a função Coordenador]) --> P[Painel da coordenação:<br/>uma linha por turma dos cursos vinculados]
    P --> G[Gestão acadêmica]
    G --> L[Lista só as turmas dos seus cursos]
    L --> T[Gerir uma turma]
    T --> M{Matricular aluno}
    M -- Aluno já matriculado --> R[Informar que o estudo foi preservado<br/>nada é reiniciado]
    M -- Novo --> OK[Matrícula criada na data virtual<br/>sem copiar histórico]
    T --> D[Atribuir ou remover professor da turma]
    T --> X[Turma de outro curso por endereço direto]
    X --> N[Acesso negado, sem dados]
    P --> C[Cadastros: editar graduação, disciplinas e turmas do seu curso]
    C --> NC[Períodos letivos e novas graduações: só o Administrador]
```

A coordenação gere cadastro, turmas, matrículas e atribuições docentes **do seu escopo**, mas não edita conteúdo pedagógico (sem vínculo docente), não altera resultados de estudo e não vê respostas individuais. Uma pessoa Professor e Coordenador usa duas áreas distintas, cada uma com o seu escopo. O Administrador usa a mesma tela de gestão para qualquer turma.

