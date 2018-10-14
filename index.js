var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var POSTS_COLLECTION = "posts";

var app = express();
app.use(bodyParser.json());

// Create a database var
var db;

// Connect to the database
mongodb.MongoClient.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/test",
  function(err, client) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    // Save database object from the call back for reuse.
    db = client.db();

    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, function() {
      var port = server.address().port;
      console.log("App now running on port ", port);
    });
  }
);

// POSTS API ROUTES BELOW

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ error: message });
}

app.get("/api/posts", function(req, res) {
  db.collection(POSTS_COLLECTION)
    .find({})
    .toArray(function(err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get posts");
      } else {
        res.status(200).json(docs);
      }
    });
});

app.post("/api/posts", function(req, res) {
  var newPost = req.body;
  newPost.createDate = new Date();

  if (!req.body.title) {
    handleError(res, "Invalid post input", "Must provide a title.", 400);
  } else {
    db.collection(POSTS_COLLECTION).insertOne(newPost, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new post.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});
