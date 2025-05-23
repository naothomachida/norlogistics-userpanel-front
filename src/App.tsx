import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { loginSuccess } from './store/authSlice';
import { mockUsers } from './data/mockUsers';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './screens/login';
import OrderList from './screens/orders/list';
import OrderForm from './screens/orders/form';
import OrderDetail from './screens/orders/detail';
import Settings from './screens/settings';
import Tolls from './screens/tolls';
import UsersList from './screens/users/list';
import UserForm from './screens/users/form';
import Drivers from './screens/drivers';

// Componente para auto-login em desenvolvimento
const AutoLogin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Verificar se já existe um usuário autenticado no localStorage
    const storedProfile = localStorage.getItem('userProfile');
    
    if (!storedProfile) {
      // Simular login com o usuário motorista para testes
      // Você pode alterar para outro usuário para testar diferentes permissões:
      // - user1: admin
      // - user2: manager (gerencia user3 e user4)
      // - user3: user regular (gerenciado por user2)
      // - user4: user regular (gerenciado por user2)
      // - user5: driver
      const testUser = mockUsers[4]; // Driver por padrão
      
      dispatch(loginSuccess({
        userProfile: testUser,
        accessToken: 'fake-token-for-development'
      }));
      
      // Salvar no localStorage para persistência entre reloads
      localStorage.setItem('userProfile', JSON.stringify(testUser));
      localStorage.setItem('authToken', 'fake-token-for-development');
    }
  }, [dispatch]);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AutoLogin>
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas que requerem autenticação */}
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders/new" 
              element={
                <ProtectedRoute>
                  <OrderForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders/:id" 
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tolls" 
              element={
                <ProtectedRoute>
                  <Tolls />
                </ProtectedRoute>
              } 
            />
            {/* Rotas de usuários */}
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <UsersList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users/new" 
              element={
                <ProtectedRoute>
                  <UserForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users/edit/:userId" 
              element={
                <ProtectedRoute>
                  <UserForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users/view/:userId" 
              element={
                <ProtectedRoute>
                  <UsersList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users/manager/:userId" 
              element={
                <ProtectedRoute>
                  <UsersList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/drivers" 
              element={
                <ProtectedRoute>
                  <Drivers />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota de fallback para qualquer caminho não encontrado */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AutoLogin>
      </Router>
    </Provider>
  );
};

export default App;
