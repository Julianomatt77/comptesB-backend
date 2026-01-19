import fs from "fs";
import { prisma } from "../lib/prisma.ts";

export const createOperation = async (req, res, next) => {
	try {
		await prisma.operation.create({
			data: {
				montant: req.body._montant,
				type: req.body._type,
				categorie: req.body._categorie,
				compteId: parseInt(req.body._compte),
				description1: req.body._description1,
				description2: req.body._description2,
				operationDate: new Date(req.body._operationDate),
				solde: req.body._solde,
				userId: req.auth.userId,
			}
		});
		res.status(201).json({ message: "Operation enregistré !" });
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const getOneOperation = async (req, res, next) => {
	try {
		const operation = await prisma.operation.findUnique({
			where: { id: parseInt(req.params.id) },
			include: { compte: true }
		});

		if (!operation) {
			return res.status(404).json({ message: 'Opération non trouvée' });
		}

		const result = {
			...operation,
			compteName: operation.compte.name,
			compteType: operation.compte.typeCompte,
			compte: operation.compteId // pour compatibilité frontend
		};

		res.status(200).json(result);
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const updateOneOperation = async (req, res, next) => {
	try {
		const {
			montant,
			type,
			categorie,
			description1,
			description2,
			operationDate,
			solde,
			oldId
		} = req.body.operation;

		const opData = {
			montant,
			type,
			categorie,
			description1,
			description2,
			solde,
			oldId
		};

		if (opData.operationDate) opData.operationDate = new Date(opData.operationDate);
		if (req.body.operation.compte) {
			opData.compte = {
				connect: { id: Number(req.body.operation.compte) }
			};
		}

		await prisma.operation.update({
			where: { id: parseInt(req.params.id) },
			data: opData
		});
		res.status(200).json({ message: "Operation modifié!" });
	} catch (error) {
		res.status(401).json({ error });
	}
};

export const getAllOperations = async (req, res, next) => {
	try {
		const operations = await prisma.operation.findMany({
			where: {
				userId: req.auth.userId,
				compte: { isDeleted: false }
			},
			orderBy: { operationDate: 'desc' },
			include: { compte: true }
		});

		const result = operations.map(op => ({
			...op,
			compteName: op.compte.name,
			compteType: op.compte.typeCompte,
			compte: op.compteId
		}));

		res.status(200).json(result);
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const getOperationsFiltered = async (req, res, next) => {
	try {
		const { month, year } = req.body;
		let startDate, endDate;

		if (month) {
			startDate = new Date(year, month - 1, 1);
			endDate = new Date(year, month, 0, 23, 59, 59);
		} else {
			startDate = new Date(year, 0, 1);
			endDate = new Date(year, 11, 31, 23, 59, 59);
		}

		const operations = await prisma.operation.findMany({
			where: {
				userId: req.auth.userId,
				operationDate: { gte: startDate, lte: endDate },
				compte: { isDeleted: false }
			},
			orderBy: { operationDate: 'desc' },
			include: { compte: true }
		});

		const result = operations.map(op => ({
			...op,
			compteName: op.compte.name,
			compteType: op.compte.typeCompte,
			compte: op.compteId
		}));

		res.status(200).json(result);
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const deleteOperation = async (req, res, next) => {
	try {
		await prisma.operation.delete({
			where: { id: parseInt(req.params.id) }
		});
		res.status(200).json({ message: "Operation supprimé !" });
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const uploadAccountHistory = (req, res, next) => {
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

		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}

		fs.writeFile(uploadPath + filename, JSON.stringify(data), function (err) {});
		res.status(200).json({ message: "Historique enregistré !" });
	} catch (err) {
		return res.status(400).json({ message: "error writing file back-end : " + err });
	}
};

export const getAccountHistory = (req, res, next) => {
	try {
		let userId = req.auth.userId;
		let uploadPath = "uploads/account_History/";
		let filename = "accountHistory_" + userId + ".json";
		let fullFilePath = uploadPath + filename;
		let historique = JSON.parse(fs.readFileSync(fullFilePath));
		res.status(200).json(historique);
	} catch (err) {
		return res.status(400).json({ message: "error writing file back-end : " + err });
	}
};

export const getEpargneHistory = (req, res, next) => {
	try {
		let userId = req.auth.userId;
		let uploadPath = "uploads/epargne_History/";
		let filename = "epargneHistory_" + userId + ".json";
		let fullFilePath = uploadPath + filename;
		let historique = JSON.parse(fs.readFileSync(fullFilePath));
		res.status(200).json(historique);
	} catch (err) {
		return res.status(400).json({ message: "error writing file back-end : " + err });
	}
};
