import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Folder } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function CategoryTagManagerModal() {
  const {
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    categories,
    tags,
    createCategory,
    createTag,
    deleteTag
  } = useTasks();

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#06B6D4');

  const [activeTab, setActiveTab] = useState('categories'); // categories | tags

  if (!isCategoryModalOpen) return null;

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCategory({ name: newCatName.trim(), color: newCatColor });
      setNewCatName('');
    } catch (err) {
      // error handled in context
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await createTag({ name: newTagName.trim(), color: newTagColor });
      setNewTagName('');
    } catch (err) {
      // error handled in context
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>Gerenciar Etiquetas e Categorias</h2>
          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ padding: '16px 24px 0' }}>
          <div className="auth-tabs">
            <button
              className={`auth-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              📁 Categorias ({categories.length})
            </button>
            <button
              className={`auth-tab-btn ${activeTab === 'tags' ? 'active' : ''}`}
              onClick={() => setActiveTab('tags')}
            >
              🏷️ Tags / Etiquetas ({tags.length})
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ paddingTop: '10px' }}>
          {activeTab === 'categories' ? (
            <div>
              {/* Form Nova Categoria */}
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Nome da categoria (ex: Finanças, Saúde)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  style={{ width: '48px', height: '42px', padding: '2px', cursor: 'pointer' }}
                  title="Escolha a cor da categoria"
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 16px' }}>
                  <Plus size={18} />
                  <span>Adicionar</span>
                </button>
              </form>

              {/* Lista de Categorias */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: cat.color || 'var(--primary)'
                        }}
                      />
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {cat.total_tasks_count || 0} tarefas associadas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Form Nova Tag */}
              <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Nome da tag (ex: Reunião, Urgência)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  style={{ width: '48px', height: '42px', padding: '2px', cursor: 'pointer' }}
                  title="Escolha a cor da tag"
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 16px' }}>
                  <Plus size={18} />
                  <span>Adicionar</span>
                </button>
              </form>

              {/* Lista de Tags */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Tag size={16} style={{ color: tag.color }} />
                      <span style={{ fontWeight: 600 }}>#{tag.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {tag.usage_count || 0} usos
                      </span>
                      <button
                        onClick={() => deleteTag(tag.id)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px', color: 'var(--danger)' }}
                        title="Excluir tag"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(false)}
            className="btn-secondary"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
