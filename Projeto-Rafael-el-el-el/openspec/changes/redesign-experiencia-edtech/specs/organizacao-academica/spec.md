# Spec Delta

## MODIFIED Requirements

### Requirement: Demonstração fictícia e restauração
O protótipo SHALL oferecer dados exclusivamente fictícios, com pelo menos duas graduações, duas disciplinas por graduação, dois períodos, turmas paralelas, uma turma vazia e uma pessoa Professor e Coordenador. SHALL permitir restaurar a demonstração e informar antes da restauração ou substituição de dados locais que o histórico fictício será apagado, sem migração da estrutura anterior. Nas áreas autenticadas, SHALL reunir data simulada, avanço de um dia e restauração em Demonstração, recolhida por padrão, disponível em todos os perfis. Na entrada, SHALL manter a restauração acessível em Demonstração recolhida, sem liberar controles de data que exigem sessão. Expandir ou recolher MUST NOT alterar dados. A restauração SHALL exigir confirmação explícita após aviso de perda das alterações e histórico fictícios e encerramento da sessão; cancelar ou falhar MUST preservar dados e sessão. O aviso obrigatório de dados locais incompatíveis MUST NOT ficar oculto no agrupamento recolhido.

#### Scenario: Dados suficientes para validar a organização
- **WHEN** o usuário inicia a demonstração restaurada
- **THEN** encontra os exemplos acadêmicos e a pessoa com funções cumulativas, incluindo ofertas da mesma disciplina em períodos distintos

#### Scenario: Restaurar demonstração
- **GIVEN** dados fictícios alterados durante a demonstração
- **WHEN** o usuário confirma a restauração após o aviso de perda de histórico
- **THEN** o sistema recupera os dados iniciais fictícios e remove as alterações locais da demonstração
- **AND** encerra a sessão atual e volta à entrada por função

#### Scenario: Controles recolhidos ao abrir a área
- **WHEN** uma pessoa abre uma área autenticada
- **THEN** encontra o acionador Demonstração, com os controles internos inicialmente recolhidos
- **AND** ao expandi-lo encontra a data simulada, Simular próximo dia e Restaurar dados de demonstração

#### Scenario: Avançar a data da demonstração
- **GIVEN** uma pessoa autenticada com Demonstração aberta
- **WHEN** aciona Simular próximo dia e a operação é aceita
- **THEN** a data simulada avança exatamente um dia e os indicadores dependentes dela são atualizados pelas regras existentes, sem registrar resposta de estudo

#### Scenario: Cancelar a restauração
- **GIVEN** alterações e histórico fictício existentes em uma sessão aberta
- **WHEN** a pessoa solicita restauração, lê o aviso e cancela
- **THEN** dados, data simulada, histórico e pessoa atual permanecem inalterados

#### Scenario: Falha na restauração
- **WHEN** uma restauração confirmada falha ao salvar os dados
- **THEN** o sistema mostra o erro sem mensagem de sucesso e mantém os dados anteriores e a sessão atual

#### Scenario: Restauração na entrada
- **WHEN** uma pessoa sem sessão expande Demonstração na entrada
- **THEN** pode solicitar a restauração com aviso e confirmação, mas não encontra ação para avançar a data simulada

#### Scenario: Aviso de dados incompatíveis
- **GIVEN** dados locais incompatíveis com o aplicativo atual
- **WHEN** a aplicação é aberta
- **THEN** o aviso de substituição e perda de histórico aparece antes de qualquer substituição e independentemente de Demonstração estar recolhida
- **AND** cancelar mantém os dados intactos e confirmar segue o fluxo de substituição existente, sem migração

#### Scenario: Redesign com dados locais já utilizados
- **GIVEN** dados locais compatíveis com matrículas, respostas, XP e conquistas alterados durante a demonstração
- **WHEN** a pessoa abre e percorre as telas reorganizadas sem confirmar restauração
- **THEN** os mesmos dados e datas permanecem, sem substituição automática, migração ou reinicialização provocada pelo novo layout

## ADDED Requirements

