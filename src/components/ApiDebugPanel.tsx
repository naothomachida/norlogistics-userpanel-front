'use client'

import { useState } from 'react'

interface ApiDebugPanelProps {
  payload?: unknown
  response?: unknown
  error?: string
  isLoading?: boolean
  url?: string
  qualpPayload?: unknown
  qualpResponse?: unknown
  qualpUrl?: string
}

export default function ApiDebugPanel({
  payload,
  response,
  error,
  isLoading,
  url,
  qualpPayload,
  qualpResponse,
  qualpUrl
}: ApiDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'payload' | 'response' | 'url' | 'qualp-payload' | 'qualp-response' | 'qualp-url'>('payload')

  if (!payload && !response && !error && !url) {
    return null
  }

  const formatJson = (obj: unknown) => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Feedback visual opcional
    }).catch(() => {
      // Fallback silencioso
    })
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 max-w-full overflow-hidden">
      <div
        className="px-4 py-3 bg-gray-800 rounded-t-lg cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-green-400 text-sm font-mono">🔧</span>
          <h3 className="text-white font-medium">API Debug Panel</h3>
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
          )}
        </div>
        <span className="text-gray-400 text-sm">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Status Indicator */}
          <div className="mb-4 flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
              error
                ? 'bg-red-900 text-red-200'
                : response
                  ? 'bg-green-900 text-green-200'
                  : 'bg-yellow-900 text-yellow-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                error ? 'bg-red-400' : response ? 'bg-green-400' : 'bg-yellow-400'
              }`}></div>
              <span>
                {error ? 'Error' : response ? 'Success' : isLoading ? 'Loading...' : 'Ready'}
              </span>
            </div>
            {url && (
              <div className="text-xs text-gray-400">
                <span className="font-mono">{url.split('?')[0]}</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-4 border-b border-gray-700">
            {payload !== undefined && payload !== null && (
              <button
                onClick={() => setActiveTab('payload')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === 'payload'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Payload
              </button>
            )}
            {response !== undefined && response !== null && (
              <button
                onClick={() => setActiveTab('response')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === 'response'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Response
              </button>
            )}
            {url && (
              <button
                onClick={() => setActiveTab('url')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === 'url'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                URL
              </button>
            )}

            {/* QUALP API Tabs */}
            {qualpPayload !== undefined && qualpPayload !== null && (
              <button
                onClick={() => setActiveTab('qualp-payload')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === 'qualp-payload'
                    ? 'text-orange-400 border-b-2 border-orange-400 bg-gray-800'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                QUALP Payload
              </button>
            )}
            {qualpResponse !== undefined && qualpResponse !== null && (
              <button
                onClick={() => setActiveTab('qualp-response')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === 'qualp-response'
                    ? 'text-orange-400 border-b-2 border-orange-400 bg-gray-800'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                QUALP Response
              </button>
            )}
            {qualpUrl && (
              <button
                onClick={() => setActiveTab('qualp-url')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === 'qualp-url'
                    ? 'text-orange-400 border-b-2 border-orange-400 bg-gray-800'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                QUALP URL
              </button>
            )}
          </div>

          {/* Content */}
          <div className="bg-black rounded-lg p-4 max-h-96 max-w-full overflow-auto">
            {error && (
              <div className="text-red-400 font-mono text-sm mb-4 p-3 bg-red-900/20 rounded border border-red-800">
                <div className="font-bold mb-2">❌ Error:</div>
                <div className="whitespace-pre-wrap">{error}</div>
              </div>
            )}

            {activeTab === 'payload' && payload !== undefined && payload !== null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-yellow-400 text-xs font-semibold">REQUEST PAYLOAD:</span>
                  <button
                    onClick={() => copyToClipboard(formatJson(payload))}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-800 rounded"
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="text-green-400 text-xs whitespace-nowrap font-mono overflow-x-auto">
                  {formatJson(payload)}
                </pre>
              </div>
            )}

            {activeTab === 'response' && response !== undefined && response !== null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 text-xs font-semibold">API RESPONSE:</span>
                  <button
                    onClick={() => copyToClipboard(formatJson(response))}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-800 rounded"
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="text-blue-400 text-xs whitespace-nowrap font-mono overflow-x-auto">
                  {formatJson(response)}
                </pre>
              </div>
            )}

            {activeTab === 'url' && url && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-400 text-xs font-semibold">REQUEST URL:</span>
                  <button
                    onClick={() => copyToClipboard(url)}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-800 rounded"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-purple-400 text-xs">
                    <span className="text-gray-400">Method:</span> POST
                  </div>
                  <div className="text-purple-400 text-xs">
                    <span className="text-gray-400">Endpoint:</span> {url.split('?')[0]}
                  </div>
                  {url.includes('?') && (
                    <div className="text-purple-400 text-xs">
                      <div className="text-gray-400 mb-1">Query Parameters:</div>
                      <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-900 p-2 rounded">
                        {decodeURIComponent(url.split('?')[1]).replace(/&/g, '\n&')}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QUALP API Content */}
            {activeTab === 'qualp-payload' && qualpPayload !== undefined && qualpPayload !== null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-orange-400 text-xs font-semibold">QUALP API REQUEST PAYLOAD:</span>
                  <button
                    onClick={() => copyToClipboard(formatJson(qualpPayload))}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-800 rounded"
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="text-orange-400 text-xs whitespace-nowrap font-mono overflow-x-auto">
                  {formatJson(qualpPayload)}
                </pre>
              </div>
            )}

            {activeTab === 'qualp-response' && qualpResponse !== undefined && qualpResponse !== null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-orange-400 text-xs font-semibold">QUALP API RESPONSE:</span>
                  <button
                    onClick={() => copyToClipboard(formatJson(qualpResponse))}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-800 rounded"
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="text-orange-400 text-xs whitespace-nowrap font-mono overflow-x-auto">
                  {formatJson(qualpResponse)}
                </pre>
              </div>
            )}

            {activeTab === 'qualp-url' && qualpUrl && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-orange-400 text-xs font-semibold">QUALP API URL:</span>
                  <button
                    onClick={() => copyToClipboard(qualpUrl)}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-800 rounded"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-orange-400 text-xs">
                    <span className="text-gray-400">Method:</span> GET
                  </div>
                  <div className="text-orange-400 text-xs">
                    <span className="text-gray-400">Endpoint:</span> {qualpUrl.split('?')[0]}
                  </div>
                  {qualpUrl.includes('?') && (
                    <div className="text-orange-400 text-xs">
                      <div className="text-gray-400 mb-1">Query Parameters (decoded):</div>
                      <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-900 p-2 rounded">
                        {(() => {
                          try {
                            const jsonParam = qualpUrl.split('?json=')[1]
                            if (jsonParam) {
                              const decoded = decodeURIComponent(jsonParam)
                              return JSON.stringify(JSON.parse(decoded), null, 2)
                            }
                            return 'No JSON parameter found'
                          } catch {
                            return 'Invalid JSON in parameters'
                          }
                        })()}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white text-xs px-3 py-1 bg-gray-800 rounded"
            >
              Collapse
            </button>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs px-3 py-1 bg-gray-800 rounded"
              >
                🔗 Open in Browser
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}