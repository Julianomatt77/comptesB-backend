const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const operationCtrl = require("../controllers/operation-ctrl");

router.get("/getAllOperations", operationCtrl.getAllOperations);
router.post("/createOperation", operationCtrl.createOperation);
router.get("/getOneOperation/:id", operationCtrl.getOneOperation);
router.post("/updateOneOperation/:id", operationCtrl.updateOneOperation);
router.delete("/deleteOperation/:id", operationCtrl.deleteOperation);

module.exports = router;
