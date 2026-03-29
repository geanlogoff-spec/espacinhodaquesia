import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Loading from './components/Loading';
import { AppProvider } from './context/AppContext';
import './index.css';

// Lazy loaded pages for performance enhancement
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sequencias = lazy(() => import('./pages/Sequencias'));
const Calendario = lazy(() => import('./pages/Calendario'));
const MinhasTarefas = lazy(() => import('./pages/MinhasTarefas'));
const Professores = lazy(() => import('./pages/Professores'));
const Arquivos = lazy(() => import('./pages/Arquivos'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const PortalPublico = lazy(() => import('./pages/PortalPublico'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Rota Privada: Somente Coordenadora */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="tarefas" element={<MinhasTarefas />} />
              <Route path="professores" element={<Professores />} />
              <Route path="sequencias" element={<Sequencias />} />
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
    </AppProvider>
  );
}

export default App;
