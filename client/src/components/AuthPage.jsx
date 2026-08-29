import React, { useState } from 'react';
import { CheckCircle2, Lock, Mail, User, ArrowRight, AlertCircle, KeyRound, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    if (authMode === 'login') {
      if (!password) {
        setError('Por favor, informe sua senha.');
        return;
      }

      setLoading(true);
      try {
        await login(email, password);
      } catch (err) {
        setError(err.response?.data?.error || 'Erro ao entrar. Verifique suas credenciais.');
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'register') {
      if (!name || !password) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }

      setLoading(true);
      try {
        await register(name, email, password);
      } catch (err) {
        setError(err.response?.data?.error || 'Erro ao cadastrar usuário.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Por favor, digite o e-mail cadastrado.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setAuthMode('reset');
      setSuccessMessage('E-mail localizado! Digite sua nova senha abaixo.');
    } catch (err) {
      setError(err.response?.data?.error || 'Não encontramos uma conta com este e-mail.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha a nova senha e a confirmação.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, newPassword });
      setSuccessMessage(res.data.message || 'Senha alterada com sucesso!');
      setTimeout(() => {
        setAuthMode('login');
        setSuccessMessage('Senha redefinida com sucesso! Faça login com a nova senha.');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        {/* Brand */}
        <div className="auth-brand">
          <div 
            className="brand-icon-wrapper" 
            style={{ width: '54px', height: '54px', margin: '0 auto 16px', borderRadius: 'var(--radius-lg)' }}
          >
            <CheckCircle2 size={30} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>TaskFlow</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Seu painel completo de produtividade e tarefas
          </p>
        </div>

        {/* Tabs: Entrar / Cadastrar (quando não estiver em recuperação) */}
        {(authMode === 'login' || authMode === 'register') && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setError('');
                setSuccessMessage('');
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setError('');
                setSuccessMessage('');
              }}
            >
              Criar Conta
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '18px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              background: 'var(--success-light)',
              color: 'var(--success)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '18px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <Check size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Formulário de Login / Cadastro */}
        {(authMode === 'login' || authMode === 'register') && (
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {authMode === 'register' && (
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Seu Nome Completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="Ex: Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="auth-pass">Senha</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setError('');
                      setSuccessMessage('');
                    }}
                    style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}
                    id="btn-forgot-password"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  id="auth-pass"
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '1rem' }}
              id="btn-auth-submit"
            >
              <span>{loading ? 'Aguarde...' : authMode === 'login' ? 'Entrar no Sistema' : 'Cadastrar e Começar'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* 2. Formulário de Solicitar Recuperação de Senha */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <KeyRound size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.2rem' }}>Recuperar Senha</h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Informe o e-mail cadastrado na sua conta para redefinir o seu acesso.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Seu E-mail Cadastrado</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>{loading ? 'Verificando...' : 'Continuar Recuperação'}</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className="btn-secondary"
              style={{ width: '100%', padding: '10px' }}
            >
              <ArrowLeft size={16} />
              <span>Voltar para o Login</span>
            </button>
          </form>
        )}

        {/* 3. Formulário de Redefinição de Nova Senha */}
        {authMode === 'reset' && (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Lock size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.2rem' }}>Criar Nova Senha</h2>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-new-pass">Nova Senha</label>
              <input
                id="reset-new-pass"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-pass">Confirmar Nova Senha</label>
              <input
                id="reset-confirm-pass"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>{loading ? 'Salvando...' : 'Salvar Nova Senha'}</span>
              <Check size={18} />
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className="btn-secondary"
              style={{ width: '100%', padding: '10px' }}
            >
              <ArrowLeft size={16} />
              <span>Cancelar e Voltar</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
