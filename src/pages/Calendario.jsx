import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import { Search, Plus, Calendar as CalendarIcon, Star, MessageCircle, Folder, ChevronLeft, ChevronRight, BookOpen, X, Trash2, CheckSquare, Sun } from 'lucide-react';
import './Calendario.css';

const Calendario = () => {
  const { eventos, handleAddEvento, handleRemoverEvento } = useContext(AppContext);

  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('Todos'); // 'Todos', 'Eventos', 'Reuniões', 'Atividades Escolares', 'Feriados', 'Outros'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ titulo: '', data: '', tipo: 'Reuniões' });

  // Navigation Logic
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Generate Calendar Matrix
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)

  const daysInMonth = getDaysInMonth(currentYear, currentDate.getMonth());
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentDate.getMonth());
  const prevLastDay = getDaysInMonth(currentYear, currentDate.getMonth() - 1);

  // Create array of days for the grid
  const calendarCells = [];
  
  // Previous month filler days
  for (let x = firstDayIndex; x > 0; x--) {
    calendarCells.push({ day: prevLastDay - x + 1, current: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ day: i, current: true, dateObj: new Date(currentYear, currentDate.getMonth(), i) });
  }
  // Next month filler days (to complete the last row or two)
  const remainingCells = 42 - calendarCells.length; // 6 rows * 7 days
  for (let j = 1; j <= remainingCells; j++) {
    calendarCells.push({ day: j, current: false });
  }

  // Filter Events Logic
  const filteredEventos = eventos.filter(ev => {
    const matchesFilter = filter === 'Todos' || ev.tipo === filter;
    const matchesSearch = ev.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Upcoming Events list
  const todayObj = new Date();
  todayObj.setHours(0,0,0,0);
  
  const upcomingEvents = filteredEventos
    .filter(ev => {
      // Split date string 'YYYY-MM-DD' ensuring local timezone parse won't shift day
      const [year, month, d] = ev.data.split('-');
      const eveDate = new Date(year, month - 1, d);
      return eveDate >= todayObj;
    })
    .sort((a, b) => {
      const [yA, mA, dA] = a.data.split('-');
      const [yB, mB, dB] = b.data.split('-');
      return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
    })
    .slice(0, 4); // Limited to 4 close events

  // Handle Form Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if(!newEvent.titulo || !newEvent.data) return;
    handleAddEvento(newEvent);
    setNewEvent({ titulo: '', data: '', tipo: 'Reuniões' });
    setShowAddModal(false);
  };

  // Helper UI mapper
  const getTypeConfig = (tipo) => {
    switch(tipo){
      case 'Reuniões': return { icon: <MessageCircle size={12}/>, colorClass: 'meeting', fill: 'var(--primary-blue)' };
      case 'Atividades Escolares': return { icon: <Folder size={12}/>, colorClass: 'school-activity', fill: 'var(--warning-yellow)' };
      case 'Eventos': return { icon: <Star size={12}/>, colorClass: 'event', fill: 'var(--primary-pink)' };
      case 'Feriados': return { icon: <Sun size={12}/>, colorClass: 'holiday', fill: '#10b981' };
      case 'Tarefas': return { icon: <CheckSquare size={12}/>, colorClass: 'other', fill: '#8b5cf6' };
      case 'Outros': return { icon: <CalendarIcon size={12}/>, colorClass: 'other', fill: 'var(--primary-purple)' };
      default: return { icon: <Star size={12}/>, colorClass: 'event', fill: 'var(--primary-pink)' };
    }
  };

  return (
    <div className="calendario-container animate-fade-in stagger-1">
      <Card className="cal-main-card">
        {/* Header Title */}
        <div className="cal-toolbar">
          <div className="seq-header-title" style={{marginBottom: 0}}>
             <div className="summary-icon event-icon" style={{width: 50, height: 50}}><CalendarIcon size={20} /></div>
             <h2 className="text-title">Calendário</h2>
          </div>
          <div className="cal-actions">
            <div className="search-bar">
              <Search size={18} color="var(--text-light)" />
              <input type="text" placeholder="Buscar eventos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button className="btn btn-green" onClick={() => setShowAddModal(true)}>
              <Plus size={18}/> Novo Evento
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="cal-tabs">
          <button className={`tab-btn ${filter === 'Todos' ? 'active' : ''}`} onClick={() => setFilter('Todos')}>
            <CalendarIcon size={16} color="currentColor"/> Todos
          </button>
          <button className={`tab-btn ${filter === 'Eventos' ? 'active' : ''}`} onClick={() => setFilter('Eventos')}>
            <Star size={16} fill="var(--primary-pink)" color="currentColor"/> Eventos
          </button>
          <button className={`tab-btn ${filter === 'Tarefas' ? 'active' : ''}`} onClick={() => setFilter('Tarefas')}>
            <CheckSquare size={16} fill="#8b5cf6" color="currentColor"/> Tarefas
          </button>
          <button className={`tab-btn ${filter === 'Reuniões' ? 'active' : ''}`} onClick={() => setFilter('Reuniões')}>
            <MessageCircle size={16} fill="var(--primary-blue)" color="currentColor"/> Reuniões
          </button>
          <button className={`tab-btn ${filter === 'Atividades Escolares' ? 'active' : ''}`} onClick={() => setFilter('Atividades Escolares')}>
            <Folder size={16} fill="var(--warning-yellow)" color="currentColor"/> Atividades Escolares
          </button>
          <button className={`tab-btn ${filter === 'Feriados' ? 'active' : ''}`} onClick={() => setFilter('Feriados')}>
            <Sun size={16} fill="#10b981" color="currentColor"/> Feriados
          </button>
          <button className={`tab-btn ${filter === 'Outros' ? 'active' : ''}`} onClick={() => setFilter('Outros')}>
            <CalendarIcon size={16} fill="var(--primary-purple)" color="currentColor"/> Outros
          </button>
        </div>

        {/* Calendar Box */}
        <div className="cal-grid-box stagger-2">
           <div className="cal-month-header">
              <button className="icon-btn-small" onClick={prevMonth}><ChevronLeft size={20}/></button>
              <h2><Star size={18} fill="currentColor" color="var(--primary-purple)"/> {currentMonthName} {currentYear} <Star size={18} fill="currentColor" color="var(--primary-blue)"/></h2>
              <button className="icon-btn-small" onClick={nextMonth}><ChevronRight size={20}/></button>
           </div>
           
           <div className="full-calendar-grid">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                 <div key={d} className="fcal-day">{d}</div>
              ))}
              
              {calendarCells.map((cell, idx) => {
                let cellEvents = [];
                let isToday = false;
                
                if(cell.current) {
                  const checkDateStr = `${currentYear}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(cell.day).padStart(2,'0')}`;
                  cellEvents = filteredEventos.filter(ev => ev.data === checkDateStr);
                  
                  // Highlight today
                  const t = new Date();
                  if(cell.day === t.getDate() && currentDate.getMonth() === t.getMonth() && currentYear === t.getFullYear()) {
                    isToday = true;
                  }
                }

                return (
                  <div key={idx} className={`fcal-date ${!cell.current ? 'disabled' : ''} ${isToday ? 'is-today' : ''} ${cellEvents.length > 0 ? 'active-event-cell' : ''}`}>
                    <span className="date-number">{cell.day}</span>
                    <div className="events-stack">
                      {cellEvents.map(ev => {
                         const config = getTypeConfig(ev.tipo);
                         return (
                           <div key={ev.id} className={`event-pill ${config.colorClass}`} title={ev.titulo}>
                             {config.icon} {ev.titulo}
                           </div>
                         )
                      })}
                    </div>
                  </div>
                )
              })}
           </div>
        </div>

        {/* Upcoming Events List */}
        <div className="upcoming-events-list stagger-3">
           <div className="list-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
              <h3 className="text-subtitle">Próximos em Pauta</h3>
           </div>
           
           {upcomingEvents.length === 0 ? (
             <div className="empty-state" style={{border: 'none', background: 'transparent'}}>
               Nenhum evento futuro encontrado para esta seleção.
             </div>
           ) : (
             upcomingEvents.map(ev => {
               const config = getTypeConfig(ev.tipo);
               const [y, m, d] = ev.data.split('-');
               return (
                 <div key={ev.id} className="upcoming-event-item">
                    <div className="date-badge" style={{ backgroundColor: config.fill }}>{d}</div>
                    <div className="event-item-info">
                       <span className="event-name">{ev.titulo}</span>
                       <span className="event-type-mute">{ev.tipo}</span>
                    </div>
                    <button className="icon-btn-delete" style={{marginLeft: 'auto'}} onClick={() => handleRemoverEvento(ev.id)}>
                      <Trash2 size={16}/>
                    </button>
                 </div>
               );
             })
           )}
        </div>
      </Card>

      {/* Decorative Banner Bottom */}
      <div className="cal-banner animate-fade-in stagger-4">
         <BookOpen size={40} color="var(--primary-purple)" style={{marginBottom: '10px'}}/>
         <p style={{color: 'var(--text-muted)', fontWeight: 700, margin: 0}}>Planejar antes de acontecer, registrar pra nunca esquecer!</p>
      </div>

       {/* Modal Novo Evento */}
       {showAddModal && createPortal(
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up" style={{maxWidth: 450}}>
            <div className="modal-header">
              <h3>Agendar Atividade</h3>
              <button className="icon-btn-close" onClick={() => setShowAddModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSubmit} className="add-prof-form-modal">
                <div className="form-group full-width">
                  <label>Título do Evento</label>
                  <input type="text" className="custom-input" placeholder="Ex: Avaliação Bimestral" value={newEvent.titulo} onChange={e => setNewEvent({...newEvent, titulo: e.target.value})} required/>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Categoria</label>
                    <select className="custom-input" value={newEvent.tipo} onChange={e => setNewEvent({...newEvent, tipo: e.target.value})}>
                        <option value="Reuniões">Reunião</option>
                        <option value="Atividades Escolares">Atividade Escolar</option>
                        <option value="Eventos">Evento</option>
                        <option value="Feriados">Feriado</option>
                        <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Data</label>
                    <input type="date" className="custom-input" value={newEvent.data} onChange={e => setNewEvent({...newEvent, data: e.target.value})} required/>
                  </div>
                </div>
                <div className="modal-actions">
                   <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancelar</button>
                   <button type="submit" className="btn btn-green"><Plus size={16}/> Salvar Agendamento</button>
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

export default Calendario;
