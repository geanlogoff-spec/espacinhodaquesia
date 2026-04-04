import React, { createContext, useState, useEffect } from 'react';

function useLocalState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialValue;
      }
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}


export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // State for Teachers
  // vinculos: [{ turmaId: string, disciplinas: string[] }]
  // registroAulas: { 'turmaId|disciplina': [{ data: 'YYYY-MM-DD', observacao: '' }] }
  // ⚠️ MOCKUP DATA — Remover em produção
  const [professores, setProfessores] = useLocalState('portal_professores', [
    {
      id: 1, nome: 'João Silva', telefone: '(63) 98888-7777',
      escolaId: '9001', vinculos: [
        { turmaId: '5001', disciplinas: ['Matemática'] },
        { turmaId: '5002', disciplinas: ['Matemática', 'Ciências'] }
      ],
      registroAulas: {
        '5001|Matemática': [
          { data: '2026-02-10', observacao: 'Aula inaugural' },
          { data: '2026-02-12', observacao: '' },
          { data: '2026-02-17', observacao: '' },
          { data: '2026-02-19', observacao: 'Revisão números inteiros' },
          { data: '2026-02-24', observacao: '' },
          { data: '2026-03-03', observacao: '' },
          { data: '2026-03-05', observacao: '' },
          { data: '2026-03-10', observacao: 'Prova 1ª unidade' },
          { data: '2026-03-12', observacao: '' },
          { data: '2026-03-17', observacao: '' },
        ],
        '5002|Matemática': [
          { data: '2026-02-11', observacao: '' },
          { data: '2026-02-13', observacao: '' },
          { data: '2026-02-18', observacao: '' },
          { data: '2026-02-25', observacao: '' },
          { data: '2026-03-04', observacao: '' },
          { data: '2026-03-11', observacao: '' },
          { data: '2026-03-18', observacao: '' },
        ],
        '5002|Ciências': [
          { data: '2026-02-14', observacao: 'Introdução ao método científico' },
          { data: '2026-02-21', observacao: '' },
          { data: '2026-02-28', observacao: '' },
          { data: '2026-03-07', observacao: 'Experimento no lab' },
          { data: '2026-03-14', observacao: '' },
        ]
      }
    },
    {
      id: 2, nome: 'Maria Cecília Oliveira', telefone: '(63) 99912-3456',
      escolaId: '9001', vinculos: [
        { turmaId: '5001', disciplinas: ['Língua Portuguesa'] },
        { turmaId: '5003', disciplinas: ['Língua Portuguesa', 'Arte'] }
      ],
      registroAulas: {
        '5001|Língua Portuguesa': [
          { data: '2026-02-10', observacao: '' },
          { data: '2026-02-12', observacao: '' },
          { data: '2026-02-17', observacao: '' },
          { data: '2026-02-19', observacao: '' },
          { data: '2026-02-24', observacao: 'Produção de texto' },
          { data: '2026-03-03', observacao: '' },
          { data: '2026-03-05', observacao: '' },
          { data: '2026-03-10', observacao: '' },
        ],
        '5003|Língua Portuguesa': [
          { data: '2026-02-11', observacao: '' },
          { data: '2026-02-13', observacao: '' },
          { data: '2026-02-18', observacao: '' },
          { data: '2026-02-25', observacao: '' },
          { data: '2026-03-04', observacao: '' },
          { data: '2026-03-11', observacao: '' },
        ],
        '5003|Arte': [
          { data: '2026-02-14', observacao: 'Desenho livre' },
          { data: '2026-02-28', observacao: '' },
          { data: '2026-03-14', observacao: 'Pintura em tela' },
        ]
      }
    },
    {
      id: 3, nome: 'Carlos Andrade', telefone: '(63) 98765-4321',
      escolaId: '9001', vinculos: [
        { turmaId: '5002', disciplinas: ['Geografia', 'História'] },
        { turmaId: '5004', disciplinas: ['Geografia'] }
      ],
      registroAulas: {
        '5002|Geografia': [
          { data: '2026-02-11', observacao: '' },
          { data: '2026-02-18', observacao: '' },
          { data: '2026-03-04', observacao: '' },
        ],
        '5002|História': [
          { data: '2026-02-13', observacao: '' },
          { data: '2026-02-20', observacao: '' },
        ],
        '5004|Geografia': [
          { data: '2026-02-14', observacao: '' },
          { data: '2026-02-21', observacao: '' },
          { data: '2026-03-07', observacao: '' },
        ]
      }
    },
    {
      id: 4, nome: 'Beatriz Santos Lima', telefone: '',
      escolaId: '9001', vinculos: [
        { turmaId: '5003', disciplinas: ['História'] },
        { turmaId: '5004', disciplinas: ['História', 'Ensino Religioso'] }
      ],
      registroAulas: {
        '5003|História': [
          { data: '2026-02-12', observacao: '' },
          { data: '2026-02-19', observacao: '' },
          { data: '2026-02-26', observacao: '' },
          { data: '2026-03-05', observacao: '' },
          { data: '2026-03-12', observacao: '' },
        ],
        '5004|História': [
          { data: '2026-02-13', observacao: '' },
          { data: '2026-02-20', observacao: '' },
          { data: '2026-02-27', observacao: '' },
        ],
        '5004|Ensino Religioso': [
          { data: '2026-02-14', observacao: '' },
          { data: '2026-03-14', observacao: '' },
        ]
      }
    },
    {
      id: 5, nome: 'Fernanda Costa', telefone: '(63) 99200-1122',
      escolaId: '9002', vinculos: [
        { turmaId: '5005', disciplinas: ['Língua Portuguesa', 'Arte'] },
        { turmaId: '5006', disciplinas: ['Língua Portuguesa'] }
      ],
      registroAulas: {
        '5005|Língua Portuguesa': [
          { data: '2026-02-10', observacao: '' },
          { data: '2026-02-12', observacao: '' },
          { data: '2026-02-17', observacao: '' },
          { data: '2026-02-19', observacao: '' },
          { data: '2026-02-24', observacao: '' },
          { data: '2026-03-03', observacao: '' },
        ],
        '5005|Arte': [
          { data: '2026-02-14', observacao: '' },
          { data: '2026-02-28', observacao: '' },
        ],
        '5006|Língua Portuguesa': [
          { data: '2026-02-11', observacao: '' },
          { data: '2026-02-13', observacao: '' },
          { data: '2026-02-18', observacao: '' },
          { data: '2026-02-25', observacao: '' },
        ]
      }
    },
    {
      id: 6, nome: 'Ricardo Mendes', telefone: '(63) 98100-5566',
      escolaId: '9002', vinculos: [
        { turmaId: '5005', disciplinas: ['Matemática', 'Ciências'] },
        { turmaId: '5006', disciplinas: ['Matemática'] }
      ],
      registroAulas: {
        '5005|Matemática': [
          { data: '2026-02-10', observacao: '' },
          { data: '2026-02-17', observacao: '' },
          { data: '2026-02-24', observacao: '' },
          { data: '2026-03-03', observacao: '' },
          { data: '2026-03-10', observacao: '' },
        ],
        '5005|Ciências': [
          { data: '2026-02-12', observacao: '' },
          { data: '2026-02-19', observacao: '' },
          { data: '2026-02-26', observacao: '' },
        ],
        '5006|Matemática': [
          { data: '2026-02-11', observacao: '' },
          { data: '2026-02-18', observacao: '' },
          { data: '2026-02-25', observacao: '' },
        ]
      }
    },
    {
      id: 7, nome: 'Ana Paula Ribeiro', telefone: '',
      escolaId: '9001', vinculos: [
        { turmaId: '5001', disciplinas: ['Inglês'] },
        { turmaId: '5002', disciplinas: ['Inglês'] },
        { turmaId: '5003', disciplinas: ['Inglês', 'Espanhol'] },
        { turmaId: '5004', disciplinas: ['Inglês', 'Espanhol'] }
      ],
      registroAulas: {
        '5001|Inglês': [{ data: '2026-02-14', observacao: '' }, { data: '2026-02-28', observacao: '' }, { data: '2026-03-14', observacao: '' }],
        '5002|Inglês': [{ data: '2026-02-14', observacao: '' }, { data: '2026-02-28', observacao: '' }],
        '5003|Inglês': [{ data: '2026-02-14', observacao: '' }, { data: '2026-02-28', observacao: '' }],
        '5003|Espanhol': [{ data: '2026-02-21', observacao: '' }],
        '5004|Inglês': [{ data: '2026-02-14', observacao: '' }],
        '5004|Espanhol': [{ data: '2026-02-21', observacao: '' }]
      }
    },
    {
      id: 8, nome: 'Marcos Vinícius Souza', telefone: '(63) 99333-4455',
      escolaId: '9001', vinculos: [
        { turmaId: '5001', disciplinas: ['Educação Física'] },
        { turmaId: '5002', disciplinas: ['Educação Física'] },
        { turmaId: '5003', disciplinas: ['Educação Física'] },
        { turmaId: '5004', disciplinas: ['Educação Física'] }
      ],
      registroAulas: {
        '5001|Educação Física': [{ data: '2026-02-11', observacao: '' }, { data: '2026-02-18', observacao: '' }, { data: '2026-02-25', observacao: '' }, { data: '2026-03-04', observacao: '' }],
        '5002|Educação Física': [{ data: '2026-02-12', observacao: '' }, { data: '2026-02-19', observacao: '' }, { data: '2026-02-26', observacao: '' }],
        '5003|Educação Física': [{ data: '2026-02-13', observacao: '' }, { data: '2026-02-20', observacao: '' }, { data: '2026-02-27', observacao: '' }],
        '5004|Educação Física': [{ data: '2026-02-14', observacao: '' }, { data: '2026-02-21', observacao: '' }]
      }
    }
  ]);

  // State for Sequence Deliveries
  // statusVinculos: { 'profId|turmaId|disciplina': 'entregue'|'pendente' }
  // statusProfessores is kept for backward compat (auto-derived in views)
  // ⚠️ MOCKUP DATA — Remover em produção
  const [entregas, setEntregas] = useLocalState('portal_entregas', [
    {
      id: 101,
      titulo: 'Sequência Quinzenal de Março',
      tipo: 'Quinzenal',
      execucaoInicio: '2026-03-16',
      execucaoFim: '2026-03-27',
      prazo: '2026-03-28',
      statusVinculos: {
        '1|5001|Matemática': 'entregue',
        '1|5002|Matemática': 'entregue',
        '1|5002|Ciências': 'entregue',
        '2|5001|Língua Portuguesa': 'entregue',
        '2|5003|Língua Portuguesa': 'entregue',
        '2|5003|Arte': 'pendente',
        '3|5002|Geografia': 'pendente',
        '3|5002|História': 'pendente',
        '3|5004|Geografia': 'pendente',
        '4|5003|História': 'entregue',
        '4|5004|História': 'entregue',
        '4|5004|Ensino Religioso': 'entregue',
        '5|5005|Língua Portuguesa': 'pendente',
        '5|5005|Arte': 'pendente',
        '5|5006|Língua Portuguesa': 'pendente',
        '6|5005|Matemática': 'entregue',
        '6|5005|Ciências': 'entregue',
        '6|5006|Matemática': 'entregue',
        '7|5001|Inglês': 'pendente',
        '7|5002|Inglês': 'pendente',
        '7|5003|Inglês': 'pendente',
        '7|5003|Espanhol': 'pendente',
        '7|5004|Inglês': 'pendente',
        '7|5004|Espanhol': 'pendente',
        '8|5001|Educação Física': 'entregue',
        '8|5002|Educação Física': 'entregue',
        '8|5003|Educação Física': 'entregue',
        '8|5004|Educação Física': 'entregue'
      }
    },
    {
      id: 102,
      titulo: 'Sequência Mensal de Abril',
      tipo: 'Mensal',
      execucaoInicio: '2026-04-01',
      execucaoFim: '2026-04-30',
      prazo: '2026-04-25',
      statusVinculos: {
        '1|5001|Matemática': 'pendente',
        '1|5002|Matemática': 'pendente',
        '1|5002|Ciências': 'pendente',
        '2|5001|Língua Portuguesa': 'pendente',
        '2|5003|Língua Portuguesa': 'pendente',
        '2|5003|Arte': 'pendente',
        '3|5002|Geografia': 'pendente',
        '3|5002|História': 'pendente',
        '3|5004|Geografia': 'pendente',
        '4|5003|História': 'pendente',
        '4|5004|História': 'pendente',
        '4|5004|Ensino Religioso': 'pendente',
        '5|5005|Língua Portuguesa': 'pendente',
        '5|5005|Arte': 'pendente',
        '5|5006|Língua Portuguesa': 'pendente',
        '6|5005|Matemática': 'pendente',
        '6|5005|Ciências': 'pendente',
        '6|5006|Matemática': 'pendente',
        '7|5001|Inglês': 'pendente',
        '7|5002|Inglês': 'pendente',
        '7|5003|Inglês': 'pendente',
        '7|5003|Espanhol': 'pendente',
        '7|5004|Inglês': 'pendente',
        '7|5004|Espanhol': 'pendente',
        '8|5001|Educação Física': 'pendente',
        '8|5002|Educação Física': 'pendente',
        '8|5003|Educação Física': 'pendente',
        '8|5004|Educação Física': 'pendente'
      }
    }
  ]);

  // State for Calendar Events
  // ⚠️ MOCKUP DATA — Remover em produção
  const [eventos, setEventos] = useLocalState('portal_eventos', [
    { id: 1001, titulo: 'Reunião de Pais e Mestres', data: new Date().toISOString().split('T')[0], tipo: 'Reuniões' },
    { id: 1002, titulo: 'Festa Literária (Projeto)', data: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], tipo: 'Eventos' },
    { id: 1003, titulo: 'Entrega de Ocorrências', data: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0], tipo: 'Atividades Escolares' },
    { id: 1004, titulo: 'Dedetização da Escola', data: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0], tipo: 'Outros' },
    { id: 1005, titulo: 'Conselho de Classe - 1º Bimestre', data: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString().split('T')[0], tipo: 'Reuniões' },
    { id: 1006, titulo: 'Feira de Ciências', data: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString().split('T')[0], tipo: 'Eventos' }
  ]);

  // State for Escolas
  // ⚠️ MOCKUP DATA — Remover em produção
  const [escolas, setEscolas] = useLocalState('portal_escolas', [
    { id: '9001', nome: 'Escola Municipal São José', endereco: 'Rua das Mangueiras, 450 - Centro', telefone: '(63) 3312-1234', email: 'saojose@edu.gov.br', diretor: 'Mariana Ferreira' },
    { id: '9002', nome: 'Escola Municipal Castro Alves', endereco: 'Av. Brasil, 1200 - Setor Norte', telefone: '(63) 3312-5678', email: 'castroalves@edu.gov.br', diretor: 'Roberto Nascimento' }
  ]);

  // State for Turmas
  // ⚠️ MOCKUP DATA — Remover em produção
  const [turmas, setTurmas] = useLocalState('portal_turmas', [
    // Escola São José (9001)
    {
      id: '5001', nome: '6º Ano A', turno: 'Manhã', anoLetivo: '2026', escolaId: '9001',
      disciplinas: [
        { nome: 'Língua Portuguesa', cargaHoraria: '200' },
        { nome: 'Matemática', cargaHoraria: '200' },
        { nome: 'Ciências', cargaHoraria: '120' },
        { nome: 'Geografia', cargaHoraria: '120' },
        { nome: 'História', cargaHoraria: '120' },
        { nome: 'Arte', cargaHoraria: '80' },
        { nome: 'Educação Física', cargaHoraria: '80' },
        { nome: 'Inglês', cargaHoraria: '80' },
        { nome: 'Ensino Religioso', cargaHoraria: '40' }
      ]
    },
    {
      id: '5002', nome: '6º Ano B', turno: 'Tarde', anoLetivo: '2026', escolaId: '9001',
      disciplinas: [
        { nome: 'Língua Portuguesa', cargaHoraria: '200' },
        { nome: 'Matemática', cargaHoraria: '200' },
        { nome: 'Ciências', cargaHoraria: '120' },
        { nome: 'Geografia', cargaHoraria: '120' },
        { nome: 'História', cargaHoraria: '120' },
        { nome: 'Arte', cargaHoraria: '80' },
        { nome: 'Educação Física', cargaHoraria: '80' },
        { nome: 'Inglês', cargaHoraria: '80' },
        { nome: 'Ensino Religioso', cargaHoraria: '40' }
      ]
    },
    {
      id: '5003', nome: '7º Ano A', turno: 'Manhã', anoLetivo: '2026', escolaId: '9001',
      disciplinas: [
        { nome: 'Língua Portuguesa', cargaHoraria: '200' },
        { nome: 'Matemática', cargaHoraria: '200' },
        { nome: 'Ciências', cargaHoraria: '120' },
        { nome: 'Geografia', cargaHoraria: '120' },
        { nome: 'História', cargaHoraria: '120' },
        { nome: 'Arte', cargaHoraria: '80' },
        { nome: 'Educação Física', cargaHoraria: '80' },
        { nome: 'Inglês', cargaHoraria: '80' },
        { nome: 'Espanhol', cargaHoraria: '80' },
        { nome: 'Ensino Religioso', cargaHoraria: '40' }
      ]
    },
    {
      id: '5004', nome: '8º Ano A', turno: 'Manhã', anoLetivo: '2026', escolaId: '9001',
      disciplinas: [
        { nome: 'Língua Portuguesa', cargaHoraria: '200' },
        { nome: 'Matemática', cargaHoraria: '200' },
        { nome: 'Ciências', cargaHoraria: '120' },
        { nome: 'Geografia', cargaHoraria: '120' },
        { nome: 'História', cargaHoraria: '120' },
        { nome: 'Arte', cargaHoraria: '80' },
        { nome: 'Educação Física', cargaHoraria: '80' },
        { nome: 'Inglês', cargaHoraria: '80' },
        { nome: 'Espanhol', cargaHoraria: '80' },
        { nome: 'Ensino Religioso', cargaHoraria: '40' }
      ]
    },
    // Escola Castro Alves (9002)
    {
      id: '5005', nome: '5º Ano A', turno: 'Manhã', anoLetivo: '2026', escolaId: '9002',
      disciplinas: [
        { nome: 'Língua Portuguesa', cargaHoraria: '200' },
        { nome: 'Matemática', cargaHoraria: '200' },
        { nome: 'Ciências', cargaHoraria: '120' },
        { nome: 'Geografia', cargaHoraria: '100' },
        { nome: 'História', cargaHoraria: '100' },
        { nome: 'Arte', cargaHoraria: '80' },
        { nome: 'Educação Física', cargaHoraria: '80' },
        { nome: 'Inglês', cargaHoraria: '40' },
        { nome: 'Ensino Religioso', cargaHoraria: '40' }
      ]
    },
    {
      id: '5006', nome: '5º Ano B', turno: 'Tarde', anoLetivo: '2026', escolaId: '9002',
      disciplinas: [
        { nome: 'Língua Portuguesa', cargaHoraria: '200' },
        { nome: 'Matemática', cargaHoraria: '200' },
        { nome: 'Ciências', cargaHoraria: '120' },
        { nome: 'Geografia', cargaHoraria: '100' },
        { nome: 'História', cargaHoraria: '100' },
        { nome: 'Arte', cargaHoraria: '80' },
        { nome: 'Educação Física', cargaHoraria: '80' },
        { nome: 'Inglês', cargaHoraria: '40' },
        { nome: 'Ensino Religioso', cargaHoraria: '40' }
      ]
    }
  ]);

  /* ==================================
     Methods for Escolas
     ================================== */
  const handleAddEscola = (newEscola) => {
    setEscolas(prev => [...prev, { ...newEscola, id: Date.now() }]);
  };

  const handleEditEscola = (id, updatedData) => {
    setEscolas(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e));
  };

  const handleRemoverEscola = (id) => {
    setEscolas(prev => prev.filter(e => e.id !== id));
  };

  /* ==================================
     Methods for Turmas
     ================================== */
  const handleAddTurma = (newTurma) => {
    setTurmas(prev => [...prev, { ...newTurma, id: Date.now() }]);
  };

  const handleEditTurma = (id, updatedData) => {
    setTurmas(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };

  const handleRemoverTurma = (id) => {
    setTurmas(prev => prev.filter(t => t.id !== id));
  };

  /* ==================================
     Methods for Professores
     ================================== */
  const handleAddProf = (newProf) => {
    const profId = Date.now();
    setProfessores(prev => [...prev, {
      id: profId,
      nome: newProf.nome,
      telefone: newProf.telefone || '',
      escolaId: newProf.escolaId || '',
      vinculos: newProf.vinculos || [],
      registroAulas: {}
    }]);

    // Automatically add this teacher's vinculos as 'pendente' to all active deliveries
    setEntregas(prev => prev.map(entrega => {
      const newSv = { ...(entrega.statusVinculos || {}) };
      (newProf.vinculos || []).forEach(v => {
        v.disciplinas.forEach(disc => {
          newSv[`${profId}|${v.turmaId}|${disc}`] = 'pendente';
        });
      });
      return { ...entrega, statusVinculos: newSv };
    }));
  };

  const handleEditProf = (id, updatedData) => {
    setProfessores(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  // Register a lesson for a specific turma|disciplina pair
  const handleRegistrarAula = (profId, chave, aulaData) => {
    setProfessores(prev => prev.map(p => {
      if (p.id !== profId) return p;
      const registros = p.registroAulas || {};
      const existing = registros[chave] || [];
      return {
        ...p,
        registroAulas: {
          ...registros,
          [chave]: [...existing, { data: aulaData.data, observacao: aulaData.observacao || '' }]
        }
      };
    }));
  };

  // Remove a lesson record by index
  const handleRemoverAula = (profId, chave, index) => {
    setProfessores(prev => prev.map(p => {
      if (p.id !== profId) return p;
      const registros = p.registroAulas || {};
      const existing = registros[chave] || [];
      return {
        ...p,
        registroAulas: {
          ...registros,
          [chave]: existing.filter((_, i) => i !== index)
        }
      };
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
    // Populate the newly created delivery with all per-vinculo statuses as 'pendente'
    const statusVinculosInicial = {};
    professores.forEach(p => {
      (p.vinculos || []).forEach(v => {
        v.disciplinas.forEach(disc => {
          statusVinculosInicial[`${p.id}|${v.turmaId}|${disc}`] = 'pendente';
        });
      });
    });

    setEntregas(prev => [
      {
        id: Date.now(),
        titulo: newEntrega.titulo,
        tipo: newEntrega.tipo,
        execucaoInicio: newEntrega.execucaoInicio || '',
        execucaoFim: newEntrega.execucaoFim || '',
        prazo: newEntrega.prazo,
        statusVinculos: statusVinculosInicial
      },
      ...prev
    ]);
  };

  // Toggle granular per vinculo (profId|turmaId|disciplina)
  const toggleStatusVinculo = (entregaId, chave) => {
    setEntregas(prev => prev.map(entrega => {
      if (entrega.id === entregaId) {
        const sv = entrega.statusVinculos || {};
        const statusAtual = sv[chave];
        const novoStatus = statusAtual === 'entregue' ? 'pendente' : 'entregue';
        return {
          ...entrega,
          statusVinculos: {
            ...sv,
            [chave]: novoStatus
          }
        };
      }
      return entrega;
    }));
  };

  // Legacy toggle (kept for backward compat) — toggles ALL vinculos of that professor
  const toggleStatusProfessor = (entregaId, profId) => {
    setEntregas(prev => prev.map(entrega => {
      if (entrega.id === entregaId) {
        const sv = entrega.statusVinculos || {};
        // Check if ALL vinculos of this prof are 'entregue'
        const profKeys = Object.keys(sv).filter(k => k.startsWith(`${profId}|`));
        const allEntregue = profKeys.every(k => sv[k] === 'entregue');
        const novoStatus = allEntregue ? 'pendente' : 'entregue';
        const newSv = { ...sv };
        profKeys.forEach(k => { newSv[k] = novoStatus; });
        return { ...entrega, statusVinculos: newSv };
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
  const [tarefas, setTarefas] = useLocalState('portal_tarefas', [
    { id: 111, text: 'Corrigir provas de matemática (2º Ano A)', completed: true, priority: 'alta', data: '' },
    { id: 222, text: 'Preparar reunião pedagógica (Sexta)', completed: false, priority: 'alta', data: '' },
    { id: 333, text: 'Revisar sequências de História', completed: false, priority: 'media', data: '' }
  ]);
  
  const [notas, setNotas] = useLocalState('portal_notas', [
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
  const [arquivos, setArquivos] = useLocalState('portal_arquivos', [
    { id: 1, nome: 'Modelo Oficial de Prova 2024', data: '2024-04-10', tamanho: 'Link Google Drive', link: '#' },
    { id: 2, nome: 'Planilha de Conselho de Classe', data: '2024-04-08', tamanho: 'Link OneDrive', link: '#' },
    { id: 3, nome: 'Capa Institucional Bimestral', data: '2024-01-01', tamanho: 'Link Canva', link: '#' }
  ]);

  const handleAddArquivo = (newArquivo) => setArquivos(prev => [{ ...newArquivo, id: Date.now() }, ...prev]);
  const handleRemoverArquivo = (id) => setArquivos(prev => prev.filter(a => a.id !== id));

  /* ==================================
     Methods for User & Branding
     ================================== */
  const [perfil, setPerfil] = useLocalState('portal_perfil', {
    nome: 'Quesia',
    cargo: 'Coordenadora',
    tituloDaPlataforma: 'Espacinho da',
    emoji: '👸'
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
      handleEditProf,
      handleRegistrarAula,
      handleRemoverAula,
      handleRemoverProf,
      entregas,
      handleAddEntrega,
      toggleStatusProfessor,
      toggleStatusVinculo,
      handleRemoverEntrega,
      escolas,
      handleAddEscola,
      handleEditEscola,
      handleRemoverEscola,
      turmas,
      handleAddTurma,
      handleEditTurma,
      handleRemoverTurma,
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
      isProfileModalOpen,
      setIsProfileModalOpen,
      isLoggedIn,
      handleLogin,
      handleLogout
    }}>
      {children}
    </AppContext.Provider>
  );
};
