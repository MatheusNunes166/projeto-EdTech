import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderizarApp } from './renderizar';

const linha = (nome: string) => screen.getByRole('row', { name: new RegExp(nome) });

describe('7.4 — [PA] Administração de usuários, Limites globais, Vínculos Responsável–Aluno; [OA] Vínculos de coordenadores', () => {
  it('cria pessoa com duas funções, edita e desativa', async () => {
    const { usuario, dados } = await renderizarApp('/admin/usuarios', 'u-renata');
    await screen.findByRole('row', { name: /Ana Souza/ });
    await usuario.type(screen.getByLabelText('Nome'), 'Nina Torres');
    await usuario.type(screen.getByLabelText('E-mail'), 'nina@exemplo.com');
    await usuario.click(screen.getByRole('checkbox', { name: 'Professor' }));
    await usuario.click(screen.getByRole('checkbox', { name: 'Coordenador' }));
    await usuario.click(screen.getByRole('button', { name: 'Salvar pessoa' }));
    expect(await screen.findByRole('row', { name: /Nina Torres.*Professor, Coordenador.*Ativa/ })).toBeInTheDocument();
    expect(dados().usuarios.find((u) => u.nome === 'Nina Torres')!.funcoes).toEqual(['professor', 'coordenador']);

    await usuario.click(screen.getByRole('button', { name: 'Editar Nina Torres' }));
    await usuario.clear(screen.getByLabelText('Nome')); await usuario.type(screen.getByLabelText('Nome'), 'Nina T. Torres');
    await usuario.click(screen.getByRole('button', { name: 'Salvar pessoa' }));
    expect(await screen.findByRole('row', { name: /Nina T\. Torres/ })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Desativar Diego Martins' }));
    await waitFor(() => expect(linha('Diego Martins')).toHaveTextContent('Inativa'));
    expect(dados().matriculas.some((m) => m.alunoId === 'u-diego')).toBe(true); // vínculos e histórico preservados
  });

  it('rejeita pessoa ativa sem função e mostra o erro sem sucesso', async () => {
    const { usuario, dados } = await renderizarApp('/admin/usuarios', 'u-renata');
    await screen.findByRole('row', { name: /Ana Souza/ });
    const antes = dados().usuarios.length;
    await usuario.type(screen.getByLabelText('Nome'), 'Sem Função'); await usuario.type(screen.getByLabelText('E-mail'), 'sf@exemplo.com');
    await usuario.click(screen.getByRole('button', { name: 'Salvar pessoa' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(dados().usuarios).toHaveLength(antes);
  });

  it('atribui e remove coordenação; exige a função Coordenador', async () => {
    const { usuario, dados } = await renderizarApp('/admin/vinculos', 'u-renata');
    await screen.findByText(/Carla Dias coordena Sistemas de Informação/);
    await usuario.selectOptions(screen.getByLabelText('Pessoa coordenadora'), 'Ana Souza');
    await usuario.selectOptions(screen.getByLabelText('Graduação'), 'Sistemas de Informação');
    await usuario.click(screen.getByRole('button', { name: 'Atribuir coordenação' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/função coordenador/);
    await usuario.selectOptions(screen.getByLabelText('Pessoa coordenadora'), 'Lúcia Ferraz');
    await usuario.click(screen.getByRole('button', { name: 'Atribuir coordenação' }));
    expect(await screen.findByText(/Lúcia Ferraz coordena Sistemas de Informação/)).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Remover coordenação de Lúcia Ferraz em Sistemas de Informação' }));
    await waitFor(() => expect(screen.queryByText(/Lúcia Ferraz coordena Sistemas de Informação/)).toBeNull());
    expect(dados().vinculosCoordenador).toContainEqual({ coordenadorId: 'u-lucia', graduacaoId: 'g-lm' });
  });

  it('vincula Responsável a Aluno e exige função Aluno no destino', async () => {
    const { usuario } = await renderizarApp('/admin/vinculos', 'u-renata');
    await screen.findByText(/Helena Souza acompanha Ana Souza/);
    await usuario.selectOptions(screen.getByLabelText('Responsável'), 'Helena Souza');
    await usuario.selectOptions(screen.getByLabelText('Aluno'), 'Bruno Lima');
    await usuario.click(screen.getByRole('button', { name: 'Vincular responsável' }));
    expect(await screen.findByText(/Helena Souza acompanha Bruno Lima/)).toBeInTheDocument();
    await usuario.selectOptions(screen.getByLabelText('Aluno'), 'Marcos Silva');
    await usuario.click(screen.getByRole('button', { name: 'Vincular responsável' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/função Aluno/);
  });

  it.each(['u-carla', 'u-marcos', 'u-ana', 'u-helena', 'u-lucia'])('%s não acessa por endereço direto as telas globais', async (pessoa) => {
    for (const rota of ['/admin', '/admin/usuarios', '/admin/vinculos']) {
      const { rotaAtual, unmount } = await renderizarApp(rota, pessoa);
      await waitFor(() => expect(rotaAtual()).not.toMatch(/^\/admin/));
      expect(screen.queryByRole('heading', { name: 'Pessoas e funções' })).toBeNull();
      unmount();
    }
  });
});

describe('7.5 — [OA] Cadastro de graduações, Disciplinas de uma graduação, Identidade das ofertas e histórico', () => {
  it('cria graduação e valida campos obrigatórios e código duplicado, por campo', async () => {
    const { usuario, dados } = await renderizarApp('/admin/graduacoes', 'u-renata');
    await screen.findByRole('form', { name: 'Nova graduação' });
    const form = () => screen.getByRole('form', { name: 'Nova graduação' });
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar graduação' }));
    expect(await within(form()).findByText('Informe o código da graduação.')).toBeInTheDocument();
    expect(within(form()).getByText('Informe o nome da graduação.')).toBeInTheDocument();
    await usuario.type(within(form()).getByLabelText('Código da graduação'), 'SI'); await usuario.type(within(form()).getByLabelText('Nome da graduação'), 'Outra');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar graduação' }));
    expect(await within(form()).findByText('O código já pertence a outra graduação.')).toBeInTheDocument();
    await usuario.clear(within(form()).getByLabelText('Código da graduação')); await usuario.type(within(form()).getByLabelText('Código da graduação'), 'ADM');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar graduação' }));
    expect(await screen.findByText(/ADM — Outra/)).toBeInTheDocument();
    expect(dados().graduacoes).toHaveLength(3);
  });

  it('disciplina: campos obrigatórios, graduação existente, código único só dentro da graduação e sem tópicos pelo cadastro', async () => {
    const { usuario, dados } = await renderizarApp('/admin/graduacoes', 'u-renata');
    await screen.findByRole('form', { name: 'Nova disciplina' });
    const form = () => screen.getByRole('form', { name: 'Nova disciplina' });
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar disciplina' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument(); // graduação inexistente: nada salvo
    expect(dados().disciplinas).toHaveLength(4);
    await usuario.selectOptions(within(form()).getByLabelText('Graduação da disciplina'), 'Sistemas de Informação');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar disciplina' }));
    expect(await within(form()).findByText('Informe o código da disciplina.')).toBeInTheDocument();
    await usuario.type(within(form()).getByLabelText('Código da disciplina'), 'ALG'); await usuario.type(within(form()).getByLabelText('Nome da disciplina'), 'Algoritmos II');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar disciplina' }));
    expect(await within(form()).findByText('O código já pertence a outra disciplina desta graduação.')).toBeInTheDocument();
    await usuario.selectOptions(within(form()).getByLabelText('Graduação da disciplina'), 'Licenciatura em Matemática'); // mesmo código em outra graduação é válido
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar disciplina' }));
    expect(await screen.findByText(/ALG — Algoritmos II/)).toBeInTheDocument();
    const nova = dados().disciplinas.find((d) => d.nome === 'Algoritmos II')!;
    expect(nova).toMatchObject({ status: 'rascunho', topicos: [] });
  });

  it('bloqueia trocar a graduação de disciplina com matrículas; editar nome não toca no conteúdo', async () => {
    const { usuario, dados } = await renderizarApp('/admin/graduacoes', 'u-renata');
    await usuario.click(await screen.findByRole('button', { name: 'Editar disciplina Algoritmos' }));
    const form = () => screen.getByRole('form', { name: 'Editar disciplina' });
    await usuario.selectOptions(within(form()).getByLabelText('Graduação da disciplina'), 'Licenciatura em Matemática');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar disciplina' }));
    expect(await within(form()).findByText(/Há matrícula ou resposta/)).toBeInTheDocument();
    expect(dados().disciplinas.find((d) => d.id === 'd-alg')!.graduacaoId).toBe('g-si');
    await usuario.selectOptions(within(form()).getByLabelText('Graduação da disciplina'), 'Sistemas de Informação');
    await usuario.clear(within(form()).getByLabelText('Nome da disciplina')); await usuario.type(within(form()).getByLabelText('Nome da disciplina'), 'Algoritmos e Lógica');
    const topicosAntes = JSON.stringify(dados().disciplinas.find((d) => d.id === 'd-alg')!.topicos);
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar disciplina' }));
    expect(await screen.findByText(/ALG — Algoritmos e Lógica/)).toBeInTheDocument();
    expect(JSON.stringify(dados().disciplinas.find((d) => d.id === 'd-alg')!.topicos)).toBe(topicosAntes);
  });
});

describe('7.6 — [OA] Períodos letivos, Ofertas de disciplinas em turmas, Identidade das ofertas e histórico', () => {
  it('período: datas obrigatórias, intervalo inválido e criação', async () => {
    const { usuario, dados } = await renderizarApp('/admin/periodos', 'u-renata');
    await screen.findByRole('form', { name: 'Novo período' });
    const form = () => screen.getByRole('form', { name: 'Novo período' });
    await usuario.type(within(form()).getByLabelText('Nome do período'), '2027.2');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar período' }));
    expect(await within(form()).findByText('Informe uma data de início válida.')).toBeInTheDocument();
    expect(within(form()).getByText('Informe uma data de fim válida.')).toBeInTheDocument();
    await usuario.type(within(form()).getByLabelText('Data de início'), '2027-08-02'); await usuario.type(within(form()).getByLabelText('Data de fim'), '2027-07-01');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar período' }));
    expect(await within(form()).findByText('A data de fim não pode ser anterior ao início.')).toBeInTheDocument();
    await usuario.clear(within(form()).getByLabelText('Data de fim')); await usuario.type(within(form()).getByLabelText('Data de fim'), '2027-12-10');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar período' }));
    expect(await screen.findByText(/2027\.2 \(2027-08-02 a 2027-12-10\)/)).toBeInTheDocument();
    expect(dados().periodosLetivos).toHaveLength(3);
  });

  it('turma: código obrigatório, referências existentes e oferta duplicada', async () => {
    const { usuario, dados } = await renderizarApp('/admin/periodos', 'u-renata');
    await screen.findByRole('form', { name: 'Nova turma' });
    const form = () => screen.getByRole('form', { name: 'Nova turma' });
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar turma' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument(); // disciplina inexistente
    await usuario.selectOptions(within(form()).getByLabelText('Disciplina da turma'), 'Algoritmos');
    await usuario.selectOptions(within(form()).getByLabelText('Período da turma'), '2026.2');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar turma' }));
    expect(await within(form()).findByText('Informe o código da turma.')).toBeInTheDocument();
    await usuario.type(within(form()).getByLabelText('Código da turma'), 'A');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar turma' }));
    expect(await within(form()).findByText('O código já pertence a outra turma da disciplina neste período.')).toBeInTheDocument();
    await usuario.clear(within(form()).getByLabelText('Código da turma')); await usuario.type(within(form()).getByLabelText('Código da turma'), 'C');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar turma' }));
    expect(await screen.findByText(/Algoritmos — Turma C — 2026\.2/)).toBeInTheDocument();
    expect(dados().turmas).toHaveLength(8);
  });

  it('bloqueia trocar disciplina ou período de turma com matrícula, preservando a identidade da oferta', async () => {
    const { usuario, dados } = await renderizarApp('/admin/periodos', 'u-renata');
    await usuario.click(await screen.findByRole('button', { name: 'Editar turma A de Algoritmos (2026.2)' }));
    const form = () => screen.getByRole('form', { name: 'Editar turma' });
    await usuario.selectOptions(within(form()).getByLabelText('Período da turma'), '2027.1');
    await usuario.click(within(form()).getByRole('button', { name: 'Salvar turma' }));
    expect(await within(form()).findAllByText(/Há matrícula ou resposta/)).not.toHaveLength(0);
    expect(dados().turmas.find((t) => t.id === 't-alg-a-262')!.periodoLetivoId).toBe('p-2026-2');
  });

  it('o Coordenador cadastra turmas do seu curso, mas não vê o formulário de período global', async () => {
    await renderizarApp('/coordenacao/cadastros', 'u-lucia');
    expect(await screen.findByRole('form', { name: 'Nova turma' })).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Novo período' })).toBeNull();
    expect(screen.queryByRole('form', { name: 'Nova graduação' })).toBeNull();
  });
});

describe('7.16 — [AC] Visão geral do administrador', () => {
  it('mostra pessoas distintas, funções cumulativas, graduações, disciplinas por publicação, períodos, turmas e matrículas', async () => {
    await renderizarApp('/admin', 'u-renata');
    const pessoas = await screen.findByRole('region', { name: 'Pessoas' });
    expect(pessoas).toHaveTextContent('12 pessoas distintas');
    for (const [funcao, n] of [['Aluno', 4], ['Professor', 4], ['Coordenador', 2], ['Administrador', 1], ['Responsável', 2]] as const) {
      expect(within(pessoas).getByText(`${funcao}: ${n}`)).toBeInTheDocument();
    }
    const estrutura = screen.getByRole('region', { name: 'Estrutura acadêmica' });
    for (const texto of ['Graduações: 2', 'Disciplinas publicadas: 3', 'Disciplinas em rascunho: 1', 'Períodos letivos: 2', 'Turmas: 7', 'Matrículas: 7']) {
      expect(within(estrutura).getByText(texto)).toBeInTheDocument();
    }
  });

  it('Carla com duas funções soma uma pessoa e uma em cada função; graduações não entram nas contagens de publicação', async () => {
    await renderizarApp('/admin', 'u-renata', (d) => {
      d.usuarios = d.usuarios.filter((u) => ['u-ana', 'u-carla', 'u-renata'].includes(u.id));
      d.vinculosProfessor = d.vinculosProfessor.filter((v) => v.professorId === 'u-carla'); d.vinculosResponsavel = [];
      d.matriculas = d.matriculas.filter((m) => m.alunoId === 'u-ana'); d.respostas = d.respostas.filter((r) => d.matriculas.some((m) => m.id === r.matriculaId));
      d.vinculosCoordenador = d.vinculosCoordenador.filter((v) => v.coordenadorId === 'u-carla');
    });
    const pessoas = await screen.findByRole('region', { name: 'Pessoas' });
    expect(pessoas).toHaveTextContent('3 pessoas distintas');
    expect(within(pessoas).getByText('Professor: 1')).toBeInTheDocument(); expect(within(pessoas).getByText('Coordenador: 1')).toBeInTheDocument();
    expect(screen.getByText('Disciplinas publicadas: 3')).toBeInTheDocument(); // 2 graduações não somam
  });

  it('só o Administrador vê a visão geral', async () => {
    const { rotaAtual } = await renderizarApp('/admin', 'u-carla');
    await waitFor(() => expect(rotaAtual()).toBe('/professor'));
  });
});
