// This file contains all the validators
// Validators are used on the models (when creating an instance of)

// Post creation validator
exports.createPostValidator = (req, res, next) => {
  // Title
  req.check("title", "Write a title").notEmpty(); // first arg is field to check, second is error if invalid
  req.check("title", "Title must be between 4 to 150 characters").isLength({
    min: 4,
    max: 150
  });

  // Body
  req.check("body", "Write a body").notEmpty();
  req.check("body", "Title must be between 4 to 2000 characters").isLength({
    min: 4,
    max: 2000
  });

  // Check for errors
  const errors = req.validationErrors(); // get all the errors from above
  // if error, show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  // proceed to next middleware
  next();
};

// User sign up validation
exports.userSignupValidator = (req, res, next) => {
  // Name
  req.check("name", "Name is required").notEmpty();
  req.check("name", "Name must be between 4 to 30 characters").isLength({
    min: 4,
    max: 30
  });

  // Email
  req
    .check("email", "Email must be between 3 to 32 characters")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @")
    .isLength({ min: 3, max: 32 });

  // Password
  req.check("password", "Password is required").notEmpty();
  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number");

  // Check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  // proceed to next middleware
  next();
};

// Password reset validation
exports.passwordResetValidator = (req, res, next) => {
  // check for password
  req.check("newPassword", "Password is required").notEmpty();
  req
    .check("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number");

  // check for errors
  const errors = req.validationErrors();
  // get the first one if any
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  // proceed to next middleware
  next();
};
