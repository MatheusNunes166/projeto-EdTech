import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProvedorApp } from './app/contexto';
import { Rotas } from './app/Rotas';
import './estilos.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorApp armazenamento={window.localStorage}>
      <BrowserRouter>
        <Rotas />
      </BrowserRouter>
    </ProvedorApp>
  </StrictMode>,
);
