const mongoose = require("mongoose");

// ✅ Séparation de la connexion
async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/DataTask", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connecté");
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB:", error);
    process.exit(1);
  }
}

// ✅ Schémas avec validation stricte
const SousTacheSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, "Le titre de la sous-tâche est obligatoire"],
    trim: true,
  },
  statut: {
    type: String,
    enum: ["à faire", "en cours", "terminée", "annulée"],
    default: "à faire",
  },
  echeance: Date,
  dateCreation: { type: Date, default: Date.now },
}, { timestamps: true });

const CommentaireSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  contenu: {
    type: String,
    required: [true, "Le contenu du commentaire ne peut pas être vide"],
    minlength: [1, "Le commentaire doit avoir au moins 1 caractère"],
    maxlength: [500, "Le commentaire ne peut pas dépasser 500 caractères"],
    trim: true,
  },
}, { _id: true });

const ModificationSchema = new mongoose.Schema({
  champModifie: {
    type: String,
    required: true,
  },
  ancienneValeur: mongoose.Schema.Types.Mixed,
  nouvelleValeur: mongoose.Schema.Types.Mixed,
  date: { type: Date, default: Date.now },
}, { _id: false });

// ✅ Schéma principal avec validation et indexes
const TaskSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, "Le titre est obligatoire"],
    minlength: [3, "Le titre doit avoir au moins 3 caractères"],
    maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
    trim: true,
    index: true,  // ✅ Index pour les recherches
  },
  
  description: {
    type: String,
    maxlength: [2000, "La description ne peut pas dépasser 2000 caractères"],
    trim: true,
  },

  dateCreation: {
    type: Date,
    default: Date.now,
    index: true,  // ✅ Index pour les tris
  },
  
  echeance: {
    type: Date,
    index: true,  // ✅ Index pour les filtres d'échéance
  },

  statut: {
    type: String,
    enum: ["à faire", "en cours", "terminée", "annulée"],
    default: "à faire",
    index: true,  // ✅ Index pour les filtres
  },

  priorite: {
    type: String,
    enum: ["basse", "moyenne", "haute", "critique"],
    default: "moyenne",
    index: true,  // ✅ Index pour les filtres
  },

  categorie: {
    type: String,
    trim: true,
    index: true,  // ✅ Index pour les groupements
  },
  
  etiquettes: {
    type: [String],
    default: [],
  },

  sousTaches: [SousTacheSchema],
  commentaires: [CommentaireSchema],
  historiqueModifications: [ModificationSchema],

}, {
  timestamps: true,  // ✅ Ajoute createdAt et updatedAt
  collection: 'tasks'
});

// ✅ Index composés pour les requêtes communes
TaskSchema.index({ statut: 1, priorite: 1 });
TaskSchema.index({ dateCreation: -1, statut: 1 });

// ✅ Virtual pour le nombre de sous-tâches
TaskSchema.virtual('nbSousTaches').get(function() {
  return this.sousTaches ? this.sousTaches.length : 0;
});

TaskSchema.virtual('nbCommentaires').get(function() {
  return this.commentaires ? this.commentaires.length : 0;
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = {
  Task,
  connectDB,
};