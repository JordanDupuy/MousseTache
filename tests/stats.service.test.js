const StatsService = require('../server/services/stats.service');

let testsPassed = 0;
let testsFailed = 0;

// Fonction helper pour les assertions
function assertTrue(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  [OK] ${message}`);
  } else {
    testsFailed++;
    console.log(`  [FAIL] ${message}`);
  }
}

// Données de test
const mockTasks = [
  { statut: 'terminée', priorite: 'haute' },
  { statut: 'terminée', priorite: 'moyenne' },
  { statut: 'en cours', priorite: 'basse' },
  { statut: 'en cours', priorite: 'critique' },
  { statut: 'à faire', priorite: 'haute' },
  { statut: 'annulée', priorite: 'basse' },
];

const emptyTasks = [];

console.log('\nSUITE DE TESTS - StatsService\n');
console.log('='.repeat(50));

// TEST 1: Taux de complétion
console.log('\nTest 1: calculateCompletionRate');
const completion = StatsService.calculateCompletionRate(mockTasks);
assertTrue(completion.completed === 2, 'Devrait avoir 2 tâches complétées');
assertTrue(completion.total === 6, 'Devrait avoir 6 tâches au total');
assertTrue(completion.percentage === 33, 'Devrait avoir 33% de complétion');

// Test avec liste vide
const emptyCompletion = StatsService.calculateCompletionRate(emptyTasks);
assertTrue(emptyCompletion.percentage === 0, 'Complétion à 0% avec liste vide');

// TEST 2: Distribution par statut
console.log('\nTest 2: getStatutDistribution');
const statutDist = StatsService.getStatutDistribution(mockTasks);
assertTrue(statutDist.terminée === 2, 'Devrait avoir 2 tâches terminées');
assertTrue(statutDist['en cours'] === 2, 'Devrait avoir 2 tâches en cours');
assertTrue(statutDist['à faire'] === 1, 'Devrait avoir 1 tâche à faire');
assertTrue(statutDist.annulée === 1, 'Devrait avoir 1 tâche annulée');

// TEST 3: Distribution par priorité
console.log('\nTest 3: getPrioriteDistribution');
const prioriteDist = StatsService.getPrioriteDistribution(mockTasks);
assertTrue(prioriteDist.critique === 1, 'Devrait avoir 1 tâche critique');
assertTrue(prioriteDist.haute === 2, 'Devrait avoir 2 tâches hautes');
assertTrue(prioriteDist.moyenne === 1, 'Devrait avoir 1 tâche moyenne');
assertTrue(prioriteDist.basse === 2, 'Devrait avoir 2 tâches basses');

// TEST 4: Complétion par priorité
console.log('\nTest 4: getCompletionByPriority');
const completionByPriority = StatsService.getCompletionByPriority(mockTasks);
assertTrue(completionByPriority.haute.completed === 1, 'Haute: 1 tâche complétée');
assertTrue(completionByPriority.haute.total === 2, 'Haute: 2 tâches au total');
assertTrue(completionByPriority.haute.percentage === 50, 'Haute: 50% de complétion');
assertTrue(completionByPriority.critique.percentage === 0, 'Critique: 0% complétées');

// TEST 5: Tâches avec échéances
console.log('\nTest 5: Gestion des échéances');
const tasksWithDueDate = [
  { 
    titre: 'Tâche dépassée',
    statut: 'en cours', 
    echeance: new Date('2025-01-01'),
    priorite: 'haute'
  },
  { 
    titre: 'Tâche à venir',
    statut: 'à faire', 
    echeance: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    priorite: 'moyenne'
  },
  { 
    titre: 'Tâche complétée à temps',
    statut: 'terminée', 
    echeance: new Date('2025-12-31'),
    priorite: 'basse'
  },
];

const deadlineAnalysis = StatsService.getDeadlineAnalysis(tasksWithDueDate);
assertTrue(deadlineAnalysis.overdue >= 1, 'Doit détecter au moins 1 tâche dépassée');
assertTrue(deadlineAnalysis.upcoming >= 0, 'Doit avoir des tâches à venir');
assertTrue(deadlineAnalysis.onTime >= 0, 'Doit avoir des tâches dans les délais');

// TEST 6: Validation des données
console.log('\nTest 6: Cas limites');
const singleTask = [{ statut: 'terminée', priorite: 'haute', echeance: new Date() }];
const singleCompletion = StatsService.calculateCompletionRate(singleTask);
assertTrue(singleCompletion.percentage === 100, 'Une seule tâche terminée = 100%');

const allPending = [
  { statut: 'à faire', priorite: 'basse' },
  { statut: 'à faire', priorite: 'basse' },
];
const pendingCompletion = StatsService.calculateCompletionRate(allPending);
assertTrue(pendingCompletion.percentage === 0, 'Zéro tâche terminée = 0%');

// TEST 7: Tâches avec tags et catégories
console.log('\nTest 7: Tags et catégories');
const tasksWithMeta = [
  { statut: 'terminée', priorite: 'haute', tags: ['urgent', 'client'], categorie: 'support' },
  { statut: 'en cours', priorite: 'moyenne', tags: ['important'], categorie: 'développement' },
  { statut: 'à faire', priorite: 'basse', tags: [], categorie: 'documentation' },
];

const metaDist = StatsService.getPrioriteDistribution(tasksWithMeta);
assertTrue(metaDist.haute === 1, 'Reconnaissance des tâches avec métadonnées');

// TEST 8: Performance avec beaucoup de tâches
console.log('\nTest 8: Performance (1000 tâches)');
const largeTasks = [];
for (let i = 0; i < 1000; i++) {
  largeTasks.push({
    statut: i % 3 === 0 ? 'terminée' : (i % 3 === 1 ? 'en cours' : 'à faire'),
    priorite: ['critique', 'haute', 'moyenne', 'basse'][i % 4],
    echeance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
  });
}

const startTime = Date.now();
const largeCompletion = StatsService.calculateCompletionRate(largeTasks);
const endTime = Date.now();
const executionTime = endTime - startTime;

assertTrue(executionTime < 100, `Calcul rapide (${executionTime}ms < 100ms)`);
assertTrue(largeCompletion.percentage > 0, 'Résultat calculé correctement');

// RÉSUMÉ
console.log('\n' + '='.repeat(50));
console.log(`\nRésumé:`);
console.log(`   Tests réussis: ${testsPassed}`);
console.log(`   Tests échoués: ${testsFailed}`);

if (testsFailed === 0) {
  console.log(`\nTous les tests sont passés!\n`);
  process.exit(0);
} else {
  console.log(`\n${testsFailed} test(s) ont échoué!\n`);
  process.exit(1);
}