const fs = require("fs");
const OpCommune = require("../models/OpCommune");
const OpCommuneUser = require("../models/OpCommuneUser");

exports.createOperation = (req, res, next) => {
	delete req.body._id;
	const opCommune = new OpCommune({
		montant: req.body._montant,
		type: req.body._type,
		name: req.body._name,
		description: req.body._description,
		operationDate: req.body._operationDate,
		userId: req.auth.userId,
	});
	opCommune
		.save()
		.then(() => res.status(201).json({ message: "Operation enregistré !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.getOneOperation = (req, res, then) => {
	OpCommune.findOne({ _id: req.params.id })
		.then((operation) => res.status(200).json(operation))
		.catch((error) => res.status(400).json({ error }));
};

exports.updateOneOperation = (req, res, next) => {
	OpCommune.updateOne(
		{ _id: req.params.id },
		{
			...req.body.operation,
			_id: req.params.id,
			userId: req.auth.userId,
		}
	)
		.then(() => res.status(200).json({ message: "Operation modifié!" }))
		.catch((error) => res.status(401).json({ error }));
};

exports.getAllOperations = (req, res, next) => {
	let sortByDate = { operationDate: -1 };
	OpCommune.find()
		.sort(sortByDate)
		.then((operations) => res.status(200).json(operations))
		.catch((error) => res.status(400).json({ error }));
	// res.status(200).json({ message: "ok" });
};

exports.getOperationsFiltered = (req, res, next) => {
	let sortByDate = { operationDate: -1 };

	let month = req.body.month;
	let year = req.body.year;

	let startDate = new Date();
	let endDate = new Date();

	if (month) {
		startDate = new Date(year, month - 1, 01);
		endDate = new Date(year, month - 1, 31);
	} else {
		startDate = new Date(year, 00, 01);
		endDate = new Date(year, 11, 31);
	}

	OpCommune.find({
		operationDate: { $gte: startDate, $lte: endDate },
	})
		.sort(sortByDate)
		.then((operations) => res.status(200).json(operations))
		.catch((error) => res.status(400).json({ error }));
};

exports.deleteOperation = (req, res, next) => {
	OpCommune.deleteOne({ _id: req.params.id })
		.then(() => res.status(200).json({ message: "Operation supprimé !" }))
		.catch((error) => res.status(400).json({ error }));
};

/**********************   USERS ******************************* */
exports.createUser = (req, res, next) => {
	delete req.body._id;
	const opCommuneUser = new OpCommuneUser({
		name: req.body._name,
		history: req.body._history,
		userId: req.auth.userId,
	});
	opCommuneUser
		.save()
		.then(() => res.status(201).json({ message: "Utilisateur enregistré !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.getOneUser = (req, res, then) => {
	OpCommuneUser.findOne({ _id: req.params.id })
		.then((user) => res.status(200).json(user))
		.catch((error) => res.status(400).json({ error }));
};
exports.getOneUserByName = (req, res, then) => {
	OpCommuneUser.findOne({ name: req.params.name })
		.then((user) => res.status(200).json(user))
		.catch((error) => res.status(400).json({ error }));
};

exports.updateOneUser = (req, res, next) => {
	console.log(req.body.user);
	OpCommuneUser.updateOne(
		{ _id: req.params.id },
		{
			...req.body.user,
			history: req.body.user._history,
			_id: req.params.id,
			userId: req.auth.userId,
		}
	)
		.then(() => res.status(200).json({ message: "Utilisateur modifié!" }))
		.catch((error) => res.status(401).json({ error }));
};

exports.getAllUsers = (req, res, next) => {
	OpCommuneUser.find()
		.then((users) => res.status(200).json(users))
		.catch((error) => res.status(400).json({ error }));
};

exports.deleteUser = (req, res, next) => {
	OpCommuneUser.deleteOne({ _id: req.params.id })
		.then(() => res.status(200).json({ message: "Utilisateur supprimé !" }))
		.catch((error) => res.status(400).json({ error }));
};

/*
exports.uploadAccountHistory = (req, res, next) => {
	try {
		let userId = req.auth.userId;
		let data = req.body.soldeAllArray;
		let uploadPath = "";
		let filename = "";

		if (req.body.type == "Compte Courant") {
			uploadPath = "uploads/account_History/";
			filename = "accountHistory_" + userId + ".json";
		} else {
			uploadPath = "uploads/epargne_History/";
			filename = "epargneHistory_" + userId + ".json";
		}

		//Creation of the folder "configurations" if it does not exist
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}

		//Save file
		fs.writeFile(uploadPath + filename, JSON.stringify(data), function (err) {});

		res.status(200).json({ message: "Historique enregistré !" });
	} catch (err) {
		return res.status(400).json({ message: "error writing file back-end : " + err });
	}
};

exports.getAccountHistory = (req, res, next) => {
	try {
		let userId = req.auth.userId;
		let uploadPath = "uploads/account_History/";
		let filename = "accountHistory_" + userId + ".json";
		let fullFilePath = uploadPath + filename;
		// if (fs.existsSync(fullFilePath)) {
		let historique = JSON.parse(fs.readFileSync(fullFilePath));
		// console.log(Array.isArray(historique));
		// console.log(typeof historique);
		// }
		res.status(200).json(historique);
	} catch (err) {
		return res.status(400).json({ message: "error writing file back-end : " + err });
	}
};
exports.getEpargneHistory = (req, res, next) => {
	try {
		let userId = req.auth.userId;
		let uploadPath = "uploads/epargne_History/";
		let filename = "epargneHistory_" + userId + ".json";
		let fullFilePath = uploadPath + filename;
		// if (fs.existsSync(fullFilePath)) {
		let historique = JSON.parse(fs.readFileSync(fullFilePath));
		// console.log(Array.isArray(historique));
		// console.log(typeof historique);
		// }
		res.status(200).json(historique);
	} catch (err) {
		return res.status(400).json({ message: "error writing file back-end : " + err });
	}
};
*/
