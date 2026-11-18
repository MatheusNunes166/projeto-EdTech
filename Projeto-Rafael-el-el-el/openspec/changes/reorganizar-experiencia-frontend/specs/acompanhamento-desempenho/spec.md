# Spec Delta

## MODIFIED Requirements

### Requirement: Painel do aluno
O sistema SHALL exibir ao Aluno, para cada turma matriculada, progresso, domínio por tópico, taxa de acertos e XP próprios, identificando graduação, disciplina, turma e período. Taxa de acertos SHALL ser acertos divididos por respostas válidas dessa matrícula, em porcentagem arredondada; sem respostas SHALL apresentar zero e indicar ausência de atividade. Desempenho SHALL ser acessível como ação secundária em Minhas turmas e na trilha com conteúdo disponível, mantendo retorno à mesma trilha. Com respostas válidas, o sistema MUST NOT indicar Sem atividade apenas porque progresso ou taxa de acertos são 0%.

#### Scenario: Aluno consulta seu desempenho
- **GIVEN** Ana com um de dois tópicos dominados, três acertos em quatro respostas e 50 XP na turma A
- **WHEN** abre o painel dessa turma
- **THEN** vê progresso de 50%, taxa de acertos de 75%, domínio por tópico e 50 XP com identificação da oferta

#### Scenario: Matrícula sem respostas
- **WHEN** Ana consulta o painel de uma turma na qual ainda não respondeu
- **THEN** vê progresso, domínio e XP iguais a zero e taxa zero acompanhada da indicação Sem atividade

#### Scenario: Respostas sem acertos
- **GIVEN** um Aluno com duas respostas válidas incorretas na turma e nenhum tópico dominado
- **WHEN** abre Desempenho
- **THEN** vê progresso de 0%, taxa de acertos de 0% e XP zero, com indicação de atividade existente, sem o rótulo Sem atividade

#### Scenario: Acesso secundário preserva o contexto
- **GIVEN** um Aluno matriculado em duas ofertas publicadas da mesma disciplina
- **WHEN** aciona Desempenho em um cartão de Minhas turmas ou na trilha e depois volta à trilha
- **THEN** consulta os indicadores e retorna à trilha da oferta escolhida, sem misturar períodos ou alterar o histórico
