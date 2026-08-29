import React from 'react';
import { User, Moon, Sun, Shield, Info, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsView() {
  const { user, logout, theme, toggleTheme } = useAuth();

  return (
    <div className="settings-view">
      <div className="section-title-row" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>Configurações do Sistema</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Gerencie suas preferências visuais e dados de conta
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
        {/* 1. Perfil do Usuário */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <User size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Perfil & Conta</h3>
          </div>
          <div className="settings-card-body">
            <div className="settings-field-row">
              <span className="settings-field-label">Nome Completo:</span>
              <span className="settings-field-value">{user?.name || 'Não informado'}</span>
            </div>
            <div className="settings-field-row">
              <span className="settings-field-label">E-mail:</span>
              <span className="settings-field-value">{user?.email}</span>
            </div>
            <div className="settings-field-row">
              <span className="settings-field-label">Status da Conta:</span>
              <span className="badge-priority priority-baixa" style={{ display: 'inline-flex', width: 'fit-content' }}>
                <CheckCircle size={12} />
                <span>Ativa & Autenticada</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Aparência & Tema */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <Sun size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.15rem' }}>Aparência & Tema</h3>
          </div>
          <div className="settings-card-body">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Escolha entre o tema escuro focado ou o tema claro moderno.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div 
                className={`theme-picker-card ${theme === 'dark' ? 'selected' : ''}`}
                onClick={() => theme !== 'dark' && toggleTheme()}
              >
                <Moon size={24} color="#818cf8" />
                <span style={{ fontWeight: 700 }}>Modo Escuro</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Obsidian & Neon Glass</span>
              </div>

              <div 
                className={`theme-picker-card ${theme === 'light' ? 'selected' : ''}`}
                onClick={() => theme !== 'light' && toggleTheme()}
              >
                <Sun size={24} color="#f59e0b" />
                <span style={{ fontWeight: 700 }}>Modo Claro</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Limpo e Iluminado</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Informações do Aplicativo */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <Info size={20} color="var(--info)" />
            <h3 style={{ fontSize: '1.15rem' }}>Sobre o TaskFlow</h3>
          </div>
          <div className="settings-card-body">
            <div className="settings-field-row">
              <span className="settings-field-label">Versão do App:</span>
              <span className="settings-field-value">v2.0.0 (Fullstack Pro)</span>
            </div>
            <div className="settings-field-row">
              <span className="settings-field-label">Tecnologias:</span>
              <span className="settings-field-value">React 18, Express, SQLite3, JWT & Design Tokens</span>
            </div>
          </div>
        </div>

        {/* 4. Ações de Saída */}
        <div className="settings-card glass-panel" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="settings-card-header" style={{ color: 'var(--danger)' }}>
            <LogOut size={20} />
            <h3 style={{ fontSize: '1.15rem' }}>Encerrar Sessão</h3>
          </div>
          <div className="settings-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Deseja desconectar sua conta deste dispositivo?
            </p>
            <button
              onClick={logout}
              className="btn-secondary"
              style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            >
              <LogOut size={16} />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
