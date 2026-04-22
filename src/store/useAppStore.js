import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { validateEscola, validateProfessor, validateArquivo, validateEntrega, sanitize } from '../lib/validation';


// Helper: Transform relational DB data into the flat format the UI expects for professors
// DB: professores + professor_vinculos + turma_disciplinas + registro_aulas
// UI: { id, nome, telefone, escolaId, vinculos: [{turmaId, disciplinas}], registroAulas: {'turmaId|disc': [{data, obs}]} }
function buildProfessorFlat(prof, vinculos, registroAulas) {
  // Group vinculos by turma
  const turmaMap = {};
  const vinculoIdToKey = {};
  (vinculos || []).forEach(v => {
    const turmaId = v.turma_disciplinas?.turma_id;
    const discNome = v.turma_disciplinas?.nome;
    if (!turmaId || !discNome) return;
    if (!turmaMap[turmaId]) turmaMap[turmaId] = [];
    turmaMap[turmaId].push(discNome);
    vinculoIdToKey[v.id] = `${turmaId}|${discNome}`;
  });

  const vinculosFlat = Object.entries(turmaMap).map(([turmaId, disciplinas]) => ({
    turmaId,
    disciplinas
  }));

  // Build registroAulas map
  const registroMap = {};
  (registroAulas || []).forEach(ra => {
    const key = vinculoIdToKey[ra.vinculo_id];
    if (!key) return;
    if (!registroMap[key]) registroMap[key] = [];
    registroMap[key].push({ data: ra.data, observacao: ra.observacao || '', id: ra.id });
  });

  return {
    id: prof.id,
    nome: prof.nome,
    telefone: prof.telefone || '',
    dataAniversario: prof.data_aniversario || '',
    escolaId: prof.escola_id || '',
    vinculos: vinculosFlat,
    registroAulas: registroMap,
    // Keep raw vinculo data for Supabase operations
    _vinculos: vinculos || []
  };
}

// Helper: Transform entregas + entrega_status into flat format
// DB: entregas + entrega_status (per vinculo_id)
// UI: { id, titulo, tipo, execucaoInicio, execucaoFim, prazo, statusVinculos: {'profId|turmaId|disc': { status, dataExecucao, executada }} }
function buildEntregaFlat(entrega, statusList, allVinculos) {
  const statusVinculos = {};
  (statusList || []).forEach(es => {
    // Find the vinculo to build the key
    const vinculo = allVinculos.find(v => v.id === es.vinculo_id);
    if (!vinculo) return;
    const profId = vinculo.professor_id;
    const turmaId = vinculo.turma_disciplinas?.turma_id;
    const discNome = vinculo.turma_disciplinas?.nome;
    if (!profId || !turmaId || !discNome) return;
    statusVinculos[`${profId}|${turmaId}|${discNome}`] = {
      status: es.status,
      dataExecucao: es.data_execucao || null,
      executada: es.executada || false
    };
  });

  return {
    id: entrega.id,
    titulo: entrega.titulo,
    tipo: entrega.tipo,
    execucaoInicio: entrega.execucao_inicio || '',
    execucaoFim: entrega.execucao_fim || '',
    prazo: entrega.prazo,
    statusVinculos
  };
}


