import React, { useContext, useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ClipboardList, CalendarDays, ChevronRight, Check, Play, Edit3, XCircle } from 'lucide-react';
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
    ? Object.values(ultimaEntrega.statusVinculos || {}).filter(s => s === 'pendente').length
    : 0;

  // Calendário Matemático para HOJE
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  
  const eventosHoje = eventos.filter(ev => ev.data === todayStr).length;

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  // Grade Mini-Calendário
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
  const firstDayIndex = getFirstDayOfMonth(today.getFullYear(), today.getMonth());
  const prevLastDay = getDaysInMonth(today.getFullYear(), today.getMonth() - 1);

  const miniCalCells = [];
  for (let x = firstDayIndex; x > 0; x--) { miniCalCells.push({ day: prevLastDay - x + 1, current: false }); }
  for (let i = 1; i <= daysInMonth; i++) {
     let hasEvent = eventos.some(ev => ev.data === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`);
     miniCalCells.push({ day: i, current: true, hasEvent }); 
  }
  const remainingCells = 42 - miniCalCells.length;
  for (let j = 1; j <= remainingCells; j++) { miniCalCells.push({ day: j, current: false }); }

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
                     const allEntregue = profKeys.every(k => sv[k] === 'entregue');
                     const entregueCount = profKeys.filter(k => sv[k] === 'entregue').length;
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
        <Card className="grid-card events-widget stagger-5" title="Resumo do Mês" action={<span style={{fontSize: '0.8rem', color: 'var(--primary-purple)', cursor: 'pointer', fontWeight: 700}} onClick={()=>navigate('/calendario')}>Detalhes &gt;</span>}>
          <div className="mini-calendar" onClick={() => navigate('/calendario')} style={{cursor: 'pointer'}}>
            <div className="calendar-header">
              <h3>{monthNames[today.getMonth()]} {today.getFullYear()}</h3>
            </div>
            <div className="calendar-grid">
              <div className="cal-day">D</div><div className="cal-day">S</div><div className="cal-day">T</div>
              <div className="cal-day">Q</div><div className="cal-day">Q</div><div className="cal-day">S</div><div className="cal-day">S</div>
              
              {miniCalCells.map((cell, idx) => {
                 const isToday = cell.current && cell.day === today.getDate();
                 return (
                   <div key={idx} className={`cal-date ${!cell.current ? 'disabled-date' : ''} ${isToday ? 'today' : ''} ${cell.hasEvent && !isToday ? 'has-event-dot' : ''}`}>
                     {cell.day}
                   </div>
                 )
              })}
            </div>
          </div>
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
