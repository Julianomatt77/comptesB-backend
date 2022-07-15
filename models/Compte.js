const mongoose = require("mongoose");

const compteSchema = mongoose.Schema({
	name: { type: String, required: true },
	userId: { type: String, required: true },
	solde: { type: Number, required: true },
});

module.exports = mongoose.model("Compte", compteSchema);
