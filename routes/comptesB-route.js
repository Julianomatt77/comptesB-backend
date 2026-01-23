import express from "express";
import auth from "../middleware/auth.js";
const router = express.Router();

import * as compteCtrl from "../controllers/comptesB-ctrl.js";

router.get("/getAllAccounts", auth, compteCtrl.getAllAccounts);
router.get("/getAllDeactivatedAccounts", auth, compteCtrl.getAllDeactivatedAccounts);
router.post("/createAccount", auth, compteCtrl.createAccount);
router.get("/getOneAccount/:id", auth, compteCtrl.getOneAccount);
router.get("/getOneAccountByName/:name", auth, compteCtrl.getOneAccountByName);
router.post("/updateSolde/:name", auth, compteCtrl.updateSolde);
router.post("/updateOneAccount/:id", auth, compteCtrl.updateOneAccount);
router.post("/deleteAccount/:id", auth, compteCtrl.deleteAccount);
router.post("/reactivateAccount/:id", auth, compteCtrl.reactivateAccount);

// Récapitulatifs
router.get('/monthly-recap',auth, compteCtrl.monthlyRecapByAccount);
router.get('/annual-recap/current-accounts',auth, compteCtrl.annualRecapCurrentAccounts);
router.get('/annual-recap/savings-accounts',auth, compteCtrl.annualRecapSavingAccounts);
router.get('/annual-recap/savings-by-account',auth, compteCtrl.annualRecapSavingsByAccounts);

export default router;
