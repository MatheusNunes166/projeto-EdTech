# aprendizado-adaptativo Specification

## Purpose
Conduz o aluno pelos tópicos de uma disciplina com dificuldade adaptativa e feedback, mantendo histórico, domínio e progresso independentes em cada turma matriculada.

## Requirements

### Requirement: Nível de domínio por tópico
O sistema SHALL manter domínio por tópico de 0 a 100, iniciando em 0. Acertos SHALL aumentar o domínio em 10, 15 e 20 para Fácil, Médio e Difícil; erros SHALL diminuir em 15, 10 e 5, respectivamente. O resultado MUST ser limitado ao intervalo de 0 a 100 e afetar apenas o aluno e a turma da resposta.

#### Scenario: Acerto aumenta domínio
- **GIVEN** domínio 55 em Vetores na turma A
- **WHEN** Ana acerta uma questão Médio desse tópico na turma A
- **THEN** o domínio de Ana nesse tópico e turma passa a 70

#### Scenario: Erro diminui domínio sem ficar negativo
- **GIVEN** domínio zero em Vetores
- **WHEN** Ana erra uma questão Fácil desse tópico
- **THEN** o domínio permanece zero

#### Scenario: Acerto não excede o limite
- **GIVEN** domínio 95 em um tópico
- **WHEN** Ana acerta uma questão Difícil desse tópico
- **THEN** o domínio passa a 100

### Requirement: Dificuldade conforme domínio
O sistema SHALL escolher a dificuldade da próxima questão pela faixa de domínio do tópico no contexto Aluno–Turma: 0–39 Fácil, 40–69 Médio e 70–100 Difícil.

#### Scenario: Domínio intermediário recebe questão média
- **GIVEN** domínio 55 em Vetores na turma A
- **WHEN** o sistema escolhe a próxima questão desse tópico para Ana nessa turma
- **THEN** a questão tem dificuldade Médio

#### Scenario: Limites das faixas
- **WHEN** a dificuldade é consultada para domínios 39, 40, 69 e 70
- **THEN** os resultados são, respectivamente, Fácil, Médio, Médio e Difícil

### Requirement: Escolha da próxima atividade
O sistema SHALL escolher uma questão do tópico desbloqueado e não dominado de menor domínio, usando a ordem dos tópicos em caso de empate. SHALL usar questões da disciplina da turma e evitar repetir a última respondida quando houver alternativa na dificuldade escolhida; sem questão inédita, SHALL permitir reutilização da menos recente nessa dificuldade.

#### Scenario: Foco no tópico mais fraco
- **GIVEN** tópicos desbloqueados Vetores com domínio 30 e Matrizes com domínio 60
- **WHEN** Ana pede a próxima atividade
- **THEN** o sistema apresenta questão Fácil de Vetores

#### Scenario: Evitar repetição imediata
- **GIVEN** duas questões disponíveis da dificuldade escolhida, uma delas a última respondida por Ana nessa turma
- **WHEN** Ana pede a próxima atividade do mesmo tópico
- **THEN** o sistema apresenta a outra questão

#### Scenario: Reutilização sem questões inéditas
- **GIVEN** todas as questões da dificuldade alvo já respondidas nessa turma
- **WHEN** Ana solicita a próxima atividade desse tópico
- **THEN** o sistema reutiliza a menos recente dessa dificuldade, evitando a última quando houver alternativa

### Requirement: Desbloqueio de tópicos
O primeiro tópico da disciplina MUST estar desbloqueado para cada nova matrícula. Ao atingir domínio 80 ou mais em um tópico, o sistema SHALL marcá-lo como dominado e desbloquear o seguinte na ordem da disciplina, apenas para o aluno e a turma da resposta. Tópicos bloqueados MUST NOT aceitar respostas.

#### Scenario: Dominar tópico desbloqueia o próximo
- **WHEN** o domínio de Ana em Vetores atinge 80 na turma A
- **THEN** Vetores é marcado como dominado e o tópico seguinte é desbloqueado apenas para Ana nessa turma

#### Scenario: Tópico bloqueado por acesso direto
- **GIVEN** Matrizes bloqueado para Ana na turma A
- **WHEN** Ana tenta registrar resposta de Matrizes diretamente
- **THEN** o sistema rejeita a resposta e não altera domínio, progresso ou XP

