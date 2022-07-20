const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user-ctrl");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.post("/signout", userCtrl.signout);

module.exports = router;
