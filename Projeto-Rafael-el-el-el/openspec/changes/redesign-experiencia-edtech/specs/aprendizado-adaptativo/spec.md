# Spec Delta

## ADDED Requirements

### Requirement: Visão orientadora da trilha
A trilha SHALL exibir identificação acadêmica, progresso e tópicos na ordem da disciplina, com domínio e estados textuais Bloqueado, Desbloqueado ou Dominado. SHALL destacar como Próximo recomendado o tópico da próxima atividade indicada pelo motor da matrícula. Materiais dos tópicos liberados e Desempenho SHALL continuar acessíveis. Trilha concluída SHALL indicar conclusão sem sugerir atividade ou aprovação acadêmica.

#### Scenario: Recomendação coincide com o motor
- **GIVEN** tópicos desbloqueados e não dominados com domínios 30 e 60 na mesma matrícula
- **WHEN** o Aluno abre a trilha
- **THEN** vê os tópicos em sua ordem cadastrada, o tópico de domínio 30 identificado como Próximo recomendado e uma ação principal para estudar a atividade escolhida pelo motor
- **AND** não há alteração de domínio ou registro de resposta por consultar a trilha

#### Scenario: Empate mantém a ordem pedagógica
- **GIVEN** dois tópicos elegíveis com o mesmo domínio e uma próxima atividade indicada pelo motor
- **WHEN** a trilha mostra a recomendação
- **THEN** destaca somente o tópico escolhido pelo motor, respeitando o desempate pela ordem dos tópicos

#### Scenario: Materiais disponíveis sem desviar o estudo
- **GIVEN** um tópico bloqueado e um tópico liberado, ambos com materiais cadastrados
- **WHEN** o Aluno abre a trilha
- **THEN** encontra acesso aos materiais do tópico liberado e Desempenho da turma como ações secundárias, sem acesso aos materiais bloqueados

#### Scenario: Conclusão sem recomendação
- **WHEN** o Aluno abre uma trilha com todos os tópicos dominados
- **THEN** vê 100%, Trilha concluída e a indicação de que isso não representa aprovação acadêmica, sem Próximo recomendado ou ação para responder outra questão
- **AND** materiais liberados e Desempenho permanecem acessíveis

#### Scenario: Nenhuma atividade disponível sem conclusão
- **GIVEN** trilha não concluída cuja consulta não fornece próxima atividade
- **WHEN** o Aluno abre a trilha
- **THEN** o sistema informa que não há questões disponíveis, sem inventar recomendação ou anunciar conclusão

### Requirement: Questão como conteúdo principal da sessão
A sessão SHALL dar maior espaço à questão e às alternativas, exibindo tópico e dificuldade junto do enunciado. SHALL manter seleção de alternativa e envio explícito por Responder, indisponível sem seleção. Em telas estreitas, as alternativas SHALL ficar empilhadas e seus textos integralmente legíveis. Gabarito e explicação MUST NOT aparecer antes de resposta válida.

#### Scenario: Selecionar antes de responder
- **WHEN** o Aluno abre uma questão e seleciona uma alternativa
- **THEN** vê a seleção sem registro de resposta ou revelação do gabarito e pode acionar Responder

#### Scenario: Alternativas no celular
- **WHEN** a sessão é exibida a 360 px com alternativas longas
- **THEN** as alternativas ficam em uma coluna, com rótulos completos e Responder acessível, sem rolagem horizontal

#### Scenario: Erro no envio
- **GIVEN** uma alternativa selecionada
- **WHEN** o envio da resposta falha
- **THEN** a questão e a seleção permanecem, o erro é informado e não há feedback de sucesso ou avanço automático

### Requirement: Resumo de contexto da sessão
No desktop, a sessão SHALL apresentar coluna secundária somente com disciplina, turma, período, progresso da matrícula e Ver trilha. Em telas estreitas, o mesmo resumo SHALL virar faixa compacta acima da questão. XP, sequência, conquistas, lista de tópicos e materiais SHALL permanecer acessíveis pela trilha, sem ocupar esse resumo. Ver trilha SHALL levar à mesma matrícula sem registrar resposta.