### Requirement: Feedback imediato
Após cada resposta válida, o sistema SHALL informar acerto ou erro, exibir a explicação da questão e mostrar o domínio atualizado e sua variação no tópico da turma atual. Em caso de erro, SHALL identificar a alternativa correta.

#### Scenario: Feedback após erro
- **GIVEN** domínio 55 em Vetores
- **WHEN** Ana erra uma questão Médio desse tópico
- **THEN** o sistema mostra a alternativa correta, explicação, variação de menos 10 e domínio 45

### Requirement: Revisão sugerida
Quando o Aluno errar duas questões seguidas no mesmo tópico e turma, o sistema SHALL sugerir revisar os materiais desse tópico antes de continuar. Erros de outra turma ou de outro aluno MUST NOT compor essa sequência. A sugestão SHALL permitir acesso ao material e continuidade do estudo sem encaminhamento de monitoria.

#### Scenario: Dois erros seguidos
- **WHEN** Ana erra a segunda questão seguida de Vetores na turma A
- **THEN** o sistema exibe sugestão de revisão com acesso aos materiais de Vetores

#### Scenario: Erros de períodos diferentes
- **GIVEN** Ana com um erro em Vetores em 2026.2 e nenhum em 2027.1
- **WHEN** Ana erra pela primeira vez em Vetores em 2027.1
- **THEN** o erro de 2026.2 não dispara uma sugestão de dois erros seguidos em 2027.1

### Requirement: Trilha independente por aluno e turma
O sistema MUST separar domínio por tópico, histórico de respostas, desbloqueios e progresso para cada combinação Aluno–Turma. Respostas de um aluno em uma turma MUST NOT alterar o estado de outro aluno ou turma, mesmo na mesma disciplina, graduação ou período. Não SHALL haver reaproveitamento automático de progresso entre ofertas.

#### Scenario: Independência entre períodos
- **GIVEN** Ana com tópico Vetores dominado na turma de Algoritmos de 2026.2 e nova matrícula em 2027.1
- **WHEN** abre a trilha de 2027.1
- **THEN** encontra domínio inicial zero e histórico vazio nessa turma e o estado de 2026.2 permanece intacto

#### Scenario: Turmas paralelas não se influenciam
- **GIVEN** Ana matriculada nas turmas A e B da mesma disciplina no mesmo período
- **WHEN** responde corretamente na turma A
- **THEN** somente o estado de Ana em A é atualizado e o de Ana em B permanece inalterado

#### Scenario: Alunos não se influenciam
- **GIVEN** Ana e Bruno matriculados na mesma turma
- **WHEN** Ana domina um tópico
- **THEN** domínio, histórico e desbloqueios de Bruno permanecem inalterados

#### Scenario: Disciplinas distintas não se influenciam
- **GIVEN** Ana matriculada em Algoritmos e Banco de Dados
- **WHEN** responde em Algoritmos
- **THEN** o estado da turma de Banco de Dados permanece inalterado

### Requirement: Inicialização e retomada da trilha
Na primeira matrícula, o sistema SHALL iniciar domínio e progresso em zero, histórico vazio e primeiro tópico desbloqueado quando houver conteúdo. Ao retomar a mesma matrícula, SHALL preservar o estado existente. O início do estudo MUST NOT exigir diagnóstico ou prova de nivelamento; conteúdo em rascunho MUST permanecer indisponível.

#### Scenario: Início sem diagnóstico
- **GIVEN** Ana recém-matriculada em turma com disciplina publicada
- **WHEN** inicia o estudo
- **THEN** recebe atividade Fácil do primeiro tópico sem realizar diagnóstico e os demais tópicos continuam bloqueados

#### Scenario: Retomada preserva estado
- **GIVEN** Ana com domínio 55 em um tópico da turma A
- **WHEN** sai da demonstração, entra novamente e continua na turma A
- **THEN** o domínio desse tópico continua em 55 e o histórico anterior está preservado

### Requirement: Conclusão da trilha da turma
O progresso SHALL ser 100 vezes a razão entre tópicos dominados e tópicos da disciplina, por Aluno–Turma, sem arredondamento para cálculos posteriores. Somente a exibição SHALL arredondar ao inteiro mais próximo. Quando todos estiverem dominados, a trilha SHALL ser concluída. Sem tópicos, SHALL ter progresso zero e não concluída. Conclusão de trilha MUST NOT representar aprovação acadêmica ou conclusão da graduação.

