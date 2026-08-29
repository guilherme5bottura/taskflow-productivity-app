import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  Layers,
  Award,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import TaskCard from './TaskCard';

export default function DashboardStats({ onNavigateTasks }) {
  const { user } = useAuth();
  const { stats, setStatusTab, openCreateModal } = useTasks();

  // Saudação dinâmica baseada no horário
  const hour = new Date().getHours();
  let greeting = 'Bom dia';
  if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
  else if (hour >= 18 || hour < 5) greeting = 'Boa noite';

  // Data formatada em português
  const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());
  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  if (!stats) return null;

  const { stats: kpis, upcomingTasks, categoryDistribution } = stats;

  return (
    <div className="dashboard-view">
      {/* 1. Header com Saudação e Data */}
      <section className="dashboard-header">
        <div className="dashboard-greeting">
          <div>
            <h1 className="greeting-title">
              {greeting}, {user?.name || 'Produtivo'}! 👋
            </h1>
            <p className="dashboard-date">{capitalizedDate}</p>
          </div>

          <button 
            onClick={openCreateModal}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.95rem' }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Criar Tarefa</span>
          </button>
        </div>

        {/* Banner de alerta se houver tarefas atrasadas */}
        {kpis.overdueTasks > 0 && (
          <div className="alert-banner">
            <div className="alert-banner-content">
              <AlertTriangle size={20} />
              <span>
                Atenção: você tem <strong>{kpis.overdueTasks} {kpis.overdueTasks === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}</strong> que precisam de atenção.
              </span>
            </div>
            <button 
              onClick={() => {
                setStatusTab('overdue');
                if (onNavigateTasks) onNavigateTasks();
              }}
              className="btn-secondary"
              style={{ 
                fontSize: '0.82rem', 
                padding: '6px 12px', 
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: 'var(--danger)'
              }}
            >
              Ver atrasadas
            </button>
          </div>
        )}
      </section>

      {/* 2. Grid de Cards de Produtividade & Métricas */}
      <section className="kpi-grid">
        {/* Card Destaque: Completadas na Última Semana */}
        <div 
          className="kpi-card highlight-card glass-panel"
          onClick={() => {
            setStatusTab('completed');
            if (onNavigateTasks) onNavigateTasks();
          }}
          title="Ver histórico de tarefas concluídas"
        >
          <div className="kpi-icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff' }}>
            <Award size={26} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.completedLastWeek || 0}</div>
            <div className="kpi-label">Concluídas na Semana</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} />
              <span>Últimos 7 dias</span>
            </div>
          </div>
        </div>

        {/* Total Ativas */}
        <div 
          className="kpi-card glass-panel"
          onClick={() => {
            setStatusTab('pending');
            if (onNavigateTasks) onNavigateTasks();
          }}
          title="Ver tarefas ativas"
        >
          <div className="kpi-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Layers size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.pendingTasks}</div>
            <div className="kpi-label">Tarefas Ativas</div>
          </div>
        </div>

        {/* Feitas Hoje */}
        <div 
          className="kpi-card glass-panel"
          onClick={() => {
            setStatusTab('completed');
            if (onNavigateTasks) onNavigateTasks();
          }}
          title="Ver tarefas feitas hoje"
        >
          <div className="kpi-icon-box" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.completedToday}</div>
            <div className="kpi-label">Feitas Hoje</div>
          </div>
        </div>

        {/* Vencem Hoje */}
        <div 
          className="kpi-card glass-panel"
          onClick={() => {
            setStatusTab('today');
            if (onNavigateTasks) onNavigateTasks();
          }}
          title="Ver tarefas que vencem hoje"
        >
          <div className="kpi-icon-box" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.dueToday}</div>
            <div className="kpi-label">Vencem Hoje</div>
          </div>
        </div>
      </section>

      {/* 3. Barra de Progresso de Produtividade */}
      <section className="analytics-card glass-panel" style={{ marginBottom: '28px' }}>
        <div className="analytics-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Produtividade Geral</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>
            {kpis.completionRate}% concluído ({kpis.completedTasks}/{kpis.totalTasks})
          </span>
        </div>

        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill"
            style={{ width: `${kpis.completionRate}%` }}
          />
        </div>

        {/* Categorias ativas */}
        {categoryDistribution && categoryDistribution.length > 0 && (
          <div className="category-pills-row">
            {categoryDistribution.map((cat, idx) => (
              <div key={idx} className="category-stat-pill">
                <span 
                  className="category-stat-dot" 
                  style={{ backgroundColor: cat.color }} 
                />
                <span>{cat.name}: <strong>{cat.count}</strong></span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Seção: Tarefas Próximas a Vencer */}
      <section className="upcoming-tasks-section">
        <div className="section-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="section-icon-box">
              <Calendar size={18} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Tarefas Próximas a Vencer</h2>
          </div>

          <button 
            onClick={onNavigateTasks}
            className="btn-link-action"
          >
            <span>Ver todas</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {upcomingTasks && upcomingTasks.length > 0 ? (
          <div className="task-list-container" style={{ marginTop: '14px' }}>
            {upcomingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="empty-state-box glass-panel" style={{ padding: '40px 20px', marginTop: '14px' }}>
            <div className="empty-state-icon" style={{ width: '56px', height: '56px' }}>
              <CheckCircle2 size={28} color="var(--success)" />
            </div>
            <h3 className="empty-state-title" style={{ fontSize: '1.1rem' }}>
              Tudo em dia! ✨
            </h3>
            <p className="empty-state-text" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              Você não tem tarefas urgentes ou com prazo próximo pendentes no momento.
            </p>
            <button onClick={openCreateModal} className="btn-secondary">
              <Plus size={16} />
              <span>Adicionar nova tarefa</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
