import React, { useContext, useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ClipboardList, CalendarDays, ChevronRight, Check, Play, Edit3, XCircle, Cake } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    tarefas, toggleTarefa,
    entregas, toggleStatusProfessor, professores,
    eventos, notas, perfil 
  } = useAppStore();

  // 1. Matemáticas para os Resumos
  const pendingTasks = tarefas.filter(t => !t.completed).length;
  
  // Última Sequência Ativa
  const ultimaEntrega = entregas.length > 0 ? entregas[0] : null;
  const pendenciasUltima = ultimaEntrega
    ? Object.values(ultimaEntrega.statusVinculos || {}).filter(v => (typeof v === 'object' ? v.status : v) === 'pendente').length
    : 0;

  // Calendário Matemático para HOJE
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  
  const eventosHoje = eventos.filter(ev => ev.data === todayStr).length;

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  


  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner card animate-fade-in">
        <div className="welcome-text">
          <h2>Bem-vinda, {perfil.nome}! {perfil.emoji}</h2>
          <p>Você tem <strong style={{color: 'var(--primary-pink)'}}>{pendingTasks}</strong> tarefas aguardando solução hoje.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <Card className="summary-card task-card stagger-1" style={{position: 'relative', overflow: 'hidden'}}>
          <div className="summary-icon task-icon"><CheckSquare size={24} /></div>
          <div className="summary-info">
            <h3>Minhas Tarefas</h3>
            <div className="summary-value"><span>{pendingTasks}</span> Pendentes</div>
          </div>
          <button className="dash-quick-link text-pink" onClick={() => navigate('/tarefas')}>Ver Todas <ChevronRight size={14}/></button>
        </Card>

        <Card className="summary-card sequence-card stagger-2" style={{position: 'relative', overflow: 'hidden'}}>
          <div className="summary-icon sequence-icon"><ClipboardList size={24} /></div>
          <div className="summary-info">
            <h3>Falta Entregar</h3>
            <div className="summary-value"><span>{pendenciasUltima > 9 ? pendenciasUltima : `0${pendenciasUltima}`}</span> Profs Pendentes</div>
          </div>
          <button className="dash-quick-link text-yellow" onClick={() => navigate('/sequencias')}>Ir pra Sequências <ChevronRight size={14}/></button>
        </Card>

        <Card className="summary-card event-card stagger-3" style={{position: 'relative', overflow: 'hidden'}}>
          <div className="summary-icon event-icon"><CalendarDays size={24} /></div>
          <div className="summary-info">
            <h3>Atividades Escolares</h3>
            <p>{eventosHoje === 0 ? 'Agenda livre hoje' : `Você possui atividade hoje!`}</p>
            <div className="summary-value"><span>{eventosHoje > 9 ? eventosHoje : `0${eventosHoje}`}</span> Eventos Hoje</div>
          </div>
          <button className="dash-quick-link text-purple" onClick={() => navigate('/calendario')}>Abrir Calendário <ChevronRight size={14}/></button>
        </Card>
      </div>

      {/* Main Grid Content */}
      <div className="dashboard-grid">
        {/* Left Column: Sequences Table */}
        <Card className="grid-card sequences-table-card stagger-4" 
          title="Status da Última Entrega" 
          subtitle={ultimaEntrega ? ultimaEntrega.titulo : 'Nenhuma sequência ativa'}
          action={
            <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => navigate('/sequencias')}>
              Gerenciar Tudo
            </button>
          }>
          
          <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
            <table className="custom-table dash-table">
              <thead>
                <tr>
                  <th>Professor(a)</th>
                  <th>Matéria</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!ultimaEntrega || professores.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', color: 'var(--text-light)', padding: '2rem'}}>Sem dados para exibir. Vá em "Sequências" e cadastre.</td>
                  </tr>
                ) : (
                  professores.map(prof => {
                     const sv = ultimaEntrega.statusVinculos || {};
                     const profKeys = Object.keys(sv).filter(k => k.startsWith(`${prof.id}|`));
                     if (profKeys.length === 0) return null;
                     const getS = (v) => typeof v === 'object' ? v.status : v;
                     const allEntregue = profKeys.every(k => getS(sv[k]) === 'entregue');
                     const entregueCount = profKeys.filter(k => getS(sv[k]) === 'entregue').length;
                     return (
                       <tr key={prof.id}>
                          <td>{prof.nome}</td>
                          <td><Badge type="light">{entregueCount}/{profKeys.length} disc.</Badge></td>
                          <td>
                             {allEntregue ? (
                                <div className="status-label success"><Check size={14}/> Completo</div>
                             ) : (
                                <div className="status-label warning"><XCircle size={14}/> Pendente</div>
                             )}
                          </td>
                          <td>
                             <button 
                                className={`btn btn-small ${allEntregue ? 'btn-outline' : 'btn-green'}`} 
                                onClick={() => toggleStatusProfessor(ultimaEntrega.id, prof.id)}
                              >
                                {allEntregue ? 'Desfazer' : 'Confirmar Tudo'}
                             </button>
                          </td>
                       </tr>
                     );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Column: Events & Mini-Calendar */}
        <Card className="grid-card events-widget stagger-5" title={<><Cake size={18} style={{ color: 'var(--primary-pink)' }} /> Aniversariantes do Mês</>} action={<span style={{fontSize: '0.8rem', color: 'var(--primary-purple)', cursor: 'pointer', fontWeight: 700}} onClick={()=>navigate('/professores/cadastro')}>Ver Todos &gt;</span>}>
          <style>{`
            @keyframes fireworksGradient {
              0% { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
          `}</style>
          {(() => {
            const currentMonth = today.getMonth(); // 0-11
            const aniversariantes = professores.filter(p => {
              if (!p.dataAniversario) return false;
              const parts = p.dataAniversario.split('-');
              const mesAniv = parseInt(parts[1], 10) - 1; // month 0-indexed
              return mesAniv === currentMonth;
            }).sort((a, b) => {
              const diaA = parseInt(a.dataAniversario.split('-')[2], 10);
              const diaB = parseInt(b.dataAniversario.split('-')[2], 10);
              return diaA - diaB;
            });

            if (aniversariantes.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-light)' }}>
                  <Cake size={32} style={{ color: 'var(--border-color)', marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhum aniversariante em {monthNames[currentMonth]}.</p>
                </div>
              );
            }

            return (
              <div className="birthdays-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.5rem 1rem 1rem' }}>
                {aniversariantes.map(prof => {
                  const dia = prof.dataAniversario.split('-')[2];
                  const isToday = prof.dataAniversario.slice(5) === `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  
                  return (
                    <div key={prof.id} className={`birthday-item ${isToday ? 'is-today' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      background: isToday ? 'linear-gradient(135deg, #fff0f6 0%, #fdf4fc 100%)' : '#faf8ff',
                      border: isToday ? '1.5px solid #ffdeeb' : '1px solid #f0ecf5',
                      boxShadow: isToday ? '0 4px 12px rgba(236, 72, 153, 0.08)' : 'none',
                      transition: 'all 0.2s var(--smooth-easing)'
                    }}>
                      <div className="birthday-date" style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: isToday ? 'linear-gradient(135deg, var(--primary-pink) 0%, #f472b6 100%)' : '#fff',
                        color: isToday ? '#fff' : 'var(--primary-purple)',
                        border: isToday ? 'none' : '1px solid #e5dcf7',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: isToday ? '0 2px 8px rgba(244, 114, 182, 0.35)' : '0 1px 3px rgba(0,0,0,0.02)'
                      }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1, marginBottom: '2px', opacity: isToday ? 0.9 : 0.6 }}>Dia</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1 }}>{dia}</span>
                      </div>
                      
                      <div className="birthday-info" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prof.nome}
                        </div>
                        {isToday && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary-pink)', marginTop: '0.15rem', fontWeight: 700 }}>
                            🎂 É o dia especial!
                          </div>
                        )}
                      </div>

                      {isToday && (
                        <div className="birthday-badge" style={{
                          background: 'linear-gradient(90deg, #ff0f7b 0%, #f89b29 25%, #ff0f7b 50%, #f89b29 75%, #ff0f7b 100%)',
                          backgroundSize: '200% auto',
                          animation: 'fireworksGradient 3s linear infinite',
                          color: '#fff',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          padding: '0.25rem 0.7rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          letterSpacing: '0.5px',
                          boxShadow: '0 3px 10px rgba(255, 15, 123, 0.4)'
                        }}>
                          HOJE!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Card>
      </div>

      <div className="dashboard-bottom-grid stagger-6">
        <Card className="grid-card my-tasks-list" title="Prioridades Abertas">
           <ul className="task-list widget-list interactive">
             {tarefas.filter(t => !t.completed).slice(0, 4).map(t => (
                 <li key={t.id} style={{padding: '0.8rem 1rem'}}>
                   <label style={{margin: 0}}><input type="checkbox" checked={t.completed} onChange={() => toggleTarefa(t.id)}/> <span>{t.text}</span></label>
                 </li>
             ))}
             {tarefas.filter(t => !t.completed).length === 0 && (
                <div style={{color: 'var(--text-light)', fontSize: '0.9rem'}}>Nenhuma pendência prioritária. Tudo em dia!</div>
             )}
           </ul>
           <button className="btn btn-green" onClick={() => navigate('/tarefas')} style={{margin: '1rem 1rem 0 1rem'}}>Ir ao Hub de Tarefas</button>
        </Card>

        <Card className="grid-card quick-notes" title={<><Edit3 size={20}/> Suas Anotações</>}>
           <ul className="notes-list widget-list">
             {notas.slice(0, 4).map(nota => (
                 <li key={nota.id} style={{borderLeft: '3px solid var(--primary-pink)', borderRadius: '0 8px 8px 0', padding: '0.8rem 1rem'}}>
                   {nota.text}
                 </li>
             ))}
             {notas.length === 0 && (
                <div style={{color: 'var(--text-light)', fontSize: '0.9rem'}}>Sem notas de rascunho recentes.</div>
             )}
           </ul>
           <button className="btn btn-outline" onClick={() => navigate('/tarefas')} style={{margin: '1rem 1rem 0 1rem', borderColor: 'transparent', textAlign: 'left', color: 'var(--text-muted)'}}>+ Gerenciar anotações no Bloco</button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
