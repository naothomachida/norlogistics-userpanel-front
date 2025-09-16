import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash para senha padrão: 123456
  const hashedPassword = await bcrypt.hash('123456', 12)

  // Criar clientes
  const cliente1 = await prisma.cliente.create({
    data: {
      nomeEmpresa: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua das Empresas, 123, São Paulo, SP',
      telefone: '(11) 3456-7890',
      email: 'contato@empresaabc.com.br'
    }
  })

  const cliente2 = await prisma.cliente.create({
    data: {
      nomeEmpresa: 'Indústria XYZ S/A',
      cnpj: '98.765.432/0001-10',
      endereco: 'Av. Industrial, 456, Rio de Janeiro, RJ',
      telefone: '(21) 2345-6789',
      email: 'vendas@industriaxyz.com.br'
    }
  })

  // Criar centros de custo
  const centroCusto1 = await prisma.centroCusto.create({
    data: {
      nome: 'Vendas',
      codigo: 'CC001',
      clienteId: cliente1.id
    }
  })

  const centroCusto2 = await prisma.centroCusto.create({
    data: {
      nome: 'Produção',
      codigo: 'CC002',
      clienteId: cliente2.id
    }
  })

  // Criar usuários
  const usuarioGestor = await prisma.usuario.create({
    data: {
      nome: 'João Silva',
      email: 'gestor@test.com',
      telefone: '(11) 99999-1111',
      senha: hashedPassword,
      role: 'GESTOR'
    }
  })

  const gestor = await prisma.gestor.create({
    data: {
      usuarioId: usuarioGestor.id
    }
  })

  const usuarioSolicitante = await prisma.usuario.create({
    data: {
      nome: 'Maria Santos',
      email: 'solicitante@test.com',
      telefone: '(11) 99999-2222',
      senha: hashedPassword,
      role: 'SOLICITANTE'
    }
  })

  const solicitante = await prisma.solicitante.create({
    data: {
      usuarioId: usuarioSolicitante.id,
      clienteId: cliente1.id,
      centroCustoId: centroCusto1.id,
      gestorId: gestor.id,
      limiteValor: 1000
    }
  })

  const usuarioTransportador = await prisma.usuario.create({
    data: {
      nome: 'Carlos Transportes',
      email: 'transportador@test.com',
      telefone: '(11) 99999-3333',
      senha: hashedPassword,
      role: 'TRANSPORTADOR'
    }
  })

  const transportador = await prisma.transportador.create({
    data: {
      usuarioId: usuarioTransportador.id,
      nomeEmpresa: 'Transportes Carlos Ltda',
      cnpj: '11.222.333/0001-44'
    }
  })

  const usuarioMotorista = await prisma.usuario.create({
    data: {
      nome: 'Pedro Motorista',
      email: 'motorista@test.com',
      telefone: '(11) 99999-4444',
      senha: hashedPassword,
      role: 'MOTORISTA'
    }
  })

  const motorista = await prisma.motorista.create({
    data: {
      usuarioId: usuarioMotorista.id,
      transportadorId: transportador.id,
      tipo: 'PROPRIO',
      cnh: '12345678901',
      valorPorKm: 2.50
    }
  })

  // Criar veículos
  const veiculo1 = await prisma.veiculo.create({
    data: {
      placa: 'ABC-1234',
      modelo: 'Mercedes Sprinter',
      tipo: 'VAN',
      capacidade: '3,5 toneladas',
      transportadorId: transportador.id
    }
  })

  const veiculo2 = await prisma.veiculo.create({
    data: {
      placa: 'DEF-5678',
      modelo: 'Volkswagen Delivery',
      tipo: 'TRUCK',
      capacidade: '8 toneladas',
      transportadorId: transportador.id
    }
  })

  // Criar algumas solicitações de exemplo
  const solicitacao1 = await prisma.solicitacao.create({
    data: {
      numeroOrdem: 'ORD000001',
      solicitanteId: solicitante.id,
      clienteId: cliente1.id,
      centroCustoId: centroCusto1.id,
      gestorId: gestor.id,
      pontoColeta: 'Depósito Central ABC',
      enderecoColeta: 'Rua do Depósito, 100, São Paulo, SP',
      dataColeta: new Date('2024-02-01'),
      horaColeta: '08:00',
      pontoEntrega: 'Loja Shopping Center',
      enderecoEntrega: 'Av. Paulista, 2000, São Paulo, SP',
      dataEntrega: new Date('2024-02-01'),
      horaEntrega: '14:00',
      descricaoMaterial: 'Caixas com produtos eletrônicos',
      quantidadeVolumes: 10,
      dimensoes: '50x40x30 cm',
      tipoEmbalagem: 'Caixa de papelão',
      pesoTotal: 150.5,
      numeroDanfe: '123456789',
      valorDanfe: 2500.00,
      tipoVeiculo: 'VAN',
      observacoes: 'Material frágil, cuidado na manipulação',
      kmTotal: 25,
      valorPedagio: 12.50,
      valorServico: 62.50,
      valorTotal: 75.00,
      status: 'PENDENTE'
    }
  })

  const solicitacao2 = await prisma.solicitacao.create({
    data: {
      numeroOrdem: 'ORD000002',
      solicitanteId: solicitante.id,
      clienteId: cliente1.id,
      centroCustoId: centroCusto1.id,
      gestorId: gestor.id,
      pontoColeta: 'Fábrica Principal',
      enderecoColeta: 'Rod. Presidente Dutra, Km 150, Guarulhos, SP',
      dataColeta: new Date('2024-02-02'),
      horaColeta: '09:00',
      pontoEntrega: 'Centro de Distribuição Rio',
      enderecoEntrega: 'Av. Brasil, 5000, Rio de Janeiro, RJ',
      dataEntrega: new Date('2024-02-03'),
      horaEntrega: '10:00',
      descricaoMaterial: 'Equipamentos industriais',
      quantidadeVolumes: 5,
      dimensoes: '120x80x60 cm',
      tipoEmbalagem: 'Engradado de madeira',
      pesoTotal: 500.0,
      tipoVeiculo: 'TRUCK',
      observacoes: 'Equipamentos pesados, necessário guincho',
      kmTotal: 450,
      valorPedagio: 85.00,
      valorServico: 1125.00,
      valorTotal: 1210.00,
      status: 'APROVADA',
      transportadorId: transportador.id
    }
  })

  // Criar aprovação para a primeira solicitação
  const aprovacao = await prisma.aprovacao.create({
    data: {
      solicitacaoId: solicitacao2.id,
      gestorId: gestor.id,
      aprovada: true,
      observacao: 'Solicitação aprovada conforme política da empresa'
    }
  })

  console.log('Seed executado com sucesso!')
  console.log('Usuários criados:')
  console.log('- Gestor: gestor@test.com (senha: 123456)')
  console.log('- Solicitante: solicitante@test.com (senha: 123456)')
  console.log('- Transportador: transportador@test.com (senha: 123456)')
  console.log('- Motorista: motorista@test.com (senha: 123456)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })