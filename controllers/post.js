const Post = require("../models/post"); // import the Post model from the database
const formidable = require("formidable"); // for handling file uploads
const fs = require("fs"); // node.js core module for filesystem operations
const _ = require("lodash"); // for update

// will be run whenever there is a postId in the request param and attach the post to req
exports.postById = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id name")
    // .populate("comments", "text created") // probably wrong
    .populate("comments.postedBy", "_id name")
    .select("_id title body created likes comments photo")
    .exec((error, post) => {
      if (error || !post) {
        return res.status(400).json({ error: error });
      }
      req.post = post;
      next();
    });
};

exports.getPosts = (req, res) => {
  const posts = Post.find()
    .populate("postedBy", "_id name")
    .populate("comments", "text created")
    .populate("comments.postedBy", "_id name")
    .select("_id title body created likes")
    .sort({ created: -1 })
    .then(posts => {
      res.json(posts);
    })
    .catch(err => console.log(err));
};

exports.createPost = (req, res, next) => {
  let form = new formidable.IncomingForm(); // get the incoming form fields
  form.keepExtensions = true; // keep e.g. .png format
  form.parse(req, (error, fields, files) => {
    if (error) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      });
    }
    let post = new Post(fields);
    // remove the pw and salt then assign the user to this post
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    post.postedBy = req.profile;
    // process photo
    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path); // read file synchronously
      post.photo.contentType = files.photo.type;
    }
    post.save((error, result) => {
      if (error) {
        return res.status(400).json({
          error: error
        });
      }
      res.json(result);
    });
  });
};

exports.postsByUser = (req, res) => {
  Post.find({ postedBy: req.profile._id })
    .populate("postedBy", "_id name")
    .select("_id title body created likes")
    .sort("_created")
    .exec((error, posts) => {
      if (error) {
        return res.status(400).json({
          error: error
        });
      }
      res.json(posts);
    });
};

exports.isPoster = (req, res, next) => {
  let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  if (!isPoster) {
    return res.status(403).json({ error: "User is not authorized." });
  }
  next();
};

// exports.updatePost = (req, res, next) => {
//   let post = req.post;
//   post = _.extend(post, req.body);
//   post.updated = Date.now;
//   post.save(error => {
//     if (error) {
//       return res.status(400).json({
//         error: error
//       });
//     }
//     res.json(post);
//   });
// };

exports.updatePost = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  // first argument is all the data, second argument is how to handle the data
  form.parse(req, (error, fields, files) => {
    if (error) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      });
    }
    // save post
    let post = req.post;
    post = _.extend(post, fields);
    post.updated = Date.now();

    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contenType = files.photo.type;
    }

    post.save((error, result) => {
      if (error) {
        return res.status(400).json({
          error: error
        });
      }
      res.json(post);
    });
  });
};

exports.deletePost = (req, res) => {
  let post = req.post;
  post.remove((error, post) => {
    if (error) {
      return res.status(400).json({ error: error });
    }
    res.json({ message: "Post deleted successfully." });
  });
};

exports.photo = (req, res, next) => {
  res.set("Content-Type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

exports.singlePost = (req, res) => {
  return res.json(req.post);
};

exports.like = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.body.userId } },
    { new: true }
  ).exec((error, result) => {
    if (error) {
      return res.status(400).json({ error: error });
    } else {
      res.json(result);
    }
  });
};

exports.unlike = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.body.userId } },
    { new: true }
  ).exec((error, result) => {
    if (error) {
      return res.status(400).json({ error: error });
    } else {
      res.json(result);
    }
  });
};

exports.comment = (req, res) => {
  let comment = req.body.comment;
  comment.postedBy = req.body.userId;

  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: comment } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((error, result) => {
      if (error) {
        return res.status(400).json({ error: error });
      } else {
        res.json(result);
      }
    });
};

exports.uncomment = (req, res) => {
  let comment = req.body.comment;

  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { comments: { _id: comment._id } } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((error, result) => {
      if (error) {
        return res.status(400).json({ error: error });
      } else {
        res.json(result);
      }
    });
};
