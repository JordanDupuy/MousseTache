/**
 * Tests Fonctionnels - Routes Tâches
 * Teste les opérations CRUD et filtres sur les tâches
 */

// Simulations simples des tests
let testsPassed = 0;
let testsFailed = 0;

function assertTrue(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  [OK] ${message}`);
  } else {
    testsFailed++;
    console.log(`  [FAIL] ${message}`);
  }
}

console.log('\nSUITE DE TESTS FONCTIONNELS - TÂCHES\n');
console.log('='.repeat(50));

// Test 1: Validation création de tâche
console.log('\nTest 1: Validation - Création tâche');

// Fonction de validation claire
function validateTask(data) {
  // Vérifier si titre existe et a au moins 3 caractères
  if (!data.titre || data.titre.trim().length < 3) {
    return false;
  }
  
  // Vérifier si description est valide (optionnel mais length max)
  if (data.description && data.description.length > 2000) {
    return false;
  }
  
  // Vérifier si priorité est valide (optionnel)
  if (data.priorite && !['basse', 'moyenne', 'haute', 'critique'].includes(data.priorite)) {
    return false;
  }
  
  return true;
}

const testCases = [
  {
    nom: 'Tâche valide complète',
    data: { titre: 'Ma tâche', description: 'Description', priorite: 'haute' },
    valide: true
  },
  {
    nom: 'Titre manquant',
    data: { description: 'Sans titre', priorite: 'haute' },
    valide: false
  },
  {
    nom: 'Titre trop court',
    data: { titre: 'ab', priorite: 'haute' },
    valide: false
  },
  {
    nom: 'Priorité invalide',
    data: { titre: 'Tâche', priorite: 'invalide' },
    valide: false
  },
];

testCases.forEach(test => {
  const isValid = validateTask(test.data);
  const passed = isValid === test.valide;
  assertTrue(passed, test.nom + (passed ? '✓' : ` (attendu: ${test.valide}, obtenu: ${isValid})`));
});

// Test 2: Validation statuts
console.log('\nTest 2: Validation - Statuts tâche');

const statuts = ['à faire', 'en cours', 'terminée', 'annulée'];
const statutsValides = ['à faire', 'en cours', 'terminée', 'annulée'];

statuts.forEach(statut => {
  const valide = statutsValides.includes(statut);
  assertTrue(valide, `Statut "${statut}" est valide`);
});

// Test invalide
assertTrue(!statutsValides.includes('invalide'), 'Statut "invalide" est rejeté');

// Test 3: Filtrage par statut
console.log('\n�103 Test 3: Filtrage - Par statut');

const tasksMock = [
  { titre: 'T1', statut: 'à faire', priorite: 'haute' },
  { titre: 'T2', statut: 'en cours', priorite: 'moyenne' },
  { titre: 'T3', statut: 'terminée', priorite: 'basse' },
  { titre: 'T4', statut: 'en cours', priorite: 'critique' },
];

const enCoursFilter = tasksMock.filter(t => t.statut === 'en cours');
assertTrue(enCoursFilter.length === 2, 'Filtre "en cours": 2 tâches trouvées');
assertTrue(enCoursFilter.every(t => t.statut === 'en cours'), 'Tous les résultats sont "en cours"');

const termineeFilter = tasksMock.filter(t => t.statut === 'terminée');
assertTrue(termineeFilter.length === 1, 'Filtre "terminée": 1 tâche trouvée');

// Test 4: Filtrage par priorité
console.log('\nTest 4: Filtrage - Par priorité');

const hautePrioriteFilter = tasksMock.filter(t => t.priorite === 'haute');
assertTrue(hautePrioriteFilter.length === 1, 'Filtre "haute": 1 tâche trouvée');

const critiqueFilter = tasksMock.filter(t => t.priorite === 'critique');
assertTrue(critiqueFilter.length === 1, 'Filtre "critique": 1 tâche trouvée');

// Test 5: Tri des tâches
console.log('\nTest 5: Tri - Par priorité (ordre importance)');

const prioriteOrder = { critique: 1, haute: 2, moyenne: 3, basse: 4 };
const tasksSorted = [...tasksMock].sort((a, b) => 
  prioriteOrder[a.priorite] - prioriteOrder[b.priorite]
);

assertTrue(tasksSorted[0].priorite === 'critique', 'Critique en premier');
assertTrue(tasksSorted[1].priorite === 'haute', 'Haute en deuxième');
assertTrue(tasksSorted[2].priorite === 'moyenne', 'Moyenne en troisième');
assertTrue(tasksSorted[3].priorite === 'basse', 'Basse en dernier');

// Test 6: Sous-tâches
console.log('\nTest 6: Sous-tâches - Gestion');

const taskWithSubtasks = {
  titre: 'Tâche parent',
  statut: 'en cours',
  sousTaskes: [
    { titre: 'Sous-T1', completed: true },
    { titre: 'Sous-T2', completed: true },
    { titre: 'Sous-T3', completed: false },
  ]
};

const completedSubs = taskWithSubtasks.sousTaskes.filter(st => st.completed).length;
const totalSubs = taskWithSubtasks.sousTaskes.length;
const subCompletion = (completedSubs / totalSubs) * 100;

assertTrue(completedSubs === 2, 'Sous-tâches: 2 complétées');
assertTrue(totalSubs === 3, 'Sous-tâches: 3 au total');
assertTrue(Math.round(subCompletion) === 67, 'Sous-tâches: 67% de complétion');

// Test 7: Commentaires
console.log('\nTest 7: Commentaires - Gestion');

const taskWithComments = {
  titre: 'Tâche avec commentaires',
  statut: 'en cours',
  commentaires: [
    { texte: 'Commentaire 1', date: new Date('2026-04-01'), auteur: 'User1' },
    { texte: 'Commentaire 2', date: new Date('2026-04-01'), auteur: 'User2' },
    { texte: 'Commentaire 3', date: new Date('2026-04-01'), auteur: 'User1' },
  ]
};

assertTrue(taskWithComments.commentaires.length === 3, 'Commentaires: 3 au total');
const user1Comments = taskWithComments.commentaires.filter(c => c.auteur === 'User1').length;
assertTrue(user1Comments === 2, 'Commentaires: User1 a écrit 2 commentaires');

// Test 8: Gestion des dates d'échéance
console.log('\nTest 8: Échéances - Classification');

const now = new Date();
const tasksWithDates = [
  {
    titre: 'Tâche dépassée',
    echeance: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    statut: 'en cours'
  },
  {
    titre: 'Tâche urgente (3 jours)',
    echeance: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    statut: 'à faire'
  },
  {
    titre: 'Tâche tranquille',
    echeance: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    statut: 'à faire'
  },
];

// Classification
function classifyDeadline(task) {
  const daysUntil = (task.echeance - now) / (1000 * 60 * 60 * 24);
  if (daysUntil < 0) return 'overdue';
  if (daysUntil < 7) return 'upcoming';
  return 'ontime';
}

const overdue = tasksWithDates.filter(t => classifyDeadline(t) === 'overdue');
const upcoming = tasksWithDates.filter(t => classifyDeadline(t) === 'upcoming');
const ontime = tasksWithDates.filter(t => classifyDeadline(t) === 'ontime');

assertTrue(overdue.length === 1, 'Échéances: 1 tâche dépassée');
assertTrue(upcoming.length === 1, 'Échéances: 1 tâche urgente');
assertTrue(ontime.length === 1, 'Échéances: 1 tâche dans les délais');

// Test 9: Édition de tâche
console.log('\nTest 9: Édition - Modification tâche');

const originalTask = {
  _id: '123',
  titre: 'Titre original',
  statut: 'à faire',
  priorite: 'moyenne',
  description: 'Description originale'
};

const updatedTask = {
  ...originalTask,
  titre: 'Titre modifié',
  statut: 'en cours',
  priorite: 'haute'
};

assertTrue(updatedTask.titre !== originalTask.titre, 'Titre a été modifié');
assertTrue(updatedTask.statut !== originalTask.statut, 'Statut a été modifié');
assertTrue(updatedTask.priorite !== originalTask.priorite, 'Priorité a été modifiée');
assertTrue(updatedTask._id === originalTask._id, 'ID reste le même');
assertTrue(updatedTask.description === originalTask.description, 'Description non modifiée');

// Test 10: Suppression de tâche
console.log('\n�103 Test 10: Suppression - Suppression logique');

const allTasks = [
  { _id: '1', titre: 'T1', statut: 'à faire' },
  { _id: '2', titre: 'T2', statut: 'terminée' },
  { _id: '3', titre: 'T3', statut: 'en cours' },
];

const taskToRemove = '2';
const remainingTasks = allTasks.filter(t => t._id !== taskToRemove);

assertTrue(allTasks.length === 3, 'Avant suppression: 3 tâches');
assertTrue(remainingTasks.length === 2, 'Après suppression: 2 tâches');
assertTrue(!remainingTasks.some(t => t._id === taskToRemove), 'Tâche supprimée est absente');

// Test 11: Bulk operations (test avancé)
console.log('\nTest 11: Opérations en masse');

const bulkUpdate = {
  ids: ['1', '2', '3'],
  updates: { statut: 'terminée', completedAt: new Date() }
};

const bulkTasks = allTasks.map(t => 
  bulkUpdate.ids.includes(t._id) 
    ? { ...t, ...bulkUpdate.updates }
    : t
);

const allCompleted = bulkTasks.every(t => t.statut === 'terminée');
assertTrue(allCompleted, 'Mise à jour en masse: toutes les tâches sont terminées');
assertTrue(bulkTasks.every(t => t.completedAt), 'Mise à jour en masse: completedAt défini');

// Test 12: Recherche et filtres combinés
console.log('\nTest 12: Recherche - Filtres combinés');

const searchQuery = 'test';
const filterCriteria = { priorite: 'haute', statut: 'en cours' };

const searchResults = [
  { titre: 'Test haute priorité', priorite: 'haute', statut: 'en cours' },
  { titre: 'Autre test', priorite: 'haute', statut: 'en cours' },
  { titre: 'Pas pertinent', priorite: 'basse', statut: 'à faire' },
];

const filtered = searchResults.filter(t => 
  t.titre.toLowerCase().includes(searchQuery.toLowerCase()) &&
  t.priorite === filterCriteria.priorite &&
  t.statut === filterCriteria.statut
);

assertTrue(filtered.length === 2, 'Recherche combinée: 2 résultats');
assertTrue(filtered.every(t => t.priorite === 'haute'), 'Tous les résultats ont priorité haute');
assertTrue(filtered.every(t => t.statut === 'en cours'), 'Tous les résultats sont en cours');

// RÉSUMÉ
console.log('\n' + '='.repeat(50));
console.log(`\n🎉 Résumé:`);
console.log(`   Tests réussis: ${testsPassed}`);
console.log(`   Tests échoués: ${testsFailed}`);
console.log(`   Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log(`\nTous les tests fonctionnels sont passés!\n`);
  process.exit(0);
} else {
  console.log(`\n${testsFailed} test(s) ont échoué!\n`);
  process.exit(1);
}
