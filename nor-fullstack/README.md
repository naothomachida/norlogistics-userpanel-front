# Sistema de Logística NOR

Sistema completo de gerenciamento logístico desenvolvido com Next.js, Redux Toolkit e Prisma.

## 🚀 Tecnologias

- **Next.js 15** - Framework React para produção
- **TypeScript** - Tipagem estática
- **Redux Toolkit** - Gerenciamento de estado
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Tailwind CSS** - Framework CSS

## 📋 Funcionalidades

### 4 Perfis de Usuário

1. **Solicitante (Cliente)** - Criar pedidos de coleta
2. **Gestor (Aprovador)** - Aprovar/reprovar solicitações
3. **Transportador (Operador Logístico)** - Gerenciar frota e finanças
4. **Motorista** - Executar viagens e registrar custos

### 5 Módulos Principais

#### 1. Módulo Solicitação de Coleta (Portal do Cliente)
- Formulário em 4 etapas
- Informações do solicitante, coleta/entrega, material e cálculos
- Geração automática de ordem de coleta

#### 2. Módulo Gestão e Aprovação (Portal do Gestor)
- Cadastro de usuários e limites
- Painel de aprovação
- Relatórios detalhados

#### 3. Módulo Operações e Financeiro (Portal do Transportador)
- Atribuição de motoristas e veículos
- Controle de custos extras
- Fluxo de caixa completo
- Manutenção de veículos

#### 4. Aplicativo do Motorista (App Móvel)
- Visualização de rotas
- Registro de custos adicionais
- Relatórios de viagens

#### 5. Aplicativo do Gestor (App Móvel)
- Aprovação rápida
- Relatórios gráficos

## 🗄️ Banco de Dados

O sistema utiliza um schema completo com as seguintes entidades principais:

- **Usuários** - Controle de acesso
- **Clientes** - Empresas solicitantes
- **Solicitações** - Ordens de coleta
- **Veículos** - Frota de transporte
- **Viagens** - Execução das rotas
- **Módulo Financeiro** - Contas a pagar/receber

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

1. Navegue até a pasta do projeto:
```bash
cd nor-fullstack
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
```bash
npx prisma db push
npx prisma generate
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse http://localhost:3000

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
```

## 📁 Estrutura do Projeto

```
src/
├── app/                 # Páginas Next.js 13+
│   ├── api/            # API Routes
│   ├── dashboard/      # Dashboard do gestor
│   ├── operacoes/      # Portal transportador
│   └── motorista/      # App do motorista
├── components/         # Componentes React
│   ├── ui/            # Componentes de UI
│   └── forms/         # Formulários
├── store/             # Redux Toolkit
│   └── slices/        # Slices do estado
├── lib/               # Utilitários
└── prisma/            # Schema do banco
```

## 🔐 Autenticação

O sistema implementa controle de acesso baseado em roles:
- SOLICITANTE
- GESTOR  
- TRANSPORTADOR
- MOTORISTA

## 💾 Banco de Dados

Utiliza SQLite para desenvolvimento e pode ser facilmente migrado para PostgreSQL/MySQL em produção.

### Principais Relacionamentos:
- Usuário → Role específico (1:1)
- Cliente → Solicitantes (1:N)
- Solicitação → Aprovação (1:1)
- Motorista → Viagens (1:N)
- Veículo → Manutenções (1:N)

## 🚧 Próximos Passos

1. Implementar autenticação JWT
2. Criar APIs REST completas
3. Desenvolver interfaces para cada módulo
4. Implementar notificações por email
5. Adicionar mapas e cálculo de rotas
6. Implementar relatórios gráficos
7. Desenvolver app mobile para motoristas

## 📝 Licença

Este projeto está sob licença MIT.
