import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import norLogo from '../../assets/logo-nor.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
    // Limpar mensagem de erro quando o usuário começa a digitar novamente
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!credentials.email || !credentials.password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsLoading(true);
      // Simulação de autenticação (em uma aplicação real, seria uma chamada API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Credenciais de demonstração
      if (credentials.email === 'admin@norlogistic.com.br' && credentials.password === 'senha123') {
        // Armazenar informação de login
        if (rememberMe) {
          localStorage.setItem('userEmail', credentials.email);
        }
        // Navegar para o dashboard após login bem-sucedido
        navigate('/orders');
      } else {
        setError('Email ou senha incorretos. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao tentar fazer login. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <img src={norLogo} alt="NOR Logistics" />
          <h1>NOR-LOGISTICS</h1>
        </div>
        
        <div className="login-card">          
          {error && <div className="login-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
                required
              />
            </div>
            
            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Senha</label>
                <a href="#" className="forgot-password">Esqueceu a senha?</a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Digite sua senha"
                required
              />
            </div>
            
            <div className="login-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="remember-me">Lembrar-me</label>
              </div>
            </div>
            
            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        
        <div className="login-copyright">
          &copy; {new Date().getFullYear()} NOR Logistics. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Login; 