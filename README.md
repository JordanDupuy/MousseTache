# MousseTache

MousseTache est un gestionnaire de tâches simple fullstack développé avec Node.js, Express et MongoDB côté serveur, et une interface Vue 3 côté client.

## Fonctionnalités

- Création, lecture, modification et suppression de tâches
- Filtrage par statut, priorité et tri
- Ajout et suppression de sous-tâches
- Ajout et suppression de commentaires
- Historique des modifications pour chaque tâche
- Frontend en Vue 3 via CDN

## Architecture

- `server/express.js` : point d'entrée du serveur Express
- `server/routes/tasks.routes.js` : routes REST pour la gestion des tâches
- `server/models/mongoose.js` : modèle Mongoose pour les tâches
- `client/index.html` : interface utilisateur
- `client/js/app.js` : logique Vue et appel API
- `client/js/api.js` : wrapper Fetch pour l'API
- `client/css/style.css` : styles de l'application

## Technologies

- Node.js
- Express 5
- Mongoose
- MongoDB
- Vue 3 (CDN)
- HTML / CSS / JavaScript
- CORS

## Prérequis

- Node.js installé
- MongoDB installé et en cours d'exécution

## Installation

1. Ouvrir un terminal dans le dossier du projet.
2. Installer les dépendances :

```bash
npm install
```

3. Lancer MongoDB (service ou `mongod`).

4. Démarrer le serveur :

```bash
node server/express.js
```

Le serveur écoute sur `http://localhost:3111`.

## Utilisation

- Ouvrir `client/index.html` dans un navigateur pour accéder à l'interface.
- Le frontend communique avec l'API sur `http://localhost:3111/tasks`.

> Si l'ouverture directe du fichier ne fonctionne pas à cause de la politique de sécurité du navigateur, utilisez un serveur statique local (par exemple `Live Server` dans VS Code ou `npx serve client`).

## API

### Récupérer toutes les tâches

`GET /tasks`

Query params supportés :
- `statut`
- `priorite`
- `categorie`
- `etiquette`
- `echeanceAvant`
- `echeanceApres`
- `sort`

### Récupérer une tâche

`GET /tasks/:id`

### Créer une tâche

`POST /tasks`

Exemple de body JSON :

```json
{
  "titre": "Nouvelle tâche",
  "priorite": "moyenne"
}
```

### Mettre à jour une tâche

`PUT /tasks/:id`

### Supprimer une tâche

`DELETE /tasks/:id`

### Ajouter une sous-tâche

`POST /tasks/:id/subtasks`

### Supprimer une sous-tâche

`DELETE /tasks/:taskId/subtasks/:subId`

### Ajouter un commentaire

`POST /tasks/:id/comments`

### Supprimer un commentaire

`DELETE /tasks/:taskId/comments/:commentId`

## Schéma de données principal

Une tâche (`Task`) contient notamment :

- `titre` (obligatoire)
- `description`
- `dateCreation`
- `echeance`
- `statut` (`à faire`, `en cours`, `terminée`, `annulée`)
- `priorite` (`basse`, `moyenne`, `haute`, `critique`)
- `categorie`
- `etiquettes`
- `sousTaches`
- `commentaires`
- `historiqueModifications`

## Notes

- Le backend utilise la base MongoDB locale `DataTask`.
- Le projet ne contient pas de script `start` dans `package.json`, donc le serveur se lance avec `node server/express.js`.
