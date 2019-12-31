const express = require("express");
const router = express.Router();

const {
  userById,
  allUsers,
  getUser,
  updateUser,
  deleteUser,
  userPhoto,
  addFollowing,
  addFollowers,
  removeFollowing,
  removeFollowers,
  findPeople
} = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

router.put("/user/follow", requireSignin, addFollowing, addFollowers);
router.put("/user/unfollow", requireSignin, removeFollowing, removeFollowers);
// router.put("/user/unfollow", requireSignin, removeFollowing, removeFollower);

router.get("/users", allUsers);
// anything put after /user/ will be treated as the userId
router.get("/user/:userId", requireSignin, getUser);
router.put("/user/:userId", requireSignin, updateUser);
router.delete("/user/:userId", requireSignin, deleteUser);
// photo
router.get("/user/photo/:userId", userPhoto);

// who to follow
router.get("/user/findpeople/:userId", requireSignin, findPeople);

// look for the userId param in all incoming request then run "userById" method
router.param("userId", userById);

module.exports = router;
