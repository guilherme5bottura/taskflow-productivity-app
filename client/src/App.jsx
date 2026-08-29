import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import TaskFilterBar from './components/TaskFilterBar';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import SettingsView from './components/SettingsView';
import TaskModal from './components/TaskModal';
import CategoryTagManagerModal from './components/CategoryTagManagerModal';
import FloatingActionButton from './components/FloatingActionButton';
import AuthPage from './components/AuthPage';
import { CheckCircle, AlertCircle, Info, List, LayoutGrid } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const { toasts, setIsCategoryModalOpen } = useTasks();

  const [currentView, setCurrentView] = useState('home'); // 'home' | 'tasks' | 'categories' | 'settings'
  const [tasksLayoutMode, setTasksLayoutMode] = useState('list'); // 'list' | 'kanban'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid var(--primary-light)', 
              borderTopColor: 'var(--primary)', 
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px'
            }} 
          />
          <p style={{ fontWeight: 600 }}>Carregando TaskFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-layout">
      {/* 1. Menu Lateral Esquerdo (Sidebar) */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'categories') {
            setIsCategoryModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* 2. Área Principal */}
      <div className="main-viewport">
        <main className="main-content">
          {/* VISÃO: INÍCIO (Dashboard Geral com Saudação, Card da Semana e Próximas a Vencer) */}
          {currentView === 'home' && (
            <DashboardStats onNavigateTasks={() => setCurrentView('tasks')} />
          )}

          {/* VISÃO: MINHAS TAREFAS (Lista ou Quadro Kanban com Nova Coluna) */}
          {currentView === 'tasks' && (
            <div>
              <div className="section-title-row" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem' }}>Minhas Tarefas</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    Gerencie, filtre e acompanhe todas as suas atividades
                  </p>
                </div>

                {/* Alternador de Modo de Visualização: Lista vs Kanban */}
                <div className="status-tabs">
                  <button
                    className={`status-tab-btn ${tasksLayoutMode === 'list' ? 'active' : ''}`}
                    onClick={() => setTasksLayoutMode('list')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <List size={16} />
                    <span>Lista</span>
                  </button>
                  <button
                    className={`status-tab-btn ${tasksLayoutMode === 'kanban' ? 'active' : ''}`}
                    onClick={() => setTasksLayoutMode('kanban')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <LayoutGrid size={16} />
                    <span>Quadro Kanban</span>
                  </button>
                </div>
              </div>

              {tasksLayoutMode === 'list' ? (
                <>
                  <TaskFilterBar />
                  <TaskList />
                </>
              ) : (
                <KanbanBoard />
              )}
            </div>
          )}

          {/* VISÃO: CONFIGURAÇÕES */}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* 3. Botão Flutuante (+ Nova Tarefa) no Canto Inferior Direito */}
      <FloatingActionButton />

      {/* 4. Modais Globais */}
      <TaskModal />
      <CategoryTagManagerModal />

      {/* 5. Toasts Flutuantes */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' && <CheckCircle size={18} color="var(--success)" />}
            {t.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
            {t.type === 'info' && <Info size={18} color="var(--info)" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <MainApp />
    </TaskProvider>
  );
}
