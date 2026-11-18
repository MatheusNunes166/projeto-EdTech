# Spec Delta

## ADDED Requirements

### Requirement: Percurso consistente nas listas de gestão
Pessoas, vínculos, cadastros e ofertas administráveis SHALL permitir localizar registros por texto e usar rótulos, filtros aplicáveis e ações de linha consistentes. Criar/editar SHALL conservar o contexto da lista ao concluir ou cancelar. Critérios SHALL operar somente sobre metadados autorizados, sem matrícula, vínculo ou mudança de função implícitos. Cadastros acadêmicos e conteúdo pedagógico MUST continuar separados.

#### Scenario: Buscar registro e voltar da edição
- **GIVEN** lista de pessoas, vínculos, graduações, disciplinas, períodos ou turmas com vários registros
- **WHEN** a pessoa autorizada busca um nome ou código, escolhe editar ou atribuir e depois conclui ou cancela o formulário
- **THEN** reencontra os critérios válidos e o registro/relação correspondente, com resultado identificado se houve comando aceito e sem perda silenciosa de valores em erro recuperável
- **AND** ações equivalentes ocupam a mesma posição entre linhas e têm nomes acessíveis que identificam o registro

#### Scenario: Busca e seleção no escopo da Coordenação
- **GIVEN** Carla professora em Matemática e coordenadora somente de Sistemas de Informação
- **WHEN** busca turmas e candidatos na gestão da Coordenação e abre diretamente um recurso fora desse escopo
- **THEN** os critérios da lista não acrescentam turmas docentes ao escopo coordenado e o acesso indevido é negado
- **AND** candidatos continuam elegíveis conforme a finalidade, sem expor documento global ou conceder funções

#### Scenario: Origem dos indicadores e acesso direto à gestão
- **GIVEN** pessoa autorizada que abriu a gestão da turma a partir do painel com graduação, disciplina, período e turma selecionados
- **WHEN** aciona Voltar aos indicadores
- **THEN** retorna com os mesmos critérios válidos, sem substituí-los por uma turma de mesmo código
- **AND** abrir a gestão diretamente mantém Voltar às turmas e acesso aos indicadores daquela oferta por contexto autorizado, sem depender de histórico anterior

#### Scenario: Vazio filtrado e turma sem matriculados
- **WHEN** um critério não encontra registros ou uma turma existente não tem alunos
- **THEN** a lista filtrada informa ausência de resultados e permite ajustar critérios, enquanto a turma conserva sua identidade e informa Nenhum aluno matriculado
- **AND** nenhum dos casos inventa indicadores, candidatos, matrículas ou ações não autorizadas

#### Scenario: Datas legíveis sem mudar o período
- **WHEN** a pessoa consulta os períodos em uma lista ou abre sua edição
- **THEN** identifica as datas de início e fim com rótulos e apresentação local legível na consulta, sem alterar os valores enviados ou as validações do formulário
- **AND** nomes e intervalos longos quebram em 360 px sem deslocar a ação para outro registro

#### Scenario: Confirmação e bloqueio preservam dados
- **GIVEN** edição de turma com identidade protegida e remoção de vínculo suportada
- **WHEN** a pessoa consulta o motivo da transferência bloqueada e cancela a confirmação de remoção
- **THEN** entende o bloqueio junto à ação e a relação que seria removida, sem gravação ou avanço de revisão
- **AND** na confirmação posterior válida, somente o vínculo identificado é removido, com resultado perceptível e preservação de pessoas, históricos e outros acessos

#### Scenario: Restauração cancelada no novo visual
- **GIVEN** dados locais compatíveis já utilizados, com respostas e conquistas
- **WHEN** a pessoa abre Demonstração, solicita restaurar e cancela o aviso
- **THEN** conserva dados, revisão, datas, histórico e sessão; recolher ou expandir também não altera o documento
- **AND** o refinamento visual não substitui seed ou dados automaticamente nem esconde o aviso obrigatório de incompatibilidade

