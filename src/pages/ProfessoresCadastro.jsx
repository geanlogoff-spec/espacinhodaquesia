import React, { useState, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Card from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { Users, Plus, X, CheckCircle2, Pencil, School, GraduationCap, BookOpen, Phone, ChevronDown, ChevronUp, Trash2, Cake } from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import './Professores.css';

const ProfessoresCadastro = () => {
  const {
    professores, handleAddProf, handleEditProf, handleRemoverProf,
    escolas = [], turmas = []
  } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [editingProf, setEditingProf] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // vinculos: [{ turmaId: string, disciplinas: string[] }]
  const [formData, setFormData] = useState({
    nome: '', telefone: '', dataAniversario: '', escolaId: '', vinculos: []
  });

  const resetForm = () => {
    setFormData({ nome: '', telefone: '', dataAniversario: '', escolaId: '', vinculos: [] });
    setEditingProf(null);
    setShowForm(false);
  };

  const openAdd = () => {
    setFormData({ nome: '', telefone: '', dataAniversario: '', escolaId: '', vinculos: [] });
    setEditingProf(null);
    setShowForm(true);
  };

  const openEdit = (prof) => {
    setFormData({
      nome: prof.nome || '',
      telefone: prof.telefone || '',
      dataAniversario: prof.dataAniversario || '',
      escolaId: prof.escolaId ? String(prof.escolaId) : '',
      vinculos: prof.vinculos || []
    });
    setEditingProf(prof.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) return;

    const payload = { ...formData };

    if (editingProf) {
      handleEditProf(editingProf, payload);
    } else {
      handleAddProf(payload);
    }
    resetForm();
  };

  // Cascading: turmas filtered by selected escola
  const turmasDisponiveis = useMemo(() => {
    if (!formData.escolaId) return [];
    return turmas.filter(t => String(t.escolaId) === String(formData.escolaId));
  }, [formData.escolaId, turmas]);

  // When escola changes, clear vinculos
  const handleEscolaChange = (escolaId) => {
    setFormData(prev => ({ ...prev, escolaId, vinculos: [] }));
  };

  // Toggle turma: add/remove a vinculo entry
  const toggleTurma = (turmaId) => {
    const id = String(turmaId);
    setFormData(prev => {
      const exists = prev.vinculos.find(v => v.turmaId === id);
      if (exists) {
        return { ...prev, vinculos: prev.vinculos.filter(v => v.turmaId !== id) };
      } else {
        return { ...prev, vinculos: [...prev.vinculos, { turmaId: id, disciplinas: [] }] };
      }
    });
  };

  // Toggle disciplina for a specific turma vinculo
  const toggleDisciplinaForTurma = (turmaId, disc) => {
    const id = String(turmaId);
    setFormData(prev => ({
      ...prev,
      vinculos: prev.vinculos.map(v => {
        if (v.turmaId !== id) return v;
        const has = v.disciplinas.includes(disc);
        return {
          ...v,
          disciplinas: has
            ? v.disciplinas.filter(d => d !== disc)
            : [...v.disciplinas, disc]
        };
      })
    }));
  };

  // Get disciplinas available for a specific turma
  const getDisciplinasDaTurma = (turmaId) => {
    const turma = turmas.find(t => String(t.id) === String(turmaId));
    if (!turma || !turma.disciplinas) return [];
    return turma.disciplinas.map(d => typeof d === 'string' ? d : d.nome).filter(Boolean);
  };

  const isTurmaSelected = (turmaId) => {
    return formData.vinculos.some(v => v.turmaId === String(turmaId));
  };

  const getVinculoForTurma = (turmaId) => {
    return formData.vinculos.find(v => v.turmaId === String(turmaId));
  };

  // Display helpers
  const getEscolaNome = (id) => {
    const e = escolas.find(e => String(e.id) === String(id));
    return e ? e.nome : null;
  };

  const getTurmaNome = (id) => {
    const t = turmas.find(t => String(t.id) === String(id));
    return t ? t.nome : id;
  };

  return (
    <div className="professores-container animate-fade-in stagger-1">
      {/* Header */}
      <div className="seq-header-title" style={{ marginBottom: '1rem' }}>
        <div className="summary-icon" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #c3b0f5 0%, #af99eb 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}><Users size={20} /></div>
        <h2 className="text-title">Cadastro de Professores</h2>
      </div>

      <Card>
        <div className="professores-toolbar">
          <p className="text-body" style={{ marginBottom: '1rem' }}>Gerencie os professores. Associe cada professor a uma escola, com turmas e disciplinas individuais por turma.</p>
          <button className="btn btn-green mobile-full-width" onClick={openAdd}>
            <Plus size={16} /> Cadastrar Professor
          </button>
        </div>

        <div className="professores-list">
          {professores.map(prof => {
            const escolaNome = getEscolaNome(prof.escolaId);
            const vinculos = prof.vinculos || [];

            return (
              <div key={prof.id} className="professor-card-item">
                <div className="prof-header">
                  <div className="prof-info">
                    <div className="prof-avatar">{prof.nome.charAt(0)}</div>
                    <div>
                      <h4 className="prof-name">{prof.nome}</h4>
                      {prof.telefone && (
                        <span className="prof-subject"><Phone size={12} /> {prof.telefone}</span>
                      )}
                      {prof.dataAniversario && (
                        <span className="prof-subject" style={{ color: 'var(--primary-pink)' }}><Cake size={12} /> {prof.dataAniversario.split('-').reverse().join('/')}</span>
                      )}
                    </div>
                  </div>

                  <div className="prof-actions">
                    <button className="icon-btn-edit" onClick={() => openEdit(prof)} title="Editar professor">
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn-delete" onClick={() => setDeleteTarget(prof)} title="Remover professor">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Association: Escola */}
                {escolaNome && (
                  <div className="prof-association-row" style={{ borderTop: 'none', marginTop: '0.5rem', paddingTop: 0 }}>
                    <span className="prof-assoc-badge escola">
                      <School size={13} /> {escolaNome}
                    </span>
                  </div>
                )}

                {/* Vinculos: turma → disciplinas */}
                {vinculos.length > 0 && (
                  <div className="prof-vinculos-display">
                    {vinculos.map(v => {
                      const turmaNome = getTurmaNome(v.turmaId);
                      return (
                        <div key={v.turmaId} className="prof-vinculo-item">
                          <span className="prof-vinculo-turma">
                            <GraduationCap size={13} /> {turmaNome}
                          </span>
                          <div className="prof-vinculo-discs">
                            {v.disciplinas.map(d => (
                              <span key={d} className="prof-assoc-badge disc">{d}</span>
                            ))}
                            {v.disciplinas.length === 0 && (
                              <span className="prof-vinculo-empty">Sem disciplinas</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}


              </div>
            );
          })}
          {professores.length === 0 && (
            <div className="empty-state">Nenhum professor cadastrado ainda.</div>
          )}
        </div>
      </Card>

      {/* Resumo */}
      <div className="professores-summary-row stagger-2">
        <Card className="summary-mini-card" style={{ background: 'linear-gradient(135deg, #fcedf4 0%, #f7e6f8 100%)', borderColor: 'var(--primary-pink)' }}>
          <h3 className="text-subtitle" style={{ color: 'var(--primary-purple)', marginBottom: '1rem' }}>Resumo</h3>
          <div className="mini-stat">
            <div className="stat-label">Total de Professores</div>
            <div className="stat-number">{professores.length}</div>
          </div>
          <div className="mini-stat border-none">
            <div className="stat-label">Vínculos Turma-Disciplina</div>
            <div className="stat-number purple">{professores.reduce((acc, p) => acc + (p.vinculos || []).reduce((a, v) => a + v.disciplinas.length, 0), 0)}</div>
          </div>
        </Card>
      </div>

      {/* ===== MODAL ===== */}
      {showForm && createPortal(
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3>{editingProf ? 'Editar Professor' : 'Cadastrar Professor'}</h3>
              <button className="icon-btn-close" onClick={resetForm}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="add-prof-form-modal">

                {/* DADOS PESSOAIS */}
                <div className="form-divider">Dados Pessoais</div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Nome Completo *</label>
                    <input type="text" className="custom-input" placeholder="Ex: Ana Clara Silva" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Telefone / Contato</label>
                    <input type="text" className="custom-input" placeholder="(00) 00000-0000" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label><Cake size={14} style={{ verticalAlign: 'middle' }} /> Data de Aniversário</label>
                    <input type="date" className="custom-input" value={formData.dataAniversario} onChange={e => setFormData({ ...formData, dataAniversario: e.target.value })} />
                  </div>
                </div>

                {/* ESCOLA */}
                <div className="form-divider">Vínculo Escolar</div>
                <div className="form-group full-width">
                  <label>Escola</label>
                  {escolas.length > 0 ? (
                    <select className="custom-input" value={formData.escolaId} onChange={e => handleEscolaChange(e.target.value)}>
                      <option value="">Selecione uma escola...</option>
                      {escolas.map(escola => (
                        <option key={escola.id} value={escola.id}>{escola.nome}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="form-hint-box">
                      <School size={16} />
                      <span>Nenhuma escola cadastrada. Vá em <strong>Escola → Cadastro de Escola</strong>.</span>
                    </div>
                  )}
                </div>

                {/* TURMAS + DISCIPLINAS PER TURMA */}
                {formData.escolaId && (
                  <>
                    <div className="form-divider">Turmas e Disciplinas</div>

                    {turmasDisponiveis.length > 0 ? (
                      <div className="vinculo-builder">
                        {turmasDisponiveis.map(turma => {
                          const selected = isTurmaSelected(turma.id);
                          const vinculo = getVinculoForTurma(turma.id);
                          const discsDaTurma = getDisciplinasDaTurma(turma.id);

                          return (
                            <div key={turma.id} className={`vinculo-turma-block ${selected ? 'active' : ''}`}>
                              {/* Turma toggle header */}
                              <button
                                type="button"
                                className="vinculo-turma-header"
                                onClick={() => toggleTurma(turma.id)}
                              >
                                <div className="vinculo-turma-left">
                                  {selected ? <CheckCircle2 size={16} className="check-active" /> : <div className="check-empty" />}
                                  <GraduationCap size={16} />
                                  <span className="vinculo-turma-name">{turma.nome}</span>
                                  {turma.turno && <span className="vinculo-turma-detail">{turma.turno}</span>}
                                </div>
                                {selected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>

                              {/* Disciplinas for this turma (expanded) */}
                              {selected && discsDaTurma.length > 0 && (
                                <div className="vinculo-disc-panel animate-fade-in">
                                  <label className="vinculo-disc-label">Disciplinas nesta turma:</label>
                                  <div className="disc-picker-list" style={{ gap: '0.3rem' }}>
                                    {discsDaTurma.map(disc => {
                                      const discSelected = vinculo && vinculo.disciplinas.includes(disc);
                                      return (
                                        <div key={disc} className={`disc-picker-item ${discSelected ? 'selected' : ''}`}>
                                          <button
                                            type="button"
                                            className={`disc-chip ${discSelected ? 'selected' : ''}`}
                                            onClick={() => toggleDisciplinaForTurma(turma.id, disc)}
                                          >
                                            {discSelected && <CheckCircle2 size={14} />}
                                            {disc}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {vinculo && vinculo.disciplinas.length > 0 && (
                                    <small className="form-hint">{vinculo.disciplinas.length} disciplina(s) selecionada(s)</small>
                                  )}
                                </div>
                              )}

                              {selected && discsDaTurma.length === 0 && (
                                <div className="vinculo-disc-panel animate-fade-in">
                                  <div className="form-hint-box" style={{ fontSize: '0.8rem' }}>
                                    <BookOpen size={14} />
                                    <span>Esta turma não possui disciplinas cadastradas.</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="form-hint-box">
                        <GraduationCap size={16} />
                        <span>Nenhuma turma vinculada a esta escola. Cadastre turmas em <strong>Escola → Cadastro de Turmas</strong>.</span>
                      </div>
                    )}
                  </>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={resetForm}>Cancelar</button>
                  <button type="submit" className="btn btn-green">
                    <CheckCircle2 size={16} /> {editingProf ? 'Salvar Alterações' : 'Salvar Cadastro'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.nome}
        title="Excluir Professor"
        onConfirm={() => {
          handleRemoverProf(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProfessoresCadastro;
