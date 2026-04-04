import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import { Plus, ClipboardList, X, Calendar, CalendarRange, Send, Trash2 } from 'lucide-react';
import './Sequencias.css';

const SequenciasCadastro = () => {
  const { professores, entregas, handleAddEntrega, handleRemoverEntrega } = useContext(AppContext);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntrega, setNewEntrega] = useState({
    titulo: '',
    tipo: 'Semanal',
    execucaoInicio: '',
    execucaoFim: '',
    prazo: ''
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEntrega.titulo || !newEntrega.execucaoInicio || !newEntrega.execucaoFim || !newEntrega.prazo) return;

    handleAddEntrega(newEntrega);

    setNewEntrega({ titulo: '', tipo: 'Semanal', execucaoInicio: '', execucaoFim: '', prazo: '' });
    setShowAddModal(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const isPrazoPassed = (prazo) => {
    if (!prazo) return false;
    return new Date(prazo) < new Date(new Date().toISOString().split('T')[0]);
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date(new Date().toISOString().split('T')[0]);
    const target = new Date(dateStr);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="sequencias-container animate-fade-in stagger-1">
      <Card className="seq-main-card">
        {/* Header Title */}
        <div className="seq-header-title">
          <div className="summary-icon sequence-icon" style={{ width: 50, height: 50 }}><ClipboardList size={20} /></div>
          <h2 className="text-title">Cadastro de Sequências Didáticas</h2>
        </div>

        {/* Toolbar */}
        <div className="seq-toolbar">
          <p className="text-body">Cadastre as sequências didáticas, defina o período de execução e a data limite de entrega para a coordenação.</p>
          <button className="btn btn-green" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Nova Sequência
          </button>
        </div>

        {/* Entregas List */}
        <div className="seq-list-container stagger-2">
          {entregas.length === 0 ? (
            <div className="empty-state">Nenhuma sequência didática cadastrada ainda. Clique em "Nova Sequência" para começar.</div>
          ) : (
            entregas.map(entrega => {
              const sv = entrega.statusVinculos || {};
              const totalVinculos = Object.keys(sv).length;
              const entregueVinculos = Object.values(sv).filter(s => s === 'entregue').length;
              const prazoPassou = isPrazoPassed(entrega.prazo);
              const diasRestantes = getDaysUntil(entrega.prazo);

              return (
                <div key={entrega.id} className="seq-cadastro-item">
                  <div className="seq-cadastro-header">
                    <div className="seq-acc-info">
                      <div className="seq-acc-badge">{entrega.tipo}</div>
                      <h3 className="seq-acc-title">{entrega.titulo}</h3>
                    </div>
                    <div className="seq-acc-meta">
                      <div className="meta-item"><Calendar size={14} /> Progresso: <strong>{entregueVinculos}/{totalVinculos}</strong></div>
                      <button className="icon-btn-delete" onClick={() => handleRemoverEntrega(entrega.id)} title="Remover sequência">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="seq-cadastro-details">
                    <div className="seq-detail-item">
                      <CalendarRange size={15} className="detail-icon exec" />
                      <div className="seq-detail-text">
                        <span className="seq-detail-label">Período de Execução</span>
                        <span className="seq-detail-value">
                          {formatDate(entrega.execucaoInicio)} — {formatDate(entrega.execucaoFim)}
                        </span>
                      </div>
                    </div>
                    <div className="seq-detail-divider" />
                    <div className="seq-detail-item">
                      <Send size={15} className="detail-icon entrega" />
                      <div className="seq-detail-text">
                        <span className="seq-detail-label">Entrega p/ Coordenação</span>
                        <span className={`seq-detail-value ${prazoPassou ? 'vencido' : ''}`}>
                          {formatDate(entrega.prazo)}
                          {diasRestantes !== null && !prazoPassou && diasRestantes <= 7 && diasRestantes >= 0 && (
                            <span className="seq-detail-countdown warning">({diasRestantes === 0 ? 'Hoje!' : `${diasRestantes}d restantes`})</span>
                          )}
                          {prazoPassou && (
                            <span className="seq-detail-countdown expired">Vencido</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Banner */}
      <div className="seq-banner animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h3>Lembre-se: revisar as sequências é fundamental para manter o planejamento em dia!</h3>
      </div>

      {/* Modal Nova Sequência */}
      {showAddModal && createPortal(
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <h3>Cadastrar Nova Sequência Didática</h3>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>Preencha as informações abaixo para criar uma nova sequência.</p>
              </div>
              <button className="icon-btn-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSubmit} className="add-prof-form-modal">
                {/* Título */}
                <div className="form-group full-width">
                  <label>Título / Identificação</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Ex: Sequência 1ª Quinzena de Abril"
                    value={newEntrega.titulo}
                    onChange={e => setNewEntrega({ ...newEntrega, titulo: e.target.value })}
                    required
                  />
                  <span className="form-hint">Dê um nome descritivo para identificar esta sequência facilmente.</span>
                </div>

                {/* Tipo */}
                <div className="form-group full-width">
                  <label>Tipo (Frequência)</label>
                  <select className="custom-input" value={newEntrega.tipo} onChange={e => setNewEntrega({ ...newEntrega, tipo: e.target.value })}>
                    <option value="Semanal">Semanal</option>
                    <option value="Quinzenal">Quinzenal</option>
                    <option value="Mensal">Mensal</option>
                  </select>
                </div>

                {/* Período de Execução */}
                <div className="form-divider" style={{ marginTop: '0.5rem' }}>
                  <CalendarRange size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                  Período de Execução da Sequência
                </div>
                <span className="form-hint" style={{ marginTop: '-0.8rem' }}>
                  Defina o período em que os professores irão trabalhar esta sequência didática em sala de aula.
                </span>
                <div className="form-row">
                  <div className="form-group">
                    <label>Data Inicial</label>
                    <input
                      type="date"
                      className="custom-input"
                      value={newEntrega.execucaoInicio}
                      onChange={e => setNewEntrega({ ...newEntrega, execucaoInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Data Final</label>
                    <input
                      type="date"
                      className="custom-input"
                      value={newEntrega.execucaoFim}
                      onChange={e => setNewEntrega({ ...newEntrega, execucaoFim: e.target.value })}
                      min={newEntrega.execucaoInicio || undefined}
                      required
                    />
                  </div>
                </div>

                {/* Data de Entrega para Coordenação */}
                <div className="form-divider" style={{ marginTop: '0.5rem' }}>
                  <Send size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                  Data de Entrega para Coordenação
                </div>
                <span className="form-hint" style={{ marginTop: '-0.8rem' }}>
                  Data limite para os professores entregarem a sequência à coordenação para análise e autorização.
                </span>
                <div className="form-group full-width">
                  <label>Data Limite de Entrega</label>
                  <input
                    type="date"
                    className="custom-input"
                    value={newEntrega.prazo}
                    onChange={e => setNewEntrega({ ...newEntrega, prazo: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-green"><Plus size={16} /> Criar Sequência</button>
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

export default SequenciasCadastro;
