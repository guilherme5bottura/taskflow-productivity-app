import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Tag as TagIcon, Check } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TaskModal() {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    createTask,
    updateTask,
    categories,
    tags
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('media');
  const [status, setStatus] = useState('pendente');
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Preencher formulário ao abrir para edição ou resetar ao criar
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setCategoryId(editingTask.category_id ? String(editingTask.category_id) : '');
      setPriority(editingTask.priority || 'media');
      setStatus(editingTask.status || 'pendente');

      // Formatar dueDate para input datetime-local (YYYY-MM-DDTHH:mm)
      if (editingTask.due_date) {
        const d = new Date(editingTask.due_date);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDueDate(formatted);
      } else {
        setDueDate('');
      }

      setSelectedTags(editingTask.tags ? editingTask.tags.map((t) => t.id) : []);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories.length > 0 ? String(categories[0].id) : '');
      setPriority('media');
      setStatus('pendente');
      setDueDate('');
      setSelectedTags([]);
    }
    setError('');
  }, [editingTask, isTaskModalOpen, categories]);

  if (!isTaskModalOpen) return null;

  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título da tarefa.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category_id: categoryId ? parseInt(categoryId, 10) : null,
        priority,
        status,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        tags: selectedTags
      };

      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }

      setIsTaskModalOpen(false);
    } catch (err) {
      setError('Erro ao salvar a tarefa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsTaskModalOpen(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>
            {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={() => setIsTaskModalOpen(false)}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Título da Tarefa *
              </label>
              <input
                id="task-title"
                type="text"
                placeholder="Ex: Entregar relatório trimestral"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">
                Descrição / Detalhes
              </label>
              <textarea
                id="task-desc"
                rows={3}
                placeholder="Adicione detalhes, links ou notas adicionais..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Category & Due Date Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-category">
                  Categoria
                </label>
                <select
                  id="task-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Sem Categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      📁 {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-due-date">
                  Data e Hora Limite
                </label>
                <input
                  id="task-due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Priority Selector */}
            <div className="form-group">
              <label className="form-label">Nível de Prioridade</label>
              <div className="priority-selector-grid">
                <button
                  type="button"
                  className={`priority-btn-select ${priority === 'baixa' ? 'selected-baixa' : ''}`}
                  onClick={() => setPriority('baixa')}
                >
                  <span>🟢</span>
                  <span>Baixa</span>
                </button>

                <button
                  type="button"
                  className={`priority-btn-select ${priority === 'media' ? 'selected-media' : ''}`}
                  onClick={() => setPriority('media')}
                >
                  <span>🟡</span>
                  <span>Média</span>
                </button>

                <button
                  type="button"
                  className={`priority-btn-select ${priority === 'urgente' ? 'selected-urgente' : ''}`}
                  onClick={() => setPriority('urgente')}
                >
                  <span>🔴</span>
                  <span>Urgente</span>
                </button>
              </div>
            </div>

            {/* Status (Only in Edit mode) */}
            {editingTask && (
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pendente">⏳ Pendente</option>
                  <option value="em_andamento">🔄 Em Andamento</option>
                  <option value="concluida">✅ Concluída</option>
                </select>
              </div>
            )}

            {/* Tags selection */}
            {tags.length > 0 && (
              <div className="form-group">
                <label className="form-label">Etiquetas / Tags</label>
                <div className="tags-pill-selection">
                  {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        className={`tag-select-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleTagToggle(tag.id)}
                        style={
                          isSelected
                            ? { background: tag.color + '22', color: tag.color, borderColor: tag.color }
                            : {}
                        }
                      >
                        {isSelected && <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              id="btn-save-task"
            >
              {isSubmitting ? 'Salvando...' : editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
