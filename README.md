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