### Requirement: Cadastros acadêmicos por contexto e registro
Os cadastros SHALL distinguir graduações/disciplinas de períodos/turmas, com listas e relações identificáveis antes dos formulários. Criar ou editar SHALL abrir o registro escolhido e manter cadastro acadêmico separado do conteúdo pedagógico. Na Coordenação, seções compartilhadas SHALL oferecer somente ações autorizadas no escopo; manutenção global SHALL continuar exclusiva da Administração.

#### Scenario: Graduações e disciplinas na Administração
- **WHEN** o Administrador abre Graduações e disciplinas
- **THEN** encontra listas com códigos, nomes e área ou graduação/publicação correspondentes, sem formulários simultâneos de criação
- **AND** pode escolher Nova graduação, Nova disciplina ou Editar um registro, sem editar tópicos e questões pelo cadastro acadêmico

#### Scenario: Períodos e turmas na Administração
- **WHEN** o Administrador abre Períodos e turmas e escolhe Editar uma oferta
- **THEN** distingue a lista de períodos com datas da lista de turmas com disciplina, código e período e abre somente o formulário da turma escolhida

#### Scenario: Cadastros na Coordenação
- **GIVEN** Carla coordenadora somente de Direito
- **WHEN** abre Cadastros
- **THEN** distingue graduações/disciplinas de períodos/turmas, pode editar Direito e manter suas disciplinas e turmas e consultar períodos disponíveis
- **AND** não encontra gestão global de períodos, criação de graduação ou edição pedagógica concedidas pela função Coordenador

#### Scenario: Identidade protegida explicada no formulário
- **GIVEN** turma com matrícula ou resposta registrada
- **WHEN** a pessoa autorizada abre sua edição
- **THEN** encontra explicação junto à disciplina e ao período de que a oferta não pode ser transferida e que outra oferta exige nova turma
- **AND** renomear código permitido não reinicia matrículas, histórico ou resultados, conforme Identidade das ofertas e histórico

#### Scenario: Falha preserva valores do cadastro
- **WHEN** a pessoa tenta salvar graduação com código duplicado ou período com intervalo inválido
- **THEN** vê o problema junto ao campo afetado, conserva os valores digitados e não recebe sucesso nem alteração parcial

### Requirement: Gestão de matrícula e docência na oferta escolhida
A gestão SHALL iniciar pela seleção de turma identificada por graduação, disciplina, código e período. Na turma, listas de matriculados e professores SHALL preceder ações de Matricular ou Atribuir professor, abertas sob demanda com candidatos elegíveis. Resultados SHALL identificar a operação e a oferta; remoção docente SHALL exigir confirmação contextualizada, preservando históricos e outros vínculos.

#### Scenario: Escolher turma para gerir
- **WHEN** Administrador ou Coordenador autorizado abre Gestão acadêmica
- **THEN** vê somente as ofertas administráveis, identifica cada uma antes de escolher e abre matrículas e docentes da turma selecionada

#### Scenario: Matricular sem formulário docente concorrente
- **GIVEN** pessoa autorizada na gestão de A
- **WHEN** escolhe Matricular, seleciona Aluno ativo elegível e confirma
- **THEN** a seleção de matrícula abre sob demanda, sem abrir simultaneamente atribuição docente, e o resultado identifica aluno e turma
- **AND** matrícula repetida informa que já existe, sem duplicação ou perda de estudo

#### Scenario: Atribuir docente à oferta identificada
- **WHEN** o Coordenador autorizado abre Atribuir professor e escolhe um candidato elegível para A
- **THEN** a atribuição reflete-se na lista de A com resultado identificado, sem alterar ofertas B ou conceder funções à pessoa selecionada

#### Scenario: Turma sem pessoas e sem candidatos
- **WHEN** a pessoa abre turma sem matriculados ou docentes e a seleção de vínculo não tem candidatos elegíveis
- **THEN** diferencia Nenhum aluno matriculado, Nenhum professor atribuído e ausência de candidatos, mantendo o contexto da turma e sem inventar registros

#### Scenario: Remover docente de uma de várias turmas
- **GIVEN** Paulo vinculado a A e B
- **WHEN** a pessoa autorizada confirma sua remoção identificada de A
- **THEN** somente esse vínculo é removido, o resultado identifica A e B e os históricos dos alunos permanecem, conforme Revogação de vínculos acadêmicos
