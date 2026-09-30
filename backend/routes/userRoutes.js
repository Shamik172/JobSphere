const express = require("express");
const router = express.Router();
const { lookupUserByEmail, activateAccount, verifyTempPassword } = require("../controllers/userController");

router.get("/lookup", lookupUserByEmail);
router.post("/activate-account", activateAccount);
router.post("/verify-temp-password", verifyTempPassword);

module.exports = router;