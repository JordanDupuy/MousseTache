const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/DataTask");


const SousTacheSchema = new mongoose.Schema({
  titre: String,
  statut: {
    type: String,
    enum: ["à faire", "en cours", "terminée", "annulée"],
  },
  echeance: Date,
});

const CommentaireSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  contenu: String,
});

const ModificationSchema = new mongoose.Schema({
  champModifie: String,
  ancienneValeur: mongoose.Schema.Types.Mixed,
  nouvelleValeur: mongoose.Schema.Types.Mixed,
  date: { type: Date, default: Date.now },
});

// Schéma principal
const TaskSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  
  dateCreation: { type: Date, default: Date.now },
  echeance: Date,

  statut: {
    type: String,
    enum: ["à faire", "en cours", "terminée", "annulée"],
    default: "à faire",
  },

  priorite: {
    type: String,
    enum: ["basse", "moyenne", "haute", "critique"],
    default: "moyenne",
  },

  categorie: String,
  etiquettes: [String],
  sousTaches: [SousTacheSchema],
  commentaires: [CommentaireSchema],
  historiqueModifications: [ModificationSchema],
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
