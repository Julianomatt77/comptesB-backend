const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
	bcrypt
		.hash(req.body.password, 10)
		.then((hash) => {
			const user = new User({
				username: req.body.username,
				email: req.body.email,
				password: hash,
			});
			user
				.save()
				.then(() => res.status(201).json({ message: "Utilisateur créé !" }))
				.catch((error) => res.status(400).json({ error }));
		})
		.catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
	console.log(req.body);
	User.findOne({ username: req.body.username })
		.then((user) => {
			if (user === null) {
				res.status(400).json({ message: "Invalid credentials" });
			} else {
				console.log(req.body.password, user.password);
				bcrypt
					.compare(req.body.password, user.password)
					.then((valid) => {
						if (!valid) {
							res.status(400).json({ message: "Invalid credentials" });
						} else {
							res.status(200).json({
								userId: user._id,
								token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", { expiresIn: "24h" }),
							});
						}
					})
					.catch((error) => {
						res.status(500).json({ error });
					});
			}
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};

exports.signout = (req, res) => {
	try {
		req.session = null;
		return res.status(200).send({ message: "You've been signed out!" });
	} catch (err) {
		this.next(err);
	}
};
