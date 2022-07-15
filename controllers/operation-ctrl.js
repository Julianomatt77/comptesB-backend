const Operation = require("../models/Operation");
// const fs = require("fs");

exports.createOperation = (req, res, next) => {
	// console.log(req.query);
	delete req.body._id;
	// delete req.body.userId;
	const operation = new Operation({
		// ...req.body,
		...req.query,
		userId: 1,
	});
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
	Operation.updateOne(
		{ _id: req.params.id },
		{
			...req.body,
			_id: req.params.id,
			userId: 1,
		}
	)
		.then(() => res.status(200).json({ message: "Operation modifié!" }))
		.catch((error) => res.status(401).json({ error }));
};

exports.getAllOperations = (req, res, next) => {
	Operation.find()
		.then((operations) => res.status(200).json(operations))
		.catch((error) => res.status(400).json({ error }));
	// res.status(200).json({ message: "ok" });
};

exports.deleteOperation = (req, res, next) => {
	Operation.deleteOne({ _id: req.params.id })
		.then(() => res.status(200).json({ message: "Operation supprimé !" }))
		.catch((error) => res.status(400).json({ error }));
};
