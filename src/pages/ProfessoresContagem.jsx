import React, { useState, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Card from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, BookOpen, GraduationCap, Plus, X, CalendarDays, MessageSquare, Trash2 } from 'lucide-react';
import './Professores.css';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const ProfessoresContagem = () => {
  const { professores, turmas = [], handleRegistrarAula, handleRemoverAula } = useAppStore();

  const [expandedProf, setExpandedProf] = useState(null);
  const [activeVinculo, setActiveVinculo] = useState(null); // { profId, chave, turmaId, disciplina }
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [showAddAula, setShowAddAula] = useState(false);
  const [newAula, setNewAula] = useState({ data: '', observacao: '' });

  // Get CH from turma for a specific disciplina
  const getCHForDisciplina = (turmaId, disciplina) => {
    const turma = turmas.find(t => String(t.id) === String(turmaId));
    if (!turma || !turma.disciplinas) return 0;
    const disc = turma.disciplinas.find(d => (typeof d === 'string' ? d : d.nome) === disciplina);
    if (!disc) return 0;
    return typeof disc === 'string' ? 0 : parseInt(disc.cargaHoraria) || 0;
  };

  const getTurmaNome = (id) => {
    const t = turmas.find(t => String(t.id) === String(id));
    return t ? t.nome : id;
  };

  const getProgressVisuals = (dadas, total) => {
    if (total === 0) return { percentage: '0.0', isCompleted: false, isWarning: false, remaining: 0, barClass: 'bg-primary' };
    const calc = (dadas / total) * 100;
    const isCompleted = calc >= 100;
    const isWarning = calc >= 80 && !isCompleted;
    return {
      percentage: Math.min(calc, 100).toFixed(1),
      isCompleted,
      isWarning,
      remaining: total - dadas,
      barClass: isCompleted ? 'bg-success' : (isWarning ? 'bg-warning' : 'bg-primary')
    };
  };

  // Total aulas for a professor across all vinculos
  const getTotalAulas = (prof) => {
    const reg = prof.registroAulas || {};
    return Object.values(reg).reduce((sum, arr) => sum + arr.length, 0);
  };

  // Calendar helpers
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handleOpenCalendar = (profId, turmaId, disciplina) => {
    const chave = `${turmaId}|${disciplina}`;
    setActiveVinculo({ profId, chave, turmaId, disciplina });
    setShowAddAula(false);
    setNewAula({ data: new Date().toISOString().split('T')[0], observacao: '' });
  };

  const handleCloseCalendar = () => {
    setActiveVinculo(null);
    setShowAddAula(false);
  };

  const handleAddAulaSubmit = () => {
    if (!newAula.data || !activeVinculo) return;
    handleRegistrarAula(activeVinculo.profId, activeVinculo.chave, newAula);
    setNewAula({ data: new Date().toISOString().split('T')[0], observacao: '' });
    setShowAddAula(false);
  };

  // Get aulas for active vinculo
  const activeAulas = useMemo(() => {
    if (!activeVinculo) return [];
    const prof = professores.find(p => p.id === activeVinculo.profId);
    if (!prof) return [];
    return (prof.registroAulas || {})[activeVinculo.chave] || [];
  }, [activeVinculo, professores]);

  // Aulas dates for calendar marking
  const aulaDatesCount = useMemo(() => {
    const counts = {};
    activeAulas.forEach(a => {
      counts[a.data] = (counts[a.data] || 0) + 1;
    });
    return counts;
  }, [activeAulas]);

  // Calendar grid
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(calMonth, calYear);
    const firstDay = getFirstDayOfMonth(calMonth, calYear);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calMonth, calYear]);

  const navigateMonth = (dir) => {
    let m = calMonth + dir;
    let y = calYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalMonth(m);
    setCalYear(y);
  };

  const handleCalendarDayClick = (day) => {
    if (!day) return;
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setNewAula({ data: dateStr, observacao: '' });
    setShowAddAula(true);
  };

  return (
    <div className="professores-container animate-fade-in stagger-1">
      {/* Header */}
      <div className="seq-header-title" style={{ marginBottom: '1rem' }}>
        <div className="summary-icon" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #f4a6c8 0%, #ea8eb6 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}><Clock size={20} /></div>
        <h2 className="text-title">Contagem de Aulas</h2>
      </div>

      <Card>
        <p className="text-body" style={{ marginBottom: '1.5rem' }}>Monitore e registre as aulas de cada professor por turma e disciplina. Clique em um professor para expandir os detalhes.</p>

        <div className="professores-list">
          {professores.map(prof => {
            const isExpanded = expandedProf === prof.id;
            const totalAulas = getTotalAulas(prof);

            return (
              <div key={prof.id} className={`professor-card-item contagem-card ${isExpanded ? 'expanded' : ''}`}>
                {/* Professor Header */}
                <button className="contagem-prof-header" onClick={() => setExpandedProf(isExpanded ? null : prof.id)}>
                  <div className="prof-info">
                    <div className="prof-avatar">{prof.nome.charAt(0)}</div>
                    <div>
                      <h4 className="prof-name">{prof.nome}</h4>
                      <span className="prof-subject">{totalAulas} aulas registradas</span>
                    </div>
                  </div>
                  <div className="contagem-toggle">
                    <span className="contagem-badge">{(prof.vinculos || []).reduce((a, v) => a + v.disciplinas.length, 0)} vínculos</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Expanded: Vinculo cards */}
                {isExpanded && (
                  <div className="contagem-vinculos animate-fade-in">
                    {(prof.vinculos || []).map(v => (
                      v.disciplinas.map(disc => {
                        const chave = `${v.turmaId}|${disc}`;
                        const aulas = (prof.registroAulas || {})[chave] || [];
                        const ch = getCHForDisciplina(v.turmaId, disc);
                        const vis = getProgressVisuals(aulas.length, ch);
                        const turmaNome = getTurmaNome(v.turmaId);

                        return (
                          <div key={chave} className="contagem-vinculo-card">
                            <div className="contagem-vinculo-header">
                              <div className="contagem-vinculo-info">
                                <span className="contagem-turma"><GraduationCap size={13} /> {turmaNome}</span>
                                <span className="contagem-disc"><BookOpen size={13} /> {disc}</span>
                              </div>
                              <button className="btn btn-outline btn-small" onClick={() => handleOpenCalendar(prof.id, v.turmaId, disc)}>
                                <CalendarDays size={14} /> Registrar
                              </button>
                            </div>

                            {/* Progress */}
                            <div className="progress-section compact">
                              <div className="progress-labels">
                                <span><strong>{aulas.length}</strong> aulas dadas</span>
                                <span>Meta: <strong>{ch}</strong>{ch > 0 ? ' aulas' : ' (sem CH)'}</span>
                              </div>
                              <div className="progress-track">
                                <div className={`progress-fill ${vis.barClass}`} style={{ width: `${vis.percentage}%` }}></div>
                              </div>
                              <div className="progress-footer">
                                {vis.isCompleted ? (
                                  <span className="status-badge complete"><CheckCircle2 size={12} /> CH Cumprida</span>
                                ) : vis.isWarning ? (
                                  <span className="status-badge warning"><AlertCircle size={12} /> Faltam {vis.remaining}</span>
                                ) : (
                                  <span className="status-badge normal"><Clock size={12} /> Faltam {vis.remaining}</span>
                                )}
                                <span className="percentage-text">{vis.percentage}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ))}
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

      {/* Summary */}
      <div className="professores-summary-row stagger-2">
        <Card className="summary-mini-card" style={{ background: 'linear-gradient(135deg, #fcedf4 0%, #f7e6f8 100%)', borderColor: 'var(--primary-pink)' }}>
          <h3 className="text-subtitle" style={{ color: 'var(--primary-purple)', marginBottom: '1rem' }}>Retrato Geral</h3>
          <div className="mini-stat">
            <div className="stat-label">Total de Professores</div>
            <div className="stat-number">{professores.length}</div>
          </div>
          <div className="mini-stat">
            <div className="stat-label">Total de Aulas Registradas</div>
            <div className="stat-number green">{professores.reduce((a, p) => a + getTotalAulas(p), 0)}</div>
          </div>
          <div className="mini-stat border-none">
            <div className="stat-label">Vínculos Turma-Disciplina</div>
            <div className="stat-number purple">{professores.reduce((a, p) => a + (p.vinculos || []).reduce((x, v) => x + v.disciplinas.length, 0), 0)}</div>
          </div>
        </Card>
      </div>

      {/* ====== CALENDAR MODAL ====== */}
      {activeVinculo && createPortal(
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h3>Registro de Aulas</h3>
                <div className="cal-modal-subtitle">
                  <span className="contagem-turma"><GraduationCap size={13} /> {getTurmaNome(activeVinculo.turmaId)}</span>
                  <span className="contagem-disc"><BookOpen size={13} /> {activeVinculo.disciplina}</span>
                </div>
              </div>
              <button className="icon-btn-close" onClick={handleCloseCalendar}><X size={20} /></button>
            </div>

            <div className="modal-body">
              {/* Calendar */}
              <div className="aula-calendar">
                <div className="cal-nav">
                  <button type="button" className="cal-nav-btn" onClick={() => navigateMonth(-1)}>‹</button>
                  <span className="cal-nav-title">{MESES[calMonth]} {calYear}</span>
                  <button type="button" className="cal-nav-btn" onClick={() => navigateMonth(1)}>›</button>
                </div>

                <div className="cal-grid">
                  {DIAS_SEMANA.map(d => <div key={d} className="cal-dow">{d}</div>)}
                  {calendarGrid.map((day, i) => {
                    if (day === null) return <div key={`e${i}`} className="cal-cell empty" />;
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const aulasCount = aulaDatesCount[dateStr] || 0;
                    const hasAula = aulasCount > 0;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`cal-cell ${hasAula ? 'marked' : ''} ${isToday ? 'today' : ''}`}
                        onClick={() => handleCalendarDayClick(day)}
                        title={hasAula ? `${aulasCount} aula(s) registrada(s)` : 'Clique para registrar'}
                      >
                        {day}
                        {hasAula && <span className="cal-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', width: aulasCount > 1 ? '14px' : '5px', height: aulasCount > 1 ? '14px' : '5px', bottom: aulasCount > 1 ? '-2px' : '3px', right: aulasCount > 1 ? '-2px' : 'auto', color: 'white', fontWeight: 'bold' }}>{aulasCount > 1 ? aulasCount : ''}</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="cal-legend">
                  <span><span className="cal-dot-legend marked" /> Aula registrada</span>
                  <span><span className="cal-dot-legend today" /> Hoje</span>
                </div>
              </div>

              {/* Add Aula inline form */}
              {showAddAula && (
                <div className="add-aula-form animate-fade-in">
                  <div className="form-divider" style={{ marginTop: 0 }}>Nova Aula — {new Date(newAula.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                  <div className="form-group full-width">
                    <label>Observação (opcional)</label>
                    <input type="text" className="custom-input" placeholder="Ex: Revisão para prova, Experiência no lab..." value={newAula.observacao} onChange={e => setNewAula({ ...newAula, observacao: e.target.value })} />
                  </div>
                  <div className="modal-actions" style={{ marginTop: '0.8rem' }}>
                    <button type="button" className="btn btn-outline btn-small" onClick={() => setShowAddAula(false)}>Cancelar</button>
                    <button type="button" className="btn btn-green btn-small" onClick={handleAddAulaSubmit}><Plus size={14} /> Registrar Aula</button>
                  </div>
                </div>
              )}

              {/* Lesson history */}
              <div className="aula-history">
                <h4 className="aula-history-title">Histórico de Aulas ({activeAulas.length})</h4>
                {activeAulas.length > 0 ? (
                  <div className="aula-history-list">
                    {[...activeAulas].sort((a, b) => b.data.localeCompare(a.data)).map((aula, idx) => {
                      const originalIdx = activeAulas.indexOf(aula);
                      return (
                        <div key={idx} className="aula-history-item">
                          <div className="aula-history-left">
                            <CalendarDays size={14} />
                            <span className="aula-history-date">{new Date(aula.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                            {aula.observacao && (
                              <span className="aula-history-obs"><MessageSquare size={12} /> {aula.observacao}</span>
                            )}
                          </div>
                          <button className="aula-history-delete" onClick={() => handleRemoverAula(activeVinculo.profId, activeVinculo.chave, originalIdx)} title="Remover aula">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '1rem' }}>Nenhuma aula registrada ainda.</div>
                )}
              </div>

              {!showAddAula && (
                <button className="btn btn-green mobile-full-width" style={{ marginTop: '1rem' }} onClick={() => { setNewAula({ data: new Date().toISOString().split('T')[0], observacao: '' }); setShowAddAula(true); }}>
                  <Plus size={16} /> Registrar Nova Aula
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProfessoresContagem;
