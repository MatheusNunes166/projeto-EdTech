# Spec Delta

## MODIFIED Requirements

### Requirement: Exibição de gamificação
O sistema SHALL exibir XP, sequência e conquistas na trilha da turma atual, identificando disciplina, código da turma e período. Os números MUST corresponder apenas ao Aluno dessa trilha, sem apresentar total combinado de ofertas como se fosse progresso de uma turma. XP e sequência SHALL aparecer em resumo compacto sempre visível na trilha. Conquistas SHALL ter acionador identificável com quantidade obtida e detalhes recolhidos por padrão; ao expandir, SHALL apresentar nomes e datas de obtenção ou informar Nenhuma conquista ainda. Expandir ou recolher MUST NOT conceder conquistas, contar estudo ou alterar indicadores. Avisos de novas conquistas no feedback da sessão SHALL continuar imediatos.

#### Scenario: Alternar entre ofertas
- **GIVEN** Ana com 100 XP em Algoritmos de 2026.2 e zero XP em 2027.1
- **WHEN** alterna a visualização das duas trilhas
- **THEN** cada uma mostra seu próprio XP, sequência e acesso às conquistas com identificação do período

#### Scenario: Ver indicadores do curso
- **WHEN** o Aluno abre a trilha de uma turma
- **THEN** o XP e a sequência de dias daquela turma ficam visíveis, com identificação da disciplina, do código da turma e do período
- **AND** o acionador Conquistas indica a quantidade obtida e permite consultar os detalhes, inicialmente recolhidos

#### Scenario: Consultar conquistas obtidas
- **GIVEN** uma matrícula com conquistas obtidas e suas datas registradas
- **WHEN** o Aluno expande Conquistas na trilha
- **THEN** vê os nomes e as datas originais dessa matrícula, sem nova concessão ou alteração de XP e sequência

#### Scenario: Matrícula sem conquistas
- **GIVEN** uma matrícula sem respostas e sem conquistas
- **WHEN** o Aluno abre a trilha e expande Conquistas
- **THEN** o resumo mostra zero XP, sequência zero e zero conquistas obtidas, e o detalhe informa Nenhuma conquista ainda

#### Scenario: Nova conquista na sessão
- **WHEN** uma resposta válida concede uma conquista
- **THEN** o feedback da sessão anuncia a conquista mesmo que os detalhes estivessem recolhidos na trilha
- **AND** ao voltar à trilha a quantidade e os detalhes refletem a mesma conquista, concedida uma única vez
