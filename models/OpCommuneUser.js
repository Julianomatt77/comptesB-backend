const mongoose = require("mongoose");

const opCommuneUserSchema = mongoose.Schema({
	name: { type: String, required: true },
	userId: { type: String, required: true },
	history: { type: Array, required: false },
});

module.exports = mongoose.model("OpCommuneUser", opCommuneUserSchema);
