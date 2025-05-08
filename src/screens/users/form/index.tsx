import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '../../../store';
import { updateUser, UserProfile, assignManager, removeManager } from '../../../store/authSlice';
import Header from '../../../components/layout/Header';
import { 
  FiUser, FiLock, FiUsers, FiUserCheck, FiX, FiMail, 
  FiImage, FiKey, FiShield, FiUserPlus, FiUserMinus,
  FiEye, FiEdit, FiLink, FiCheck, FiSlash, FiSearch,
  FiSave, FiInfo, FiTag, FiToggleRight, FiUpload, FiCamera, FiArrowRight,
  FiCalendar, FiFileText, FiAward, FiTruck, FiClipboard, FiClock
} from 'react-icons/fi';
import './form.css';

const UserForm: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { users, userProfile } = useSelector((state: RootState) => state.auth);
  const isCurrentUserAdmin = userProfile?.role === 'admin';
  const isEditing = !!userId;
  
  const [formData, setFormData] = useState<Partial<UserProfile> & { password?: string }>({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'manager' | 'user' | 'driver',
    status: 'active',
    avatarUrl: '',
    permissions: [],
    driverInfo: {
      licenseType: '',
      licenseNumber: '',
      licenseExpiry: '',
      licenseIssueDate: '',
      vehicleType: '',
      experience: 0,
      hasMedicalExam: false,
      medicalExamExpiry: '',
      observations: ''
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // States for manager selection
  const [selectedManagerId, setSelectedManagerId] = useState<string | undefined>(undefined);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  
  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para armazenar imagem em processo de upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Tab titles with icons
  const tabs = [
    { title: "Informações do Usuário", icon: <FiUser /> },
    { title: "Acessos e Permissões", icon: <FiLock /> },
    { title: "Segurança", icon: <FiKey /> },
    { title: "Gerente", icon: <FiUserCheck /> },
    { title: "Usuários Vinculados", icon: <FiUsers /> },
    { title: "Motorista", icon: <FiTruck /> }
  ];

  // Carregar dados do usuário se estiver editando
  useEffect(() => {
    if (isEditing && users.length > 0) {
      const user = users.find(u => u.id === userId);
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatarUrl || '',
          permissions: user.permissions || [],
          driverInfo: user.driverInfo || {
            licenseType: '',
            licenseNumber: '',
            licenseExpiry: '',
            licenseIssueDate: '',
            vehicleType: '',
            experience: 0,
            hasMedicalExam: false,
            medicalExamExpiry: '',
            observations: ''
          }
        });
        setSelectedManagerId(user.managerId);
      } else {
        // Usuário não encontrado
        navigate('/users');
      }
    }
  }, [isEditing, userId, users, navigate]);

  // Atualizar campo do formulário
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Limpar erro do campo quando o usuário digitar
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  // Atualizar permissões
  const handlePermissionChange = (permission: string, checked: boolean) => {
    const currentPermissions = formData.permissions || [];
    
    if (checked && !currentPermissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: [...currentPermissions, permission]
      });
    } else if (!checked && currentPermissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: currentPermissions.filter(p => p !== permission)
      });
    }
  };
  
  // Filtrar gerentes disponíveis
  const availableManagers = users.filter(user => 
    (user.role === 'admin' || user.role === 'manager') && 
    user.id !== userId &&
    user.status === 'active' &&
    (managerSearchTerm === '' || 
      user.name.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(managerSearchTerm.toLowerCase()))
  );
  
  // Obter gerente atual, se existir
  const currentManager = selectedManagerId ? users.find(u => u.id === selectedManagerId) : undefined;
  
  // Obter usuários gerenciados
  const managedUsers = isEditing ? users.filter(user => user.managerId === userId) : [];

  // Atribuir gerente
  const handleAssignManager = () => {
    if (isEditing && selectedManagerId && formData.role === 'user') {
      dispatch(assignManager({ userId, managerId: selectedManagerId }));
    }
  };
  
  // Remover gerente
  const handleRemoveManager = () => {
    if (isEditing && currentManager && formData.role === 'user') {
      dispatch(removeManager({ userId, managerId: currentManager.id }));
      setSelectedManagerId(undefined);
    }
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.role) {
      newErrors.role = 'Função é obrigatória';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }
    
    if (!isEditing && !formData.password) {
      newErrors.password = 'Senha é obrigatória para novos usuários';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Atualizar usuário existente
        dispatch(updateUser({ 
          userId, 
          changes: formData 
        }));
        
        // Atribuir gerente se selecionado
        if (selectedManagerId) {
          dispatch(assignManager({
            userId,
            managerId: selectedManagerId
          }));
        }
        
        // Simular um delay para mostrar o loading
        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/users');
        }, 500);
      } else {
        // TODO: Implementar criação de usuário
        // Por enquanto, apenas simular
        console.log('Criando novo usuário:', formData);
        
        // Simular um delay para mostrar o loading
        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/users');
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setIsSubmitting(false);
    }
  };

  // Traduzir função para português
  const translateRole = (role: string) => {
    const translations: Record<string, string> = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'user': 'Usuário',
      'driver': 'Motorista'
    };
    return translations[role] || role;
  };

  // Renderizar permissões com descrições mais detalhadas
  const permissionDetails: Record<string, { name: string, description: string, examples?: string }> = {
    'manage_drivers': {
      name: 'Gerenciar Motoristas',
      description: 'Permite criar, editar e excluir motoristas no sistema, visualizar status e atribuir rotas',
      examples: 'Adicionar novos motoristas, editar informações, desativar contas'
    },
    'view_orders': {
      name: 'Visualizar Pedidos',
      description: 'Permite visualizar todos os pedidos no sistema, incluindo histórico e detalhes completos',
      examples: 'Ver histórico de pedidos, acessar detalhes de entrega, visualizar status'
    },
    'create_orders': {
      name: 'Criar Pedidos',
      description: 'Permite criar novos pedidos no sistema e definir detalhes como destinatário, itens e prioridade',
      examples: 'Registrar novos pedidos, definir itens, estabelecer prazos de entrega'
    },
    'assign_drivers': {
      name: 'Atribuir Motoristas',
      description: 'Permite atribuir motoristas a pedidos específicos e gerenciar a distribuição de trabalho',
      examples: 'Associar motoristas a entregas, ajustar rotas, redistribuir cargas'
    },
    'view_own_orders': {
      name: 'Ver Próprios Pedidos',
      description: 'Permite visualizar apenas pedidos atribuídos ao usuário atual, sem acesso a pedidos de outros',
      examples: 'Motoristas visualizam apenas suas entregas, gerentes veem apenas seus departamentos'
    }
  };
  
  // Agrupar permissões por módulo para melhor organização
  const permissionModules = {
    'Gerenciamento de Usuários': ['manage_drivers'],
    'Pedidos': ['view_orders', 'create_orders', 'assign_drivers', 'view_own_orders']
  };

  // Função para converter imagem para base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Função para processar upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64Image = await convertToBase64(file);
        setImagePreview(base64Image);
        // Atualizar o formData com a nova imagem
        handleInputChange('avatarUrl', base64Image);
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
      }
    }
  };
  
  // Função para abrir o seletor de arquivo
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="users-page">
      <Header />
      <div className="users-content">
        <main className="users-main">
          <div className="form-header">
            <h1>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h1>
          </div>

          <div className="user-form-container">
            <div className="tabs-container">
              <div className="tabs-header">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    className={`tab-button ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {tab.icon} {tab.title}
                  </button>
                ))}
              </div>
              
              {/* Tab 1: Informações do Usuário */}
              <div className={`tab-content ${activeTab === 0 ? 'active' : ''}`}>
                <div className="avatar-section">
                  <div className="avatar-preview-container">
                    {(imagePreview || formData.avatarUrl) ? (
                      <div className="avatar-preview">
                        <img 
                          src={imagePreview || formData.avatarUrl || ''}
                          alt="Preview do avatar"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=0D8ABC&color=fff`;
                          }}
                        />
                        <button type="button" className="change-avatar-btn" onClick={triggerFileInput}>
                          <FiCamera />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="avatar-preview avatar-placeholder"
                        onClick={triggerFileInput}
                      >
                        {formData.name ? formData.name.charAt(0).toUpperCase() : 'AD'}
                        <div className="avatar-upload-overlay">
                          <FiCamera />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="avatar-controls">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button 
                      type="button" 
                      className="upload-button"
                      onClick={triggerFileInput}
                    >
                      <FiUpload /> Selecionar Imagem
                    </button>
                    <small className="form-help-text">Selecione uma imagem para o perfil do usuário</small>
                  </div>
                </div>
                
                <div className="user-section">
                  <h3><FiUser /> Informações Básicas</h3>
                  <div className="form-columns">
                    <div className="form-column">
                      <div className="form-group">
                        <label htmlFor="name">
                          <div className="label-with-icon">
                            <FiInfo /> <span>Nome</span> <span className="required">*</span>
                          </div>
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <div className="error-message">{errors.name}</div>}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email">
                          <div className="label-with-icon">
                            <FiMail /> <span>Email</span> <span className="required">*</span>
                          </div>
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <div className="error-message">{errors.email}</div>}
                      </div>
                    </div>
                    
                    <div className="form-column">
                      <div className="form-group">
                        <label htmlFor="role">
                          <div className="label-with-icon">
                            <FiTag /> <span>Função</span> <span className="required">*</span>
                          </div>
                        </label>
                        <select
                          id="role"
                          value={formData.role || ''}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          disabled={!isCurrentUserAdmin}
                          className={errors.role ? 'error' : ''}
                        >
                          <option value="">-- Selecione uma função --</option>
                          <option value="admin">Administrador</option>
                          <option value="manager">Gerente</option>
                          <option value="user">Usuário</option>
                          <option value="driver">Motorista</option>
                        </select>
                        {errors.role && <div className="error-message">{errors.role}</div>}
                        {!isCurrentUserAdmin && (
                          <small className="form-help-text">Apenas administradores podem modificar a função dos usuários</small>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="status">
                          <div className="label-with-icon">
                            <FiToggleRight /> <span>Status</span> <span className="required">*</span>
                          </div>
                        </label>
                        <select 
                          id="status" 
                          value={formData.status || ''}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className={errors.status ? 'error' : ''}
                        >
                          <option value="">-- Selecione um status --</option>
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                        </select>
                        {errors.status && <div className="error-message">{errors.status}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tab 2: Acessos e Permissões */}
              <div className={`tab-content ${activeTab === 1 ? 'active' : ''}`}>
                <div className="permissions-modules">
                  {Object.entries(permissionModules).map(([moduleName, modulePermissions]) => (
                    <div key={moduleName} className="access-module">
                      <div className="module-title-container">
                        <h3 className="access-module-title">
                          {moduleName === 'Gerenciamento de Usuários' ? <FiUsers /> : <FiShield />} {moduleName}
                        </h3>
                        <button 
                          className="toggle-all-button"
                          onClick={() => {
                            // Verifica se todas as permissões do módulo estão selecionadas
                            const allChecked = modulePermissions.every(p => formData.permissions?.includes(p));
                            
                            // Atualiza todas as permissões do módulo
                            const updatedPermissions = formData.permissions || [];
                            if (allChecked) {
                              // Remove todas as permissões do módulo
                              setFormData({
                                ...formData,
                                permissions: updatedPermissions.filter(p => !modulePermissions.includes(p))
                              });
                            } else {
                              // Adiciona todas as permissões do módulo
                              const newPermissions = [
                                ...updatedPermissions,
                                ...modulePermissions.filter(p => !updatedPermissions.includes(p))
                              ];
                              setFormData({
                                ...formData,
                                permissions: newPermissions
                              });
                            }
                          }}
                          disabled={!isCurrentUserAdmin}
                        >
                          {modulePermissions.every(p => formData.permissions?.includes(p)) 
                            ? <><FiSlash /> Desmarcar Todos</> 
                            : <><FiCheck /> Marcar Todos</>}
                        </button>
                      </div>
                      
                      <div className="permission-cards">
                        {modulePermissions.map(permission => (
                          <div 
                            key={permission} 
                            className={`permission-card ${formData.permissions?.includes(permission) ? 'selected' : ''}`}
                            onClick={() => {
                              if (!isCurrentUserAdmin) return;
                              handlePermissionChange(permission, !formData.permissions?.includes(permission));
                            }}
                          >
                            <div className="permission-card-header">
                              <div className="permission-checkbox">
                                <input 
                                  type="checkbox" 
                                  id={`permission-${permission}`}
                                  checked={formData.permissions?.includes(permission) || false}
                                  onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                                  disabled={!isCurrentUserAdmin}
                                />
                                <label htmlFor={`permission-${permission}`}>{permissionDetails[permission]?.name || permission}</label>
                              </div>
                              {formData.permissions?.includes(permission) && (
                                <div className="permission-status">
                                  <FiCheck className="check-icon" />
                                </div>
                              )}
                            </div>
                            <div className="permission-card-content">
                              <p className="permission-description">{permissionDetails[permission]?.description || ''}</p>
                            </div>
                            {permissionDetails[permission]?.examples && (
                              <div className="permission-examples">
                                <span>Exemplos: {permissionDetails[permission]?.examples}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {!isCurrentUserAdmin && (
                  <div className="permissions-admin-note">
                    <FiInfo />
                    <small className="form-help-text">Apenas administradores podem modificar as permissões dos usuários</small>
                  </div>
                )}
              </div>
              
              {/* Tab 3: Segurança */}
              <div className={`tab-content ${activeTab === 2 ? 'active' : ''}`}>
                <div className="user-section">
                  <h3><FiKey /> Senha</h3>
                  <div className="form-columns">
                    {isEditing ? (
                      <>
                        <div className="form-column">
                          <div className="form-group">
                            <label htmlFor="newPassword">
                              <div className="label-with-icon">
                                <FiLock /> <span>Nova Senha</span>
                              </div>
                            </label>
                            <input 
                              type="password" 
                              id="newPassword" 
                              placeholder="Digite a nova senha"
                              value={formData.password || ''}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="form-column">
                          <div className="form-group">
                            <label htmlFor="confirmPassword">
                              <div className="label-with-icon">
                                <FiLock /> <span>Confirmar Senha</span>
                              </div>
                            </label>
                            <input 
                              type="password" 
                              id="confirmPassword" 
                              placeholder="Confirme a nova senha"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="form-column">
                        <div className="form-group">
                          <label htmlFor="password">
                            <div className="label-with-icon">
                              <FiLock /> <span>Senha</span> <span className="required">*</span>
                            </div>
                          </label>
                          <input 
                            type="password" 
                            id="password" 
                            value={formData.password || ''}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Digite uma senha forte"
                            className={errors.password ? 'error' : ''}
                          />
                          {errors.password && <div className="error-message">{errors.password}</div>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="confirmPassword">
                            <div className="label-with-icon">
                              <FiLock /> <span>Confirmar Senha</span> <span className="required">*</span>
                            </div>
                          </label>
                          <input 
                            type="password" 
                            id="confirmPassword" 
                            placeholder="Confirme a senha"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="password-requirements">
                    <h4>Requisitos de Senha</h4>
                    <ul>
                      <li className="requirement-met"><FiCheck /> Pelo menos 8 caracteres</li>
                      <li><FiX /> Pelo menos uma letra maiúscula</li>
                      <li><FiX /> Pelo menos um número</li>
                      <li><FiX /> Pelo menos um caractere especial</li>
                    </ul>
                  </div>
                  
                  {isEditing && (
                    <div className="form-actions mt-4">
                      <button type="button" className="primary-button">
                        <FiSave /> Salvar Nova Senha
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="user-section">
                  <h3><FiShield /> Autenticação de Dois Fatores</h3>
                  
                  <div className="two-factor-status">
                    <div className="status-indicator disabled">
                      <FiX className="status-icon" />
                      <span>Autenticação de dois fatores está desativada</span>
                    </div>
                    
                    <p className="two-factor-description">
                      A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta, 
                      exigindo não apenas uma senha, mas também um segundo fator, 
                      como um código gerado em seu telefone.
                    </p>
                    
                    <div className="form-actions">
                      <button type="button" className="primary-button">
                        <FiShield /> Ativar Autenticação de Dois Fatores
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tab 4: Gerente (antigo Tab 3) */}
              <div className={`tab-content ${activeTab === 3 ? 'active' : ''}`}>
                {formData.role === 'user' ? (
                  <>
                    <div className="user-section">
                      <h3><FiUserCheck /> Gerente Responsável</h3>
                      
                      {currentManager && (
                        <div className="current-manager-container">
                          <h4 className="section-subtitle">Gerente Atual</h4>
                          <div className="current-manager">
                            <div className="user-avatar medium">
                              {currentManager.avatarUrl ? (
                                <img 
                                  src={currentManager.avatarUrl} 
                                  alt={currentManager.name}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://ui-avatars.com/api/?name=${currentManager.name}&background=0D8ABC&color=fff`;
                                  }}
                                />
                              ) : (
                                <div className="avatar-placeholder">
                                  {currentManager.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="current-manager-info">
                              <div className="current-manager-name">{currentManager.name}</div>
                              <div className="current-manager-email">{currentManager.email}</div>
                              <div className="role-badge small role-{currentManager.role}">
                                {translateRole(currentManager.role)}
                              </div>
                            </div>
                            <button 
                              className="remove-manager-btn"
                              onClick={handleRemoveManager}
                            >
                              <FiUserMinus /> Remover Gerente
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="manager-selection-container">
                        <h4 className="section-subtitle">{currentManager ? 'Alterar Gerente' : 'Selecionar Gerente'}</h4>
                        <div className="form-group manager-search">
                          <label htmlFor="manager-search">
                            <div className="label-with-icon">
                              <FiSearch /> <span>Buscar Gerente</span>
                            </div>
                          </label>
                          <input 
                            id="manager-search"
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={managerSearchTerm}
                            onChange={(e) => setManagerSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        {availableManagers.length > 0 ? (
                          <div className="manager-list">
                            {availableManagers.map(manager => (
                              <div 
                                key={manager.id}
                                className={`manager-option ${selectedManagerId === manager.id ? 'selected' : ''}`}
                                onClick={() => setSelectedManagerId(manager.id)}
                              >
                                <div className="user-avatar small">
                                  {manager.avatarUrl ? (
                                    <img 
                                      src={manager.avatarUrl} 
                                      alt={manager.name}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = `https://ui-avatars.com/api/?name=${manager.name}&background=0D8ABC&color=fff`;
                                      }}
                                    />
                                  ) : (
                                    <div className="avatar-placeholder small">
                                      {manager.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="manager-option-info">
                                  <div className="manager-option-name">{manager.name}</div>
                                  <div className="manager-option-email">{manager.email}</div>
                                  <div className="role-badge extra-small role-{manager.role}">
                                    {translateRole(manager.role)}
                                  </div>
                                </div>
                                {selectedManagerId === manager.id && <FiCheck className="selected-check" />}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-results">
                            <FiUsers />
                            <p>Nenhum gerente disponível encontrado</p>
                          </div>
                        )}
                        
                        {selectedManagerId && selectedManagerId !== formData.managerId && (
                          <div className="form-actions mt-4">
                            <button 
                              className="primary-button"
                              onClick={handleAssignManager}
                            >
                              <FiUserPlus /> {currentManager ? 'Alterar Gerente' : 'Atribuir Gerente'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="user-section">
                      <h3><FiInfo /> Informações sobre Gerenciamento</h3>
                      <div className="manager-info-text">
                        <p>Um gerente é responsável por supervisionar as atividades do usuário e pode ter acesso a relatórios e métricas de desempenho relacionadas a este usuário.</p>
                        
                        <ul className="manager-benefits">
                          <li><FiCheck className="benefit-icon" /> Supervisão direta do trabalho</li>
                          <li><FiCheck className="benefit-icon" /> Acesso a métricas de desempenho</li>
                          <li><FiCheck className="benefit-icon" /> Aprovação de solicitações</li>
                          <li><FiCheck className="benefit-icon" /> Suporte técnico de primeira linha</li>
                        </ul>
                        
                        <p className="manager-note">
                          <FiInfo className="note-icon" />
                          Apenas usuários com perfil de Administrador ou Gerente podem ser atribuídos como gerentes.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="user-section">
                    <h3><FiUserCheck /> Gerente Responsável</h3>
                    <div className="role-restriction-alert">
                      <div className="alert-icon">
                        <FiInfo />
                      </div>
                      <div className="alert-content">
                        <h4>Somente usuários do tipo "Usuário" podem ser vinculados a um gerente</h4>
                        <p>Os perfis "Administrador" e "Gerente" possuem acesso às funcionalidades administrativas do sistema e não podem ser subordinados a outros usuários.</p>
                        <p>Este usuário possui o perfil <strong>{formData.role ? translateRole(formData.role) : ""}</strong>, por isso não é possível atribuir um gerente.</p>
                      </div>
                    </div>
                    
                    <div className="manager-info-text">
                      <p className="role-change-note">
                        <FiArrowRight className="note-icon" />
                        Para poder atribuir um gerente a este usuário, vá até a aba <strong>Informações do Usuário</strong> e altere a função para <strong>Usuário</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tab 5: Usuários Vinculados (antigo Tab 4) */}
              <div className={`tab-content ${activeTab === 4 ? 'active' : ''}`}>
                <div className="user-section">
                  <h3><FiUsers /> Usuários Gerenciados</h3>
                  
                  {isEditing ? (
                    <>
                      <div className="users-search-container">
                        <div className="search-input-container">
                          <FiSearch className="search-icon" />
                          <input 
                            type="text" 
                            placeholder="Buscar usuários..." 
                            className="users-search-input"
                            value={managerSearchTerm}
                            onChange={(e) => setManagerSearchTerm(e.target.value)}
                          />
                          {managerSearchTerm && (
                            <button 
                              className="clear-search-btn"
                              onClick={() => setManagerSearchTerm('')}
                            >
                              <FiX />
                            </button>
                          )}
                        </div>
                        <div className="search-results-info">
                          {managedUsers.length > 0 && (
                            <span>Exibindo {managedUsers.length} usuários gerenciados</span>
                          )}
                        </div>
                      </div>
                      
                      {managedUsers.length > 0 ? (
                        <div className="managed-users-section">
                          <h4 className="section-subtitle">Usuários Vinculados</h4>
                          
                          <div className="managed-users-container">
                            {managedUsers
                              .filter(user => 
                                user.name.toLowerCase().includes(managerSearchTerm.toLowerCase()) || 
                                user.email.toLowerCase().includes(managerSearchTerm.toLowerCase())
                              )
                              .map(user => (
                                <div key={user.id} className="managed-user-card">
                                  <div className="user-avatar medium">
                                    {user.avatarUrl ? (
                                      <img 
                                        src={user.avatarUrl} 
                                        alt={user.name}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`;
                                        }}
                                      />
                                    ) : (
                                      <div className="avatar-placeholder medium">
                                        {user.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <div className={`user-status-indicator ${user.status === 'active' ? 'active' : 'inactive'}`}></div>
                                  </div>
                                  <div className="managed-user-info">
                                    <div className="managed-user-name">{user.name}</div>
                                    <div className="managed-user-email">{user.email}</div>
                                    <div className="managed-user-role">
                                      <span className={`role-badge extra-small role-${user.role}`}>
                                        {translateRole(user.role)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="managed-user-actions">
                                    <button 
                                      className="action-button unlink" 
                                      title="Remover vínculo"
                                      onClick={() => {
                                        dispatch(removeManager({ 
                                          userId: user.id, 
                                          managerId: userId 
                                        }));
                                      }}
                                    >
                                      <FiUserMinus /> Desvincular
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                          
                          {managedUsers.filter(user => 
                            user.name.toLowerCase().includes(managerSearchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(managerSearchTerm.toLowerCase())
                          ).length === 0 && managerSearchTerm && (
                            <div className="no-search-results">
                              <FiSearch />
                              <p>Nenhum usuário vinculado encontrado para "{managerSearchTerm}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="no-managed-users">
                          <div className="no-data-icon">
                            <FiUsers />
                          </div>
                          <h4>Nenhum usuário vinculado</h4>
                          <p>Este usuário não gerencia nenhum outro usuário no momento.</p>
                          <p className="no-data-tip">Vincule usuários usando a seção abaixo.</p>
                        </div>
                      )}
                      
                      <div className="available-users-section">
                        <h4 className="section-subtitle">Vincular Novos Usuários</h4>
                        
                        <div className="managed-users-container">
                          {users
                            .filter(user => 
                              user.id !== userId && // Não mostrar o próprio usuário
                              !managedUsers.some(managedUser => managedUser.id === user.id) && // Não mostrar usuários já gerenciados
                              (user.name.toLowerCase().includes(managerSearchTerm.toLowerCase()) || 
                               user.email.toLowerCase().includes(managerSearchTerm.toLowerCase()))
                            )
                            .map(user => (
                              <div key={user.id} className="managed-user-card available">
                                <div className="user-avatar medium">
                                  {user.avatarUrl ? (
                                    <img 
                                      src={user.avatarUrl} 
                                      alt={user.name}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`;
                                      }}
                                    />
                                  ) : (
                                    <div className="avatar-placeholder medium">
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className={`user-status-indicator ${user.status === 'active' ? 'active' : 'inactive'}`}></div>
                                </div>
                                <div className="managed-user-info">
                                  <div className="managed-user-name">{user.name}</div>
                                  <div className="managed-user-email">{user.email}</div>
                                  <div className="managed-user-role">
                                    <span className={`role-badge extra-small role-${user.role}`}>
                                      {translateRole(user.role)}
                                    </span>
                                  </div>
                                </div>
                                <div className="managed-user-actions">
                                  <button 
                                    className="action-button link" 
                                    title="Vincular usuário"
                                    onClick={() => {
                                      dispatch(assignManager({ 
                                        userId: user.id, 
                                        managerId: userId 
                                      }));
                                    }}
                                  >
                                    <FiUserPlus /> Vincular
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                        
                        {users.filter(user => 
                          user.id !== userId && 
                          !managedUsers.some(managedUser => managedUser.id === user.id) &&
                          (user.name.toLowerCase().includes(managerSearchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(managerSearchTerm.toLowerCase()))
                        ).length === 0 && (
                          <div className="no-search-results">
                            <FiSearch />
                            <p>
                              {managerSearchTerm 
                                ? `Nenhum usuário encontrado para "${managerSearchTerm}"`
                                : "Não há usuários disponíveis para vincular"}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="no-managed-users">
                      <div className="no-data-icon">
                        <FiInfo />
                      </div>
                      <h4>Novo usuário</h4>
                      <p>Salve o usuário primeiro para gerenciar os usuários vinculados.</p>
                      <p className="no-data-tip">Após salvar, você poderá vincular outros usuários a este gerente.</p>
                    </div>
                  )}
                </div>
                
                <div className="user-section">
                  <h3><FiInfo /> Sobre Gerenciamento de Usuários</h3>
                  <div className="linked-users-info">
                    <p>
                      Usuários gerenciados são aqueles que estão sob a supervisão direta deste usuário. 
                      O gerente tem permissões especiais relacionadas aos usuários sob sua responsabilidade.
                    </p>
                    
                    <div className="responsibility-cards">
                      <div className="responsibility-card">
                        <FiEye className="card-icon" />
                        <h4>Supervisão</h4>
                        <p>O gerente pode visualizar métricas, relatórios e atividades dos usuários vinculados.</p>
                      </div>
                      
                      <div className="responsibility-card">
                        <FiEdit className="card-icon" />
                        <h4>Edição</h4>
                        <p>O gerente pode editar determinadas informações e configurações dos usuários vinculados.</p>
                      </div>
                      
                      <div className="responsibility-card">
                        <FiUserMinus className="card-icon" />
                        <h4>Desvinculação</h4>
                        <p>O gerente pode desvincular usuários de sua supervisão quando necessário.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tab 6: Motorista */}
              <div className={`tab-content ${activeTab === 5 ? 'active' : ''}`}>
                {formData.role === 'driver' ? (
                  <>
                    <div className="user-section">
                      <h3><FiTruck /> Informações do Motorista</h3>
                      
                      <div className="driver-info-card">
                        <div className="driver-info-title">
                          <FiFileText /> Carteira Nacional de Habilitação (CNH)
                        </div>
                        
                        <div className="license-info-grid">
                          <div className="form-group">
                            <label htmlFor="licenseType">
                              <div className="label-with-icon">
                                <FiTag /> <span>Categoria da CNH</span> <span className="required">*</span>
                              </div>
                            </label>
                            <select
                              id="licenseType"
                              value={formData.driverInfo?.licenseType || ''}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  driverInfo: {
                                    ...formData.driverInfo,
                                    licenseType: e.target.value
                                  }
                                });
                              }}
                            >
                              <option value="">Selecione a categoria</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="E">E</option>
                              <option value="AB">AB</option>
                              <option value="AC">AC</option>
                              <option value="AD">AD</option>
                              <option value="AE">AE</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="licenseNumber">
                              <div className="label-with-icon">
                                <FiFileText /> <span>Número da CNH</span> <span className="required">*</span>
                              </div>
                            </label>
                            <input
                              type="text"
                              id="licenseNumber"
                              value={formData.driverInfo?.licenseNumber || ''}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  driverInfo: {
                                    ...formData.driverInfo,
                                    licenseNumber: e.target.value
                                  }
                                });
                              }}
                              placeholder="Digite o número da CNH"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="licenseIssueDate">
                              <div className="label-with-icon">
                                <FiCalendar /> <span>Data de Emissão</span>
                              </div>
                            </label>
                            <div className="date-field-container">
                              <input
                                type="date"
                                id="licenseIssueDate"
                                value={formData.driverInfo?.licenseIssueDate || ''}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    driverInfo: {
                                      ...formData.driverInfo,
                                      licenseIssueDate: e.target.value
                                    }
                                  });
                                }}
                              />
                              <FiCalendar />
                            </div>
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="licenseExpiry">
                              <div className="label-with-icon">
                                <FiClock /> <span>Data de Vencimento</span> <span className="required">*</span>
                              </div>
                            </label>
                            <div className="date-field-container">
                              <input
                                type="date"
                                id="licenseExpiry"
                                value={formData.driverInfo?.licenseExpiry || ''}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    driverInfo: {
                                      ...formData.driverInfo,
                                      licenseExpiry: e.target.value
                                    }
                                  });
                                }}
                              />
                              <FiCalendar />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="driver-info-card">
                        <div className="driver-info-title">
                          <FiAward /> Qualificações do Motorista
                        </div>
                        
                        <div className="vehicle-info-grid">
                          <div className="form-group">
                            <label htmlFor="vehicleType">
                              <div className="label-with-icon">
                                <FiTruck /> <span>Tipo de Veículo</span>
                              </div>
                            </label>
                            <select
                              id="vehicleType"
                              value={formData.driverInfo?.vehicleType || ''}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  driverInfo: {
                                    ...formData.driverInfo,
                                    vehicleType: e.target.value
                                  }
                                });
                              }}
                            >
                              <option value="">Selecione o tipo</option>
                              <option value="Carro">Carro</option>
                              <option value="Moto">Moto</option>
                              <option value="Van">Van</option>
                              <option value="Caminhão">Caminhão</option>
                              <option value="Caminhão Baú">Caminhão Baú</option>
                              <option value="Caminhão Refrigerado">Caminhão Refrigerado</option>
                              <option value="Bitrem">Bitrem</option>
                              <option value="Carreta">Carreta</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="experience">
                              <div className="label-with-icon">
                                <FiClock /> <span>Anos de Experiência</span>
                              </div>
                            </label>
                            <input
                              type="number"
                              id="experience"
                              min="0"
                              max="50"
                              value={formData.driverInfo?.experience || 0}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  driverInfo: {
                                    ...formData.driverInfo,
                                    experience: parseInt(e.target.value)
                                  }
                                });
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="medical-exam-container">
                          <div className="medical-exam-header">
                            <h4 className="driver-info-subtitle">Exame Médico</h4>
                            <div className="medical-exam-toggle">
                              <span>Possui exame médico válido:</span>
                              <label className="toggle-switch">
                                <input 
                                  type="checkbox" 
                                  checked={formData.driverInfo?.hasMedicalExam || false}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      driverInfo: {
                                        ...formData.driverInfo,
                                        hasMedicalExam: e.target.checked
                                      }
                                    });
                                  }}
                                />
                                <span className="toggle-slider"></span>
                              </label>
                            </div>
                          </div>
                          
                          {formData.driverInfo?.hasMedicalExam && (
                            <div className="form-group">
                              <label htmlFor="medicalExamExpiry">
                                <div className="label-with-icon">
                                  <FiCalendar /> <span>Validade do Exame Médico</span>
                                </div>
                              </label>
                              <div className="date-field-container">
                                <input
                                  type="date"
                                  id="medicalExamExpiry"
                                  value={formData.driverInfo?.medicalExamExpiry || ''}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      driverInfo: {
                                        ...formData.driverInfo,
                                        medicalExamExpiry: e.target.value
                                      }
                                    });
                                  }}
                                />
                                <FiCalendar />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="observations">
                          <div className="label-with-icon">
                            <FiClipboard /> <span>Observações</span>
                          </div>
                        </label>
                        <textarea
                          id="observations"
                          rows={4}
                          value={formData.driverInfo?.observations || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              driverInfo: {
                                ...formData.driverInfo,
                                observations: e.target.value
                              }
                            });
                          }}
                          placeholder="Informações adicionais sobre o motorista..."
                        ></textarea>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="user-section">
                    <h3><FiTruck /> Informações do Motorista</h3>
                    <div className="no-driver-info">
                      <div className="no-data-icon">
                        <FiInfo />
                      </div>
                      <h4>Perfil não configurado como motorista</h4>
                      <p>Esta seção está disponível apenas para usuários com o perfil "Motorista".</p>
                      <p className="no-data-tip">
                        Para configurar este usuário como motorista, altere o perfil para "Motorista" na aba Informações do Usuário.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-footer">
              <button 
                type="button"
                className="secondary-button"
                onClick={() => navigate('/users')}
              >
                <FiX /> Cancelar
              </button>
              <button 
                type="button"
                className="primary-button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <><FiSave /> Salvando...</> : <><FiSave /> Salvar</>}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserForm; 