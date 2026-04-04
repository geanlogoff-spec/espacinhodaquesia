import React, { useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronDown,
  X,
  Users,
  LogOut,
  UserPlus,
  Clock,
  ClipboardList,
  Eye,
  School,
  GraduationCap
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { handleLogout } = useContext(AppContext);
  const location = useLocation();

  // Submenu expansion state
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if a submenu section is active (any of its children matched)
  const isSubmenuActive = (paths) => {
    return paths.some(p => location.pathname.startsWith(p));
  };

  // Simple menu items (no children)
  const simpleItems = [
    { path: '/', name: 'Dashboard', icon: Home },
    { path: '/tarefas', name: 'Minhas Tarefas', icon: CheckSquare },
  ];

  // Submenu items
  const submenuItems = [
    {
      key: 'escola',
      name: 'Escola',
      icon: School,
      children: [
        { path: '/escola/cadastro', name: 'Cadastro de Escola', icon: School },
        { path: '/escola/turmas', name: 'Cadastro de Turmas', icon: GraduationCap },
      ]
    },
    {
      key: 'professores',
      name: 'Professores',
      icon: Users,
      children: [
        { path: '/professores/cadastro', name: 'Cadastro de Prof.', icon: UserPlus },
        { path: '/professores/contagem', name: 'Contagem de Aulas', icon: Clock },
      ]
    },
    {
      key: 'sequencias',
      name: 'Sequências',
      icon: Layers,
      children: [
        { path: '/sequencias/cadastro', name: 'Cadastro de SD.', icon: ClipboardList },
        { path: '/sequencias/acompanhamento', name: 'Acompanhamento', icon: Eye },
      ]
    },
  ];

  // Bottom simple menu items
  const bottomItems = [
    { path: '/calendario', name: 'Calendário', icon: CalendarIcon },
    { path: '/arquivos', name: 'Arquivos', icon: Folder },
    { path: '/relatorios', name: 'Relatórios', icon: BarChart2 },
  ];

  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  // Auto-expand submenus that have active children
  React.useEffect(() => {
    submenuItems.forEach(item => {
      if (isSubmenuActive(item.children.map(c => c.path))) {
        setOpenSubmenus(prev => ({ ...prev, [item.key]: true }));
      }
    });
  }, [location.pathname]);

  const renderSimpleLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink 
        key={item.path} 
        to={item.path} 
        end={item.path === '/'}
        onClick={handleNavClick}
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        <Icon size={20} className="nav-icon" />
        <span className="link-text">{item.name}</span>
      </NavLink>
    );
  };

  const renderSubmenu = (item) => {
    const Icon = item.icon;
    const isOpen = openSubmenus[item.key];
    const isActive = isSubmenuActive(item.children.map(c => c.path));

    return (
      <div key={item.key} className={`sidebar-submenu-group ${isActive ? 'group-active' : ''}`}>
        <button 
          className={`sidebar-link submenu-toggle ${isActive ? 'active' : ''}`}
          onClick={() => toggleSubmenu(item.key)}
        >
          <Icon size={20} className="nav-icon" />
          <span className="link-text">{item.name}</span>
          <ChevronDown 
            size={16} 
            className={`submenu-chevron ${isOpen ? 'rotated' : ''}`} 
          />
        </button>

        <div className={`submenu-children ${isOpen ? 'open' : ''}`}>
          {item.children.map(child => {
            const ChildIcon = child.icon;
            return (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={handleNavClick}
                className={({ isActive }) => `sidebar-link submenu-child ${isActive ? 'active' : ''}`}
              >
                <ChildIcon size={16} className="nav-icon" />
                <span className="link-text">{child.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <button className="close-mobile-btn mobile-only" onClick={() => setIsMobileOpen(false)}>
          <X size={24} color="var(--primary-pink)" />
        </button>

        <div className="sidebar-logo">
          <Heart className="heart-icon" size={isCollapsed ? 20 : 28} fill="#f4a6c8" color="#f4a6c8" />
        </div>
        
        <nav className="sidebar-nav">
          {simpleItems.map(renderSimpleLink)}
          {submenuItems.map(renderSubmenu)}
          {bottomItems.map(renderSimpleLink)}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={20} className="nav-icon" />
            <span className="link-text">Sair do Sistema</span>
          </button>
        </div>
      </aside>
      
      {/* Botão de Toggle Posicionado Globalmente para evitar bloqueio pelo Overflow escondido da Sidebar */}
      <button 
        className={`collapse-btn desktop-only ${isCollapsed ? 'is-collapsed' : ''}`} 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </>
  );
};

export default Sidebar;
