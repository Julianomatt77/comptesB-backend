const mongoose = require("mongoose");

const operationSchema = mongoose.Schema({
	montant: { type: Number, required: true },
	type: { type: Boolean, required: true },
	categorie: { type: String, required: true },
	compte: { type: String, required: true },
	compteName: { type: String, required: false },
	compteType: { type: String, required: false },
	description1: { type: String, required: true },
	description2: { type: String, required: false },
	userId: { type: String, required: true },
	operationDate: { type: Date, required: true },
	solde: { type: Number, required: true },
});

module.exports = mongoose.model("Operation", operationSchema);
