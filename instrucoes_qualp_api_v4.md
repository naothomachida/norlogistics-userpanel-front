------ exemplo

axios.post(https://api.qualp.com.br/rotas/v4, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Token': 'Seu Access-Token'
            },
            params: {json: JSON.stringify(data)}
        })

------ Parâmetros da consulta

{
  "locations": [
    "Sorocaba",
    "Itu"
  ],
  "config": {
    "route": {
      "optimized_route": false,
      "optimized_route_destination": "last",
      "calculate_return": true,
      "alternative_routes": "0",
      "avoid_locations": true,
      "avoid_locations_key": "",
      "type_route": "efficient"
    },
    "vehicle": {
      "type": "truck",
      "axis": "all",
      "top_speed": null
    },
    "tolls": {
      "retroactive_date": ""
    },
    "freight_table": {
      "category": "all",
      "freight_load": "all",
      "axis": "all"
    },
    "fuel_consumption": {
      "fuel_price": "",
      "km_fuel": ""
    },
    "private_places": {
      "max_distance_from_location_to_route": "1000",
      "categories": true,
      "areas": true,
      "contacts": true,
      "products": true,
      "services": true
    }
  },
  "show": {
    "tolls": true,
    "freight_table": true,
    "maneuvers": "full",
    "truck_scales": true,
    "static_image": true,
    "link_to_qualp": true,
    "private_places": false,
    "polyline": true,
    "simplified_polyline": false,
    "ufs": true,
    "fuel_consumption": true,
    "link_to_qualp_report": true,
    "segments_information": true
  },
  "format": "json",
  "exception_key": ""
}


------ Resultado da consulta

