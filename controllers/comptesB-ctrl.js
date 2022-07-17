const Compte = require("../models/Compte");
// const fs = require("fs");

exports.createAccount = (req, res, next) => {
	delete req.body._id;
	// delete req.body.userId;
	const compte = new Compte({
		// ...req.body,
		name: req.body._name,
		typeCompte: req.body._typeCompte,
		soldeInitial: req.body._soldeInitial,
		soldeActuel: req.body._soldeInitial,
		userId: 1,
	});
	compte
		.save()
		.then(() => res.status(201).json({ message: "Compte enregistré !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.getOneAccount = (req, res, then) => {
	Compte.findOne({ _id: req.params.id })
		.then((compte) => res.status(200).json(compte))
		.catch((error) => res.status(400).json({ error }));
};

exports.updateOneAccount = (req, res, next) => {
	Compte.updateOne(
		{ _id: req.params.id },
		{
			...req.body.compte,
			_id: req.params.id,
			userId: 1,
		}
	)
		.then(() => res.status(200).json({ message: "Compte modifié!" }))
		.catch((error) => res.status(401).json({ error }));
};

exports.getAllAccounts = (req, res, next) => {
	Compte.find()
		.then((comptes) => res.status(200).json(comptes))
		.catch((error) => res.status(400).json({ error }));
	// res.status(200).json({ message: "ok" });
};

exports.deleteAccount = (req, res, next) => {
	Compte.deleteOne({ _id: req.params.id })
		.then(() => res.status(200).json({ message: "Compte supprimé !" }))
		.catch((error) => res.status(400).json({ error }));
};
