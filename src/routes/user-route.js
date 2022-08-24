const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const userCtrl = require("../controllers/user-ctrl");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.post("/signout", userCtrl.signout);

router.post("/updateOneUser/:id", userCtrl.updateOneUser);
router.get("/getOneUser/:id", auth, userCtrl.getOneUser);

router.delete("/deleteUser/:id", auth, userCtrl.deleteUser);

module.exports = router;
