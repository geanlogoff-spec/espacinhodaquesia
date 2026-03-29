import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Layers, 
  Calendar as CalendarIcon, 
  Folder, 
  BarChart2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  LogOut
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { handleLogout } = useContext(AppContext);
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: Home },
    { path: '/tarefas', name: 'Minhas Tarefas', icon: CheckSquare },
    { path: '/professores', name: 'Professores', icon: Users },
    { path: '/sequencias', name: 'Sequências', icon: Layers },
    { path: '/calendario', name: 'Calendário', icon: CalendarIcon },
    { path: '/arquivos', name: 'Arquivos', icon: Folder },
    { path: '/relatorios', name: 'Relatórios', icon: BarChart2 },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <button 
        className="collapse-btn desktop-only" 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <button className="close-mobile-btn mobile-only" onClick={() => setIsMobileOpen(false)}>
        <X size={24} color="var(--primary-pink)" />
      </button>

      <div className="sidebar-logo">
        <Heart className="heart-icon" size={isCollapsed ? 20 : 28} fill="#f4a6c8" color="#f4a6c8" />
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span className="link-text">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={20} className="nav-icon" />
          <span className="link-text">Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
