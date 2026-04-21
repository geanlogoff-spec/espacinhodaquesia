import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  X, Bell, CheckSquare, Calendar as CalendarIcon,
  Star, MessageCircle, Folder, Sun, Cake, ChevronRight,
  Sparkles, Clock
} from 'lucide-react';
import './DailyPopup.css';

const DailyPopup = () => {
  const navigate = useNavigate();
  const { tarefas, eventos, professores = [], perfil, isLoggedIn, user } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Build today's date string
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Format today for display
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const todayFormatted = `${diasSemana[today.getDay()]}, ${today.getDate()} de ${meses[today.getMonth()]}`;

  // Filter today's tasks (pending only)
  const tarefasHoje = tarefas.filter(t => {
    if (t.completed) return false;
    // Tasks with today's date OR tasks without a date (always relevant)
    if (t.data === todayStr) return true;
    return false;
  });

  // All pending tasks (no date filter)
  const tarefasPendentes = tarefas.filter(t => !t.completed);

  // Filter today's events from the store
  const eventosHoje = eventos.filter(ev => ev.data === todayStr);

  // Birthday events for today
  const aniversariosHoje = professores.filter(p => {
    if (!p.dataAniversario) return false;
    const parts = p.dataAniversario.split('-');
    if (parts.length < 3) return false;
    const monthDay = `${parts[1]}-${parts[2]}`;
    const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return monthDay === todayMonthDay;
  });

  // Show popup after login (using sessionStorage to show only once per session)
  useEffect(() => {
    if (!isLoggedIn) return;

    const userId = user?.id || 'anonymous';
    const popupKey = `daily_popup_shown_${userId}_${todayStr}`;
    const alreadyShown = sessionStorage.getItem(popupKey);

    if (!alreadyShown) {
      // Delay slightly so the dashboard loads first
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem(popupKey, 'true');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, todayStr]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 350);
  };

  const handleGoToTarefas = () => {
    handleClose();
    setTimeout(() => navigate('/tarefas'), 400);
  };

  const handleGoToCalendario = () => {
    handleClose();
    setTimeout(() => navigate('/calendario'), 400);
  };

  // Get icon config for event types
  const getEventIcon = (tipo) => {
    switch (tipo) {
      case 'Reuniões': return <MessageCircle size={14} />;
      case 'Atividades Escolares': return <Folder size={14} />;
      case 'Eventos': return <Star size={14} />;
      case 'Aniversários': return <Cake size={14} />;
      case 'Feriados': return <Sun size={14} />;
      case 'Tarefas': return <CheckSquare size={14} />;
      default: return <CalendarIcon size={14} />;
    }
  };

  const getEventColorClass = (tipo) => {
    switch (tipo) {
      case 'Reuniões': return 'tipo-reuniao';
      case 'Atividades Escolares': return 'tipo-atividade';
      case 'Eventos': return 'tipo-evento';
      case 'Feriados': return 'tipo-feriado';
      case 'Tarefas': return 'tipo-tarefa';
      default: return 'tipo-outro';
    }
  };

  const totalItems = eventosHoje.length + tarefasHoje.length + aniversariosHoje.length;
  const hasContent = totalItems > 0 || tarefasPendentes.length > 0;

  if (!isVisible) return null;

  return createPortal(
    <div className={`daily-popup-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`daily-popup-container ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="daily-popup-header">
          <div className="daily-popup-header-content">
            <div className="daily-popup-bell-wrapper">
              <Bell size={22} />
              <span className="daily-popup-bell-dot"></span>
            </div>
            <div>
              <h3 className="daily-popup-title">
                {getGreeting()}, {perfil.nome}! {perfil.emoji}
              </h3>
              <p className="daily-popup-date">
                <Clock size={13} /> {todayFormatted}
              </p>
            </div>
          </div>
          <button className="daily-popup-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="daily-popup-body">

          {/* Summary Badge */}
          {hasContent && (
            <div className="daily-popup-summary">
              <Sparkles size={16} />
              <span>
                {totalItems > 0
                  ? `Você tem ${totalItems} atividade${totalItems > 1 ? 's' : ''} para hoje`
                  : `Nenhuma atividade agendada para hoje`
                }
                {tarefasPendentes.length > 0 && totalItems === 0 &&
                  ` • ${tarefasPendentes.length} tarefa${tarefasPendentes.length > 1 ? 's' : ''} pendente${tarefasPendentes.length > 1 ? 's' : ''}`
                }
              </span>
            </div>
          )}

          {/* Birthdays Section */}
          {aniversariosHoje.length > 0 && (
            <div className="daily-popup-section">
              <div className="daily-popup-section-header birthday-header">
                <Cake size={16} />
                <span>Aniversariantes de Hoje 🎂</span>
              </div>
              <div className="daily-popup-items">
                {aniversariosHoje.map(prof => (
                  <div key={prof.id} className="daily-popup-item birthday-item-popup">
                    <div className="daily-popup-item-icon birthday-icon">
                      <Cake size={14} />
                    </div>
                    <div className="daily-popup-item-text">
                      <span className="item-title">{prof.nome}</span>
                      <span className="item-subtitle">Parabéns! 🎉</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {eventosHoje.length > 0 && (
            <div className="daily-popup-section">
              <div className="daily-popup-section-header events-header">
                <CalendarIcon size={16} />
                <span>Eventos do Dia</span>
              </div>
              <div className="daily-popup-items">
                {eventosHoje.map(ev => (
                  <div key={ev.id} className={`daily-popup-item ${getEventColorClass(ev.tipo)}`}>
                    <div className="daily-popup-item-icon">
                      {getEventIcon(ev.tipo)}
                    </div>
                    <div className="daily-popup-item-text">
                      <span className="item-title">{ev.titulo}</span>
                      <span className="item-subtitle">{ev.tipo}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="daily-popup-link-btn" onClick={handleGoToCalendario}>
                Ver calendário completo <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Tasks Section */}
          {tarefasHoje.length > 0 && (
            <div className="daily-popup-section">
              <div className="daily-popup-section-header tasks-header">
                <CheckSquare size={16} />
                <span>Tarefas de Hoje</span>
              </div>
              <div className="daily-popup-items">
                {tarefasHoje.slice(0, 5).map(t => (
                  <div key={t.id} className="daily-popup-item tipo-tarefa">
                    <div className="daily-popup-item-icon">
                      <CheckSquare size={14} />
                    </div>
                    <div className="daily-popup-item-text">
                      <span className="item-title">{t.text}</span>
                      <span className={`item-priority priority-${t.priority}`}>
                        {t.priority === 'alta' ? '🔴 Urgente' : t.priority === 'media' ? '🟡 Média' : '🟢 Baixa'}
                      </span>
                    </div>
                  </div>
                ))}
                {tarefasHoje.length > 5 && (
                  <div className="daily-popup-more">+ {tarefasHoje.length - 5} tarefas adicionais</div>
                )}
              </div>
              <button className="daily-popup-link-btn" onClick={handleGoToTarefas}>
                Gerenciar tarefas <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Pending Tasks (when no today items) */}
          {tarefasHoje.length === 0 && tarefasPendentes.length > 0 && (
            <div className="daily-popup-section">
              <div className="daily-popup-section-header tasks-header">
                <CheckSquare size={16} />
                <span>Tarefas Pendentes ({tarefasPendentes.length})</span>
              </div>
              <div className="daily-popup-items">
                {tarefasPendentes.slice(0, 3).map(t => (
                  <div key={t.id} className="daily-popup-item tipo-tarefa">
                    <div className="daily-popup-item-icon">
                      <CheckSquare size={14} />
                    </div>
                    <div className="daily-popup-item-text">
                      <span className="item-title">{t.text}</span>
                      <span className={`item-priority priority-${t.priority}`}>
                        {t.priority === 'alta' ? '🔴 Urgente' : t.priority === 'media' ? '🟡 Média' : '🟢 Baixa'}
                      </span>
                    </div>
                  </div>
                ))}
                {tarefasPendentes.length > 3 && (
                  <div className="daily-popup-more">+ {tarefasPendentes.length - 3} tarefas adicionais</div>
                )}
              </div>
              <button className="daily-popup-link-btn" onClick={handleGoToTarefas}>
                Ver todas as tarefas <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Empty State */}
          {!hasContent && (
            <div className="daily-popup-empty">
              <Sparkles size={32} />
              <p>Sua agenda está livre hoje!</p>
              <span>Aproveite para organizar suas próximas atividades ✨</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="daily-popup-footer">
          <button className="btn btn-outline daily-popup-dismiss" onClick={handleClose}>
            Entendido! 👍
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DailyPopup;
