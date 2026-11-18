import { Navigate, Outlet } from 'react-router-dom';
import type { Funcao } from '../dominio/tipos';
import { areaInicial } from './areas';
import { useApp } from './contexto';

/**
 * Sem sessão → entrada; sem a função da área → área inicial da própria pessoa. A decisão vem antes de
 * qualquer consulta: nenhum dado da área negada é carregado ou exibido.
 */
export function RotaProtegida({ funcao }: { funcao: Funcao }) {
  const { usuario } = useApp();
  if (!usuario) return <Navigate to="/" replace />;
  if (!usuario.funcoes.includes(funcao)) return <Navigate to={areaInicial(usuario.funcoes)} replace />;
  return <Outlet />;
}
