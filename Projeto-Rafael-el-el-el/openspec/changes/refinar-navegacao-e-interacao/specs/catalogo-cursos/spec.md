# Spec Delta

## ADDED Requirements

### Requirement: Retorno do catálogo com critérios preservados
O percurso catálogo–disciplina–catálogo SHALL conservar busca, área, nível e período válidos e reaplicar a mesma combinação ao retornar pelo aplicativo ou pelo navegador na mesma sessão. O detalhe SHALL identificar o contexto de origem sem conceder acesso ao estudo. URL direta sem origem SHALL oferecer Voltar ao catálogo com critérios padrão. Critérios inválidos SHALL ser tratados sem expor dados ou fingir resultados.

#### Scenario: Filtro preservado no retorno
- **GIVEN** Ana filtrou Algoritmos, Tecnologia, Iniciante e 2026.2
- **WHEN** abre Algoritmos e aciona Voltar ao catálogo
- **THEN** reencontra os quatro valores nos controles e os resultados correspondentes, sem ofertas de outros períodos atribuídas ao filtro
- **AND** a navegação não cria matrícula nem altera histórico, progresso ou gamificação

#### Scenario: Voltar e avançar pelo navegador
- **GIVEN** catálogo filtrado e detalhe aberto a partir dele
- **WHEN** a pessoa usa Voltar e depois Avançar do navegador
- **THEN** reconhece os critérios no catálogo e a mesma disciplina no detalhe, sem trocar identidade da oferta ou perder contexto por remontagem da tela

#### Scenario: Detalhe direto e critérios inválidos
- **WHEN** Ana abre diretamente uma disciplina publicada sem origem ou com área, nível ou período inexistentes no contexto autorizado
- **THEN** pode retornar ao catálogo com os critérios válidos disponíveis ou os padrões na ausência de origem
- **AND** critérios descartados não permanecem como seleções visuais falsas, não expõem rascunhos, questões, gabaritos ou dados de colegas e não redirecionam a endereços externos

#### Scenario: Limpar filtros e retornar novamente
- **GIVEN** pessoa que retornou ao catálogo com seus critérios anteriores
- **WHEN** aciona Limpar filtros, abre outra disciplina e volta ao catálogo
- **THEN** encontra os critérios limpos, sem restaurar silenciosamente a busca antiga, mantendo distinção entre vazio, erro e carregamento

