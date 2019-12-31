const jwt = require("jsonwebtoken"); // for generating web token to maintain user status
const expressJwt = require("express-jwt"); // for authorization
const User = require("../models/user");
require("dotenv").config(); // to access the JWT_SECRET

exports.signup = async (req, res) => {
  // findOne gives the result as soon as it's found
  const userExist = await User.findOne({
    email: req.body.email
  });
  if (userExist)
    return res.status(403).json({
      error: "Email is taken!"
    });

  const user = await new User(req.body);
  await user.save();

  res.status(200).json({ message: "Sign up successful." });
};

exports.signin = (req, res) => {
  // find the user based on email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    // if error or no user, return unauthorized error
    if (err || !user) {
      return res.status(401).json({
        error: "User with that email does not exist. Please sign up."
      });
    }
    // if user is found make sure the email and password match
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match"
      });
    }

    // generate a token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // persist the token as 't' in cookie with expiration date
    res.cookie("t", token, { expire: new Date() + 9999 });

    // return response with user and token to frontend client
    const { _id, name, email } = user;
    return res.json({ token, user: { _id, email, name } });
  });
};

// Sign out just needs to clear the cookie
exports.signout = (req, res) => {
  res.clearCookie("t");
  return res.json({ message: "Sign out successful" });
};

exports.requireSignin = expressJwt({
  // token is a combination of userId and secret, if user signed in should have this secret
  secret: process.env.JWT_SECRET,
  // if the token is valid, appends the verified user id
  // in an auth key to the request object
  userProperty: "auth"
});
