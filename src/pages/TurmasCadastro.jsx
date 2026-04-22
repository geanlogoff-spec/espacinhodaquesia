import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import Card from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { GraduationCap, Plus, X, CheckCircle2, School, Pencil, Calendar, BookOpen, Trash2 } from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import './Escola.css';

// Disciplinas padrão do Ensino Fundamental Regular
const DISCIPLINAS_DISPONIVEIS = [
  'Língua Portuguesa',
  'Matemática',
  'Ciências',
  'Geografia',
  'História',
  'Arte',
  'Educação Física',
  'Ensino Religioso',
  'Inglês',
  'Espanhol',
];

const TurmasCadastro = () => {
  const { turmas = [], escolas = [], handleAddTurma, handleEditTurma, handleRemoverTurma } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTurma, setEditingTurma] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // disciplinas is now an array of { nome: string, cargaHoraria: number|string }
  const [formData, setFormData] = useState({ nome: '', turno: '', anoLetivo: '', escolaId: '', disciplinas: [] });

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const resetForm = () => {
    setFormData({ nome: '', turno: '', anoLetivo: '', escolaId: '', disciplinas: [] });
    setEditingTurma(null);
    setShowForm(false);
  };

  const openAdd = () => {
    setFormData({ nome: '', turno: '', anoLetivo: String(currentYear), escolaId: '', disciplinas: [] });
    setEditingTurma(null);
    setShowForm(true);
  };

  const openEdit = (turma) => {
    setFormData({
      nome: turma.nome || '',
      turno: turma.turno || '',
      anoLetivo: turma.anoLetivo || String(currentYear),
      escolaId: turma.escolaId ? String(turma.escolaId) : '',
      disciplinas: turma.disciplinas || []
    });
    setEditingTurma(turma.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) return;

    if (editingTurma) {
      handleEditTurma(editingTurma, formData);
    } else {
      handleAddTurma(formData);
    }

    resetForm();
  };

  const toggleDisciplina = (discNome) => {
    setFormData(prev => {
      const exists = prev.disciplinas.find(d => d.nome === discNome);
      if (exists) {
        return { ...prev, disciplinas: prev.disciplinas.filter(d => d.nome !== discNome) };
      } else {
        return { ...prev, disciplinas: [...prev.disciplinas, { nome: discNome, cargaHoraria: '' }] };
      }
    });
  };

  const updateCargaHoraria = (discNome, value) => {
    setFormData(prev => ({
      ...prev,
      disciplinas: prev.disciplinas.map(d =>
        d.nome === discNome ? { ...d, cargaHoraria: value } : d
      )
    }));
  };

  const isDisciplinaSelected = (discNome) => {
    return formData.disciplinas.some(d => d.nome === discNome);
  };

  const getDisciplinaCH = (discNome) => {
    const disc = formData.disciplinas.find(d => d.nome === discNome);
    return disc ? disc.cargaHoraria : '';
  };

  const getEscolaNome = (escolaId) => {
    if (!escolaId) return null;
    const escola = escolas.find(e => String(e.id) === String(escolaId));
    return escola ? escola.nome : null;
  };

  return (
    <div className="escola-container animate-fade-in stagger-1">
      {/* Header */}
      <div className="seq-header-title" style={{ marginBottom: '1rem' }}>
        <div className="summary-icon" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #fcd57e 0%, #f2b938 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}><GraduationCap size={20} /></div>
        <h2 className="text-title">Cadastro de Turmas</h2>
      </div>

      <Card>
        <div className="escola-toolbar">
          <p className="text-body" style={{ marginBottom: '1rem' }}>Gerencie as turmas cadastradas. Adicione novas turmas e associe a uma escola.</p>
          <button className="btn btn-green mobile-full-width" onClick={openAdd}>
            <Plus size={16} /> Cadastrar Turma
          </button>
        </div>

        <div className="escola-list">
          {turmas.map(turma => {
            const escolaNome = getEscolaNome(turma.escolaId);
            return (
              <div key={turma.id} className="escola-card-item">
                <div className="escola-header">
                  <div className="escola-info">
                    <div className="escola-avatar turma-avatar">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h4 className="escola-name">{turma.nome}</h4>
                      <div className="turma-badges">
                        {turma.turno && <span className="prof-badge outline">{turma.turno}</span>}
                        {turma.anoLetivo && <span className="prof-badge secondary"><Calendar size={12} /> {turma.anoLetivo}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="escola-actions">
                    <button className="icon-btn-edit" onClick={() => openEdit(turma)} title="Editar turma">
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn-delete" onClick={() => setDeleteTarget(turma)} title="Remover turma">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="escola-meta">
                  {escolaNome && (
                    <span className="escola-meta-item escola-vinculo">
                      <School size={14} /> {escolaNome}
                    </span>
                  )}
                </div>

                {/* Disciplinas chips with CH */}
                {turma.disciplinas && turma.disciplinas.length > 0 && (
                  <div className="disciplinas-display">
                    <BookOpen size={14} className="disc-label-icon" />
                    <div className="disc-chips-row">
                      {turma.disciplinas.map(d => (
                        <span key={d.nome} className="disc-chip-small">
                          {d.nome}
                          {d.cargaHoraria && <strong className="ch-badge">{d.cargaHoraria}h</strong>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {turmas.length === 0 && (
            <div className="empty-state">Nenhuma turma cadastrada ainda.</div>
          )}
        </div>
      </Card>

      {/* Resumo */}
      <div className="professores-summary-row stagger-2">
        <Card className="summary-mini-card" style={{ background: 'linear-gradient(135deg, #fef5de 0%, #fceab8 100%)', borderColor: 'var(--warning-yellow)' }}>
          <h3 className="text-subtitle" style={{ color: '#c48b04', marginBottom: '1rem' }}>Resumo</h3>
          <div className="mini-stat">
            <div className="stat-label">Total de Turmas</div>
            <div className="stat-number">{turmas.length}</div>
          </div>
          <div className="mini-stat border-none">
            <div className="stat-label">Turnos</div>
            <div className="stat-number purple">{[...new Set(turmas.map(t => t.turno).filter(Boolean))].length}</div>
          </div>
        </Card>
      </div>

      {/* Modal de Cadastro / Edição */}
      {showForm && createPortal(
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>{editingTurma ? 'Editar Turma' : 'Cadastrar Turma'}</h3>
              <button className="icon-btn-close" onClick={resetForm}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="add-prof-form-modal">
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Nome da Turma *</label>
                    <input type="text" className="custom-input" placeholder="Ex: 6ºA" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                  </div>
                </div>

                {/* Escola Vinculada */}
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Escola Vinculada</label>
                    {escolas.length > 0 ? (
                      <select className="custom-input" value={formData.escolaId} onChange={e => setFormData({ ...formData, escolaId: e.target.value })}>
                        <option value="">Selecione uma escola...</option>
                        {escolas.map(escola => (
                          <option key={escola.id} value={escola.id}>{escola.nome}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="form-hint-box">
                        <School size={16} />
                        <span>Nenhuma escola cadastrada. Cadastre uma escola primeiro em <strong>Escola → Cadastro de Escola</strong>.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Turno</label>
                    <select className="custom-input" value={formData.turno} onChange={e => setFormData({ ...formData, turno: e.target.value })}>
                      <option value="">Selecione...</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ano Letivo</label>
                    <select className="custom-input" value={formData.anoLetivo} onChange={e => setFormData({ ...formData, anoLetivo: e.target.value })}>
                      <option value="">Selecione...</option>
                      {yearOptions.map(year => (
                        <option key={year} value={String(year)}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Disciplinas com Carga Horária */}
                <div className="form-divider">Disciplinas e Carga Horária (CH)</div>
                <div className="form-group full-width">
                  <label>Clique para selecionar e defina a CH de cada disciplina</label>
                  <div className="disc-picker-list">
                    {DISCIPLINAS_DISPONIVEIS.map(disc => {
                      const selected = isDisciplinaSelected(disc);
                      return (
                        <div key={disc} className={`disc-picker-item ${selected ? 'selected' : ''}`}>
                          <button
                            type="button"
                            className={`disc-chip ${selected ? 'selected' : ''}`}
                            onClick={() => toggleDisciplina(disc)}
                          >
                            {selected && <CheckCircle2 size={14} />}
                            {disc}
                          </button>

                          {selected && (
                            <div className="disc-ch-input-wrapper">
                              <input
                                type="number"
                                className="disc-ch-input"
                                placeholder="CH"
                                min="1"
                                value={getDisciplinaCH(disc)}
                                onChange={e => updateCargaHoraria(disc, e.target.value)}
                              />
                              <span className="disc-ch-suffix">h/ano</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {formData.disciplinas.length > 0 && (
                    <small className="form-hint">{formData.disciplinas.length} disciplina(s) selecionada(s)</small>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={resetForm}>Cancelar</button>
                  <button type="submit" className="btn btn-green">
                    <CheckCircle2 size={16} /> {editingTurma ? 'Salvar Alterações' : 'Salvar Turma'}
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
        title="Excluir Turma"
        onConfirm={() => {
          handleRemoverTurma(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TurmasCadastro;