{
  "distancia": {
    "texto": "71 km",
    "valor": 71
  },
  "distancia_nao_pavimentada": {
    "texto": "0 km",
    "valor": 0,
    "percentual_texto": "0%",
    "percentual_valor": 0
  },
  "informacao_trechos": [
    {
      "nome": "sorocaba",
      "trecho": {
        "origem": "sorocaba",
        "destino": "itu"
      },
      "coordenadas": {
        "origem": {
          "lat": -23.5058,
          "lng": -47.45597
        },
        "destino": {
          "lat": -23.27946,
          "lng": -47.30856
        }
      },
      "eixos": "all",
      "distancia": 36.624,
      "pracas": []
    },
    {
      "nome": "itu",
      "trecho": {
        "origem": "itu",
        "destino": "sorocaba"
      },
      "coordenadas": {
        "origem": {
          "lat": -23.27946,
          "lng": -47.30856
        },
        "destino": {
          "lat": -23.5058,
          "lng": -47.45597
        }
      },
      "eixos": "all",
      "distancia": 34.777,
      "pracas": [
        {
          "indice": 0,
          "id_praca": "2208",
          "concessionaria": "CCR SOROCABANA",
          "nome": "Sorocaba",
          "eixos": "all"
        }
      ]
    }
  ],
  "duracao": {
    "texto": "00:50:43",
    "valor": 3044
  },
  "endereco_inicio": "sorocaba",
  "endereco_fim": "sorocaba",
  "coordenada_inicio": "-23.5058,-47.45597",
  "coordenada_fim": "-23.5058,-47.45597",
  "rotograma": [
    {
      "instrucao": "Conduza para norte na Rua Doutor Nogueira Martins.",
      "p_index": 0,
      "ruas": [
        "Rua Doutor Nogueira Martins"
      ],
      "tipo": 1,
      "tempo_segundos": 3.561,
      "distancia_km": 0.048,
      "instrucao_verbal_pre_transicao": "Conduza para norte na Rua Doutor Nogueira Martins. Depois Entre na rotunda e saia na saída 2º em direção à Rua Santa Clara.",
      "instrucao_verbal_pos_transicao": "Continue durante 50 metros.",
      "verbal_multi_cue": true,
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 0
    },
    {
      "instrucao": "Entre na rotunda e saia na saída 2º em direção à Rua Santa Clara.",
      "p_index": 2,
      "tipo": 26,
      "tempo_segundos": 5.342,
      "distancia_km": 0.023,
      "instrucao_verbal_alerta_transicao": "Entre na rotunda e saia na saída 2º em direção à Rua Santa Clara.",
      "instrucao_verbal_pre_transicao": "Entre na rotunda e saia na saída 2º em direção à Rua Santa Clara.",
      "contagem_saida_rotatoria": 2,
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 0.048
    },
    {
      "instrucao": "Saia da rotunda em direção à Rua Santa Clara.",
      "p_index": 15,
      "ruas": [
        "Rua Santa Clara"
      ],
      "tipo": 27,
      "tempo_segundos": 8.142,
      "distancia_km": 0.109,
      "instrucao_verbal_pre_transicao": "Saia da rotunda em direção à Rua Santa Clara. Depois Vire à esquerda em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
      "instrucao_verbal_pos_transicao": "Continue durante 100 metros.",
      "verbal_multi_cue": true,
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 0.071
    },
    {
      "instrucao": "Vire à esquerda em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
      "p_index": 21,
      "ruas": [
        "Avenida Presidente Juscelino Kubitschek de Oliveira"
      ],
      "tipo": 15,
      "tempo_segundos": 22.583,
      "distancia_km": 0.368,
      "instrucao_verbal_alerta_transicao": "Vire à esquerda em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
      "instrucao_verbal_pre_transicao": "Vire à esquerda em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
      "instrucao_verbal_pos_transicao": "Continue durante 400 metros.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 0.18
    },
    {
      "instrucao": "Vire à direita em direção à SPA-103/079/BR-478/Praça Dom Tadeu Strunk.",
      "p_index": 39,
      "ruas": [
        "SPA-103/079",
        "BR-478",
        "Praça Dom Tadeu Strunk"
      ],
      "tipo": 9,
      "tempo_segundos": 1.455,
      "distancia_km": 0.022,
      "instrucao_verbal_alerta_transicao": "Vire à direita em direção à SPA-103/079.",
      "instrucao_verbal_pre_transicao": "Vire à direita em direção à SPA-103/079, BR-478. Depois Saia em direção Villa Assis.",
      "instrucao_verbal_pos_transicao": "Continue durante 20 metros.",
      "verbal_multi_cue": true,
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 0.548
    },
    {
      "instrucao": "Saia em direção a Villa Assis.",
      "p_index": 40,
      "ruas": [
        "Praça Dom Tadeu Strunk"
      ],
      "tipo": 21,
      "tempo_segundos": 4.546,
      "distancia_km": 0.09,
      "instrucao_verbal_alerta_transicao": "Saia em direção Villa Assis.",
      "instrucao_verbal_pre_transicao": "Saia em direção Villa Assis. Depois Vire à esquerda em direção à SPA-103/079.",
      "sinal": {
        "exit_toward_elements": [
          {
            "text": "Villa Assis"
          }
        ]
      },
      "verbal_multi_cue": true,
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 0.57
    },
    {
      "instrucao": "Vire à esquerda em direção à SPA-103/079/BR-478/Praça Dom Tadeu Strunk. Continue na SPA-103/079.",
      "p_index": 48,
      "ruas": [
        "SPA-103/079"
      ],
      "tipo": 15,
      "tempo_segundos": 197.561,
      "distancia_km": 3.647,
      "instrucao_verbal_alerta_transicao": "Vire à esquerda em direção à SPA-103/079.",
      "instrucao_verbal_pre_transicao": "Vire à esquerda em direção à SPA-103/079, BR-478.",
      "instrucao_verbal_pos_transicao": "Continue na SPA-103/079 durante 4 quilómetros.",
      "inicio_ruas": [
        "SPA-103/079",
        "BR-478",
        "Praça Dom Tadeu Strunk"
      ],
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 0.66
    },
    {
      "instrucao": "Entre na rampa em direção a Itu/Campinas/São Paulo/São Roque.",
      "p_index": 128,
      "ruas": [
        "SP-075"
      ],
      "tipo": 19,
      "tempo_segundos": 957.863,
      "distancia_km": 8.68,
      "instrucao_verbal_alerta_transicao": "Entre na rampa em direção a Itu.",
      "instrucao_verbal_pre_transicao": "Entre na rampa em direção a Itu, Campinas.",
      "instrucao_verbal_pos_transicao": "Continue durante 29 quilómetros.",
      "sinal": {
        "exit_toward_elements": [
          {
            "text": "Itu"
          },
          {
            "text": "Campinas"
          },
          {
            "text": "São Paulo"
          },
          {
            "text": "São Roque"
          }
        ]
      },
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 4.307
    },
    {
      "instrucao": "Balança PPV 2 - Sorocaba - Bidirecional no KM 8.",
      "p_index": 182,
      "balanca": true,
      "distancia_km": 19.882,
      "distancia_percorrida_km": 12.987
    },
    {
      "instrucao": "Saia na saída à direita.",
      "p_index": 359,
      "tipo": 20,
      "tempo_segundos": 9.934,
      "distancia_km": 0.245,
      "instrucao_verbal_alerta_transicao": "Saia na saída à direita.",
      "instrucao_verbal_pre_transicao": "Saia na saída à direita. Depois Vire à direita.",
      "verbal_multi_cue": true,
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 32.869
    },
    {
      "instrucao": "Vire à direita.",
      "p_index": 363,
      "tipo": 9,
      "tempo_segundos": 25.746,
      "distancia_km": 0.425,
      "instrucao_verbal_alerta_transicao": "Vire à direita.",
      "instrucao_verbal_pre_transicao": "Vire à direita.",
      "instrucao_verbal_pos_transicao": "Continue durante 400 metros.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 33.114
    },
    {
      "instrucao": "Vire à direita em direção à Rua Parque do Varvito.",
      "p_index": 392,
      "ruas": [
        "Rua Parque do Varvito"
      ],
      "tipo": 9,
      "tempo_segundos": 82.083,
      "distancia_km": 1.269,
      "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Rua Parque do Varvito.",
      "instrucao_verbal_pre_transicao": "Vire à direita em direção à Rua Parque do Varvito.",
      "instrucao_verbal_pos_transicao": "Continue durante 1.5 quilómetros.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 33.539
    },
    {
      "instrucao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
      "p_index": 438,
      "ruas": [
        "Avenida Caetano Ruggieri"
      ],
      "tipo": 10,
      "tempo_segundos": 126.607,
      "distancia_km": 1.644,
      "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
      "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
      "instrucao_verbal_pos_transicao": "Continue durante 1.5 quilómetros.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 34.808
    },
    {
      "instrucao": "Vire à direita em direção à Rua Alexandre Andreazza.",
      "p_index": 456,
      "ruas": [
        "Rua Alexandre Andreazza"
      ],
      "tipo": 10,
      "tempo_segundos": 25.115,
      "distancia_km": 0.199,
      "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Rua Alexandre Andreazza.",
      "instrucao_verbal_pre_transicao": "Vire à direita em direção à Rua Alexandre Andreazza.",
      "instrucao_verbal_pos_transicao": "Continue durante 200 metros.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 36.452
    },
    {
      "instrucao": "Faça uma inversão de marcha à direita para se manter na Rua Alexandre Andreazza.",
      "p_index": 461,
      "ruas": [
        "Rua Alexandre Andreazza"
      ],
      "tipo": 12,
      "tempo_segundos": 23.955,
      "distancia_km": 0.199,
      "instrucao_verbal_alerta_transicao": "Faça uma inversão de marcha à direita para se manter na Rua Alexandre Andreazza.",
      "instrucao_verbal_pre_transicao": "Faça uma inversão de marcha à direita para se manter na Rua Alexandre Andreazza.",
      "instrucao_verbal_pos_transicao": "Continue durante 200 metros.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 36.651
    },
    {
      "instrucao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
      "p_index": 466,
      "ruas": [
        "Avenida Caetano Ruggieri"
      ],
      "tipo": 10,
      "tempo_segundos": 62.75,
      "distancia_km": 0.754,
      "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
      "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
      "instrucao_verbal_pos_transicao": "Continue durante 800 metros.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 36.85
    },
    {
      "instrucao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
      "p_index": 482,
      "tipo": 26,
      "tempo_segundos": 4.253,
      "distancia_km": 0.025,
      "instrucao_verbal_alerta_transicao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
      "instrucao_verbal_pre_transicao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
      "contagem_saida_rotatoria": 2,
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 37.604
    },
    {
      "instrucao": "Saia da rotunda em direção à Avenida Caetano Ruggieri.",
      "p_index": 486,
      "ruas": [
        "Avenida Caetano Ruggieri"
      ],
      "tipo": 27,
      "tempo_segundos": 31.555,
      "distancia_km": 0.429,
      "instrucao_verbal_pre_transicao": "Saia da rotunda em direção à Avenida Caetano Ruggieri.",
      "instrucao_verbal_pos_transicao": "Continue durante 400 metros.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 37.629
    },
    {
      "instrucao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
      "p_index": 497,
      "tipo": 26,
      "tempo_segundos": 5.576,
      "distancia_km": 0.042,
      "instrucao_verbal_alerta_transicao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
      "instrucao_verbal_pre_transicao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
      "contagem_saida_rotatoria": 2,
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 38.058
    },
    {
      "instrucao": "Saia da rotunda em direção à Avenida Caetano Ruggieri.",
      "p_index": 503,
      "ruas": [
        "Avenida Caetano Ruggieri"
      ],
      "tipo": 27,
      "tempo_segundos": 56.634,
      "distancia_km": 0.959,
      "instrucao_verbal_pre_transicao": "Saia da rotunda em direção à Avenida Caetano Ruggieri.",
      "instrucao_verbal_pos_transicao": "Continue durante 1 quilómetro.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 38.1
    },
    {
      "instrucao": "Vire à direita em direção à Avenida Tiradentes/SP-079. Continue na SP-079.",
      "p_index": 531,
      "ruas": [
        "SP-079"
      ],
      "tipo": 10,
      "tempo_segundos": 477.009,
      "distancia_km": 10.541,
      "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Tiradentes.",
      "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Tiradentes, SP-079.",
      "instrucao_verbal_pos_transicao": "Continue na SP-079 durante 11 quilómetros.",
      "inicio_ruas": [
        "Avenida Tiradentes",
        "SP-079"
      ],
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 39.059
    },
    {
      "instrucao": "Entre na rampa SP-075 à direita.",
      "p_index": 691,
      "ruas": [
        "SP-075"
      ],
      "tipo": 18,
      "tempo_segundos": 882.454,
      "distancia_km": 4.681,
      "instrucao_verbal_alerta_transicao": "Entre na rampa SP-075 à direita.",
      "instrucao_verbal_pre_transicao": "Entre na rampa SP-075 à direita.",
      "instrucao_verbal_pos_transicao": "Continue durante 21 quilómetros.",
      "sinal": {
        "exit_branch_elements": [
          {
            "text": "SP-075"
          }
        ]
      },
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 49.6
    },
    {
      "instrucao": "Pedágio Sorocaba no KM 13.",
      "p_index": 746,
      "pedagio": true,
      "distancia_km": 3.855,
      "distancia_percorrida_km": 54.281
    },
    {
      "instrucao": "Balança PPV 2 - Sorocaba - Bidirecional no KM 8.",
      "p_index": 767,
      "balanca": true,
      "distancia_km": 12.862,
      "distancia_percorrida_km": 58.136
    },
    {
      "instrucao": "Vire à direita em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
      "p_index": 954,
      "ruas": [
        "Avenida Presidente Juscelino Kubitschek de Oliveira"
      ],
      "tipo": 9,
      "tempo_segundos": 22.32,
      "distancia_km": 0.364,
      "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
      "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
      "instrucao_verbal_pos_transicao": "Continue durante 400 metros.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus",
      "distancia_percorrida_km": 70.998
    },
    {
      "instrucao": "Vire à direita em direção à Avenida Comendador Pereira Inácio.",
      "p_index": 965,
      "ruas": [
        "Avenida Comendador Pereira Inácio"
      ],
      "tipo": 10,
      "tempo_segundos": 6.833,
      "distancia_km": 0.058,
      "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Comendador Pereira Inácio.",
      "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Comendador Pereira Inácio. Depois, em 60 metros, Chegará a sorocaba.",
      "instrucao_verbal_pos_transicao": "Continue durante 60 metros.",
      "verbal_multi_cue": true,
      "modo_viagem": "drive",
      "tipo_viagem": "bus"
    },
    {
      "instrucao": "Chegou a sorocaba.",
      "p_index": 969,
      "tipo": 4,
      "instrucao_verbal_alerta_transicao": "Chegará a sorocaba.",
      "instrucao_verbal_pre_transicao": "Chegou a sorocaba.",
      "modo_viagem": "drive",
      "tipo_viagem": "bus"
    }
  ],
  "rota_imagem": "https://link.qualp.com.br/3/mlUjkt",
  "pedagios": [
    {
      "id_api": "2208",
      "codigo_antt": "35350750125000102",
      "codigo_integracao_sem_parar": 21,
      "codigo_integracao_sem_parar_praca": 882,
      "sentido_integracao_sem_parar": "S",
      "direcao_integracao_sem_parar": "D",
      "codigo_conectcar": 10121542,
      "sentido_conectcar": "S",
      "codigo_integracao_veloe": 154,
      "codigo_integracao_veloe_concessionaria": 1012,
      "sentido_integracao_veloe": "S",
      "codigo_integracao_movemais": 35350750125000104,
      "codigo_integracao_movemais_praca": 0,
      "sentido_integracao_movemais": "S",
      "codigo_integracao_dclogg": 498,
      "sentido_integracao_dclogg": "S",
      "concessionaria": "CCR SOROCABANA",
      "concessionaria_contato": "1197394814 / 08002527280",
      "nome": "Sorocaba",
      "uf": "SP",
      "municipio": "Sorocaba",
      "codigo_ibge": "3552205",
      "rodovia": "SP-075",
      "km": "13.325",
      "tarifa": {
        "2": 14.2,
        "3": 21.3,
        "4": 28.4,
        "5": 35.5,
        "6": 42.6,
        "7": 49.7,
        "8": 56.8,
        "9": 63.9,
        "10": 71,
        "11": 78.1,
        "12": 85.2,
        "13": 92.3,
        "14": 99.4,
        "15": 106.5
      },
      "special_toll": false,
      "porcentagem_fim_semana": 0,
      "porcentagem_tag": -5,
      "porcentagem_tag_arredondamento": "baixo",
      "is_ferry": 0,
      "is_free_flow": 0,
      "p_index": 746
    }
  ],
  "tabela_frete": {
    "dados": {
      "A": {
        "2": {
          "granel_solido": 691.24,
          "granel_liquido": 702.51,
          "frigorificada": 796.14,
          "conteineirizada": 0,
          "geral": 680.33,
          "neogranel": 656.77,
          "perigosa_granel_solido": 882.08,
          "perigosa_granel_liquido": 906.04,
          "perigosa_frigorificada": 939.27,
          "perigosa_conteineirizada": 0,
          "perigosa_geral": 796.22,
          "granel_pressurizada": 0
        },
        "3": {
          "granel_solido": 854.47,
          "granel_liquido": 871.55,
          "frigorificada": 971.98,
          "conteineirizada": 880.51,
          "geral": 841.57,
          "neogranel": 841.32,
          "perigosa_granel_solido": 1045.3,
          "perigosa_granel_liquido": 1075.08,
          "perigosa_frigorificada": 1115.1,
          "perigosa_conteineirizada": 996.4,
          "perigosa_geral": 957.47,
          "granel_pressurizada": 0
        },
        "4": {
          "granel_solido": 947.45,
          "granel_liquido": 1005.14,
          "frigorificada": 1115.79,
          "conteineirizada": 924.63,
          "geral": 939.82,
          "neogranel": 944.05,
          "perigosa_granel_solido": 1150.04,
          "perigosa_granel_liquido": 1218.21,
          "perigosa_frigorificada": 1272.06,
          "perigosa_conteineirizada": 1052.28,
          "perigosa_geral": 1067.47,
          "granel_pressurizada": 0
        },
        "5": {
          "granel_solido": 1045.96,
          "granel_liquido": 1080.82,
          "frigorificada": 1220.88,
          "conteineirizada": 1020.95,
          "geral": 1039.43,
          "neogranel": 1036.26,
          "perigosa_granel_solido": 1248.56,
          "perigosa_granel_liquido": 1293.9,
          "perigosa_frigorificada": 1377.15,
          "perigosa_conteineirizada": 1148.6,
          "perigosa_geral": 1167.08,
          "granel_pressurizada": 1143.75
        },
        "6": {
          "granel_solido": 1144.53,
          "granel_liquido": 1176.02,
          "frigorificada": 1318.1,
          "conteineirizada": 1117.26,
          "geral": 1140.82,
          "neogranel": 1138.35,
          "perigosa_granel_solido": 1347.12,
          "perigosa_granel_liquido": 1389.1,
          "perigosa_frigorificada": 1474.37,
          "perigosa_conteineirizada": 1244.91,
          "perigosa_geral": 1268.48,
          "granel_pressurizada": 1264.29
        },
        "7": {
          "granel_solido": 1276.21,
          "granel_liquido": 1314.3,
          "frigorificada": 1560.38,
          "conteineirizada": 1290.01,
          "geral": 1274.65,
          "neogranel": 1288.78,
          "perigosa_granel_solido": 1488.8,
          "perigosa_granel_liquido": 1537.38,
          "perigosa_frigorificada": 1729.64,
          "perigosa_conteineirizada": 1427.67,
          "perigosa_geral": 1412.3,
          "granel_pressurizada": 0
        },
        "8": {
          "granel_solido": 1276.21,
          "granel_liquido": 1314.3,
          "frigorificada": 1560.38,
          "conteineirizada": 1290.01,
          "geral": 1274.65,
          "neogranel": 1288.78,
          "perigosa_granel_solido": 1488.8,
          "perigosa_granel_liquido": 1537.38,
          "perigosa_frigorificada": 1729.64,
          "perigosa_conteineirizada": 1427.67,
          "perigosa_geral": 1412.3,
          "granel_pressurizada": 0
        },
        "9": {
          "granel_solido": 1396.85,
          "granel_liquido": 1438.43,
          "frigorificada": 1698.05,
          "conteineirizada": 1379.6,
          "geral": 1405.84,
          "neogranel": 1403.36,
          "perigosa_granel_solido": 1619.99,
          "perigosa_granel_liquido": 1672.04,
          "perigosa_frigorificada": 1881.03,
          "perigosa_conteineirizada": 1527.79,
          "perigosa_geral": 1554.03,
          "granel_pressurizada": 1555.83
        }
      },
      "B": {
        "2": {
          "granel_solido": 0,
          "granel_liquido": 0,
          "frigorificada": 0,
          "conteineirizada": 0,
          "geral": 0,
          "neogranel": 0,
          "perigosa_granel_solido": 0,
          "perigosa_granel_liquido": 0,
          "perigosa_frigorificada": 0,
          "perigosa_conteineirizada": 0,
          "perigosa_geral": 0,
          "granel_pressurizada": 0
        },
        "3": {
          "granel_solido": 0,
          "granel_liquido": 0,
          "frigorificada": 0,
          "conteineirizada": 0,
          "geral": 0,
          "neogranel": 0,
          "perigosa_granel_solido": 0,
          "perigosa_granel_liquido": 0,
          "perigosa_frigorificada": 0,
          "perigosa_conteineirizada": 0,
          "perigosa_geral": 0,
          "granel_pressurizada": 0
        },
        "4": {
          "granel_solido": 854.14,
          "granel_liquido": 858.58,
          "frigorificada": 958.3,
          "conteineirizada": 854.14,
          "geral": 854.14,
          "neogranel": 854.14,
          "perigosa_granel_solido": 1056.73,
          "perigosa_granel_liquido": 1071.65,
          "perigosa_frigorificada": 1114.58,
          "perigosa_conteineirizada": 981.79,
          "perigosa_geral": 981.79,
          "granel_pressurizada": 0
        },
        "5": {
          "granel_solido": 937.96,
          "granel_liquido": 942.4,
          "frigorificada": 1048.48,
          "conteineirizada": 937.96,
          "geral": 937.96,
          "neogranel": 937.96,
          "perigosa_granel_solido": 1140.56,
          "perigosa_granel_liquido": 1155.48,
          "perigosa_frigorificada": 1204.76,
          "perigosa_conteineirizada": 1065.61,
          "perigosa_geral": 1065.61,
          "granel_pressurizada": 937.96
        },
        "6": {
          "granel_solido": 1027.95,
          "granel_liquido": 1032.38,
          "frigorificada": 1145.7,
          "conteineirizada": 1027.95,
          "geral": 1027.95,
          "neogranel": 1027.95,
          "perigosa_granel_solido": 1230.54,
          "perigosa_granel_liquido": 1245.46,
          "perigosa_frigorificada": 1301.97,
          "perigosa_conteineirizada": 1155.6,
          "perigosa_geral": 1155.6,
          "granel_pressurizada": 1027.95
        },
        "7": {
          "granel_solido": 1134.07,
          "granel_liquido": 1138.52,
          "frigorificada": 1261.83,
          "conteineirizada": 1134.07,
          "geral": 1134.07,
          "neogranel": 1134.07,
          "perigosa_granel_solido": 1346.67,
          "perigosa_granel_liquido": 1361.6,
          "perigosa_frigorificada": 1431.11,
          "perigosa_conteineirizada": 1271.73,
          "perigosa_geral": 1271.73,
          "granel_pressurizada": 0
        },
        "8": {
          "granel_solido": 1134.07,
          "granel_liquido": 1138.52,
          "frigorificada": 1261.83,
          "conteineirizada": 1134.07,
          "geral": 1134.07,
          "neogranel": 1134.07,
          "perigosa_granel_solido": 1346.67,
          "perigosa_granel_liquido": 1361.6,
          "perigosa_frigorificada": 1431.11,
          "perigosa_conteineirizada": 1271.73,
          "perigosa_geral": 1271.73,
          "granel_pressurizada": 0
        },
        "9": {
          "granel_solido": 1199.74,
          "granel_liquido": 1204.18,
          "frigorificada": 1346.87,
          "conteineirizada": 1199.74,
          "geral": 1199.74,
          "neogranel": 1199.74,
          "perigosa_granel_solido": 1422.87,
          "perigosa_granel_liquido": 1437.79,
          "perigosa_frigorificada": 1529.84,
          "perigosa_conteineirizada": 1347.92,
          "perigosa_geral": 1347.92,
          "granel_pressurizada": 1199.74
        }
      },
      "C": {
        "2": {
          "granel_solido": 383.13,
          "granel_liquido": 387.56,
          "frigorificada": 455.03,
          "conteineirizada": 0,
          "geral": 380.45,
          "neogranel": 356.89,
          "perigosa_granel_solido": 465.47,
          "perigosa_granel_liquido": 471.34,
          "perigosa_frigorificada": 531.45,
          "perigosa_conteineirizada": 0,
          "perigosa_geral": 433.46,
          "granel_pressurizada": 0
        },
        "3": {
          "granel_solido": 457.87,
          "granel_liquido": 463.73,
          "frigorificada": 539.56,
          "conteineirizada": 464.24,
          "geral": 454.7,
          "neogranel": 454.64,
          "perigosa_granel_solido": 540.21,
          "perigosa_granel_liquido": 547.51,
          "perigosa_frigorificada": 615.96,
          "perigosa_conteineirizada": 517.25,
          "perigosa_geral": 507.71,
          "granel_pressurizada": 0
        },
        "4": {
          "granel_solido": 524.78,
          "granel_liquido": 542.28,
          "frigorificada": 629.11,
          "conteineirizada": 519.18,
          "geral": 522.91,
          "neogranel": 523.95,
          "perigosa_granel_solido": 616.1,
          "perigosa_granel_liquido": 632.81,
          "perigosa_frigorificada": 715.04,
          "perigosa_conteineirizada": 581.17,
          "perigosa_geral": 584.89,
          "granel_pressurizada": 0
        },
        "5": {
          "granel_solido": 575.63,
          "granel_liquido": 587.52,
          "frigorificada": 686.37,
          "conteineirizada": 569.49,
          "geral": 574.02,
          "neogranel": 573.25,
          "perigosa_granel_solido": 666.95,
          "perigosa_granel_liquido": 678.06,
          "perigosa_frigorificada": 772.3,
          "perigosa_conteineirizada": 631.49,
          "perigosa_geral": 636.01,
          "granel_pressurizada": 599.59
        },
        "6": {
          "granel_solido": 628.74,
          "granel_liquido": 639.8,
          "frigorificada": 744.6,
          "conteineirizada": 622.04,
          "geral": 627.82,
          "neogranel": 627.22,
          "perigosa_granel_solido": 720.05,
          "perigosa_granel_liquido": 730.34,
          "perigosa_frigorificada": 830.53,
          "perigosa_conteineirizada": 684.04,
          "perigosa_geral": 689.81,
          "granel_pressurizada": 658.09
        },
        "7": {
          "granel_solido": 690.39,
          "granel_liquido": 703.08,
          "frigorificada": 838.28,
          "conteineirizada": 693.77,
          "geral": 690.01,
          "neogranel": 693.48,
          "perigosa_granel_solido": 789.07,
          "perigosa_granel_liquido": 800.98,
          "perigosa_frigorificada": 933.77,
          "perigosa_conteineirizada": 763.12,
          "perigosa_geral": 759.35,
          "granel_pressurizada": 0
        },
        "8": {
          "granel_solido": 690.39,
          "granel_liquido": 703.08,
          "frigorificada": 838.28,
          "conteineirizada": 693.77,
          "geral": 690.01,
          "neogranel": 693.48,
          "perigosa_granel_solido": 789.07,
          "perigosa_granel_liquido": 800.98,
          "perigosa_frigorificada": 933.77,
          "perigosa_conteineirizada": 763.12,
          "perigosa_geral": 759.35,
          "granel_pressurizada": 0
        },
        "9": {
          "granel_solido": 776.64,
          "granel_liquido": 790.18,
          "frigorificada": 940.52,
          "conteineirizada": 772.41,
          "geral": 778.84,
          "neogranel": 778.23,
          "perigosa_granel_solido": 883.05,
          "perigosa_granel_liquido": 895.82,
          "perigosa_frigorificada": 1046.1,
          "perigosa_conteineirizada": 849.5,
          "perigosa_geral": 855.94,
          "granel_pressurizada": 815.6
        }
      },
      "D": {
        "2": {
          "granel_solido": 0,
          "granel_liquido": 0,
          "frigorificada": 0,
          "conteineirizada": 0,
          "geral": 0,
          "neogranel": 0,
          "perigosa_granel_solido": 0,
          "perigosa_granel_liquido": 0,
          "perigosa_frigorificada": 0,
          "perigosa_conteineirizada": 0,
          "perigosa_geral": 0,
          "granel_pressurizada": 0
        },
        "3": {
          "granel_solido": 0,
          "granel_liquido": 0,
          "frigorificada": 0,
          "conteineirizada": 0,
          "geral": 0,
          "neogranel": 0,
          "perigosa_granel_solido": 0,
          "perigosa_granel_liquido": 0,
          "perigosa_frigorificada": 0,
          "perigosa_conteineirizada": 0,
          "perigosa_geral": 0,
          "granel_pressurizada": 0
        },
        "4": {
          "granel_solido": 482.25,
          "granel_liquido": 486.69,
          "frigorificada": 570.85,
          "conteineirizada": 482.25,
          "geral": 482.25,
          "neogranel": 482.25,
          "perigosa_granel_solido": 573.56,
          "perigosa_granel_liquido": 577.23,
          "perigosa_frigorificada": 656.79,
          "perigosa_conteineirizada": 544.24,
          "perigosa_geral": 544.24,
          "granel_pressurizada": 0
        },
        "5": {
          "granel_solido": 523.11,
          "granel_liquido": 527.55,
          "frigorificada": 618.06,
          "conteineirizada": 523.11,
          "geral": 523.11,
          "neogranel": 523.11,
          "perigosa_granel_solido": 614.42,
          "perigosa_granel_liquido": 618.08,
          "perigosa_frigorificada": 704.01,
          "perigosa_conteineirizada": 585.09,
          "perigosa_geral": 585.09,
          "granel_pressurizada": 523.11
        },
        "6": {
          "granel_solido": 574.11,
          "granel_liquido": 578.55,
          "frigorificada": 676.3,
          "conteineirizada": 574.11,
          "geral": 574.11,
          "neogranel": 574.11,
          "perigosa_granel_solido": 665.43,
          "perigosa_granel_liquido": 669.09,
          "perigosa_frigorificada": 762.24,
          "perigosa_conteineirizada": 636.1,
          "perigosa_geral": 636.1,
          "granel_pressurizada": 574.11
        },
        "7": {
          "granel_solido": 621.15,
          "granel_liquido": 625.59,
          "frigorificada": 730.69,
          "conteineirizada": 621.15,
          "geral": 621.15,
          "neogranel": 621.15,
          "perigosa_granel_solido": 719.81,
          "perigosa_granel_liquido": 723.47,
          "perigosa_frigorificada": 826.18,
          "perigosa_conteineirizada": 690.48,
          "perigosa_geral": 690.48,
          "granel_pressurizada": 0
        },
        "8": {
          "granel_solido": 621.15,
          "granel_liquido": 625.59,
          "frigorificada": 730.69,
          "conteineirizada": 621.15,
          "geral": 621.15,
          "neogranel": 621.15,
          "perigosa_granel_solido": 719.81,
          "perigosa_granel_liquido": 723.47,
          "perigosa_frigorificada": 826.18,
          "perigosa_conteineirizada": 690.48,
          "perigosa_geral": 690.48,
          "granel_pressurizada": 0
        },
        "9": {
          "granel_solido": 681.13,
          "granel_liquido": 685.58,
          "frigorificada": 807.25,
          "conteineirizada": 681.13,
          "geral": 681.13,
          "neogranel": 681.13,
          "perigosa_granel_solido": 787.55,
          "perigosa_granel_liquido": 791.21,
          "perigosa_frigorificada": 912.83,
          "perigosa_conteineirizada": 758.22,
          "perigosa_geral": 758.22,
          "granel_pressurizada": 681.13
        }
      }
    },
    "antt_resolucao": {
      "nome": "RESOLUÇÃO ANTT Nº 6.067",
      "data": "17/07/2025",
      "data_final": null,
      "url": "https://anttlegis.antt.gov.br/action/ActionDatalegis.php?acao=abrirTextoAto&link=S&tipo=RES&numeroAto=00006067&seqAto=000&valorAno=2025&orgao=DG/ANTT/MT&cod_modulo=161&cod_menu=7796"
    }
  },
  "balancas": [
    {
      "id": 81,
      "lat": -23.434721738171362,
      "lng": -47.37260967493058,
      "nome": "PPV 2 - Sorocaba - Bidirecional",
      "rodovia": "SP-075",
      "uf": "SP",
      "uf_ibge": 35,
      "km": "8.500",
      "sentido": "Bidirecional",
      "concessionaria": "VIAOESTE",
      "concessionaria_id": 539,
      "logo": "<img class='img-thumbnail' src='common/images/concessionarias/539.jpg' style='width:100px; max-height:72px; min-height:45px'>",
      "p_index": 182
    },
    {
      "id": 81,
      "lat": -23.434721738171362,
      "lng": -47.37260967493058,
      "nome": "PPV 2 - Sorocaba - Bidirecional",
      "rodovia": "SP-075",
      "uf": "SP",
      "uf_ibge": 35,
      "km": "8.500",
      "sentido": "Bidirecional",
      "concessionaria": "VIAOESTE",
      "concessionaria_id": 539,
      "logo": "<img class='img-thumbnail' src='common/images/concessionarias/539.jpg' style='width:100px; max-height:72px; min-height:45px'>",
      "p_index": 767
    }
  ],
  "polilinha_codificada": "xvtyk@vjnoyAyIhBiNzCc@?a@J[TS\\Gf@@d@L`@PT@D^P`@Hb@C\\QpQgGdR{BlEg@\\ClF{@jFu@hBaGRkEpCwf@bAgGrA{EjRqp@bF_RdFaUFa`@DcBLs@R{@b@cA|@mAf@g@z@m@zAaA`Bw@hKv@zKT~CKhCmAnBwFPmDg@iDYcA{BkFaHs@gMcCsAQ_Ek@_TcCsRmBuRqA{QJ{KbAc\\bDq~AbTqz@rMiEp@_Gt@uFLsLa@aU{HcQ}GwS}B}[@__@A}a@J{^e@ySmBkQyFeX}L_Q}J{GyDyIwFcS_OuWcK}D_BgBa@aK{BsQkFgJkFuHiG_GoEcJaNeK_RsVqa@ic@ul@kJoRsr@kuAguAawCwTc_@yT__@iC{E[s@}BeGgGsQ}Oqa@uFoNkBsEa@_AmDqHan@wrAmIuOuJ}NcImJkRcUcQoKsSqJ}TmI}UkI{PcF_YaE{VkCmYaAuSZmZdBsb@bFqi@hG{x@bKG@aWzD}@LuKdB_Ep@mhA|M}MpDwh@jIwFv@gE~@sB|As@dAuAdCcBfZaDzb@aAjRWxE]nGa@|C[vAo@dA{AlBwAtAaBv@kA\\uBd@kBJiCQuBUoBq@mBoAyB{BgcBaoDmgB}yDsHgPsfDakHc_AwqBoh@ehA{`AiwBspAeoCiJaSiPc^ad@saA}~A_gDgs@gvAclAy_C_t@ytA{|@ccBwwCoeF{aCsyDi~FgkJ_n@}aAquFe~IciB_wCwLiRgjEy|Gu}@y{AgfAgcBiu@skAiyEiyHmlCugEyvIifNiqDw{FcwAw|B_x@mpAklB{uCmUma@gXae@sgAqcBq_@sl@qf@iv@oUoa@odAgcBsD}FubAw~Ake@us@{a@{k@md@}j@ib@uh@aa@qb@ak@gj@uM{Ko{@}s@y[gZyPcM_d@o[io@ac@qlA}q@mWcNeWiMmZgNiYcM}UaK_]yMahCe_AoeA__@__Bql@iTeHwRoHiu@qWeLuEcgBao@q{Aui@a^oMgiBwp@geHaeCkvBou@oMyEyJ_D_QkGmcAqa@qlAyXcz@uRqaAgOws@sIuc@aEqX{Bev@kDqyB}FstD}McaAeDobCiJk[yA{lAsCopAcEoEKuq@iBojDqLmQy@{y@aCe|AsEg[mAc\\sAcf@eBwzBiH_j@eBii@aCuOa@o~B}G}p@}CefAiEadByDe}BiGwlD_Lkk@qBcQo@ctAgF{nCcJ}q@kAcm@mBylFwPcr@mBiP]ecA`A}~@pDeYfBwPdAi\\`DcQfCkSfCqd@bEo^vGyYjFwc@rI}f@xJqa@zGgh@lJam@fLad@zHoh@vJeb@zHgd@jIq}@tO{e@fJsq@rMcu@bNwq@pLap@fLmZrF}KdBqt@nNw_@jGyc@`Iyc@fIqn@~KaP|Cc_@`G{MtCmWnEoQnDiPpCgWpFqg@hJabAlR{~A`Yme@pIyh@jJgd@vHsh@fKgu@hMgk@`JuUpCgn@vFaY`Ce^~Bma@pBu`@nA}V^mW`@sXBwZa@mSA}RSg]yBgZwBqZcBcTcBgg@yDgb@cFmq@eI}c@oF}h@sGkdC{Zg~@mLup@}IaK_AmnAaQgkBeUs{AiRwqAcPakAoO{PqB{IqAsZ}D{m@gIsmHk~@m~A{RacA{S{r@iMsD}A_EeCuAuAcA_CqAgC_D_IgCiGqCiEmBmA}Ba@_EUuDT_H|@cUnFkL~@}MO{KeB_FsAgFeB}EkCaNgJqK{H{AcAeDiBoDiA{Ca@{CG}CFkEv@gFfAkCr@iFpBwEpAeE`@{Ce@_S_DsDcAgEmBcE_D{CsDqBeDgCiGuWefAuA}IiEgc@gBoO_BcKaCyMeEqO{Xq}@oUuu@qNic@s@yEq@gGUqFKyCg@{EeAoE_BqCcBkBcC_CqBmAmGiD_EkD_CmCcBqCo`@q|@{BcHi@oAmAgC_GyR}M_e@wIoUaEwKeFwNcDaIgBqF|EkI~fAidA~|@uz@zcAwaAldAkbApcAoaAbaAy~@jQkOpN}LdZyQtMyErr@sIrj@cIhSsC~_A}Jb~@mGrGs@tPmBzMdPzI~LvIfOfRna@hHfPiHgPgRoa@wIgO{I_M{MePxl@wEpVwAlZmBrVcAhK_@|HDd^DpIExj@QfLEjxAm@di@_@jPg@xMe@tFEhHd@x@lAvA^pCElBs@`EmCjD}AlGeBlm@uIrU{DnHwAb\\aHvJiCzGgBt`Ay^jL{ClCZxBIjBm@xAoAdA_CJaCzBkC|DgC~d@{OvZ}Jjl@eRtIwB~WsDjQcBzWm@pf@k@n\\PxY|A~a@vC|Jr@jHT^ErEU`GsAtFwE|FkIlAqDh@cKYyGoJqgAkDk`@MyBPuB`@yB~BuAhHiDrq@bBvRr@pi@xAhH^tS~CxLtC|NhG~PzJzWdX`X|YxLrKvT~PpNpGjIbCtD`A`Fr@~D^lF`@bIIbK[vv@qCfEKxbBuErZUbb@`ArShAza@nCtY`E`n@tKja@pIjSlA~U^fRKvV@`[Jjd@TbRJpNkAj[kF`a@yBxNg@`Z_Fn[wFv\\mJb[_LhbBmp@~YiKtcBwo@hQqGpA]vGiBhNcDfp@gMdPeC~R{Ed]cD`Hq@zd@cDdr@_Czx@c@|k@dDx_@hFrTvFxD`An_@fO~U`JxeAtYd|@hVbRjFt`@~NnGjCzvAdk@niCdcAviBxs@vRtIzS~DbYvC`qBzQloHlq@nuAlM`|CdVjb@fD|HzAhKdCxGVfh@tE`DTxIk@~JNfnDtYhlFla@xKbC`H|ArO`Ffu@bRbZfEzT|@|N{AfOeBl_@_IxUaI~DaChRuV|KgQ`]m]`TkQfOuMfR}IrNsDtKmA|MfAjPbDdf@jOf[zJ`Z`P~VjQxc@jb@bWjVvOfJn]~OzWnMrg@rUxb@rSpdBty@xeBtz@fN`KrJ`LlNdUnI|Pb`AttB|y@liBnBtFxLh^pBzNdAjLQ|R}@bY_Lxw@{E|[q@hSF|SbAxOnBzTrCpV|Dfa@n@|CxBpHtA|E`H`RrDtH~^xj@tbAjsA`ArAz]li@pYz_@zZhe@~a@ri@`FxGlIrQr@bEQbDs@|DiB|BoBjAeC|@aCJcDm@_u@ic@eAo@sBgDs@iENmDt@qBdAaDxCeBzBCpFM`IS|Za@bl@`CjjCjJrlBrEtx@zDrW~Ah`@`Fnx@hKvaApQlcA|Ujw@zUdbAl^jUzLtQnG`L~DntBdt@h`A|[tiDdoAv`DdhA|a@xOhwAxg@bzBzw@zt@~W|]~LprApe@~xD|tAd]rLrg@bRhQbHv`@|P|d@tU|n@t]zf@rW~e@d\\z|@ls@lCrBrCvBhj@d]t|@bs@zs@jv@dp@ju@jg@lm@v`@jh@|Znc@lvBfhDlqBxcD~[~g@`iA`iBzm@tcAdRp[plArgB`gAxdBvkArkBzpAjrB|iBxwC~fF`jIzlB~{ChKnPhpDf|F|z@lsAxhC~dEr[~f@dlBdxCz`A`}AraDtfFruHpyLtv@vmAthBztCvcElxG|yCt|E~aDj|FtXvh@hkBfoDly@baB`R~^bO|YdaApuBv@bBbl@`oAdMbX~AhDfgAf_CzCtG`mAxkCl~@hnB|Pn^zIzRjIpQbG~Mbl@~pAhsAtuCdObZjVdf@rEbJzhBr_Efm@xtAjo@jsApCvE|AjClBjCvBtBnCjBtB`AbCh@pBTxFP~ESjD}@rD}A|CaC|BqCbBoD~@iCj@mD^cGXsFBa@RoEd@eInBy[tAqP^aCj@oBf@oAzBiE|@_BjAsAtBoBv@m@bAq@dDeBpCiArEqAtL}C|EiAt@Q|@WnBu@nHcAzEk@lHcAdWsD|[cE`BSnBUrB_@hB[rLeBjZiD`|@_MhDs@jGgA`s@aHnKi@jSiApb@Vr]vAbCf@dKpBjI|AzXxHfBr@h\\~MdO`GlN~HtP|PrLhNnSlZlHdOfPb]`DbIdO|ZfBhD`EtHlMxZxC`JjJp_@f@~Ap@hB`GvM~F|IhShUzKjRfGnNhXhi@jWpi@vP|]vDbIbDbH`H~NxBxEpB`E~JfTdGrMh@bAxe@zbA`t@fpArHjLxLdLpVvL|KzDxNxDrCt@rQxEbIxBlIhJrEhN~FlGdFxDtElBfZpE~MpE|TtHzJdDfJpBvKxAlNt@xTMbd@iDr^q@~V?xMpAdHxC|SjIlJfGlH|BbK`@jCi@`AQ~A]lG_Bl]oGxJmAlNaCzrAaQpC_@zj@mItPcAlJbB~ItDlLfLt@n@vCfDp@b[HlYiAbNoJ`]aBzFyPjn@yAzGw@xIyAx[G`CYpFeItAmBZwB\\kMnC",
  "ufs": [
    "SP"
  ],
  "link_site_qualp": "https://qualp.com.br?data=2Bt2zFzf2ZVxSrd0r4J2BagH6ClYusLGEsK1FUJXGKTSfEBHg0F7V-qQmTgrcVVIbjxf2kEvpNLNk9qh7yKyQHEj1d7Cs2GpULutjXpvSV-Mp65QdO374rLXxs7jj2n7KC-dxxpbOywfpI_M_FUqTEOj3UXluocbNOEb-mEVpjzVNoZ57PuS1wm-u7Uih6RQs6BlN1-CA6K7N17PSzU4LvHPbXd8JWrsPgM7O3Pb25KueBSAwOhhKmVQhw2DPTmU-bmbbjW5GG53xxrLHT42PQzW0K54mQIhLIxETP_BUXaokdglWU9R1bSFPMVsgl59_eP81WyeLiSAUHAEIRNsKd_1kqTLyedHUHNnSpmsefenpzxTX2Ict0N_IWkTJ_YaZCTpO6an3f_4tv2lRNMJ4xGb5MB3Jm6Lvy2kG6ONgZrUQOr25v-5NO5TaNEdfhtez35Lgj9cjWK8mdc9HTk6XhTjlQcW2lnZRG7kXw0T3SLA-wH_w_V-Zg&type_route=efficient",
  "link_site_qualp_report": "https://qualp.com.br/relatorio-rota.php?data=1TEfIfcD-V5nVMU_aLx1pECpSc6HGwD4cmVuLpzcrPHOtu01VbT-jGMuJVXRKZCn9yWVxnM_ELcO7pcKPlhEdiHxzU-W2thF-oGIuhLstmmLUiuFhTo6Opr4rxGS5hZFCWd5Aw3W070FUFQ99rRGIdjujuf-xYzPzvgQEIPpnqKiBnatqm9oriiVVx4060tKQOiaTYn8rG9gwxQIo0tAYGM_Q6EzfJvyMTMCSUFu4LweNeSwWqINyNcxk3FnzNNRyi0GXoAjl-e5PmKsnY8U_DndQMQYkZ57c9SQ95dj7W2IHCJgwVbTy5X8fZ9Io7elrSonoUO3-b8C2-X09TctyL0jHWDq_E3BbWV5Ng0wuCnPAnicUXsa8Oj2KzFOJs76v9iZdbU8jNaYj_25vc_iC8kd6UAUzohhPuue-sy-KWH5mrYM90ezo7n-Mrp1qz0_4WlDTvQCdTy3EWs",
  "locais": [
    "Sorocaba",
    "Itu"
  ],
  "id_transacao": 148332956,
  "roteador_selecionado": "qualp",
  "calcular_volta": true,
  "otimizar_rota": false,
  "consumo_combustivel": 0,
  "meta_data": ""
}

