import { AcoesEditor, Icone, MensagemSucesso, Retorno } from '../../componentes/Interacao';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useApp, useComando, useConsulta, type EstadoConsulta } from '../../app/contexto';
import { useRascunhoPendente } from '../../app/rascunho';
import { Confirmacao } from '../../componentes/Confirmacao';
import { ListaRegistros, PainelEdicao, Registro } from '../../componentes/Gestao';
import { Campo, Consulta, MensagemErro, Vazio } from '../../componentes/comuns';
import type { ConfirmacaoTextual, ConteudoCandidato, QuestaoCandidata } from '../../dados/comandos-conteudo';
import type { ConteudoEditavel } from '../../dados/contratos-consultas-academicas';
import { diferencaTextualQuestao, diferencaTextualTopico, errosDeCobertura, recursoTopico, verificarPublicacaoDisciplina } from '../../conteudo/regras-disciplina';
import { DIFICULDADES, NOME_DIFICULDADE, type Dificuldade, type Material, type Topico } from '../../dominio/tipos';

type Leitura = Extract<EstadoConsulta<ConteudoEditavel>, { situacao: 'ok' }>;
type Selecao = { tipo: 'topico' | 'questao'; id: string } | { tipo: 'material'; id: string; topicoId: string };
type RevisaoTextual = ConfirmacaoTextual & { rotulo: string };
type Remocao = { titulo: string; efeito: string; remover: () => void };

const novoId = (prefixo: string) => prefixo + '-' + (globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2));
const acessoNegado = (estado: EstadoConsulta<ConteudoEditavel>) => estado.situacao === 'erro'
  && ['ACESSO_NEGADO', 'SEM_SESSAO', 'SESSAO_INVALIDA'].includes(estado.erro.codigo);

function copiar(dados: Pick<ConteudoEditavel['disciplina'], 'topicos'> & Pick<ConteudoEditavel, 'questoes'>): ConteudoCandidato {
  return {
    topicos: structuredClone(dados.topicos),
    questoes: dados.questoes.map(({ disciplinaId: _disciplina, ...q }) => ({ ...q, alternativas: [...q.alternativas] })),
  };
}

export function EditorConteudo() {
  const { disciplinaId = '' } = useParams();
  const { usuario } = useApp();
  return <ConsultaEditor key={usuario?.id + ':' + disciplinaId} disciplinaId={disciplinaId} />;
}

function ConsultaEditor({ disciplinaId }: { disciplinaId: string }) {
  const estado = useConsulta((r) => r.consultarConteudoEditavel({ disciplinaId }), [disciplinaId]);
  const [primeira, setPrimeira] = useState<Leitura | null>(null);
  const negado = acessoNegado(estado);
  useEffect(() => {
    if (negado) setPrimeira(null);
    else if (estado.situacao === 'ok') setPrimeira((anterior) => anterior ?? estado);
  }, [estado, negado]);

  if (negado || (!primeira && estado.situacao !== 'ok')) return <Consulta estado={estado}>{() => null}</Consulta>;
  return <Editor inicial={primeira ?? estado as Leitura} leitura={estado} />;
}

