const express = require("express");
const app = express(); // create the express application to use
const mongoose = require("mongoose"); // to connect to database
const morgan = require("morgan");
const bodyParser = require("body-parser"); // to parse request body in express applications
const cookieParser = require("cookie-parser"); // to parse request cookie e.g. in authentication flow
const expressValidator = require("express-validator"); // for handling validation errors and give user proper error message
const fs = require("fs"); // to serve apiDocs
const cors = require("cors"); // to host front end and back end on different domains
// to access variables defined in .env
const dotenv = require("dotenv");
dotenv.config();

// Connect DB, from the mongoose package and vars in .env
let uri =
  "mongodb://heroku_cp58m4qq:bliv9d1u69dpeultbu52n3vmsj@ds259878.mlab.com:59878/heroku_cp58m4qq"; // heroku
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4 // Use IPv4, skip trying IPv6
  })
  .then(() => console.log("DB Connected"));

mongoose.connection.on("error", err => {
  console.log(`DB connection error: ${err.message}`);
});

// Bring in routes
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
// serve apiDocs at root
app.get("/", (req, res) => {
  fs.readFile("docs/apiDocs.json", (error, data) => {
    if (error) {
      res.status(400).json({
        error: error
      });
    }
    const docs = JSON.parse(data);
    res.json(docs);
  });
});

// Middleware
app.use(morgan("dev")); // tells you more information about each request, logged to console
app.use(bodyParser.json()); // parse request body as json
app.use(cookieParser()); // parse request cookie
app.use(expressValidator()); // for validating inputs and give user proper messages
app.use(cors()); // cross origin resource sharing
app.use("/", postRoutes); // postRoutes works as a middleware, any request to "/" will be passed to postRoutes
app.use("/", authRoutes);
app.use("/", userRoutes);
// express-jwt to handle unauthorized error with a more succinct error message
app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// from the dotenv package
const port = process.env.port || 8080;
app.listen(port, () => {
  console.log(`A Node JS API is listening on port: ${port}`);
});
