const API_URL = 'http://localhost:3111/tasks';

export const api = {
    // Récupérer tout avec filtres dynamiques
    async fetchAll(filters = {}) {
        const params = new URLSearchParams();
        // On nettoie les filtres vides
        for (const key in filters) {
            if (filters[key]) params.append(key, filters[key]);
        }
        const response = await fetch(`${API_URL}?${params.toString()}`);
        return response.json();
    },

    // Récupérer une seule tâche (pour être sûr d'avoir les détails à jour)
    async getOne(id) {
        const response = await fetch(`${API_URL}/${id}`);
        return response.json();
    },

    async create(taskData) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return response.json();
    },

    async update(id, data) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async delete(id) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    },

    // --- SOUS-TÂCHES  ---
    async addSubtask(taskId, title) {
        const response = await fetch(`${API_URL}/${taskId}/subtasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titre: title, statut: 'à faire' })
        });
        return response.json();
    },

    async deleteSubtask(taskId, subId) {
        const response = await fetch(`${API_URL}/${taskId}/subtasks/${subId}`, { method: 'DELETE' });
        return response.json();
    },

    // --- COMMENTAIRES  ---
    async addComment(taskId, content) {
        const response = await fetch(`${API_URL}/${taskId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contenu: content })
        });
        return response.json();
    },

    async deleteComment(taskId, commentId) {
        const response = await fetch(`${API_URL}/${taskId}/comments/${commentId}`, { method: 'DELETE' });
        return response.json();
    }
};