import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.ts";

export const signup = async (req, res, next) => {
	try {
		const hash = await bcrypt.hash(req.body.password, 10);
		await prisma.user.create({
			data: {
				username: req.body.username,
				email: req.body.email,
				password: hash,
				isDeleted: false
			}
		});
		res.status(201).json({ message: "Utilisateur créé !" });
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const login = async (req, res, next) => {
	try {
		const user = await prisma.user.findUnique({
			where: { username: req.body.username }
		});

		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}
		if (user.isDeleted) {
			return res.status(400).json({ message: "Ce compte utilisateur a été supprimé" });
		}

		const valid = await bcrypt.compare(req.body.password, user.password);
		if (!valid) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		res.status(200).json({
			username: user.username,
			userId: user.id,
			token: jwt.sign({ userId: user.id }, "RANDOM_TOKEN_SECRET", { expiresIn: "24h" }),
		});
	} catch (error) {
		res.status(500).json({ error });
	}
};

export const signout = (req, res, next) => {
	try {
		req.session = null;
		res.status(200).send({ message: "You've been signed out!" });
	} catch (err) {
		res.status(500).json({ err });
	}
};

export const getOneUser = async (req, res, next) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: parseInt(req.params.id) }
		});
		res.status(200).json(user);
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const deleteUser = async (req, res, next) => {
	try {
		await prisma.user.update({
			where: { id: parseInt(req.params.id) },
			data: { isDeleted: true }
		});
		res.status(200).json({ message: "Utilisateur supprimé !" });
	} catch (error) {
		res.status(400).json({ error });
	}
};

export const updateOneUser = async (req, res, next) => {
	try {
		const data = {
			username: req.body.user.username,
			email: req.body.user.email,
		};

		if (req.body.user.password) {
			data.password = await bcrypt.hash(req.body.user.password, 10);
		}

		await prisma.user.update({
			where: { id: parseInt(req.params.id) },
			data: data
		});
		res.status(200).json({ message: "Utilisateur modifié!" });
	} catch (error) {
		res.status(401).json({ error });
	}
};
