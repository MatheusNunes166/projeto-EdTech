# Spec Delta

## ADDED Requirements

### Requirement: Leitura contínua dos estados de estudo
Trilha e sessão SHALL apresentar próximo passo, estados dos tópicos, seleção, envio e resultado como etapas distinguíveis por texto e hierarquia. A ação principal SHALL corresponder ao estado real da matrícula. Feedback SHALL relacionar resultado e continuidade à resposta apresentada, sem trocar atividade ou registrar resposta por seleção, expansão, retorno ou animação. Recomendação, avaliação e gamificação MUST continuar usando as regras existentes.

#### Scenario: Próximo passo e tópico bloqueado
- **GIVEN** Ana com tópico dominado, tópico recomendado e tópico bloqueado na turma A
- **WHEN** consulta a trilha nas três larguras
- **THEN** distingue os três estados por texto, identifica Estudar como ação do próximo passo indicado pelo motor e lê o motivo da indisponibilidade do tópico bloqueado
- **AND** acessar os materiais liberados continua uma ação secundária da mesma oferta

#### Scenario: Seleção visível sem avaliação antecipada
- **WHEN** o Aluno escolhe por teclado uma alternativa longa e redimensiona entre 1280, 768 e 360 px antes de responder
- **THEN** a mesma alternativa permanece identificada como Selecionada pelo controle e por texto, com enunciado e alternativas completos
- **AND** não há resposta, XP, explicação ou gabarito antecipado

#### Scenario: Envio e recuperação sem duplicação
- **GIVEN** alternativa selecionada e registro de resposta em andamento
- **WHEN** o envio é lento ou falha
- **THEN** Enviando e o bloqueio de reenvio são perceptíveis durante a operação; após falha recuperável, a questão e a seleção continuam disponíveis para nova tentativa
- **AND** não há sucesso, avanço ou efeito de resposta não confirmada

#### Scenario: Resultado estável e continuidade voluntária
- **WHEN** uma resposta válida incorreta é registrada
- **THEN** a seleção, o resultado, a correta, a explicação e os efeitos aplicáveis permanecem associados à questão, com acesso perceptível à próxima ação
- **AND** dois erros seguidos no mesmo tópico/turma oferecem revisar materiais ou Continuar mesmo assim, sem monitoria nem avanço automático; só a ação explícita solicita a próxima atividade

#### Scenario: Conclusão e retorno coerentes
- **WHEN** uma resposta válida conclui a trilha
- **THEN** a pessoa reconhece Trilha concluída e Ver trilha como próximo passo, sem botão que gere outra atividade
- **AND** o retorno antes do título e no resumo aponta à mesma matrícula; consulta, retorno e novo layout não reiniciam histórico, domínio, XP, conquistas ou datas nem significam aprovação acadêmica

