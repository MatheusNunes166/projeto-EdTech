import { useState } from 'react';
import { useComando, useConsulta } from '../../app/contexto';
import { Confirmacao } from '../../componentes/Confirmacao';
import { ListaRegistros, PainelEdicao, Registro } from '../../componentes/Gestao';
import { Consulta, MensagemErro, Vazio } from '../../componentes/comuns';
import type { PedidoCandidatos } from '../../dados/contratos-consultas-academicas';
import type { RepositorioApp } from '../../dados/repositorio-app';

export function SeletorCandidato({ pedido, rotulo, valor, mudar }: {
  pedido: PedidoCandidatos;
  rotulo: string;
  valor: string;
  mudar: (id: string) => void;
}) {
  const estado = useConsulta((repo) => repo.consultarCandidatos(pedido), [pedido]);
  return <Consulta estado={estado}>{(lista) => lista.length ? (
    <label>{rotulo}<select value={valor} onChange={(e) => mudar(e.target.value)}>
      <option value="">Escolha…</option>
      {lista.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
    </select></label>
  ) : <Vazio>Nenhum candidato elegível.</Vazio>}</Consulta>;
}

type Edicao = 'coordenacao' | 'responsavel';
type Remocao = { titulo: string; efeito: string; executar: (repo: RepositorioApp) => Promise<unknown> };

export function Vinculos() {
  const estado = useConsulta((r) => r.consultarPessoas());
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [aviso, setAviso] = useState('');
  const [remocao, setRemocao] = useState<Remocao | null>(null);
  const { rodar, erro, limpar, ocupado } = useComando();
  const abrir = (tipo: Edicao) => {
    setOrigem(''); setDestino(''); limpar(); setAviso(''); setEdicao(tipo);
  };
  const fechar = () => { setEdicao(null); limpar(); };
  const solicitar = (alvo: Remocao) => { setAviso(''); limpar(); setRemocao(alvo); };

  return <>
    <h1>Vínculos</h1>
    {aviso && <p role="status">{aviso}</p>}
    <Consulta estado={estado}>{({ pessoas, coordenacao, responsaveis, graduacoes }, revisao) => {
      const nome = (id: string) => pessoas.find((p) => p.id === id)?.nome ?? id;
      const graduacao = (id: string) => graduacoes.find((g) => g.id === id)?.nome ?? id;
      const titulo = edicao === 'coordenacao' ? 'Nova coordenação' : 'Novo vínculo de acompanhamento';
      return <div className="gestao-com-edicao">
        <div className="lista-gestao">
          <section aria-label="Coordenação">
            <h2>Coordenação de graduações</h2>
            <p><button onClick={() => abrir('coordenacao')}>Nova coordenação</button></p>
            {coordenacao.length ? <ListaRegistros rotulo="Coordenações">{coordenacao.map((v) => {
              const contexto = nome(v.coordenadorId) + ' em ' + graduacao(v.graduacaoId);
              return <Registro key={v.coordenadorId + ':' + v.graduacaoId} acoes={
                <button className="secundario" aria-label={'Remover coordenação de ' + contexto}
                  onClick={() => solicitar({
                    titulo: 'Remover coordenação de ' + contexto + '?',
                    efeito: 'A pessoa perde o acesso concedido por esta coordenação. Outras relações e históricos são preservados.',
                    executar: (repo) => repo.definirVinculoCoordenador(v, false, revisao),
                  })}>Remover</button>
              }>{nome(v.coordenadorId)} coordena {graduacao(v.graduacaoId)}</Registro>;
            })}</ListaRegistros> : <Vazio>Nenhum vínculo de coordenação.</Vazio>}
          </section>
          <section aria-label="Responsáveis">
            <h2>Responsável–Aluno</h2>
            <p><button onClick={() => abrir('responsavel')}>Novo vínculo de acompanhamento</button></p>
            {responsaveis.length ? <ListaRegistros rotulo="Vínculos de acompanhamento">{responsaveis.map((v) => {
              const contexto = nome(v.responsavelId) + ' com ' + nome(v.alunoId);
              return <Registro key={v.responsavelId + ':' + v.alunoId} acoes={
                <button className="secundario" aria-label={'Remover vínculo de ' + contexto}
                  onClick={() => solicitar({
                    titulo: 'Remover vínculo de ' + contexto + '?',
                    efeito: 'O responsável perde o acesso concedido por este vínculo. Os dados do aluno continuam disponíveis para as pessoas autorizadas.',
                    executar: (repo) => repo.definirVinculoResponsavel(v, false, revisao),
                  })}>Remover</button>
              }>{nome(v.responsavelId)} acompanha {nome(v.alunoId)}</Registro>;
            })}</ListaRegistros> : <Vazio>Nenhum vínculo de responsável.</Vazio>}
          </section>
        </div>
        {edicao && <PainelEdicao key={edicao} titulo={titulo}>
          <form className="formulario" onSubmit={async (e) => {
            e.preventDefault();
            if (!origem || !destino || ocupado) return;
            const resultado = await rodar<unknown>((repo) => edicao === 'coordenacao'
              ? repo.definirVinculoCoordenador({ coordenadorId: origem, graduacaoId: destino }, true, revisao)
              : repo.definirVinculoResponsavel({ responsavelId: origem, alunoId: destino }, true, revisao));
            if (resultado.ok) {
              setAviso(edicao === 'coordenacao' ? 'Coordenação atribuída a ' + nome(origem) + ' em ' + graduacao(destino) + '.'
                : 'Vínculo salvo entre ' + nome(origem) + ' e ' + nome(destino) + '.');
              fechar();
            }
          }}>
            {edicao === 'coordenacao' ? <>
              <label>Graduação<select value={destino} onChange={(e) => { setDestino(e.target.value); setOrigem(''); }}>
                <option value="">Escolha…</option>
                {graduacoes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
              </select></label>
              {destino && <SeletorCandidato pedido={{ finalidade: 'coordenacao', graduacaoId: destino }} rotulo="Pessoa coordenadora" valor={origem} mudar={setOrigem} />}
            </> : <>
              <SeletorCandidato pedido={{ finalidade: 'responsavel' }} rotulo="Responsável" valor={origem} mudar={setOrigem} />
              <SeletorCandidato pedido={{ finalidade: 'aluno-responsavel' }} rotulo="Aluno" valor={destino} mudar={setDestino} />
            </>}
            <MensagemErro erro={erro} />
            <div className="acoes">
              <button type="submit" disabled={ocupado || !origem || !destino}>{edicao === 'coordenacao' ? 'Atribuir coordenação' : 'Vincular responsável'}</button>
              <button type="button" className="secundario" onClick={fechar}>Cancelar</button>
            </div>
          </form>
        </PainelEdicao>}
      </div>;
    }}</Consulta>
    {remocao && estado.situacao === 'ok' && <Confirmacao titulo={remocao.titulo} acao="Confirmar remoção" ocupado={ocupado}
      aoCancelar={() => { setRemocao(null); limpar(); }}
      aoConfirmar={async () => {
        if (ocupado) return;
        const resultado = await rodar(remocao.executar);
        if (resultado.ok) { setAviso(remocao.titulo.slice(0, -1).replace('Remover', 'Removido:') + '.'); setRemocao(null); }
      }}>
      <p>{remocao.efeito}</p>
      <MensagemErro erro={erro} />
    </Confirmacao>}
  </>;
}
