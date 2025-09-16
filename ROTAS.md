# Sistema de Cálculo de Rotas

Este documento explica como usar o sistema de cálculo de rotas integrado com a API Qualp.

## Funcionalidades Implementadas

### 1. Calculadora de Rotas (`/calcular-rotas`)
- **Funcionalidade**: Calcula 3 opções de rota com base na API Qualp
- **Características**:
  - Comparação entre rota mais barata, mais rápida e mais eficiente
  - Cálculo detalhado de custos (combustível, manutenção, motorista, pedágios)
  - Integração com dados históricos para ajustes automáticos
  - Suporte a pontos de parada (waypoints)
  - Diferentes tipos de veículos

### 2. Registro de Viagens (`/registrar-viagem`)
- **Funcionalidade**: Registra dados reais de viagens realizadas
- **Características**:
  - Registro de km percorridos e custos reais
  - Consumo de combustível e tempo real
  - Identificação de problemas encontrados na rota
  - Histórico para melhoria de futuras estimativas

### 3. Integração com Portal do Transportador
- Links diretos no dashboard de operações
- Acesso rápido às funcionalidades de rota

## Como Configurar

### 1. Chave da API Qualp

1. Acesse [docs.qualp.com.br](https://docs.qualp.com.br)
2. Crie uma conta e obtenha sua chave de API
3. Atualize o arquivo `.env`:
```bash
QUALP_API_KEY="sua_chave_real_aqui"
```

### 2. Reinicie a Aplicação
```bash
npm run dev
```

## Como Usar

### Calculando Rotas

1. Acesse o portal do transportador (`/operacoes`)
2. Clique em "Calcular Rotas"
3. Preencha:
   - Origem e destino (obrigatórios)
   - Pontos de parada (opcional)
   - Tipo de veículo
   - Preço do combustível atual
   - Margem de lucro desejada

4. O sistema retornará 3 opções:
   - **Mais Econômica**: Menor custo total
   - **Mais Rápida**: Menor tempo de viagem
   - **Mais Eficiente**: Melhor relação custo/tempo

### Registrando Viagens Realizadas

1. Após completar uma viagem, acesse "Registrar Viagem"
2. Preencha os dados reais:
   - Origem e destino da viagem
   - Quilometragem real percorrida
   - Custo total real da viagem
   - Combustível consumido
   - Tempo total gasto
   - Veículo utilizado
   - Problemas encontrados (opcional)

3. Os dados serão usados para:
   - Melhorar estimativas futuras
   - Identificar rotas problemáticas
   - Calcular custos mais precisos

## Estrutura de Custos

O sistema calcula os seguintes componentes:

### Custos Diretos
- **Combustível**: Baseado no consumo do veículo e preço por litro
- **Manutenção**: Custo por km baseado no tipo de veículo
- **Motorista**: Valor por hora trabalhada
- **Pedágios**: Custos de pedágio na rota (via API Qualp)
- **Operacional**: Custos fixos (seguro, documentação, etc.)

### Margem de Lucro
- Percentual configurável sobre o custo total
- Padrão: 20%

## Tipos de Veículos Suportados

| Tipo | Consumo (km/l) | Custo Manutenção (R$/km) | Valor Motorista (R$/h) |
|------|----------------|--------------------------|------------------------|
| Van | 15 | 0.20 | 20 |
| Caminhão Pequeno | 12 | 0.25 | 25 |
| Caminhão Médio | 8 | 0.35 | 30 |
| Caminhão Grande | 5 | 0.50 | 35 |

## API Endpoints

### POST /api/routes/calculate
Calcula rotas e custos.

**Parâmetros**:
```json
{
  "origin": "São Paulo, SP",
  "destination": "Rio de Janeiro, RJ", 
  "waypoints": ["Campinas, SP"],
  "vehicleType": "caminhao_medio",
  "fuelPrice": 5.5,
  "profitMargin": 20,
  "useHistoricalData": true
}
```

### POST /api/routes/register
Registra dados de viagem realizada.

**Parâmetros**:
```json
{
  "origin": "São Paulo, SP",
  "destination": "Rio de Janeiro, RJ",
  "distance": 450.5,
  "actualCost": 1250.75,
  "fuelConsumed": 75.5,
  "duration": 360,
  "vehicleId": "vehicle_id",
  "issues": ["Trânsito intenso"]
}
```

### GET /api/routes/register
Consulta histórico de viagens.

**Parâmetros opcionais**:
- `origin`: Filtrar por origem
- `destination`: Filtrar por destino  
- `vehicleId`: Filtrar por veículo
- `export=all`: Exportar todos os dados

## Fallback e Tratamento de Erros

O sistema inclui mecanismos de fallback:

1. **API Qualp indisponível**: Usa estimativas baseadas em distância aproximada
2. **Erro de geocodificação**: Tenta usar coordenadas aproximadas
3. **Dados históricos insuficientes**: Usa valores padrão do sistema

## Melhorias Futuras

- [ ] Integração com mapas visuais
- [ ] Alertas de rotas com problemas recorrentes
- [ ] Relatórios de performance por motorista/veículo
- [ ] Integração com sistema de combustível em tempo real
- [ ] API para aplicativos móveis

## Solução de Problemas

### Erro "QUALP_API_KEY é obrigatória"
- Verifique se a variável está definida no arquivo `.env`
- Reinicie a aplicação após adicionar a chave

### Rotas retornando apenas estimativas básicas
- Verifique se a chave da API Qualp é válida
- Confirme conectividade com a internet
- Verifique logs do console para erros específicos

### Dados históricos não aparecem
- Certifique-se de que viagens foram registradas
- Verifique se origem/destino estão escritos exatamente igual

## Suporte

Para problemas relacionados à API Qualp, consulte:
- [Documentação Qualp](https://docs.qualp.com.br)
- Suporte técnico da Qualp

Para problemas com o sistema:
- Verifique os logs do navegador (F12)
- Consulte os logs do servidor