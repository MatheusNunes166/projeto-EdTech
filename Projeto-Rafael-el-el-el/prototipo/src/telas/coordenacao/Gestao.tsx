import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useComando, useConsulta } from '../../app/contexto';
import { Confirmacao } from '../../componentes/Confirmacao';
import { ListaRegistros, PainelEdicao, Registro } from '../../componentes/Gestao';
import { SeletorCandidato } from '../../componentes/SeletorCandidato';
import { Consulta, MensagemErro, Vazio } from '../../componentes/comuns';
import type { ContextoTurma } from '../../dados/contratos-consultas-academicas';

type Base = '/coordenacao/gestao' | '/admin/gestao';
type Oferta = ContextoTurma & { professores: { id: string; nome: string }[] };
const nomeOferta = (t: ContextoTurma) => t.disciplina.nome + ' — Turma ' + t.turma.codigo;
const contextoOferta = (t: ContextoTurma) => t.graduacao.nome + ' · ' + t.periodoLetivo.nome;

export function GestaoTurmas({ base }: { base: Base }) {
  const estado = useConsulta((r) => r.consultarEstruturaAdministravel());
  return <>
    <h1>Gestão acadêmica</h1>
    <Consulta estado={estado}>{({ turmas }) => turmas.length ? (
      <ListaRegistros rotulo="Turmas administráveis">{turmas.map((t) => (
        <Registro key={t.turma.id} acoes={
          <Link to={base + '/turmas/' + t.turma.id} aria-label={'Gerir turma ' + t.turma.codigo + ' de ' + t.disciplina.nome + ' (' + t.periodoLetivo.nome + ')'}>Gerir turma</Link>
        }>
          <strong>{nomeOferta(t)}</strong><p className="meta">{contextoOferta(t)}</p>
          <p>Docentes: {t.professores.map((p) => p.nome).join(', ') || 'Nenhum'}</p>
        </Registro>
      ))}</ListaRegistros>
    ) : <Vazio>Nenhuma turma disponível no seu escopo.</Vazio>}</Consulta>
  </>;
}

export function GestaoDaTurma({ base }: { base: Base }) {
  const { turmaId = '' } = useParams();
  const estrutura = useConsulta((r) => r.consultarEstruturaAdministravel({ tipo: 'turma', turmaId }), [turmaId]);
  return <Consulta estado={estrutura}>{({ turmas }, revisao) => {
    const turma = turmas.find((t) => t.turma.id === turmaId);
    return turma ? <EdicaoDaTurma key={turmaId} base={base} oferta={turma} revisao={revisao} /> : <Vazio>Turma não encontrada.</Vazio>;
  }}</Consulta>;
}

