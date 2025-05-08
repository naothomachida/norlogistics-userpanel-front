import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { checkAuth } from '../store/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(checkAuth() as any);
    }
  }, [dispatch, isAuthenticated]);

  // Enquanto está verificando o token, não tomar nenhuma ação
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não estiver autenticado após a verificação, redirecionar para o login
  if (!isAuthenticated) {
    // Salvamos o local atual para redirecionar de volta depois do login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderizar o componente filho
  return <>{children}</>;
};

export default ProtectedRoute; 