------ esses dados aqui abaixo peguei do chrome na aba network do Devtools

Request URL
https://api.qualp.com.br/rotas/v4?json=%7B%22locations%22:[%22Sorocaba%22,%22Itu%22],%22config%22:%7B%22route%22:%7B%22optimized_route%22:false,%22optimized_route_destination%22:%22last%22,%22calculate_return%22:true,%22alternative_routes%22:%220%22,%22avoid_locations%22:true,%22avoid_locations_key%22:%22%22,%22type_route%22:%22efficient%22%7D,%22vehicle%22:%7B%22type%22:%22truck%22,%22axis%22:%22all%22,%22top_speed%22:null%7D,%22tolls%22:%7B%22retroactive_date%22:%22%22%7D,%22freight_table%22:%7B%22category%22:%22all%22,%22freight_load%22:%22all%22,%22axis%22:%22all%22%7D,%22fuel_consumption%22:%7B%22fuel_price%22:%22%22,%22km_fuel%22:%22%22%7D,%22private_places%22:%7B%22max_distance_from_location_to_route%22:%221000%22,%22categories%22:true,%22areas%22:true,%22contacts%22:true,%22products%22:true,%22services%22:true%7D%7D,%22show%22:%7B%22tolls%22:true,%22freight_table%22:true,%22maneuvers%22:%22full%22,%22truck_scales%22:true,%22static_image%22:true,%22link_to_qualp%22:true,%22private_places%22:false,%22polyline%22:true,%22simplified_polyline%22:false,%22ufs%22:true,%22fuel_consumption%22:true,%22link_to_qualp_report%22:true,%22segments_information%22:true%7D,%22format%22:%22json%22,%22exception_key%22:%22%22%7D
Request Method
GET
Status Code
200 OK
Remote Address
[2606:4700::6812:12ee]:443
Referrer Policy
strict-origin-when-cross-origin