#### Scenario: Questão em destaque no desktop
- **WHEN** o Aluno abre a sessão em largura de desktop
- **THEN** a coluna da questão é mais larga que a coluna do resumo e o resumo contém somente disciplina, turma, período, progresso e Ver trilha

#### Scenario: Contexto compacto no celular
- **WHEN** o Aluno abre a sessão em tela estreita
- **THEN** lê disciplina, turma, período e progresso em faixa compacta acima da questão e encontra Ver trilha da mesma matrícula

### Requirement: Leitura de materiais com contexto de estudo
A tela de materiais SHALL identificar disciplina, turma, período e tópico, listar títulos e tipos e permitir ler texto ou abrir links autorizados. SHALL oferecer retorno à trilha da mesma matrícula. Ausência de materiais, carregamento e falha SHALL ter mensagens distintas. Consultar materiais MUST NOT registrar resposta ou alterar o estado do estudo.

#### Scenario: Revisar um material e voltar à oferta
- **GIVEN** Ana matriculada em duas ofertas de Algoritmos e tópico liberado somente no contexto consultado
- **WHEN** abre o material desse tópico em 2026.2, lê o texto ou acessa o link e aciona Voltar à trilha
- **THEN** retorna à trilha de 2026.2, sem trocar para 2027.1, registrar resposta ou modificar indicadores

#### Scenario: Materiais no celular
- **WHEN** o Aluno consulta a 360 px um tópico liberado com títulos e links longos
- **THEN** identifica os materiais e seus tipos, lê textos e alcança os links e o retorno sem corte ou sobreposição

#### Scenario: Tópico sem material ou sem acesso
- **WHEN** a consulta autorizada não tem materiais ou o Aluno tenta abrir tópico bloqueado por endereço direto
- **THEN** o primeiro caso informa ausência de materiais e permite voltar, enquanto o segundo nega acesso sem expor conteúdo restrito

## MODIFIED Requirements

### Requirement: Feedback imediato
Após cada resposta válida, o sistema SHALL informar acerto ou erro, exibir a explicação da questão e mostrar o domínio atualizado e sua variação no tópico da turma atual. Em caso de erro, SHALL identificar a alternativa correta. A questão respondida, a seleção e o feedback SHALL permanecer visíveis até ação explícita de avanço ou saída; as alternativas respondidas MUST NOT permitir novo envio. O feedback SHALL manter os avisos de XP, domínio, desbloqueio, conquistas, revisão sugerida e conclusão aplicáveis. Sem conclusão, SHALL oferecer Próxima questão ou Continuar mesmo assim quando houver revisão sugerida; com conclusão, SHALL oferecer Ver trilha sem gerar nova atividade.

#### Scenario: Feedback após erro
- **GIVEN** domínio 55 em Vetores
- **WHEN** Ana erra uma questão Médio desse tópico
- **THEN** o sistema mostra a alternativa correta, explicação, variação de menos 10 e domínio 45

#### Scenario: Aguardar o avanço do aluno
- **GIVEN** resposta válida já registrada e trilha não concluída
- **WHEN** os indicadores são atualizados ou a tela é redimensionada
- **THEN** permanecem a questão respondida, a seleção e o feedback, sem outra resposta ou troca automática de questão
- **AND** somente ao acionar Próxima questão o Aluno recebe a próxima atividade indicada pelo motor

#### Scenario: Revisão e continuidade explícita
- **GIVEN** segundo erro consecutivo no mesmo tópico e turma
- **WHEN** o feedback é exibido
- **THEN** inclui a sugestão de revisão, o acesso aos materiais desse tópico e Continuar mesmo assim
- **AND** a revisão não é obrigatória, não há encaminhamento de monitoria e a próxima questão só aparece após o avanço explícito

#### Scenario: Resposta conclui a trilha
- **WHEN** uma resposta válida domina o último tópico pendente
- **THEN** o feedback mantém os resultados aplicáveis, mostra conclusão e oferece Ver trilha em lugar de Próxima questão
- **AND** retornar à trilha preserva os 100%, o histórico e a gamificação da matrícula
