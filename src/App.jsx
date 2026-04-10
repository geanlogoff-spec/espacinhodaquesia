import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Lazy loaded pages for performance enhancement
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calendario = lazy(() => import('./pages/Calendario'));
const MinhasTarefas = lazy(() => import('./pages/MinhasTarefas'));
const Arquivos = lazy(() => import('./pages/Arquivos'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const PortalPublico = lazy(() => import('./pages/PortalPublico'));
const Login = lazy(() => import('./pages/Login'));

// Subpages — Escola
const EscolaCadastro = lazy(() => import('./pages/EscolaCadastro'));
const TurmasCadastro = lazy(() => import('./pages/TurmasCadastro'));

// Subpages — Professores
const ProfessoresCadastro = lazy(() => import('./pages/ProfessoresCadastro'));
const ProfessoresContagem = lazy(() => import('./pages/ProfessoresContagem'));

// Subpages — Sequências
const SequenciasCadastro = lazy(() => import('./pages/SequenciasCadastro'));
const SequenciasAcompanhamento = lazy(() => import('./pages/SequenciasAcompanhamento'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Rota Privada: Somente Coordenadora */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="tarefas" element={<MinhasTarefas />} />
              
              {/* Escola — Submenus */}
              <Route path="escola" element={<Navigate to="/escola/cadastro" replace />} />
              <Route path="escola/cadastro" element={<EscolaCadastro />} />
              <Route path="escola/turmas" element={<TurmasCadastro />} />
              
              {/* Professores — Submenus */}
              <Route path="professores" element={<Navigate to="/professores/cadastro" replace />} />
              <Route path="professores/cadastro" element={<ProfessoresCadastro />} />
              <Route path="professores/contagem" element={<ProfessoresContagem />} />
              
              {/* Sequências — Submenus */}
              <Route path="sequencias" element={<Navigate to="/sequencias/cadastro" replace />} />
              <Route path="sequencias/cadastro" element={<SequenciasCadastro />} />
              <Route path="sequencias/acompanhamento" element={<SequenciasAcompanhamento />} />
              
              <Route path="calendario" element={<Calendario />} />
              <Route path="arquivos" element={<Arquivos />} />
              <Route path="relatorios" element={<Relatorios />} />
            </Route>

            {/* Rota de Acesso à Gestão */}
            <Route path="/login" element={<Login />} />

            {/* Rota Pública: Professores pelo Celular */}
            <Route path="/portal" element={<PortalPublico />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
