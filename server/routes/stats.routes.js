/**
 * Route statistiques pour MousseTache
 * GET /api/stats - Récupère le dashboard complet
 * GET /api/stats/:type - Récupère des stats spécifiques
 */

const express = require('express');
const router = express.Router();
const { Task } = require('../models/mongoose');

// Importer le service de stats
const StatsService = require('../services/stats.service');

/**
 * Middleware d'erreur centralisé pour les routes stats
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ---------------------------------------------------------
// GET /stats — Dashboard complet
// ---------------------------------------------------------
/**
 * Récupère tous les statistiques compilées
 * Query params:
 * - ?from=2024-01-01&to=2024-12-31 (optionnel: filtrer par date)
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const { from, to } = req.query;
    let filter = {};

    // Filtre par date de création si fourni
    if (from || to) {
      filter.dateCreation = {};
      if (from) filter.dateCreation.$gte = new Date(from);
      if (to) filter.dateCreation.$lte = new Date(to);
    }

    const tasks = await Task.find(filter);

    if (!tasks || tasks.length === 0) {
      return res.json({
        success: true,
        data: {
          overview: {
            totalTasks: 0,
            completionRate: { completed: 0, total: 0, percentage: 0 },
            statutDistribution: { 'à faire': 0, 'en cours': 0, 'terminée': 0, 'annulée': 0 },
            prioriteDistribution: { 'critique': 0, 'haute': 0, 'moyenne': 0, 'basse': 0 },
          },
          performance: {
            completionByPriority: StatsService.getCompletionByPriority([]),
            deadlineAnalysis: {
              overdue: 0,
              upcoming: 0,
              onTime: 0,
              overdueList: [],
              upcomingList: []
            }
          },
          trends: {
            byDayOfWeek: StatsService.getProductivityByDayOfWeek([]),
            byWeek: StatsService.getProductivityByWeek([]),
            byMonth: StatsService.getProductivityByMonth([]),
          },
          engagement: {
            subtasks: StatsService.getSubtaskAnalysis([]),
            comments: StatsService.getCommentAnalysis([]),
          },
          metadata: {
            tagsAndCategories: StatsService.getMostUsedTagsAndCategories([]),
          }
        }
      });
    }

    const dashboard = StatsService.generateFullDashboard(tasks);

    res.json({
      success: true,
      data: dashboard,
      requestedFilters: filter,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'STATS_GENERATION_ERROR'
    });
  }
}));

// ---------------------------------------------------------
// GET /stats/overview — Vue d'ensemble rapide
// ---------------------------------------------------------
router.get('/overview', asyncHandler(async (req, res) => {
  const tasks = await Task.find();

  const overview = {
    totalTasks: tasks.length,
    completionRate: StatsService.calculateCompletionRate(tasks),
    statutDistribution: StatsService.getStatutDistribution(tasks),
    prioriteDistribution: StatsService.getPrioriteDistribution(tasks),
  };

  res.json({ success: true, data: overview });
}));

// ---------------------------------------------------------
// GET /stats/completion — Taux de complétion détaillé
// ---------------------------------------------------------
router.get('/completion', asyncHandler(async (req, res) => {
  const tasks = await Task.find();

  const data = {
    overall: StatsService.calculateCompletionRate(tasks),
    byPriority: StatsService.getCompletionByPriority(tasks),
    byWeek: StatsService.getProductivityByWeek(tasks),
    byMonth: StatsService.getProductivityByMonth(tasks),
  };

  res.json({ success: true, data });
}));

// ---------------------------------------------------------
// GET /stats/deadlines — Analyse des échéances
// ---------------------------------------------------------
router.get('/deadlines', asyncHandler(async (req, res) => {
  const tasks = await Task.find();
  const deadlineAnalysis = StatsService.getDeadlineAnalysis(tasks);

  res.json({ success: true, data: deadlineAnalysis });
}));

// ---------------------------------------------------------
// GET /stats/productivity — Productivité par période
// ---------------------------------------------------------
router.get('/productivity', asyncHandler(async (req, res) => {
  const tasks = await Task.find();

  const data = {
    byDayOfWeek: StatsService.getProductivityByDayOfWeek(tasks),
    byWeek: StatsService.getProductivityByWeek(tasks),
    byMonth: StatsService.getProductivityByMonth(tasks),
  };

  res.json({ success: true, data });
}));

// ---------------------------------------------------------
// GET /stats/engagement — Engagement (sous-tâches, commentaires)
// ---------------------------------------------------------
router.get('/engagement', asyncHandler(async (req, res) => {
  const tasks = await Task.find();

  const data = {
    subtasks: StatsService.getSubtaskAnalysis(tasks),
    comments: StatsService.getCommentAnalysis(tasks),
  };

  res.json({ success: true, data });
}));

// ---------------------------------------------------------
// GET /stats/metadata — Tags et catégories
// ---------------------------------------------------------
router.get('/metadata', asyncHandler(async (req, res) => {
  const tasks = await Task.find();
  const metadata = StatsService.getMostUsedTagsAndCategories(tasks);

  res.json({ success: true, data: metadata });
}));

// ---------------------------------------------------------
// GET /stats/priority/:level — Stats pour une priorité spécifique
// ---------------------------------------------------------
router.get('/priority/:level', asyncHandler(async (req, res) => {
  const validPriorities = ['critique', 'haute', 'moyenne', 'basse'];
  const { level } = req.params;

  if (!validPriorities.includes(level)) {
    return res.status(400).json({
      success: false,
      error: `Priorité invalide. Doit être: ${validPriorities.join(', ')}`
    });
  }

  const tasks = await Task.find({ priorite: level });
  const completionByPriority = StatsService.getCompletionByPriority(
    await Task.find()
  );

  res.json({
    success: true,
    data: {
      priority: level,
      taskCount: tasks.length,
      stats: completionByPriority[level],
      tasks: tasks.map(t => ({
        _id: t._id,
        titre: t.titre,
        statut: t.statut,
        dateCreation: t.dateCreation
      }))
    }
  });
}));

// ---------------------------------------------------------
// GET /stats/status/:status — Stats pour un statut spécifique
// ---------------------------------------------------------
router.get('/status/:status', asyncHandler(async (req, res) => {
  const validStatuses = ['à faire', 'en cours', 'terminée', 'annulée'];
  const { status } = req.params;

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Statut invalide. Doit être: ${validStatuses.join(', ')}`
    });
  }

  const tasks = await Task.find({ statut: status });
  const statutDistribution = StatsService.getStatutDistribution(
    await Task.find()
  );

  res.json({
    success: true,
    data: {
      status,
      taskCount: tasks.length,
      percentage: (tasks.length / (await Task.countDocuments())) * 100,
      distribution: statutDistribution,
      tasks: tasks.map(t => ({
        _id: t._id,
        titre: t.titre,
        priorite: t.priorite,
        dateCreation: t.dateCreation
      }))
    }
  });
}));

// ---------------------------------------------------------
// Error handler middleware
// ---------------------------------------------------------
router.use((err, req, res, next) => {
  console.error('Stats API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message,
    type: 'INTERNAL_SERVER_ERROR'
  });
});

module.exports = router;
