const REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;
const FAVORITES_KEY = 'ppi_favorites';

const fs = require('fs');
const path = require('path');

const USE_REDIS = Boolean(REDIS_REST_URL && REDIS_REST_TOKEN);
const DATA_DIR = path.join(process.cwd(), 'data');
const FALLBACK_FILE = path.join(DATA_DIR, 'favorites.json');

async function sendRedisCommand(command) {
  if (!REDIS_REST_URL || !REDIS_REST_TOKEN) {
    throw new Error(
      'Faltam variáveis de ambiente para o Redis. Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN ou REDIS_REST_URL e REDIS_REST_TOKEN.'
    );
  }

  const response = await fetch(REDIS_REST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${REDIS_REST_TOKEN}`
    },
    body: JSON.stringify({ command })
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || data?.error || response.statusText;
    throw new Error(`Redis command failed: ${message}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

function readFavoritesFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FALLBACK_FILE)) {
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify([]), 'utf8');
      return [];
    }
    const content = fs.readFileSync(FALLBACK_FILE, 'utf8');
    const arr = JSON.parse(content || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error('Erro ao ler arquivo de favoritos:', err);
    return [];
  }
}

function writeFavoritesFile(arr) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro ao gravar arquivo de favoritos:', err);
  }
}

async function getFavorites() {
  if (USE_REDIS) {
    const data = await sendRedisCommand(['SMEMBERS', FAVORITES_KEY]);
    return Array.isArray(data.result) ? data.result : [];
  }
  return readFavoritesFile();
}

async function addFavorite(guid) {
  if (USE_REDIS) {
    await sendRedisCommand(['SADD', FAVORITES_KEY, guid]);
    return getFavorites();
  }
  const arr = readFavoritesFile();
  if (!arr.includes(guid)) arr.push(guid);
  writeFavoritesFile(arr);
  return arr;
}

async function removeFavorite(guid) {
  if (USE_REDIS) {
    await sendRedisCommand(['SREM', FAVORITES_KEY, guid]);
    return getFavorites();
  }
  const arr = readFavoritesFile().filter((g) => g !== guid);
  writeFavoritesFile(arr);
  return arr;
}

async function clearFavorites() {
  if (USE_REDIS) {
    await sendRedisCommand(['DEL', FAVORITES_KEY]);
    return [];
  }
  writeFavoritesFile([]);
  return [];
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    if (req.method === 'GET') {
      const favorites = await getFavorites();
      return res.status(200).json({ favorites });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const guid = body?.guid;

    if (req.method === 'POST') {
      if (!guid) {
        return res.status(400).json({ error: 'O campo guid é obrigatório.' });
      }
      const favorites = await addFavorite(guid);
      return res.status(200).json({ favorites });
    }

    if (req.method === 'DELETE') {
      if (!guid) {
        const favorites = await clearFavorites();
        return res.status(200).json({ favorites });
      }
      const favorites = await removeFavorite(guid);
      return res.status(200).json({ favorites });
    }

    res.setHeader('Allow', 'GET,POST,DELETE,OPTIONS');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor.' });
  }
};