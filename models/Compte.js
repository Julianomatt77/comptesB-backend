const mongoose = require("mongoose");

const compteSchema = mongoose.Schema({
	name: { type: String, required: true },
	userId: { type: String, required: true },
	typeCompte: { type: String, required: true },
	soldeInitial: { type: Number, required: true },
	soldeActuel: { type: Number, required: true },
	history: { type: Array, required: false },
});

module.exports = mongoose.model("Compte", compteSchema);
