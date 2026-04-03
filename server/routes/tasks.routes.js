const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const { Task } = require('../models/mongoose');

// ✅ Middleware pour gérer les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }
  next();
};

// ✅ Middleware asyncHandler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ✅ Validations réutilisables
const taskValidation = {
  create: [
    body('titre')
      .trim()
      .notEmpty().withMessage('Le titre est obligatoire')
      .isLength({ min: 3, max: 200 }).withMessage('Le titre doit avoir entre 3 et 200 caractères'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 }).withMessage('La description ne peut pas dépasser 2000 caractères'),
    body('priorite')
      .optional()
      .isIn(['basse', 'moyenne', 'haute', 'critique']).withMessage('Priorité invalide'),
    body('categorie')
      .optional()
      .trim(),
  ],
  update: [
    body('titre')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 }).withMessage('Le titre doit avoir entre 3 et 200 caractères'),
    body('statut')
      .optional()
      .isIn(['à faire', 'en cours', 'terminée', 'annulée']).withMessage('Statut invalide'),
    body('priorite')
      .optional()
      .isIn(['basse', 'moyenne', 'haute', 'critique']).withMessage('Priorité invalide'),
  ]
};

// GET /tasks
router.get('/', asyncHandler(async (req, res) => {
  const { statut, priorite, categorie, etiquette, echeanceAvant, echeanceApres, sort } = req.query;
  
  const filters = {};
  
  if (statut) filters.statut = statut;
  if (priorite) filters.priorite = priorite;
  if (categorie) filters.categorie = categorie;
  if (etiquette) filters.etiquettes = etiquette;
  
  if (echeanceAvant || echeanceApres) {
    filters.echeance = {};
    if (echeanceAvant) filters.echeance.$lte = new Date(echeanceAvant);
    if (echeanceApres) filters.echeance.$gte = new Date(echeanceApres);
  }

  const tasks = await Task.find(filters)
    .sort(sort || '-dateCreation')
    .lean();  // ✅ .lean() pour plus de perf

  res.json({
    success: true,
    count: tasks.length,
    data: tasks
  });
}));

// GET /tasks/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Tâche non trouvée'
    });
  }

  res.json({
    success: true,
    data: task
  });
}));

// POST /tasks
router.post('/', taskValidation.create, validate, asyncHandler(async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  
  res.status(201).json({
    success: true,
    message: 'Tâche créée avec succès',
    data: task
  });
}));

// PUT /tasks/:id
router.put('/:id', taskValidation.update, validate, asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Tâche non trouvée'
    });
  }

  // Enregistrer les modifications
  const modifications = [];
  for (const champ in req.body) {
    if (String(task[champ]) !== String(req.body[champ]) && champ !== '_id') {
      modifications.push({
        champModifie: champ,
        ancienneValeur: task[champ],
        nouvelleValeur: req.body[champ],
      });
    }
  }

  Object.assign(task, req.body);
  
  if (modifications.length > 0) {
    task.historiqueModifications.push(...modifications);
  }

  await task.save();

  res.json({
    success: true,
    message: 'Tâche mise à jour avec succès',
    data: task
  });
}));

// DELETE /tasks/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Tâche non trouvée'
    });
  }

  res.json({
    success: true,
    message: 'Tâche supprimée avec succès',
    data: task
  });
}));

// POST /tasks/:id/subtasks
router.post('/:id/subtasks', 
  param('id').isMongoId().withMessage('ID invalide'),
  body('titre')
    .trim()
    .notEmpty().withMessage('Le titre de la sous-tâche est obligatoire')
    .isLength({ max: 200 }).withMessage('Le titre ne peut pas dépasser 200 caractères'),
  validate,
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Tâche non trouvée' });
    }

    task.sousTaches.push({
      titre: req.body.titre,
      statut: req.body.statut || 'à faire',
      echeance: req.body.echeance,
    });

    await task.save();
    res.json({ success: true, data: task });
  })
);

// DELETE /tasks/:taskId/subtasks/:subId
router.delete('/:taskId/subtasks/:subId', 
  param('taskId').isMongoId(),
  param('subId').isMongoId(),
  validate,
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Tâche non trouvée' });
    }

    const initialLength = task.sousTaches.length;
    task.sousTaches = task.sousTaches.filter(st => st._id.toString() !== req.params.subId);

    if (task.sousTaches.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Sous-tâche non trouvée' });
    }

    await task.save();
    res.json({ success: true, data: task });
  })
);

// POST /tasks/:id/comments
router.post('/:id/comments',
  body('contenu')
    .trim()
    .notEmpty().withMessage('Le contenu ne peut pas être vide')
    .isLength({ max: 500 }).withMessage('Le commentaire ne peut pas dépasser 500 caractères'),
  validate,
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Tâche non trouvée' });
    }

    task.commentaires.push({
      contenu: req.body.contenu,
      date: new Date(),
    });

    await task.save();
    res.json({ success: true, data: task });
  })
);

// DELETE /tasks/:taskId/comments/:commentId
router.delete('/:taskId/comments/:commentId',
  param('taskId').isMongoId(),
  param('commentId').isMongoId(),
  validate,
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Tâche non trouvée' });
    }

    const initialLength = task.commentaires.length;
    task.commentaires = task.commentaires.filter(c => c._id.toString() !== req.params.commentId);

    if (task.commentaires.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Commentaire non trouvé' });
    }

    await task.save();
    res.json({ success: true, data: task });
  })
);

// ✅ Error handler
router.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message,
  });
});

module.exports = router;