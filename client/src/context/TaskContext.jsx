import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { user, token } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Filtros ativos
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // all, pending, today, overdue, completed
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Modais
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Carregar dados de estatísticas
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/stats/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
    }
  }, [token]);

  // Carregar categorias
  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  }, [token]);

  // Carregar tags
  const fetchTags = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/tags');
      setTags(res.data.tags || []);
    } catch (err) {
      console.error('Erro ao buscar tags:', err);
    }
  }, [token]);

  // Carregar tarefas baseado nos filtros atuais
  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoadingTasks(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category_id = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (tagFilter) params.tag_id = tagFilter;

      if (statusTab === 'pending') {
        params.status = 'pendente';
      } else if (statusTab === 'completed') {
        params.status = 'concluida';
      } else if (statusTab === 'today') {
        params.filter = 'today';
      } else if (statusTab === 'overdue') {
        params.filter = 'overdue';
      }

      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      showToast('Erro ao carregar lista de tarefas', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, [token, search, statusTab, categoryFilter, priorityFilter, tagFilter, showToast]);

  // Atualizar tudo ao logar ou mudar filtros
  useEffect(() => {
    if (user && token) {
      fetchTasks();
      fetchStats();
      fetchCategories();
      fetchTags();
    } else {
      setTasks([]);
      setCategories([]);
      setTags([]);
      setStats(null);
    }
  }, [user, token, statusTab, categoryFilter, priorityFilter, tagFilter, search, fetchTasks, fetchStats, fetchCategories, fetchTags]);

  // Criar tarefa
  const createTask = async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      showToast('Tarefa criada com sucesso! 🚀');
      fetchTasks();
      fetchStats();
      fetchCategories();
      return res.data.task;
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      showToast(err.response?.data?.error || 'Erro ao criar tarefa', 'error');
      throw err;
    }
  };

  // Atualizar tarefa
  const updateTask = async (id, taskData) => {
    try {
      const res = await api.put(`/tasks/${id}`, taskData);
      showToast('Tarefa atualizada com sucesso!');
      fetchTasks();
      fetchStats();
      fetchCategories();
      return res.data.task;
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      showToast(err.response?.data?.error || 'Erro ao atualizar tarefa', 'error');
      throw err;
    }
  };

  // Toggle rápido de conclusão
  const toggleTask = async (id) => {
    try {
      const res = await api.patch(`/tasks/${id}/toggle`);
      const updated = res.data.task;
      
      if (updated.status === 'concluida') {
        // Confetti effect de conquista
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#06b6d4', '#f59e0b']
        });
        showToast('Parabéns! Tarefa concluída! 🎉');
      } else {
        showToast('Tarefa reaberta.');
      }

      // Atualização otimista
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      fetchStats();
      fetchCategories();
    } catch (err) {
      console.error('Erro ao alternar status:', err);
      showToast('Erro ao alternar status da tarefa', 'error');
    }
  };

  // Deletar tarefa
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      showToast('Tarefa excluída.');
      setTasks(prev => prev.filter(t => t.id !== id));
      fetchStats();
      fetchCategories();
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
      showToast('Erro ao excluir tarefa', 'error');
    }
  };

  // Criar categoria
  const createCategory = async (data) => {
    try {
      const res = await api.post('/categories', data);
      showToast('Categoria adicionada!');
      fetchCategories();
      return res.data.category;
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao criar categoria', 'error');
      throw err;
    }
  };

  // Criar tag
  const createTag = async (data) => {
    try {
      const res = await api.post('/tags', data);
      showToast('Tag adicionada!');
      fetchTags();
      return res.data.tag;
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao criar tag', 'error');
      throw err;
    }
  };

  // Deletar tag
  const deleteTag = async (id) => {
    try {
      await api.delete(`/tags/${id}`);
      showToast('Tag removida.');
      fetchTags();
      fetchTasks();
    } catch (err) {
      showToast('Erro ao remover tag', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusTab('all');
    setCategoryFilter('');
    setPriorityFilter('');
    setTagFilter('');
  };

  const hasActiveFilters = Boolean(
    search || statusTab !== 'all' || categoryFilter || priorityFilter || tagFilter
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        tags,
        stats,
        loadingTasks,
        search,
        setSearch,
        statusTab,
        setStatusTab,
        categoryFilter,
        setCategoryFilter,
        priorityFilter,
        setPriorityFilter,
        tagFilter,
        setTagFilter,
        clearFilters,
        hasActiveFilters,
        createTask,
        updateTask,
        toggleTask,
        deleteTask,
        createCategory,
        createTag,
        deleteTag,
        isTaskModalOpen,
        setIsTaskModalOpen,
        editingTask,
        openCreateModal,
        openEditModal,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        toasts
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks deve ser usado dentro de um TaskProvider');
  }
  return context;
}
