import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import { Users, Plus, Edit3, Trash2, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import './Professores.css';

const Professores = () => {
  const { professores, handleAddProf, handleComputarAula, handleRemoverProf } = useAppStore();

  // State for Add Teacher form Modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProf, setNewProf] = useState({ nome: '', materia: '', turmas: '', turno: '', telefone: '', cargaAnual: '' });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newProf.nome || !newProf.materia || !newProf.cargaAnual) return;
    
    handleAddProf(newProf);
    
    setNewProf({ nome: '', materia: '', turmas: '', turno: '', telefone: '', cargaAnual: '' });
    setShowAddForm(false);
  };

  // Helper limits
  const getProgressVisuals = (dadas, total) => {
    const calc = (dadas / total) * 100;
    const isCompleted = calc >= 100;
    const isWarning = calc >= 90 && !isCompleted;

    return {
      percentage: Math.min(calc, 100).toFixed(1),
      isCompleted,
      isWarning,
      remaining: total - dadas,
      barClass: isCompleted ? 'bg-success' : (isWarning ? 'bg-warning' : 'bg-primary')
    };
  };

  return (
    <div className="professores-container animate-fade-in stagger-1">
      {/* Header */}
      <div className="seq-header-title" style={{ marginBottom: '1rem' }}>
        <div className="summary-icon" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #c3b0f5 0%, #af99eb 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}><Users size={20} /></div>
        <h2 className="text-title">Cadastros e Carga Horária</h2>
      </div>

      <div className="professores-layout-grid">

        {/* Left Side: Teachers & Classes */}
        <div className="professores-main-col stagger-2">
          <Card title="Acompanhamento de Aulas Lecionadas">
            <div className="professores-toolbar">
              <p className="text-body" style={{ marginBottom: '1.5rem' }}>Monitore o avanço do preenchimento da carga horária de cada professor ao longo do ano.</p>
              <button
                className="btn btn-green mobile-full-width"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={16} /> Cadastrar Professor
              </button>
            </div>

            {/* Teacher List visual */}
            <div className="professores-list">
              {professores.map(prof => {
                const vis = getProgressVisuals(prof.aulasDadas, prof.cargaAnual);

                return (
                  <div key={prof.id} className="professor-card-item">
                    <div className="prof-header">
                      <div className="prof-info">
                        <div className="prof-avatar">
                          {prof.nome.charAt(0)}
                        </div>
                        <div>
                          <h4 className="prof-name">{prof.nome}</h4>
                          <span className="prof-subject">{prof.materia}</span>
                          {prof.turmas && <span className="prof-badge secondary">{prof.turmas}</span>}
                          {prof.turno && <span className="prof-badge outline">{prof.turno}</span>}
                        </div>
                      </div>

                      <div className="prof-actions">
                        <button className="btn btn-outline btn-small" onClick={() => handleComputarAula(prof.id)} disabled={vis.isCompleted}>
                          <Plus size={14} /> <span>1 Aula</span>
                        </button>
                        <button className="icon-btn-delete" onClick={() => handleRemoverProf(prof.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="progress-section">
                      <div className="progress-labels">
                        <span><strong>{prof.aulasDadas}</strong> aulas dadas</span>
                        <span>Meta: <strong>{prof.cargaAnual}</strong> aulas</span>
                      </div>
                      <div className="progress-track">
                        <div className={`progress-fill ${vis.barClass}`} style={{ width: `${vis.percentage}%` }}></div>
                      </div>
                      <div className="progress-footer">
                        {vis.isCompleted ? (
                          <span className="status-badge complete"><CheckCircle2 size={12} /> Carga Horária Cumprida</span>
                        ) : vis.isWarning ? (
                          <span className="status-badge warning"><AlertCircle size={12} /> Atenção: Faltam apenas {vis.remaining} aulas</span>
                        ) : (
                          <span className="status-badge normal"><Clock size={12} /> Faltam {vis.remaining} aulas para encerrar</span>
                        )}
                        <span className="percentage-text">{vis.percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {professores.length === 0 && (
                <div className="empty-state">Nenhum professor cadastrado ainda.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Resumo Extra ou Infos */}
        <div className="professores-side-col stagger-3">
          <Card className="summary-mini-card" style={{ background: 'linear-gradient(135deg, #fcedf4 0%, #f7e6f8 100%)', borderColor: 'var(--primary-pink)' }}>
            <h3 className="text-subtitle" style={{ color: 'var(--primary-purple)', marginBottom: '1rem' }}>Retrato Geral</h3>

            <div className="mini-stat">
              <div className="stat-label">Total de Professores</div>
              <div className="stat-number">{professores.length}</div>
            </div>

            <div className="mini-stat">
              <div className="stat-label">Cargas Cumpridas</div>
              <div className="stat-number green">{professores.filter(p => p.aulasDadas >= p.cargaAnual).length}</div>
            </div>

            <div className="mini-stat border-none">
              <div className="stat-label">Total Gasto (Sistema)</div>
              <div className="stat-number purple">{professores.reduce((acc, curr) => acc + curr.aulasDadas, 0)} aulas</div>
            </div>
          </Card>
        </div>

      </div>

      {/* Modal de Cadastro */}
      {showAddForm && createPortal(
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up">
            <div className="modal-header">
              <h3>Cadastrar Professor</h3>
              <button className="icon-btn-close" onClick={() => setShowAddForm(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSubmit} className="add-prof-form-modal">
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Nome Completo do Servidor *</label>
                    <input type="text" className="custom-input" placeholder="Ex: Ana Clara Silva" value={newProf.nome} onChange={e => setNewProf({ ...newProf, nome: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Disciplina Principal *</label>
                    <input type="text" className="custom-input" placeholder="Ex: Biologia" value={newProf.materia} onChange={e => setNewProf({ ...newProf, materia: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Telefone / Contato</label>
                    <input type="text" className="custom-input" placeholder="(00) 00000-0000" value={newProf.telefone} onChange={e => setNewProf({ ...newProf, telefone: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Turmas (Opcional)</label>
                    <input type="text" className="custom-input" placeholder="Ex: 6ºA, 7ºB" value={newProf.turmas} onChange={e => setNewProf({ ...newProf, turmas: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Turno</label>
                    <select className="custom-input" value={newProf.turno} onChange={e => setNewProf({ ...newProf, turno: e.target.value })}>
                      <option value="">Selecione...</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>
                </div>
                <div className="form-divider">Gestão de Carga Horária</div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Aulas Previstas (Carga Anual ou Semestral) *</label>
                    <input type="number" className="custom-input" placeholder="Ex: 200" value={newProf.cargaAnual} onChange={e => setNewProf({ ...newProf, cargaAnual: e.target.value })} required />
                    <small className="form-hint">O sistema avisará automaticamente quando se aproximar do limite estipulado.</small>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-green"><CheckCircle2 size={16} /> Salvar Cadastro</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Professores;
