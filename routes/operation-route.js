const express = require("express");
// const auth = require("../middleware/auth");
const router = express.Router();

const operationCtrl = require("../controllers/operation-ctrl");

router.get("/", operationCtrl.getAllOperations);
router.post("/", operationCtrl.createOperation);
router.get("/:id", operationCtrl.getOneOperation);
router.put("/:id", operationCtrl.updateOneOperation);
router.delete("/:id", operationCtrl.deleteOperation);

module.exports = router;
