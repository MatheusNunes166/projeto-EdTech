import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { diferencaTextualQuestao } from '../conteudo/regras-disciplina';
import type { ConteudoCandidato } from '../dados/comandos-conteudo';
import { abrirConta, abrirDemonstracao, escolherFuncaoEntrada, renderizarApp } from './renderizar';

/**
 * 8.2 — Validação integrada entre funções, pela interface e com o armazenamento real do aplicativo.
 * Uma oferta nova percorre: Administrador prepara → Coordenador matricula → Professor publica →
 * Aluno estuda → Responsável acompanha; depois, revogação com tela aberta, edição rejeitada
 * integralmente, correção textual com histórico original e cancelamento da restauração.
 */
const entrarComo = async (usuario: UserEvent, nome: string) => {
  await abrirConta(usuario);
  await usuario.click(await screen.findByRole('button', { name: 'Sair' }));
  await escolherFuncaoEntrada(usuario, nome === 'Diego Martins' ? 'Aluno' : nome === 'Helena Souza' ? 'Responsável' : nome === 'Renata Alves' ? 'Administrador' : 'Professor');
  await usuario.click(await screen.findByRole('button', { name: `Entrar como ${nome}` }));
};
const irPara = async (usuario: UserEvent, menu: string) =>
  usuario.click(within(await screen.findByRole('navigation', { name: 'Menu principal' })).getByRole('link', { name: menu }));

