# API Documentation - Sistema de Logística NOR

## Overview
This document describes the REST API endpoints for the NOR Logistics Management System.

## Authentication
All API endpoints (except public ones) require JWT authentication via cookies.

### Auth Endpoints

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "nome": "User Name",
    "email": "user@example.com",
    "role": "SOLICITANTE|GESTOR|TRANSPORTADOR|MOTORISTA",
    "solicitante": {...},
    "gestor": {...},
    "transportador": {...},
    "motorista": {...}
  },
  "message": "Login realizado com sucesso"
}
```

#### POST /api/auth/logout
Logout current user.

#### GET /api/auth/me
Get current authenticated user info.

---

## Users Management

#### GET /api/usuarios
Get all users with optional role filter.

**Query Parameters:**
- `role` (optional): Filter by role (SOLICITANTE, GESTOR, TRANSPORTADOR, MOTORISTA)

#### POST /api/usuarios
Create a new user.

**Request Body:**
```json
{
  "nome": "User Name",
  "email": "user@example.com",
  "telefone": "(11) 99999-9999",
  "senha": "password",
  "role": "SOLICITANTE",
  "clienteId": "uuid", // for SOLICITANTE
  "centroCustoId": "uuid", // for SOLICITANTE
  "gestorId": "uuid", // for SOLICITANTE
  "limiteValor": 1000, // for SOLICITANTE
  "nomeEmpresa": "Company Name", // for TRANSPORTADOR
  "cnpj": "00.000.000/0000-00", // for TRANSPORTADOR
  "transportadorId": "uuid", // for MOTORISTA
  "tipo": "PROPRIO|TERCEIRO", // for MOTORISTA
  "cnh": "12345678901", // for MOTORISTA
  "valorPorKm": 2.50 // for MOTORISTA
}
```

#### PUT /api/usuarios/[id]
Update user by ID.

#### DELETE /api/usuarios/[id]
Soft delete user (mark as inactive).

---

## Clients Management

#### GET /api/clientes
Get all active clients with their cost centers.

#### POST /api/clientes
Create a new client.

**Request Body:**
```json
{
  "nomeEmpresa": "Company Name",
  "cnpj": "00.000.000/0000-00",
  "endereco": "Company Address",
  "telefone": "(11) 3333-3333",
  "email": "company@example.com"
}
```

#### PUT /api/clientes/[id]
Update client by ID.

#### DELETE /api/clientes/[id]
Soft delete client.

---

## Cost Centers

#### GET /api/centros-custo
Get cost centers with optional client filter.

**Query Parameters:**
- `clienteId` (optional): Filter by client ID

#### POST /api/centros-custo
Create a new cost center.

**Request Body:**
```json
{
  "nome": "Cost Center Name",
  "codigo": "CC001",
  "clienteId": "uuid"
}
```

---

## Requests Management

#### GET /api/solicitacoes
Get requests with optional filters.

**Query Parameters:**
- `status`: Filter by status (PENDENTE, APROVADA, REPROVADA, EM_EXECUCAO, FINALIZADA)
- `solicitanteId`: Filter by requester ID
- `gestorId`: Filter by manager ID
- `transportadorId`: Filter by transporter ID
- `motoristaId`: Filter by driver ID

#### POST /api/solicitacoes
Create a new request.

**Request Body:**
```json
{
  "solicitanteId": "uuid",
  "clienteId": "uuid",
  "centroCustoId": "uuid",
  "gestorId": "uuid",
  "pontoColeta": "Pickup Location",
  "enderecoColeta": "Pickup Address",
  "dataColeta": "2024-02-01",
  "horaColeta": "08:00",
  "pontoEntrega": "Delivery Location",
  "enderecoEntrega": "Delivery Address",
  "dataEntrega": "2024-02-01",
  "horaEntrega": "14:00",
  "pontoRetorno": "Return Location (optional)",
  "enderecoRetorno": "Return Address (optional)",
  "dataRetorno": "2024-02-01",
  "horaRetorno": "18:00",
  "descricaoMaterial": "Material Description",
  "quantidadeVolumes": 10,
  "dimensoes": "50x40x30 cm",
  "tipoEmbalagem": "Box",
  "pesoTotal": 150.5,
  "numeroDanfe": "123456789",
  "valorDanfe": 2500.00,
  "tipoVeiculo": "VAN|CAMINHONETE|TRUCK|CARRETA|BITRUCK",
  "observacoes": "Special instructions",
  "kmTotal": 100,
  "valorPedagio": 25.00,
  "valorServico": 250.00,
  "valorTotal": 275.00
}
```

#### PUT /api/solicitacoes/[id]
Update request by ID.

#### POST /api/solicitacoes/[id]/aprovacao
Approve or reject a request.

**Request Body:**
```json
{
  "gestorId": "uuid",
  "aprovada": true,
  "observacao": "Approval comment (optional)"
}
```

#### POST /api/solicitacoes/[id]/atribuir
Assign driver and vehicle to a request.

**Request Body:**
```json
{
  "transportadorId": "uuid",
  "motoristaId": "uuid",
  "veiculoId": "uuid",
  "numeroCte": "CTE123456",
  "valorMotorista": 150.00
}
```

---

## Drivers Management

#### GET /api/motoristas
Get drivers with optional transporter filter.

**Query Parameters:**
- `transportadorId`: Filter by transporter ID
- `tipo`: Filter by type (PROPRIO, TERCEIRO)

#### POST /api/motoristas
Create a new driver.

**Request Body:**
```json
{
  "usuarioId": "uuid",
  "transportadorId": "uuid",
  "tipo": "PROPRIO|TERCEIRO",
  "cnh": "12345678901",
  "valorPorKm": 2.50
}
```

---

## Vehicles Management

#### GET /api/veiculos
Get vehicles with optional transporter filter.

**Query Parameters:**
- `transportadorId`: Filter by transporter ID

#### POST /api/veiculos
Create a new vehicle.

**Request Body:**
```json
{
  "placa": "ABC-1234",
  "modelo": "Vehicle Model",
  "tipo": "VAN|CAMINHONETE|TRUCK|CARRETA|BITRUCK",
  "capacidade": "3.5 tons",
  "transportadorId": "uuid"
}
```

---

## Extra Costs

#### GET /api/custos-extras
Get extra costs for a request.

**Query Parameters:**
- `solicitacaoId`: Request ID (required)

#### POST /api/custos-extras
Add an extra cost to a request.

**Request Body:**
```json
{
  "solicitacaoId": "uuid",
  "tipo": "ESPERA|PERNOITE|ESTACIONAMENTO|ABASTECIMENTO|OUTROS",
  "valor": 50.00,
  "observacao": "Cost description"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid authentication
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

---

## User Roles and Permissions

### SOLICITANTE (Client)
- Create requests
- View own requests
- Add extra costs to their requests

### GESTOR (Manager) 
- Approve/reject requests
- Manage users and clients
- View all requests and reports
- Full admin access

### TRANSPORTADOR (Transporter)
- View approved requests
- Assign drivers and vehicles
- Manage fleet and drivers
- Handle operations and finances

### MOTORISTA (Driver)
- View assigned requests
- Add extra costs during execution
- Update trip status