function EdicaoDaTurma({ base, oferta, revisao }: { base: Base; oferta: Oferta; revisao: number }) {
  const alvo = { turmaId: oferta.turma.id, disciplinaId: oferta.disciplina.id, graduacaoId: oferta.graduacao.id };
  const matriculas = useConsulta((repo) => repo.consultarMatriculados(alvo), [alvo]);
  const [edicao, setEdicao] = useState<'matricula' | 'docencia' | null>(null);
  const [pessoa, setPessoa] = useState('');
  const [nomePessoa, setNomePessoa] = useState('');
  const [remocao, setRemocao] = useState<{ pessoa: Oferta['professores'][number]; revisao: number } | null>(null);
  const [aviso, setAviso] = useState('');
  const { rodar, erro, limpar, ocupado } = useComando();
  const abrir = (tipo: typeof edicao) => { limpar(); setEdicao(tipo); setPessoa(''); setNomePessoa(''); if (tipo) setAviso(''); };
  const matricular = edicao === 'matricula';
  return <>
    <p><Link to={base}>Voltar às turmas</Link></p>
    <h1>{nomeOferta(oferta)}</h1>
    <p className="meta">{contextoOferta(oferta)}</p>
    {aviso && <p role="status">{aviso}</p>}
    <div className="gestao-com-edicao">
      <div className="lista-gestao cadastros-listas">
        <section aria-label="Matrículas">
          <h2>Matrículas</h2>
          <Consulta estado={matriculas}>{(lista) => lista.length
            ? <ListaRegistros rotulo="Alunos matriculados">{lista.map((m) => <Registro key={m.matriculaId}>{m.aluno.nome}</Registro>)}</ListaRegistros>
            : <Vazio>Nenhum aluno matriculado</Vazio>}</Consulta>
          <p><button onClick={() => abrir('matricula')}>Nova matrícula</button></p>
        </section>
        <section aria-label="Professores da turma">
          <h2>Professores</h2>
          {oferta.professores.length ? <ListaRegistros rotulo="Docentes da oferta">{oferta.professores.map((p) => (
            <Registro key={p.id} acoes={<button type="button" className="secundario" aria-label={'Remover ' + p.nome}
              onClick={() => { limpar(); setAviso(''); setRemocao({ pessoa: p, revisao }); }}>Remover</button>}>{p.nome}</Registro>
          ))}</ListaRegistros> : <Vazio>Nenhum professor atribuído.</Vazio>}
          <p><button onClick={() => abrir('docencia')}>Nova atribuição docente</button></p>
        </section>
      </div>
      {edicao && <PainelEdicao key={edicao} titulo={matricular ? 'Matricular aluno' : 'Atribuir professor'}>
        <form className="formulario" onSubmit={async (evento) => {
          evento.preventDefault();
          if (!pessoa || ocupado) return;
          if (matricular) {
            const r = await rodar((repo) => repo.matricular(alvo, { alunoId: pessoa }, revisao));
            if (!r.ok) return;
            setAviso((r.valor.jaExistia ? 'O aluno já estava matriculado e seu estudo foi preservado. ' : 'Matrícula realizada. ') + nomePessoa + ' · ' + nomeOferta(oferta) + ' · ' + oferta.periodoLetivo.nome + '.');
          } else {
            const r = await rodar((repo) => repo.definirVinculoProfessor(alvo, { professorId: pessoa }, true, revisao));
            if (!r.ok) return;
            setAviso(nomePessoa + ' atribuído a ' + nomeOferta(oferta) + ' · ' + oferta.periodoLetivo.nome + '.');
          }
          abrir(null);
        }}>
          <SeletorCandidato pedido={{ finalidade: edicao, turma: alvo }}
            rotulo={matricular ? 'Aluno a matricular' : 'Professor a atribuir'} valor={pessoa} mudar={(id, nome) => { setPessoa(id); setNomePessoa(nome); }} />
          <MensagemErro erro={erro} />
          <div className="acoes">
            <button type="submit" disabled={!pessoa || ocupado}>{matricular ? 'Matricular' : 'Atribuir professor'}</button>
            <button type="button" className="secundario" onClick={() => abrir(null)}>Cancelar</button>
          </div>
        </form>
      </PainelEdicao>}
    </div>
    {remocao && <Confirmacao titulo={'Remover ' + remocao.pessoa.nome + ' de ' + nomeOferta(oferta) + '?'}
      acao="Confirmar remoção" ocupado={ocupado} aoCancelar={() => { limpar(); setRemocao(null); }}
      aoConfirmar={async () => {
        if (ocupado) return;
        const r = await rodar((repo) => repo.definirVinculoProfessor(alvo, { professorId: remocao.pessoa.id }, false, remocao.revisao));
        if (r.ok) { setAviso(remocao.pessoa.nome + ' removido de ' + nomeOferta(oferta) + '.'); setRemocao(null); }
      }}>
      <p>{contextoOferta(oferta)}. O vínculo docente com esta turma será removido. As matrículas e o histórico dos alunos serão preservados.</p>
      <MensagemErro erro={erro} />
    </Confirmacao>}
  </>;
}
