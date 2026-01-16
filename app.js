import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from 'url';

import comptesRoutes from "./routes/comptesB-route.js";
import operationsRoutes from "./routes/operation-route.js";
import userRoutes from "./routes/user-route.js";
import { prisma } from "./lib/prisma.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Test de connexion Prisma (optionnel au démarrage)
prisma.$connect()
	.then(() => console.log("Connexion à MySQL via Prisma réussie !"))
	.catch((err) => console.log("Connexion à MySQL via Prisma échouée !: ", err));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, application/json");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
	next();
});
app.use(cors());

app.use("/api/comptes", comptesRoutes);
app.use("/api/operations", operationsRoutes);
app.use("/api/auth", userRoutes);

export default app;
