import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const lastAttempt = useRef(0);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const now = Date.now();
    if (now - lastAttempt.current < 2000) {
      setErrorMsg('Aguarde um momento antes de tentar novamente.');
      return;
    }
    lastAttempt.current = now;

    setIsLoading(true);
    setErrorMsg('');
    
    try {
      await handleLogin(email, password);
      navigate('/');
    } catch (error) {
      // Translate Supabase error messages to Portuguese
      const msg = error?.message || 'Erro desconhecido';
      if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Email ou senha incorretos.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMsg('Email ainda não confirmado. Verifique sua caixa de entrada.');
      } else if (msg.includes('Too many requests')) {
        setErrorMsg('Muitas tentativas. Aguarde alguns minutos.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">

      {/* Floating educational icons */}
      <div className="login-floating-icons">
        <span className="floating-icon">📚</span>
        <span className="floating-icon">✏️</span>
        <span className="floating-icon">🎓</span>
        <span className="floating-icon">📐</span>
        <span className="floating-icon">🌸</span>
        <span className="floating-icon">📝</span>
        <span className="floating-icon">🎒</span>
        <span className="floating-icon">📖</span>
        <span className="floating-icon">🏫</span>
        <span className="floating-icon">💡</span>
      </div>
      
      {/* Main split card */}
      <div className="login-split">
        
        {/* Left — Brand identity */}
        <div className="login-brand-side">
          <div className="brand-logo-circle">
            <span className="brand-emoji">👸</span>
          </div>

          <h1 className="brand-title">Espacinho da Quesia</h1>
          <p className="brand-subtitle">
            Gestão escolar com carinho, organização e excelência pedagógica.
          </p>

          <div className="brand-features">
            <span className="feature-tag">📋 Turmas</span>
            <span className="feature-tag">👩‍🏫 Professores</span>
            <span className="feature-tag">📊 Relatórios</span>
            <span className="feature-tag">📅 Calendário</span>
            <span className="feature-tag">📖 Sequências</span>
          </div>

          <div className="brand-sparkles">
            <span className="sparkle-dot"></span>
            <span className="sparkle-dot"></span>
            <span className="sparkle-dot"></span>
            <span className="sparkle-dot"></span>
            <span className="sparkle-dot"></span>
          </div>
        </div>

        {/* Right — Login form */}
        <div className="login-form-side">
          <div className="form-container">
            
            <div className="form-welcome">
              <span className="welcome-emoji">✨</span>
              <h2>Bem-vinda de volta!</h2>
              <p>Acesse sua plataforma de gestão escolar</p>
            </div>

            {errorMsg && (
              <div className="login-error-banner">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={onSubmit}>
              <div className="form-group-login">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Endereço de Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group-login">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Sua Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                className={`btn-auth ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><span className="btn-spinner"></span> Autenticando...</>
                ) : (
                  'Entrar na Plataforma'
                )}
              </button>
            </form>

            <div className="login-footer-text">
              Feito com 💖 para o <span>Espacinho da Quesia</span>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
