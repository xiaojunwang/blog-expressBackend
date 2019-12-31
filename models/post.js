// Model for Post that communicates with the database

const mongoose = require("mongoose"); // for DB
const { ObjectId } = mongoose.Schema; // to get User to associate Post with User

// Define the Post object schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  photo: {
    data: Buffer, // binary data type, upload takes time, until photo is fully uploaded, it will exist in the buffer
    contentType: String
  },
  postedBy: {
    type: ObjectId,
    ref: "User" // Model name
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: Date,
  likes: [{ type: ObjectId, ref: "User" }],
  comments: [
    {
      text: String,
      created: { type: Date, default: Date.now },
      postedBy: { type: ObjectId, ref: "User" }
    }
  ]
});

// take Model name and schema
module.exports = mongoose.model("Post", postSchema);