function Editor({ inicial, leitura }: { inicial: Leitura; leitura: EstadoConsulta<ConteudoEditavel> }) {
  const [origem, setOrigem] = useState(() => copiar({ ...inicial.dados.disciplina, questoes: inicial.dados.questoes }));
  const [revisao, setRevisao] = useState(inicial.revisao);
  const [candidato, setCandidato] = useState(origem);
  const [secao, setSecao] = useState<'topicos' | 'questoes'>('topicos');
  const [selecao, selecionar] = useState<Selecao | null>(null);
  const [pendentes, setPendentes] = useState<RevisaoTextual[]>([]);
  const [confirmadas, setConfirmadas] = useState<Record<string, boolean>>({});
  const [salvo, setSalvo] = useState(false);
  const [descarte, setDescarte] = useState(false);
  const [remocao, setRemocao] = useState<Remocao | null>(null);
  const { rodar, erro, ocupado, limpar } = useComando();
  const admin = useLocation().pathname.startsWith('/admin/');
  const { topicos, questoes } = candidato;
  const editado = candidato !== origem && JSON.stringify(candidato) !== JSON.stringify(origem);
  useRascunhoPendente(editado ? inicial.dados.disciplina.nome : null);

  const autorizada = leitura.situacao === 'ok';
  const atual = autorizada ? leitura : inicial;
  const desatualizado = autorizada && atual.revisao !== revisao;
  useEffect(() => {
    if (!desatualizado) return;
    setPendentes([]); setConfirmadas({});
    if (!editado) {
      const novo = copiar({ ...atual.dados.disciplina, questoes: atual.dados.questoes });
      setOrigem(novo); setCandidato(novo); setRevisao(atual.revisao);
    }
  }, [atual, desatualizado, editado]);

  const { disciplina, graduacao, protecoes } = atual.dados;
  const alvo = { disciplinaId: disciplina.id };
  const publicado = disciplina.status === 'publicado';
  const protegida = protecoes.estudoIniciado;
  const bloqueioEstrutura = protegida ? 'O estudo já foi iniciado em uma turma desta disciplina. A estrutura dos tópicos está protegida.' : '';
  const cobertura = errosDeCobertura(verificarPublicacaoDisciplina(disciplina, atual.dados.questoes));
  const indiceTopico = topicos.findIndex((t) => t.id === (selecao?.tipo === 'material' ? selecao.topicoId : selecao?.id));
  const topico = topicos[indiceTopico];
  const questao = selecao?.tipo === 'questao' ? questoes.find((q) => q.id === selecao.id) : undefined;
  const material = selecao?.tipo === 'material' ? topico?.materiais.find((m) => m.id === selecao.id) : undefined;
  const qProtegida = Boolean(questao && protecoes.questoesRespondidas.includes(questao.id));

  const mudar = (fn: (c: ConteudoCandidato) => ConteudoCandidato) => {
    setSalvo(false); limpar();
    const editando = selecao?.tipo === 'questao' ? selecao.id
      : selecao?.tipo === 'topico' ? recursoTopico(disciplina.id, selecao.id) : null;
    if (editando) {
      setPendentes((p) => p.filter((x) => x.recursoId !== editando));
      setConfirmadas((c) => ({ ...c, [editando]: false }));
    }
    setCandidato(fn);
  };
  const mudarTopico = (fn: (t: Topico) => Topico) =>
    mudar((c) => ({ ...c, topicos: c.topicos.map((t) => t.id === topico.id ? fn(t) : t) }));
  const mudarMaterial = (fn: (m: Material) => Material) =>
    mudarTopico((t) => ({ ...t, materiais: t.materiais.map((m) => m.id === material?.id ? fn(m) : m) }));
  const mudarQuestao = (fn: (q: QuestaoCandidata) => QuestaoCandidata) =>
    mudar((c) => ({ ...c, questoes: c.questoes.map((q) => q.id === questao?.id ? fn(q) : q) }));
  const mover = (direcao: -1 | 1) => mudar((c) => {
    const ordem = [...c.topicos];
    [ordem[indiceTopico], ordem[indiceTopico + direcao]] = [ordem[indiceTopico + direcao], ordem[indiceTopico]];
    return { ...c, topicos: ordem };
  });
  const selecionarSecao = (s: typeof secao) => { setSecao(s); selecionar(null); };

  const diferencas = (): RevisaoTextual[] => {
    const lista: RevisaoTextual[] = [];
    for (const q of questoes) {
      const antes = origem.questoes.find((x) => x.id === q.id);
      if (!antes) continue;
      const diferenca = diferencaTextualQuestao(antes, q);
      if (diferenca.length) lista.push({ recursoId: q.id, rotulo: antes.enunciado, revisaoOriginal: antes.revisao, diferenca });
    }
    for (const t of topicos) {
      const antes = origem.topicos.find((x) => x.id === t.id);
      if (!antes) continue;
      const diferenca = diferencaTextualTopico(antes.titulo, t.titulo);
      if (diferenca.length) lista.push({ recursoId: recursoTopico(disciplina.id, t.id), rotulo: antes.titulo, revisaoOriginal: revisao, diferenca });
    }
    return lista;
  };

  const salvar = async () => {
    if (ocupado || desatualizado || !editado) return;
    const confirmacoes = pendentes.filter((p) => confirmadas[p.recursoId])
      .map(({ rotulo: _rotulo, ...confirmacao }) => confirmacao);
    const resultado = await rodar((repo) => repo.salvarConteudo(alvo, candidato, revisao, confirmacoes));
    if (resultado.ok) {
      const salvo = copiar(resultado.valor);
      setOrigem(salvo); setCandidato(salvo);
      setSalvo(true); setPendentes([]); setConfirmadas({});
    }
  };
  const precisaConfirmar = erro && Object.keys(erro.detalhes).some((chave) => chave.endsWith('.confirmacao'));
  useEffect(() => {
    if (!precisaConfirmar || !erro || desatualizado) return;
    setPendentes((anteriores) => diferencas().filter((p) => (p.recursoId + '.confirmacao') in erro.detalhes
      || anteriores.some((a) => a.recursoId === p.recursoId)));
    // A diferença é comparada com o candidato enviado no comando rejeitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erro, precisaConfirmar, desatualizado]);

  if (!autorizada) return <Consulta estado={leitura}>{() => null}</Consulta>;

  return <>
    <p><Retorno to={admin ? '/admin/graduacoes' : '/professor'}>{admin ? 'Voltar aos cadastros' : 'Voltar às turmas'}</Retorno></p>
    <h1>Conteúdo de {disciplina.nome}</h1>
    <p className="meta">{graduacao.nome} · {disciplina.codigo} · {publicado ? 'Publicada' : 'Em rascunho'} · Compartilhado entre turmas</p>
    <AcoesEditor>
      <div className="estado-editor"><strong>{disciplina.nome}</strong><span role="status" className={editado ? 'selo alerta-selo' : 'selo'}>{editado ? 'Edição pendente' : 'Sem alterações pendentes'}</span></div>
      <div className="acoes">
        <button disabled={ocupado || !editado || desatualizado} onClick={salvar} aria-busy={ocupado}><Icone nome="check" />{ocupado ? 'Salvando…' : 'Salvar alterações'}</button>
        <button className="secundario" disabled={!editado || ocupado} onClick={() => setDescarte(true)}>{desatualizado ? 'Recarregar versão salva' : 'Descartar alterações'}</button>
      </div>
      {salvo && <MensagemSucesso>Alterações salvas.</MensagemSucesso>}
      {desatualizado && editado
        ? <div role="alert" className="alerta">O conteúdo ou a revisão mudou. Recarregue a versão atual antes de salvar novamente.</div>
        : <MensagemErro erro={precisaConfirmar && erro ? { ...erro, detalhes: Object.fromEntries(Object.entries(erro.detalhes).filter(([chave]) => !chave.endsWith('.confirmacao'))) } : erro} />}
    </AcoesEditor>
    <div className="acoes" aria-label="Seções do editor">
      <button className="secundario" aria-pressed={secao === 'topicos'} onClick={() => selecionarSecao('topicos')}>Tópicos e materiais</button>
      <button className="secundario" aria-pressed={secao === 'questoes'} onClick={() => selecionarSecao('questoes')}>Banco de questões</button>
    </div>

    <div className="gestao-com-edicao">
      <section className="lista-gestao">
        {secao === 'topicos' ? <>
          <h2>Tópicos</h2>
          {protegida && <p id="estrutura-protegida">{bloqueioEstrutura}</p>}
          <p><button disabled={protegida || ocupado} aria-describedby={protegida ? 'estrutura-protegida' : undefined} onClick={() => {
            const novo = { id: novoId('t'), titulo: '', materiais: [] };
            mudar((c) => ({ ...c, topicos: [...c.topicos, novo] }));
            selecionar({ tipo: 'topico', id: novo.id });
          }}>Adicionar tópico</button></p>
          {topicos.length ? <ListaRegistros buscavel rotulo="Tópicos">{topicos.map((t, i) => (
            <Registro key={t.id} acoes={<button className="secundario" aria-label={'Editar tópico ' + (t.titulo || i + 1)}
              onClick={() => selecionar({ tipo: 'topico', id: t.id })}>Editar</button>}>
              <strong>{i + 1}. {t.titulo || 'Tópico sem título'}</strong><p className="meta">Materiais: {t.materiais.length}</p>
            </Registro>
          ))}</ListaRegistros> : <Vazio>Nenhum tópico.</Vazio>}
        </> : <>
          <h2>Banco de questões</h2>
          <p><button disabled={!topicos.length || ocupado} onClick={() => {
            const nova: QuestaoCandidata = { id: novoId('q'), topicoId: topicos[0].id, dificuldade: 'facil', enunciado: '', alternativas: ['', ''], correta: 0, explicacao: '', revisao: 0 };
            mudar((c) => ({ ...c, questoes: [...c.questoes, nova] }));
            selecionar({ tipo: 'questao', id: nova.id });
          }}>Adicionar questão</button></p>
          {questoes.length ? <ListaRegistros buscavel rotulo="Questões">{questoes.map((q) => (
            <Registro key={q.id} acoes={<button className="secundario" aria-label={'Editar questão ' + q.id} aria-describedby={'resumo-' + q.id}
              onClick={() => selecionar({ tipo: 'questao', id: q.id })}>Editar</button>}>
              <strong id={'resumo-' + q.id}>{q.enunciado || 'Questão sem enunciado'}</strong><p className="meta">{topicos.find((t) => t.id === q.topicoId)?.titulo} · {NOME_DIFICULDADE[q.dificuldade]}</p>
            </Registro>
          ))}</ListaRegistros> : <Vazio>Nenhuma questão cadastrada.</Vazio>}
        </>}
      </section>

      {selecao?.tipo === 'topico' && topico && <PainelEdicao key={topico.id} titulo={topico.titulo || 'Novo tópico'}>
        <div className="formulario">
          <button type="button" className="secundario voltar-lista" onClick={() => selecionar(null)}>Voltar à lista de tópicos</button>
          <Campo rotulo={'Título do tópico ' + (indiceTopico + 1)}><input disabled={ocupado} value={topico.titulo} onChange={(e) => mudarTopico((t) => ({ ...t, titulo: e.target.value }))} /></Campo>
          {protegida && <p id="ordem-protegida">{bloqueioEstrutura}</p>}
          <div className="acoes">
            <button className="secundario" disabled={ocupado || protegida || indiceTopico === 0} aria-label={'Mover ' + topico.titulo + ' para cima'} onClick={() => mover(-1)}>Subir</button>
            <button className="secundario" disabled={ocupado || protegida || indiceTopico === topicos.length - 1} aria-label={'Mover ' + topico.titulo + ' para baixo'} onClick={() => mover(1)}>Descer</button>
            <button className="secundario destrutivo" disabled={ocupado || protegida} onClick={() => setRemocao({
              titulo: 'Remover tópico ' + topico.titulo + '?', efeito: 'O tópico, seus materiais e questões serão retirados do rascunho.',
              remover: () => { mudar((c) => ({ topicos: c.topicos.filter((t) => t.id !== topico.id), questoes: c.questoes.filter((q) => q.topicoId !== topico.id) })); selecionar(null); },
            })}>Remover tópico</button>
          </div>
          <h3>Materiais</h3>
          {topico.materiais.length ? <ListaRegistros rotulo="Materiais">{topico.materiais.map((m) => (
            <Registro key={m.id} acoes={<button className="secundario" aria-label={'Editar material ' + m.titulo}
              onClick={() => selecionar({ tipo: 'material', id: m.id, topicoId: topico.id })}>Editar</button>}>{m.titulo}</Registro>
          ))}</ListaRegistros> : <Vazio>Nenhum material.</Vazio>}
          <button className="secundario" disabled={ocupado} onClick={() => {
            const novo: Material = { id: novoId('m'), tipo: 'texto', titulo: 'Novo material', conteudo: 'Texto' };
            mudarTopico((t) => ({ ...t, materiais: [...t.materiais, novo] }));
            selecionar({ tipo: 'material', id: novo.id, topicoId: topico.id });
          }}>Adicionar material</button>
        </div>
      </PainelEdicao>}

      {material && <PainelEdicao key={material.id} titulo={'Material de ' + topico.titulo}>
        <div className="formulario">
          <button className="secundario voltar-lista" onClick={() => selecionar({ tipo: 'topico', id: topico.id })}>Voltar aos materiais</button>
          <Campo rotulo="Tipo do material"><select disabled={ocupado} value={material.tipo} onChange={(e) => mudarMaterial((m) => ({ ...m, tipo: e.target.value as Material['tipo'] }))}>
            <option value="texto">Texto</option><option value="video">Vídeo (link)</option><option value="arquivo">Arquivo (link)</option>
          </select></Campo>
          <Campo rotulo="Título do material"><input disabled={ocupado} value={material.titulo} onChange={(e) => mudarMaterial((m) => ({ ...m, titulo: e.target.value }))} /></Campo>
          <Campo rotulo={material.tipo === 'texto' ? 'Conteúdo do material' : 'Link do material'}>
            {material.tipo === 'texto' ? <textarea rows={6} disabled={ocupado} value={material.conteudo} onChange={(e) => mudarMaterial((m) => ({ ...m, conteudo: e.target.value }))} />
              : <input type="url" disabled={ocupado} value={material.conteudo} onChange={(e) => mudarMaterial((m) => ({ ...m, conteudo: e.target.value }))} />}
          </Campo>
          <button className="secundario destrutivo" disabled={ocupado} onClick={() => setRemocao({
            titulo: 'Remover material ' + material.titulo + '?', efeito: 'O material será retirado do rascunho deste tópico.',
            remover: () => { mudarTopico((t) => ({ ...t, materiais: t.materiais.filter((m) => m.id !== material.id) })); selecionar({ tipo: 'topico', id: topico.id }); },
          })}>Remover material</button>
        </div>
      </PainelEdicao>}

      {questao && <PainelEdicao key={questao.id} titulo="Editar questão">
        <button className="secundario voltar-lista" onClick={() => selecionar(null)}>Voltar à lista de questões</button>
        <fieldset className="formulario questao-editavel" aria-label={'Questão ' + questao.id} disabled={ocupado}>
          {qProtegida && <p id="questao-protegida">Questão respondida. Tópico, dificuldade, gabarito e remoção estão bloqueados. Correções de texto exigem revisão.</p>}
          <Campo rotulo="Enunciado"><textarea rows={6} value={questao.enunciado} onChange={(e) => mudarQuestao((q) => ({ ...q, enunciado: e.target.value }))} /></Campo>
          <Campo rotulo="Tópico"><select value={questao.topicoId} disabled={qProtegida} onChange={(e) => mudarQuestao((q) => ({ ...q, topicoId: e.target.value }))}>
            <option value="">Escolha…</option>{topicos.map((t) => <option key={t.id} value={t.id}>{t.titulo || '(sem título)'}</option>)}
          </select></Campo>
          <Campo rotulo="Dificuldade"><select value={questao.dificuldade} disabled={qProtegida}
            onChange={(e) => mudarQuestao((q) => ({ ...q, dificuldade: e.target.value as Dificuldade }))}>
            {DIFICULDADES.map((d) => <option key={d} value={d}>{NOME_DIFICULDADE[d]}</option>)}
          </select></Campo>
          {questao.alternativas.map((a, i) => <div className="alternativa-editavel" key={i}>
            <label><input type="radio" name={'correta-' + questao.id} disabled={qProtegida} checked={i === questao.correta}
              aria-label={'Correta: alternativa ' + (i + 1) + ' da questão ' + questao.id}
              onChange={() => mudarQuestao((q) => ({ ...q, correta: i }))} /> Correta</label>
            <label>Alternativa {i + 1}<textarea rows={2} aria-label={'Alternativa ' + (i + 1) + ' da questão ' + questao.id} value={a}
              onChange={(e) => mudarQuestao((q) => ({ ...q, alternativas: q.alternativas.map((x, j) => j === i ? e.target.value : x) }))} /></label>
          </div>)}
          <Campo rotulo="Explicação"><textarea rows={6} value={questao.explicacao} onChange={(e) => mudarQuestao((q) => ({ ...q, explicacao: e.target.value }))} /></Campo>
          <button className="secundario destrutivo" disabled={qProtegida} aria-describedby={qProtegida ? 'questao-protegida' : undefined}
            aria-label={'Remover questão ' + questao.id} onClick={() => setRemocao({
              titulo: 'Remover a questão “' + questao.enunciado + '”?', efeito: 'A questão será retirada do rascunho. A cobertura será verificada ao salvar o conjunto.',
              remover: () => { mudar((c) => ({ ...c, questoes: c.questoes.filter((q) => q.id !== questao.id) })); selecionar(null); },
            })}>Remover questão</button>
        </fieldset>
      </PainelEdicao>}
    </div>

    {!!pendentes.length && !desatualizado && <section className="cartao" role="group" aria-label="Confirmação da correção textual">
      <h2>Confirme a correção textual</h2>
      <p>Examine a diferença exata. Confirme que o significado e a correspondência das alternativas foram preservados. Nenhuma segunda pessoa é necessária.</p>
      {pendentes.map((p) => <section key={p.recursoId}>
        <h3>{p.rotulo}</h3>
        <ul>{p.diferenca.map((d) => <li key={d.campo}>
          <strong>{d.campo}</strong><p>Original: {Array.isArray(d.original) ? d.original.join(' | ') : String(d.original)}</p>
          <p>Proposto: {Array.isArray(d.proposto) ? d.proposto.join(' | ') : String(d.proposto)}</p>
        </li>)}</ul>
        <label><input type="checkbox" checked={Boolean(confirmadas[p.recursoId])} disabled={ocupado}
          onChange={(e) => setConfirmadas((c) => ({ ...c, [p.recursoId]: e.target.checked }))} /> Confirmo que o significado e a correspondência foram preservados ({p.rotulo})</label>
      </section>)}
    </section>}

    {!publicado && <section className="cartao" aria-label="Publicação">
      <h2>Publicação</h2>
      {editado && <p id="publicacao-pendente">Salve as alterações antes de publicar.</p>}
      {!!Object.keys(cobertura).length && <ul>{Object.entries(cobertura).map(([chave, texto]) => <li key={chave}>
        {texto}{chave.startsWith('cobertura.') && <button className="secundario" onClick={() => {
          setSecao('topicos'); selecionar({ tipo: 'topico', id: chave.split('.')[1] });
        }}>Abrir tópico</button>}
      </li>)}</ul>}
      <button className="secundario" disabled={ocupado || editado || desatualizado} aria-describedby={editado ? 'publicacao-pendente' : undefined}
        onClick={async () => {
          const r = await rodar((repo) => repo.publicarConteudo(alvo, revisao));
          if (r.ok) setSalvo(true);
        }}>Publicar conteúdo</button>
    </section>}
    {descarte && <Confirmacao titulo={'Descartar alterações de ' + disciplina.nome + '?'} acao="Confirmar descarte" aoCancelar={() => setDescarte(false)}
      aoConfirmar={() => {
        const salvo = copiar({ ...disciplina, questoes: atual.dados.questoes });
        setOrigem(salvo); setCandidato(salvo); setRevisao(atual.revisao);
        setPendentes([]); setConfirmadas({}); limpar(); setSalvo(false); setDescarte(false);
      }}>
      <p>As alterações ainda não salvas serão perdidas. O conteúdo salvo e o histórico permanecem.</p>
    </Confirmacao>}
    {remocao && <Confirmacao titulo={remocao.titulo} acao="Retirar do rascunho" aoCancelar={() => setRemocao(null)} aoConfirmar={() => {
      remocao.remover(); setRemocao(null);
    }}><p>{remocao.efeito}</p></Confirmacao>}
  </>;
}
