const _ = require("lodash"); // has many utility functions, here we need "extend"
const User = require("../models/user");
const formidable = require("formidable"); // for handling file uploads
const fs = require("fs"); // node.js core module for filesystem operations

// This is run whenever an request has userId in its param.
// It looks up the user with that id in the database and attach it to .profile of the req
exports.userById = (req, res, next, id) => {
  User.findById(id)
    // populate followers and following users array
    .populate("following", "_id name") // 1. what is it that you want to populate 2. what fields
    .populate("followers", "_id, name")
    .exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User not found"
        });
      }
      req.profile = user; // add profile object in req with user info
      next();
    });
};

exports.hasAuthorization = (req, res, next) => {
  const authorized =
    req.profile && req.auth && req.profile._id === req.auth._id;
  if (!authorized) {
    return res
      .status(403)
      .json({ error: "User is not authorized to perform this action" });
  }
};

exports.allUsers = (req, res) => {
  User.find((err, users) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }
    res.json(users);
  }).select("name email updated created");
};

exports.getUser = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  // first argument is all the data, second argument is how to handle the data
  form.parse(req, (error, fields, files) => {
    if (error) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      });
    }
    // save user
    let user = req.profile;
    user = _.extend(user, fields);
    user.updated = Date.now();

    if (files.photo) {
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contenType = files.photo.type;
    }

    user.save((error, result) => {
      if (error) {
        return res.status(400).json({
          error: error
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    });
  });
};

exports.userPhoto = (req, res, next) => {
  if (req.profile.photo.data) {
    // TODO: why doesn't this work...??!!
    // res.setHeader("Content-Type", res.profile.photo.contentType);
    return res.send(req.profile.photo.data);
  }
  next();
};

exports.deleteUser = (req, res, next) => {
  let user = req.profile;
  user.remove((err, user) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }
    res.json({ message: "User is deleted successfully" });
  });
};

// follow and unfollow
exports.addFollowing = (req, res, next) => {
  // The logged in user is trying to follow the followId in req.body
  User.findByIdAndUpdate(
    req.body.userId,
    { $push: { following: req.body.followId } },
    (error, result) => {
      if (error) {
        return res.status(400).json({ error: error });
      }
      next();
    }
  );
};

exports.addFollowers = (req, res) => {
  // The logged in user is trying to follow the followId in req.body
  User.findByIdAndUpdate(
    req.body.followId,
    { $push: { followers: req.body.userId } },
    { new: true } // so tne updated data is returned and see changes in following and followers
  )
    .populate("following", "_id name")
    .populate("followers", "_id name")
    .exec((error, result) => {
      if (error) {
        return res.status(400).json({ error: error });
      }
      result.hashed_password = undefined;
      result.salt = undefined;
      res.json(result);
    });
};

exports.removeFollowing = (req, res, next) => {
  User.findByIdAndUpdate(
    req.body.userId,
    { $pull: { following: req.body.unfollowId } },
    (error, result) => {
      if (error) {
        return res.status(400).json({ error: error });
      }
      next();
    }
  );
};

exports.removeFollowers = (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    { $pull: { followers: req.body.userId } },
    { new: true } // so the updated data is returned and see changes in following and followers
  )
    .populate("following", "_id name")
    .populate("followers", "_id name")
    .exec((error, result) => {
      if (error) {
        return res.status(400).json({ error: error });
      }
      result.hashed_password = undefined;
      result.salt = undefined;
      res.json(result);
    });
};

exports.findPeople = (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  User.find({ _id: { $nin: following } }, (error, users) => {
    if (error) {
      return res.status(400).json({ error: error });
    }

    res.json(users);
  }).select("name created");
};