authority
api.qualp.com.br
:method
GET
:path
/rotas/v4?json=%7B%22locations%22:[%22Sorocaba%22,%22Itu%22],%22config%22:%7B%22route%22:%7B%22optimized_route%22:false,%22optimized_route_destination%22:%22last%22,%22calculate_return%22:true,%22alternative_routes%22:%220%22,%22avoid_locations%22:true,%22avoid_locations_key%22:%22%22,%22type_route%22:%22efficient%22%7D,%22vehicle%22:%7B%22type%22:%22truck%22,%22axis%22:%22all%22,%22top_speed%22:null%7D,%22tolls%22:%7B%22retroactive_date%22:%22%22%7D,%22freight_table%22:%7B%22category%22:%22all%22,%22freight_load%22:%22all%22,%22axis%22:%22all%22%7D,%22fuel_consumption%22:%7B%22fuel_price%22:%22%22,%22km_fuel%22:%22%22%7D,%22private_places%22:%7B%22max_distance_from_location_to_route%22:%221000%22,%22categories%22:true,%22areas%22:true,%22contacts%22:true,%22products%22:true,%22services%22:true%7D%7D,%22show%22:%7B%22tolls%22:true,%22freight_table%22:true,%22maneuvers%22:%22full%22,%22truck_scales%22:true,%22static_image%22:true,%22link_to_qualp%22:true,%22private_places%22:false,%22polyline%22:true,%22simplified_polyline%22:false,%22ufs%22:true,%22fuel_consumption%22:true,%22link_to_qualp_report%22:true,%22segments_information%22:true%7D,%22format%22:%22json%22,%22exception_key%22:%22%22%7D
:scheme
https
accept
application/json
accept-encoding
gzip, deflate, br, zstd
accept-language
pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7
access-token
l8ljcFWzn53Sas8qWfvn0OoEn7Rou2Ti
cookie
AMP_MKTG_d12eb0c294=JTdCJTdE; _ga=GA1.1.517319145.1758036801; _ga_YQL7503TRL=GS2.1.s1758036800$o1$g1$t1758040834$j41$l0$h0; XSRF-TOKEN=eyJpdiI6IjVSSjMzWU90dmY3Z1pGMUtlbXBZYkE9PSIsInZhbHVlIjoidUVEU1IvbTdGYzJpd0VaaFpoYnhXQlRFbVdFOGZMRk1pMTdkTHNOZmRuSzBSZDdHWUhBZ2NBR2RlbXpHbVFsQ1dJZ0VmNnRacW43QWN3YUtmbTJibHpvY0NKN00yQ2M2MXlXOVY5NVh3OHBpZ3ZkUzdERDk1Y0pobG9RSmJrTS8iLCJtYWMiOiJjYjIyOWZmNDllOTBmMGFkNDQxOTRkMDgzZDZkZGUyOWU4M2E3OGM3MWI1NjcwOTE3YjE4M2FmZjcxMTg4MmMyIiwidGFnIjoiIn0%3D; api_production_session=eyJpdiI6Im5xdk1NUXNwaWYzVFpqMlVRTlRUeXc9PSIsInZhbHVlIjoiN2VXYll5eHY0RmFjZFFwTmtrcTNQc2tvTkFhbm0vei9NMUdZY2VxSFRrL3NKL21qak9oNTY5N0RTVHJvS3YzNnBjRndJWnFkNmhFMnBjQ3dTMXpETE5lVm01clk0SGRXeUNtYWFvdGIxeWJYbW5peWI2encyNjMwWWUxaVZkUGkiLCJtYWMiOiIwZmE4MDJmZTljNTMwZTM4Y2M4NDkwYzY5MWRiNjgxMWMyZTdiNTAwZmMwMjI5ODg1YWI2YmI1YzY5ODNiYWZiIiwidGFnIjoiIn0%3D; AMP_d12eb0c294=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjI0ODI1MjU1Ny1kNzI4LTQ2M2QtYTMyNi04MGI2ZmVlNGNhM2IlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzU4MDM2ODAwODAwJTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc1ODAzNjgwMDgwNCUyQyUyMmxhc3RFdmVudElkJTIyJTNBMCUyQyUyMnBhZ2VDb3VudGVyJTIyJTNBMCU3RA==
priority
u=1, i
referer
https://api.qualp.com.br/router/try-it
sec-ch-ua
"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"
sec-ch-ua-mobile
?0
sec-ch-ua-platform
"macOS"
sec-fetch-dest
empty
sec-fetch-mode
cors
sec-fetch-site
same-origin
user-agent
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
x-accept
json
x-requested-with
XMLHttpRequest
x-xsrf-token
eyJpdiI6IjVSSjMzWU90dmY3Z1pGMUtlbXBZYkE9PSIsInZhbHVlIjoidUVEU1IvbTdGYzJpd0VaaFpoYnhXQlRFbVdFOGZMRk1pMTdkTHNOZmRuSzBSZDdHWUhBZ2NBR2RlbXpHbVFsQ1dJZ0VmNnRacW43QWN3YUtmbTJibHpvY0NKN00yQ2M2MXlXOVY5NVh3OHBpZ3ZkUzdERDk1Y0pobG9RSmJrTS8iLCJtYWMiOiJjYjIyOWZmNDllOTBmMGFkNDQxOTRkMDgzZDZkZGUyOWU4M2E3OGM3MWI1NjcwOTE3YjE4M2FmZjcxMTg4MmMyIiwidGFnIjoiIn0=

