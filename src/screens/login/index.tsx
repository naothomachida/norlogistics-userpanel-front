import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, checkAuth } from '../../store/authSlice';
import { RootState } from '../../store';
import './login.css';
import norLogo from '../../assets/logo-nor.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error: authError } = useSelector((state: RootState) => state.auth);
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showLoginInfo, setShowLoginInfo] = useState(true);

  // Credenciais de exemplo para mostrar na tela
  const loginExamples = [
    { role: 'Administrador', email: 'admin@exemplo.com', password: 'senha123' },
    { role: 'Gerente', email: 'gerente@exemplo.com', password: 'senha123' },
    { role: 'Motorista', email: 'motorista@exemplo.com', password: 'senha123' },
    { role: 'Usuário', email: 'usuario@exemplo.com', password: 'senha123' },
  ];

  // Verificar se o usuário já está autenticado ao montar o componente
  useEffect(() => {
    dispatch(checkAuth() as any);
    
    if (isAuthenticated) {
      navigate('/orders');
    }
  }, [dispatch, navigate, isAuthenticated]);

  // Redirecionar se o login for bem-sucedido
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/orders');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
    // Limpar mensagem de erro quando o usuário começa a digitar novamente
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!credentials.email || !credentials.password) {
      setLocalError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Use a action do Redux para fazer login (vai simular o login para qualquer credencial)
      await dispatch(loginUser(credentials) as any);
    } catch (err) {
      setLocalError('Erro ao tentar fazer login. Tente novamente mais tarde.');
    }
  };

  // Função para preencher automaticamente os campos de login com os dados do usuário selecionado
  const fillCredentials = (email: string, password: string) => {
    setCredentials({ email, password });
  };

  // Exibir mensagem de erro (do estado local ou do Redux)
  const displayError = localError || authError;

  return (
    <div className="login-page">
      {showLoginInfo && (
        <div className="login-info-panel">
          <div className="login-info-header">
            <h3>Credenciais de Acesso</h3>
            <button 
              className="close-button"
              onClick={() => setShowLoginInfo(false)}
            >
              ×
            </button>
          </div>
          <div className="login-info-content">
            <p>Clique em um perfil abaixo para preencher as credenciais automaticamente:</p>
            <div className="login-info-cards">
              {loginExamples.map((example, index) => (
                <div 
                  key={index} 
                  className="login-info-card"
                  onClick={() => fillCredentials(example.email, example.password)}
                >
                  <h4>{example.role}</h4>
                  <p><strong>Email:</strong> {example.email}</p>
                  <p><strong>Senha:</strong> {example.password}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="login-container">
        <div className="login-logo">
          <img src={norLogo} alt="NOR Logistics" />
          <h1>NOR-LOGISTICS</h1>
        </div>
        
        <div className="login-card">          
          {displayError && <div className="login-error">{displayError}</div>}
          
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
              <label htmlFor="password">Senha</label>
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
              {!showLoginInfo && (
                <button 
                  type="button"
                  className="show-credentials-button"
                  onClick={() => setShowLoginInfo(true)}
                >
                  Mostrar credenciais
                </button>
              )}
            </div>
            
            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
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