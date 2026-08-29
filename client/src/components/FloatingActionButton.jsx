import React from 'react';
import { Plus } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function FloatingActionButton() {
  const { openCreateModal } = useTasks();

  return (
    <button
      onClick={openCreateModal}
      className="fab-button"
      id="btn-fab-create-task"
      title="Criar Nova Tarefa (+)"
    >
      <Plus size={26} strokeWidth={2.5} />
      <span className="fab-tooltip">Nova Tarefa</span>
    </button>
  );
}
