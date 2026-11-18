# Spec Delta

## Purpose

Conduz o aluno por uma trilha adaptativa própria de cada curso, ajustando tópico e dificuldade das atividades ao seu domínio demonstrado naquele curso, de forma independente dos demais cursos.

## ADDED Requirements

### Requirement: Trilha independente por curso
O sistema MUST manter o estado adaptativo (domínio por tópico, histórico de respostas, tópicos desbloqueados) separado para cada par aluno + curso. Respostas em um curso MUST NOT alterar o estado de outro curso.

#### Scenario: Cursos não se influenciam
- **GIVEN** um Aluno matriculado nos cursos "Matemática Básica" e "Inglês Inicial"
- **WHEN** ele responde corretamente a questões em "Matemática Básica"
- **THEN** os níveis de domínio de "Inglês Inicial" permanecem inalterados

### Requirement: Nível de domínio por tópico
O sistema SHALL manter para cada tópico um nível de domínio de 0 a 100, iniciando em 0. Acerto MUST aumentar o domínio e erro MUST diminuí-lo, com variação maior para questões mais difíceis em acertos e para questões mais fáceis em erros. O domínio MUST permanecer entre 0 e 100.

#### Scenario: Acerto aumenta domínio
- **WHEN** o Aluno acerta uma questão do tópico "Frações"
- **THEN** o domínio de "Frações" aumenta

#### Scenario: Erro diminui domínio sem ficar negativo
- **GIVEN** o domínio de "Frações" está em 0
- **WHEN** o Aluno erra uma questão desse tópico
- **THEN** o domínio de "Frações" permanece em 0

### Requirement: Dificuldade conforme domínio
O sistema SHALL escolher a dificuldade da próxima questão pela faixa de domínio do tópico: 0–39 Fácil, 40–69 Médio, 70–100 Difícil.

#### Scenario: Domínio intermediário recebe questão média
- **GIVEN** o domínio de "Frações" está em 55
- **WHEN** o sistema escolhe a próxima questão de "Frações"
- **THEN** a questão tem dificuldade "Médio"

### Requirement: Escolha da próxima atividade
O sistema SHALL escolher a próxima questão no tópico desbloqueado e não dominado de menor domínio, evitando repetir a última questão respondida quando houver alternativa.

#### Scenario: Foco no tópico mais fraco
- **GIVEN** os tópicos desbloqueados "Frações" (domínio 30) e "Decimais" (domínio 60)
- **WHEN** o Aluno pede a próxima atividade
- **THEN** o sistema apresenta uma questão de "Frações"

### Requirement: Desbloqueio de tópicos
O primeiro tópico do curso MUST estar desbloqueado na matrícula. Um tópico é considerado dominado quando seu domínio atinge 80 ou mais; ao dominar um tópico, o sistema SHALL desbloquear o tópico seguinte na ordem do curso.

#### Scenario: Dominar tópico desbloqueia o próximo
- **WHEN** o domínio de "Frações" atinge 80
- **THEN** "Frações" é marcado como dominado e o tópico seguinte é desbloqueado

### Requirement: Feedback imediato
Após cada resposta, o sistema SHALL informar se o Aluno acertou, exibir a explicação da questão e mostrar a variação do domínio no tópico.

#### Scenario: Feedback após erro
- **WHEN** o Aluno erra uma questão
- **THEN** o sistema mostra a alternativa correta, a explicação e o novo domínio do tópico

### Requirement: Revisão sugerida
Quando o Aluno errar duas questões seguidas no mesmo tópico, o sistema SHALL sugerir revisar os materiais desse tópico antes de continuar.

#### Scenario: Dois erros seguidos
- **WHEN** o Aluno erra a segunda questão seguida do tópico "Frações"
- **THEN** o sistema exibe a sugestão de revisão com acesso aos materiais de "Frações"

### Requirement: Conclusão do curso
O progresso do curso SHALL ser a porcentagem de tópicos dominados. Quando todos os tópicos estiverem dominados, o sistema SHALL marcar o curso como concluído.

#### Scenario: Curso concluído
- **WHEN** o Aluno domina o último tópico do curso
- **THEN** o progresso mostra 100% e o curso é marcado como concluído
