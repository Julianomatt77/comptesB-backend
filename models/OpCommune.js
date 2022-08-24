const mongoose = require("mongoose");

const opCommuneSchema = mongoose.Schema({
	montant: { type: Number, required: true },
	// type: { type: Boolean, required: true },
	name: { type: String, required: true },
	description: { type: String, required: true },
	userId: { type: String, required: true },
	operationDate: { type: Date, required: true },
});

module.exports = mongoose.model("OpCommune", opCommuneSchema);
