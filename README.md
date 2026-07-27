# Painel-Projetos

## 📋 Descrição

Painel de visualização de projetos do Programa de Parcerias e Investimentos (PPI) do Governo Federal. Este projeto consiste em uma aplicação web para exibir informações detalhadas sobre projetos de infraestrutura em andamento no Brasil.

## 🏗️ Estrutura do Projeto

```
Painel-Projetos/
├── page/                           # Aplicação web principal
│   ├── ppi_landing_site_v2/       # Site de visualização
│   │   ├── data/                  # Dados dos projetos
│   │   │   └── projects_full.json # Base de dados principal
│   │   ├── index.html             # Página principal
│   │   └── assets/                # CSS, JS e imagens
│   └── ppi_landing_site_v2.pdf    # Versão PDF
├── scripts/                        # Scripts de processamento de dados
│   ├── api_automation_urls.py     # Script de referência da API
│   ├── project_info_api.py        # Coleta de informações básicas
│   ├── consolidate_project_data.py # Consolidação de dados
│   ├── update_all_complete.py     # Script unificado principal
│   ├── projects.csv               # Lista de todos os projetos (278 GUIDs)
│   ├── project_guids.csv          # Lista reduzida (3 GUIDs)
│   └── project_info_responses/    # Respostas da API
├── mapas/                         # Arquivos de mapas
├── Qcode/                         # Notebooks e análises
└── README.md                      # Este arquivo
```

## 🚀 Funcionalidades

### Aplicação Web
- **Visualização interativa** de projetos de infraestrutura
- **Filtros** por setor, subsetor, organização e status
- **Mapas interativos** com localização dos projetos
- **Timeline** de status dos projetos
- **Cards detalhados** com informações completas

### Scripts de Processamento
- **Coleta automática** de dados da API SIF-Source
- **Processamento paralelo** para otimização de performance
- **Consolidação** de múltiplas fontes de dados
- **Atualização automática** do `projects_full.json`

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** e **CSS3**
- **JavaScript** vanilla
- **Bootstrap** para UI responsiva
- **Chart.js** para gráficos
- **Leaflet** para mapas interativos

### Backend/Scripts
- **Python 3.8+**
- **Requests** para chamadas HTTP
- **Pandas** para manipulação de dados
- **JSON** para armazenamento de dados

## 📦 Instalação e Configuração

### Pré-requisitos
```bash
# Python 3.8+
python --version

# Instalar dependências
pip install requests pandas
```

## 🔄 Como Usar

### 1. Atualizar Dados dos Projetos

#### Atualizar pela planilha Excel da raiz

A aplicação pode ser atualizada mantendo a planilha Excel na raiz do repositório. O fluxo esperado é:

1. Substitua ou atualize o arquivo `Planilha Modelo setembro25.xlsx` na raiz.
2. Mantenha a estrutura de colunas da planilha.
3. Rode:

```bash
python scripts/update_data_from_excel.py
```

O script lê a aba `Planilha` por padrão, aceita tanto os cabeçalhos com os códigos `2000720`, `2000726`, `2000727`, `2000728`, `2001218`, `2001221`, `2001224`, `2001226`, `2001229`, `2001230`, `2001232` quanto os nomes equivalentes da planilha atual, e atualiza:

- `page/ppi_landing_site_v2/data/projects_full.json`
- `page/ppi_landing_site_v2/data/metrics.json`
- `projetos_completos.json`

Durante a conversão, o script também limpa HTML dos campos de descrição e textos longos, removendo tags como `<ul>`, `<li>`, `<p>` e convertendo listas para texto legível.

Se existir `projects_full.xlsx` na raiz, ela será usada automaticamente como planilha complementar para atualizar estes campos quando houver correspondência pelo nome do projeto:

- `Situação Atual` recebe `Status Atual do Projeto`
- `Próximos Passos` recebe `Próximas Etapas`
- `Pontos de Atenção` recebe `Questões Chaves`
- `Localização no mapa` recebe `Latitude` e `Longitude`

Os HTMLs continuam consumindo `projects_full.json` e `metrics.json`; por isso não é necessário alterar o frontend a cada nova planilha.

Se a planilha tiver outro nome ou outra aba:

```bash
python scripts/update_data_from_excel.py --excel "minha_planilha.xlsx" --sheet "Planilha"
```

Para informar outra planilha complementar:

```bash
python scripts/update_data_from_excel.py --complement "projects_full.xlsx"
```

Para ignorar a planilha complementar:

```bash
python scripts/update_data_from_excel.py --no-complement
```

#### Atualizar pela API antiga

Para atualizar todos os projetos pela coleta da API (278 projetos):
```bash
cd scripts
python update_all_complete.py
```

Este script:
- Lê todos os GUIDs do `projects.csv`
- Faz chamadas à API em paralelo
- Consolida os dados
- Atualiza o `projects_full.json`

### 2. Executar Aplicação Web Local

```bash
# Servir os arquivos estáticos
cd page/ppi_landing_site_v2
python -m http.server 8000
```

Acesse: `http://localhost:8000`

### 3. Deploy

O projeto está configurado para deploy na Vercel através do `vercel.json`.

## 📊 Fonte de Dados

### API Principal
- **URL Base**: `https://api.sif-source.org`
- **Endpoint Projects**: `/projects`
- **Endpoint Questions**: `/projects/{guid}/questions/{question_id}`

### Estrutura dos Dados
```json
{
  "guid": "uuid",
  "nome_projeto": "string",
  "descricao_curta": "string",
  "setor": "string",
  "subsetor": "string",
  "organizacao": "string",
  "localizacoes": "string",
  "latitude": number,
  "longitude": number,
  "status_atual_do_projeto": "string",
  "questoes_chaves": "string",
  "status_dos_estudos": "string",
  "status_consulta_publica": "string",
  "status_do_tcu": "string",
  "status_do_edital": "string",
  "status_do_leilao": "string",
  "status_do_contrato": "string"
}
```

## 🚨 Considerações Importantes

### Segurança
- As credenciais da API estão hardcoded nos scripts
- Recomenda-se mover para variáveis de ambiente
- Considerar uso de `.env` file

### Performance
- Processamento paralelo com `ThreadPoolExecutor`
- Timeout configurado para chamadas API
- Tratamento de erros 500 da API


## 📈 Estatísticas Atuais

- **Total de projetos**: 278
- **Setores**: Transport, Energy, Urban Services, Water & Waste
- **Organizações**: SEPPI, SIEC, SIPE
- **Status**: Multiple (Completed, Not Started, Scheduled, etc.)


