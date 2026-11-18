import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { diferencaTextualQuestao } from '../conteudo/regras-disciplina';
import { renderizarApp } from './renderizar';

const PAINEL = (d: string, t: string) => `/professor/disciplinas/${d}/turmas/${t}`;

describe('7.11 — [AC] Painel do professor por turma, Turma sem alunos, Alunos com dificuldade, Detalhe de aluno; [AA] Histórico exibe o conteúdo anterior', () => {
  it('professor com várias turmas as identifica e abre o painel só da turma escolhida', async () => {
    const { usuario } = await renderizarApp('/professor', 'u-marcos');
    expect(await screen.findByRole('listitem', { name: 'Algoritmos turma A 2026.2' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Algoritmos turma A 2027.1' })).toBeInTheDocument();
    const b = screen.getByRole('listitem', { name: 'Algoritmos turma B 2026.2' });
    expect(screen.queryByRole('listitem', { name: /Inglês|Matemática/ })).toBeNull();
    await usuario.click(within(b).getByRole('link', { name: /Painel da turma B/ }));
    expect(await screen.findByRole('heading', { name: /Algoritmos — Turma B/ })).toBeInTheDocument();
    expect(await screen.findByRole('listitem', { name: /Bruno Lima/ })).toBeInTheDocument();
    expect(screen.queryByText(/Ana Souza|Elisa Prado|Diego Martins/)).toBeNull();
  });

  it('aluno com menos de 50% nas últimas respostas aparece como Precisa de atenção; quem não respondeu, como Sem atividade', async () => {
    await renderizarApp(PAINEL('d-alg', 't-alg-b-262'), 'u-marcos');
    expect(await screen.findByRole('listitem', { name: /Bruno Lima/ })).toHaveTextContent('Precisa de atenção');
    await renderizarApp(PAINEL('d-alg', 't-alg-a-262'), 'u-marcos');
    const diego = await screen.findByRole('listitem', { name: /Diego Martins/ });
    expect(diego).toHaveTextContent('Sem atividade');
    expect(diego).not.toHaveTextContent('Precisa de atenção');
    expect(screen.getByRole('listitem', { name: /Elisa Prado/ })).toHaveTextContent('100%');
  });

  it('turma vazia: zero matrículas, Nenhum aluno matriculado e indicadores agregados Sem dados', async () => {
    await renderizarApp(PAINEL('d-mat', 't-mat-a-271'), 'u-carla');
    expect(await screen.findByText('Nenhum aluno matriculado')).toBeInTheDocument();
    expect(screen.getByText(/matriculado\(s\)/)).toHaveTextContent('0 matriculado(s)');
    expect(screen.getByRole('region', { name: 'Indicadores agregados da turma' })).toHaveTextContent('Progresso médio: Sem dados · Domínio médio por tópico: Sem dados');
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('turma com alunos mostra progresso médio e domínio médio por tópico (incluindo quem não iniciou)', async () => {
    const { usuario } = await renderizarApp(PAINEL('d-alg', 't-alg-a-262'), 'u-marcos');
    const agregados = await screen.findByRole('region', { name: 'Indicadores agregados da turma' });
    expect(agregados).toHaveTextContent(/Progresso médio: \d+%/);
    await usuario.click(within(agregados).getByText('Domínio médio por tópico'));
    const topicos = within(agregados).getAllByText(/Domínio médio —/);
    expect(topicos).toHaveLength(3);
    expect(topicos[0]).toBeVisible();
  });

  it('detalhe do aluno: domínio por tópico e no máximo as últimas 10 respostas, com o conteúdo originalmente apresentado', async () => {
    const { usuario } = await renderizarApp(PAINEL('d-alg', 't-alg-a-262'), 'u-marcos');
    await usuario.click(within(await screen.findByRole('listitem', { name: /Elisa Prado/ })).getByRole('link', { name: /Detalhe de/ }));
    expect(await screen.findByRole('heading', { name: 'Elisa Prado' })).toBeInTheDocument();
    expect(screen.getByText('Domínio por tópico')).toBeInTheDocument();
    const respostas = within(screen.getByRole('list', { name: 'Últimas respostas' })).getAllByRole('listitem').filter((l) => l.className === 'registro');
    expect(respostas).toHaveLength(10); // Elisa tem 21 respostas
  });

  it('após correção textual aprovada, o detalhe continua exibindo o enunciado original', async () => {
    const { usuario, outraAba, dados } = await renderizarApp(PAINEL('d-alg', 't-alg-b-262'), 'u-marcos');
    await screen.findByRole('listitem', { name: /Bruno Lima/ });
    const resposta = dados().respostas.find((r) => r.matriculaId === 'm-bruno-alg-b-262')!;
    const original = resposta.conteudoOriginal.enunciado;
    const marcos = outraAba('u-marcos');
    const { dados: ed, revisao } = await marcos.consultarConteudoEditavel({ disciplinaId: 'd-alg' });
    const candidato = { topicos: structuredClone(ed.disciplina.topicos), questoes: ed.questoes.map(({ disciplinaId: _d, ...q }) => ({ ...q, alternativas: [...q.alternativas] })) };
    const q = candidato.questoes.find((x) => x.id === resposta.questaoId)!; const antes = structuredClone(q);
    q.enunciado = `${original} (revisado)`;
    await marcos.salvarConteudo({ disciplinaId: 'd-alg' }, candidato, revisao, [{ recursoId: q.id, revisaoOriginal: antes.revisao, diferenca: diferencaTextualQuestao(antes, q) }]);
    await usuario.click(within(screen.getByRole('listitem', { name: /Bruno Lima/ })).getByRole('link', { name: /Detalhe de/ }));
    expect(await screen.findByRole('heading', { name: 'Bruno Lima' })).toBeInTheDocument();
    const lista = screen.getByRole('list', { name: 'Últimas respostas' });
    const item = within(lista).getAllByRole('listitem').find((l) => l.textContent?.includes(original))!;
    await usuario.click(item.querySelector('summary')!);
    expect(within(item).getByText(original)).toBeVisible();
    expect(item).toHaveTextContent(resposta.conteudoOriginal.explicacao);
    expect(screen.queryByText(`${original} (revisado)`)).toBeNull();
  });

  it('nega detalhe de aluno em turma não vinculada, mesmo com a mesma disciplina ou o mesmo aluno', async () => {
    const preparar = (d: import('../dominio/tipos').DadosAcademicos) => { d.vinculosProfessor = d.vinculosProfessor.filter((v) => v.turmaId !== 't-alg-a-271'); };
    const permitido = await renderizarApp(`${PAINEL('d-alg', 't-alg-a-262')}/alunos/m-ana-alg-a-262`, 'u-marcos', preparar);
    expect(await screen.findByRole('heading', { name: 'Ana Souza' })).toBeInTheDocument();
    permitido.unmount();
    const negado = await renderizarApp(`${PAINEL('d-alg', 't-alg-a-271')}/alunos/m-ana-alg-a-271`, 'u-marcos', preparar);
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    negado.unmount();
    await renderizarApp(`${PAINEL('d-alg', 't-alg-a-262')}/alunos/m-bruno-alg-b-262`, 'u-marcos'); // matrícula de outra turma
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
  });
});

const grupoQuestao = (id: string) => screen.getByRole('group', { name: `Questão ${id}` });
const respondida = (dados: () => import('../dominio/tipos').DadosAcademicos) => dados().respostas.find((r) => r.matriculaId === 'm-bruno-alg-b-262')!.questaoId;
async function substituir(usuario: UserEvent, campo: HTMLElement, texto: string) { await usuario.clear(campo); await usuario.type(campo, texto); }

describe('7.12 — [GC] Tópicos ordenados, Bloqueio estrutural após início do estudo, Validade contínua do conteúdo publicado', () => {
  it('descartar o rascunho local restaura o conteúdo gravado sem salvar nada', async () => {
    const { usuario, dados } = await renderizarApp('/professor/disciplinas/d-alg/conteudo', 'u-marcos');
    const titulo = await screen.findByLabelText('Título do tópico 1');
    const antes = JSON.stringify(dados());
    await substituir(usuario, titulo, 'Outro nome');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();
    await usuario.click(screen.getByRole('button', { name: 'Descartar alterações' }));
    expect(screen.getByLabelText('Título do tópico 1')).toHaveValue('Variáveis');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
    expect(JSON.stringify(dados())).toBe(antes);
  });

  it('antes do estudo, um tópico com as três dificuldades é enviado de uma só vez em disciplina publicada', async () => {
    const { usuario, dados } = await renderizarApp('/professor/disciplinas/d-ing/conteudo', 'u-julia', (d) => {
      d.respostas = d.respostas.filter((r) => r.matriculaId !== 'm-ana-ing-a-262');
    });
    await screen.findByLabelText('Título do tópico 1');
    await usuario.click(screen.getByRole('button', { name: 'Adicionar tópico' }));
    await usuario.type(screen.getByLabelText('Título do tópico 4'), 'Novo');
    const existentes = screen.getAllByRole('group', { name: /^Questão / }).length;
    for (let i = 0; i < 3; i++) await usuario.click(screen.getByRole('button', { name: 'Adicionar questão' }));
    const novas = screen.getAllByRole('group', { name: /^Questão / }).slice(existentes);
    expect(novas).toHaveLength(3);
    for (const [i, grupo] of novas.entries()) {
      await usuario.selectOptions(within(grupo).getByLabelText('Tópico'), 'Novo');
      await usuario.selectOptions(within(grupo).getByLabelText('Dificuldade'), ['Fácil', 'Médio', 'Difícil'][i]);
      await usuario.type(within(grupo).getByLabelText('Enunciado'), 'E'); await usuario.type(within(grupo).getByLabelText('Explicação'), 'x');
      await usuario.type(within(grupo).getByLabelText(/^Alternativa 1 da questão/), 'a'); await usuario.type(within(grupo).getByLabelText(/^Alternativa 2 da questão/), 'b');
    }
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByText('Alterações salvas.')).toBeInTheDocument();
    const d = dados().disciplinas.find((x) => x.id === 'd-ing')!;
    expect(d.topicos).toHaveLength(4); expect(d.status).toBe('publicado');
    expect(dados().questoes.filter((q) => q.disciplinaId === 'd-ing' && q.topicoId === d.topicos[3].id)).toHaveLength(3);
  });

  it('após respostas, adicionar ou reordenar tópicos é rejeitado: informa o bloqueio, mantém a versão publicada e não mostra sucesso', async () => {
    const { usuario, dados } = await renderizarApp('/professor/disciplinas/d-alg/conteudo', 'u-marcos');
    await screen.findByLabelText('Título do tópico 1');
    const antes = JSON.stringify(dados());
    await usuario.click(screen.getByRole('button', { name: 'Mover Variáveis para baixo' }));
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/estudo já foi iniciado/);
    expect(screen.queryByText('Alterações salvas.')).toBeNull();
    expect(JSON.stringify(dados())).toBe(antes);
    await usuario.click(screen.getByRole('button', { name: 'Descartar alterações' }));
    await usuario.click(screen.getByRole('button', { name: 'Adicionar tópico' }));
    await usuario.type(screen.getByLabelText('Título do tópico 4'), 'Extra');
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/estudo já foi iniciado|não pertence/);
    expect(dados().disciplinas.find((d) => d.id === 'd-alg')).toMatchObject({ status: 'publicado' });
    expect(JSON.stringify(dados())).toBe(antes);
  });

  it('remover a única questão de uma dificuldade é rejeitado com tópico e nível; nada é salvo', async () => {
    const { usuario, dados } = await renderizarApp('/professor/disciplinas/d-geo/conteudo', 'u-julia', (d) => {
      d.disciplinas.find((x) => x.id === 'd-geo')!.status = 'publicado';
      for (const t of ['t-ang', 't-tri']) for (const dif of ['facil', 'medio', 'dificil'] as const) {
        if (!d.questoes.some((q) => q.disciplinaId === 'd-geo' && q.topicoId === t && q.dificuldade === dif)) {
          d.questoes.push({ id: `qg-${t}-${dif}`, disciplinaId: 'd-geo', topicoId: t, dificuldade: dif, enunciado: `G ${t} ${dif}`, alternativas: ['a', 'b'], correta: 0, explicacao: 'x', revisao: 0 });
        }
      }
    });
    await screen.findByLabelText('Título do tópico 1');
    const antes = JSON.stringify(dados());
    await usuario.click(screen.getByRole('button', { name: 'Remover questão qg-t-tri-dificil' }));
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByText(/precisa de uma questão Difícil/)).toBeInTheDocument();
    expect(JSON.stringify(dados())).toBe(antes);
  });
});

describe('7.13 — [GC] Correção textual de questões respondidas, Proteção de questões com respostas', () => {
  async function abrirEditandoEnunciado(sufixo = ' (corrigido)') {
    const r = await renderizarApp('/professor/disciplinas/d-alg/conteudo', 'u-marcos');
    await screen.findByLabelText('Título do tópico 1');
    const id = respondida(r.dados);
    const campo = within(grupoQuestao(id)).getByLabelText('Enunciado') as HTMLTextAreaElement;
    const original = campo.value;
    await r.usuario.type(campo, sufixo);
    return { ...r, id, original, sufixo };
  }

  it('apresenta a diferença exata e salva somente após a confirmação textual do próprio autor', async () => {
    const { usuario, dados, id, original, sufixo } = await abrirEditandoEnunciado();
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    const painel = await screen.findByRole('group', { name: 'Confirmação da correção textual' });
    expect(painel).toHaveTextContent(original); expect(painel).toHaveTextContent(`${original}${sufixo}`);
    expect(painel).toHaveTextContent('Nenhuma segunda pessoa é necessária');
    expect(dados().revisoesTextuais).toHaveLength(0);
    await usuario.click(screen.getByRole('checkbox', { name: /Confirmo/ }));
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByText('Alterações salvas.')).toBeInTheDocument();
    expect(dados().questoes.find((q) => q.id === id)).toMatchObject({ enunciado: `${original}${sufixo}`, revisao: 1 });
    expect(dados().revisoesTextuais).toEqual([expect.objectContaining({ autorId: 'u-marcos', recursoId: id, confirmada: true })]);
    expect(dados().respostas.find((r) => r.questaoId === id)!.conteudoOriginal.enunciado).toBe(original);
    expect(screen.queryByRole('button', { name: /alternativa.*(mover|reordenar)|(mover|reordenar).*alternativa/i })).toBeNull();
  });

  it('sem confirmação a correção é rejeitada e nada é salvo', async () => {
    const { usuario, dados } = await abrirEditandoEnunciado();
    const antes = JSON.stringify(dados());
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('group', { name: 'Confirmação da correção textual' });
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' })); // sem marcar a confirmação
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Alterações salvas.')).toBeNull();
    expect(JSON.stringify(dados())).toBe(antes);
  });

  it('mudar o texto depois de confirmar invalida a confirmação e exige apresentar a nova diferença', async () => {
    const { usuario, dados, id } = await abrirEditandoEnunciado();
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('group', { name: 'Confirmação da correção textual' });
    await usuario.click(screen.getByRole('checkbox', { name: /Confirmo/ }));
    await usuario.type(within(grupoQuestao(id)).getByLabelText('Explicação'), ' extra');
    await waitFor(() => expect(screen.queryByRole('group', { name: 'Confirmação da correção textual' })).toBeNull());
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    const painel = await screen.findByRole('group', { name: 'Confirmação da correção textual' });
    expect(painel).toHaveTextContent('explicacao');
    expect(screen.getByRole('checkbox', { name: /Confirmo/ })).not.toBeChecked();
    expect(dados().revisoesTextuais).toHaveLength(0);
  });

  it('revisão original desatualizada: o salvamento é recusado e exige recarregar', async () => {
    const { usuario, outraAba, dados } = await abrirEditandoEnunciado();
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('group', { name: 'Confirmação da correção textual' });
    await usuario.click(screen.getByRole('checkbox', { name: /Confirmo/ }));
    const outra = outraAba('u-renata'); // outra aba grava antes, sem avisar esta
    await outra.avancarDataVirtual((await outra.consultarDataVirtual()).revisao);
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Recarregue/);
    expect(dados().revisoesTextuais).toHaveLength(0);
  });

  it('revogação do vínculo docente: confirmar não substitui a autorização', async () => {
    const { usuario, outraAba, dados } = await abrirEditandoEnunciado();
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('group', { name: 'Confirmação da correção textual' });
    await usuario.click(screen.getByRole('checkbox', { name: /Confirmo/ }));
    const admin = outraAba('u-renata');
    for (const t of ['t-alg-a-262', 't-alg-b-262', 't-alg-a-271']) {
      await admin.definirVinculoProfessor({ turmaId: t }, { professorId: 'u-marcos' }, false, (await admin.consultarDataVirtual()).revisao);
    }
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument(); // o editor deixa de ser exibido
    expect(dados().revisoesTextuais).toHaveLength(0);
  });

  it('mudar o gabarito é rejeitado mesmo com confirmação; não há reordenação de alternativas nem segundo revisor', async () => {
    const r = await renderizarApp('/professor/disciplinas/d-alg/conteudo', 'u-marcos');
    await screen.findByLabelText('Título do tópico 1');
    const id = respondida(r.dados); const antes = JSON.stringify(r.dados());
    const q = r.dados().questoes.find((x) => x.id === id)!;
    const outra = (q.correta + 1) % q.alternativas.length;
    await r.usuario.click(within(grupoQuestao(id)).getByLabelText(`Correta: alternativa ${outra + 1} da questão ${id}`));
    await r.usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/gabarito/);
    expect(screen.queryByRole('group', { name: 'Confirmação da correção textual' })).toBeNull(); // nada a confirmar: não é correção textual
    expect(JSON.stringify(r.dados())).toBe(antes);
    expect(screen.queryByText(/segundo revisor|aprovação de outra pessoa/i)).toBeNull();
  });
});
