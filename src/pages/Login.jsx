import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Eye, EyeOff, School } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, perfil } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for effect
    setTimeout(() => {
       const success = handleLogin(email, password);
       if (success) {
          navigate('/');
       }
       setIsLoading(false);
    }, 1500);
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
      
      {/* Lado Direito - Formulário Clean (No Google/Facebook as requested) */}
      <div className="login-form-side">
         <div className="form-container">
           
           <div className="form-header">
              <h2>Bem-vinda!</h2>
           </div>
           
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
