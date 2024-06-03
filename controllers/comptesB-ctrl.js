const Compte = require("../models/Compte");
const Operation = require("../models/Operation");
// const fs = require("fs");
let operationsYears = [];

exports.createAccount = (req, res, next) => {
	delete req.body._id;
	// delete req.body.userId;
	const compte = new Compte({
		// ...req.body,
		name: req.body._name,
		typeCompte: req.body._typeCompte,
		soldeInitial: req.body._soldeInitial,
		soldeActuel: req.body._soldeInitial,
		isDeleted: false,
		// userId: 1,
		userId: req.auth.userId,
	});
	compte
		.save()
		.then(() => res.status(201).json({ message: "Compte enregistré !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.getOneAccount = (req, res, then) => {
	Compte.findOne({ _id: req.params.id, userId: req.auth.userId })
		.then((compte) => {
			if (!compte) {
				return res.status(404).json({ message: 'Compte non trouvé' });
			}

			if (compte.isDeleted){
				return res.status(404).json({ message: 'Compte supprimé' });
			}

			return getAccountHistory(compte).then((accountsHistory) => {
				updateSoldeInitial(compte, accountsHistory);
				res.status(200).json(compte);
			});
		})
		.catch((error) => res.status(400).json({ error }));
};

exports.updateOneAccount = (req, res, next) => {
	Compte.updateOne(
		{ _id: req.params.id, userId: req.auth.userId },
		{
			name: req.body.compte.name,
			typeCompte: req.body.compte.typeCompte,
			soldeInitial: req.body.compte.soldeInitial,
			soldeActuel: req.body.compte.soldeActuel
		}
	)
		.then(() => res.status(200).json({ message: "Compte modifié!" }))
		.catch((error) => res.status(401).json({ error }));
};

exports.getAllAccounts = (req, res, next) => {
	Compte.find({userId: req.auth.userId})
		.then((comptes) => {
			// Filtrer les comptes pour exclure ceux qui ne sont pas actifs
			const activeComptes = comptes.filter(compte => !compte.isDeleted);
			const userId = req.auth.userId;

			return getAccountHistory(activeComptes, userId).then((accountsHistory) => {
				activeComptes.forEach((compte) => {
					updateSoldeInitial(compte, accountsHistory);
				});
				res.status(200).json(activeComptes);
			});
		})
		.catch((error) => {
			console.log(error)
			res.status(400).json({ error })
		});
};

exports.deleteAccount = (req, res, next) => {
	Compte.updateOne({ _id: req.body.id, userId: req.auth.userId },{
		isDeleted: true
	})
		.then(() => res.status(200).json({ message: "Compte supprimé !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.updateSolde = (req, res, next) => {
	Compte.findOne({ name: req.params.name, userId: req.auth.userId })
		.then((compte) => {
			Compte.updateOne(
				{ _id: compte._id },
				{
					_id: compte._id,
					name: compte.name,
					typeCompte: compte.typeCompte,
					soldeInitial: compte.soldeInitial,
					// userId: compte.userId,
					soldeActuel: req.body.solde,
				}
			)
				.then(() => {
					res.status(200).json({ message: "Compte modifié!" });
				})
				.catch((error) => {
					res.status(401).json({ error });
				});
		})
		.catch((error) => res.status(400).json({ error }));
};

exports.getOneAccountByName = (req, res, then) => {
	Compte.findOne({ name: req.params.name , userId: req.params.userId, isDeleted: !true})
		.then((compte) => {
			const userId = req.auth.userId

			return getAccountHistory(compte, userId).then((accountsHistory) => {
				updateSoldeInitial(compte, accountsHistory);
				res.status(200).json(compte);
			});
		})
		.catch((error) => res.status(400).json({ error }));
};

exports.getAllDeactivatedAccounts = (req, res, next) => {
	Compte.find({userId: req.auth.userId})
		.then((comptes) => {
			// Filtrer les comptes pour exclure ceux qui ne sont pas actifs
			const DeactiveComptes = comptes.filter(compte => compte.isDeleted);
			const userId = req.auth.userId;

			return getAccountHistory(DeactiveComptes, userId).then((accountsHistory) => {
				DeactiveComptes.forEach((compte) => {
					updateSoldeInitial(compte, accountsHistory);
				});
				res.status(200).json(DeactiveComptes);
			});
		})
		.catch((error) => {
			console.log(error)
			res.status(400).json({ error })
		});
};

exports.reactivateAccount = (req, res, next) => {
	Compte.updateOne({ _id: req.body.id, userId: req.auth.userId },{
		isDeleted: false
	})
		.then(() => res.status(200).json({ message: "Compte réactivé !" }))
		.catch((error) => res.status(400).json({ error }));
};

function getAccountHistory(comptes, userId) {
	let currentYear = new Date(Date.now()).getFullYear();
	let operationsYears = []
	let sortByDate = { operationDate: 1 };

	return Operation.find({userId: userId})
		.sort(sortByDate)
		.then((operations) => {
			if (operations && operations.length > 0){
				const promises = operations
					.filter((operation) => {
						if (Array.isArray(comptes)) {
							let indexTrouve = comptes.findIndex((compte) => operation.compte === compte.id);
							if (indexTrouve !== -1) {
								operation.compteName = comptes[indexTrouve].name;
								operation.compteType = comptes[indexTrouve].typeCompte;
								return true; // Conserver cette opération
							}
						} else {
							if (comptes.id === operation.compte) {
								operation.compteName = comptes.name;
								operation.compteType = comptes.typeCompte;
								return true; // Conserver cette opération
							}
						}
						return false; // Supprimer cette opération
					})
					.map((operation) => {
						// Retourner les opérations modifiées
						return operation;
					});

				return Promise.all(promises);

			}

			return null
		})
		.then((operationsWithCompteInfo) => {
			if (operationsWithCompteInfo && operationsWithCompteInfo.length > 0){
				// Extraire les années de operationDate
				const operationYears = operationsWithCompteInfo.map((operation) => {
					return new Date(operation.operationDate).getFullYear();
				});
				const firstYear = operationYears.reduce((max, year) => Math.min(max, year));
				for (let i = 0; i <= currentYear - firstYear; i++) {
					operationsYears.unshift(currentYear - i);
				}

				const accountsHistory = {};
				// Créer l'objet history pour chaque compte
				operationsWithCompteInfo.forEach((operation) => {
					const compteId = operation.compte;
					let totalDebit = 0;
					let totalCredit = 0;

					if (!accountsHistory[compteId]) {
						accountsHistory[compteId] = {
							history: [],
						};
					}

					for (let year = firstYear; year <= currentYear; year++) {
						for (let month = 1; month <= 12; month++) {
							const operationDateKey = `${year}-${month < 10 ? '0' : ''}${month}`;

							// Vérifier si l'année existe dans l'historique du compte
							const entryIndex = accountsHistory[compteId].history.findIndex((entry) => entry.dateSolde === operationDateKey);

							// Si l'année n'existe pas, ajouter une nouvelle entrée
							if (entryIndex === -1) {
								accountsHistory[compteId].history.push({
									dateSolde: operationDateKey,
									soldeInitial: 0,
									soldeFinal: 0,
									montant: 0,
									totalCredit: 0,
									totalDebit: 0,
								});

								// Triez l'historique par dateSolde
								accountsHistory[compteId].history.sort((a, b) => a.dateSolde.localeCompare(b.dateSolde));
							}
						}
					}

					// Extraire l'année et le mois de operationDate
					const operationYear = new Date(operation.operationDate).getFullYear();
					const operationMonth = new Date(operation.operationDate).getMonth() + 1;
					const entryIndex = accountsHistory[compteId].history.findIndex(
						(entry) =>
							entry.dateSolde ===
							`${operationYear}-${operationMonth < 10 ? '0' : ''}${operationMonth}`
					);

					if (operation.type){
						totalCredit += operation.montant
						let temp = Math.round(totalCredit * 100) / 100;
						totalCredit = temp;
					} else {
						totalDebit += (-operation.montant)
						let temp = Math.round(totalDebit * 100) / 100;
						totalDebit = temp;
					}

					accountsHistory[compteId].history[entryIndex].montant += operation.montant;
					accountsHistory[compteId].history[entryIndex].totalCredit += totalCredit;
					accountsHistory[compteId].history[entryIndex].totalDebit += totalDebit;
				});

				return accountsHistory;
			}

			return []
		})
		.catch((error) => {
			console.log(error)
		});
}

function updateSoldeInitial(compte, accountsHistory) {
	const accountHistory = accountsHistory[compte.id] ? accountsHistory[compte.id].history : [];

	if (accountHistory.length > 0) {
		compte.history = accountHistory;

		// Mettre à jour le solde initial pour chaque entrée de l'historique
		compte.history.forEach((entry, index) => {
			if (index > 0) {
				entry.soldeInitial = compte.history[index - 1].soldeFinal;
			} else {
				// Pour la première entrée, utiliser le solde initial du compte
				entry.soldeInitial = compte.soldeInitial;
			}

			entry.soldeFinal = entry.soldeInitial + entry.montant;
		});
	} else {
		compte.history = [];
	}
}
