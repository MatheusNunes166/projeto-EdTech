import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AREA_DA_FUNCAO, ROTULO_AREA, localizacaoDaPagina, nomesDasFuncoes } from '../app/areas';
import { useApp, useConsulta, useComando, useUsuario } from '../app/contexto';
import { MensagemErro } from '../componentes/comuns';
import { formatarData } from '../dominio/datas';
import { FUNCOES, type Funcao } from '../dominio/tipos';
import { Demonstracao } from './Restauracao';

const MENU: Record<Funcao, { para: string; rotulo: string; fim?: boolean }[]> = {
  aluno: [{ para: '/aluno', rotulo: 'Minhas turmas', fim: true }, { para: '/aluno/catalogo', rotulo: 'Catálogo' }],
  professor: [{ para: '/professor', rotulo: 'Minhas turmas', fim: true }],
  coordenador: [{ para: '/coordenacao', rotulo: 'Painel', fim: true }, { para: '/coordenacao/gestao', rotulo: 'Gestão acadêmica' }, { para: '/coordenacao/cadastros', rotulo: 'Cadastros' }],
  admin: [
    { para: '/admin', rotulo: 'Visão geral', fim: true }, { para: '/admin/usuarios', rotulo: 'Pessoas' },
    { para: '/admin/vinculos', rotulo: 'Vínculos' }, { para: '/admin/graduacoes', rotulo: 'Graduações e disciplinas' },
    { para: '/admin/periodos', rotulo: 'Períodos e turmas' }, { para: '/admin/gestao', rotulo: 'Matrículas e docentes' },
  ],
  responsavel: [{ para: '/responsavel', rotulo: 'Painel', fim: true }],
};

const areaAtual = (caminho: string): Funcao | undefined =>
  FUNCOES.find((f) => caminho === AREA_DA_FUNCAO[f] || caminho.startsWith(`${AREA_DA_FUNCAO[f]}/`));

export function Layout() {
  const usuario = useUsuario();
  const { executar } = useApp();
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const data = useConsulta((r) => r.consultarDataVirtual());
  const { rodar, erro } = useComando();
  const area = areaAtual(pathname) ?? usuario.funcoes[0];
  const localizacao = localizacaoDaPagina(pathname, area);

  const sair = async () => {
    await executar((r) => r.sair());
    navegar('/', { replace: true });
  };

  return (
    <div className="app">
      <header className="topo">
        <div className="identidade-app"><div className="marca">Trilha Adaptativa</div>
          <p className="localizacao" aria-label="Localização atual"><strong>{ROTULO_AREA[area]}</strong> · {localizacao.titulo}</p>
        </div>
        <nav aria-label="Menu principal">
          {MENU[area].map((item) => <NavLink key={item.para} to={item.para} aria-current={localizacao.principal === item.para ? 'page' : false}
            className={() => localizacao.principal === item.para ? 'active' : undefined}>{item.rotulo}</NavLink>)}
        </nav>
        <div className="usuario">
          <span>{usuario.nome} <small className="selo">{nomesDasFuncoes(usuario.funcoes)}</small></span>
          <button onClick={sair}>Sair</button>
        </div>
      </header>
      {usuario.funcoes.length > 1 && (
        <nav className="barra-demo" aria-label="Áreas da pessoa">
          {FUNCOES.filter((f) => usuario.funcoes.includes(f)).map((f) => (
            <NavLink key={f} to={AREA_DA_FUNCAO[f]} aria-current={false}>{ROTULO_AREA[f]}</NavLink>
          ))}
        </nav>
      )}
      <Demonstracao>
        {data.situacao === 'ok' && (
          <>
            <span>Data simulada: <strong>{formatarData(data.dados)}</strong></span>
            <button className="secundario" onClick={() => rodar((r) => r.avancarDataVirtual(data.revisao))}>Simular próximo dia</button>
          </>
        )}
        <MensagemErro erro={erro} />
      </Demonstracao>
      <main className={`conteudo ${area === 'aluno' ? 'experiencia-aluno' : ''}`}><Outlet /></main>
    </div>
  );
}
