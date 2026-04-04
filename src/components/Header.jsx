import React, { useState, useContext, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Settings, LogOut, Moon, User, AlertCircle, Save, ExternalLink } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { tarefas, eventos, perfil, handleAtualizarPerfil, handleLogout, isProfileModalOpen, setIsProfileModalOpen } = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const notifRef = useRef(null);
  const settRef = useRef(null);

  // States fields for Modal Editing Profile
  const [editNome, setEditNome] = useState(perfil.nome);
  const [editCargo, setEditCargo] = useState(perfil.cargo);
  const [editTitulo, setEditTitulo] = useState(perfil.tituloDaPlataforma);
  const [editEmoji, setEditEmoji] = useState(perfil.emoji);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
      if (settRef.current && !settRef.current.contains(event.target)) setShowSettings(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute real notifications
  const pendingTasks = tarefas.filter(t => !t.completed);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const eventsToday = eventos.filter(ev => ev.data === todayStr);

  const totalNotifs = pendingTasks.length + eventsToday.length;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    handleAtualizarPerfil({
      nome: editNome,
      cargo: editCargo,
      tituloDaPlataforma: editTitulo,
      emoji: editEmoji
    });
    setIsProfileModalOpen(false);
  };

  const openPortalInNewTab = () => {
     window.open('/portal', '_blank');
  };

  return (
    <header className="header">
      <div className="header-title">
        <div className="title-text">
          <span className="subtitle">{perfil.tituloDaPlataforma}</span>
          <h1 className="title">{perfil.cargo} {perfil.nome}</h1>
        </div>
        <div className="rainbow-decoration">
          {perfil.emoji}
        </div>
      </div>

      <div className="header-actions">
        
        {/* Notificações */}
        <div className="dropdown-container" ref={notifRef}>
          <button 
            className={`icon-btn btn-message ${showNotifications ? 'active' : ''}`}
            onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
          >
            <Bell size={20} />
            {totalNotifs > 0 && <span className="badge-notification">{totalNotifs}</span>}
          </button>
          
          {showNotifications && (
            <div className="header-dropdown animate-fade-in notif-dropdown">
              <div className="dropdown-header">
                <h4>Avisos Recentes</h4>
              </div>
              <div className="dropdown-body">
                {totalNotifs === 0 ? (
                  <div className="dropdown-empty">
                     <AlertCircle size={24} color="var(--text-light)" />
                     <p>Tudo em dia! Nenhuma notificação hoje.</p>
                  </div>
                ) : (
                  <ul className="notif-list">
                    {eventsToday.map(ev => (
                      <li key={`ev-${ev.id}`} className="notif-item alert-purple" onClick={() => navigate('/calendario')}>
                        <strong>📅 Hoje tem Evento!</strong>
                        <span>{ev.titulo}</span>
                      </li>
                    ))}
                    {pendingTasks.slice(0, 3).map(task => (
                      <li key={`tk-${task.id}`} className="notif-item alert-pink" onClick={() => navigate('/tarefas')}>
                        <strong>📝 Tarefa Pendente</strong>
                        <span>{task.text}</span>
                      </li>
                    ))}
                    {pendingTasks.length > 3 && (
                      <li className="notif-item" style={{textAlign: 'center', color: 'var(--text-muted)'}}>
                        + {pendingTasks.length - 3} outras tarefas na aba.
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Configurações */}
        <div className="dropdown-container" ref={settRef}>
          <button 
            className={`icon-btn btn-settings ${showSettings ? 'active' : ''}`}
            onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
          >
            <Settings size={20} />
          </button>

          {showSettings && (
            <div className="header-dropdown animate-fade-in sett-dropdown">
              <div className="dropdown-header">
                <h4>Configurações</h4>
              </div>
              <div className="dropdown-body">
                <ul className="settings-list">
                  <li className="settings-item" onClick={() => { setIsProfileModalOpen(true); setShowSettings(false); }}>
                    <User size={16} /> Meu Perfil
                  </li>
                  <li className="settings-item" onClick={() => alert('Modo escuro será ativado em atualizações futuras!')}>
                    <Moon size={16} /> Modo Escuro (Em breve)
                  </li>
                  <li className="settings-item" onClick={openPortalInNewTab}>
                    <ExternalLink size={16} /> Acessar Área Externa
                  </li>
                  <li className="settings-item danger" onClick={() => handleLogout()}>
                    <LogOut size={16} /> Sair do Sistema
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Profile Settings */}
      {isProfileModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{maxWidth: '450px'}}>
            <div className="modal-header">
              <h3>Identidade da Plataforma</h3>
              <button className="close-btn" onClick={() => setIsProfileModalOpen(false)}>&times;</button>
            </div>
            
            <form className="modal-body" onSubmit={handleSaveProfile} style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
              
              <div className="form-group" style={{marginBottom: 0}}>
                <label>Seu Título ou Formação</label>
                <select value={editCargo} onChange={e=>setEditCargo(e.target.value)}>
                   <option value="Coordenadora">Coordenadora</option>
                   <option value="Coordenador">Coordenador</option>
                   <option value="Diretora">Diretora</option>
                   <option value="Diretor">Diretor</option>
                   <option value="Supervisora">Supervisora</option>
                   <option value="Professor">Professor</option>
                   <option value="Professora">Professora</option>
                   <option value="">(Nenhum, apenas o nome)</option>
                </select>
              </div>

              <div className="form-group" style={{marginBottom: 0}}>
                <label>Nome Principal</label>
                <input 
                  type="text" 
                  value={editNome} 
                  onChange={e=>setEditNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                  <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                    <label>Título Inicial</label>
                    <input 
                      type="text" 
                      value={editTitulo} 
                      onChange={e=>setEditTitulo(e.target.value)}
                      placeholder="Ex: Espacinho do"
                      required
                    />
                  </div>
                  
                  <div className="form-group" style={{width: '90px', marginBottom: 0}}>
                    <label>Avatar</label>
                    <select value={editEmoji} onChange={e=>setEditEmoji(e.target.value)} style={{fontSize: '1.5rem', padding: '0.4rem'}}>
                       <option value="👸">👸</option>
                       <option value="👑">👑</option>
                       <option value="👩‍🏫">👩‍🏫</option>
                       <option value="👨‍🏫">👨‍🏫</option>
                       <option value="🦁">🦁</option>
                       <option value="✨">✨</option>
                       <option value="📚">📚</option>
                       <option value="🎯">🎯</option>
                    </select>
                  </div>
              </div>

              <div className="preview-brand" style={{background: '#f1f3f7', padding: '1rem', borderRadius: '12px', marginTop: '0.5rem'}}>
                 <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Assim ficará seu cabeçalho:</span>
                 <h4 style={{margin: '0.3rem 0 0 0', color: 'var(--primary-purple)', fontSize: '1.1rem'}}>
                    {editTitulo} {editCargo} {editNome} {editEmoji}
                 </h4>
              </div>

              <div className="modal-actions" style={{marginTop: '1rem'}}>
                <button type="button" className="btn btn-outline" onClick={() => setIsProfileModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-green"><Save size={16}/> Salvar Alterações</button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

    </header>
  );
};

export default Header;
