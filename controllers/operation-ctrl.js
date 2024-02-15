const Operation = require("../models/Operation");
const fs = require("fs");
const Compte = require("../models/Compte");

exports.createOperation = (req, res, next) => {
	delete req.body._id;
	// delete req.body.userId;
	const operation = new Operation({
		montant: req.body._montant,
		type: req.body._type,
		categorie: req.body._categorie,
		compte: req.body._compte,
		description1: req.body._description1,
		description2: req.body._description2,
		operationDate: req.body._operationDate,
		solde: req.body._solde,
		userId: req.auth.userId,
		// ...req.body,
		// ...req.query,
	});
	operation
		.save()
		.then(() => res.status(201).json({ message: "Operation enregistré !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.getOneOperation = (req, res, then) => {
	Operation.findOne({ _id: req.params.id })
		.then((operation) => {
			if (!operation) {
				return res.status(404).json({ message: 'Opération non trouvée' });
			}

			Promise.all([
				Compte.findOne({ _id: operation.compte }),
			])
				.then(([compte]) => {
					if (compte) {
						operation.compteName = compte.name;
						operation.compteType = compte.typeCompte;
					}
					res.status(200).json(operation);
				})
				.catch((error) => res.status(400).json({ error }));
		})
		.catch((error) => res.status(400).json({ error }));
};

exports.updateOneOperation = (req, res, next) => {
	Operation.updateOne(
		{ _id: req.params.id },
		{
			...req.body.operation,
			_id: req.params.id,
			// userId: req.auth.userId,
		}
	)
		.then(() => res.status(200).json({ message: "Operation modifié!" }))
		.catch((error) => res.status(401).json({ error }));
};

exports.getAllOperations = (req, res, next) => {
	let sortByDate = { operationDate: -1 };
	Operation.find()
		.sort(sortByDate)
		.then((operations) => {
			const promises = operations.map((operation) => {
				return Compte.findOne({_id: operation.compte})
					.then((compte) => {
						operation.compteName = compte.name;
						operation.compteType = compte.typeCompte;
						return operation;
					})
					.catch((error) => {
						throw error;
					});
			});
			return Promise.all(promises);
		})
		.then((operationsWithCompteInfo) => {
			res.status(200).json(operationsWithCompteInfo);
		})
		.catch((error) => res.status(400).json({ error }));
};

exports.getOperationsFiltered = (req, res, next) => {
	let sortByDate = { operationDate: -1 };

	let month = req.body.month;
	let year = req.body.year;

	let startDate = new Date();
	let endDate = new Date();
	if (month) {
		startDate = new Date(year, month - 1, 1);
		endDate = new Date(year, month, 1);
	} else {
		startDate = new Date(year, 0, 1);
		endDate = new Date(year, 11, 31);
	}

	Operation.find({
		operationDate: {$gte: startDate, $lte: endDate},
	})
		.sort(sortByDate)
		.then((operations) => {
			const promises = operations.map((operation) => {
				return Compte.findOne({_id: operation.compte})
					.then((compte) => {
						operation.compteName = compte.name;
						operation.compteType = compte.typeCompte;
						return operation;
					})
					.catch((error) => {
						throw error;
					});
			});

			return Promise.all(promises);
		})
		.then((operationsWithCompteInfo) => {
			res.status(200).json(operationsWithCompteInfo);
		})
		.catch((error) => res.status(400).json({error}));
};

exports.deleteOperation = (req, res, next) => {
	Operation.deleteOne({ _id: req.params.id })
		.then(() => res.status(200).json({ message: "Operation supprimé !" }))
		.catch((error) => res.status(400).json({ error }));
};

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
