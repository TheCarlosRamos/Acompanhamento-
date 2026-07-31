# Painel-Projetos

## 📋 Descrição

Painel de visualização de projetos do Programa de Parcerias e Investimentos (PPI) do Governo Federal. Este projeto consiste em uma aplicação web para exibir informações detalhadas sobre projetos de infraestrutura em andamento no Brasil.

## 🏗️ Estrutura do Projeto

```
Painel-Projetos/
├── .github/                        # Configurações do GitHub Actions
│   └── workflows/
│       └── update_and_deploy.yml   # Workflow de automação (atualização + deploy)
├── page/                           # Aplicação web principal
│   ├── ppi_landing_site_v2/       # Site de visualização
│   │   ├── data/                  # Dados dos projetos
│   │   │   ├── projects_full.json # Base de dados gerada principal
│   │   │   └── metrics.json       # Métricas consolidadas
│   │   ├── index.html             # Página principal
│   │   └── assets/                # CSS, JS e imagens
│   └── ppi_landing_site_v2.pdf    # Versão PDF
├── scripts/                        # Scripts de processamento de dados
│   ├── update_data_from_excel.py  # Script principal de processamento do Excel
│   ├── api_automation_urls.py     # Script de referência da API
│   ├── project_info_api.py        # Coleta de informações básicas
│   ├── consolidate_project_data.py # Consolidação de dados
│   ├── update_all_complete.py     # Script unificado antigo da API
│   └── projects.csv               # Lista de projetos (GUIDs)
├── Planilha para SIEC 29_07_26.xlsx # Planilha principal de entrada (exemplo)
├── projects_full.xlsx              # Planilha complementar de coordenadas
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

#### ⚡ Fluxo Automático via GitHub Actions (Recomendado)

O projeto está configurado com uma Action no GitHub que automatiza todo o processo de processamento de dados e deploy na Vercel a cada push na branch `main`. **Você não precisa rodar scripts localmente**.

O fluxo recomendado é:

1. **Atualize a Planilha**: Substitua ou adicione um novo arquivo de planilha Excel na raiz do repositório. O nome deve seguir o padrão `Planilha para SIEC *.xlsx` (ex: `Planilha para SIEC 30_08_26.xlsx`). O script detectará automaticamente o arquivo mais recente.
2. **Preservação de Coordenadas**: Garanta que o arquivo `projects_full.xlsx` permaneça na raiz. O script o utilizará como planilha complementar para restaurar as coordenadas (latitude e longitude) dos projetos correspondentes.
3. **Commit e Push**: Envie a nova planilha para o GitHub:
   ```bash
   git add "Planilha para SIEC *.xlsx"
   git commit -m "update: adiciona nova planilha de projetos"
   git push origin main
   ```
4. **Execução Automática**:
   * A GitHub Action será disparada.
   * Ela executará o script de conversão (`scripts/update_data_from_excel.py`).
   * Se houver mudanças nos dados dos projetos, ela gerará os novos arquivos JSON (`page/ppi_landing_site_v2/data/projects_full.json`, `page/ppi_landing_site_v2/data/metrics.json` e `projetos_completos.json`) e os comitará de volta no repositório de forma automática.
   * **Deploy Automático**: A Vercel (conectada ao GitHub) detectará o novo commit dos dados gerados e iniciará o deploy do site atualizado imediatamente.

---

#### 💻 Fluxo Manual (Local)

Caso queira processar os dados e testar a aplicação localmente antes de enviar ao GitHub:

1. Coloque a planilha principal na raiz do projeto (ex: `Planilha para SIEC 29_07_26.xlsx`).
2. Execute o script de atualização:
   ```bash
   python scripts/update_data_from_excel.py
   ```
   * **Busca Dinâmica**: O script tenta ler o arquivo `Planilha para SIEC 29_07_26.xlsx`. Se ele não existir, o script busca automaticamente qualquer arquivo na raiz que case com o padrão `Planilha para SIEC *.xlsx` (usando o mais recente). Se não encontrar, busca qualquer outro arquivo `.xlsx` (exceto `projects_full.xlsx` e `Planilha Modelo setembro25.xlsx`).
   * **Coordenadas**: O script lê automaticamente o arquivo `projects_full.xlsx` na raiz como planilha complementar de coordenadas para preencher a latitude/longitude dos projetos.

O script atualiza os seguintes arquivos locais:
* `page/ppi_landing_site_v2/data/projects_full.json` (dados detalhados de cada projeto)
* `page/ppi_landing_site_v2/data/metrics.json` (estatísticas para o painel)
* `projetos_completos.json` (backup estruturado completo)

##### Parâmetros do Script (Opcional)

* Especificar outra planilha principal:
  ```bash
  python scripts/update_data_from_excel.py --excel "minha_planilha.xlsx" --sheet "NomeDaAba"
  ```
* Especificar outra planilha de coordenadas/complemento:
  ```bash
  python scripts/update_data_from_excel.py --complement "outro_complemento.xlsx"
  ```
* Ignorar o uso de planilha de coordenadas (não recomendado, remove as coordenadas do JSON):
  ```bash
  python scripts/update_data_from_excel.py --no-complement
  ```
* Evitar criação de backups locais (útil no CI/Actions):
  ```bash
  python scripts/update_data_from_excel.py --no-backup
  ```

---

#### 🌐 Atualizar pela API Antiga (SIF-Source)

Caso queira forçar a coleta direta da API antiga (278 projetos):
```bash
cd scripts
python update_all_complete.py
```
Este script lê os GUIDs de `projects.csv`, faz requisições paralelas à API externa, consolida as informações e atualiza `projects_full.json`.

---

### 2. Executar Aplicação Web Local

Para visualizar a aplicação e testar as mudanças localmente:
```bash
# Servir os arquivos estáticos
cd page/ppi_landing_site_v2
python -m http.server 8000
```
Acesse no navegador: `http://localhost:8000`

