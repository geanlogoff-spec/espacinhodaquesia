import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Lock, Mail, ChevronRight, School } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, perfil } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="login-wrapper">
      <div className="login-container animate-fade-in">
        
        {/* Lado Esquerdo - Branding / Slogan */}
        <div className="login-brand-side">
           <div className="brand-content">
             <School size={48} color="white" style={{marginBottom: '1rem', opacity: 0.9}}/>
             <h1>{perfil.tituloDaPlataforma} {perfil.nome}</h1>
             <p className="slogan">"Simplificando a Gestão Pedagógica com Elegância e Praticidade."</p>
           </div>
           
           <div className="brand-footer">
             Painel Administrativo Restrito
           </div>
           
           {/* Abstract Decoration */}
           <div className="circle-decor c1"></div>
           <div className="circle-decor c2"></div>
        </div>
        
        {/* Lado Direito - Formulário */}
        <div className="login-form-side">
           <div className="form-header">
              <h2>Bem-vinda de volta! {perfil.emoji}</h2>
              <p>Insira suas credenciais mágicas para acessar a coordenação.</p>
           </div>
           
           <form className="auth-form" onSubmit={onSubmit}>
              <div className="form-group-login">
                <label>E-mail Institucional</label>
                <div className="input-icon-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="voce@escola.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-login">
                <label>Senha de Acesso</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="forgot-password">
                <span>Esqueceu a senha?</span>
              </div>

              <button 
                 type="submit" 
                 className={`btn-auth ${isLoading ? 'loading' : ''}`}
                 disabled={isLoading}
              >
                {isLoading ? 'Autenticando...' : (
                  <>Destrancar Painel <ChevronRight size={18}/></>
                )}
              </button>
           </form>
           
           <div className="disclaimer-mock">
             🔐 (Modo de Demonstração: Qualquer e-mail ou senha irá liberar o acesso.)
           </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
