import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { AppContext } from '../context/AppContext';
import { Search, Plus, ClipboardList, Check, X, ChevronRight, ChevronDown, Calendar, Trash2 } from 'lucide-react';
import './Sequencias.css';

const Sequencias = () => {
  const { professores, entregas, handleAddEntrega, toggleStatusProfessor, handleRemoverEntrega } = useContext(AppContext);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntrega, setNewEntrega] = useState({ titulo: '', tipo: 'Semanal', prazo: '' });

  // Accordion state
  const [expandedId, setExpandedId] = useState(null);

  const toggleAccordion = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if(!newEntrega.titulo || !newEntrega.prazo) return;
    
    handleAddEntrega(newEntrega);
    
    setNewEntrega({ titulo: '', tipo: 'Semanal', prazo: '' });
    setShowAddModal(false);
  };

  // Helper Stats
  const entregues = entregas.reduce((acc, ent) => {
      const sv = ent.statusVinculos || {};
      return acc + Object.values(sv).filter(s => s === 'entregue').length;
  }, 0);
  
  const pendentes = entregas.reduce((acc, ent) => {
      const sv = ent.statusVinculos || {};
      return acc + Object.values(sv).filter(s => s === 'pendente').length;
  }, 0);

  return (
    <div className="sequencias-container animate-fade-in stagger-1">
      <Card className="seq-main-card">
        {/* Header Title */}
        <div className="seq-header-title">
           <div className="summary-icon sequence-icon" style={{width: 50, height: 50}}><ClipboardList size={20} /></div>
           <h2 className="text-title">Painel de Entregas</h2>
        </div>

        {/* Toolbar */}
        <div className="seq-toolbar">
          <div className="search-bar">
            <Search size={18} color="var(--text-light)" />
            <input type="text" placeholder="Buscar sequência..." />
          </div>
          <button className="btn btn-green" onClick={() => setShowAddModal(true)}>
            <Plus size={18}/> Nova Entrega
          </button>
        </div>

        {/* Summary Box */}
        <div className="seq-summary-box stagger-2">
           <h2>{entregas.length} <span>Recolhimentos Cadastrados</span></h2>
           <div className="seq-stats">
              <span className="stat"><span className="dot green"></span> {entregues} Profs Entregaram</span>
              <span className="stat"><span className="dot red"></span> {pendentes} Pendências</span>
           </div>
        </div>

        {/* Accordion List */}
        <div className="seq-list-container stagger-3">
          {entregas.length === 0 ? (
             <div className="empty-state">Nenhuma entrega cadastrada ainda. Clique em "Nova Entrega" para começar.</div>
          ) : (
            entregas.map(entrega => {
              const sv = entrega.statusVinculos || {};
              const totalVinc = Object.keys(sv).length;
              const entregouCount = Object.values(sv).filter(s => s === 'entregue').length;
              const isExpanded = expandedId === entrega.id;

              return (
                <div key={entrega.id} className={`seq-accordion-item ${isExpanded ? 'expanded' : ''}`}>
                  {/* Accordion Header */}
                  <div className="seq-accordion-header" onClick={() => toggleAccordion(entrega.id)}>
                    <div className="seq-acc-info">
                      <div className="seq-acc-badge">{entrega.tipo}</div>
                      <h3 className="seq-acc-title">{entrega.titulo}</h3>
                    </div>
                    <div className="seq-acc-meta">
                      <div className="meta-item"><Calendar size={14}/> Prazo: <strong>{new Date(entrega.prazo).toLocaleDateString()}</strong></div>
                      <div className="meta-item">Progresso: <strong>{entregouCount}/{totalVinc}</strong></div>
                      <button className="icon-btn-delete" onClick={(e) => { e.stopPropagation(); handleRemoverEntrega(entrega.id); }}>
                         <Trash2 size={16}/>
                      </button>
                      <div className={`acc-chevron ${isExpanded ? 'rotated' : ''}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="seq-accordion-body animate-fade-in">
                      <table className="custom-table seq-inner-table">
                        <thead>
                          <tr>
                            <th>Professor</th>
                            <th>Disciplina</th>
                            <th>Status de Entrega</th>
                            <th>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {professores.map(prof => {
                             const profKeys = Object.keys(sv).filter(k => k.startsWith(`${prof.id}|`));
                             if (profKeys.length === 0) return null;
                             const allEntregue = profKeys.every(k => sv[k] === 'entregue');
                             const entregueCount = profKeys.filter(k => sv[k] === 'entregue').length;
                             return (
                               <tr key={prof.id}>
                                 <td style={{fontWeight: 700}}>{prof.nome}</td>
                                 <td style={{color: 'var(--text-light)'}}>{entregueCount}/{profKeys.length} disciplinas</td>
                                 <td>
                                    {allEntregue ? (
                                      <div className="status-label success"><Check size={14}/> Completo</div>
                                    ) : (
                                      <div className="status-label pending"><X size={14}/> Pendente</div>
                                    )}
                                 </td>
                                 <td>
                                    <button 
                                      className={`btn btn-small ${allEntregue ? 'btn-outline' : 'btn-green'}`}
                                      onClick={() => toggleStatusProfessor(entrega.id, prof.id)}
                                    >
                                      {allEntregue ? 'Desmarcar Tudo' : 'Marcar Tudo'}
                                    </button>
                                 </td>
                               </tr>
                             )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Decorative Banner */}
      <div className="seq-banner animate-fade-in" style={{animationDelay: '0.1s'}}>
        <h3>Lembre-se: revisar as sequências é fundamental para manter o planejamento em dia!</h3>
      </div>

      {/* Modal Nova Entrega */}
      {showAddModal && createPortal(
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up" style={{maxWidth: 500}}>
            <div className="modal-header">
              <h3>Cadastrar Nova Entrega</h3>
              <button className="icon-btn-close" onClick={() => setShowAddModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSubmit} className="add-prof-form-modal">
                <div className="form-group full-width">
                  <label>Título / Identificação</label>
                  <input type="text" className="custom-input" placeholder="Ex: Sequência 1ª Quinzena Abr" value={newEntrega.titulo} onChange={e => setNewEntrega({...newEntrega, titulo: e.target.value})} required/>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo (Frequência)</label>
                    <select className="custom-input" value={newEntrega.tipo} onChange={e => setNewEntrega({...newEntrega, tipo: e.target.value})}>
                        <option value="Semanal">Semanal</option>
                        <option value="Quinzenal">Quinzenal</option>
                        <option value="Mensal">Mensal</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Prazo Limite</label>
                    <input type="date" className="custom-input" value={newEntrega.prazo} onChange={e => setNewEntrega({...newEntrega, prazo: e.target.value})} required/>
                  </div>
                </div>
                <div className="modal-actions">
                   <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancelar</button>
                   <button type="submit" className="btn btn-green"><Plus size={16}/> Criar Entrega</button>
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

export default Sequencias;
