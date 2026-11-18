import { useEffect, useRef, useState } from 'react';
import { ProtecaoSaida, useSaidaDoEditor } from '../app/rascunho';
import { Icone } from '../componentes/Interacao';
import { Expansor } from '../componentes/Expansor';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AREA_DA_FUNCAO, ROTULO_AREA, localizacaoDaPagina, nomesDasFuncoes } from '../app/areas';
import { useApp, useConsulta, useComando, useUsuario } from '../app/contexto';
import { FocoDaPagina, MensagemErro, PularParaConteudo } from '../componentes/comuns';
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
  return <ProtecaoSaida><LayoutDaArea /></ProtecaoSaida>;
}

function LayoutDaArea() {
  const protecao = useSaidaDoEditor();
  const usuario = useUsuario();
  const { executar } = useApp();
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const data = useConsulta((r) => r.consultarDataVirtual());
  const { rodar, erro } = useComando();
  const area = areaAtual(pathname) ?? usuario.funcoes[0];
  const localizacao = localizacaoDaPagina(pathname, area);

  const [menuAberto, setMenuAberto] = useState(false);
  const menu = useRef<HTMLButtonElement>(null);
  useEffect(() => setMenuAberto(false), [pathname]);

  const sair = async () => {
    await executar((r) => r.sair());
    navegar('/', { replace: true });
  };

  return (
    <div className="app">
      <PularParaConteudo />
      <header className="topo" onKeyDown={(evento) => {
        if (evento.key !== 'Escape' || !menuAberto || evento.defaultPrevented) return;
        evento.preventDefault();
        setMenuAberto(false);
        menu.current?.focus();
      }}><div className="topo-conteudo">
        <div className="identidade-app"><div className="marca"><span className="marca-simbolo"><Icone nome="livro" /></span>Trilha Adaptativa</div>
          <p className="localizacao" aria-label="Localização atual"><strong>{ROTULO_AREA[area]}</strong> · {localizacao.titulo}</p>
        </div>
        <button type="button" ref={menu} className={area === 'admin' ? 'acionador-menu admin-menu secundario' : 'acionador-menu secundario'}
          aria-expanded={menuAberto} aria-label="Seções da área" aria-controls="secoes-area" onClick={() => setMenuAberto(!menuAberto)}>
          <Icone nome="menu" /><span className="menu-celular">Menu</span><span className="menu-desktop">Seções</span>
        </button>
        <div id="secoes-area" className={`secoes-area ${area === 'admin' ? 'secoes-admin' : ''}`} data-aberto={menuAberto}>
          <nav aria-label="Menu principal">
            {MENU[area].map((item) => <NavLink key={item.para} to={item.para} aria-current={localizacao.principal === item.para ? 'page' : false}
              className={() => localizacao.principal === item.para ? 'active' : undefined} >{item.rotulo}</NavLink>)}
          </nav>
          <Demonstracao>
            {data.situacao === 'ok' && (
              <>
                <span>Data simulada: <strong>{formatarData(data.dados)}</strong></span>
                <button className="secundario" onClick={() => rodar((r) => r.avancarDataVirtual(data.revisao))}>Simular próximo dia</button>
              </>
            )}
            <MensagemErro erro={erro} />
          </Demonstracao>
        </div>
        <Expansor key={pathname} rotulo="Conta" classe="conta">
          <div className="conta-conteudo">
            <p><strong>{usuario.nome}</strong><br /><small>{nomesDasFuncoes(usuario.funcoes)}</small></p>
            {usuario.funcoes.length > 1 && (
              <nav aria-label="Áreas da pessoa">
                {FUNCOES.filter((f) => usuario.funcoes.includes(f)).map((f) => (
                  <NavLink key={f} to={AREA_DA_FUNCAO[f]} end aria-current={false}>{ROTULO_AREA[f]}</NavLink>
                ))}
              </nav>
            )}
            <button className="secundario" onClick={() => protecao.sair(sair)}>Sair</button>
          </div>
        </Expansor>
      </div></header>
      <main id="conteudo" tabIndex={-1} className={`conteudo ${area === 'aluno' ? 'experiencia-aluno' : ''}`}>
        {pathname !== AREA_DA_FUNCAO[area] && (
          <nav className="caminho-pagina" aria-label="Caminho da página">
            <NavLink to={AREA_DA_FUNCAO[area]}>{ROTULO_AREA[area]}</NavLink>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{localizacao.titulo}</span>
          </nav>
        )}
        <Outlet />
      </main>
      <FocoDaPagina caminho={pathname} />
    </div>
  );
}
