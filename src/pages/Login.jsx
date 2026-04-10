import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Eye, EyeOff, School, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, perfil } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
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
    <div className="login-wrapper animate-fade-in">
      
      {/* Lado Esquerdo - Branding Inspirado na Imagem */}
      <div className="login-brand-side">
         <div className="brand-header">
           <School size={36} color="white" />
           <span className="brand-name">{perfil.tituloDaPlataforma} {perfil.nome}</span>
         </div>
         
         <div className="brand-content">
           <h1>Gerencie turmas, tarefas e a evolução pedagógica.</h1>
         </div>
         
         {/* Espaço para ilustração estilo 3D (Substituído por arte CSS para evitar links quebrados) */}
         <div className="illustration-placeholder">
            <div className="abstract-art">
               <div className="shape circle-1"></div>
               <div className="shape square-1"></div>
               <div className="shape triangle-1"></div>
            </div>
         </div>
      </div>
      
      {/* Lado Direito - Formulário Clean */}
      <div className="login-form-side">
         <div className="form-container">
           
           <div className="form-header">
              <h2>Bem-vinda!</h2>
           </div>

           {errorMsg && (
             <div className="login-error-banner" style={{
               background: 'rgba(239, 68, 68, 0.1)',
               border: '1px solid rgba(239, 68, 68, 0.3)',
               borderRadius: '12px',
               padding: '0.8rem 1rem',
               marginBottom: '1rem',
               display: 'flex',
               alignItems: 'center',
               gap: '0.6rem',
               color: '#ef4444',
               fontSize: '0.9rem'
             }}>
               <AlertCircle size={18} />
               <span>{errorMsg}</span>
             </div>
           )}
           
           <form className="auth-form" onSubmit={onSubmit}>
              <div className="form-group-login">
                <input 
                  type="email" 
                  placeholder="Endereço de Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-login">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {isLoading ? 'Autenticando...' : 'Entrar na Conta'}
              </button>
           </form>
           
         </div>
      </div>

    </div>
  );
};

export default Login;
