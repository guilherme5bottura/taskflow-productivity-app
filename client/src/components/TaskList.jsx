import React from 'react';
import TaskCard from './TaskCard';
import { useTasks } from '../context/TaskContext';
import { CheckSquare, Plus, Sparkles } from 'lucide-react';

export default function TaskList() {
  const { tasks, loadingTasks, openCreateModal, hasActiveFilters, clearFilters } = useTasks();

  if (loadingTasks) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div 
          style={{ 
            display: 'inline-block',
            width: '36px',
            height: '36px',
            border: '3px solid var(--primary-light)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '12px'
          }} 
        />
        <p style={{ fontWeight: 600 }}>Carregando suas tarefas...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state-box glass-panel">
        <div className="empty-state-icon">
          {hasActiveFilters ? <CheckSquare size={32} /> : <Sparkles size={32} />}
        </div>
        <h3 className="empty-state-title">
          {hasActiveFilters ? 'Nenhuma tarefa encontrada' : 'Tudo limpo por aqui! 🎉'}
        </h3>
        <p className="empty-state-text">
          {hasActiveFilters
            ? 'Tente ajustar ou limpar os filtros para encontrar o que procura.'
            : 'Você não tem nenhuma tarefa pendente no momento. Que tal planejar o seu dia?'}
        </p>

        {hasActiveFilters ? (
          <button onClick={clearFilters} className="btn-secondary">
            Limpar filtros
          </button>
        ) : (
          <button onClick={openCreateModal} className="btn-primary">
            <Plus size={18} />
            <span>Criar primeira tarefa</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '0 4px' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Exibindo {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
        </span>
      </div>

      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
