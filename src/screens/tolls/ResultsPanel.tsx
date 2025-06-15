import React, { useState } from 'react';

interface TollData {
  key?: string;
  praca?: string;
  preco: number;
  precoComTag?: number;
  rodovia?: string;
  localizacao?: string;
  km?: number;
  concessionaria?: string;
  city?: string;
  state?: string;
}

interface ResultsPanelProps {
  results: any;
  tolls: TollData[];
  distance?: number;
  duration?: string;
  apiProvider?: string;
  isVisible: boolean;
  onToggle: () => void;
  hoveredTollId?: string | null;
  onTollHover: (tollId: string | null) => void;
}

export default function ResultsPanel({
  results,
  tolls,
  distance,
  duration,
  apiProvider,
  isVisible,
  onToggle,
  hoveredTollId,
  onTollHover
}: ResultsPanelProps) {
  const calculateTotal = () => {
    return tolls.reduce((sum, toll) => sum + toll.preco, 0);
  };

  const calculateTotalWithTag = () => {
    return tolls.reduce((sum, toll) => sum + (toll.precoComTag || toll.preco), 0);
  };

  const total = calculateTotal();
  const totalWithTag = calculateTotalWithTag();
  const tagEconomy = total - totalWithTag;

  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`results-toggle ${isVisible ? 'visible' : 'hidden'}`}
        onClick={onToggle}
        title={isVisible ? 'Ocultar resultados' : 'Mostrar resultados'}
      >
        {isVisible ? '→' : '📊'}
      </button>

      {/* Results Panel */}
      <div className={`results-panel ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="results-header">
          <h3>📊 Resultados da Rota</h3>
          <button className="close-btn" onClick={onToggle}>×</button>
        </div>

        <div className="results-content">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card total-cost">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h4>Total Pedágios</h4>
                <div className="price-info">
                  <span className="main-price">R$ {total.toFixed(2)}</span>
                  {tagEconomy > 0 && (
                    <div className="tag-info">
                      <span className="tag-price">Com TAG: R$ {totalWithTag.toFixed(2)}</span>
                      <span className="economy">Economia: R$ {tagEconomy.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {distance && (
              <div className="summary-card distance">
                <div className="card-icon">📏</div>
                <div className="card-content">
                  <h4>Distância</h4>
                  <span className="value">{distance} km</span>
                </div>
              </div>
            )}

            {duration && (
              <div className="summary-card duration">
                <div className="card-icon">⏱️</div>
                <div className="card-content">
                  <h4>Duração</h4>
                  <span className="value">{duration}</span>
                </div>
              </div>
            )}

            <div className="summary-card toll-count">
              <div className="card-icon">🛣️</div>
              <div className="card-content">
                <h4>Pedágios</h4>
                <span className="value">{tolls.length}</span>
              </div>
            </div>
          </div>

          {/* API Provider Badge */}
          {apiProvider && (
            <div className="api-badge">
              <span className="badge-label">API:</span>
              <span className={`badge ${apiProvider === 'localhost' ? 'localhost' : 'external'}`}>
                {apiProvider === 'localhost' ? '🏠 API Própria' : '🌐 CalcularPedagio.com.br'}
              </span>
            </div>
          )}

          {/* Toll List */}
          {tolls.length > 0 && (
            <div className="toll-list">
              <h4>📍 Pedágios na Rota</h4>
              <div className="toll-items">
                {tolls.map((toll, index) => (
                  <div 
                    key={toll.key || index}
                    className={`toll-item ${hoveredTollId === (toll.key || index.toString()) ? 'hovered' : ''}`}
                    onMouseEnter={() => onTollHover(toll.key || index.toString())}
                    onMouseLeave={() => onTollHover(null)}
                  >
                    <div className="toll-header">
                      <div className="toll-number">{index + 1}</div>
                      <div className="toll-info">
                        {toll.praca && <h5>{toll.praca}</h5>}
                        {toll.rodovia && <span className="highway">{toll.rodovia}</span>}
                        {toll.localizacao && <span className="location">{toll.localizacao}</span>}
                        {toll.km && <span className="km">KM {toll.km}</span>}
                      </div>
                    </div>
                    
                    <div className="toll-prices">
                      <div className="price main-price">
                        R$ {toll.preco.toFixed(2)}
                      </div>
                      {toll.precoComTag && toll.precoComTag !== toll.preco && (
                        <div className="price tag-price">
                          TAG: R$ {toll.precoComTag.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {toll.concessionaria && (
                      <div className="concessionarie">
                        <small>🏢 {toll.concessionaria}</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tolls.length === 0 && (
            <div className="no-results">
              <p>ℹ️ Nenhum pedágio encontrado para esta rota.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 