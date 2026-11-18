import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProvedorApp } from './app/contexto';
import { rotasDaAplicacao } from './app/rota-raiz';
import './estilos.css';

const router = createBrowserRouter(
  rotasDaAplicacao(),
  { basename: '/projeto-EdTech/' }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorApp armazenamento={window.localStorage}>
      <RouterProvider router={router} />
    </ProvedorApp>
  </StrictMode>,
);
