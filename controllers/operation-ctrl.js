const Operation = require("../models/Operation");
// const fs = require("fs");

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
		...req.body,
		// ...req.query,
		userId: 1,
	});
	// console.log("operation", operation);
	operation
		.save()
		.then(() => res.status(201).json({ message: "Operation enregistré !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.getOneOperation = (req, res, then) => {
	Operation.findOne({ _id: req.params.id })
		.then((operation) => res.status(200).json(operation))
		.catch((error) => res.status(400).json({ error }));
};

exports.updateOneOperation = (req, res, next) => {
	// console.log("update", req.body);
	Operation.updateOne(
		{ _id: req.params.id },
		{
			...req.body.operation,
			_id: req.params.id,
			userId: 1,
		}
	)
		.then(() => res.status(200).json({ message: "Operation modifié!" }))
		.catch((error) => res.status(401).json({ error }));
};

exports.getAllOperations = (req, res, next) => {
	var sortByDate = { operationDate: -1 };
	Operation.find()
		.sort(sortByDate)
		.then((operations) => res.status(200).json(operations))
		.catch((error) => res.status(400).json({ error }));
	// res.status(200).json({ message: "ok" });
};

exports.deleteOperation = (req, res, next) => {
	Operation.deleteOne({ _id: req.params.id })
		.then(() => res.status(200).json({ message: "Operation supprimé !" }))
		.catch((error) => res.status(400).json({ error }));
};
