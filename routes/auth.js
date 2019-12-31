const express = require("express");
const router = express.Router();

const { signup, signin, signout } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { userSignupValidator } = require("../validator");

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

// look for the userId param in all incoming request then run userById()
router.param("userId", userById);

module.exports = router;
