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

export const monthlyRecapByAccount = async (req, res) => {
	const { year, month } = req.query;
	const userId = req.auth.userId;

	const start = new Date(`${year}-${month}-01`);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);

	try {
		const comptes = await prisma.compte.findMany({
			where: {
				userId: userId,
				typeCompte: 'Compte Courant',
				isDeleted: false
			}
		});

		const result = await Promise.all(
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

		res.status(200).json(result);
	} catch (error) {
		res.status(400).json({ error });
	}
};
