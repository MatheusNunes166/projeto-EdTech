import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProvedorApp } from '../app/contexto';
import { Rotas } from '../app/Rotas';
import { CHAVES_ARMAZENAMENTO as K } from '../dados/armazenamento-academico';
import { criarSeedAcademico } from '../dados/seed-academico';
import { criarArmazenamentoEspiao } from './armazenamento-espiao';
import { escolherFuncaoEntrada, renderizarApp } from './renderizar';
import { RepositorioApp } from '../dados/repositorio-app';

describe('7.1 — [PA] Entrada simulada; Acesso restrito por função e vínculo; [OA] Revogação (sessão, funções e consultas autorizadas)', () => {
  it('entra sem senha por pessoa de demonstração, troca de pessoa e a área anterior não permanece', async () => {
    const { usuario, rotaAtual } = await renderizarApp('/');
    await escolherFuncaoEntrada(usuario);
    await usuario.click(await screen.findByRole('button', { name: 'Entrar como Ana Souza' }));
    expect(await screen.findByRole('heading', { name: 'Minhas turmas' })).toBeInTheDocument();
    expect(rotaAtual()).toBe('/aluno');
    await usuario.click(screen.getByRole('button', { name: 'Sair' }));
    expect(await screen.findByRole('heading', { name: 'Trilha Adaptativa' })).toBeInTheDocument();
    expect(screen.queryByText('Algoritmos')).toBeNull();
    await escolherFuncaoEntrada(usuario, 'Professor');
    await usuario.click(screen.getByRole('button', { name: 'Entrar como Marcos Silva' }));
    expect(await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' })).toBeInTheDocument();
    expect(rotaAtual()).toBe('/professor');
    expect(screen.queryByText('Inglês Inicial')).toBeNull(); // nada da pessoa anterior
  });

  it('a entrada lista só pessoas ativas, sem e-mail ou vínculos', async () => {
    const { container, usuario } = await renderizarApp('/');
    expect(await screen.findByRole('button', { name: 'Aluno' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Entrar como/ })).toBeNull();
    await escolherFuncaoEntrada(usuario);
    await screen.findByRole('button', { name: 'Entrar como Ana Souza' });
    expect(screen.queryByRole('button', { name: /Paulo Antunes/ })).toBeNull(); // inativo
    expect(container.textContent).not.toContain('@exemplo.com');
  });

  it('invalida a consulta ao receber evento de outra aba: nenhum dado anterior é exibido enquanto recarrega', async () => {
    const { avisarOutraAba } = await renderizarApp('/aluno', 'u-ana');
    expect(await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' })).toBeInTheDocument();
    avisarOutraAba();
    expect(screen.queryByRole('article')).toBeNull(); // retrato anterior removido imediatamente
    expect(await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' })).toBeInTheDocument();
  });

  it('pessoa desativada durante a sessão perde o acesso e volta à entrada, sem dados da sessão anterior', async () => {
    const { outraAba, avisarOutraAba, rotaAtual, usuario } = await renderizarApp('/aluno', 'u-ana');
    await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' });
    const admin = outraAba('u-renata');
    await admin.definirAtivo('u-ana', false, (await admin.consultarPessoas()).revisao);
    avisarOutraAba();
    await escolherFuncaoEntrada(usuario);
    expect(await screen.findByRole('button', { name: 'Entrar como Bruno Lima' })).toBeInTheDocument();
    expect(rotaAtual()).toBe('/');
    expect(screen.queryByRole('article')).toBeNull();
  });

  it('remoção de função: sem a função da área, a pessoa é levada à sua outra área; sem funções, à entrada', async () => {
    const { outraAba, avisarOutraAba, rotaAtual } = await renderizarApp('/coordenacao', 'u-carla');
    expect(await screen.findByRole('heading', { name: 'Painel da coordenação' })).toBeInTheDocument();
    const admin = outraAba('u-renata');
    const { dados, revisao } = await admin.consultarPessoas();
    const carla = dados.pessoas.find((p) => p.id === 'u-carla')!;
    await admin.editarUsuario('u-carla', { nome: carla.nome, email: carla.email, ativo: true, funcoes: ['professor'] }, revisao);
    avisarOutraAba();
    expect(await screen.findByRole('heading', { name: 'Minhas turmas' })).toBeInTheDocument();
    expect(rotaAtual()).toBe('/professor');
    expect(screen.queryByRole('heading', { name: 'Painel da coordenação' })).toBeNull();
  });

  it('remoção de vínculo: a tela aberta passa a mostrar acesso negado, sem o painel anterior', async () => {
    const { outraAba, avisarOutraAba } = await renderizarApp('/professor/disciplinas/d-alg/turmas/t-alg-b-262', 'u-marcos');
    expect(await screen.findByRole('heading', { name: /Algoritmos — Turma B/ })).toBeInTheDocument();
    const admin = outraAba('u-renata');
    await admin.definirVinculoProfessor({ turmaId: 't-alg-b-262' }, { professorId: 'u-marcos' }, false, (await admin.consultarPessoas()).revisao);
    avisarOutraAba();
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(screen.queryByText(/Bruno Lima/)).toBeNull();
  });
});

describe('Frontend 2 — entrada por função antes de pessoa', () => {
  it('omite função sem candidatos e permite voltar sem iniciar sessão ou conservar candidatos anteriores', async () => {
    const a = await renderizarApp('/', undefined, (d) => { d.usuarios.filter((u) => u.funcoes.includes('responsavel')).forEach((u) => { u.ativo = false; }); });
    await escolherFuncaoEntrada(a.usuario, 'Professor');
    expect(screen.queryByRole('button', { name: /Entrar como Ana/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Paulo Antunes/ })).toBeNull();
    expect(localStorage.getItem(K.sessaoAcademica)).toBeNull();
    await a.usuario.click(screen.getByRole('button', { name: 'Voltar às funções' }));
    expect(screen.queryByRole('button', { name: 'Responsável' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Entrar como/ })).toBeNull();
    await escolherFuncaoEntrada(a.usuario);
    expect(await screen.findByRole('button', { name: 'Entrar como Ana Souza' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcos/ })).toBeNull();
  });

  it('Carla entra diretamente na Coordenação e muda para Professor na mesma identidade', async () => {
    const a = await renderizarApp('/');
    await escolherFuncaoEntrada(a.usuario, 'Coordenador');
    await a.usuario.click(screen.getByRole('button', { name: 'Entrar como Carla Dias' }));
    expect(await screen.findByRole('heading', { name: 'Painel da coordenação' })).toBeInTheDocument();
    expect(a.rotaAtual()).toBe('/coordenacao');
    await a.usuario.click(within(screen.getByRole('navigation', { name: 'Áreas da pessoa' })).getByRole('link', { name: 'Área do Professor' }));
    expect(await screen.findByRole('article', { name: 'Matemática Básica turma A 2026.2' })).toBeInTheDocument();
    expect(localStorage.getItem(K.sessaoAcademica)).toBe('u-carla');
  });

  it.each(['funcao', 'atividade'])('seleção fica desatualizada por %s: não entra na área e atualiza candidatos', async (mudanca) => {
    const a = await renderizarApp('/');
    await escolherFuncaoEntrada(a.usuario, 'Coordenador');
    const admin = a.outraAba('u-renata');
    if (mudanca === 'atividade') await admin.definirAtivo('u-carla', false, a.dados().revisao);
    else {
      const carla = a.dados().usuarios.find((u) => u.id === 'u-carla')!;
      await admin.editarUsuario(carla.id, { nome: carla.nome, email: carla.email, ativo: true, funcoes: ['professor'] }, a.dados().revisao);
    }
    await a.usuario.click(screen.getByRole('button', { name: 'Entrar como Carla Dias' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/indisponível/);
    expect(a.rotaAtual()).toBe('/');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Entrar como Carla Dias' })).toBeNull());
    expect(screen.queryByRole('heading', { name: 'Painel da coordenação' })).toBeNull();
    expect(localStorage.getItem(K.sessaoAcademica)).toBeNull();
  });

  it('falha na listagem tem erro explícito e permite tentar novamente', async () => {
    const sonda = vi.spyOn(RepositorioApp.prototype, 'listarPessoasEntrada').mockRejectedValueOnce(new Error('Falha de leitura'));
    try {
      const a = await renderizarApp('/');
      expect(await screen.findByRole('alert')).toHaveTextContent(/carregar as opções/);
      await a.usuario.click(screen.getByRole('button', { name: 'Tentar novamente' }));
      expect(await screen.findByRole('button', { name: 'Aluno' })).toBeInTheDocument();
    } finally { sonda.mockRestore(); }
  });

  it('lista selecionada fica vazia após atualização que desativa todos os candidatos', async () => {
    const a = await renderizarApp('/', undefined, (d) => {
      d.usuarios.filter((u) => u.funcoes.includes('responsavel') && u.id !== 'u-helena').forEach((u) => { u.ativo = false; });
    });
    await escolherFuncaoEntrada(a.usuario, 'Responsável');
    const admin = a.outraAba('u-renata');
    await admin.definirAtivo('u-helena', false, a.dados().revisao);
    a.avisarOutraAba();
    expect(await screen.findByText('Nenhuma pessoa ativa disponível para esta função.')).toBeInTheDocument();
    await a.usuario.click(screen.getByRole('button', { name: 'Voltar às funções' }));
    expect(screen.queryByRole('button', { name: 'Responsável' })).toBeNull();
  });
});

describe('7.2 — [PA] Funções de usuário suportadas, Permissões cumulativas sem ampliação de vínculos; [CC] Acesso às turmas sem automatrícula', () => {
  it('acesso direto indevido a outra área volta para a área própria sem exibir dados da área negada', async () => {
    const { rotaAtual } = await renderizarApp('/professor', 'u-ana');
    expect(await screen.findByRole('heading', { name: 'Minhas turmas' })).toBeInTheDocument();
    expect(rotaAtual()).toBe('/aluno');
    expect(screen.queryByRole('link', { name: 'Painel da turma' })).toBeNull();
  });

  it('sem sessão qualquer área volta à entrada', async () => {
    const { rotaAtual } = await renderizarApp('/admin/usuarios');
    expect(await screen.findByRole('heading', { name: 'Trilha Adaptativa' })).toBeInTheDocument();
    expect(rotaAtual()).toBe('/');
  });

  it('IDs aninhados incompatíveis ou fora do vínculo resultam em acesso negado', async () => {
    await renderizarApp('/aluno/disciplinas/d-alg/turmas/t-ing-a-262', 'u-ana');
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
  });

  it('professor: turma de outra disciplina ou sem vínculo é negada', async () => {
    const a = await renderizarApp('/professor/disciplinas/d-ing/turmas/t-alg-a-262', 'u-marcos');
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    a.unmount();
    await renderizarApp('/professor/disciplinas/d-alg/turmas/t-alg-a-262', 'u-julia');
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
  });

  it('duas áreas da mesma pessoa mantêm escopos distintos (Carla: docência em Matemática, coordenação de SI)', async () => {
    const { usuario } = await renderizarApp('/professor', 'u-carla');
    expect(await screen.findByRole('article', { name: 'Matemática Básica turma A 2026.2' })).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: /Algoritmos/ })).toBeNull();
    const areas = screen.getByRole('navigation', { name: 'Áreas da pessoa' });
    expect(within(areas).getAllByRole('link').map((l) => l.textContent)).toEqual(['Área do Professor', 'Área da Coordenação']);
    await usuario.click(within(areas).getByRole('link', { name: 'Área da Coordenação' }));
    expect(await screen.findByRole('heading', { name: 'Painel da coordenação' })).toBeInTheDocument();
    const linhas = await screen.findAllByRole('row');
    expect(linhas.map((l) => l.textContent).join('|')).toContain('Sistemas de Informação');
    expect(linhas.map((l) => l.textContent).join('|')).not.toContain('Licenciatura');
  });

  it('URLs antigas de estudo por curso não escolhem uma turma arbitrária', async () => {
    const { rotaAtual } = await renderizarApp('/aluno/cursos/c-log/trilha', 'u-ana');
    expect(await screen.findByRole('heading', { name: 'Minhas turmas' })).toBeInTheDocument();
    expect(rotaAtual()).toBe('/aluno');
  });
});

describe('7.3 — [OA] Demonstração fictícia e restauração: aviso inicial e controles de restauração', () => {
  const legado = '{"versaoSeed":1,"usuarios":[],"cursos":[]}';
  const montar = (armazenamento: ReturnType<typeof criarArmazenamentoEspiao>) => render(
    <ProvedorApp armazenamento={armazenamento}><MemoryRouter><Rotas /></MemoryRouter></ProvedorApp>,
  );

  it('dados da versão anterior: o aviso aparece antes de qualquer substituição e cancelar não altera nada', async () => {
    const storage = criarArmazenamentoEspiao({ [K.legadoDados]: legado, [K.legadoSessao]: 'u-ana' });
    const usuario = userEvent.setup(); montar(storage);
    expect(await screen.findByRole('alertdialog', { name: /Substituir os dados locais/ })).toHaveTextContent(/não será migrado/);
    expect(storage.chamadas).toEqual([]);
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma alteração foi feita');
    expect(screen.queryByRole('button', { name: /Entrar como/ })).toBeNull();
    expect(storage.chamadas).toEqual([]);
    expect(storage.retrato()).toEqual({ [K.legadoDados]: legado, [K.legadoSessao]: 'u-ana' });
  });

  it('confirmar substitui pela demonstração, encerra a sessão antiga e abre a entrada; legado preservado', async () => {
    const storage = criarArmazenamentoEspiao({ [K.legadoDados]: legado, [K.legadoSessao]: 'u-ana' });
    const usuario = userEvent.setup(); montar(storage);
    await usuario.click(await screen.findByRole('button', { name: 'Substituir pela demonstração nova' }));
    await escolherFuncaoEntrada(usuario);
    expect(await screen.findByRole('button', { name: 'Entrar como Ana Souza' })).toBeInTheDocument();
    expect(storage.retrato()[K.legadoDados]).toBe(legado);
    expect(storage.retrato()[K.legadoSessao]).toBeUndefined();
    expect(JSON.parse(storage.retrato()[K.academico]).versaoSeed).toBe(criarSeedAcademico().versaoSeed);
  });

  it('falha de gravação na substituição mostra erro, não mostra sucesso e não deixa estado parcial', async () => {
    const storage = criarArmazenamentoEspiao({ [K.academico]: '{json inválido', [K.sessaoAcademica]: 'u-ana' }, K.academico);
    const antes = storage.retrato();
    const usuario = userEvent.setup(); montar(storage);
    await usuario.click(await screen.findByRole('button', { name: 'Substituir pela demonstração nova' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Não foi possível substituir/);
    expect(screen.queryByRole('button', { name: /Entrar como/ })).toBeNull();
    expect(storage.retrato()).toEqual(antes);
  });

  it('sem dados anteriores inicializa a demonstração sem aviso', async () => {
    const storage = criarArmazenamentoEspiao(); montar(storage);
    await escolherFuncaoEntrada(userEvent.setup());
    expect(await screen.findByRole('button', { name: 'Entrar como Ana Souza' })).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('cancelar a restauração mantém as alterações e a pessoa atual; o controle de data virtual continua funcionando', async () => {
    const { usuario } = await renderizarApp('/aluno', 'u-ana');
    expect(await screen.findByText('17/11/2026')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Simular próximo dia' }));
    expect(await screen.findByText('18/11/2026')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Restaurar dados de demonstração' }));
    expect(screen.getByRole('alertdialog', { name: 'Restaurar a demonstração?' })).toHaveTextContent(/serão apagados/);
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.getByText('18/11/2026')).toBeInTheDocument();
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
  });

  it('confirmar limpa a sessão, recupera os dados iniciais e volta à entrada', async () => {
    const { usuario, rotaAtual, dados } = await renderizarApp('/aluno', 'u-ana');
    await usuario.click(await screen.findByRole('button', { name: 'Simular próximo dia' }));
    await screen.findByText('18/11/2026');
    await usuario.click(screen.getByRole('button', { name: 'Restaurar dados de demonstração' }));
    await usuario.click(screen.getByRole('button', { name: 'Confirmar restauração' }));
    await escolherFuncaoEntrada(usuario);
    expect(await screen.findByRole('button', { name: 'Entrar como Ana Souza' })).toBeInTheDocument();
    expect(rotaAtual()).toBe('/');
    expect(dados().dataVirtual).toBe('2026-11-17');
    expect(localStorage.getItem(K.sessaoAcademica)).toBeNull();
  });

  it('falha ao restaurar mostra erro, não mostra sucesso e preserva dados e sessão', async () => {
    const storage = criarArmazenamentoEspiao();
    const { usuario, dados } = await renderizarApp('/aluno', 'u-ana', undefined, storage);
    await screen.findByRole('heading', { name: 'Minhas turmas' });
    const antes = dados();
    storage.falharAgoraEm(K.academico);
    await usuario.click(screen.getByRole('button', { name: 'Restaurar dados de demonstração' }));
    await usuario.click(screen.getByRole('button', { name: 'Confirmar restauração' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Não foi possível restaurar/);
    expect(dados()).toEqual(antes);
    expect(storage.retrato()[K.sessaoAcademica]).toBe('u-ana');
    expect(screen.getByRole('heading', { name: 'Minhas turmas' })).toBeInTheDocument();
    void act; void waitFor;
  });
});
