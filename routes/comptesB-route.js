const express = require("express");
// const auth = require("../middleware/auth");
const router = express.Router();

const compteCtrl = require("../controllers/comptesB-ctrl");

router.get("/", compteCtrl.getAllAccounts);
router.post("/", compteCtrl.createAccount);
router.get("/:id", compteCtrl.getOneAccount);
router.post("/:id", compteCtrl.updateOneAccount);
router.delete("/:id", compteCtrl.deleteAccount);

module.exports = router;
