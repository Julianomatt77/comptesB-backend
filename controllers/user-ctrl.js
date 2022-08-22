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
	User.findOne({ username: req.body.username })
		.then((user) => {
			if (user === null) {
				res.status(400).json({ message: "Invalid credentials" });
			} else {
				bcrypt
					.compare(req.body.password, user.password)
					.then((valid) => {
						if (!valid) {
							res.status(400).json({ message: "Invalid credentials" });
						} else {
							res.status(200).json({
								username: user.username,
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

exports.signout = (req, res, next) => {
	try {
		req.session = null;
		res.status(200).send({ message: "You've been signed out!" });
	} catch (err) {
		res.status(500).json({ err });
	}
};

exports.getOneUser = (req, res, then) => {
	User.findOne({ _id: req.params.id })
		.then((user) => res.status(200).json(user))
		.catch((error) => res.status(400).json({ error }));
};

exports.deleteUser = (req, res, next) => {
	User.deleteOne({ _id: req.params.id })
		.then(() => res.status(200).json({ message: "Utilisateur supprimé !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.updateOneUser = (req, res, next) => {
	if (req.body.user.password != undefined || req.body.user.password != null) {
		bcrypt.hash(req.body.user.password, 10).then((hash) => {
			User.updateOne(
				{ _id: req.params.id },
				{
					_id: req.params.id,
					username: req.body.user.username,
					email: req.body.user.email,
					password: hash,
				}
			)
				.then(() => res.status(200).json({ message: "Utilisateur modifié!" }))
				.catch((error) => res.status(401).json({ error }));
		});
	} else {
		User.updateOne(
			{ _id: req.params.id },
			{
				_id: req.params.id,
				username: req.body.user.username,
				email: req.body.user.email,
			}
		)
			.then(() => res.status(200).json({ message: "Utilisateur modifié!" }))
			.catch((error) => res.status(401).json({ error }));
	}
};