---

### 3. Deploy na Vercel

O deploy da aplicação web é realizado na Vercel de forma automática em **https://deploy-omega-five-39.vercel.app/**.
A configuração das rotas e caminhos estáticos da aplicação está descrita no arquivo `vercel.json` na raiz do projeto.


## 📊 Fonte de Dados

### 1. Planilha Principal (SIEC)
A principal fonte de dados é a planilha no formato `Planilha para SIEC *.xlsx` adicionada à raiz do projeto. O script de conversão mapeia dinamicamente os seguintes cabeçalhos principais:
- **Título**: `Empreendimento`, `nome_completo`, `título`, `Title`
- **Descrição**: `INFORMAÇÕES DO PROJETO`, `descrição curta`, `descricao_curta`
- **Setores**: `setor site`, `setor`, `Setores`
- **Subsetores**: `subsetor site`, `subsetor`, `Subsetores`
- **Organização**: `Secretaria SPPI`, `orgaos_envolvidos`
- **Custo capeado**: `CAPEX Estimados`, `custo_estimado`, `vl_estimadosdivulgados_potenciais`
- **Custo opex**: `OPEX Estimados`, `custo_original`, `numero_opex`
- **Status Geral**: `STATUS PROJETO`, `projeto_ativo`, `status_atividade`

### 2. Planilha de Coordenadas (Complemento)
O arquivo `projects_full.xlsx` funciona como base complementar permanente. O script faz o casamento dos projetos pelo nome e atualiza as chaves geográficas:
- `latitude` (ex: `-22.25`)
- `longitude` (ex: `-42.5`)

---

## 🚨 Considerações Importantes

### Processamento do Script
- O script `update_data_from_excel.py` realiza a limpeza de tags HTML das descrições para garantir uma exibição limpa no Painel.
- O backup dos arquivos locais é gerado com a extensão `.bak-[data-hora]` ao rodar localmente. No GitHub Actions, o parâmetro `--no-backup` é utilizado para manter o repositório enxuto.

---

## 📈 Estatísticas Atuais (Base de Dados)

Os dados gerados a partir da planilha mais recente possuem as seguintes métricas principais (consolidadas em `metrics.json`):
- **Total de projetos processados**: 804
- **Projetos geolocalizados (com coordenadas)**: 174
- **Setores Principais**: Energia, Transportes, Infraestrutura Urbana, Saneamento, Meio Ambiente, Turismo, Mineração, etc.
- **Responsáveis (Subsecretarias)**: SIEC, SEPPI, SIPE, etc.



