const express = require("express");

const login = require("../auth/login");
const createUser = require("../auth/signup");
const {verifyToken} = require("../middleware/jwt.middleware");

const router = express.Router();

router.post("/signup", createUser);
router.post("/login",  login);
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
});
module.exports = router;