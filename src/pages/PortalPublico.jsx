import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Download, CalendarDays, AlertCircle, School, Loader2 } from 'lucide-react';
import './PortalPublico.css';

const PortalPublico = () => {
  const { arquivos, eventos, perfil, fetchPublicData } = useAppStore();
  const [activeTab, setActiveTab] = useState('arquivos');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch public data from Supabase on mount (no auth required)
  useEffect(() => {
    const loadData = async () => {
      await fetchPublicData();
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Matemática para identificar eventos do futuro/hoje
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  
  const proximosEventos = eventos
    .filter(ev => ev.data >= todayStr)
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 5);

  // Formatador de data simpático (Ex: 25/Abril)
  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const mNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${day}/${mNames[parseInt(month)-1]}`;
  };

  if (isLoading) {
    return (
      <div className="portal-mobile-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-purple, #7c3aed)', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="portal-mobile-wrapper">
      
      {/* Header Oficial da Escola */}
      <header className="portal-header animate-fade-in">
        <div className="portal-logo-container">
          <School size={28} color="white" />
          <div className="portal-titles">
            <h1>{perfil.tituloDaPlataforma} {perfil.nome}</h1>
            <span>Acesso Exclusivo: Professores</span>
          </div>
        </div>
      </header>

      {/* Tabs Menu */}
      <div className="portal-tabs stagger-1">
        <button 
          className={`portal-tab ${activeTab === 'arquivos' ? 'active' : ''}`}
          onClick={() => setActiveTab('arquivos')}
        >
          Modelos & Arquivos
        </button>
        <button 
           className={`portal-tab ${activeTab === 'eventos' ? 'active' : ''}`}
           onClick={() => setActiveTab('eventos')}
        >
          Agenda Oficial
        </button>
      </div>

      {/* Área Central (Arquivos) */}
      {activeTab === 'arquivos' && (
        <div className="portal-content stagger-2">
           <h3 className="section-title">Central de Downloads</h3>
           <p className="section-subtitle">Baixe ou acesse os modelos liberados.</p>

           <div className="portal-list">
             {arquivos.length === 0 ? (
                <div className="empty-state">
                  <AlertCircle size={32} />
                  <p>Nenhum material disponibilizado no momento.</p>
                </div>
             ) : (
               arquivos.map((arq) => (
                 <div className="portal-card" key={arq.id}>
                   <div className="portal-card-main">
                     <h4 className="material-title">{arq.nome}</h4>
                     <span className="material-meta">Cadastrado em {formatFriendlyDate(arq.data)} • Origem: {arq.tamanho}</span>
                   </div>
                   <a href={arq.link} target="_blank" rel="noreferrer" className="portal-download-btn">
                     <Download size={18} />
                     Acessar
                   </a>
                 </div>
               ))
             )}
           </div>
        </div>
      )}

      {/* Área Central (Agenda) */}
      {activeTab === 'eventos' && (
        <div className="portal-content stagger-2">
           <h3 className="section-title">Próximos Acontecimentos</h3>
           <p className="section-subtitle">Fique de olho nas datas importantes da escola.</p>

           <div className="portal-list">
             {proximosEventos.length === 0 ? (
                <div className="empty-state">
                  <CalendarDays size={32} />
                  <p>A agenda da escola está livre para os próximos dias.</p>
                </div>
             ) : (
               proximosEventos.map((ev) => {
                 const isToday = ev.data === todayStr;
                 return (
                 <div className={`portal-card calendar-focus ${isToday ? 'is-today' : ''}`} key={ev.id}>
                   <div className="portal-card-date">
                     <span className="date-day">{ev.data.split('-')[2]}</span>
                     <span className="date-month">{["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][parseInt(ev.data.split('-')[1])-1]}</span>
                   </div>
                   <div className="portal-card-main">
                     {isToday && <span className="today-badge">Hoje!</span>}
                     <h4 className="material-title" style={{color: 'var(--text-main)'}}>{ev.titulo}</h4>
                     <span className="material-meta">{ev.tipo}</span>
                   </div>
                 </div>
                 );
               })
             )}
           </div>
        </div>
      )}

      <footer className="portal-footer">
         Gerenciado por {perfil.tituloDaPlataforma} {perfil.cargo} {perfil.nome} © {today.getFullYear()}
      </footer>
    </div>
  );
};

export default PortalPublico;
