import { Navigate, Route, Routes } from 'react-router-dom';
import type { Funcao } from '../dominio/tipos';
import { Catalogo } from '../telas/aluno/Catalogo';
import { Desempenho } from '../telas/aluno/Desempenho';
import { DetalheDisciplina } from '../telas/aluno/DetalheDisciplina';
import { Materiais } from '../telas/aluno/Materiais';
import { MinhasTurmas } from '../telas/aluno/MinhasTurmas';
import { Sessao } from '../telas/aluno/Sessao';
import { Trilha } from '../telas/aluno/Trilha';
import { CadastroGraduacoesDisciplinas, CadastroPeriodosTurmas, CadastrosCoordenacao } from '../telas/admin/Cadastros';
import { Pessoas, VisaoGeral, Vinculos } from '../telas/admin/Admin';
import { GestaoDaTurma, GestaoTurmas } from '../telas/coordenacao/Gestao';
import { PainelCoordenador } from '../telas/coordenacao/Painel';
import { EditorConteudo } from '../telas/professor/EditorConteudo';
import { DetalheAluno, ListaTurmas, PainelTurma } from '../telas/professor/Turmas';
import { PainelResponsavel } from '../telas/responsavel/Painel';
import { Entrada } from '../telas/Entrada';
import { Layout } from '../telas/Layout';
import { RotaProtegida } from './RotaProtegida';

function Area({ funcao, children }: { funcao: Funcao; children: React.ReactNode }) {
  return (
    <Route element={<RotaProtegida funcao={funcao} />}>
      <Route element={<Layout />}>{children}</Route>
    </Route>
  );
}

export function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<Entrada />} />
      {Area({
        funcao: 'aluno',
        children: (
          <>
            <Route path="/aluno" element={<MinhasTurmas />} />
            <Route path="/aluno/catalogo" element={<Catalogo />} />
            <Route path="/aluno/catalogo/disciplinas/:disciplinaId" element={<DetalheDisciplina />} />
            <Route path="/aluno/disciplinas/:disciplinaId/turmas/:turmaId" element={<Trilha />} />
            <Route path="/aluno/disciplinas/:disciplinaId/turmas/:turmaId/sessao" element={<Sessao />} />
            <Route path="/aluno/disciplinas/:disciplinaId/turmas/:turmaId/desempenho" element={<Desempenho />} />
            <Route path="/aluno/disciplinas/:disciplinaId/turmas/:turmaId/topicos/:topicoId" element={<Materiais />} />
            {/* URLs antigas de estudo por curso: não escolhem uma turma arbitrária. */}
            <Route path="/aluno/*" element={<Navigate to="/aluno" replace />} />
          </>
        ),
      })}
      {Area({
        funcao: 'professor',
        children: (
          <>
            <Route path="/professor" element={<ListaTurmas />} />
            <Route path="/professor/disciplinas/:disciplinaId/turmas/:turmaId" element={<PainelTurma />} />
            <Route path="/professor/disciplinas/:disciplinaId/turmas/:turmaId/alunos/:matriculaId" element={<DetalheAluno />} />
            <Route path="/professor/disciplinas/:disciplinaId/conteudo" element={<EditorConteudo />} />
            <Route path="/professor/*" element={<Navigate to="/professor" replace />} />
          </>
        ),
      })}
      {Area({
        funcao: 'coordenador',
        children: (
          <>
            <Route path="/coordenacao" element={<PainelCoordenador />} />
            <Route path="/coordenacao/gestao" element={<GestaoTurmas base="/coordenacao/gestao" />} />
            <Route path="/coordenacao/gestao/turmas/:turmaId" element={<GestaoDaTurma base="/coordenacao/gestao" />} />
            <Route path="/coordenacao/cadastros" element={<CadastrosCoordenacao />} />
            <Route path="/coordenacao/*" element={<Navigate to="/coordenacao" replace />} />
          </>
        ),
      })}
      {Area({
        funcao: 'admin',
        children: (
          <>
            <Route path="/admin" element={<VisaoGeral />} />
            <Route path="/admin/usuarios" element={<Pessoas />} />
            <Route path="/admin/vinculos" element={<Vinculos />} />
            <Route path="/admin/graduacoes" element={<CadastroGraduacoesDisciplinas />} />
            <Route path="/admin/periodos" element={<CadastroPeriodosTurmas />} />
            <Route path="/admin/gestao" element={<GestaoTurmas base="/admin/gestao" />} />
            <Route path="/admin/gestao/turmas/:turmaId" element={<GestaoDaTurma base="/admin/gestao" />} />
            <Route path="/admin/disciplinas/:disciplinaId/conteudo" element={<EditorConteudo />} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </>
        ),
      })}
      {Area({
        funcao: 'responsavel',
        children: (
          <>
            <Route path="/responsavel" element={<PainelResponsavel />} />
            <Route path="/responsavel/*" element={<Navigate to="/responsavel" replace />} />
          </>
        ),
      })}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
