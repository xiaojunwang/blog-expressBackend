const express = require("express"); // so we can use the express Router
const router = express.Router(); // now router can be used as a middleware

const {
  getPosts,
  createPost,
  postsByUser,
  postById,
  isPoster,
  updatePost,
  deletePost,
  photo,
  singlePost,
  like,
  unlike,
  comment,
  uncomment
} = require("../controllers/post"); // controller methods that handle Post related routes
const { createPostValidator } = require("../validator"); // bring in the Post validator
const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

// Like and unlike
router.put("/post/like", requireSignin, like);
router.put("/post/unlike", requireSignin, unlike);

// Comments
router.put("/post/comment", requireSignin, comment);
router.put("/post/uncomment", requireSignin, uncomment);

// route to get all the posts
router.get("/posts", getPosts);
// route to create a post, multiple middlewares, get to next only if previous pass
router.post(
  "/post/new/:userId",
  requireSignin,
  createPost,
  createPostValidator
);
// route to get all post by userId
router.get("/post/by/:userId", requireSignin, postsByUser);
// get one post by id
router.get("/post/:postId", singlePost);
// route to update posts
router.put("/post/:postId", requireSignin, isPoster, updatePost);
// route to delete a post by id
router.delete("/post/:postId", requireSignin, isPoster, deletePost);
// photo
router.get("/post/photo/:postId", photo);

// look for the userId param in all incoming request then run "userById" method
router.param("userId", userById);
// look for the postId param in all incoming request then run "postById" method
router.param("postId", postById);

module.exports = router;
