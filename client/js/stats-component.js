/**
 * Composant Statistiques pour MousseTache
 * Affiche le dashboard complet avec graphiques Chart.js
 * À intégrer dans app.js
 */

import { api } from './api.js';

const StatsComponent = {
  template: `
    <div class="stats-container">
      <div class="stats-header">
        <h2><i class="fas fa-chart-bar"></i> Statistiques & Analyzes</h2>
        <div class="stats-filters">
          <select v-model="dateFilter" @change="refreshStats" class="filter-select">
            <option value="all">Toute la période</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i> Chargement des statistiques...
      </div>

      <div v-else-if="dashboard" class="stats-grid">
        
        <!-- SECTION 1: Vue d'ensemble -->
        <section class="stats-section overview-section">
          <h3>Vue d'ensemble</h3>
          
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-number">{{ dashboard.overview.totalTasks }}</div>
              <div class="kpi-label">Tâches totales</div>
            </div>

            <div class="kpi-card highlight">
              <div class="kpi-number">{{ dashboard.overview.completionRate.percentage }}%</div>
              <div class="kpi-label">Taux de complétion</div>
              <div class="kpi-subtext">{{ dashboard.overview.completionRate.completed }} / {{ dashboard.overview.completionRate.total }}</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-number">{{ dashboard.overview.statutDistribution['en cours'] }}</div>
              <div class="kpi-label">En cours</div>
            </div>

            <div class="kpi-card danger">
              <div class="kpi-number">{{ dashboard.performance.deadlineAnalysis.overdue }}</div>
              <div class="kpi-label">Dépassées</div>
            </div>
          </div>
        </section>

        <!-- SECTION 2: Distribution par statut -->
        <section class="stats-section chart-section">
          <h3>Distribution par statut</h3>
          <canvas ref="chartStatut" class="chart-canvas"></canvas>
          <div class="chart-legend">
            <span><i class="fas fa-circle" style="color: #4CAF50;"></i> Terminée: {{ dashboard.overview.statutDistribution.terminée }}</span>
            <span><i class="fas fa-circle" style="color: #2196F3;"></i> En cours: {{ dashboard.overview.statutDistribution['en cours'] }}</span>
            <span><i class="fas fa-circle" style="color: #FF9800;"></i> À faire: {{ dashboard.overview.statutDistribution['à faire'] }}</span>
            <span><i class="fas fa-circle" style="color: #f44336;"></i> Annulée: {{ dashboard.overview.statutDistribution.annulée }}</span>
          </div>
        </section>

        <!-- SECTION 3: Distribution par priorité -->
        <section class="stats-section chart-section">
          <h3>Répartition par priorité</h3>
          <canvas ref="chartPriorite" class="chart-canvas"></canvas>
          <div class="chart-legend">
            <span><i class="fas fa-circle" style="color: #f44336;"></i> Critique: {{ dashboard.overview.prioriteDistribution.critique }}</span>
            <span><i class="fas fa-circle" style="color: #FF9800;"></i> Haute: {{ dashboard.overview.prioriteDistribution.haute }}</span>
            <span><i class="fas fa-circle" style="color: #FFC107;"></i> Moyenne: {{ dashboard.overview.prioriteDistribution.moyenne }}</span>
            <span><i class="fas fa-circle" style="color: #4CAF50;"></i> Basse: {{ dashboard.overview.prioriteDistribution.basse }}</span>
          </div>
        </section>

        <!-- SECTION 4: Taux de complétion par priorité -->
        <section class="stats-section chart-section full-width">
          <h3>Taux de complétion par priorité</h3>
          <canvas ref="chartCompletionByPriority" class="chart-canvas"></canvas>
        </section>

        <!-- SECTION 5: Productivité par semaine -->
        <section class="stats-section chart-section full-width">
          <h3>Productivité par semaine (12 dernières semaines)</h3>
          <canvas ref="chartProductivityWeek" class="chart-canvas"></canvas>
        </section>

        <!-- SECTION 6: Productivité par mois -->
        <section class="stats-section chart-section full-width">
          <h3>Productivité par mois (12 derniers mois)</h3>
          <canvas ref="chartProductivityMonth" class="chart-canvas"></canvas>
        </section>

        <!-- SECTION 7: Productivité par jour de la semaine -->
        <section class="stats-section chart-section full-width">
          <h3>Productivité par jour de la semaine</h3>
          <canvas ref="chartProductivityDay" class="chart-canvas"></canvas>
        </section>

        <!-- SECTION 8: Engagement -->
        <section class="stats-section">
          <h3><i class="fas fa-handshake"></i> Engagement</h3>
          
          <div class="engagement-grid">
            <div class="engagement-card">
              <h4>Sous-tâches</h4>
              <div class="stat-item">
                <span>Total:</span>
                <strong>{{ dashboard.engagement.subtasks.totalSubtasks }}</strong>
              </div>
              <div class="stat-item">
                <span>Complétées:</span>
                <strong>{{ dashboard.engagement.subtasks.completedSubtasks }} ({{ dashboard.engagement.subtasks.percentage }}%)</strong>
              </div>
              <div class="stat-item">
                <span>Moyenne par tâche:</span>
                <strong>{{ dashboard.engagement.subtasks.avgPerTask }}</strong>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: dashboard.engagement.subtasks.percentage + '%' }"></div>
              </div>
            </div>

            <div class="engagement-card">
              <h4>Commentaires</h4>
              <div class="stat-item">
                <span>Total:</span>
                <strong>{{ dashboard.engagement.comments.totalComments }}</strong>
              </div>
              <div class="stat-item">
                <span>Moyenne par tâche:</span>
                <strong>{{ dashboard.engagement.comments.avgPerTask }}</strong>
              </div>
              <div class="stat-item">
                <span>Tâches avec commentaires:</span>
                <strong>{{ dashboard.engagement.comments.tasksWithComments }}</strong>
              </div>
              <div v-if="dashboard.engagement.comments.mostCommented" class="stat-item">
                <span>Plus commentée:</span>
                <strong>{{ dashboard.engagement.comments.mostCommented.titre }}</strong>
                <small>({{ dashboard.engagement.comments.mostCommented.commentCount }} commentaires)</small>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 9: Échéances -->
        <section class="stats-section">
          <h3><i class="fas fa-calendar-exclamation"></i> Analyse des échéances</h3>
          
          <div class="deadline-grid">
            <div class="deadline-card overdue">
              <div class="deadline-number">{{ dashboard.performance.deadlineAnalysis.overdue }}</div>
              <div class="deadline-label">Tâches dépassées</div>
            </div>
            <div class="deadline-card upcoming">
              <div class="deadline-number">{{ dashboard.performance.deadlineAnalysis.upcoming }}</div>
              <div class="deadline-label">À venir (< 7 jours)</div>
            </div>
            <div class="deadline-card ontime">
              <div class="deadline-number">{{ dashboard.performance.deadlineAnalysis.onTime }}</div>
              <div class="deadline-label">À temps</div>
            </div>
          </div>

          <div v-if="dashboard.performance.deadlineAnalysis.overdueList.length > 0" class="overdue-list">
            <h4 style="color: #f44336;">Tâches dépassées</h4>
            <ul>
              <li v-for="task in dashboard.performance.deadlineAnalysis.overdueList" :key="task._id" class="overdue-item">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ task.titre }}</span>
                <small>Échéance: {{ formatDate(task.echeance) }}</small>
              </li>
            </ul>
          </div>
        </section>

      </div>

      <div v-else class="error-message">
        <p>Erreur lors du chargement des statistiques</p>
      </div>
    </div>
  `,

  data() {
    return {
      dashboard: null,
      loading: true,
      dateFilter: 'all',
      charts: {}, // Stockage des instances Chart.js
    };
  },

  methods: {
    async refreshStats() {
      this.loading = true;
      try {
        const result = await api.getFullStats();
        this.dashboard = result.data || result.dashboard || null;

        if (this.dashboard) {
          this.$nextTick(() => {
            this.initCharts();
          });
        }
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      } finally {
        this.loading = false;
      }
    },

    initCharts() {
      if (typeof Chart === 'undefined') {
        console.error('Chart.js non chargé');
        return;
      }

      // Détruire les anciens graphiques
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.destroy();
      });
      this.charts = {};

      setTimeout(() => {
        this.createStatutChart();
        this.createPrioriteChart();
        this.createCompletionByPriorityChart();
        this.createProductivityWeekChart();
        this.createProductivityMonthChart();
        this.createProductivityDayChart();
      }, 100);
    },

    createStatutChart() {
      const ctx = this.$refs.chartStatut?.getContext('2d');
      if (!ctx || typeof Chart === 'undefined') return;

      this.charts.statut = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Terminée', 'En cours', 'À faire', 'Annulée'],
          datasets: [{
            data: [
              this.dashboard.overview.statutDistribution.terminée,
              this.dashboard.overview.statutDistribution['en cours'],
              this.dashboard.overview.statutDistribution['à faire'],
              this.dashboard.overview.statutDistribution.annulée
            ],
            backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#f44336'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'right' }
          }
        }
      });
    },

    createPrioriteChart() {
      const ctx = this.$refs.chartPriorite?.getContext('2d');
      if (!ctx) return;

      this.charts.priorite = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Critique', 'Haute', 'Moyenne', 'Basse'],
          datasets: [{
            label: 'Nombre de tâches',
            data: [
              this.dashboard.overview.prioriteDistribution.critique,
              this.dashboard.overview.prioriteDistribution.haute,
              this.dashboard.overview.prioriteDistribution.moyenne,
              this.dashboard.overview.prioriteDistribution.basse
            ],
            backgroundColor: ['#f44336', '#FF9800', '#FFC107', '#4CAF50'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          scales: { x: { beginAtZero: true } }
        }
      });
    },

    createCompletionByPriorityChart() {
      const ctx = this.$refs.chartCompletionByPriority?.getContext('2d');
      if (!ctx) return;

      const data = this.dashboard.performance.completionByPriority;

      this.charts.completionByPriority = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Critique', 'Haute', 'Moyenne', 'Basse'],
          datasets: [{
            label: 'Taux de complétion (%)',
            data: [
              data.critique.percentage,
              data.haute.percentage,
              data.moyenne.percentage,
              data.basse.percentage
            ],
            backgroundColor: '#2196F3',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: { y: { max: 100, beginAtZero: true } }
        }
      });
    },

    createProductivityWeekChart() {
      const ctx = this.$refs.chartProductivityWeek?.getContext('2d');
      if (!ctx) return;

      const weeks = this.dashboard.trends.byWeek;

      this.charts.productivityWeek = new Chart(ctx, {
        type: 'line',
        data: {
          labels: weeks.map(w => w.week),
          datasets: [{
            label: 'Taux de complétion (%)',
            data: weeks.map(w => w.percentage),
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            fill: true,
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: { y: { max: 100, beginAtZero: true } }
        }
      });
    },

    createProductivityMonthChart() {
      const ctx = this.$refs.chartProductivityMonth?.getContext('2d');
      if (!ctx) return;

      const months = this.dashboard.trends.byMonth;

      this.charts.productivityMonth = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months.map(m => m.month),
          datasets: [{
            label: 'Taux de complétion (%)',
            data: months.map(m => m.percentage),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: { y: { max: 100, beginAtZero: true } }
        }
      });
    },

    createProductivityDayChart() {
      const ctx = this.$refs.chartProductivityDay?.getContext('2d');
      if (!ctx) return;

      const days = this.dashboard.trends.byDayOfWeek;

      this.charts.productivityDay = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: Object.keys(days).map(d => d.charAt(0).toUpperCase() + d.slice(1)),
          datasets: [{
            label: 'Taux de complétion (%)',
            data: Object.values(days).map(d => d.percentage),
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: { r: { max: 100, beginAtZero: true } }
        }
      });
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    },

    exportStats() {
      const data = JSON.stringify(this.dashboard, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stats-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  },

  mounted() {
    this.refreshStats();
  },

  beforeUnmount() {
    Object.values(this.charts).forEach(chart => chart.destroy());
  }
};

// Export pour utilisation dans app.js
export default StatsComponent;
