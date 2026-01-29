const express = require('express');
const router = express.Router();
const Task = require('../models/mongoose'); // Ton modèle

// ---------------------------------------------------------
// GET /tasks — Récupérer toutes les tâches (avec filtres + tri)
// ---------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const filters = {};
    const { statut, priorite, categorie, etiquette, echeanceAvant, echeanceApres, sort, q } = req.query;

    if (statut) filters.statut = statut;
    if (priorite) filters.priorite = priorite;
    if (categorie) filters.categorie = categorie;
    if (etiquette) filters.etiquettes = etiquette;
    if (echeanceAvant) filters.echeance = { ...filters.echeance, $lte: new Date(echeanceAvant) };
    if (echeanceApres) filters.echeance = { ...filters.echeance, $gte: new Date(echeanceApres) };

    if (q) {
      filters.titre = { $regex: q, $options: 'i' };
    }

    const tasks = await Task.find(filters).sort(sort || 'dateCreation');
    res.json(tasks);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------
// GET /tasks/:id — Récupérer une tâche par ID
// ---------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
    res.json(task);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------
// POST /tasks — Créer une nouvelle tâche
// ---------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---------------------------------------------------------
// PUT /tasks/:id — Modifier une tâche (historisation incluse)
// ---------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });

    // Historisation
    const modifications = [];
    for (const champ in req.body) {
      if (task[champ] !== req.body[champ]) {
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
    res.json(task);

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---------------------------------------------------------
// DELETE /tasks/:id — Supprimer une tâche
// ---------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
    res.json({ message: "Tâche supprimée avec succès" });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------
// Sous-tâches
// ---------------------------------------------------------

// Ajouter une sous-tâche
router.post('/:id/subtasks', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });

    task.sousTaches.push(req.body);
    await task.save();

    res.json(task);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Supprimer une sous-tâche
router.delete('/:taskId/subtasks/:subId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });

    task.sousTaches = task.sousTaches.filter(st => st._id.toString() !== req.params.subId);
    await task.save();

    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------
// Commentaires
// ---------------------------------------------------------

// Ajouter un commentaire
router.post('/:id/comments', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });

    task.commentaires.push(req.body);
    await task.save();

    res.json(task);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Supprimer un commentaire
router.delete('/:taskId/comments/:commentId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });

    task.commentaires = task.commentaires.filter(c => c._id.toString() !== req.params.commentId);
    await task.save();

    res.json(task);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
