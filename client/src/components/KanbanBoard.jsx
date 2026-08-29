import React, { useState } from 'react';
import { Plus, MoreHorizontal, Check, Clock, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function KanbanBoard() {
  const { tasks, toggleTask, deleteTask, openEditModal, openCreateModal, updateTask } = useTasks();

  // Colunas do Kanban
  const [columns, setColumns] = useState([
    { id: 'pendente', title: 'A Fazer', color: '#6366f1', statusKey: 'pendente' },
    { id: 'em_andamento', title: 'Em Andamento', color: '#f59e0b', statusKey: 'em_andamento' },
    { id: 'concluida', title: 'Concluído', color: '#10b981', statusKey: 'concluida' }
  ]);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#8b5cf6');

  const handleAddColumn = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    const newCol = {
      id: `custom_${Date.now()}`,
      title: newColumnTitle.trim(),
      color: newColumnColor,
      statusKey: 'em_andamento' // mapeia para status de trabalho
    };

    setColumns(prev => [...prev, newCol]);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleMoveStatus = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="kanban-container">
      <div className="kanban-header-actions">
        <h2 style={{ fontSize: '1.25rem' }}>Quadro de Fluxo de Tarefas</h2>
        <button
          onClick={() => setIsAddingColumn(true)}
          className="btn-secondary"
          id="btn-add-column"
        >
          <Plus size={16} />
          <span>Criar Nova Coluna</span>
        </button>
      </div>

      {/* Modal/Form para Criar Nova Coluna */}
      {isAddingColumn && (
        <div className="modal-backdrop" onClick={() => setIsAddingColumn(false)}>
          <div className="modal-dialog" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Criar Nova Coluna</h3>
            </div>
            <form onSubmit={handleAddColumn}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Título da Coluna</label>
                  <input
                    type="text"
                    placeholder="Ex: Em Revisão, Bloqueado, Aguardando"
                    value={newColumnTitle}
                    onChange={e => setNewColumnTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cor da Coluna</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={newColumnColor}
                      onChange={e => setNewColumnColor(e.target.value)}
                      style={{ width: '48px', height: '42px', padding: '2px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{newColumnColor}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Adicionar Coluna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid de Colunas Kanban */}
      <div className="kanban-board-scroll">
        <div className="kanban-columns-row">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => {
              if (col.statusKey === 'concluida') return t.status === 'concluida';
              if (col.statusKey === 'em_andamento') return t.status === 'em_andamento';
              return t.status === 'pendente';
            });

            return (
              <div key={col.id} className="kanban-column glass-panel">
                {/* Header da Coluna */}
                <div className="kanban-column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: col.color
                      }}
                    />
                    <span className="kanban-col-title">{col.title}</span>
                    <span className="kanban-col-count">{colTasks.length}</span>
                  </div>

                  <button
                    onClick={openCreateModal}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px' }}
                    title={`Adicionar tarefa em ${col.title}`}
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="kanban-cards-stack">
                  {colTasks.map((task) => (
                    <div key={task.id} className="kanban-card">
                      <div className="kanban-card-top">
                        <span className={`badge-priority priority-${task.priority}`} style={{ fontSize: '0.72rem' }}>
                          {task.priority}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => openEditModal(task)}
                            className="btn-icon"
                            style={{ width: '26px', height: '26px' }}
                            title="Editar"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Excluir tarefa?')) deleteTask(task.id);
                            }}
                            className="btn-icon"
                            style={{ width: '26px', height: '26px', color: 'var(--danger)' }}
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h4 
                        className={`kanban-card-title ${task.status === 'concluida' ? 'strikethrough' : ''}`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="kanban-card-desc">{task.description}</p>
                      )}

                      {/* Categoria e Data */}
                      <div className="kanban-card-footer">
                        {task.category_name && (
                          <span className="badge-category" style={{ fontSize: '0.74rem', padding: '2px 8px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: task.category_color }} />
                            {task.category_name}
                          </span>
                        )}

                        {/* Seletor rápido de Status / Mover coluna */}
                        <select
                          value={task.status}
                          onChange={(e) => handleMoveStatus(task.id, e.target.value)}
                          className="kanban-status-select"
                          title="Mover para outra coluna"
                        >
                          <option value="pendente">⏳ A Fazer</option>
                          <option value="em_andamento">🔄 Em Andamento</option>
                          <option value="concluida">✅ Concluído</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="kanban-empty-slot">
                      <span>Nenhuma tarefa aqui</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Botão rápido para adicionar nova coluna no final */}
          <button
            onClick={() => setIsAddingColumn(true)}
            className="kanban-add-col-btn"
          >
            <Plus size={20} />
            <span>Criar Nova Coluna</span>
          </button>
        </div>
      </div>
    </div>
  );
}
