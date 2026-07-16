<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$projects = null;

// Try env var PROJECTS_DATA_FILE first
$projectsDataFile = getenv('PROJECTS_DATA_FILE');
if ($projectsDataFile !== false && $projectsDataFile !== '') {
    if (file_exists($projectsDataFile)) {
        $content = file_get_contents($projectsDataFile);
        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            $projects = $decoded;
        }
    }
}

// Try env var PROJECTS_DATA_URL
if (!is_array($projects)) {
    $projectsDataUrl = getenv('PROJECTS_DATA_URL');
    if ($projectsDataUrl !== false && $projectsDataUrl !== '') {
        $content = @file_get_contents($projectsDataUrl);
        if ($content !== false) {
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $projects = $decoded;
            }
        }
    }
}

// Fallback: read from the data directory relative to this file (navegate from api/ to page/ppi_landing_site_v2/data/)
if (!is_array($projects)) {
    $dataDir = realpath(__DIR__ . '/../page/ppi_landing_site_v2/data');
    if ($dataDir === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Diretório de dados não encontrado.']);
        exit;
    }

    $projectsFile = $dataDir . '/projects_full.json';
    if (!file_exists($projectsFile)) {
        http_response_code(500);
        echo json_encode(['error' => 'Arquivo de projetos não encontrado em: ' . $projectsFile]);
        exit;
    }

    $content = file_get_contents($projectsFile);
    $projects = json_decode($content, true);
    if (!is_array($projects)) {
        http_response_code(500);
        echo json_encode(['error' => 'Conteúdo de projetos inválido.']);
        exit;
    }
}

// Suporte a filtros simples por query string
$q = isset($_GET['q']) ? mb_strtolower(trim($_GET['q']), 'UTF-8') : '';
$subsetor = isset($_GET['subsetor']) ? trim($_GET['subsetor']) : '';
$subsecretaria = isset($_GET['subsecretaria']) ? trim($_GET['subsecretaria']) : '';
$etapa = isset($_GET['etapa']) ? trim($_GET['etapa']) : '';

if ($q !== '' || $subsetor !== '' || $subsecretaria !== '' || $etapa !== '') {
    $projects = array_values(array_filter($projects, function ($p) use ($q, $subsetor, $subsecretaria, $etapa) {
        if ($q !== '') {
            $haystack = mb_strtolower(
                ((string)($p['nome_completo'] ?? '')) . ' ' .
                ((string)($p['descricao_do_projeto'] ?? '')) . ' ' .
                ((string)($p['localizacoes'] ?? '')),
                'UTF-8'
            );
            if (mb_strpos($haystack, $q, 0, 'UTF-8') === false) {
                return false;
            }
        }
        if ($subsetor !== '' && isset($p['subsetor']) && $p['subsetor'] !== $subsetor) {
            return false;
        }
        if ($subsecretaria !== '' && isset($p['subsecretaria']) && $p['subsecretaria'] !== $subsecretaria) {
            return false;
        }
        if ($etapa !== '') {
            $phaseCols = [
                ['Estudos','status_dos_estudos'],
                ['Consulta Pública','status_consulta_publica'],
                ['TCU','status_do_tcu'],
                ['Edital','status_do_edital'],
                ['Leilão','status_do_leilao'],
                ['Contrato','status_do_contrato']
            ];
            $last = -1;
            foreach ($phaseCols as $i => $phase) {
                $value = mb_strtolower((string)($p[$phase[1]] ?? ''), 'UTF-8');
                if (mb_strpos($value, 'conclu', 0, 'UTF-8') !== false || mb_strpos($value, 'completed', 0, 'UTF-8') !== false || mb_strpos($value, 'assinado', 0, 'UTF-8') !== false || mb_strpos($value, 'assinatura', 0, 'UTF-8') !== false) {
                    $last = $i;
                }
            }
            $label = $last < 0 ? 'Nenhuma' : $phaseCols[$last][0];
            if ($label !== $etapa) {
                return false;
            }
        }
        return true;
    }));
}

echo json_encode($projects, JSON_UNESCAPED_UNICODE);