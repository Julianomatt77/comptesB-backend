import express from "express";
import auth from "../middleware/auth.js";
const router = express.Router();

import * as operationCtrl from "../controllers/operation-ctrl.js";

router.get("/getAllOperations", auth, operationCtrl.getAllOperations);
router.post("/getOperationsFiltered", auth, operationCtrl.getOperationsFiltered);
router.post("/createOperation", auth, operationCtrl.createOperation);

router.post("/uploadAccountHistory", auth, operationCtrl.uploadAccountHistory);
router.get("/getAccountHistory", auth, operationCtrl.getAccountHistory);
router.get("/getEpargneHistory", auth, operationCtrl.getEpargneHistory);

router.get("/getOneOperation/:id", auth, operationCtrl.getOneOperation);
router.post("/updateOneOperation/:id", auth, operationCtrl.updateOneOperation);
router.delete("/deleteOperation/:id", auth, operationCtrl.deleteOperation);

export default router;
