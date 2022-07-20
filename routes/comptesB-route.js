const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const compteCtrl = require("../controllers/comptesB-ctrl");

router.get("/getAllAccounts", compteCtrl.getAllAccounts);
router.post("/createAccount", compteCtrl.createAccount);
router.get("/getOneAccount/:id", compteCtrl.getOneAccount);
router.get("/getOneAccountByName/:name", compteCtrl.getOneAccountByName);
router.post("/updateSolde/:name", compteCtrl.updateSolde);
router.post("/updateOneAccount/:id", compteCtrl.updateOneAccount);
router.delete("/deleteAccount/:id", compteCtrl.deleteAccount);

module.exports = router;
