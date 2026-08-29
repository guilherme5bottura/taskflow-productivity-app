import React from 'react';
import { 
  Home, 
  CheckSquare, 
  FolderKanban, 
  Tag, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  Plus, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

export default function Sidebar({ currentView, setCurrentView, isCollapsed, setIsCollapsed }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { openCreateModal, stats } = useTasks();

  const menuItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      badge: null
    },
    {
      id: 'tasks',
      label: 'Minhas Tarefas',
      icon: CheckSquare,
      badge: stats?.stats?.pendingTasks || null
    },
    {
      id: 'categories',
      label: 'Categorias & Tags',
      icon: Tag,
      badge: null
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand & Logo */}
      <div className="sidebar-header">
        <div className="sidebar-brand" onClick={() => setCurrentView('home')}>
          <div className="brand-icon-wrapper">
            <CheckCircle2 size={22} strokeWidth={2.5} />
          </div>
          {!isCollapsed && <span className="brand-gradient-text">TaskFlow</span>}
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-collapse-btn btn-icon"
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="sidebar-quick-action">
        <button 
          onClick={openCreateModal}
          className="btn-primary sidebar-create-btn"
          id="btn-sidebar-create-task"
          title="Criar nova tarefa"
        >
          <Plus size={18} strokeWidth={2.5} />
          {!isCollapsed && <span>Nova Tarefa</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">
          {!isCollapsed && <span>MENU PRINCIPAL</span>}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className="sidebar-nav-icon" />
              {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
              {!isCollapsed && item.badge !== null && item.badge > 0 && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Theme Toggle */}
      <div className="sidebar-footer">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="sidebar-nav-item theme-item"
          title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
        >
          {theme === 'dark' ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#6366f1" />}
          {!isCollapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>

        {/* User Card */}
        <div className="sidebar-user-card">
          <div className="user-avatar-badge">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          {!isCollapsed && (
            <div className="user-info-text">
              <span className="user-name">{user?.name || 'Usuário'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          )}

          <button
            onClick={logout}
            className="btn-icon user-logout-btn"
            title="Sair da conta"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
