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
    const remote = await fetchRemote('GET');
    if (Array.isArray(remote)) {
      return saveLocalFavorites(remote);
    }
    return loadLocalFavorites();
  }

  async function setFavorite(guid, add) {
    const remote = await fetchRemote(add ? 'POST' : 'DELETE', { guid });
    if (Array.isArray(remote)) {
      return saveLocalFavorites(remote);
    }

    const current = loadLocalFavorites();
    const index = current.indexOf(guid);
    if (add && index === -1) {
      current.push(guid);
    }
    if (!add && index !== -1) {
      current.splice(index, 1);
    }
    return saveLocalFavorites(current);
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