describe('8.2 — fluxos integrados entre funções (PA, GC, AA, OA)', () => {
  it('Administrador → Coordenador → Professor → Aluno → Responsável, e as proteções entre eles', async () => {
    const { usuario, dados, outraAba, avisarOutraAba } = await renderizarApp('/admin', 'u-renata');
    const disciplina = () => dados().disciplinas.find((d) => d.nome === 'Estruturas de Dados')!;
    const turma = () => dados().turmas.find((t) => t.disciplinaId === disciplina().id)!;

    // 1. Administrador prepara a oferta: disciplina, turma, docente e vínculo de responsável.
    await irPara(usuario, 'Graduações e disciplinas');
    await usuario.click(await screen.findByRole('button', { name: 'Nova disciplina' }));
    const formDisc = async () => within(await screen.findByRole('form', { name: 'Nova disciplina' }));
    await usuario.selectOptions((await formDisc()).getByLabelText('Graduação da disciplina'), 'Sistemas de Informação');
    await usuario.type((await formDisc()).getByLabelText('Código da disciplina'), 'EDD');
    await usuario.type((await formDisc()).getByLabelText('Nome da disciplina'), 'Estruturas de Dados');
    await usuario.click((await formDisc()).getByRole('button', { name: 'Salvar disciplina' }));
    expect(await screen.findByText(/EDD — Estruturas de Dados/)).toBeInTheDocument();
    expect(disciplina()).toMatchObject({ status: 'rascunho', topicos: [] });

    await irPara(usuario, 'Períodos e turmas');
    await usuario.click(await screen.findByRole('button', { name: 'Nova turma' }));
    const formTurma = async () => within(await screen.findByRole('form', { name: 'Nova turma' }));
    await usuario.selectOptions((await formTurma()).getByLabelText('Disciplina da turma'), 'Estruturas de Dados');
    await usuario.selectOptions((await formTurma()).getByLabelText('Período da turma'), '2026.2');
    await usuario.type((await formTurma()).getByLabelText('Código da turma'), 'A');
    await usuario.click((await formTurma()).getByRole('button', { name: 'Salvar turma' }));
    expect(await screen.findByText(/Estruturas de Dados — Turma A — 2026\.2/)).toBeInTheDocument();

    await irPara(usuario, 'Matrículas e docentes');
    await usuario.click(await screen.findByRole('link', { name: 'Gerir turma A de Estruturas de Dados (2026.2)' }));
    await usuario.click(await screen.findByRole('button', { name: 'Nova atribuição docente' }));
    await usuario.selectOptions(await screen.findByLabelText('Professor a atribuir'), 'Marcos Silva');
    await usuario.click(screen.getByRole('button', { name: 'Atribuir professor' }));
    expect(await screen.findByRole('button', { name: 'Remover Marcos Silva' })).toBeInTheDocument();

    await irPara(usuario, 'Vínculos');
    await usuario.click(await screen.findByRole('button', { name: 'Novo vínculo de acompanhamento' }));
    await usuario.selectOptions(await screen.findByLabelText('Responsável'), 'Helena Souza');
    await usuario.selectOptions(screen.getByLabelText('Aluno'), 'Diego Martins');
    await usuario.click(screen.getByRole('button', { name: 'Vincular responsável' }));
    expect(await screen.findByText(/Helena Souza acompanha Diego Martins/)).toBeInTheDocument();

    // 2. Coordenador gere o seu curso: matricula o aluno, mas não edita o conteúdo.
    await entrarComo(usuario, 'Carla Dias');
    await usuario.click(await screen.findByRole('link', { name: 'Área da Coordenação' }));
    await irPara(usuario, 'Gestão acadêmica');
    expect(screen.queryByRole('link', { name: /Matemática Básica/ })).toBeNull(); // cursos que ela só leciona
    await usuario.click(await screen.findByRole('link', { name: 'Gerir turma A de Estruturas de Dados (2026.2)' }));
    await usuario.click(await screen.findByRole('button', { name: 'Nova matrícula' }));
    await usuario.selectOptions(await screen.findByLabelText('Aluno a matricular'), 'Diego Martins');
    await usuario.click(screen.getByRole('button', { name: 'Matricular' }));
    expect(await screen.findByText(/Matrícula realizada./)).toBeInTheDocument();
    expect(dados().matriculas.filter((m) => m.turmaId === turma().id && m.alunoId === 'u-diego')).toHaveLength(1);

    // A coordenação não concede autoria pedagógica: o editor da disciplina lhe é negado.
    const idDisc = disciplina().id;
    const carla = outraAba('u-carla');
    await expect(carla.consultarConteudoEditavel({ disciplinaId: idDisc })).rejects.toMatchObject({ codigo: 'ACESSO_NEGADO' });

    // 3. Professor cria o conteúdo (um tópico com as três dificuldades) e publica pela interface.
    const marcos = outraAba('u-marcos');
    const rev = async () => (await marcos.consultarConteudoEditavel({ disciplinaId: idDisc })).revisao;
    const candidato: ConteudoCandidato = {
      topicos: [{ id: 'tp-pilhas', titulo: 'Pilhas', materiais: [{ id: 'mat-pilhas', tipo: 'texto', titulo: 'Pilha LIFO', conteudo: 'Último a entrar, primeiro a sair.' }] }],
      questoes: (['facil', 'medio', 'dificil'] as const).map((dificuldade) => ({
        id: `q-pilhas-${dificuldade}`, topicoId: 'tp-pilhas', dificuldade, enunciado: `Pilhas ${dificuldade}: qual a ordem de saída?`,
        alternativas: ['LIFO', 'FIFO'], correta: 0, explicacao: 'Pilhas seguem LIFO.', revisao: 0,
      })),
    };
    await marcos.salvarConteudo({ disciplinaId: idDisc }, candidato, await rev());
    await entrarComo(usuario, 'Marcos Silva');
    const cartao = await screen.findByRole('listitem', { name: 'Estruturas de Dados turma A 2026.2' });
    await usuario.click(within(cartao).getByRole('link', { name: /Conteúdo de Estruturas de Dados/ }));
    await usuario.click(await screen.findByRole('button', { name: 'Publicar conteúdo' }));
    expect(await screen.findByText('Alterações salvas.')).toBeInTheDocument();
    expect(disciplina().status).toBe('publicado');

    // 4. Aluno estuda a turma recém-publicada.
    await entrarComo(usuario, 'Diego Martins');
    const minha = await screen.findByRole('article', { name: 'Estruturas de Dados turma A 2026.2' });
    await usuario.click(await within(minha).findByRole('link', { name: 'Começar trilha' }));
    await usuario.click(await screen.findByRole('link', { name: 'Estudar' }));
    const enunciado = (await screen.findByRole('heading', { level: 2, name: (n) => n.length > 0 })).textContent!;
    expect(enunciado).toContain('Pilhas facil'); // início sem diagnóstico, nível Fácil
    await usuario.click(await screen.findByLabelText('LIFO'));
    await usuario.click(screen.getByRole('button', { name: 'Responder' }));
    expect(await screen.findByText(/Você acertou!/)).toBeInTheDocument();
    expect(dados().respostas.filter((r) => r.matriculaId === dados().matriculas.find((m) => m.alunoId === 'u-diego' && m.turmaId === turma().id)!.id)).toHaveLength(1);

    // 5. Responsável acompanha o aluno vinculado, sem histórico de questões.
    await entrarComo(usuario, 'Helena Souza');
    const diego = await screen.findByRole('region', { name: 'Aluno Diego Martins' });
    const oferta = await within(diego).findByLabelText('Diego Martins — Estruturas de Dados turma A 2026.2');
    expect(oferta).toHaveTextContent('Sequência: 1 dia(s)');
    expect(oferta).toHaveTextContent('Última atividade: 17/11/2026');
    expect(diego.textContent).not.toContain('Pilhas facil');

    // 6. Edição rejeitada integralmente: material válido + novo tópico (bloqueado após a resposta).
    const antes = JSON.stringify(dados());
    const mistura: ConteudoCandidato = structuredClone(candidato);
    mistura.topicos[0].materiais[0].conteudo = 'Texto corrigido';
    mistura.topicos.push({ id: 'tp-filas', titulo: 'Filas', materiais: [] });
    await expect(marcos.salvarConteudo({ disciplinaId: idDisc }, mistura, await rev())).rejects.toMatchObject({ codigo: 'VALIDACAO_REJEITADA' });
    expect(JSON.stringify(dados())).toBe(antes);

    // 7. Correção textual confirmada pelo próprio autor; o histórico do aluno mantém o original.
    const original = candidato.questoes[0].enunciado;
    const corrigida = structuredClone(candidato); corrigida.questoes[0].enunciado = `${original} (revisado)`;
    await marcos.salvarConteudo({ disciplinaId: idDisc }, corrigida, await rev(), [{ recursoId: candidato.questoes[0].id, revisaoOriginal: 0, diferenca: diferencaTextualQuestao(candidato.questoes[0], corrigida.questoes[0]) }]);
    expect(dados().questoes.find((q) => q.id === 'q-pilhas-facil')!.enunciado).toBe(`${original} (revisado)`);
    await entrarComo(usuario, 'Marcos Silva');
    await usuario.click(within(await screen.findByRole('listitem', { name: 'Estruturas de Dados turma A 2026.2' })).getByRole('link', { name: /Painel da turma A/ }));
    await usuario.click(within(await screen.findByRole('listitem', { name: 'Diego Martins' })).getByRole('link', { name: /Detalhe de Diego Martins/ }));
    expect((await screen.findAllByText(original)).length).toBeGreaterThan(0);
    expect(screen.queryByText(`${original} (revisado)`)).toBeNull();

    // 8. Revogação com a tela do editor aberta: sem vínculo, o próximo carregamento nega o acesso.
    await usuario.click(screen.getByRole('link', { name: 'Voltar à turma' }));
    await irPara(usuario, 'Minhas turmas');
    await usuario.click(within(await screen.findByRole('listitem', { name: 'Estruturas de Dados turma A 2026.2' })).getByRole('link', { name: /Conteúdo de Estruturas de Dados/ }));
    await screen.findByRole('button', { name: 'Editar tópico Pilhas' });
    const admin = outraAba('u-renata');
    await admin.definirVinculoProfessor({ turmaId: turma().id }, { professorId: 'u-marcos' }, false, (await admin.consultarDataVirtual()).revisao);
    avisarOutraAba();
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar tópico Pilhas' })).toBeNull();
    expect(dados().respostas.length).toBeGreaterThan(0); // histórico e matrícula preservados
    expect(dados().matriculas.some((m) => m.turmaId === turma().id)).toBe(true);

    // 9. Cancelamento da restauração: nada muda e a pessoa continua na sessão.
    await entrarComo(usuario, 'Renata Alves');
    const estadoAntes = JSON.stringify(dados());
    await abrirDemonstracao(usuario);
    await usuario.click(await screen.findByRole('button', { name: 'Restaurar dados de demonstração' }));
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(JSON.stringify(dados())).toBe(estadoAntes);
    expect(screen.getByText('Renata Alves')).toBeInTheDocument();
    expect(disciplina().nome).toBe('Estruturas de Dados'); // alterações da demonstração preservadas
  }, 120000);
});
