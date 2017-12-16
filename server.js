var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var request = require("request");
var cheerio = require("cheerio");  

// Require all models
var db = require("./models");

var PORT = 3000 || process.env.PORT;

var helpers = require('handlebars-helpers')();


var exphbs = require("express-handlebars");

// Initialize Express
var app = express();  



var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/week18Populator";

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use("/", require("./routes/htmlRoutes/appRoutes.js"));

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes

app.get("/scrape", function(req, res) {

  // Make a request for the news section of npr tech stories
  request("https://www.npr.org/sections/alltechconsidered/", function(error, response, html) {
    
      // Load the HTML into cheerio and save it to a variable
      // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
      var $ = cheerio.load(html);
   
      // With cheerio, find each p-tag with the "title" class
      // (i: iterator. element: the current element)
      $("article.has-image").each(function(i, element) {
    
        // Save the text of the element in a "title" variable
      var title = $(element).children("div.item-info").children("h2.title").text();
      var link = $(element).children("div.item-info").children("p.teaser").children("a").attr("href");
      var summary = $(element).children("div.item-info").children("p.teaser").text();
      var image = $(element).children("div.item-image").children("div.imagewrap").children("a").children("img").attr("src");
    

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.Article.create({
          title: title,
          link: link,
          summary: summary,
          image: image
        },
        function(err, inserted) {
          console.log('ERROR:', err);
        });


      }
    });
db.Article.find({}).then(function(Articles){

    // Send a "Scrape Complete" message to the browser
  res.json({
    count: Articles.length,
    articles: Articles
  });
});
  });

  
});


app.get("/", function(req, res) {
  db.Article
  .find({}).sort({_id:-1})
  .then(function(dbArticle) {
    // If we were able to successfully find Articles, send them back to the client
    // res.json(dbArticle);
    res.render("index", { Article: dbArticle });
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json("stupid error");
  });
});

app.get("/saved", function(req, res) {
  db.Article
  .find({})
  .then(function(dbArticle) {
    // If we were able to successfully find Articles, send them back to the client
    // res.json(dbArticle);
    res.render("saved", { Article: dbArticle });
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json("stupid error");
  });
});


// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
