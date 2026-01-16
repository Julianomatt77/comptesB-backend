import jwt from "jsonwebtoken";

export default (req, res, next) => {
	// console.log(req.headers);
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
		const userId = decodedToken.userId;
		req.auth = {
			userId: userId,
		};
		req.userId = userId;
		next();
	} catch (error) {
		res.status(401).json({ error });
	}
};
