import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import Header from '../../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import {
  FaFileExcel,
  FaFilePdf,
  FaFileCode,
  FaDatabase,
  FaFileImage,
  FaFileWord,
  FaFileCsv,
  FaArrowLeft,
  FaDownload,
  FaCog,
  FaCalendarAlt,
  FaFilter,
  FaEye,
  FaCheck,
  FaTimes,
  FaStar,
  FaChartBar
} from 'react-icons/fa';
import './export-styles.css';

type ExportFormat = 'xlsx' | 'pdf' | 'json' | 'xml' | 'csv' | 'html' | 'png' | 'txt';

interface ExportOptions {
  format: ExportFormat;
  includeFields: string[];
  dateRange: {
    start: string;
    end: string;
  };
  statusFilter: string[];
  transportTypeFilter: string[];
  includeRouteDetails: boolean;
  includePricing: boolean;
  includeDriverInfo: boolean;
  groupBy: 'none' | 'status' | 'transportType' | 'date';
  sortBy: 'date' | 'status' | 'value' | 'distance';
  sortDirection: 'asc' | 'desc';
  customFileName: string;
}

const OrderExport: React.FC = () => {
  const navigate = useNavigate();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'xlsx',
    includeFields: ['id', 'status', 'transportType', 'vehicleType', 'route', 'pricing'],
    dateRange: {
      start: '',
      end: ''
    },
    statusFilter: ['pending', 'approved', 'in_progress', 'completed', 'cancelled'],
    transportTypeFilter: ['person', 'cargo', 'motoboy'],
    includeRouteDetails: true,
    includePricing: true,
    includeDriverInfo: true,
    groupBy: 'none',
    sortBy: 'date',
    sortDirection: 'desc',
    customFileName: ''
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const formatOptions = [
    {
      id: 'xlsx',
      name: 'Excel (.xlsx)',
      icon: <FaFileExcel />,
      description: 'Planilha completa com formatação avançada',
      color: '#10B981',
      features: ['Formatação rica', 'Múltiplas abas', 'Fórmulas', 'Gráficos']
    },
    {
      id: 'pdf',
      name: 'PDF (.pdf)',
      icon: <FaFilePdf />,
      description: 'Documento profissional para apresentações',
      color: '#EF4444',
      features: ['Layout profissional', 'Gráficos', 'Cabeçalho personalizado', 'Paginação']
    },
    {
      id: 'json',
      name: 'JSON (.json)',
      icon: <FaFileCode />,
      description: 'Dados estruturados para integração',
      color: '#F59E0B',
      features: ['Estrutura completa', 'Fácil integração', 'Aninhamento de dados']
    },
    {
      id: 'xml',
      name: 'XML (.xml)',
      icon: <FaDatabase />,
      description: 'Formato estruturado para sistemas legados',
      color: '#8B5CF6',
      features: ['Estrutura hierárquica', 'Validação de schema', 'Compatibilidade']
    },
    {
      id: 'csv',
      name: 'CSV (.csv)',
      icon: <FaFileCsv />,
      description: 'Formato simples e universal',
      color: '#06B6D4',
      features: ['Compatibilidade universal', 'Tamanho reduzido', 'Fácil importação']
    },
    {
      id: 'html',
      name: 'Página Web (.html)',
      icon: <FaFileWord />,
      description: 'Relatório interativo para visualização',
      color: '#84CC16',
      features: ['Visualização interativa', 'Gráficos dinâmicos', 'Filtros']
    },
    {
      id: 'png',
      name: 'Imagem (.png)',
      icon: <FaFileImage />,
      description: 'Imagem de alta qualidade do relatório',
      color: '#EC4899',
      features: ['Alta resolução', 'Preserva formatação', 'Fácil compartilhamento']
    },
    {
      id: 'txt',
      name: 'Texto (.txt)',
      icon: <FaFileCode />,
      description: 'Formato de texto simples',
      color: '#6B7280',
      features: ['Tamanho mínimo', 'Universal', 'Apenas dados essenciais']
    }
  ] as const;

  const availableFields = [
    { id: 'id', name: 'ID da Solicitação', required: true },
    { id: 'status', name: 'Status', required: true },
    { id: 'transportType', name: 'Tipo de Transporte' },
    { id: 'vehicleType', name: 'Tipo de Veículo' },
    { id: 'route', name: 'Rota (Origem → Destino)' },
    { id: 'routeDetails', name: 'Detalhes da Rota' },
    { id: 'distance', name: 'Distância Total' },
    { id: 'duration', name: 'Duração Estimada' },
    { id: 'pricing', name: 'Informações de Preço' },
    { id: 'tollsTotal', name: 'Total de Pedágios' },
    { id: 'driverInfo', name: 'Informações do Motorista' },
    { id: 'createdAt', name: 'Data de Criação' },
    { id: 'updatedAt', name: 'Última Atualização' },
    { id: 'userId', name: 'Usuário Solicitante' },
    { id: 'items', name: 'Itens/Passageiros' },
    { id: 'observations', name: 'Observações' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: '#F59E0B' },
    { value: 'approved', label: 'Aprovado', color: '#10B981' },
    { value: 'in_progress', label: 'Em Andamento', color: '#3B82F6' },
    { value: 'completed', label: 'Concluído', color: '#059669' },
    { value: 'cancelled', label: 'Cancelado', color: '#EF4444' }
  ];

  const transportTypeOptions = [
    { value: 'person', label: 'Transporte de Pessoas', icon: '👥' },
    { value: 'cargo', label: 'Transporte de Cargas', icon: '📦' },
    { value: 'motoboy', label: 'Motoboy', icon: '🏍️' }
  ];

  // Filtrar e preparar dados para exportação
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const statusMatch = exportOptions.statusFilter.length === 0 || 
        exportOptions.statusFilter.includes(order.status);
      
      const transportMatch = exportOptions.transportTypeFilter.length === 0 || 
        exportOptions.transportTypeFilter.includes(order.transportType || 'person');
      
      let dateMatch = true;
      if (exportOptions.dateRange.start && exportOptions.dateRange.end) {
        const orderDate = new Date(order.createdAt || Date.now());
        const startDate = new Date(exportOptions.dateRange.start);
        const endDate = new Date(exportOptions.dateRange.end);
        dateMatch = orderDate >= startDate && orderDate <= endDate;
      }
      
      return statusMatch && transportMatch && dateMatch;
    });
  }, [orders, exportOptions.statusFilter, exportOptions.transportTypeFilter, exportOptions.dateRange]);

  // Gerar dados de preview
  const generatePreviewData = () => {
    const preview = filteredOrders.slice(0, 5).map(order => {
      const data: any = {};
      
      exportOptions.includeFields.forEach(field => {
        switch (field) {
          case 'id':
            data['ID'] = order.id;
            break;
          case 'status':
            data['Status'] = order.status;
            break;
          case 'transportType':
            data['Tipo'] = order.transportType || 'N/A';
            break;
          case 'vehicleType':
            data['Veículo'] = order.vehicleType || 'N/A';
            break;
          case 'route':
            const origin = order.routePoints?.[0]?.name || 'N/A';
            const destination = order.routePoints?.[order.routePoints.length - 1]?.name || 'N/A';
            data['Rota'] = `${origin} → ${destination}`;
            break;
          case 'distance':
            data['Distância'] = order.routeDistance?.totalDistance ? 
              `${order.routeDistance.totalDistance.toFixed(2)} km` : 'N/A';
            break;
          case 'pricing':
            data['Valor'] = order.pricing?.finalPrice ? 
              `R$ ${order.pricing.finalPrice.toFixed(2)}` : 'N/A';
            break;
          case 'createdAt':
            data['Criado em'] = new Date(order.createdAt || Date.now()).toLocaleString('pt-BR');
            break;
        }
      });
      
      return data;
    });
    
    setPreviewData(preview);
  };

  // Função principal de exportação
  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const fileName = exportOptions.customFileName || 
        `pedidos_${new Date().toISOString().split('T')[0]}`;

      switch (exportOptions.format) {
        case 'xlsx':
          await exportToExcel(fileName);
          break;
        case 'pdf':
          await exportToPDF(fileName);
          break;
        case 'json':
          exportToJSON(fileName);
          break;
        case 'xml':
          exportToXML(fileName);
          break;
        case 'csv':
          exportToCSV(fileName);
          break;
        case 'html':
          exportToHTML(fileName);
          break;
        case 'png':
          await exportToPNG(fileName);
          break;
        case 'txt':
          exportToTXT(fileName);
          break;
        default:
          throw new Error('Formato não suportado');
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Exportação para Excel com formatação avançada
  const exportToExcel = async (fileName: string) => {
    const wb = XLSX.utils.book_new();
    
    // Aba principal com dados
    const wsData = prepareExcelData();
    const ws = XLSX.utils.json_to_sheet(wsData);
    
    // Formatação do cabeçalho
    const headerStyle = {
      fill: { fgColor: { rgb: "4F46E5" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    // Aplicar formatação ao cabeçalho
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = headerStyle;
    }
    
    // Ajustar largura das colunas
    const colsWidth = wsData.length > 0 ? Object.keys(wsData[0]).map(key => ({ wch: 20 })) : [];
    ws['!cols'] = colsWidth;
    
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
    
    // Aba de estatísticas
    if (exportOptions.includeFields.includes('pricing')) {
      const statsData = generateStatsData();
      const wsStats = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, wsStats, "Estatísticas");
    }
    
    // Salvar arquivo
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  // Preparar dados para Excel
  const prepareExcelData = () => {
    return filteredOrders.map(order => {
      const data: any = {};
      
      exportOptions.includeFields.forEach(field => {
        switch (field) {
          case 'id':
            data['ID da Solicitação'] = order.id;
            break;
          case 'status':
            data['Status'] = translateStatus(order.status);
            break;
          case 'transportType':
            data['Tipo de Transporte'] = translateTransportType(order.transportType);
            break;
          case 'vehicleType':
            data['Tipo de Veículo'] = order.vehicleType || 'N/A';
            break;
          case 'route':
            const origin = order.routePoints?.[0]?.name || 'N/A';
            const destination = order.routePoints?.[order.routePoints.length - 1]?.name || 'N/A';
            data['Origem'] = origin;
            data['Destino'] = destination;
            break;
          case 'distance':
            data['Distância (km)'] = order.routeDistance?.totalDistance?.toFixed(2) || 'N/A';
            break;
          case 'duration':
            data['Duração (min)'] = order.routeDistance?.totalDuration ? 
              Math.round(order.routeDistance.totalDuration / 60) : 'N/A';
            break;
          case 'pricing':
            data['Valor Base (R$)'] = order.pricing?.kmBasedPrice?.toFixed(2) || 'N/A';
            data['Pedágios (R$)'] = order.pricing?.tollsTotal?.toFixed(2) || '0.00';
            data['Valor Total (R$)'] = order.pricing?.finalPrice?.toFixed(2) || 'N/A';
            break;
          case 'createdAt':
            data['Data de Criação'] = new Date(order.createdAt || Date.now()).toLocaleString('pt-BR');
            break;
          case 'items':
            data['Quantidade de Itens'] = order.items?.length || 0;
            data['Detalhes dos Itens'] = order.items?.map(item => item.name).join('; ') || 'N/A';
            break;
        }
      });
      
      return data;
    });
  };

  // Gerar dados de estatísticas
  const generateStatsData = () => {
    const stats = [];
    
    // Resumo geral
    stats.push({
      'Métrica': 'Total de Pedidos',
      'Valor': filteredOrders.length,
      'Descrição': 'Número total de pedidos no período selecionado'
    });
    
    // Por status
    const statusCounts = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      stats.push({
        'Métrica': `Pedidos ${translateStatus(status)}`,
        'Valor': count,
        'Descrição': `Quantidade de pedidos com status: ${translateStatus(status)}`
      });
    });
    
    // Valor total
    const totalValue = filteredOrders.reduce((sum, order) => 
      sum + (order.pricing?.finalPrice || 0), 0);
    
    stats.push({
      'Métrica': 'Valor Total (R$)',
      'Valor': totalValue.toFixed(2),
      'Descrição': 'Soma de todos os valores dos pedidos'
    });
    
    return stats;
  };

  // Exportação para PDF
  const exportToPDF = async (fileName: string) => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
    
    // Cabeçalho
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 297, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Relatório de Pedidos', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 200, 20);
    
    // Resetar cor do texto
    doc.setTextColor(0, 0, 0);
    
    // Preparar dados para tabela
    const tableData = filteredOrders.map(order => [
      order.id,
      translateStatus(order.status),
      translateTransportType(order.transportType),
      order.routePoints?.[0]?.name || 'N/A',
      order.routePoints?.[order.routePoints.length - 1]?.name || 'N/A',
      order.pricing?.finalPrice ? `R$ ${order.pricing.finalPrice.toFixed(2)}` : 'N/A'
    ]);
    
    // Adicionar tabela
    autoTable(doc, {
      head: [['ID', 'Status', 'Tipo', 'Origem', 'Destino', 'Valor']],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Salvar
    doc.save(`${fileName}.pdf`);
  };

  // Exportação para JSON
  const exportToJSON = (fileName: string) => {
    const jsonData = {
      exportInfo: {
        generatedAt: new Date().toISOString(),
        totalRecords: filteredOrders.length,
        exportOptions: exportOptions
      },
      orders: filteredOrders.map(order => {
        const exportedOrder: any = {};
        
        exportOptions.includeFields.forEach(field => {
          switch (field) {
            case 'id':
            case 'status':
            case 'transportType':
            case 'vehicleType':
            case 'userId':
              exportedOrder[field] = order[field];
              break;
            case 'route':
              exportedOrder.route = {
                origin: order.routePoints?.[0] || null,
                destination: order.routePoints?.[order.routePoints.length - 1] || null,
                allPoints: order.routePoints || []
              };
              break;
            case 'pricing':
              exportedOrder.pricing = order.pricing || null;
              break;
            case 'items':
              exportedOrder.items = order.items || [];
              break;
            default:
              exportedOrder[field] = order[field] || null;
          }
        });
        
        return exportedOrder;
      })
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
  };

  // Exportação para XML
  const exportToXML = (fileName: string) => {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<orders>\n';
    xmlContent += `  <exportInfo>\n`;
    xmlContent += `    <generatedAt>${new Date().toISOString()}</generatedAt>\n`;
    xmlContent += `    <totalRecords>${filteredOrders.length}</totalRecords>\n`;
    xmlContent += `  </exportInfo>\n`;
    
    filteredOrders.forEach(order => {
      xmlContent += '  <order>\n';
      xmlContent += `    <id>${order.id}</id>\n`;
      xmlContent += `    <status>${order.status}</status>\n`;
      xmlContent += `    <transportType>${order.transportType || ''}</transportType>\n`;
      xmlContent += `    <vehicleType>${order.vehicleType || ''}</vehicleType>\n`;
      
      if (exportOptions.includeFields.includes('pricing') && order.pricing) {
        xmlContent += '    <pricing>\n';
        xmlContent += `      <finalPrice>${order.pricing.finalPrice || 0}</finalPrice>\n`;
        xmlContent += `      <tollsTotal>${order.pricing.tollsTotal || 0}</tollsTotal>\n`;
        xmlContent += '    </pricing>\n';
      }
      
      xmlContent += '  </order>\n';
    });
    
    xmlContent += '</orders>';
    
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    saveAs(blob, `${fileName}.xml`);
  };

  // Exportação para CSV
  const exportToCSV = (fileName: string) => {
    const csvData = prepareExcelData();
    const headers = Object.keys(csvData[0] || {});
    
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvContent += values.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  };

  // Exportação para HTML
  const exportToHTML = (fileName: string) => {
    const htmlData = prepareExcelData();
    
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Pedidos</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .stats { margin-top: 20px; padding: 20px; background: #f8f9fa; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Pedidos</h1>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      </div>
      
      <table>
        <thead>
          <tr>
    `;
    
    // Cabeçalhos
    const headers = Object.keys(htmlData[0] || {});
    headers.forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
    htmlContent += '</tr></thead><tbody>';
    
    // Dados
    htmlData.forEach(row => {
      htmlContent += '<tr>';
      headers.forEach(header => {
        htmlContent += `<td>${row[header] || ''}</td>`;
      });
      htmlContent += '</tr>';
    });
    
    htmlContent += `
        </tbody>
      </table>
      
      <div class="stats">
        <h3>Estatísticas</h3>
        <p>Total de registros: ${filteredOrders.length}</p>
        <p>Período de exportação: ${exportOptions.dateRange.start || 'Início'} até ${exportOptions.dateRange.end || 'Atual'}</p>
      </div>
    </body>
    </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    saveAs(blob, `${fileName}.html`);
  };

  // Exportação para PNG
  const exportToPNG = async (fileName: string) => {
    // Criar elemento temporário para renderizar
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '1200px';
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.innerHTML = `
      <div style="background: #4F46E5; color: white; padding: 20px; margin-bottom: 20px;">
        <h1>Relatório de Pedidos</h1>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      </div>
      <div>Total de registros: ${filteredOrders.length}</div>
    `;
    
    document.body.appendChild(tempDiv);
    
    try {
      const canvas = await html2canvas(tempDiv);
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${fileName}.png`);
        }
      });
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  // Exportação para TXT
  const exportToTXT = (fileName: string) => {
    let txtContent = `RELATÓRIO DE PEDIDOS\n`;
    txtContent += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    txtContent += `Total de registros: ${filteredOrders.length}\n\n`;
    txtContent += '='.repeat(80) + '\n\n';
    
    filteredOrders.forEach((order, index) => {
      txtContent += `PEDIDO ${index + 1}\n`;
      txtContent += `-`.repeat(20) + '\n';
      txtContent += `ID: ${order.id}\n`;
      txtContent += `Status: ${translateStatus(order.status)}\n`;
      txtContent += `Tipo: ${translateTransportType(order.transportType)}\n`;
      txtContent += `Origem: ${order.routePoints?.[0]?.name || 'N/A'}\n`;
      txtContent += `Destino: ${order.routePoints?.[order.routePoints.length - 1]?.name || 'N/A'}\n`;
      if (order.pricing?.finalPrice) {
        txtContent += `Valor: R$ ${order.pricing.finalPrice.toFixed(2)}\n`;
      }
      txtContent += '\n';
    });
    
    const blob = new Blob([txtContent], { type: 'text/plain' });
    saveAs(blob, `${fileName}.txt`);
  };

  // Funções auxiliares
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const translateTransportType = (type?: string) => {
    const typeMap: Record<string, string> = {
      person: 'Transporte de Pessoas',
      cargo: 'Transporte de Cargas',
      motoboy: 'Motoboy'
    };
    return typeMap[type || 'person'] || type || 'N/A';
  };

  const handleFieldToggle = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    if (field?.required) return; // Não permitir desmarcar campos obrigatórios
    
    setExportOptions(prev => ({
      ...prev,
      includeFields: prev.includeFields.includes(fieldId)
        ? prev.includeFields.filter(f => f !== fieldId)
        : [...prev.includeFields, fieldId]
    }));
  };

  const handleStatusFilterToggle = (status: string) => {
    setExportOptions(prev => ({
      ...prev,
      statusFilter: prev.statusFilter.includes(status)
        ? prev.statusFilter.filter(s => s !== status)
        : [...prev.statusFilter, status]
    }));
  };

  const handleTransportTypeFilterToggle = (type: string) => {
    setExportOptions(prev => ({
      ...prev,
      transportTypeFilter: prev.transportTypeFilter.includes(type)
        ? prev.transportTypeFilter.filter(t => t !== type)
        : [...prev.transportTypeFilter, type]
    }));
  };

  React.useEffect(() => {
    generatePreviewData();
  }, [exportOptions.includeFields, filteredOrders]);

  return (
    <div className="export-page">
      <Header />
      
      <div className="export-container">
        <div className="export-header">
          <button 
            className="back-button"
            onClick={() => navigate('/orders')}
          >
            <FaArrowLeft />
            Voltar
          </button>
          
          <div className="export-title">
            <h1>Exportação Avançada de Pedidos</h1>
            <p>Configure e exporte seus dados em múltiplos formatos</p>
          </div>
          
          <div className="export-stats">
            <div className="stat-item">
              <FaChartBar />
              <span>{filteredOrders.length} pedidos selecionados</span>
            </div>
          </div>
        </div>

        <div className="export-content">
          <div className="export-sidebar">
            {/* Seleção de Formato */}
            <div className="export-section">
              <h3><span className="step-number">1</span><FaDownload /> Formato</h3>
              <div className="format-grid">
                {formatOptions.map(format => (
                  <div
                    key={format.id}
                    className={`format-card ${exportOptions.format === format.id ? 'selected' : ''}`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.id as ExportFormat }))}
                    style={{ '--format-color': format.color } as React.CSSProperties}
                  >
                    <div className="format-icon" style={{ color: format.color }}>
                      {format.icon}
                    </div>
                    <div className="format-info">
                      <h4>{format.name}</h4>
                      <p>{format.description}</p>
                      <div className="format-features">
                        {format.features.slice(0, 2).map((feature, idx) => (
                          <span key={idx} className="feature-tag">{feature}</span>
                        ))}
                      </div>
                    </div>
                    {exportOptions.format === format.id && (
                      <div className="format-selected">
                        <FaCheck />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="export-main">
            {/* Filtros */}
            <div className="export-section">
              <h3><span className="step-number">2</span><FaFilter /> Filtros</h3>
              
              <div className="filters-compact">
                {/* Filtro de Data */}
                <div className="filter-group-compact">
                  <label><FaCalendarAlt /> Período</label>
                  <div className="date-range-compact">
                    <input
                      type="date"
                      value={exportOptions.dateRange.start}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                    />
                    <span>até</span>
                    <input
                      type="date"
                      value={exportOptions.dateRange.end}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                {/* Filtro de Status */}
                <div className="filter-group-compact">
                  <label>Status</label>
                  <div className="status-filters-compact">
                    {statusOptions.map(status => (
                      <label
                        key={status.value}
                        className="status-checkbox-compact"
                        style={{ '--status-color': status.color } as React.CSSProperties}
                      >
                        <input
                          type="checkbox"
                          checked={exportOptions.statusFilter.includes(status.value)}
                          onChange={() => handleStatusFilterToggle(status.value)}
                        />
                        <span className="status-tag-compact">
                          {status.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro de Tipo de Transporte - Simplificado */}
                <div className="filter-group-compact">
                  <label>Transporte</label>
                  <select
                    className="transport-select"
                    value={exportOptions.transportTypeFilter.length === 1 ? exportOptions.transportTypeFilter[0] : 'all'}
                    onChange={(e) => {
                      if (e.target.value === 'all') {
                        setExportOptions(prev => ({ ...prev, transportTypeFilter: [] }));
                      } else {
                        setExportOptions(prev => ({ ...prev, transportTypeFilter: [e.target.value] }));
                      }
                    }}
                  >
                    <option value="all">Todos os tipos</option>
                    {transportTypeOptions.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Campos a Incluir */}
            <div className="export-section">
              <h3><span className="step-number">3</span><FaCog /> Campos</h3>
              <div className="fields-grid-compact">
                {availableFields.map(field => (
                  <label
                    key={field.id}
                    className={`field-checkbox-compact ${field.required ? 'required' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={exportOptions.includeFields.includes(field.id)}
                      onChange={() => handleFieldToggle(field.id)}
                      disabled={field.required}
                    />
                    <span className="checkmark-compact">
                      {exportOptions.includeFields.includes(field.id) && <FaCheck />}
                    </span>
                    <span className="field-name-compact">
                      {field.name}
                      {field.required && <span className="required-star">*</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Opções Avançadas */}
            <div className="export-section">
              <h3><span className="step-number">4</span><FaStar /> Opções</h3>
              
              <div className="advanced-options">
                <label className="option-row">
                  <input
                    type="text"
                    placeholder="Nome personalizado do arquivo"
                    value={exportOptions.customFileName}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      customFileName: e.target.value
                    }))}
                  />
                </label>

                <label className="option-row">
                  <span>Agrupar por:</span>
                  <select
                    value={exportOptions.groupBy}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      groupBy: e.target.value as any
                    }))}
                  >
                    <option value="none">Não agrupar</option>
                    <option value="status">Status</option>
                    <option value="transportType">Tipo de Transporte</option>
                    <option value="date">Data</option>
                  </select>
                </label>

                <label className="option-row">
                  <span>Ordenar por:</span>
                  <select
                    value={exportOptions.sortBy}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      sortBy: e.target.value as any
                    }))}
                  >
                    <option value="date">Data</option>
                    <option value="status">Status</option>
                    <option value="value">Valor</option>
                    <option value="distance">Distância</option>
                  </select>
                  <select
                    value={exportOptions.sortDirection}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      sortDirection: e.target.value as any
                    }))}
                  >
                    <option value="desc">Decrescente</option>
                    <option value="asc">Crescente</option>
                  </select>
                </label>
              </div>
            </div>
            {/* Preview */}
            <div className="export-section">
              <div className="section-header">
                <h3><span className="step-number">5</span><FaEye /> Preview</h3>
                <button
                  className="toggle-preview"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Ocultar' : 'Mostrar'} Preview
                </button>
              </div>
              
              {showPreview && (
                <div className="preview-container">
                  {previewData.length > 0 ? (
                    <div className="preview-table">
                      <table>
                        <thead>
                          <tr>
                            {Object.keys(previewData[0]).map(key => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, idx) => (
                            <tr key={idx}>
                              {Object.values(row).map((value, cellIdx) => (
                                <td key={cellIdx}>{String(value)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredOrders.length > 5 && (
                        <div className="preview-more">
                          ... e mais {filteredOrders.length - 5} registros
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-preview">
                      <p>Nenhum dado encontrado com os filtros aplicados</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ação de Exportação */}
            <div className="export-action">
              <div className="export-summary">
                <h3>Resumo da Exportação</h3>
                <div className="summary-stats">
                  <div className="summary-item">
                    <span className="label">Formato:</span>
                    <span className="value">
                      {formatOptions.find(f => f.id === exportOptions.format)?.name}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Registros:</span>
                    <span className="value">{filteredOrders.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Campos:</span>
                    <span className="value">{exportOptions.includeFields.length}</span>
                  </div>
                </div>
              </div>

              <button
                className="export-button"
                onClick={handleExport}
                disabled={isExporting || filteredOrders.length === 0}
              >
                {isExporting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Exportando... {exportProgress}%
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Exportar {filteredOrders.length} Pedidos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderExport; 