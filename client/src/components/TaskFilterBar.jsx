import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TaskFilterBar() {
  const {
    search,
    setSearch,
    statusTab,
    setStatusTab,
    categories,
    tags,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    tagFilter,
    setTagFilter,
    clearFilters,
    hasActiveFilters
  } = useTasks();

  return (
    <div className="filter-bar glass-panel">
      {/* Search & Status Tabs Row */}
      <div className="filter-top-row">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar tarefas pelo título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-search-tasks"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="status-tabs">
          <button
            className={`status-tab-btn ${statusTab === 'all' ? 'active' : ''}`}
            onClick={() => setStatusTab('all')}
          >
            Todas
          </button>
          <button
            className={`status-tab-btn ${statusTab === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusTab('pending')}
          >
            Pendentes
          </button>
          <button
            className={`status-tab-btn ${statusTab === 'today' ? 'active' : ''}`}
            onClick={() => setStatusTab('today')}
          >
            Hoje
          </button>
          <button
            className={`status-tab-btn ${statusTab === 'overdue' ? 'active' : ''}`}
            onClick={() => setStatusTab('overdue')}
          >
            Atrasadas
          </button>
          <button
            className={`status-tab-btn ${statusTab === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusTab('completed')}
          >
            Concluídas
          </button>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="filter-dropdowns-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
          <Filter size={15} />
          <span>Filtros:</span>
        </div>

        {/* Categoria */}
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          id="select-category-filter"
        >
          <option value="">Todas as Categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              📁 {cat.name}
            </option>
          ))}
        </select>

        {/* Prioridade */}
        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          id="select-priority-filter"
        >
          <option value="">Todas as Prioridades</option>
          <option value="urgente">🔴 Urgente</option>
          <option value="media">🟡 Média</option>
          <option value="baixa">🟢 Baixa</option>
        </select>

        {/* Tags */}
        <select
          className="filter-select"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          id="select-tag-filter"
        >
          <option value="">Todas as Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              🏷️ {tag.name}
            </option>
          ))}
        </select>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem', color: 'var(--danger)' }}
          >
            <X size={14} />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
}
