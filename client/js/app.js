import { api } from './api.js';
import StatsComponent from './stats-component.js';

const { createApp } = Vue;

createApp({
    components: {
        StatsComponent  // ✅ Ajouter le composant stats
    },
    data() {
        return {
            tasks: [],
            activeTab: 'tasks',
            // Filtres liés aux <select> du HTML
            filters: {
                q: '',       // Recherche texte [cite: 40]
                statut: '',  // 
                priorite: '',
                sort: 'dateCreation' // [cite: 44]
            },
            // Données pour la création
            newTask: {
                titre: '',
                priorite: 'moyenne'
            },
            // Gestion de la modale
            isModalOpen: false,
            currentTask: {}, // La tâche en cours d'édition
            // Champs temporaires pour les ajouts dans la modale
            newSubtaskText: '',
            newCommentText: ''
        };
    },
    methods: {
        // Charger les tâches depuis le serveur
        async fetchTasks() {
            try {
                const result = await api.fetchAll(this.filters);
                this.tasks = result.data || [];
            } catch (e) {
                console.error("Erreur connexion API:", e);
            }
        },

        // Créer une nouvelle tâche
        async createTask() {
            if (!this.newTask.titre) return;
            await api.create(this.newTask);
            this.newTask.titre = ''; // Reset du champ
            this.fetchTasks(); // Rafraîchir la liste
        },

        // Supprimer une tâche
        async deleteTask(id) {
            if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
                await api.delete(id);
                this.fetchTasks();
            }
        },

        // --- GESTION DE LA MODALE ---
        
        async openModal(task) {
            // On recharge la tâche pour avoir les sous-tâches/commentaires à jour
            const result = await api.getOne(task._id);
            this.currentTask = result.data || result;
            
            // Petit hack pour gérer la date dans l'input type="date"
            if (this.currentTask.echeance) {
                this.currentTask.echeanceDateOnly = this.currentTask.echeance.split('T')[0];
            }
            
            this.isModalOpen = true;
        },

        closeModal() {
            this.isModalOpen = false;
            this.currentTask = {};
            this.fetchTasks(); // On rafraîchit la grille en sortant
        },

        async saveChanges() {
            // On reconstruit l'objet date si modifié
            if (this.currentTask.echeanceDateOnly) {
                this.currentTask.echeance = new Date(this.currentTask.echeanceDateOnly);
            }
            
            await api.update(this.currentTask._id, {
                titre: this.currentTask.titre,
                description: this.currentTask.description,
                statut: this.currentTask.statut,
                priorite: this.currentTask.priorite,
                echeance: this.currentTask.echeance
            });
            this.closeModal();
        },

        // --- SOUS-TÂCHES & COMMENTAIRES (Direct Update) ---
        
        async addSubtask() {
            if (!this.newSubtaskText) return;
            // L'API renvoie la tâche mise à jour
            const result = await api.addSubtask(this.currentTask._id, this.newSubtaskText);
            const updated = result.data || result;
            this.currentTask.sousTaches = updated.sousTaches;
            this.newSubtaskText = '';
        },

        async deleteSubtask(subId) {
            const result = await api.deleteSubtask(this.currentTask._id, subId);
            const updated = result.data || result;
            this.currentTask.sousTaches = updated.sousTaches;
        },

        async addComment() {
            if (!this.newCommentText) return;
            const result = await api.addComment(this.currentTask._id, this.newCommentText);
            const updated = result.data || result;
            this.currentTask.commentaires = updated.commentaires;
            this.newCommentText = '';
        },

        async deleteComment(commentId) {
            const result = await api.deleteComment(this.currentTask._id, commentId);
            const updated = result.data || result;
            this.currentTask.commentaires = updated.commentaires;
        },

        // Utilitaire pour affichage date
        formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString();
        },

        switchTab(tab) {
            this.activeTab = tab;
        }
    },
    mounted() {
        // Au chargement de la page
        this.fetchTasks();
    }
}).mount('#app');