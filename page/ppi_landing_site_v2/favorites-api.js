(function() {
  const API_URL = '/api/favorites';
  const STORAGE_KEY = 'favorites';

  function loadLocalFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || '[]';
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveLocalFavorites(favorites) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.warn('Não foi possível salvar favoritos localmente:', err.message);
    }
    return favorites;
  }

  async function fetchRemote(method, body) {
    try {
      const response = await fetch(API_URL, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error || response.statusText || 'Erro na API de favoritos');
      }
      const data = await response.json();
      return Array.isArray(data.favorites) ? data.favorites : null;
    } catch (err) {
      console.warn('favorites-api:', err.message);
      return null;
    }
  }

  async function loadFavorites() {
    const local = loadLocalFavorites();
    const remote = await fetchRemote('GET');
    if (Array.isArray(remote)) {
      // O fallback de arquivo do ambiente serverless não é persistente. Mantemos os
      // favoritos do navegador e incorporamos os que eventualmente vierem do servidor.
      return saveLocalFavorites([...new Set([...local, ...remote])]);
    }
    return local;
  }

  async function setFavorite(guid, add) {
    const current = loadLocalFavorites();
    const updated = add
      ? [...new Set([...current, guid])]
      : current.filter(item => item !== guid);

    // Atualiza imediatamente no navegador, para que vários cliques em corações
    // sejam preservados mesmo quando o armazenamento remoto não estiver configurado.
    saveLocalFavorites(updated);

    const remote = await fetchRemote(add ? 'POST' : 'DELETE', { guid });
    if (Array.isArray(remote)) {
      const merged = [...new Set([...updated, ...remote])];
      return saveLocalFavorites(add ? merged : merged.filter(item => item !== guid));
    }
    return updated;
  }

  async function clearFavorites() {
    const remote = await fetchRemote('DELETE');
    if (Array.isArray(remote)) {
      return saveLocalFavorites(remote);
    }
    return saveLocalFavorites([]);
  }

  window.favoritesApi = {
    loadFavorites,
    setFavorite,
    clearFavorites,
    loadLocalFavorites,
  };
})();
