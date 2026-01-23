import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";

import * as userCtrl from "../controllers/user-ctrl.js";

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.post("/signout", userCtrl.signout);

router.post("/updateOneUser/:id", userCtrl.updateOneUser);
router.get("/getOneUser/:id", auth, userCtrl.getOneUser);

router.delete("/deleteUser/:id", auth, userCtrl.deleteUser);

export default router;
