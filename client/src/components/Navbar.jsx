import React from 'react';
import { 
  CheckCircle2, 
  Plus, 
  Sun, 
  Moon, 
  LogOut, 
  Tag, 
  User 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

export default function Navbar() {
  const { user, theme, toggleTheme, logout } = useAuth();
  const { openCreateModal, setIsCategoryModalOpen } = useTasks();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <CheckCircle2 size={22} strokeWidth={2.5} />
          </div>
          <span className="brand-gradient-text">TaskFlow</span>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Nova Tarefa Button */}
          <button 
            onClick={openCreateModal}
            className="btn-primary"
            id="btn-create-task"
            title="Criar nova tarefa"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Nova Tarefa</span>
          </button>

          {/* Gerenciar Categorias & Tags */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn-secondary"
            id="btn-manage-tags"
            title="Gerenciar Categorias e Tags"
          >
            <Tag size={16} />
            <span>Etiquetas</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="btn-icon"
            id="btn-toggle-theme"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'var(--bg-subtle)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <User size={15} color="var(--primary)" />
              <span>{user?.name || 'Usuário'}</span>
            </div>

            <button 
              onClick={logout}
              className="btn-icon"
              id="btn-logout"
              title="Sair da conta"
              style={{ color: 'var(--danger)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
