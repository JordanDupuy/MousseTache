const API_URL = 'http://localhost:3111';

export const api = {
  /**
   * Gère les erreurs de réponse
   */
  async handleResponse(response) {
    if (!response.ok) {
      const data = await response.json();
      const error = new Error(data.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return response.json();
  },

  // TASKS CRUD
  async fetchAll(filters = {}) {
    const params = new URLSearchParams();
    
    // Gestion de la recherche texte
    if (filters.q) {
      // À implémenter côté serveur si nécessaire
    }

    for (const key in filters) {
      if (filters[key] && key !== 'q') {
        params.append(key, filters[key]);
      }
    }

    const response = await fetch(`${API_URL}/tasks?${params.toString()}`);
    return this.handleResponse(response);
  },

  async getOne(id) {
    const response = await fetch(`${API_URL}/tasks/${id}`);
    return this.handleResponse(response);
  },

  async create(taskData) {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return this.handleResponse(response);
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  },

  // SUBTASKS
  async addSubtask(taskId, title) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre: title, statut: 'à faire' })
    });
    return this.handleResponse(response);
  },

  async deleteSubtask(taskId, subId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  },

  // COMMENTS
  async addComment(taskId, content) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenu: content })
    });
    return this.handleResponse(response);
  },

  async deleteComment(taskId, commentId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  },

  // STATS
  async getFullStats() {
    const response = await fetch(`${API_URL}/api/stats`);
    return this.handleResponse(response);
  },

  async getCompletionStats() {
    const response = await fetch(`${API_URL}/api/stats/completion`);
    return this.handleResponse(response);
  },

  async getDeadlineStats() {
    const response = await fetch(`${API_URL}/api/stats/deadlines`);
    return this.handleResponse(response);
  }
};