const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const compteCtrl = require("../controllers/comptesB-ctrl");

// router.get("/getAllAccounts", compteCtrl.getAllAccounts);
// router.post("/createAccount", compteCtrl.createAccount);
// router.get("/getOneAccount/:id", compteCtrl.getOneAccount);
// router.get("/getOneAccountByName/:name", compteCtrl.getOneAccountByName);
// router.post("/updateSolde/:name", compteCtrl.updateSolde);
// router.post("/updateOneAccount/:id", compteCtrl.updateOneAccount);
// router.delete("/deleteAccount/:id", compteCtrl.deleteAccount);
router.get("/getAllAccounts", auth, compteCtrl.getAllAccounts);
router.get("/getAllDeactivatedAccounts", auth, compteCtrl.getAllDeactivatedAccounts);
router.post("/createAccount", auth, compteCtrl.createAccount);
router.get("/getOneAccount/:id", auth, compteCtrl.getOneAccount);
router.get("/getOneAccountByName/:name", auth, compteCtrl.getOneAccountByName);
router.post("/updateSolde/:name", auth, compteCtrl.updateSolde);
router.post("/updateOneAccount/:id", auth, compteCtrl.updateOneAccount);
router.post("/deleteAccount/:id", auth, compteCtrl.deleteAccount);
router.post("/reactivateAccount/:id", auth, compteCtrl.reactivateAccount);

module.exports = router;
