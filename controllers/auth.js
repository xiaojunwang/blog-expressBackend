const jwt = require("jsonwebtoken"); // for generating web token to maintain user status
const expressJwt = require("express-jwt"); // for authorization
const User = require("../models/user");
require("dotenv").config(); // to access the JWT_SECRET
const _ = require("lodash");
const { sendEmail } = require("../helpers");
// load env
const dotenv = require("dotenv");
dotenv.config();

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

// forgot password
exports.forgotPassword = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "No request body" });
  }
  if (!req.body.email) {
    return res.status(400).json({ message: "No email in request body" });
  }

  const { email } = req.body;
  //find the user based on email
  User.findOne({ email }, (error, user) => {
    if (error || !user) {
      return res
        .status(400)
        .json({ error: "User with that email does not exist!" });
    }

    // generate a token with user id and secret
    const token = jwt.sign(
      { _id: user._id, iss: "NODEAPI" },
      process.env.JWT_SECRET
    );

    // email data
    const emailData = {
      from: "noreply@node-react.com",
      to: email,
      subject: "Password Reset Instructions",
      text: `Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
      html: `<p>Please use the following link to reset your password:</p> <p>${process.env.CLIENT_URL}/reset-password/${token}</p>`
    };

    return user.updateOne({ resetPasswordLink: token }, (error, success) => {
      if (error) {
        return res.json({ message: error });
      } else {
        sendEmail(emailData);
        return res.status(200).json({
          message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
        });
      }
    });
  });
};

// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  User.findOne({ resetPasswordLink }, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status("401").json({
        error: "Invalid Link!"
      });

    const updatedFields = {
      password: newPassword,
      resetPasswordLink: ""
    };

    user = _.extend(user, updatedFields);
    user.updated = Date.now();

    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      res.json({
        message: `Great! Now you can login with your new password.`
      });
    });
  });
};