payload enviado

Query String Parameters
json {"locations":["Sorocaba","Itu"],"config":{"route":{"optimized_route":false,"optimized_route_destination":"last","calculate_return":true,"alternative_routes":"0","avoid_locations":true,"avoid_locations_key":"","type_route":"efficient"},"vehicle":{"type":"truck","axis":"all","top_speed":null},"tolls":{"retroactive_date":""},"freight_table":{"category":"all","freight_load":"all","axis":"all"},"fuel_consumption":{"fuel_price":"","km_fuel":""},"private_places":{"max_distance_from_location_to_route":"1000","categories":true,"areas":true,"contacts":true,"products":true,"services":true}},"show":{"tolls":true,"freight_table":true,"maneuvers":"full","truck_scales":true,"static_image":true,"link_to_qualp":true,"private_places":false,"polyline":true,"simplified_polyline":false,"ufs":true,"fuel_consumption":true,"link_to_qualp_report":true,"segments_information":true},"format":"json","exception_key":""}

response

{
    "distancia": {
        "texto": "71 km",
        "valor": 71
    },
    "distancia_nao_pavimentada": {
        "texto": "0 km",
        "valor": 0,
        "percentual_texto": "0%",
        "percentual_valor": 0
    },
    "informacao_trechos": [
        {
            "nome": "sorocaba",
            "trecho": {
                "origem": "sorocaba",
                "destino": "itu"
            },
            "coordenadas": {
                "origem": {
                    "lat": -23.5058,
                    "lng": -47.45597
                },
                "destino": {
                    "lat": -23.27946,
                    "lng": -47.30856
                }
            },
            "eixos": "all",
            "distancia": 36.624,
            "pracas": []
        },
        {
            "nome": "itu",
            "trecho": {
                "origem": "itu",
                "destino": "sorocaba"
            },
            "coordenadas": {
                "origem": {
                    "lat": -23.27946,
                    "lng": -47.30856
                },
                "destino": {
                    "lat": -23.5058,
                    "lng": -47.45597
                }
            },
            "eixos": "all",
            "distancia": 34.777,
            "pracas": [
                {
                    "indice": 0,
                    "id_praca": "2208",
                    "concessionaria": "CCR SOROCABANA",
                    "nome": "Sorocaba",
                    "eixos": "all"
                }
            ]
        }
    ],
    "duracao": {
        "texto": "00:50:43",
        "valor": 3044
    },
    "endereco_inicio": "sorocaba",
    "endereco_fim": "sorocaba",
    "coordenada_inicio": "-23.5058,-47.45597",
    "coordenada_fim": "-23.5058,-47.45597",
    "rotograma": [
        {
            "instrucao": "Conduza para norte na Rua Doutor Nogueira Martins.",
            "p_index": 0,
            "ruas": [
                "Rua Doutor Nogueira Martins"
            ],
            "tipo": 1,
            "tempo_segundos": 3.561,
            "distancia_km": 0.048,
            "instrucao_verbal_pre_transicao": "Conduza para norte na Rua Doutor Nogueira Martins. Depois Entre na rotunda e saia na saída 2º em direção à Rua Santa Clara.",
            "instrucao_verbal_pos_transicao": "Continue durante 50 metros.",
            "verbal_multi_cue": true,
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 0
        },
        {
            "instrucao": "Entre na rotunda e saia na saída 2º em direção à Rua Santa Clara.",
            "p_index": 2,
            "tipo": 26,
            "tempo_segundos": 5.342,
            "distancia_km": 0.023,
            "instrucao_verbal_alerta_transicao": "Entre na rotunda e saia na saída 2º em direção à Rua Santa Clara.",
            "instrucao_verbal_pre_transicao": "Entre na rotunda e saia na saída 2º em direção à Rua Santa Clara.",
            "contagem_saida_rotatoria": 2,
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 0.048
        },
        {
            "instrucao": "Saia da rotunda em direção à Rua Santa Clara.",
            "p_index": 15,
            "ruas": [
                "Rua Santa Clara"
            ],
            "tipo": 27,
            "tempo_segundos": 8.142,
            "distancia_km": 0.109,
            "instrucao_verbal_pre_transicao": "Saia da rotunda em direção à Rua Santa Clara. Depois Vire à esquerda em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
            "instrucao_verbal_pos_transicao": "Continue durante 100 metros.",
            "verbal_multi_cue": true,
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 0.071
        },
        {
            "instrucao": "Vire à esquerda em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
            "p_index": 21,
            "ruas": [
                "Avenida Presidente Juscelino Kubitschek de Oliveira"
            ],
            "tipo": 15,
            "tempo_segundos": 22.583,
            "distancia_km": 0.368,
            "instrucao_verbal_alerta_transicao": "Vire à esquerda em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
            "instrucao_verbal_pre_transicao": "Vire à esquerda em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
            "instrucao_verbal_pos_transicao": "Continue durante 400 metros.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 0.18
        },
        {
            "instrucao": "Vire à direita em direção à SPA-103/079/BR-478/Praça Dom Tadeu Strunk.",
            "p_index": 39,
            "ruas": [
                "SPA-103/079",
                "BR-478",
                "Praça Dom Tadeu Strunk"
            ],
            "tipo": 9,
            "tempo_segundos": 1.455,
            "distancia_km": 0.022,
            "instrucao_verbal_alerta_transicao": "Vire à direita em direção à SPA-103/079.",
            "instrucao_verbal_pre_transicao": "Vire à direita em direção à SPA-103/079, BR-478. Depois Saia em direção Villa Assis.",
            "instrucao_verbal_pos_transicao": "Continue durante 20 metros.",
            "verbal_multi_cue": true,
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 0.548
        },
        {
            "instrucao": "Saia em direção a Villa Assis.",
            "p_index": 40,
            "ruas": [
                "Praça Dom Tadeu Strunk"
            ],
            "tipo": 21,
            "tempo_segundos": 4.546,
            "distancia_km": 0.09,
            "instrucao_verbal_alerta_transicao": "Saia em direção Villa Assis.",
            "instrucao_verbal_pre_transicao": "Saia em direção Villa Assis. Depois Vire à esquerda em direção à SPA-103/079.",
            "sinal": {
                "exit_toward_elements": [
                    {
                        "text": "Villa Assis"
                    }
                ]
            },
            "verbal_multi_cue": true,
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 0.57
        },
        {
            "instrucao": "Vire à esquerda em direção à SPA-103/079/BR-478/Praça Dom Tadeu Strunk. Continue na SPA-103/079.",
            "p_index": 48,
            "ruas": [
                "SPA-103/079"
            ],
            "tipo": 15,
            "tempo_segundos": 197.561,
            "distancia_km": 3.647,
            "instrucao_verbal_alerta_transicao": "Vire à esquerda em direção à SPA-103/079.",
            "instrucao_verbal_pre_transicao": "Vire à esquerda em direção à SPA-103/079, BR-478.",
            "instrucao_verbal_pos_transicao": "Continue na SPA-103/079 durante 4 quilómetros.",
            "inicio_ruas": [
                "SPA-103/079",
                "BR-478",
                "Praça Dom Tadeu Strunk"
            ],
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 0.66
        },
        {
            "instrucao": "Entre na rampa em direção a Itu/Campinas/São Paulo/São Roque.",
            "p_index": 128,
            "ruas": [
                "SP-075"
            ],
            "tipo": 19,
            "tempo_segundos": 957.863,
            "distancia_km": 8.68,
            "instrucao_verbal_alerta_transicao": "Entre na rampa em direção a Itu.",
            "instrucao_verbal_pre_transicao": "Entre na rampa em direção a Itu, Campinas.",
            "instrucao_verbal_pos_transicao": "Continue durante 29 quilómetros.",
            "sinal": {
                "exit_toward_elements": [
                    {
                        "text": "Itu"
                    },
                    {
                        "text": "Campinas"
                    },
                    {
                        "text": "São Paulo"
                    },
                    {
                        "text": "São Roque"
                    }
                ]
            },
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 4.307
        },
        {
            "instrucao": "Balança PPV 2 - Sorocaba - Bidirecional no KM 8.",
            "p_index": 182,
            "balanca": true,
            "distancia_km": 19.882,
            "distancia_percorrida_km": 12.987
        },
        {
            "instrucao": "Saia na saída à direita.",
            "p_index": 359,
            "tipo": 20,
            "tempo_segundos": 9.934,
            "distancia_km": 0.245,
            "instrucao_verbal_alerta_transicao": "Saia na saída à direita.",
            "instrucao_verbal_pre_transicao": "Saia na saída à direita. Depois Vire à direita.",
            "verbal_multi_cue": true,
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 32.869
        },
        {
            "instrucao": "Vire à direita.",
            "p_index": 363,
            "tipo": 9,
            "tempo_segundos": 25.746,
            "distancia_km": 0.425,
            "instrucao_verbal_alerta_transicao": "Vire à direita.",
            "instrucao_verbal_pre_transicao": "Vire à direita.",
            "instrucao_verbal_pos_transicao": "Continue durante 400 metros.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 33.114
        },
        {
            "instrucao": "Vire à direita em direção à Rua Parque do Varvito.",
            "p_index": 392,
            "ruas": [
                "Rua Parque do Varvito"
            ],
            "tipo": 9,
            "tempo_segundos": 82.083,
            "distancia_km": 1.269,
            "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Rua Parque do Varvito.",
            "instrucao_verbal_pre_transicao": "Vire à direita em direção à Rua Parque do Varvito.",
            "instrucao_verbal_pos_transicao": "Continue durante 1.5 quilómetros.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 33.539
        },
        {
            "instrucao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
            "p_index": 438,
            "ruas": [
                "Avenida Caetano Ruggieri"
            ],
            "tipo": 10,
            "tempo_segundos": 126.607,
            "distancia_km": 1.644,
            "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
            "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
            "instrucao_verbal_pos_transicao": "Continue durante 1.5 quilómetros.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 34.808
        },
        {
            "instrucao": "Vire à direita em direção à Rua Alexandre Andreazza.",
            "p_index": 456,
            "ruas": [
                "Rua Alexandre Andreazza"
            ],
            "tipo": 10,
            "tempo_segundos": 25.115,
            "distancia_km": 0.199,
            "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Rua Alexandre Andreazza.",
            "instrucao_verbal_pre_transicao": "Vire à direita em direção à Rua Alexandre Andreazza.",
            "instrucao_verbal_pos_transicao": "Continue durante 200 metros.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 36.452
        },
        {
            "instrucao": "Faça uma inversão de marcha à direita para se manter na Rua Alexandre Andreazza.",
            "p_index": 461,
            "ruas": [
                "Rua Alexandre Andreazza"
            ],
            "tipo": 12,
            "tempo_segundos": 23.955,
            "distancia_km": 0.199,
            "instrucao_verbal_alerta_transicao": "Faça uma inversão de marcha à direita para se manter na Rua Alexandre Andreazza.",
            "instrucao_verbal_pre_transicao": "Faça uma inversão de marcha à direita para se manter na Rua Alexandre Andreazza.",
            "instrucao_verbal_pos_transicao": "Continue durante 200 metros.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 36.651
        },
        {
            "instrucao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
            "p_index": 466,
            "ruas": [
                "Avenida Caetano Ruggieri"
            ],
            "tipo": 10,
            "tempo_segundos": 62.75,
            "distancia_km": 0.754,
            "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
            "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Caetano Ruggieri.",
            "instrucao_verbal_pos_transicao": "Continue durante 800 metros.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 36.85
        },
        {
            "instrucao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
            "p_index": 482,
            "tipo": 26,
            "tempo_segundos": 4.253,
            "distancia_km": 0.025,
            "instrucao_verbal_alerta_transicao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
            "instrucao_verbal_pre_transicao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
            "contagem_saida_rotatoria": 2,
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 37.604
        },
        {
            "instrucao": "Saia da rotunda em direção à Avenida Caetano Ruggieri.",
            "p_index": 486,
            "ruas": [
                "Avenida Caetano Ruggieri"
            ],
            "tipo": 27,
            "tempo_segundos": 31.555,
            "distancia_km": 0.429,
            "instrucao_verbal_pre_transicao": "Saia da rotunda em direção à Avenida Caetano Ruggieri.",
            "instrucao_verbal_pos_transicao": "Continue durante 400 metros.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 37.629
        },
        {
            "instrucao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
            "p_index": 497,
            "tipo": 26,
            "tempo_segundos": 5.576,
            "distancia_km": 0.042,
            "instrucao_verbal_alerta_transicao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
            "instrucao_verbal_pre_transicao": "Entre na rotunda e saia na saída 2º em direção à Avenida Caetano Ruggieri.",
            "contagem_saida_rotatoria": 2,
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 38.058
        },
        {
            "instrucao": "Saia da rotunda em direção à Avenida Caetano Ruggieri.",
            "p_index": 503,
            "ruas": [
                "Avenida Caetano Ruggieri"
            ],
            "tipo": 27,
            "tempo_segundos": 56.634,
            "distancia_km": 0.959,
            "instrucao_verbal_pre_transicao": "Saia da rotunda em direção à Avenida Caetano Ruggieri.",
            "instrucao_verbal_pos_transicao": "Continue durante 1 quilómetro.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 38.1
        },
        {
            "instrucao": "Vire à direita em direção à Avenida Tiradentes/SP-079. Continue na SP-079.",
            "p_index": 531,
            "ruas": [
                "SP-079"
            ],
            "tipo": 10,
            "tempo_segundos": 477.009,
            "distancia_km": 10.541,
            "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Tiradentes.",
            "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Tiradentes, SP-079.",
            "instrucao_verbal_pos_transicao": "Continue na SP-079 durante 11 quilómetros.",
            "inicio_ruas": [
                "Avenida Tiradentes",
                "SP-079"
            ],
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 39.059
        },
        {
            "instrucao": "Entre na rampa SP-075 à direita.",
            "p_index": 691,
            "ruas": [
                "SP-075"
            ],
            "tipo": 18,
            "tempo_segundos": 882.454,
            "distancia_km": 4.681,
            "instrucao_verbal_alerta_transicao": "Entre na rampa SP-075 à direita.",
            "instrucao_verbal_pre_transicao": "Entre na rampa SP-075 à direita.",
            "instrucao_verbal_pos_transicao": "Continue durante 21 quilómetros.",
            "sinal": {
                "exit_branch_elements": [
                    {
                        "text": "SP-075"
                    }
                ]
            },
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 49.6
        },
        {
            "instrucao": "Pedágio Sorocaba no KM 13.",
            "p_index": 746,
            "pedagio": true,
            "distancia_km": 3.855,
            "distancia_percorrida_km": 54.281
        },
        {
            "instrucao": "Balança PPV 2 - Sorocaba - Bidirecional no KM 8.",
            "p_index": 767,
            "balanca": true,
            "distancia_km": 12.862,
            "distancia_percorrida_km": 58.136
        },
        {
            "instrucao": "Vire à direita em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
            "p_index": 954,
            "ruas": [
                "Avenida Presidente Juscelino Kubitschek de Oliveira"
            ],
            "tipo": 9,
            "tempo_segundos": 22.32,
            "distancia_km": 0.364,
            "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
            "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Presidente Juscelino Kubitschek de Oliveira.",
            "instrucao_verbal_pos_transicao": "Continue durante 400 metros.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus",
            "distancia_percorrida_km": 70.998
        },
        {
            "instrucao": "Vire à direita em direção à Avenida Comendador Pereira Inácio.",
            "p_index": 965,
            "ruas": [
                "Avenida Comendador Pereira Inácio"
            ],
            "tipo": 10,
            "tempo_segundos": 6.833,
            "distancia_km": 0.058,
            "instrucao_verbal_alerta_transicao": "Vire à direita em direção à Avenida Comendador Pereira Inácio.",
            "instrucao_verbal_pre_transicao": "Vire à direita em direção à Avenida Comendador Pereira Inácio. Depois, em 60 metros, Chegará a sorocaba.",
            "instrucao_verbal_pos_transicao": "Continue durante 60 metros.",
            "verbal_multi_cue": true,
            "modo_viagem": "drive",
            "tipo_viagem": "bus"
        },
        {
            "instrucao": "Chegou a sorocaba.",
            "p_index": 969,
            "tipo": 4,
            "instrucao_verbal_alerta_transicao": "Chegará a sorocaba.",
            "instrucao_verbal_pre_transicao": "Chegou a sorocaba.",
            "modo_viagem": "drive",
            "tipo_viagem": "bus"
        }
    ],
    "rota_imagem": "https://link.qualp.com.br/3/mlUjkt",
    "pedagios": [
        {
            "id_api": "2208",
            "codigo_antt": "35350750125000102",
            "codigo_integracao_sem_parar": 21,
            "codigo_integracao_sem_parar_praca": 882,
            "sentido_integracao_sem_parar": "S",
            "direcao_integracao_sem_parar": "D",
            "codigo_conectcar": 10121542,
            "sentido_conectcar": "S",
            "codigo_integracao_veloe": 154,
            "codigo_integracao_veloe_concessionaria": 1012,
            "sentido_integracao_veloe": "S",
            "codigo_integracao_movemais": 35350750125000102,
            "codigo_integracao_movemais_praca": 0,
            "sentido_integracao_movemais": "S",
            "codigo_integracao_dclogg": 498,
            "sentido_integracao_dclogg": "S",
            "concessionaria": "CCR SOROCABANA",
            "concessionaria_contato": "1197394814 / 08002527280",
            "nome": "Sorocaba",
            "uf": "SP",
            "municipio": "Sorocaba",
            "codigo_ibge": "3552205",
            "rodovia": "SP-075",
            "km": "13.325",
            "tarifa": {
                "2": 14.2,
                "3": 21.3,
                "4": 28.4,
                "5": 35.5,
                "6": 42.6,
                "7": 49.7,
                "8": 56.8,
                "9": 63.9,
                "10": 71,
                "11": 78.1,
                "12": 85.2,
                "13": 92.3,
                "14": 99.4,
                "15": 106.5
            },
            "special_toll": false,
            "porcentagem_fim_semana": 0,
            "porcentagem_tag": -5,
            "porcentagem_tag_arredondamento": "baixo",
            "is_ferry": 0,
            "is_free_flow": 0,
            "p_index": 746
        }
    ],
    "tabela_frete": {
        "dados": {
            "A": {
                "2": {
                    "granel_solido": 691.24,
                    "granel_liquido": 702.51,
                    "frigorificada": 796.14,
                    "conteineirizada": 0,
                    "geral": 680.33,
                    "neogranel": 656.77,
                    "perigosa_granel_solido": 882.08,
                    "perigosa_granel_liquido": 906.04,
                    "perigosa_frigorificada": 939.27,
                    "perigosa_conteineirizada": 0,
                    "perigosa_geral": 796.22,
                    "granel_pressurizada": 0
                },
                "3": {
                    "granel_solido": 854.47,
                    "granel_liquido": 871.55,
                    "frigorificada": 971.98,
                    "conteineirizada": 880.51,
                    "geral": 841.57,
                    "neogranel": 841.32,
                    "perigosa_granel_solido": 1045.3,
                    "perigosa_granel_liquido": 1075.08,
                    "perigosa_frigorificada": 1115.1,
                    "perigosa_conteineirizada": 996.4,
                    "perigosa_geral": 957.47,
                    "granel_pressurizada": 0
                },
                "4": {
                    "granel_solido": 947.45,
                    "granel_liquido": 1005.14,
                    "frigorificada": 1115.79,
                    "conteineirizada": 924.63,
                    "geral": 939.82,
                    "neogranel": 944.05,
                    "perigosa_granel_solido": 1150.04,
                    "perigosa_granel_liquido": 1218.21,
                    "perigosa_frigorificada": 1272.06,
                    "perigosa_conteineirizada": 1052.28,
                    "perigosa_geral": 1067.47,
                    "granel_pressurizada": 0
                },
                "5": {
                    "granel_solido": 1045.96,
                    "granel_liquido": 1080.82,
                    "frigorificada": 1220.88,
                    "conteineirizada": 1020.95,
                    "geral": 1039.43,
                    "neogranel": 1036.26,
                    "perigosa_granel_solido": 1248.56,
                    "perigosa_granel_liquido": 1293.9,
                    "perigosa_frigorificada": 1377.15,
                    "perigosa_conteineirizada": 1148.6,
                    "perigosa_geral": 1167.08,
                    "granel_pressurizada": 1143.75
                },
                "6": {
                    "granel_solido": 1144.53,
                    "granel_liquido": 1176.02,
                    "frigorificada": 1318.1,
                    "conteineirizada": 1117.26,
                    "geral": 1140.82,
                    "neogranel": 1138.35,
                    "perigosa_granel_solido": 1347.12,
                    "perigosa_granel_liquido": 1389.1,
                    "perigosa_frigorificada": 1474.37,
                    "perigosa_conteineirizada": 1244.91,
                    "perigosa_geral": 1268.48,
                    "granel_pressurizada": 1264.29
                },
                "7": {
                    "granel_solido": 1276.21,
                    "granel_liquido": 1314.3,
                    "frigorificada": 1560.38,
                    "conteineirizada": 1290.01,
                    "geral": 1274.65,
                    "neogranel": 1288.78,
                    "perigosa_granel_solido": 1488.8,
                    "perigosa_granel_liquido": 1537.38,
                    "perigosa_frigorificada": 1729.64,
                    "perigosa_conteineirizada": 1427.67,
                    "perigosa_geral": 1412.3,
                    "granel_pressurizada": 0
                },
                "8": {
                    "granel_solido": 1276.21,
                    "granel_liquido": 1314.3,
                    "frigorificada": 1560.38,
                    "conteineirizada": 1290.01,
                    "geral": 1274.65,
                    "neogranel": 1288.78,
                    "perigosa_granel_solido": 1488.8,
                    "perigosa_granel_liquido": 1537.38,
                    "perigosa_frigorificada": 1729.64,
                    "perigosa_conteineirizada": 1427.67,
                    "perigosa_geral": 1412.3,
                    "granel_pressurizada": 0
                },
                "9": {
                    "granel_solido": 1396.85,
                    "granel_liquido": 1438.43,
                    "frigorificada": 1698.05,
                    "conteineirizada": 1379.6,
                    "geral": 1405.84,
                    "neogranel": 1403.36,
                    "perigosa_granel_solido": 1619.99,
                    "perigosa_granel_liquido": 1672.04,
                    "perigosa_frigorificada": 1881.03,
                    "perigosa_conteineirizada": 1527.79,
                    "perigosa_geral": 1554.03,
                    "granel_pressurizada": 1555.83
                }
            },
            "B": {
                "2": {
                    "granel_solido": 0,
                    "granel_liquido": 0,
                    "frigorificada": 0,
                    "conteineirizada": 0,
                    "geral": 0,
                    "neogranel": 0,
                    "perigosa_granel_solido": 0,
                    "perigosa_granel_liquido": 0,
                    "perigosa_frigorificada": 0,
                    "perigosa_conteineirizada": 0,
                    "perigosa_geral": 0,
                    "granel_pressurizada": 0
                },
                "3": {
                    "granel_solido": 0,
                    "granel_liquido": 0,
                    "frigorificada": 0,
                    "conteineirizada": 0,
                    "geral": 0,
                    "neogranel": 0,
                    "perigosa_granel_solido": 0,
                    "perigosa_granel_liquido": 0,
                    "perigosa_frigorificada": 0,
                    "perigosa_conteineirizada": 0,
                    "perigosa_geral": 0,
                    "granel_pressurizada": 0
                },
                "4": {
                    "granel_solido": 854.14,
                    "granel_liquido": 858.58,
                    "frigorificada": 958.3,
                    "conteineirizada": 854.14,
                    "geral": 854.14,
                    "neogranel": 854.14,
                    "perigosa_granel_solido": 1056.73,
                    "perigosa_granel_liquido": 1071.65,
                    "perigosa_frigorificada": 1114.58,
                    "perigosa_conteineirizada": 981.79,
                    "perigosa_geral": 981.79,
                    "granel_pressurizada": 0
                },
                "5": {
                    "granel_solido": 937.96,
                    "granel_liquido": 942.4,
                    "frigorificada": 1048.48,
                    "conteineirizada": 937.96,
                    "geral": 937.96,
                    "neogranel": 937.96,
                    "perigosa_granel_solido": 1140.56,
                    "perigosa_granel_liquido": 1155.48,
                    "perigosa_frigorificada": 1204.76,
                    "perigosa_conteineirizada": 1065.61,
                    "perigosa_geral": 1065.61,
                    "granel_pressurizada": 937.96
                },
                "6": {
                    "granel_solido": 1027.95,
                    "granel_liquido": 1032.38,
                    "frigorificada": 1145.7,
                    "conteineirizada": 1027.95,
                    "geral": 1027.95,
                    "neogranel": 1027.95,
                    "perigosa_granel_solido": 1230.54,
                    "perigosa_granel_liquido": 1245.46,
                    "perigosa_frigorificada": 1301.97,
                    "perigosa_conteineirizada": 1155.6,
                    "perigosa_geral": 1155.6,
                    "granel_pressurizada": 1027.95
                },
                "7": {
                    "granel_solido": 1134.07,
                    "granel_liquido": 1138.52,
                    "frigorificada": 1261.83,
                    "conteineirizada": 1134.07,
                    "geral": 1134.07,
                    "neogranel": 1134.07,
                    "perigosa_granel_solido": 1346.67,
                    "perigosa_granel_liquido": 1361.6,
                    "perigosa_frigorificada": 1431.11,
                    "perigosa_conteineirizada": 1271.73,
                    "perigosa_geral": 1271.73,
                    "granel_pressurizada": 0
                },
                "8": {
                    "granel_solido": 1134.07,
                    "granel_liquido": 1138.52,
                    "frigorificada": 1261.83,
                    "conteineirizada": 1134.07,
                    "geral": 1134.07,
                    "neogranel": 1134.07,
                    "perigosa_granel_solido": 1346.67,
                    "perigosa_granel_liquido": 1361.6,
                    "perigosa_frigorificada": 1431.11,
                    "perigosa_conteineirizada": 1271.73,
                    "perigosa_geral": 1271.73,
                    "granel_pressurizada": 0
                },
                "9": {
                    "granel_solido": 1199.74,
                    "granel_liquido": 1204.18,
                    "frigorificada": 1346.87,
                    "conteineirizada": 1199.74,
                    "geral": 1199.74,
                    "neogranel": 1199.74,
                    "perigosa_granel_solido": 1422.87,
                    "perigosa_granel_liquido": 1437.79,
                    "perigosa_frigorificada": 1529.84,
                    "perigosa_conteineirizada": 1347.92,
                    "perigosa_geral": 1347.92,
                    "granel_pressurizada": 1199.74
                }
            },
            "C": {
                "2": {
                    "granel_solido": 383.13,
                    "granel_liquido": 387.56,
                    "frigorificada": 455.03,
                    "conteineirizada": 0,
                    "geral": 380.45,
                    "neogranel": 356.89,
                    "perigosa_granel_solido": 465.47,
                    "perigosa_granel_liquido": 471.34,
                    "perigosa_frigorificada": 531.45,
                    "perigosa_conteineirizada": 0,
                    "perigosa_geral": 433.46,
                    "granel_pressurizada": 0
                },
                "3": {
                    "granel_solido": 457.87,
                    "granel_liquido": 463.73,
                    "frigorificada": 539.56,
                    "conteineirizada": 464.24,
                    "geral": 454.7,
                    "neogranel": 454.64,
                    "perigosa_granel_solido": 540.21,
                    "perigosa_granel_liquido": 547.51,
                    "perigosa_frigorificada": 615.96,
                    "perigosa_conteineirizada": 517.25,
                    "perigosa_geral": 507.71,
                    "granel_pressurizada": 0
                },
                "4": {
                    "granel_solido": 524.78,
                    "granel_liquido": 542.28,
                    "frigorificada": 629.11,
                    "conteineirizada": 519.18,
                    "geral": 522.91,
                    "neogranel": 523.95,
                    "perigosa_granel_solido": 616.1,
                    "perigosa_granel_liquido": 632.81,
                    "perigosa_frigorificada": 715.04,
                    "perigosa_conteineirizada": 581.17,
                    "perigosa_geral": 584.89,
                    "granel_pressurizada": 0
                },
                "5": {
                    "granel_solido": 575.63,
                    "granel_liquido": 587.52,
                    "frigorificada": 686.37,
                    "conteineirizada": 569.49,
                    "geral": 574.02,
                    "neogranel": 573.25,
                    "perigosa_granel_solido": 666.95,
                    "perigosa_granel_liquido": 678.06,
                    "perigosa_frigorificada": 772.3,
                    "perigosa_conteineirizada": 631.49,
                    "perigosa_geral": 636.01,
                    "granel_pressurizada": 599.59
                },
                "6": {
                    "granel_solido": 628.74,
                    "granel_liquido": 639.8,
                    "frigorificada": 744.6,
                    "conteineirizada": 622.04,
                    "geral": 627.82,
                    "neogranel": 627.22,
                    "perigosa_granel_solido": 720.05,
                    "perigosa_granel_liquido": 730.34,
                    "perigosa_frigorificada": 830.53,
                    "perigosa_conteineirizada": 684.04,
                    "perigosa_geral": 689.81,
                    "granel_pressurizada": 658.09
                },
                "7": {
                    "granel_solido": 690.39,
                    "granel_liquido": 703.08,
                    "frigorificada": 838.28,
                    "conteineirizada": 693.77,
                    "geral": 690.01,
                    "neogranel": 693.48,
                    "perigosa_granel_solido": 789.07,
                    "perigosa_granel_liquido": 800.98,
                    "perigosa_frigorificada": 933.77,
                    "perigosa_conteineirizada": 763.12,
                    "perigosa_geral": 759.35,
                    "granel_pressurizada": 0
                },
                "8": {
                    "granel_solido": 690.39,
                    "granel_liquido": 703.08,
                    "frigorificada": 838.28,
                    "conteineirizada": 693.77,
                    "geral": 690.01,
                    "neogranel": 693.48,
                    "perigosa_granel_solido": 789.07,
                    "perigosa_granel_liquido": 800.98,
                    "perigosa_frigorificada": 933.77,
                    "perigosa_conteineirizada": 763.12,
                    "perigosa_geral": 759.35,
                    "granel_pressurizada": 0
                },
                "9": {
                    "granel_solido": 776.64,
                    "granel_liquido": 790.18,
                    "frigorificada": 940.52,
                    "conteineirizada": 772.41,
                    "geral": 778.84,
                    "neogranel": 778.23,
                    "perigosa_granel_solido": 883.05,
                    "perigosa_granel_liquido": 895.82,
                    "perigosa_frigorificada": 1046.1,
                    "perigosa_conteineirizada": 849.5,
                    "perigosa_geral": 855.94,
                    "granel_pressurizada": 815.6
                }
            },
            "D": {
                "2": {
                    "granel_solido": 0,
                    "granel_liquido": 0,
                    "frigorificada": 0,
                    "conteineirizada": 0,
                    "geral": 0,
                    "neogranel": 0,
                    "perigosa_granel_solido": 0,
                    "perigosa_granel_liquido": 0,
                    "perigosa_frigorificada": 0,
                    "perigosa_conteineirizada": 0,
                    "perigosa_geral": 0,
                    "granel_pressurizada": 0
                },
                "3": {
                    "granel_solido": 0,
                    "granel_liquido": 0,
                    "frigorificada": 0,
                    "conteineirizada": 0,
                    "geral": 0,
                    "neogranel": 0,
                    "perigosa_granel_solido": 0,
                    "perigosa_granel_liquido": 0,
                    "perigosa_frigorificada": 0,
                    "perigosa_conteineirizada": 0,
                    "perigosa_geral": 0,
                    "granel_pressurizada": 0
                },
                "4": {
                    "granel_solido": 482.25,
                    "granel_liquido": 486.69,
                    "frigorificada": 570.85,
                    "conteineirizada": 482.25,
                    "geral": 482.25,
                    "neogranel": 482.25,
                    "perigosa_granel_solido": 573.56,
                    "perigosa_granel_liquido": 577.23,
                    "perigosa_frigorificada": 656.79,
                    "perigosa_conteineirizada": 544.24,
                    "perigosa_geral": 544.24,
                    "granel_pressurizada": 0
                },
                "5": {
                    "granel_solido": 523.11,
                    "granel_liquido": 527.55,
                    "frigorificada": 618.06,
                    "conteineirizada": 523.11,
                    "geral": 523.11,
                    "neogranel": 523.11,
                    "perigosa_granel_solido": 614.42,
                    "perigosa_granel_liquido": 618.08,
                    "perigosa_frigorificada": 704.01,
                    "perigosa_conteineirizada": 585.09,
                    "perigosa_geral": 585.09,
                    "granel_pressurizada": 523.11
                },
                "6": {
                    "granel_solido": 574.11,
                    "granel_liquido": 578.55,
                    "frigorificada": 676.3,
                    "conteineirizada": 574.11,
                    "geral": 574.11,
                    "neogranel": 574.11,
                    "perigosa_granel_solido": 665.43,
                    "perigosa_granel_liquido": 669.09,
                    "perigosa_frigorificada": 762.24,
                    "perigosa_conteineirizada": 636.1,
                    "perigosa_geral": 636.1,
                    "granel_pressurizada": 574.11
                },
                "7": {
                    "granel_solido": 621.15,
                    "granel_liquido": 625.59,
                    "frigorificada": 730.69,
                    "conteineirizada": 621.15,
                    "geral": 621.15,
                    "neogranel": 621.15,
                    "perigosa_granel_solido": 719.81,
                    "perigosa_granel_liquido": 723.47,
                    "perigosa_frigorificada": 826.18,
                    "perigosa_conteineirizada": 690.48,
                    "perigosa_geral": 690.48,
                    "granel_pressurizada": 0
                },
                "8": {
                    "granel_solido": 621.15,
                    "granel_liquido": 625.59,
                    "frigorificada": 730.69,
                    "conteineirizada": 621.15,
                    "geral": 621.15,
                    "neogranel": 621.15,
                    "perigosa_granel_solido": 719.81,
                    "perigosa_granel_liquido": 723.47,
                    "perigosa_frigorificada": 826.18,
                    "perigosa_conteineirizada": 690.48,
                    "perigosa_geral": 690.48,
                    "granel_pressurizada": 0
                },
                "9": {
                    "granel_solido": 681.13,
                    "granel_liquido": 685.58,
                    "frigorificada": 807.25,
                    "conteineirizada": 681.13,
                    "geral": 681.13,
                    "neogranel": 681.13,
                    "perigosa_granel_solido": 787.55,
                    "perigosa_granel_liquido": 791.21,
                    "perigosa_frigorificada": 912.83,
                    "perigosa_conteineirizada": 758.22,
                    "perigosa_geral": 758.22,
                    "granel_pressurizada": 681.13
                }
            }
        },
        "antt_resolucao": {
            "nome": "RESOLUÇÃO ANTT Nº 6.067",
            "data": "17/07/2025",
            "data_final": null,
            "url": "https://anttlegis.antt.gov.br/action/ActionDatalegis.php?acao=abrirTextoAto&link=S&tipo=RES&numeroAto=00006067&seqAto=000&valorAno=2025&orgao=DG/ANTT/MT&cod_modulo=161&cod_menu=7796"
        }
    },
    "balancas": [
        {
            "id": 81,
            "lat": -23.434721738171362,
            "lng": -47.37260967493058,
            "nome": "PPV 2 - Sorocaba - Bidirecional",
            "rodovia": "SP-075",
            "uf": "SP",
            "uf_ibge": 35,
            "km": "8.500",
            "sentido": "Bidirecional",
            "concessionaria": "VIAOESTE",
            "concessionaria_id": 539,
            "logo": "<img class='img-thumbnail' src='common/images/concessionarias/539.jpg' style='width:100px; max-height:72px; min-height:45px'>",
            "p_index": 182
        },
        {
            "id": 81,
            "lat": -23.434721738171362,
            "lng": -47.37260967493058,
            "nome": "PPV 2 - Sorocaba - Bidirecional",
            "rodovia": "SP-075",
            "uf": "SP",
            "uf_ibge": 35,
            "km": "8.500",
            "sentido": "Bidirecional",
            "concessionaria": "VIAOESTE",
            "concessionaria_id": 539,
            "logo": "<img class='img-thumbnail' src='common/images/concessionarias/539.jpg' style='width:100px; max-height:72px; min-height:45px'>",
            "p_index": 767
        }
    ],
    "polilinha_codificada": "xvtyk@vjnoyAyIhBiNzCc@?a@J[TS\\Gf@@d@L`@PT@D^P`@Hb@C\\QpQgGdR{BlEg@\\ClF{@jFu@hBaGRkEpCwf@bAgGrA{EjRqp@bF_RdFaUFa`@DcBLs@R{@b@cA|@mAf@g@z@m@zAaA`Bw@hKv@zKT~CKhCmAnBwFPmDg@iDYcA{BkFaHs@gMcCsAQ_Ek@_TcCsRmBuRqA{QJ{KbAc\\bDq~AbTqz@rMiEp@_Gt@uFLsLa@aU{HcQ}GwS}B}[@__@A}a@J{^e@ySmBkQyFeX}L_Q}J{GyDyIwFcS_OuWcK}D_BgBa@aK{BsQkFgJkFuHiG_GoEcJaNeK_RsVqa@ic@ul@kJoRsr@kuAguAawCwTc_@yT__@iC{E[s@}BeGgGsQ}Oqa@uFoNkBsEa@_AmDqHan@wrAmIuOuJ}NcImJkRcUcQoKsSqJ}TmI}UkI{PcF_YaE{VkCmYaAuSZmZdBsb@bFqi@hG{x@bKG@aWzD}@LuKdB_Ep@mhA|M}MpDwh@jIwFv@gE~@sB|As@dAuAdCcBfZaDzb@aAjRWxE]nGa@|C[vAo@dA{AlBwAtAaBv@kA\\uBd@kBJiCQuBUoBq@mBoAyB{BgcBaoDmgB}yDsHgPsfDakHc_AwqBoh@ehA{`AiwBspAeoCiJaSiPc^ad@saA}~A_gDgs@gvAclAy_C_t@ytA{|@ccBwwCoeF{aCsyDi~FgkJ_n@}aAquFe~IciB_wCwLiRgjEy|Gu}@y{AgfAgcBiu@skAiyEiyHmlCugEyvIifNiqDw{FcwAw|B_x@mpAklB{uCmUma@gXae@sgAqcBq_@sl@qf@iv@oUoa@odAgcBsD}FubAw~Ake@us@{a@{k@md@}j@ib@uh@aa@qb@ak@gj@uM{Ko{@}s@y[gZyPcM_d@o[io@ac@qlA}q@mWcNeWiMmZgNiYcM}UaK_]yMahCe_AoeA__@__Bql@iTeHwRoHiu@qWeLuEcgBao@q{Aui@a^oMgiBwp@geHaeCkvBou@oMyEyJ_D_QkGmcAqa@qlAyXcz@uRqaAgOws@sIuc@aEqX{Bev@kDqyB}FstD}McaAeDobCiJk[yA{lAsCopAcEoEKuq@iBojDqLmQy@{y@aCe|AsEg[mAc\\sAcf@eBwzBiH_j@eBii@aCuOa@o~B}G}p@}CefAiEadByDe}BiGwlD_Lkk@qBcQo@ctAgF{nCcJ}q@kAcm@mBylFwPcr@mBiP]ecA`A}~@pDeYfBwPdAi\\`DcQfCkSfCqd@bEo^vGyYjFwc@rI}f@xJqa@zGgh@lJam@fLad@zHoh@vJeb@zHgd@jIq}@tO{e@fJsq@rMcu@bNwq@pLap@fLmZrF}KdBqt@nNw_@jGyc@`Iyc@fIqn@~KaP|Cc_@`G{MtCmWnEoQnDiPpCgWpFqg@hJabAlR{~A`Yme@pIyh@jJgd@vHsh@fKgu@hMgk@`JuUpCgn@vFaY`Ce^~Bma@pBu`@nA}V^mW`@sXBwZa@mSA}RSg]yBgZwBqZcBcTcBgg@yDgb@cFmq@eI}c@oF}h@sGkdC{Zg~@mLup@}IaK_AmnAaQgkBeUs{AiRwqAcPakAoO{PqB{IqAsZ}D{m@gIsmHk~@m~A{RacA{S{r@iMsD}A_EeCuAuAcA_CqAgC_D_IgCiGqCiEmBmA}Ba@_EUuDT_H|@cUnFkL~@}MO{KeB_FsAgFeB}EkCaNgJqK{H{AcAeDiBoDiA{Ca@{CG}CFkEv@gFfAkCr@iFpBwEpAeE`@{Ce@_S_DsDcAgEmBcE_D{CsDqBeDgCiGuWefAuA}IiEgc@gBoO_BcKaCyMeEqO{Xq}@oUuu@qNic@s@yEq@gGUqFKyCg@{EeAoE_BqCcBkBcC_CqBmAmGiD_EkD_CmCcBqCo`@q|@{BcHi@oAmAgC_GyR}M_e@wIoUaEwKeFwNcDaIgBqF|EkI~fAidA~|@uz@zcAwaAldAkbApcAoaAbaAy~@jQkOpN}LdZyQtMyErr@sIrj@cIhSsC~_A}Jb~@mGrGs@tPmBzMdPzI~LvIfOfRna@hHfPiHgPgRoa@wIgO{I_M{MePxl@wEpVwAlZmBrVcAhK_@|HDd^DpIExj@QfLEjxAm@di@_@jPg@xMe@tFEhHd@x@lAvA^pCElBs@`EmCjD}AlGeBlm@uIrU{DnHwAb\\aHvJiCzGgBt`Ay^jL{ClCZxBIjBm@xAoAdA_CJaCzBkC|DgC~d@{OvZ}Jjl@eRtIwB~WsDjQcBzWm@pf@k@n\\PxY|A~a@vC|Jr@jHT^ErEU`GsAtFwE|FkIlAqDh@cKYyGoJqgAkDk`@MyBPuB`@yB~BuAhHiDrq@bBvRr@pi@xAhH^tS~CxLtC|NhG~PzJzWdX`X|YxLrKvT~PpNpGjIbCtD`A`Fr@~D^lF`@bIIbK[vv@qCfEKxbBuErZUbb@`ArShAza@nCtY`E`n@tKja@pIjSlA~U^fRKvV@`[Jjd@TbRJpNkAj[kF`a@yBxNg@`Z_Fn[wFv\\mJb[_LhbBmp@~YiKtcBwo@hQqGpA]vGiBhNcDfp@gMdPeC~R{Ed]cD`Hq@zd@cDdr@_Czx@c@|k@dDx_@hFrTvFxD`An_@fO~U`JxeAtYd|@hVbRjFt`@~NnGjCzvAdk@niCdcAviBxs@vRtIzS~DbYvC`qBzQloHlq@nuAlM`|CdVjb@fD|HzAhKdCxGVfh@tE`DTxIk@~JNfnDtYhlFla@xKbC`H|ArO`Ffu@bRbZfEzT|@|N{AfOeBl_@_IxUaI~DaChRuV|KgQ`]m]`TkQfOuMfR}IrNsDtKmA|MfAjPbDdf@jOf[zJ`Z`P~VjQxc@jb@bWjVvOfJn]~OzWnMrg@rUxb@rSpdBty@xeBtz@fN`KrJ`LlNdUnI|Pb`AttB|y@liBnBtFxLh^pBzNdAjLQ|R}@bY_Lxw@{E|[q@hSF|SbAxOnBzTrCpV|Dfa@n@|CxBpHtA|E`H`RrDtH~^xj@tbAjsA`ArAz]li@pYz_@zZhe@~a@ri@`FxGlIrQr@bEQbDs@|DiB|BoBjAeC|@aCJcDm@_u@ic@eAo@sBgDs@iENmDt@qBdAaDxCeBzBCpFM`IS|Za@bl@`CjjCjJrlBrEtx@zDrW~Ah`@`Fnx@hKvaApQlcA|Ujw@zUdbAl^jUzLtQnG`L~DntBdt@h`A|[tiDdoAv`DdhA|a@xOhwAxg@bzBzw@zt@~W|]~LprApe@~xD|tAd]rLrg@bRhQbHv`@|P|d@tU|n@t]zf@rW~e@d\\z|@ls@lCrBrCvBhj@d]t|@bs@zs@jv@dp@ju@jg@lm@v`@jh@|Znc@lvBfhDlqBxcD~[~g@`iA`iBzm@tcAdRp[plArgB`gAxdBvkArkBzpAjrB|iBxwC~fF`jIzlB~{ChKnPhpDf|F|z@lsAxhC~dEr[~f@dlBdxCz`A`}AraDtfFruHpyLtv@vmAthBztCvcElxG|yCt|E~aDj|FtXvh@hkBfoDly@baB`R~^bO|YdaApuBv@bBbl@`oAdMbX~AhDfgAf_CzCtG`mAxkCl~@hnB|Pn^zIzRjIpQbG~Mbl@~pAhsAtuCdObZjVdf@rEbJzhBr_Efm@xtAjo@jsApCvE|AjClBjCvBtBnCjBtB`AbCh@pBTxFP~ESjD}@rD}A|CaC|BqCbBoD~@iCj@mD^cGXsFBa@RoEd@eInBy[tAqP^aCj@oBf@oAzBiE|@_BjAsAtBoBv@m@bAq@dDeBpCiArEqAtL}C|EiAt@Q|@WnBu@nHcAzEk@lHcAdWsD|[cE`BSnBUrB_@hB[rLeBjZiD`|@_MhDs@jGgA`s@aHnKi@jSiApb@Vr]vAbCf@dKpBjI|AzXxHfBr@h\\~MdO`GlN~HtP|PrLhNnSlZlHdOfPb]`DbIdO|ZfBhD`EtHlMxZxC`JjJp_@f@~Ap@hB`GvM~F|IhShUzKjRfGnNhXhi@jWpi@vP|]vDbIbDbH`H~NxBxEpB`E~JfTdGrMh@bAxe@zbA`t@fpArHjLxLdLpVvL|KzDxNxDrCt@rQxEbIxBlIhJrEhN~FlGdFxDtElBfZpE~MpE|TtHzJdDfJpBvKxAlNt@xTMbd@iDr^q@~V?xMpAdHxC|SjIlJfGlH|BbK`@jCi@`AQ~A]lG_Bl]oGxJmAlNaCzrAaQpC_@zj@mItPcAlJbB~ItDlLfLt@n@vCfDp@b[HlYiAbNoJ`]aBzFyPjn@yAzGw@xIyAx[G`CYpFeItAmBZwB\\kMnC",
    "ufs": [
        "SP"
    ],
    "link_site_qualp": "https://qualp.com.br?data=lyVb-du19blRaSYbWlDHv-fKxDcKYrLrQ7HjHMlruR9BTRdi162Ag2UGgHkyymgZvZVEYtaT0BFbxGzjXICaTNx59OsiuserwK0bklBCoZcmmUDdXae9hxU4ODsLEwrNEg43MKbLyYSOciBeyteR5cFhCTeYw6iOu1SYD7k36wQYwpsG7mTII19GyHoU2gyGyUwHegrFkxMxKFineQO-mPmjQ4HLmfyqJxV62TJcb-Kk1KXdJYVLtpP2dZ2NUuLbBYnHFgKKriiDQ-STZMIXr6ycTn_HDHeT6r2KYUDxgT1-fg8YMwn8VqW2l39cuBXa6ku3c1aelLirwrazj4UCwknO2ddmwM2eoPuxAlcSW7j65c7KVmKyZCWqTXIHKbGZEYyvkRU8vS077mIYhaqNrhKUhhvXpJn6ec-x55B1okiDVRnEphIZ2dlYGaL7Te0tNUdAnth2U-VhnV4LuSegdldXgCJ0vzciI9ummRYS_kfMbccOCAiMTA&type_route=efficient",
    "link_site_qualp_report": "https://qualp.com.br/relatorio-rota.php?data=bb8zUAufFEG1NIZtYB_q0j5oOqCoSNaBXDqzZ-pn26QAXqcb6Wt2dI4xi-86o_wbBh6La-7JeZRXu7BHUvc6aTqIAK7bILeCP3Ll3mQOvOB2rgVizBvdsjcFrdZhOUe8wajI-KJbexotUnDlQs_Y7GtXAhzVR2avD4kHX40uq_H6GzWMdGxL-FXFEQZLXjsMCFSbb8nY9tzSYZ6Qa8LbDudQfdutEtX2jAkWT5S2U1ckWzGSrLE6jBY4Y39CfmvqlwPF9KBsLCJvNI58GVQTdOrpbAi7DLTECtNZ4U8rrjU17BE4EzGQ1lAe70Nphd7xg0DJ4FxroZLkeyS3TN9fDtTVfJCWAhKyqQjkBrZld4E7l3X5F4x0bjobnY86x0B4fXy84tHBVZs4071M0VCnkbqU2Vx3ehu-FD1NW0xMBzgD-WJsWxedMtpLkHV9iRwGanxDiuRWNu1cxd4",
    "locais": [
        "Sorocaba",
        "Itu"
    ],
    "id_transacao": 148336375,
    "roteador_selecionado": "qualp",
    "calcular_volta": true,
    "otimizar_rota": false,
    "consumo_combustivel": 0,
    "meta_data": ""
}