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
