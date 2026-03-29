import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // State for Teachers
  const [professores, setProfessores] = useState([
    { id: 1, nome: 'João Silva', materia: 'Matemática', turmas: '6º ao 9º', turno: 'Integral', telefone: '(11) 98888-7777', cargaAnual: 200, aulasDadas: 160 },
    { id: 2, nome: 'Maria Cecília', materia: 'Português', turmas: '8ºA, 8ºB', turno: 'Manhã', telefone: '', cargaAnual: 180, aulasDadas: 175 },
    { id: 3, nome: 'Carlos Andrade', materia: 'Geografia', turmas: '5º, 6º', turno: 'Tarde', telefone: '', cargaAnual: 120, aulasDadas: 60 },
    { id: 4, nome: 'Beatriz Santos', materia: 'História', turmas: '7º', turno: 'Manhã', telefone: '', cargaAnual: 120, aulasDadas: 120 }
  ]);

  // State for Sequence Deliveries
  const [entregas, setEntregas] = useState([
    {
      id: 101,
      titulo: 'Sequência Quinzenal de Setembro',
      tipo: 'Quinzenal',
      prazo: '2024-09-30',
      statusProfessores: { 1: 'entregue', 2: 'pendente', 3: 'entregue', 4: 'pendente' }
    }
  ]);

  // State for Calendar Events
  const [eventos, setEventos] = useState([
    { id: 1001, titulo: 'Reunião de Pais e Mestres', data: new Date().toISOString().split('T')[0], tipo: 'Reuniões' },
    { id: 1002, titulo: 'Festa Literária (Projeto)', data: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], tipo: 'Eventos' },
    { id: 1003, titulo: 'Entrega de Ocorrências', data: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0], tipo: 'Atividades Escolares' },
    { id: 1004, titulo: 'Dedetização da Escola', data: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0], tipo: 'Outros' }
  ]);

  /* ==================================
     Methods for Professores
     ================================== */
  const handleAddProf = (newProf) => {
    const profId = Date.now();
    setProfessores(prev => [...prev, {
      id: profId,
      nome: newProf.nome,
      materia: newProf.materia,
      turmas: newProf.turmas,
      turno: newProf.turno,
      telefone: newProf.telefone,
      cargaAnual: parseInt(newProf.cargaAnual),
      aulasDadas: 0
    }]);

    // Automatically add this teacher as 'pendente' to all active deliveries
    setEntregas(prev => prev.map(entrega => ({
      ...entrega,
      statusProfessores: { ...entrega.statusProfessores, [profId]: 'pendente' }
    })));
  };

  const handleComputarAula = (id) => {
    setProfessores(prev => prev.map(p => {
      if (p.id === id && p.aulasDadas < p.cargaAnual) {
        return { ...p, aulasDadas: p.aulasDadas + 1 };
      }
      return p;
    }));
  };

  const handleRemoverProf = (id) => {
    setProfessores(prev => prev.filter(p => p.id !== id));
    // Optionally clean up the ID from deliveries
  };

  /* ==================================
     Methods for Sequencias (Entregas)
     ================================== */
  const handleAddEntrega = (newEntrega) => {
    // Populate the newly created delivery with all existing teachers as 'pendente'
    const statusInicial = {};
    professores.forEach(p => {
      statusInicial[p.id] = 'pendente';
    });

    setEntregas(prev => [
      {
        id: Date.now(),
        titulo: newEntrega.titulo,
        tipo: newEntrega.tipo,
        prazo: newEntrega.prazo,
        statusProfessores: statusInicial
      },
      ...prev
    ]);
  };

  const toggleStatusProfessor = (entregaId, profId) => {
    setEntregas(prev => prev.map(entrega => {
      if (entrega.id === entregaId) {
        const statusAtual = entrega.statusProfessores[profId];
        const novoStatus = statusAtual === 'entregue' ? 'pendente' : 'entregue';
        return {
          ...entrega,
          statusProfessores: {
            ...entrega.statusProfessores,
            [profId]: novoStatus
          }
        };
      }
      return entrega;
    }));
  };

  const handleRemoverEntrega = (entregaId) => {
    setEntregas(prev => prev.filter(e => e.id !== entregaId));
  };

  /* ==================================
     Methods for Eventos (Calendario)
     ================================== */
  const handleAddEvento = (newEvento) => {
    setEventos(prev => [...prev, {
      ...newEvento,
      id: Date.now()
    }]);
  };

  const handleRemoverEvento = (id) => {
    setEventos(prev => prev.filter(e => e.id !== id));
  };

  /* ==================================
     Methods for Minhas Tarefas (Tarefas & Notas)
     ================================== */
  const [tarefas, setTarefas] = useState([
    { id: 111, text: 'Corrigir provas de matemática (2º Ano A)', completed: true, priority: 'alta', data: '' },
    { id: 222, text: 'Preparar reunião pedagógica (Sexta)', completed: false, priority: 'alta', data: '' },
    { id: 333, text: 'Revisar sequências de História', completed: false, priority: 'media', data: '' }
  ]);
  
  const [notas, setNotas] = useState([
    { id: 111, text: 'Comprar materiais para aula de artes' }
  ]);

  const handleAddTarefa = (newTarefa) => {
    const tarefaComId = { ...newTarefa, id: Date.now() };
    setTarefas(prev => [...prev, tarefaComId]);
    
    // Se a tarefa possuir data salva como "Evento Calendário" também!
    if (newTarefa.data) {
       handleAddEvento({
           titulo: newTarefa.text,
           data: newTarefa.data,
           tipo: 'Tarefas'
       });
    }
  };

  const toggleTarefa = (id) => {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleRemoverTarefa = (id) => {
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  const handleAddNota = (text) => {
    setNotas(prev => [...prev, { id: Date.now(), text }]);
  };

  const handleRemoverNota = (id) => {
    setNotas(prev => prev.filter(n => n.id !== id));
  };


  /* ==================================
     Methods for Arquivos & Nuvem
     ================================== */
  const [arquivos, setArquivos] = useState([
    { id: 1, nome: 'Modelo Oficial de Prova 2024', data: '2024-04-10', tamanho: 'Link Google Drive', link: '#' },
    { id: 2, nome: 'Planilha de Conselho de Classe', data: '2024-04-08', tamanho: 'Link OneDrive', link: '#' },
    { id: 3, nome: 'Capa Institucional Bimestral', data: '2024-01-01', tamanho: 'Link Canva', link: '#' }
  ]);

  const handleAddArquivo = (newArquivo) => setArquivos(prev => [{ ...newArquivo, id: Date.now() }, ...prev]);
  const handleRemoverArquivo = (id) => setArquivos(prev => prev.filter(a => a.id !== id));

  /* ==================================
     Methods for User & Branding
     ================================== */
  const [perfil, setPerfil] = useState({
    nome: 'Quesia',
    cargo: 'Coordenadora',
    tituloDaPlataforma: 'Espacinho da',
    emoji: '👸'
  });

  const handleAtualizarPerfil = (novoPerfil) => {
    setPerfil(prev => ({ ...prev, ...novoPerfil }));
  };

  /* ==================================
     Auth & Security Mock
     ================================== */
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (email, password) => {
    // Simulador: Sucesso instantâneo (será ligado ao banco Supabase futuramente)
    setIsLoggedIn(true);
    return true; // Retorna true para a UI saber que logou
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AppContext.Provider value={{
      professores,
      handleAddProf,
      handleComputarAula,
      handleRemoverProf,
      entregas,
      handleAddEntrega,
      toggleStatusProfessor,
      handleRemoverEntrega,
      eventos,
      handleAddEvento,
      handleRemoverEvento,
      tarefas,
      handleAddTarefa,
      toggleTarefa,
      handleRemoverTarefa,
      notas,
      handleAddNota,
      handleRemoverNota,
      arquivos,
      handleAddArquivo,
      handleRemoverArquivo,
      perfil,
      handleAtualizarPerfil,
      isLoggedIn,
      handleLogin,
      handleLogout
    }}>
      {children}
    </AppContext.Provider>
  );
};
