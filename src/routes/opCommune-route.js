const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const opCommunes = require("../controllers/opCommune-ctrl");

router.get("/getAllOperations", auth, opCommunes.getAllOperations);
router.get("/getAllUsers", auth, opCommunes.getAllUsers);
router.post("/getOperationsFiltered", auth, opCommunes.getOperationsFiltered);
router.post("/createOperation", auth, opCommunes.createOperation);
router.post("/createUser", auth, opCommunes.createUser);
router.get("/getOneOperation/:id", auth, opCommunes.getOneOperation);
router.get("/getOneUser/:id", auth, opCommunes.getOneUser);
router.get("/getOneUserByName/:name", auth, opCommunes.getOneUserByName);
router.post("/updateOneOperation/:id", auth, opCommunes.updateOneOperation);
router.post("/updateOneUser/:id", auth, opCommunes.updateOneUser);
router.delete("/deleteOperation/:id", auth, opCommunes.deleteOperation);
router.delete("/deleteUser/:id", auth, opCommunes.deleteUser);

module.exports = router;
