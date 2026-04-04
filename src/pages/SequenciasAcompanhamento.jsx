import React, { useState, useContext, useMemo } from 'react';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import { Search, ClipboardList, Check, X, ChevronDown, ChevronUp, Calendar, GraduationCap, BookOpen } from 'lucide-react';
import './Sequencias.css';

const SequenciasAcompanhamento = () => {
  const { professores, turmas, entregas, toggleStatusVinculo } = useContext(AppContext);

  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProfs, setExpandedProfs] = useState({});

  const toggleAccordion = (id) => {
    setExpandedId(prev => prev === id ? null : id);
    setExpandedProfs({});
  };

  const toggleProfExpanded = (entregaId, profId) => {
    const key = `${entregaId}_${profId}`;
    setExpandedProfs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getTurmaNome = (id) => {
    const t = turmas.find(t => String(t.id) === String(id));
    return t ? t.nome : id;
  };

  // Derive professor-level status from statusVinculos
  const getProfStatusForEntrega = (entrega, profId) => {
    const sv = entrega.statusVinculos || {};
    const profKeys = Object.keys(sv).filter(k => k.startsWith(`${profId}|`));
    if (profKeys.length === 0) return { total: 0, entregues: 0, allDone: false };
    const entregues = profKeys.filter(k => sv[k] === 'entregue').length;
    return {
      total: profKeys.length,
      entregues,
      allDone: entregues === profKeys.length
    };
  };

  // Global stats
  const stats = useMemo(() => {
    let totalVinculos = 0;
    let entregueVinculos = 0;
    entregas.forEach(e => {
      const sv = e.statusVinculos || {};
      totalVinculos += Object.keys(sv).length;
      entregueVinculos += Object.values(sv).filter(s => s === 'entregue').length;
    });
    return { totalVinculos, entregueVinculos, pendentes: totalVinculos - entregueVinculos };
  }, [entregas]);

  const filteredEntregas = entregas.filter(e =>
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="sequencias-container animate-fade-in stagger-1">
      <Card className="seq-main-card">
        {/* Header Title */}
        <div className="seq-header-title">
          <div className="summary-icon sequence-icon" style={{ width: 50, height: 50 }}><ClipboardList size={20} /></div>
          <h2 className="text-title">Acompanhamento de Entregas</h2>
        </div>

        {/* Toolbar */}
        <div className="seq-toolbar">
          <div className="search-bar">
            <Search size={18} color="var(--text-light)" />
            <input
              type="text"
              placeholder="Buscar sequência..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Box */}
        <div className="seq-summary-box stagger-2">
          <h2>{entregas.length} <span>Sequências Cadastradas</span></h2>
          <div className="seq-stats">
            <span className="stat"><span className="dot green"></span> {stats.entregueVinculos} Entregues</span>
            <span className="stat"><span className="dot red"></span> {stats.pendentes} Pendentes</span>
          </div>
        </div>

        {/* Accordion List */}
        <div className="seq-list-container stagger-3">
          {filteredEntregas.length === 0 ? (
            <div className="empty-state">Nenhuma sequência encontrada.</div>
          ) : (
            filteredEntregas.map(entrega => {
              const sv = entrega.statusVinculos || {};
              const totalVinc = Object.keys(sv).length;
              const entregueVinc = Object.values(sv).filter(s => s === 'entregue').length;
              const isExpanded = expandedId === entrega.id;
              const percentage = totalVinc > 0 ? Math.round((entregueVinc / totalVinc) * 100) : 0;

              return (
                <div key={entrega.id} className={`seq-accordion-item ${isExpanded ? 'expanded' : ''}`}>
                  {/* Accordion Header */}
                  <div className="seq-accordion-header" onClick={() => toggleAccordion(entrega.id)}>
                    <div className="seq-acc-info">
                      <div className="seq-acc-badge">{entrega.tipo}</div>
                      <h3 className="seq-acc-title">{entrega.titulo}</h3>
                    </div>
                    <div className="seq-acc-meta">
                      <div className="meta-item"><Calendar size={14} /> Prazo: <strong>{formatDate(entrega.prazo)}</strong></div>
                      <div className="meta-item">Progresso: <strong>{entregueVinc}/{totalVinc}</strong> <span className="acomp-percentage">({percentage}%)</span></div>
                      <div className={`acc-chevron ${isExpanded ? 'rotated' : ''}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Accordion Body — Professors */}
                  {isExpanded && (
                    <div className="seq-accordion-body animate-fade-in">
                      {/* Mini progress bar */}
                      <div className="acomp-progress-bar-wrapper">
                        <div className="acomp-progress-track">
                          <div className="acomp-progress-fill" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="acomp-progress-label">{percentage}% concluído</span>
                      </div>

                      {/* Professor cards */}
                      <div className="acomp-prof-list">
                        {professores.map(prof => {
                          const profStatus = getProfStatusForEntrega(entrega, prof.id);
                          if (profStatus.total === 0) return null;
                          const isProfExpanded = expandedProfs[`${entrega.id}_${prof.id}`];

                          return (
                            <div key={prof.id} className={`acomp-prof-card ${profStatus.allDone ? 'completed' : ''}`}>
                              {/* Professor header */}
                              <button
                                className="acomp-prof-header"
                                onClick={() => toggleProfExpanded(entrega.id, prof.id)}
                              >
                                <div className="acomp-prof-left">
                                  <div className="acomp-prof-avatar">{prof.nome.charAt(0)}</div>
                                  <div className="acomp-prof-info">
                                    <span className="acomp-prof-name">{prof.nome}</span>
                                    <span className="acomp-prof-count">
                                      {profStatus.entregues}/{profStatus.total} disciplinas entregues
                                    </span>
                                  </div>
                                </div>
                                <div className="acomp-prof-right">
                                  {profStatus.allDone ? (
                                    <span className="acomp-status-chip done"><Check size={12} /> Completo</span>
                                  ) : (
                                    <span className="acomp-status-chip pending">
                                      {profStatus.total - profStatus.entregues} pendente{profStatus.total - profStatus.entregues > 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {isProfExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                              </button>

                              {/* Expanded: turma & disciplinas */}
                              {isProfExpanded && (
                                <div className="acomp-vinc-panel animate-fade-in">
                                  {(prof.vinculos || []).map(vinc => {
                                    const turmaName = getTurmaNome(vinc.turmaId);

                                    return (
                                      <div key={vinc.turmaId} className="acomp-turma-group">
                                        <div className="acomp-turma-label">
                                          <GraduationCap size={13} />
                                          <span>{turmaName}</span>
                                        </div>
                                        <div className="acomp-disc-list">
                                          {vinc.disciplinas.map(disc => {
                                            const chave = `${prof.id}|${vinc.turmaId}|${disc}`;
                                            const isEntregue = sv[chave] === 'entregue';

                                            return (
                                              <div key={chave} className={`acomp-disc-row ${isEntregue ? 'entregue' : ''}`}>
                                                <div className="acomp-disc-info">
                                                  <BookOpen size={13} />
                                                  <span className="acomp-disc-name">{disc}</span>
                                                </div>
                                                <button
                                                  className={`acomp-toggle-btn ${isEntregue ? 'done' : 'pending'}`}
                                                  onClick={() => toggleStatusVinculo(entrega.id, chave)}
                                                  title={isEntregue ? 'Desmarcar entrega' : 'Marcar como entregue'}
                                                >
                                                  {isEntregue ? (
                                                    <><Check size={13} /> Entregue</>
                                                  ) : (
                                                    <><X size={13} /> Pendente</>
                                                  )}
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default SequenciasAcompanhamento;
