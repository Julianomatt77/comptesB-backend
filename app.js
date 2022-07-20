const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const dbConfig = require("./config/database.config.js");
var cors = require("cors");

const comptesRoutes = require("./routes/comptesB-route");
const operationsRoutes = require("./routes/operation-route");
const userRoutes = require("./routes/user-route");

app.use(express.json());

mongoose
	.connect(dbConfig.url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
	next();
});
app.options("*", cors());

app.use("/api/comptes", comptesRoutes);
app.use("/api/operations", operationsRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
