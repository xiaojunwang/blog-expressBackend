const express = require("express");
const router = express.Router();

const {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword
} = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { userSignupValidator, passwordResetValidator } = require("../validator");

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

// password forgot and reset routes
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", passwordResetValidator, resetPassword);

// look for the userId param in all incoming request then run userById()
router.param("userId", userById);

module.exports = router;