export const useAppStore = create((set, get) => ({
  // ============================================================
  // STATE
  // ============================================================
  professores: [],
  entregas: [],
  escolas: [],
  turmas: [],
  eventos: [],
  tarefas: [],
  notas: [],
  arquivos: [],
  perfil: {
    nome: '',
    cargo: 'Coordenadora',
    tituloDaPlataforma: 'Espacinho da',
    emoji: '👸'
  },
  isLoggedIn: false,
  isProfileModalOpen: false,
  loading: true,
  error: null,
  user: null,

  // Raw vinculo data for Supabase operations (not consumed by UI directly)
  _allVinculos: [],

  // ============================================================
  // AUTH ACTIONS
  // ============================================================
  handleLogin: async (email, password) => {
    if (!supabase) throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    set({ isLoggedIn: true, user: data.user });
    await get().fetchAll();
    return true;
  },

  handleLogout: async () => {
    if (supabase) await supabase.auth.signOut();
    set({
      isLoggedIn: false,
      user: null,
      professores: [],
      entregas: [],
      escolas: [],
      turmas: [],
      eventos: [],
      tarefas: [],
      notas: [],
      arquivos: [],
      perfil: { nome: '', cargo: 'Coordenadora', tituloDaPlataforma: 'Espacinho da', emoji: '👸' },
      _allVinculos: []
    });
  },

  // Initialize auth state from existing session
  initAuth: async () => {
    if (!supabase) {
      set({ loading: false });
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({ isLoggedIn: true, user: session.user });
      await get().fetchAll();
    }
    set({ loading: false });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({ isLoggedIn: true, user: session.user });
      } else if (event === 'SIGNED_OUT') {
        set({ isLoggedIn: false, user: null });
      }
    });
  },

  // ============================================================
  // FETCH ALL DATA
  // ============================================================
  fetchAll: async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Fetch all data in parallel
      const [
        profileRes,
        escolasRes,
        turmasRes,
        turmaDiscRes,
        professoresRes,
        vinculosRes,
        registroAulasRes,
        entregasRes,
        entregaStatusRes,
        eventosRes,
        tarefasRes,
        notasRes,
        arquivosRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('escolas').select('*').order('created_at'),
        supabase.from('turmas').select('*').order('nome'),
        supabase.from('turma_disciplinas').select('*'),
        supabase.from('professores').select('*').order('nome'),
        supabase.from('professor_vinculos').select('*, turma_disciplinas(*)'),
        supabase.from('registro_aulas').select('*'),
        supabase.from('entregas').select('*').order('created_at', { ascending: false }),
        supabase.from('entrega_status').select('*'),
        supabase.from('eventos').select('*').order('data'),
        supabase.from('tarefas').select('*').order('created_at'),
        supabase.from('notas').select('*').order('created_at'),
        supabase.from('arquivos').select('*').order('created_at', { ascending: false })
      ]);

      // Build profile
      const profile = profileRes.data;
      const perfil = profile ? {
        nome: profile.nome || '',
        cargo: profile.cargo || 'Coordenadora',
        tituloDaPlataforma: profile.titulo_da_plataforma || 'Espacinho da',
        emoji: profile.emoji || '👸'
      } : get().perfil;

      // Build turmas with embedded disciplinas
      const discsByTurma = {};
      (turmaDiscRes.data || []).forEach(d => {
        if (!discsByTurma[d.turma_id]) discsByTurma[d.turma_id] = [];
        discsByTurma[d.turma_id].push({ id: d.id, nome: d.nome, cargaHoraria: String(d.carga_horaria || 0) });
      });
      const turmasFlat = (turmasRes.data || []).map(t => ({
        id: t.id,
        nome: t.nome,
        turno: t.turno,
        anoLetivo: t.ano_letivo,
        escolaId: t.escola_id,
        disciplinas: discsByTurma[t.id] || []
      }));

      // Build VinculosMap for each professor
      const allVinculos = vinculosRes.data || [];
      const vinculosByProf = {};
      allVinculos.forEach(v => {
        if (!vinculosByProf[v.professor_id]) vinculosByProf[v.professor_id] = [];
        vinculosByProf[v.professor_id].push(v);
      });

      // Build RegistroAulas by professor
      const aulasByVinculo = {};
      (registroAulasRes.data || []).forEach(ra => {
        if (!aulasByVinculo[ra.vinculo_id]) aulasByVinculo[ra.vinculo_id] = [];
        aulasByVinculo[ra.vinculo_id].push(ra);
      });
      // Flatten aulas per professor
      const aulasByProf = {};
      allVinculos.forEach(v => {
        if (!aulasByProf[v.professor_id]) aulasByProf[v.professor_id] = [];
        (aulasByVinculo[v.id] || []).forEach(a => aulasByProf[v.professor_id].push(a));
      });

      const professoresFlat = (professoresRes.data || []).map(p =>
        buildProfessorFlat(p, vinculosByProf[p.id] || [], aulasByProf[p.id] || [])
      );

      // Build entregas with status
      const statusByEntrega = {};
      (entregaStatusRes.data || []).forEach(es => {
        if (!statusByEntrega[es.entrega_id]) statusByEntrega[es.entrega_id] = [];
        statusByEntrega[es.entrega_id].push(es);
      });
      const entregasFlat = (entregasRes.data || []).map(e =>
        buildEntregaFlat(e, statusByEntrega[e.id] || [], allVinculos)
      );

      // Build escolas
      const escolasFlat = (escolasRes.data || []).map(e => ({
        id: e.id,
        nome: e.nome,
        endereco: e.endereco || '',
        telefone: e.telefone || '',
        email: e.email || '',
        diretor: e.diretor || ''
      }));

      // Build eventos
      const eventosFlat = (eventosRes.data || []).map(e => ({
        id: e.id,
        titulo: e.titulo,
        data: e.data,
        tipo: e.tipo
      }));

      // Build tarefas
      const tarefasFlat = (tarefasRes.data || []).map(t => ({
        id: t.id,
        text: t.text,
        completed: t.completed || false,
        priority: t.priority || 'media',
        data: t.data || ''
      }));

      // Build notas
      const notasFlat = (notasRes.data || []).map(n => ({
        id: n.id,
        text: n.text
      }));

      // Build arquivos
      const arquivosFlat = (arquivosRes.data || []).map(a => ({
        id: a.id,
        nome: a.nome,
        data: a.data || '',
        tamanho: a.tamanho || '',
        link: a.link || '#'
      }));

      set({
        perfil,
        escolas: escolasFlat,
        turmas: turmasFlat,
        professores: professoresFlat,
        entregas: entregasFlat,
        eventos: eventosFlat,
        tarefas: tarefasFlat,
        notas: notasFlat,
        arquivos: arquivosFlat,
        _allVinculos: allVinculos,
        error: null
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error('fetchAll error:', err);
      set({ error: err.message });
    }
  },

  // ============================================================
  // PROFILE ACTIONS
  // ============================================================
  setIsProfileModalOpen: (isOpen) => set({ isProfileModalOpen: isOpen }),

  handleAtualizarPerfil: async (novoPerfil) => {
    const user = get().user;
    if (!user) return;

    const { error } = await supabase.from('profiles').update({
      nome: novoPerfil.nome,
      cargo: novoPerfil.cargo,
      titulo_da_plataforma: novoPerfil.tituloDaPlataforma,
      emoji: novoPerfil.emoji
    }).eq('id', user.id);

    if (!error) {
      set(state => ({ perfil: { ...state.perfil, ...novoPerfil } }));
    }
  },

  // ============================================================
  // ESCOLA ACTIONS
  // ============================================================
  handleAddEscola: async (newEscola) => {
    const user = get().user;
    if (!user) return;

    const errors = validateEscola(newEscola);
    if (errors.length > 0) {
      if (import.meta.env.DEV) console.error('Validation failed:', errors);
      return;
    }

    const { data, error } = await supabase.from('escolas').insert({
      user_id: user.id,
      nome: sanitize(newEscola.nome),
      endereco: sanitize(newEscola.endereco) || null,
      telefone: sanitize(newEscola.telefone) || null,
      email: sanitize(newEscola.email) || null,
      diretor: sanitize(newEscola.diretor) || null
    }).select().single();

    if (!error && data) {
      set(state => ({
        escolas: [...state.escolas, {
          id: data.id,
          nome: data.nome,
          endereco: data.endereco || '',
          telefone: data.telefone || '',
          email: data.email || '',
          diretor: data.diretor || ''
        }]
      }));
    }
  },

  handleEditEscola: async (id, updatedData) => {
    const errors = validateEscola(updatedData);
    if (errors.length > 0) {
      if (import.meta.env.DEV) console.error('Validation failed:', errors);
      return;
    }

    const { error } = await supabase.from('escolas').update({
      nome: sanitize(updatedData.nome),
      endereco: sanitize(updatedData.endereco) || null,
      telefone: sanitize(updatedData.telefone) || null,
      email: sanitize(updatedData.email) || null,
      diretor: sanitize(updatedData.diretor) || null
    }).eq('id', id);

    if (!error) {
      set(state => ({
        escolas: state.escolas.map(e => e.id === id ? { ...e, ...updatedData } : e)
      }));
    }
  },

  handleRemoverEscola: async (id) => {
    const { error } = await supabase.from('escolas').delete().eq('id', id);
    if (!error) {
      set(state => ({ escolas: state.escolas.filter(e => e.id !== id) }));
    }
  },

  // ============================================================
  // TURMA ACTIONS
  // ============================================================
  handleAddTurma: async (newTurma) => {
    const user = get().user;
    if (!user) return;

    // 1. Insert turma
    const { data: turmaData, error: turmaError } = await supabase.from('turmas').insert({
      user_id: user.id,
      escola_id: newTurma.escolaId,
      nome: newTurma.nome,
      turno: newTurma.turno,
      ano_letivo: newTurma.anoLetivo
    }).select().single();

    if (turmaError || !turmaData) return;

    // 2. Insert disciplinas
    const discsToInsert = (newTurma.disciplinas || []).map(d => ({
      turma_id: turmaData.id,
      nome: d.nome,
      carga_horaria: parseInt(d.cargaHoraria) || 0
    }));

    let disciplinasInserted = [];
    if (discsToInsert.length > 0) {
      const { data: discData } = await supabase.from('turma_disciplinas').insert(discsToInsert).select();
      disciplinasInserted = discData || [];
    }

    set(state => ({
      turmas: [...state.turmas, {
        id: turmaData.id,
        nome: turmaData.nome,
        turno: turmaData.turno,
        anoLetivo: turmaData.ano_letivo,
        escolaId: turmaData.escola_id,
        disciplinas: disciplinasInserted.map(d => ({ id: d.id, nome: d.nome, cargaHoraria: String(d.carga_horaria) }))
      }]
    }));
  },

  handleEditTurma: async (id, updatedData) => {
    // Update turma basic info
    const { error } = await supabase.from('turmas').update({
      nome: updatedData.nome,
      turno: updatedData.turno,
      ano_letivo: updatedData.anoLetivo,
      escola_id: updatedData.escolaId
    }).eq('id', id);

    if (error) return;

    // Handle disciplinas: delete existing and re-insert
    await supabase.from('turma_disciplinas').delete().eq('turma_id', id);

    let disciplinasInserted = [];
    if (updatedData.disciplinas && updatedData.disciplinas.length > 0) {
      const discsToInsert = updatedData.disciplinas.map(d => ({
        turma_id: id,
        nome: d.nome,
        carga_horaria: parseInt(d.cargaHoraria) || 0
      }));
      const { data: discData } = await supabase.from('turma_disciplinas').insert(discsToInsert).select();
      disciplinasInserted = discData || [];
    }

    set(state => ({
      turmas: state.turmas.map(t => t.id === id ? {
        ...t,
        ...updatedData,
        disciplinas: disciplinasInserted.map(d => ({ id: d.id, nome: d.nome, cargaHoraria: String(d.carga_horaria) }))
      } : t)
    }));

    // Refresh to rebuild vinculos that might have changed
    await get().fetchAll();
  },

  handleRemoverTurma: async (id) => {
    const { error } = await supabase.from('turmas').delete().eq('id', id);
    if (!error) {
      set(state => ({ turmas: state.turmas.filter(t => t.id !== id) }));
    }
  },

  // ============================================================
  // PROFESSOR ACTIONS
  // ============================================================
  handleAddProf: async (newProf) => {
    const user = get().user;
    if (!user) return;

    const errors = validateProfessor(newProf);
    if (errors.length > 0) {
      if (import.meta.env.DEV) console.error('Validation failed:', errors);
      return;
    }

    // 1. Insert professor
    const { data: profData, error: profError } = await supabase.from('professores').insert({
      user_id: user.id,
      escola_id: newProf.escolaId || null,
      nome: sanitize(newProf.nome),
      telefone: sanitize(newProf.telefone) || null,
      data_aniversario: newProf.dataAniversario || null
    }).select().single();

    if (profError || !profData) return;

    // 2. Create vinculos
    const turmas = get().turmas;
    const vinculosToInsert = [];
    (newProf.vinculos || []).forEach(v => {
      const turma = turmas.find(t => String(t.id) === String(v.turmaId));
      if (!turma) return;
      (v.disciplinas || []).forEach(discNome => {
        const disc = turma.disciplinas.find(d => d.nome === discNome);
        if (disc) {
          vinculosToInsert.push({
            professor_id: profData.id,
            turma_disciplina_id: disc.id
          });
        }
      });
    });

    if (vinculosToInsert.length > 0) {

      const { data: vinculoData, error: vinculoError } = await supabase.from('professor_vinculos').insert(vinculosToInsert).select('*, turma_disciplinas(*)');
      if (vinculoError && import.meta.env.DEV) {
        console.error("handleAddProf - Erro ao inserir professor_vinculos:", vinculoError);
      }
      
      // 3. Add this professor's vinculos to all existing entregas as 'pendente'
      const entregas = get().entregas;
      if (vinculoData && entregas.length > 0) {
        const statusToInsert = [];
        entregas.forEach(entrega => {
          vinculoData.forEach(v => {
            statusToInsert.push({
              entrega_id: entrega.id,
              vinculo_id: v.id,
              status: 'pendente'
            });
          });
        });
        if (statusToInsert.length > 0) {
          await supabase.from('entrega_status').insert(statusToInsert);
        }
      }
    }

    // Refresh all data to get consistent state
    await get().fetchAll();
  },

  handleEditProf: async (id, updatedData) => {
    const updatePayload = {};
    if (updatedData.nome !== undefined) updatePayload.nome = updatedData.nome;
    if (updatedData.telefone !== undefined) updatePayload.telefone = updatedData.telefone;
    if (updatedData.escolaId !== undefined) updatePayload.escola_id = updatedData.escolaId;
    if (updatedData.dataAniversario !== undefined) updatePayload.data_aniversario = updatedData.dataAniversario || null;

    await supabase.from('professores').update(updatePayload).eq('id', id);

    // If vinculos changed, rebuild them smartly to avoid losing data
    if (updatedData.vinculos) {
      // 1. Obter vínculos atuais
      const { data: existingVinculos } = await supabase.from('professor_vinculos')
        .select('id, turma_disciplina_id')
        .eq('professor_id', id);

      const turmas = get().turmas;
      const proposedVinculos = [];
      
      updatedData.vinculos.forEach(v => {
        const turma = turmas.find(t => String(t.id) === String(v.turmaId));
        if (!turma) return;
        (v.disciplinas || []).forEach(discNome => {
          const disc = turma.disciplinas.find(d => d.nome === discNome);
          if (disc) {
            proposedVinculos.push({
              turma_disciplina_id: disc.id,
              professor_id: id
            });
          }
        });
      });

      const toDelete = [];
      const toKeep = [];

      (existingVinculos || []).forEach(ev => {
        const stillExists = proposedVinculos.some(pv => pv.turma_disciplina_id === ev.turma_disciplina_id);
        if (!stillExists) {
          toDelete.push(ev.id);
        } else {
          toKeep.push(ev.turma_disciplina_id);
        }
      });

      const toInsert = proposedVinculos.filter(pv => !toKeep.includes(pv.turma_disciplina_id));

      if (toDelete.length > 0) {
        await supabase.from('professor_vinculos').delete().in('id', toDelete);
      }

      if (toInsert.length > 0) {
        const { error: vinculoError, data: insertedVinculos } = await supabase.from('professor_vinculos').insert(toInsert).select('*, turma_disciplinas(*)');
        if (vinculoError && import.meta.env.DEV) {
            console.error("handleEditProf - Erro ao inserir professor_vinculos:", vinculoError);
        }

        if (insertedVinculos && insertedVinculos.length > 0) {
          const entregas = get().entregas;
          if (entregas.length > 0) {
            const statusToInsert = [];
            entregas.forEach(entrega => {
              insertedVinculos.forEach(v => {
                statusToInsert.push({
                  entrega_id: entrega.id,
                  vinculo_id: v.id,
                  status: 'pendente'
                });
              });
            });
            if (statusToInsert.length > 0) {
              await supabase.from('entrega_status').insert(statusToInsert);
            }
          }
        }
      }
    }

    await get().fetchAll();
  },

  handleRemoverProf: async (id) => {
    const { error } = await supabase.from('professores').delete().eq('id', id);
    if (!error) {
      set(state => ({ professores: state.professores.filter(p => p.id !== id) }));
    }
  },

  handleRegistrarAula: async (profId, chave, aulaData) => {
    // chave is 'turmaId|disciplina'
    // Need to find the vinculo ID
    const prof = get().professores.find(p => p.id === profId);
    if (!prof) return;

    const vinculo = (prof._vinculos || []).find(v => {
      const key = `${v.turma_disciplinas?.turma_id}|${v.turma_disciplinas?.nome}`;
      return key === chave;
    });
    if (!vinculo) return;

    const { data, error } = await supabase.from('registro_aulas').insert({
      vinculo_id: vinculo.id,
      data: aulaData.data,
      observacao: aulaData.observacao || ''
    }).select().single();

    if (!error && data) {
      set(state => ({
        professores: state.professores.map(p => {
          if (p.id !== profId) return p;
          const registros = { ...p.registroAulas };
          registros[chave] = [...(registros[chave] || []), { data: data.data, observacao: data.observacao || '', id: data.id }];
          return { ...p, registroAulas: registros };
        })
      }));
    }
  },

  handleRemoverAula: async (profId, chave, index) => {
    const prof = get().professores.find(p => p.id === profId);
    if (!prof) return;

    const aulas = prof.registroAulas?.[chave] || [];
    const aula = aulas[index];
    if (!aula || !aula.id) return;

    const { error } = await supabase.from('registro_aulas').delete().eq('id', aula.id);
    if (!error) {
      set(state => ({
        professores: state.professores.map(p => {
          if (p.id !== profId) return p;
          const registros = { ...p.registroAulas };
          registros[chave] = (registros[chave] || []).filter((_, i) => i !== index);
          return { ...p, registroAulas: registros };
        })
      }));
    }
  },

  // ============================================================
  // ENTREGA (SEQUÊNCIA) ACTIONS
  // ============================================================
  handleAddEntrega: async (newEntrega) => {
    const user = get().user;
    if (!user) return;

    const errors = validateEntrega(newEntrega);
    if (errors.length > 0) {
      if (import.meta.env.DEV) console.error('Validation failed:', errors);
      return;
    }

    // 1. Insert entrega
    const { data: entregaData, error: entregaError } = await supabase.from('entregas').insert({
      user_id: user.id,
      titulo: sanitize(newEntrega.titulo),
      tipo: newEntrega.tipo,
      execucao_inicio: newEntrega.execucaoInicio || null,
      execucao_fim: newEntrega.execucaoFim || null,
      prazo: newEntrega.prazo
    }).select().single();

    if (entregaError || !entregaData) return;

    // 2. Create entrega_status for ALL existing vinculos as 'pendente'
    const allVinculos = get()._allVinculos;
    if (allVinculos.length > 0) {
      const statusToInsert = allVinculos.map(v => ({
        entrega_id: entregaData.id,
        vinculo_id: v.id,
        status: 'pendente'
      }));
      await supabase.from('entrega_status').insert(statusToInsert);
    }

    // Refresh to get full data
    await get().fetchAll();
  },

  toggleStatusVinculo: async (entregaId, chave) => {
    // chave is 'profId|turmaId|disciplina'
    const [profId, turmaId, discNome] = chave.split('|');

    // Find the vinculo ID
    const allVinculos = get()._allVinculos;
    const vinculo = allVinculos.find(v =>
      v.professor_id === profId &&
      v.turma_disciplinas?.turma_id === turmaId &&
      v.turma_disciplinas?.nome === discNome
    );
    if (!vinculo) return;

    // Get current status
    const entrega = get().entregas.find(e => e.id === entregaId);
    if (!entrega) return;
    const current = entrega.statusVinculos?.[chave];
    const currentStatus = (typeof current === 'object' ? current?.status : current) || 'pendente';
    const newStatus = currentStatus === 'entregue' ? 'pendente' : 'entregue';

    // Update in Supabase
    const { error } = await supabase.from('entrega_status')
      .update({ status: newStatus })
      .eq('entrega_id', entregaId)
      .eq('vinculo_id', vinculo.id);

    if (!error) {
      set(state => ({
        entregas: state.entregas.map(e => {
          if (e.id === entregaId) {
            const prev = e.statusVinculos?.[chave];
            const prevObj = typeof prev === 'object' ? prev : { status: prev || 'pendente', dataExecucao: null, executada: false };
            return {
              ...e,
              statusVinculos: { ...e.statusVinculos, [chave]: { ...prevObj, status: newStatus } }
            };
          }
          return e;
        })
      }));
    }
  },

  toggleStatusProfessor: async (entregaId, profId) => {
    const entrega = get().entregas.find(e => e.id === entregaId);
    if (!entrega) return;

    const sv = entrega.statusVinculos || {};
    const profKeys = Object.keys(sv).filter(k => k.startsWith(`${profId}|`));
    const getStatus = (val) => (typeof val === 'object' ? val?.status : val) || 'pendente';
    const allEntregue = profKeys.every(k => getStatus(sv[k]) === 'entregue');
    const newStatus = allEntregue ? 'pendente' : 'entregue';

    // Find all vinculo IDs for this professor
    const allVinculos = get()._allVinculos;
    const vinculoIds = allVinculos
      .filter(v => v.professor_id === profId)
      .map(v => v.id);

    if (vinculoIds.length === 0) return;

    // Batch update in Supabase
    const { error } = await supabase.from('entrega_status')
      .update({ status: newStatus })
      .eq('entrega_id', entregaId)
      .in('vinculo_id', vinculoIds);

    if (!error) {
      const newSv = { ...sv };
      profKeys.forEach(k => {
        const prev = typeof sv[k] === 'object' ? sv[k] : { status: sv[k] || 'pendente', dataExecucao: null, executada: false };
        newSv[k] = { ...prev, status: newStatus };
      });
      set(state => ({
        entregas: state.entregas.map(e => {
          if (e.id === entregaId) {
            return { ...e, statusVinculos: newSv };
          }
          return e;
        })
      }));
    }
  },

  updateExecucaoVinculo: async (entregaId, chave, dataExecucao, executada) => {
    // chave is 'profId|turmaId|disciplina'
    const [profId, turmaId, discNome] = chave.split('|');

    const allVinculos = get()._allVinculos;
    const vinculo = allVinculos.find(v =>
      v.professor_id === profId &&
      v.turma_disciplinas?.turma_id === turmaId &&
      v.turma_disciplinas?.nome === discNome
    );
    if (!vinculo) return;

    const updatePayload = {
      executada,
      data_execucao: executada ? (dataExecucao || null) : null
    };

    const { error } = await supabase.from('entrega_status')
      .update(updatePayload)
      .eq('entrega_id', entregaId)
      .eq('vinculo_id', vinculo.id);

    if (!error) {
      set(state => ({
        entregas: state.entregas.map(e => {
          if (e.id === entregaId) {
            const prev = e.statusVinculos?.[chave];
            const prevObj = typeof prev === 'object' ? prev : { status: prev || 'pendente', dataExecucao: null, executada: false };
            return {
              ...e,
              statusVinculos: {
                ...e.statusVinculos,
                [chave]: {
                  ...prevObj,
                  executada,
                  dataExecucao: executada ? (dataExecucao || null) : null
                }
              }
            };
          }
          return e;
        })
      }));
    }
  },

  handleRemoverEntrega: async (entregaId) => {
    const { error } = await supabase.from('entregas').delete().eq('id', entregaId);
    if (!error) {
      set(state => ({ entregas: state.entregas.filter(e => e.id !== entregaId) }));
    }
  },

  // ============================================================
  // EVENTO ACTIONS
  // ============================================================
  handleAddEvento: async (newEvento) => {
    if (!supabase) return;
    const user = get().user;
    if (!user) {
      if (import.meta.env.DEV) console.error('handleAddEvento: Usuário não está logado');
      return;
    }

    const { data, error } = await supabase.from('eventos').insert({
      user_id: user.id,
      titulo: sanitize(newEvento.titulo),
      data: newEvento.data,
      tipo: newEvento.tipo
    }).select().single();

    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao salvar evento:', error);
      return;
    }

    if (data) {
      set(state => ({
        eventos: [...state.eventos, { id: data.id, titulo: data.titulo, data: data.data, tipo: data.tipo }]
      }));
    }
  },

  handleRemoverEvento: async (id) => {
    if (!supabase) return;
    
    const evento = get().eventos.find(e => e.id === id);
    if (!evento) return;

    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao remover evento:', error);
      return;
    }
    
    set(state => ({ eventos: state.eventos.filter(e => e.id !== id) }));

    // Se for um evento de Tarefa, remove a tarefa correspondente da UI e DB
    if (evento.tipo === 'Tarefas') {
      const tarefa = get().tarefas.find(t => t.text === evento.titulo && t.data === evento.data);
      if (tarefa) {
        await get().handleRemoverTarefa(tarefa.id);
      }
    }
  },

  // ============================================================
  // TAREFA ACTIONS
  // ============================================================
  handleAddTarefa: async (newTarefa) => {
    const user = get().user;
    if (!user) return;

    const { data, error } = await supabase.from('tarefas').insert({
      user_id: user.id,
      text: sanitize(newTarefa.text),
      completed: newTarefa.completed || false,
      priority: newTarefa.priority || 'media',
      data: newTarefa.data || null
    }).select().single();

    if (!error && data) {
      set(state => ({
        tarefas: [...state.tarefas, {
          id: data.id,
          text: data.text,
          completed: data.completed,
          priority: data.priority,
          data: data.data || ''
        }]
      }));

      // If tarefa has date, also create a calendar event
      if (newTarefa.data) {
        await get().handleAddEvento({
          titulo: newTarefa.text,
          data: newTarefa.data,
          tipo: 'Tarefas'
        });
      }
    }
  },

  toggleTarefa: async (id) => {
    const tarefa = get().tarefas.find(t => t.id === id);
    if (!tarefa) return;

    const { error } = await supabase.from('tarefas')
      .update({ completed: !tarefa.completed })
      .eq('id', id);

    if (!error) {
      set(state => ({
        tarefas: state.tarefas.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      }));
    }
  },

  handleRemoverTarefa: async (id) => {
    const tarefa = get().tarefas.find(t => t.id === id);
    if (!tarefa) return;

    const { error } = await supabase.from('tarefas').delete().eq('id', id);
    if (!error) {
      set(state => ({ tarefas: state.tarefas.filter(t => t.id !== id) }));

      // Remove o evento correspondente no calendário se houver
      if (tarefa.data) {
        const evento = get().eventos.find(e => 
          e.titulo === tarefa.text && 
          e.data === tarefa.data && 
          e.tipo === 'Tarefas'
        );
        if (evento) {
          await get().handleRemoverEvento(evento.id);
        }
      }
    }
  },

  // ============================================================
  // NOTA ACTIONS
  // ============================================================
  handleAddNota: async (text) => {
    const user = get().user;
    if (!user) return;

    const { data, error } = await supabase.from('notas').insert({
      user_id: user.id,
      text: sanitize(text)
    }).select().single();

    if (!error && data) {
      set(state => ({
        notas: [...state.notas, { id: data.id, text: data.text }]
      }));
    }
  },

  handleRemoverNota: async (id) => {
    const { error } = await supabase.from('notas').delete().eq('id', id);
    if (!error) {
      set(state => ({ notas: state.notas.filter(n => n.id !== id) }));
    }
  },

  // ============================================================
  // ARQUIVO ACTIONS
  // ============================================================
  handleAddArquivo: async (newArquivo) => {
    const user = get().user;
    if (!user) return;

    const errors = validateArquivo(newArquivo);
    if (errors.length > 0) {
      if (import.meta.env.DEV) console.error('Validation failed:', errors);
      return;
    }

    const { data, error } = await supabase.from('arquivos').insert({
      user_id: user.id,
      nome: sanitize(newArquivo.nome),
      data: newArquivo.data || null,
      tamanho: sanitize(newArquivo.tamanho) || null,
      link: sanitize(newArquivo.link) || null,
      is_public: true
    }).select().single();

    if (!error && data) {
      set(state => ({
        arquivos: [{ id: data.id, nome: data.nome, data: data.data || '', tamanho: data.tamanho || '', link: data.link || '#' }, ...state.arquivos]
      }));
    }
  },

  handleRemoverArquivo: async (id) => {
    const { error } = await supabase.from('arquivos').delete().eq('id', id);
    if (!error) {
      set(state => ({ arquivos: state.arquivos.filter(a => a.id !== id) }));
    }
  },

  // ============================================================
  // PUBLIC DATA (for PortalPublico - no auth required)
  // ============================================================
  fetchPublicData: async (userId) => {
    if (!supabase || !userId) {
      set({ loading: false });
      return;
    }
    const [arquivosRes, eventosRes, profileRes] = await Promise.all([
      supabase.from('arquivos').select('*').eq('user_id', userId).eq('is_public', true).order('created_at', { ascending: false }),
      supabase.from('eventos').select('*').eq('user_id', userId).order('data'),
      supabase.from('profiles').select('*').eq('id', userId).single()
    ]);

    const profile = profileRes.data;

    set({
      arquivos: (arquivosRes.data || []).map(a => ({
        id: a.id,
        nome: a.nome,
        data: a.data || '',
        tamanho: a.tamanho || '',
        link: a.link || '#'
      })),
      eventos: (eventosRes.data || []).map(e => ({
        id: e.id,
        titulo: e.titulo,
        data: e.data,
        tipo: e.tipo
      })),
      perfil: profile ? {
        nome: profile.nome || '',
        cargo: profile.cargo || 'Coordenadora',
        tituloDaPlataforma: profile.titulo_da_plataforma || 'Espacinho da',
        emoji: profile.emoji || '👸'
      } : get().perfil,
      loading: false
    });
  }
}));
