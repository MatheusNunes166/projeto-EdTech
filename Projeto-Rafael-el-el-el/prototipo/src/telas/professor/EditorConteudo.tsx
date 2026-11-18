import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useComando, useConsulta, useUsuario } from '../../app/contexto';
import { Campo, Consulta, MensagemErro } from '../../componentes/comuns';
import type { ConfirmacaoTextual, ConteudoCandidato, QuestaoCandidata } from '../../dados/comandos-conteudo';
import type { ConteudoEditavel } from '../../dados/contratos-consultas-academicas';
import { diferencaTextualQuestao, diferencaTextualTopico, recursoTopico, type DiferencaTextual } from '../../conteudo/regras-disciplina';
import { DIFICULDADES, NOME_DIFICULDADE, type Dificuldade, type Material, type TipoMaterial, type Topico } from '../../dominio/tipos';

export const novoId = (prefixo: string) => `${prefixo}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`}`;

export function EditorConteudo() {
  const { disciplinaId = '' } = useParams();
  const estado = useConsulta((r) => r.consultarConteudoEditavel({ disciplinaId }), [disciplinaId]);
  // Resultado do último comando: sobrevive à recarga (remontagem) do editor após o salvamento ou uma rejeição.
  const [salvo, setSalvo] = useState(false);
  const comando = useComando();
  return (
    <Consulta estado={estado}>
      {(conteudo, revisao) => <Editor key={`${disciplinaId}:${revisao}`} conteudo={conteudo} revisao={revisao} salvo={salvo} aoSalvar={setSalvo} comando={comando} />}
    </Consulta>
  );
}

const alternativasVazias = () => ['', ''];

/**
 * Editor pedagógico da disciplina: as alterações ficam num rascunho local e só são enviadas em "Salvar
 * alterações", como um único candidato completo (tudo ou nada). Descartar volta ao conteúdo gravado.
 */
function Editor({ conteudo, revisao, salvo, aoSalvar, comando }: {
  conteudo: ConteudoEditavel; revisao: number; salvo: boolean; aoSalvar: (v: boolean) => void; comando: ReturnType<typeof useComando>;
}) {
  const original = useMemo<ConteudoCandidato>(() => ({
    topicos: structuredClone(conteudo.disciplina.topicos),
    questoes: conteudo.questoes.map((q) => ({ id: q.id, topicoId: q.topicoId, enunciado: q.enunciado, alternativas: [...q.alternativas], correta: q.correta, explicacao: q.explicacao, dificuldade: q.dificuldade, revisao: q.revisao })),
  }), [conteudo]);
  const [topicos, setTopicos] = useState<Topico[]>(() => structuredClone(original.topicos));
  const [questoes, setQuestoes] = useState<QuestaoCandidata[]>(() => structuredClone(original.questoes));
  const [pendentes, setPendentes] = useState<{ recursoId: string; rotulo: string; diferenca: DiferencaTextual[]; revisaoOriginal: number }[]>([]);
  const [confirmadas, setConfirmadas] = useState<Record<string, boolean>>({});
  const { rodar, erro, ocupado, limpar } = comando;
  const voltar = useUsuario().funcoes.includes('professor') ? '/professor' : '/admin/graduacoes';
  const publicado = conteudo.disciplina.status === 'publicado';

  const editado = JSON.stringify({ topicos, questoes }) !== JSON.stringify(original);
  const mudar = <T,>(set: (fn: (v: T) => T) => void, fn: (v: T) => T) => { aoSalvar(false); setPendentes([]); setConfirmadas({}); limpar(); set(fn); };
  const aoTopicos = (fn: (v: Topico[]) => Topico[]) => mudar(setTopicos, fn);
  const aoQuestoes = (fn: (v: QuestaoCandidata[]) => QuestaoCandidata[]) => mudar(setQuestoes, fn);

  const descartar = () => { setTopicos(structuredClone(original.topicos)); setQuestoes(structuredClone(original.questoes)); setPendentes([]); setConfirmadas({}); aoSalvar(false); limpar(); };

  /** Diferenças que a confirmação do autor precisa cobrir, sempre calculadas pelas mesmas funções do repositório. */
  const diferencas = () => {
    const lista: { recursoId: string; rotulo: string; diferenca: DiferencaTextual[]; revisaoOriginal: number }[] = [];
    for (const q of questoes) {
      const antes = original.questoes.find((x) => x.id === q.id);
      if (!antes) continue;
      const d = diferencaTextualQuestao(antes, q);
      if (d.length) lista.push({ recursoId: q.id, rotulo: `Questão: ${antes.enunciado}`, diferenca: d, revisaoOriginal: antes.revisao });
    }
    for (const t of topicos) {
      const antes = original.topicos.find((x) => x.id === t.id);
      const d = antes ? diferencaTextualTopico(antes.titulo, t.titulo) : [];
      if (d.length) lista.push({ recursoId: recursoTopico(conteudo.disciplina.id, t.id), rotulo: `Tópico: ${antes!.titulo}`, diferenca: d, revisaoOriginal: revisao });
    }
    return lista;
  };

  const salvar = async (comConfirmacao: boolean) => {
    const confirmacoes: ConfirmacaoTextual[] = comConfirmacao
      ? pendentes.filter((p) => confirmadas[p.recursoId]).map((p) => ({ recursoId: p.recursoId, revisaoOriginal: p.revisaoOriginal, diferenca: p.diferenca })) : [];
    const r = await rodar((repo) => repo.salvarConteudo({ disciplinaId: conteudo.disciplina.id }, { topicos, questoes }, revisao, confirmacoes));
    if (r.ok) { aoSalvar(true); setPendentes([]); setConfirmadas({}); }
  };

  // A rejeição por falta de confirmação mostra a diferença exata para o autor examinar e confirmar.
  const precisaConfirmar = Boolean(erro && Object.keys(erro.detalhes).some((k) => k.endsWith('.confirmacao')));
  useEffect(() => {
    if (erro && precisaConfirmar) setPendentes(diferencas().filter((d) => `${d.recursoId}.confirmacao` in erro.detalhes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erro]);

  const publicar = () => rodar((repo) => repo.publicarConteudo({ disciplinaId: conteudo.disciplina.id }, revisao)).then((r) => r.ok && aoSalvar(true));

  const mover = (i: number, d: -1 | 1) => aoTopicos((ts) => { const c = [...ts]; [c[i], c[i + d]] = [c[i + d], c[i]]; return c; });
  const setTopico = (i: number, fn: (t: Topico) => Topico) => aoTopicos((ts) => ts.map((t, j) => (j === i ? fn(t) : t)));
  const setQuestao = (id: string, fn: (q: QuestaoCandidata) => QuestaoCandidata) => aoQuestoes((qs) => qs.map((q) => (q.id === id ? fn(q) : q)));

  return (
    <>
      <p><Link to={voltar}>← Voltar</Link></p>
      <h1>Conteúdo de {conteudo.disciplina.nome}</h1>
      <p className="meta">{conteudo.graduacao.nome} · {conteudo.disciplina.codigo} · {publicado ? 'Publicada' : 'Em rascunho'} · o conteúdo é compartilhado por todas as turmas da disciplina</p>
      <MensagemErro erro={precisaConfirmar ? { ...erro!, detalhes: Object.fromEntries(Object.entries(erro!.detalhes).filter(([k]) => !k.endsWith('.confirmacao'))) } : erro} />
      {salvo && <p role="status" className="destaque">Alterações salvas.</p>}

      <h2>Tópicos</h2>
      <ol className="lista-topicos">
        {topicos.map((t, i) => (
          <li key={t.id} className="cartao">
            <Campo rotulo={`Título do tópico ${i + 1}`}>
              <input value={t.titulo} onChange={(e) => setTopico(i, (x) => ({ ...x, titulo: e.target.value }))} />
            </Campo>
            <div className="acoes">
              <button type="button" className="secundario" disabled={i === 0} onClick={() => mover(i, -1)} aria-label={`Mover ${t.titulo} para cima`}>↑</button>
              <button type="button" className="secundario" disabled={i === topicos.length - 1} onClick={() => mover(i, 1)} aria-label={`Mover ${t.titulo} para baixo`}>↓</button>
              <button type="button" className="secundario" onClick={() => { aoTopicos((ts) => ts.filter((x) => x.id !== t.id)); aoQuestoes((qs) => qs.filter((q) => q.topicoId !== t.id)); }}>Remover tópico {t.titulo}</button>
            </div>
            <h3>Materiais</h3>
            <ul className="lista-limpa">
              {t.materiais.map((m, j) => (
                <li key={m.id} className="linha">
                  <select aria-label={`Tipo do material ${m.titulo}`} value={m.tipo} onChange={(e) => setTopico(i, (x) => ({ ...x, materiais: x.materiais.map((y, k) => (k === j ? { ...y, tipo: e.target.value as TipoMaterial } : y)) }))}>
                    <option value="texto">Texto</option><option value="video">Vídeo (link)</option><option value="arquivo">Arquivo (link)</option>
                  </select>
                  <input aria-label={`Título do material ${m.titulo}`} value={m.titulo} onChange={(e) => setTopico(i, (x) => ({ ...x, materiais: x.materiais.map((y, k) => (k === j ? { ...y, titulo: e.target.value } : y)) }))} />
                  <input aria-label={`Conteúdo do material ${m.titulo}`} value={m.conteudo} onChange={(e) => setTopico(i, (x) => ({ ...x, materiais: x.materiais.map((y, k) => (k === j ? { ...y, conteudo: e.target.value } : y)) }))} />
                  <button type="button" className="secundario" onClick={() => setTopico(i, (x) => ({ ...x, materiais: x.materiais.filter((_, k) => k !== j) }))}>Remover material {m.titulo}</button>
                </li>
              ))}
            </ul>
            <button type="button" className="secundario" onClick={() => setTopico(i, (x) => ({ ...x, materiais: [...x.materiais, { id: novoId('m'), tipo: 'texto', titulo: 'Novo material', conteudo: 'Texto' } as Material] }))}>Adicionar material ao tópico {t.titulo}</button>
          </li>
        ))}
      </ol>
      <button type="button" className="secundario" onClick={() => aoTopicos((ts) => [...ts, { id: novoId('t'), titulo: '', materiais: [] }])}>Adicionar tópico</button>

      <h2>Banco de questões</h2>
      {questoes.map((q) => (
        <fieldset key={q.id} className="cartao" aria-label={`Questão ${q.id}`}>
          <Campo rotulo="Enunciado"><textarea value={q.enunciado} onChange={(e) => setQuestao(q.id, (x) => ({ ...x, enunciado: e.target.value }))} /></Campo>
          <Campo rotulo="Tópico">
            <select value={q.topicoId} onChange={(e) => setQuestao(q.id, (x) => ({ ...x, topicoId: e.target.value }))}>
              <option value="">Escolha…</option>{topicos.map((t) => <option key={t.id} value={t.id}>{t.titulo || '(sem título)'}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Dificuldade">
            <select value={q.dificuldade} onChange={(e) => setQuestao(q.id, (x) => ({ ...x, dificuldade: e.target.value as Dificuldade }))}>
              {DIFICULDADES.map((d) => <option key={d} value={d}>{NOME_DIFICULDADE[d]}</option>)}
            </select>
          </Campo>
          {q.alternativas.map((a, i) => (
            <div key={i} className="linha">
              <input type="radio" aria-label={`Correta: alternativa ${i + 1} da questão ${q.id}`} checked={q.correta === i} onChange={() => setQuestao(q.id, (x) => ({ ...x, correta: i }))} />
              <input aria-label={`Alternativa ${i + 1} da questão ${q.id}`} value={a} onChange={(e) => setQuestao(q.id, (x) => ({ ...x, alternativas: x.alternativas.map((y, k) => (k === i ? e.target.value : y)) }))} />
            </div>
          ))}
          <Campo rotulo="Explicação"><textarea value={q.explicacao} onChange={(e) => setQuestao(q.id, (x) => ({ ...x, explicacao: e.target.value }))} /></Campo>
          <button type="button" className="secundario" onClick={() => aoQuestoes((qs) => qs.filter((x) => x.id !== q.id))}>Remover questão {q.id}</button>
        </fieldset>
      ))}
      <button type="button" className="secundario" disabled={topicos.length === 0} onClick={() => aoQuestoes((qs) => [...qs, { id: novoId('q'), topicoId: topicos[0]?.id ?? '', dificuldade: 'facil', enunciado: '', alternativas: alternativasVazias(), correta: 0, explicacao: '', revisao: 0 }])}>Adicionar questão</button>

      {pendentes.length > 0 && (
        <section className="cartao" role="group" aria-label="Confirmação da correção textual">
          <h2>Confirme a correção textual</h2>
          <p>Examine a diferença exata e confirme, como autor, que o significado e a correspondência das alternativas foram preservados. Nenhuma segunda pessoa é necessária.</p>
          {pendentes.map((p) => (
            <div key={p.recursoId}>
              <p><strong>{p.rotulo}</strong></p>
              <ul>
                {p.diferenca.map((d) => (
                  <li key={d.campo}><em>{d.campo}</em>: “{Array.isArray(d.original) ? d.original.join(' | ') : String(d.original)}” → “{Array.isArray(d.proposto) ? d.proposto.join(' | ') : String(d.proposto)}”</li>
                ))}
              </ul>
              <label><input type="checkbox" checked={Boolean(confirmadas[p.recursoId])} onChange={(e) => setConfirmadas((c) => ({ ...c, [p.recursoId]: e.target.checked }))} /> Confirmo que o significado e a correspondência foram preservados ({p.rotulo})</label>
            </div>
          ))}
        </section>
      )}

      <div className="acoes">
        <button type="button" disabled={ocupado || !editado} onClick={() => salvar(pendentes.length > 0)}>Salvar alterações</button>
        <button type="button" className="secundario" disabled={!editado} onClick={descartar}>Descartar alterações</button>
        {!publicado && <button type="button" className="secundario" disabled={ocupado || editado} onClick={publicar}>Publicar conteúdo</button>}
      </div>
    </>
  );
}