#### Scenario: Progresso parcial
- **GIVEN** dois tópicos na disciplina e um dominado por Ana na turma A
- **WHEN** Ana consulta a trilha
- **THEN** o sistema exibe progresso 50%

#### Scenario: Trilha concluída
- **WHEN** Ana domina o último tópico pendente na turma A
- **THEN** a trilha dessa turma mostra 100% e concluída, sem alterar outras turmas nem registrar aprovação acadêmica ou graduação concluída

#### Scenario: Exibição não reduz a precisão do progresso
- **GIVEN** Ana com um de seis tópicos dominados em sua turma
- **WHEN** consulta a trilha e seu progresso é usado no cálculo da média da turma
- **THEN** a trilha exibe 17% e o cálculo da média utiliza o valor exato 100/6, sem substituí-lo por 17

### Requirement: Preservação do estado de estudo em edições de conteúdo
O sistema MUST preservar, por Aluno–Turma, históricos, avaliações e datas, domínio, tópicos dominados, desbloqueios, progresso e conclusão em edições permitidas ou rejeitadas. Respostas antigas SHALL exibir enunciado, alternativas na ordem original e explicação originalmente apresentados, mesmo após correção aprovada. Edições MUST NOT reavaliar respostas, reiniciar estudo, desbloquear tópicos ou reabrir conclusão. Somente nova resposta válida SHALL atualizar seu contexto de estudo.

#### Scenario: Material ajustado com trilha em andamento
- **GIVEN** Ana em A com um de dois tópicos dominados, domínio 55 no segundo tópico e ambos desbloqueados
- **WHEN** um autor autorizado corrige um link de material da disciplina sem alterar questões ou regras
- **THEN** o histórico e suas avaliações e datas, os domínios, os desbloqueios e o progresso de 50% de Ana são preservados

#### Scenario: Conclusão preservada em outra turma
- **GIVEN** Ana em andamento em A e Bruno com todos os tópicos dominados e progresso 100% em B da mesma disciplina
- **WHEN** um autor autorizado ajusta um material da disciplina
- **THEN** cada aluno mantém seu histórico e estado próprios, e a trilha de Bruno continua concluída com os mesmos domínios e desbloqueios

#### Scenario: Tentativa de alteração estrutural preserva todas as ofertas
- **GIVEN** históricos de alunos em A e B da mesma disciplina, incluindo uma trilha concluída
- **WHEN** um autor tenta remover ou reordenar um tópico após a primeira resposta
- **THEN** a operação é rejeitada e todos os históricos, avaliações, datas, domínios, desbloqueios, progressos e conclusões de A e B permanecem inalterados

#### Scenario: Histórico exibe o conteúdo anterior à correção
- **GIVEN** respostas de Ana em A e Bruno em B à mesma questão, com enunciado, alternativas e explicação originalmente apresentados
- **WHEN** o autor autorizado salva uma correção textual após examinar e confirmar a diferença exata
- **THEN** as respostas antigas continuam exibindo o conteúdo original, com a mesma ordem e correspondência das alternativas, preservando históricos, avaliações, datas, domínio, desbloqueios, progresso e conclusão
- **AND** XP, conquistas e datas de obtenção permanecem inalterados, conforme Preservação da gamificação em edições de conteúdo

### Requirement: Respostas somente no contexto autorizado
O sistema MUST aceitar resposta somente da pessoa ativa com função Aluno, matriculada na turma informada, para questão de tópico desbloqueado da disciplina dessa turma com conteúdo publicado. Uma resposta inválida MUST NOT alterar histórico, domínio, progresso ou gamificação.

#### Scenario: Questão de outra disciplina
- **WHEN** Ana tenta responder questão de Direito Civil no contexto de sua turma de Algoritmos
- **THEN** a resposta é rejeitada sem qualquer atualização de estudo

#### Scenario: Aluno sem matrícula
- **WHEN** Ana tenta responder uma questão na turma B sem estar matriculada nela
- **THEN** o sistema nega a resposta mesmo que Ana tenha matrícula na turma A da mesma disciplina
