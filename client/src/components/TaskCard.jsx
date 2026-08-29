import React from 'react';
import { 
  Check, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Folder, 
  Tag as TagIcon,
  AlertCircle
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TaskCard({ task }) {
  const { toggleTask, deleteTask, openEditModal } = useTasks();

  const isCompleted = task.status === 'concluida';

  // Formatação amigável de data limite e verificação se está atrasada
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;

    const dueDate = new Date(dateStr);
    const now = new Date();

    const isToday = dueDate.toDateString() === now.toDateString();
    
    // Comparar se está no passado (considerando horas)
    const isPast = dueDate < now && !isToday;

    const formatted = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dueDate);

    return {
      text: isToday ? `Hoje às ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(dueDate)}` : formatted,
      isToday,
      isOverdue: isPast && !isCompleted
    };
  };

  const dueInfo = formatDueDate(task.due_date);

  const priorityLabels = {
    urgente: 'Urgente',
    media: 'Média',
    baixa: 'Baixa'
  };

  return (
    <div className={`task-card ${isCompleted ? 'is-completed' : ''}`}>
      {/* Checkbox customizado */}
      <button
        className={`task-checkbox-custom ${isCompleted ? 'checked' : ''}`}
        onClick={() => toggleTask(task.id)}
        title={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
        id={`checkbox-task-${task.id}`}
      >
        {isCompleted && <Check size={16} strokeWidth={3} />}
      </button>

      {/* Conteúdo Principal */}
      <div className="task-main-content">
        {/* Título & Ações */}
        <div className="task-header-row">
          <h3 className={`task-title ${isCompleted ? 'strikethrough' : ''}`}>
            {task.title}
          </h3>

          <div className="task-actions-group">
            <button
              onClick={() => openEditModal(task)}
              className="btn-icon"
              style={{ width: '32px', height: '32px' }}
              title="Editar tarefa"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
                  deleteTask(task.id);
                }
              }}
              className="btn-icon"
              style={{ width: '32px', height: '32px', color: 'var(--danger)' }}
              title="Excluir tarefa"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Descrição */}
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {/* Metadados / Rodapé do Card */}
        <div className="task-meta-footer">
          {/* Prioridade */}
          <span className={`badge-priority priority-${task.priority}`}>
            {task.priority === 'urgente' && '🔴'}
            {task.priority === 'media' && '🟡'}
            {task.priority === 'baixa' && '🟢'}
            <span>{priorityLabels[task.priority] || task.priority}</span>
          </span>

          {/* Categoria */}
          {task.category_name && (
            <span 
              className="badge-category"
              style={{ color: task.category_color }}
            >
              <span 
                style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: task.category_color || 'var(--primary)' 
                }} 
              />
              <span>{task.category_name}</span>
            </span>
          )}

          {/* Data Limite */}
          {dueInfo && (
            <span className={`badge-date ${dueInfo.isOverdue ? 'overdue' : dueInfo.isToday ? 'today' : ''}`}>
              {dueInfo.isOverdue ? <AlertCircle size={14} /> : <Calendar size={14} />}
              <span>{dueInfo.text}</span>
            </span>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {task.tags.map((tag) => (
                <span key={tag.id} className="badge-tag">
                  <TagIcon size={12} style={{ color: tag.color || 'var(--info)' }} />
                  <span>{tag.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
