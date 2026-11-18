import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useComando, useConsulta } from '../../app/contexto';
import { Consulta, MensagemErro, Vazio } from '../../componentes/comuns';

/**
 * Gestão acadêmica de turmas (matrículas e professores), compartilhada por Coordenação e Administração.
 * A estrutura vem filtrada pelo vínculo atual: turmas de outros cursos nem são listadas.
 */
export function GestaoTurmas({ base }: { base: '/coordenacao/gestao' | '/admin/gestao' }) {
  const estado = useConsulta((r) => r.consultarEstruturaAdministravel());
  return (
    <>
      <h1>Gestão acadêmica</h1>
      <Consulta estado={estado}>
        {({ turmas }) => turmas.length === 0 ? <Vazio>Nenhuma turma disponível no seu escopo.</Vazio> : (
          <ul className="lista-limpa">
            {turmas.map((t) => (
              <li key={t.turma.id} className="cartao">
                <strong>{t.graduacao.nome} — {t.disciplina.nome}</strong> · Turma {t.turma.codigo} · {t.periodoLetivo.nome}
                <p className="meta">Professor(es): {t.professores.length ? t.professores.map((p) => p.nome).join(', ') : 'nenhum'}</p>
                <Link to={`${base}/turmas/${t.turma.id}`}>Gerir turma {t.turma.codigo} de {t.disciplina.nome} ({t.periodoLetivo.nome})</Link>
              </li>
            ))}
          </ul>
        )}
      </Consulta>
    </>
  );
}

export function GestaoDaTurma({ base }: { base: '/coordenacao/gestao' | '/admin/gestao' }) {
  const { turmaId = '' } = useParams();
  const estrutura = useConsulta((r) => r.consultarEstruturaAdministravel({ tipo: 'turma', turmaId }), [turmaId]);
  return (
    <Consulta estado={estrutura}>
      {({ turmas }, revisao) => {
        const t = turmas.find((x) => x.turma.id === turmaId);
        if (!t) return <Vazio>Turma não encontrada.</Vazio>;
        return (
          <>
            <p><Link to={base}>← Gestão acadêmica</Link></p>
            <h1>{t.disciplina.nome} — Turma {t.turma.codigo}</h1>
            <p className="meta">{t.graduacao.nome} · {t.periodoLetivo.nome}</p>
            <Matriculas turmaId={turmaId} disciplinaId={t.disciplina.id} graduacaoId={t.graduacao.id} revisao={revisao} />
            <Docentes turmaId={turmaId} disciplinaId={t.disciplina.id} graduacaoId={t.graduacao.id} professores={t.professores} revisao={revisao} />
          </>
        );
      }}
    </Consulta>
  );
}

interface Props { turmaId: string; disciplinaId: string; graduacaoId: string; revisao: number }

function Matriculas({ turmaId, disciplinaId, graduacaoId, revisao }: Props) {
  const alvo = { turmaId, disciplinaId, graduacaoId };
  const matriculados = useConsulta((r) => r.consultarMatriculados(alvo), [turmaId]);
  const candidatos = useConsulta((r) => r.consultarCandidatos({ finalidade: 'matricula', turma: alvo }), [turmaId]);
  const [aluno, setAluno] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const { rodar, erro } = useComando();
  const matricular = async () => {
    setAviso(null);
    const r = await rodar((repo) => repo.matricular(alvo, { alunoId: aluno }, revisao));
    if (r.ok) setAviso(r.valor.jaExistia ? 'O aluno já estava matriculado: o estudo existente foi preservado e nada foi reiniciado.' : 'Matrícula realizada.');
  };
  return (
    <section aria-label="Matrículas">
      <h2>Matrículas</h2>
      <Consulta estado={matriculados}>
        {(lista) => lista.length === 0 ? <Vazio>Nenhum aluno matriculado</Vazio> : <ul>{lista.map((m) => <li key={m.matriculaId}>{m.aluno.nome}</li>)}</ul>}
      </Consulta>
      <Consulta estado={candidatos}>
        {(lista) => (
          <div className="formulario">
            <label>Aluno a matricular
              <select value={aluno} onChange={(e) => setAluno(e.target.value)}>
                <option value="">Escolha…</option>{lista.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </label>
            <button disabled={!aluno} onClick={matricular}>Matricular</button>
          </div>
        )}
      </Consulta>
      {aviso && <p role="status">{aviso}</p>}
      <MensagemErro erro={erro} />
    </section>
  );
}

function Docentes({ turmaId, disciplinaId, graduacaoId, professores, revisao }: Props & { professores: { id: string; nome: string }[] }) {
  const alvo = { turmaId, disciplinaId, graduacaoId };
  const candidatos = useConsulta((r) => r.consultarCandidatos({ finalidade: 'docencia', turma: alvo }), [turmaId]);
  const [professor, setProfessor] = useState('');
  const { rodar, erro } = useComando();
  return (
    <section aria-label="Professores da turma">
      <h2>Professores</h2>
      {professores.length === 0 ? <Vazio>Nenhum professor atribuído.</Vazio> : (
        <ul>{professores.map((p) => (
          <li key={p.id}>{p.nome} <button className="secundario" onClick={() => rodar((r) => r.definirVinculoProfessor(alvo, { professorId: p.id }, false, revisao))}>Remover {p.nome}</button></li>
        ))}</ul>
      )}
      <Consulta estado={candidatos}>
        {(lista) => (
          <div className="formulario">
            <label>Professor a atribuir
              <select value={professor} onChange={(e) => setProfessor(e.target.value)}>
                <option value="">Escolha…</option>{lista.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </label>
            <button disabled={!professor} onClick={() => rodar((r) => r.definirVinculoProfessor(alvo, { professorId: professor }, true, revisao))}>Atribuir professor</button>
          </div>
        )}
      </Consulta>
      <MensagemErro erro={erro} />
    </section>
  );
}
