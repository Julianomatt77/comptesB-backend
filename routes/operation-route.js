const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const operationCtrl = require("../controllers/operation-ctrl");

router.get("/getAllOperations", auth, operationCtrl.getAllOperations);
router.post("/createOperation", auth, operationCtrl.createOperation);
router.get("/getOneOperation/:id", auth, operationCtrl.getOneOperation);
router.post("/updateOneOperation/:id", auth, operationCtrl.updateOneOperation);
router.delete("/deleteOperation/:id", auth, operationCtrl.deleteOperation);
// router.get("/getAllOperations", operationCtrl.getAllOperations);
// router.post("/createOperation", operationCtrl.createOperation);
// router.get("/getOneOperation/:id", operationCtrl.getOneOperation);
// router.post("/updateOneOperation/:id", operationCtrl.updateOneOperation);
// router.delete("/deleteOperation/:id", operationCtrl.deleteOperation);

module.exports = router;
