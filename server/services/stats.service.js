/**
 * Service de statistiques pour MousseTache
 * Centralise tous les calculs de stats avec JSDoc
 */

class StatsService {
  /**
   * Calcule le taux de complétion global
   * @param {Array} tasks - Liste de toutes les tâches
   * @returns {Object} { completed: nombre, total: nombre, percentage: % }
   */
  static calculateCompletionRate(tasks) {
    const completed = tasks.filter(t => t.statut === 'terminée').length;
    const total = tasks.length;
    return {
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }

  /**
   * Analyse les tâches par statut
   * @param {Array} tasks
   * @returns {Object} { à faire, en cours, terminée, annulée }
   */
  static getStatutDistribution(tasks) {
    const distribution = {
      'à faire': 0,
      'en cours': 0,
      'terminée': 0,
      'annulée': 0,
    };

    tasks.forEach(task => {
      distribution[task.statut]++;
    });

    return distribution;
  }

  /**
   * Analyse les tâches par priorité
   * @param {Array} tasks
   * @returns {Object} { critique, haute, moyenne, basse }
   */
  static getPrioriteDistribution(tasks) {
    const distribution = {
      'critique': 0,
      'haute': 0,
      'moyenne': 0,
      'basse': 0,
    };

    tasks.forEach(task => {
      distribution[task.priorite]++;
    });

    return distribution;
  }

  /**
   * Calcule le taux de complétion par priorité
   * @param {Array} tasks
   * @returns {Object} { critique: %, haute: %, moyenne: %, basse: % }
   */
  static getCompletionByPriority(tasks) {
    const priorities = ['critique', 'haute', 'moyenne', 'basse'];
    const result = {};

    priorities.forEach(priority => {
      const tasksByPriority = tasks.filter(t => t.priorite === priority);
      const completed = tasksByPriority.filter(t => t.statut === 'terminée').length;
      const total = tasksByPriority.length;

      result[priority] = {
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    });

    return result;
  }

  /**
   * Compte les tâches dépassant l'échéance
   * @param {Array} tasks
   * @returns {Object} { overdue: nombre, upcoming: nombre, onTime: nombre }
   */
  static getDeadlineAnalysis(tasks) {
    const now = new Date();
    const overdue = [];
    const upcoming = [];
    const onTime = [];

    tasks.forEach(task => {
      if (!task.echeance) return;

      const deadline = new Date(task.echeance);
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      if (task.statut === 'terminée') {
        onTime.push(task);
      } else if (daysUntil < 0) {
        overdue.push(task);
      } else if (daysUntil <= 7) {
        upcoming.push(task);
      }
    });

    return {
      overdue: overdue.length,
      upcoming: upcoming.length,
      onTime: onTime.length,
      overdueList: overdue,
      upcomingList: upcoming,
    };
  }

  /**
   * Calcule la productivité par jour de la semaine
   * @param {Array} tasks
   * @returns {Object} { lundi: %, mardi: %, ... }
   */
  static getProductivityByDayOfWeek(tasks) {
    const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const result = {};

    daysOfWeek.forEach((day, index) => {
      const tasksOnDay = tasks.filter(t => {
        const date = new Date(t.dateCreation);
        return date.getDay() === (index + 1) % 7;
      });

      const completed = tasksOnDay.filter(t => t.statut === 'terminée').length;
      const total = tasksOnDay.length;

      result[day] = {
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    });

    return result;
  }

  /**
   * Calcule la productivité par semaine (dernières 12 semaines)
   * @param {Array} tasks
   * @returns {Array} Array de 12 objets { week, completed, total, percentage }
   */
  static getProductivityByWeek(tasks) {
    const weeks = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - i * 7);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const tasksInWeek = tasks.filter(t => {
        const taskDate = new Date(t.dateCreation);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const completed = tasksInWeek.filter(t => t.statut === 'terminée').length;
      const total = tasksInWeek.length;

      weeks.push({
        week: `${weekStart.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}`,
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
        startDate: weekStart.toISOString().split('T')[0],
      });
    }

    return weeks;
  }

  /**
   * Calcule la productivité par mois (12 derniers mois)
   * @param {Array} tasks
   * @returns {Array} Array de 12 objets { month, completed, total, percentage }
   */
  static getProductivityByMonth(tasks) {
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const tasksInMonth = tasks.filter(t => {
        const taskDate = new Date(t.dateCreation);
        return taskDate >= monthDate && taskDate <= monthEnd;
      });

      const completed = tasksInMonth.filter(t => t.statut === 'terminée').length;
      const total = tasksInMonth.length;

      months.push({
        month: monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      });
    }

    return months;
  }

  /**
   * Analyse les sous-tâches
   * @param {Array} tasks
   * @returns {Object} { totalSubtasks, completedSubtasks, percentage, avgPerTask }
   */
  static getSubtaskAnalysis(tasks) {
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    tasks.forEach(task => {
      if (task.sousTaches && task.sousTaches.length > 0) {
        totalSubtasks += task.sousTaches.length;
        completedSubtasks += task.sousTaches.filter(st => st.statut === 'terminée').length;
      }
    });

    const tasksWithSubtasks = tasks.filter(t => t.sousTaches && t.sousTaches.length > 0).length;

    return {
      totalSubtasks,
      completedSubtasks,
      percentage: totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100),
      avgPerTask: tasksWithSubtasks === 0 ? 0 : (totalSubtasks / tasksWithSubtasks).toFixed(2),
      tasksWithSubtasks,
    };
  }

  /**
   * Analyse les commentaires
   * @param {Array} tasks
   * @returns {Object} { totalComments, avgPerTask, tasksWithComments, mostCommented }
   */
  static getCommentAnalysis(tasks) {
    let totalComments = 0;
    let tasksWithComments = 0;
    let mostCommented = null;
    let maxComments = 0;

    tasks.forEach(task => {
      if (task.commentaires && task.commentaires.length > 0) {
        totalComments += task.commentaires.length;
        tasksWithComments++;

        if (task.commentaires.length > maxComments) {
          maxComments = task.commentaires.length;
          mostCommented = {
            titre: task.titre,
            commentCount: task.commentaires.length,
          };
        }
      }
    });

    return {
      totalComments,
      avgPerTask: tasks.length === 0 ? 0 : (totalComments / tasks.length).toFixed(2),
      tasksWithComments,
      mostCommented,
    };
  }

  /**
   * Identifie les catégories/étiquettes les plus utilisées
   * @param {Array} tasks
   * @returns {Object} { categories: [], tags: [] }
   */
  static getMostUsedTagsAndCategories(tasks) {
    const tagCount = {};
    const categoryCount = {};

    tasks.forEach(task => {
      if (task.categorie) {
        categoryCount[task.categorie] = (categoryCount[task.categorie] || 0) + 1;
      }

      if (task.etiquettes && Array.isArray(task.etiquettes)) {
        task.etiquettes.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    const categories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const tags = Object.entries(tagCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { categories, tags };
  }

  /**
   * Génère un dashboard complet avec tous les stats
   * @param {Array} tasks
   * @returns {Object} Dashboard complet
   */
  static generateFullDashboard(tasks) {
    return {
      overview: {
        totalTasks: tasks.length,
        completionRate: this.calculateCompletionRate(tasks),
        statutDistribution: this.getStatutDistribution(tasks),
        prioriteDistribution: this.getPrioriteDistribution(tasks),
      },
      performance: {
        completionByPriority: this.getCompletionByPriority(tasks),
        deadlineAnalysis: this.getDeadlineAnalysis(tasks),
      },
      trends: {
        byDayOfWeek: this.getProductivityByDayOfWeek(tasks),
        byWeek: this.getProductivityByWeek(tasks),
        byMonth: this.getProductivityByMonth(tasks),
      },
      engagement: {
        subtasks: this.getSubtaskAnalysis(tasks),
        comments: this.getCommentAnalysis(tasks),
      },
      metadata: {
        tagsAndCategories: this.getMostUsedTagsAndCategories(tasks),
      },
      generatedAt: new Date().toISOString(),
    };
  }
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StatsService;
}

// Export pour ES modules (navigateur)
if (typeof window !== 'undefined') {
  window.StatsService = StatsService;
}
