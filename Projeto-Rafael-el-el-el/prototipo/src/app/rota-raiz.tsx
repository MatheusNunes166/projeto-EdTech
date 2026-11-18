import { type ReactNode } from 'react';
import { type RouteObject } from 'react-router-dom';
import { Rotas } from './Rotas';

export function rotasDaAplicacao(sonda?: ReactNode): RouteObject[] {
  return [{ path: '*', element: <><Rotas />{sonda}</> }];
}
