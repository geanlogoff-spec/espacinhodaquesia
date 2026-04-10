import React, { useState, useContext } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import { CheckSquare, Plus, Edit3, Trash2, AlertCircle, Bell, Calendar as CalendarIcon } from 'lucide-react';
import '../pages/Dashboard.css';
import './MinhasTarefas.css';

const MinhasTarefas = () => {
  const { 
    tarefas, handleAddTarefa, toggleTarefa, handleRemoverTarefa, 
    notas, handleAddNota, handleRemoverNota,
    eventos 
  } = useAppStore();

  // --- Local Form States ---
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('media');
  const [newTaskData, setNewTaskData] = useState(''); // New optional date field
  const [filter, setFilter] = useState('todas'); // 'todas', 'pendentes', 'concluidas'
  const [newNoteText, setNewNoteText] = useState('');

  // --- Task Handlers ---
  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    handleAddTarefa({
      text: newTaskText,
      completed: false,
      priority: newTaskPriority,
      data: newTaskData
    });
    
    setNewTaskText('');
    setNewTaskData('');
    setNewTaskPriority('media');
  };

  const filteredTasks = tarefas.filter(t => {
    if (filter === 'pendentes') return !t.completed;
    if (filter === 'concluidas') return t.completed;
    return true;
  });

  // --- Note Handlers ---
  const addNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    handleAddNota(newNoteText);
    setNewNoteText('');
  };

  // --- Upcoming Events for "Avisos" ---
  const todayObj = new Date();
  todayObj.setHours(0,0,0,0);
  
  const upcomingEvents = eventos
    .filter(ev => {
      const [year, month, d] = ev.data.split('-');
      const eveDate = new Date(year, month - 1, d);
      return eveDate >= todayObj;
    })
    .sort((a, b) => {
      const [yA, mA, dA] = a.data.split('-');
      const [yB, mB, dB] = b.data.split('-');
      return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
    })
    .slice(0, 3); // Top 3

  return (
    <div className="animate-fade-in stagger-1" style={{maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
      <div className="seq-header-title">
         <div className="summary-icon task-icon" style={{width: 50, height: 50}}><CheckSquare size={20} /></div>
         <h2 className="text-title">Minhas Tarefas</h2>
      </div>

      <div className="tasks-layout-grid">
        {/* Left Column: Tasks */}
        <div className="tasks-main-column stagger-2">
          <Card className="grid-card my-tasks-list" title="Gerenciamento de Tarefas">
            
            {/* Add Task Form */}
            <form onSubmit={addTask} className="add-task-form" style={{alignItems: 'center'}}>
              <input 
                type="text" 
                placeholder="O que você precisa fazer?" 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="custom-input flex-1"
                required
              />
              <select 
                value={newTaskPriority} 
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="custom-select"
              >
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Média</option>
                <option value="baixa">🟢 Baixa</option>
              </select>
              <div style={{display: 'flex', alignItems: 'center', background: 'white', borderRadius: 8, padding: '0.2rem 0.5rem', border: '1px solid var(--card-border)'}} title="Data Opcional (Envia pro Calendário)">
                  <CalendarIcon size={16} color="var(--primary-purple)" style={{marginRight: 6}}/>
                  <input 
                    type="date" 
                    value={newTaskData}
                    onChange={(e) => setNewTaskData(e.target.value)}
                    className="custom-input"
                    style={{border: 'none', padding: '0.2rem', outline: 'none'}}
                  />
              </div>
              <button type="submit" className="btn btn-green"><Plus size={16}/> Salvar</button>
            </form>

            {/* Filters */}
            <div className="task-filters">
              <button className={`filter-btn ${filter === 'todas' ? 'active' : ''}`} onClick={() => setFilter('todas')}>Todas</button>
              <button className={`filter-btn ${filter === 'pendentes' ? 'active' : ''}`} onClick={() => setFilter('pendentes')}>Pendentes</button>
              <button className={`filter-btn ${filter === 'concluidas' ? 'active' : ''}`} onClick={() => setFilter('concluidas')}>Concluídas</button>
            </div>

            {/* Task List */}
            <ul className="task-list interactive">
              {filteredTasks.length === 0 ? (
                <div className="empty-state">Nenhuma tarefa encontrada. 🎉</div>
              ) : (
                filteredTasks.map(task => (
                  <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <label className="task-label" style={{display: 'flex', flexDirection: 'column'}}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => toggleTarefa(task.id)} 
                            style={{marginRight: 10}}
                          />
                          <span className="task-text">{task.text}</span>
                      </div>
                      {task.data && (
                         <span style={{fontSize: '0.75rem', color: 'var(--primary-purple)', marginLeft: 24, marginTop: 4, fontWeight: 600}}>🗓️ Marcado para: {task.data.split('-').reverse().join('/')}</span>
                      )}
                    </label>
                    <div className="task-actions">
                      <Badge type={task.priority === 'alta' ? 'pink' : task.priority === 'baixa' ? 'green' : 'purple'}>
                        {task.priority === 'alta' ? 'Urgente' : task.priority === 'media' ? 'Média' : 'Baixa'}
                      </Badge>
                      <button className="icon-btn-delete" onClick={() => handleRemoverTarefa(task.id)} title="Excluir tarefa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>

        {/* Right Column: Notes & Reminders */}
        <div className="tasks-side-column stagger-3">
          
          {/* Important Reminders From Calendar */}
          <Card className="grid-card warnings-card" title={<><AlertCircle size={20}/> Agenda da Coordenação</>}>
            <ul className="warnings-list">
              {upcomingEvents.length === 0 ? (
                 <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Sem eventos futuros no calendário.</p>
              ) : (
                 upcomingEvents.map(ev => {
                    const [y, m, d] = ev.data.split('-');
                    return (
                        <li key={ev.id}>
                          <div className={`warning-icon ${ev.tipo === 'Tarefas' ? 'pink' : ''}`}>
                             <Bell size={14}/>
                          </div>
                          <div>
                            <strong>{ev.titulo}</strong>
                            <p>{d}/{m} - {ev.tipo}</p>
                          </div>
                        </li>
                    )
                 })
              )}
            </ul>
          </Card>

          {/* Quick Notes */}
          <Card className="grid-card quick-notes" title={<><Edit3 size={20}/> Bloco de Notas Rápidas</>}>
            <ul className="notes-list interactive">
              {notas.length === 0 ? (
                 <div className="empty-state">Bloco de notas vazio.</div>
              ) : (
                notas.map(note => (
                  <li key={note.id} className="note-item">
                    <span>{note.text}</span>
                    <button className="icon-btn-delete" onClick={() => handleRemoverNota(note.id)}>
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))
              )}
            </ul>
            
            <form onSubmit={addNote} className="add-note-form">
              <input 
                type="text" 
                placeholder="Escreva uma nota..." 
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="custom-input"
              />
              <button type="submit" className="btn btn-outline" style={{width: '100%'}}><Plus size={16}/> Salvar Nota</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MinhasTarefas;
