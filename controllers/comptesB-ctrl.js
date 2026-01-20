import { prisma } from "../lib/prisma.ts";

export const createAccount = async (req, res, next) => {
	try {
		await prisma.compte.create({
			data: {
				name: req.body.name,
				typeCompte: req.body.typeCompte,
				soldeInitial: req.body.soldeInitial,
				soldeActuel: req.body.soldeInitial,
				isDeleted: false,
				userId: req.auth.userId,
			}
		});
		res.status(201).json({ message: "Compte enregistré !" });
	} catch (error) {
		console.error(error);
		res.status(400).json({ error });
	}
};

export const getOneAccount = async (req, res, next) => {
	try {
		const compte = await prisma.compte.findFirst({
			where: { id: parseInt(req.params.id), userId: req.auth.userId }
		});

		if (!compte) {
			return res.status(404).json({ message: 'Compte non trouvé' });
		}

		if (compte.isDeleted) {
			return res.status(404).json({ message: 'Compte supprimé' });
		}

		const accountsHistory = await getAccountHistory(compte, req.auth.userId);
		updateSoldeInitial(compte, accountsHistory);
		res.status(200).json(compte);
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const updateOneAccount = async (req, res, next) => {
	try {
		const {
			name,
			typeCompte,
			soldeInitial,
			soldeActuel,
			isDeleted,
			userId,
			history,
			oldId
		} = req.body.compte;

		await prisma.compte.update({
			where: { id: Number(req.params.id), },
			data: {
				name,
				typeCompte,
				soldeInitial: Number(soldeInitial),
				soldeActuel: Number(soldeActuel),
			}
		});
		res.status(200).json({ message: "Compte modifié!" });
	} catch (error) {
		res.status(401).json({ error });
	}
};

export const getAllAccounts = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const comptes = await prisma.compte.findMany({
			where: { userId: userId, isDeleted: false }
		});

		const accountsHistory = await getAccountHistory(comptes, userId);
		comptes.forEach((compte) => {
			updateSoldeInitial(compte, accountsHistory);
		});
		res.status(200).json(comptes);
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const deleteAccount = async (req, res, next) => {
	try {
		await prisma.compte.updateMany({
			where: { id: parseInt(req.body.id), userId: req.auth.userId },
			data: { isDeleted: true }
		});
		res.status(200).json({ message: "Compte supprimé !" });
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const updateSolde = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const compte = await prisma.compte.findFirst({
			where: { name: req.params.name, userId: userId }
		});

		if (!compte) {
			return res.status(404).json({ message: "Compte non trouvé" });
		}

		await prisma.compte.update({
			where: { id: compte.id },
			data: { soldeActuel: req.body.solde }
		});
		res.status(200).json({ message: "Compte modifié!" });
	} catch (error) {
		res.status(401).json({ error });
	}
};

export const getOneAccountByName = async (req, res, next) => {
	try {
		const userId = parseInt(req.params.userId);
		const compte = await prisma.compte.findFirst({
			where: { name: req.params.name, userId: userId, isDeleted: false }
		});

		if (!compte) {
			return res.status(404).json({ message: "Compte non trouvé" });
		}

		const accountsHistory = await getAccountHistory(compte, userId);
		updateSoldeInitial(compte, accountsHistory);
		res.status(200).json(compte);
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const getAllDeactivatedAccounts = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const comptes = await prisma.compte.findMany({
			where: { userId: userId, isDeleted: true }
		});

		const accountsHistory = await getAccountHistory(comptes, userId);
		comptes.forEach((compte) => {
			updateSoldeInitial(compte, accountsHistory);
		});
		res.status(200).json(comptes);
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const reactivateAccount = async (req, res, next) => {
	try {
		await prisma.compte.updateMany({
			where: { id: parseInt(req.body.id), userId: req.auth.userId },
			data: { isDeleted: false }
		});
		res.status(200).json({ message: "Compte réactivé !" });
	} catch (error) {
		res.status(400).json({ error });
	}
};

async function getAccountHistory(comptes, userId) {
	const currentYear = new Date().getFullYear();
	try {
		const operations = await prisma.operation.findMany({
			where: { userId: userId },
			orderBy: { operationDate: 'asc' },
			include: { compte: true }
		});

		if (!operations || operations.length === 0) return [];

		const comptesArray = Array.isArray(comptes) ? comptes : [comptes];
		const comptesIds = comptesArray.map(c => c.id);

		const filteredOperations = operations.filter(op => comptesIds.includes(op.compteId));

		if (filteredOperations.length === 0) return [];

		const firstYear = new Date(filteredOperations[0].operationDate).getFullYear();
		const accountsHistory = {};

		filteredOperations.forEach((operation) => {
			const cId = operation.compteId;
			if (!accountsHistory[cId]) {
				accountsHistory[cId] = { history: [] };
				for (let year = firstYear; year <= currentYear; year++) {
					for (let month = 1; month <= 12; month++) {
						accountsHistory[cId].history.push({
							dateSolde: `${year}-${month < 10 ? '0' : ''}${month}`,
							soldeInitial: 0,
							soldeFinal: 0,
							montant: 0,
							totalCredit: 0,
							totalDebit: 0,
						});
					}
				}
			}

			const opDate = new Date(operation.operationDate);
			const dateKey = `${opDate.getFullYear()}-${(opDate.getMonth() + 1) < 10 ? '0' : ''}${opDate.getMonth() + 1}`;
			const entry = accountsHistory[cId].history.find(e => e.dateSolde === dateKey);

			if (entry) {
				const montantAbs = Math.abs(operation.montant);
				if (operation.type) {
					entry.totalCredit += montantAbs;
				} else {
					entry.totalDebit += montantAbs;
				}
				entry.montant += (operation.type ? montantAbs : -montantAbs);
			}
		});

		// Arrondir
		Object.values(accountsHistory).forEach(acc => {
			acc.history.forEach(entry => {
				entry.totalCredit = Math.round(entry.totalCredit * 100) / 100;
				entry.totalDebit = Math.round(entry.totalDebit * 100) / 100;
				entry.montant = Math.round(entry.montant * 100) / 100;
			});
		});

		return accountsHistory;
	} catch (error) {
		console.error(error);
		return [];
	}
}

function updateSoldeInitial(compte, accountsHistory) {
	const history = accountsHistory[compte.id] ? accountsHistory[compte.id].history : [];
	compte.history = history;

	if (history.length > 0) {
		history.forEach((entry, index) => {
			if (index > 0) {
				entry.soldeInitial = history[index - 1].soldeFinal;
			} else {
				entry.soldeInitial = compte.soldeInitial;
			}
			entry.soldeFinal = Math.round((entry.soldeInitial + entry.montant) * 100) / 100;
		});
	}
}

async function computeMonthlyRecap(userId, comptes, year, month) {
	const start = new Date(`${year}-${month}-01`);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);

	return await Promise.all(
		comptes.map(async compte => {
			const beforeMonth = await prisma.operation.aggregate({
				_sum: {montant: true},
				where: {
					compteId: compte.id,
					operationDate: {lt: start}
				},
			});

			const monthOps = await prisma.operation.findMany({
				where: {
					compteId: compte.id,
					operationDate: {
						gte: start,
						lt: end
					}
				}
			});

			const totalCredit = monthOps
				.filter(op => op.type === true)
				.reduce((s, op) => s + op.montant, 0);

			const totalDebit = monthOps
				.filter(op => op.type === false)
				.reduce((s, op) => s + Math.abs(op.montant), 0);

			const soldeDebut =
				compte.soldeInitial + (beforeMonth._sum.montant || 0);

			const soldeFin = soldeDebut + totalCredit - totalDebit;

			return {
				compteId: compte.id,
				name: compte.name,
				soldeDebut,
				totalCredit,
				totalDebit,
				soldeFin
			};
		})
	);
}

export const monthlyRecapByAccount = async (req, res) => {
	const { year, month } = req.query;
	const userId = req.auth.userId;

	try {
		const comptes = await prisma.compte.findMany({
			where: {
				userId: userId,
				typeCompte: 'Compte Courant',
				isDeleted: false
			}
		});

		const result = await computeMonthlyRecap(userId, comptes, year, month);

		res.status(200).json(result);
	} catch (error) {
		res.status(400).json({ error });
	}
};

/**
 * Récapitulatif annuel des comptes courants
 * GET /comptes/annual-recap/current-accounts?year=2024
 */
export const annualRecapCurrentAccounts = async (req, res) => {
	const { year } = req.query;
	const userId = req.auth.userId;

	try {
		// Récupérer tous les comptes courants actifs de l'utilisateur
		const comptes = await prisma.compte.findMany({
			where: {
				userId: userId,
				typeCompte: 'Compte Courant',
				isDeleted: false
			}
		});

		if (comptes.length === 0) {
			return res.status(200).json({
				monthlyRecap: Array.from({ length: 12 }, (_, i) => ({
					month: getMonthName(i + 1),
					monthNumber: i + 1,
					economie: 0,
					solde: 0
				})),
				soldeInitial: 0,
				soldeFinal: 0,
				evolution: 0,
				difference: 0
			});
		}

		const compteIds = comptes.map(c => c.id);

		// Récupérer toutes les opérations de l'année pour ces comptes
		const startDate = new Date(`${year}-01-01`);
		const endDate = new Date(`${year}-12-31T23:59:59`);
		let monthlyRecap = [];

		for (let month = 1; month <= 12; month++) {
			const result = await computeMonthlyRecap(userId, comptes, year, month);

			const soldeDebutTotal = result.reduce((sum, c) => sum + c.soldeDebut, 0);
			const totalCredit = result.reduce((sum, c) => sum + c.totalCredit, 0);
			const totalDebit = result.reduce((sum, c) => sum + c.totalDebit, 0);
			const soldeFinTotal = result.reduce((sum, c) => sum + c.soldeFin, 0);

			monthlyRecap.push({
				month: getMonthName(month),
				soldeInitial: Math.round(soldeDebutTotal * 100) / 100,
				economie: Math.round((totalCredit - totalDebit) * 100) / 100,
				soldeFinal: Math.round(soldeFinTotal * 100) / 100
			});
		}

		// // Calculer l'évolution
		const soldeInitial = monthlyRecap[0].soldeInitial;
		const soldeFinal = monthlyRecap[11].soldeFinal;
		const difference = soldeFinal - soldeInitial;
		const evolution = soldeInitial === 0 ? 0 : (difference / soldeInitial) * 100;

		res.status(200).json({
			monthlyRecap,
			soldeInitial: Math.round(soldeInitial * 100) / 100,
			soldeFinal: Math.round(soldeFinal * 100) / 100,
			evolution: Math.round(evolution * 100) / 100,
			difference: Math.round(difference * 100) / 100
		});
	} catch (error) {
		console.error('Error in annualRecapCurrentAccounts:', error);
		res.status(500).json({ error: error.message });
	}
};

/**
 * Récapitulatif annuel des comptes épargne/bourse
 * GET /comptes/annual-recap/savings-accounts?year=2024
 */
export const annualRecapSavingAccounts = async (req, res) => {
	const { year } = req.query;
	const userId = req.auth.userId;

	try {
		// Récupérer tous les comptes épargne/bourse actifs de l'utilisateur
		const comptes = await prisma.compte.findMany({
			where: {
				userId: userId,
				typeCompte: { in: ['Epargne', 'Bourse'] },
				isDeleted: false
			}
		});

		if (comptes.length === 0) {
			return res.status(200).json({
				monthlyRecap: Array.from({ length: 12 }, (_, i) => ({
					month: getMonthName(i + 1),
					monthNumber: i + 1,
					investi: 0,
					economie: 0,
					solde: 0
				})),
				soldeInitial: 0,
				soldeFinal: 0,
				totalInvesti: 0,
				evolution: 0
			});
		}

		const compteIds = comptes.map(c => c.id);

		// Récupérer toutes les opérations de l'année
		const startDate = new Date(`${year}-01-01`);
		const endDate = new Date(`${year}-12-31T23:59:59`);

		const operations = await prisma.operation.findMany({
			where: {
				userId: userId,
				compteId: { in: compteIds },
				operationDate: {
					gte: startDate,
					lte: endDate
				}
			},
			orderBy: { operationDate: 'asc' }
		});

		// Calculer le solde initial total
		const soldeInitial = comptes.reduce((sum, c) => sum + Number(c.soldeInitial), 0);

		// Générer le récapitulatif mensuel
		const monthlyRecap = [];
		let soldeCumul = soldeInitial;

		for (let month = 1; month <= 12; month++) {
			// Filtrer les opérations du mois
			const monthOperations = operations.filter(op => {
				const opMonth = new Date(op.operationDate).getMonth() + 1;
				return opMonth === month;
			});

			// Calculer les investissements (transferts positifs)
			const investi = monthOperations.reduce((sum, op) => {
				if (op.categorie === 'Transfert' && Number(op.montant) > 0) {
					return sum + Number(op.montant);
				}
				return sum;
			}, 0);

			// Calculer les opérations (hors transferts)
			const economie = monthOperations.reduce((sum, op) => {
				if (op.categorie !== 'Transfert') {
					return sum + Number(op.montant);
				}
				return sum;
			}, 0);

			soldeCumul += investi + economie;

			monthlyRecap.push({
				month: getMonthName(month),
				monthNumber: month,
				investi: Math.round(investi * 100) / 100,
				economie: Math.round(economie * 100) / 100,
				solde: Math.round(soldeCumul * 100) / 100
			});
		}

		// Calculer les totaux pour l'année
		const totalInvesti = monthlyRecap.reduce((sum, m) => sum + m.investi, 0);
		const soldeFinal = monthlyRecap[11].solde;

		// Evolution basée sur le total investi + solde initial
		const baseInvestissement = soldeInitial + totalInvesti;
		const evolution = baseInvestissement === 0 ? 0 :
			((soldeFinal - baseInvestissement) / baseInvestissement) * 100;

		res.status(200).json({
			monthlyRecap,
			soldeInitial: Math.round(soldeInitial * 100) / 100,
			soldeFinal: Math.round(soldeFinal * 100) / 100,
			totalInvesti: Math.round(totalInvesti * 100) / 100,
			evolution: Math.round(evolution * 100) / 100
		});
	} catch (error) {
		console.error('Error in annualRecapSavingAccounts:', error);
		res.status(500).json({ error: error.message });
	}
};

/**
 * Récapitulatif annuel par compte épargne/bourse
 * GET /comptes/annual-recap/savings-by-account?year=2024
 */
export const annualRecapSavingsByAccounts = async (req, res) => {
	const { year } = req.query;
	const userId = req.auth.userId;

	try {
		// Récupérer tous les comptes épargne/bourse actifs
		const comptes = await prisma.compte.findMany({
			where: {
				userId: userId,
				typeCompte: { in: ['Epargne', 'Bourse'] },
				isDeleted: false
			},
			orderBy: { name: 'asc' }
		});

		if (comptes.length === 0) {
			return res.status(200).json([{
				name: 'TOTAL',
				soldeInitial: 0,
				totalInvesti: 0,
				soldeFinal: 0,
				evolution: 0
			}]);
		}

		const startDate = new Date(`${year}-01-01`);
		const endDate = new Date(`${year}-12-31T23:59:59`);

		const yearlyRecap = [];
		let totalInitial = 0;
		let totalInvestiGlobal = 0;
		let totalFinal = 0;

		// Traiter chaque compte
		for (const compte of comptes) {
			// Récupérer les opérations de l'année pour ce compte
			const operations = await prisma.operation.findMany({
				where: {
					userId: userId,
					compteId: compte.id,
					operationDate: {
						gte: startDate,
						lte: endDate
					}
				}
			});

			// Calculer les investissements (transferts positifs)
			const investi = operations.reduce((sum, op) => {
				if (op.categorie === 'Transfert' && Number(op.montant) > 0) {
					return sum + Number(op.montant);
				}
				return sum;
			}, 0);

			// Calculer les opérations (hors transferts)
			const operationsMontant = operations.reduce((sum, op) => {
				if (op.categorie !== 'Transfert') {
					return sum + Number(op.montant);
				}
				return sum;
			}, 0);

			// Calculs pour ce compte
			const soldeInitial = Number(compte.soldeInitial);
			const soldeFinal = soldeInitial + investi + operationsMontant;
			const totalInvesti = soldeInitial + investi;

			// Evolution : (gain/perte) / (solde initial + investi)
			const evolution = totalInvesti === 0 ? 0 :
				((soldeFinal - totalInvesti) / totalInvesti) * 100;

			yearlyRecap.push({
				name: compte.name,
				soldeInitial: Math.round(soldeInitial * 100) / 100,
				totalInvesti: Math.round(totalInvesti * 100) / 100,
				soldeFinal: Math.round(soldeFinal * 100) / 100,
				evolution: Math.round(evolution * 100) / 100
			});

			// Accumuler pour le total
			totalInitial += soldeInitial;
			totalInvestiGlobal += totalInvesti;
			totalFinal += soldeFinal;
		}

		// Calculer l'évolution totale
		const totalEvolution = totalInvestiGlobal === 0 ? 0 :
			((totalFinal - totalInvestiGlobal) / totalInvestiGlobal) * 100;

		// Ajouter la ligne TOTAL
		yearlyRecap.push({
			name: 'TOTAL',
			soldeInitial: Math.round(totalInitial * 100) / 100,
			totalInvesti: Math.round(totalInvestiGlobal * 100) / 100,
			soldeFinal: Math.round(totalFinal * 100) / 100,
			evolution: Math.round(totalEvolution * 100) / 100
		});

		res.status(200).json(yearlyRecap);
	} catch (error) {
		console.error('Error in annualRecapSavingsByAccounts:', error);
		res.status(500).json({ error: error.message });
	}
};

// Fonction utilitaire pour les noms de mois (déjà présente)
function getMonthName(month) {
	const months = [
		'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
		'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
	];
	return months[month - 1];
}