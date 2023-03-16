require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const multer = require("multer");
const Razorpay = require("razorpay");
const fs = require('fs');
const path = require('path');

mongoose.set("strictQuery", false);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const razorpay = new Razorpay({
  key_id:"rzp_test_Sq8gb0TuOhk10L",
  key_secret:"ac8L6eJwJGNeEBATDuiTBBgJ",
})

const UserDb = mongoose.createConnection("mongodb+srv://" + process.env.USER_NAME + ":" + process.env.PASSWORD + "@cluster0.uuy6sis.mongodb.net/UserInfo");
const Locate = mongoose.createConnection("mongodb+srv://" + process.env.USER_NAME + ":" + process.env.PASSWORD + "@cluster0.uuy6sis.mongodb.net/Location");
const Donate = mongoose.createConnection("mongodb+srv://" + process.env.USER_NAME + ":" + process.env.PASSWORD + "@cluster0.uuy6sis.mongodb.net/Donate");
const Suggestions = mongoose.createConnection("mongodb+srv://" + process.env.USER_NAME + ":" + process.env.PASSWORD + "@cluster0.uuy6sis.mongodb.net/Suggestions");


const User = UserDb.model("User", mongoose.Schema({
  username: String,
  password: String
}));

const Coordinate = Locate.model("Coordinate", mongoose.Schema({
  coord: String,
  contact: String
}));
const Donation = Donate.model("Donation", mongoose.Schema({
  name: String,
  amount: Number,
  email: String,
  address: String
}));

const Suggestion = Suggestions.model("Suggestion", mongoose.Schema({
  email: String,
  suggestion: String
}));

const Photo = mongoose.createConnection("mongodb+srv://" + process.env.USER_NAME + ":" + process.env.PASSWORD + "@cluster0.uuy6sis.mongodb.net/Photo");
const Image = Photo.model("Image", mongoose.Schema({
  address: String,
  contact: String,
  img: {
    data: Buffer,
    contentType: String
  }
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads")
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

const upload = multer({
  storage: storage
});

app.get("/imagesPage", (req, res) => {
  res.render("imagesPage");
});

app.post("/imagesPage", upload.single("image"), (req, res, next) => {

  const obj = {
    address: req.body.address,
    contact: req.body.contact,
    img: {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: "image/jpg"
    }
  }
  Image.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      // item.save();
      res.redirect("/imagesPage");
    }
  });
});

app.get("/givelocation", function(req, res) {
  console.log("location");
  res.render("givelocation");
});

app.post("/givelocation", function(req, res) {
  const newCoord = new Coordinate({
    coord: req.body.coord,
    contact: req.body.contact
  });
  newCoord.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Coord inserted");
      res.redirect("/thanks");
    }
  });
});

app.get("/suggestion", function(req, res){
  console.log("suggestion");
  res.render("suggestion");
});

app.post("/suggestion",function(req, res){
  const newSuggestion = new Suggestion({
  email: req.body.email,
  suggestion: req.body.suggestion
});
newSuggestion.save(function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Suggestion Inserted");
    res.redirect("/thanks");
  }
});
})


app.get("/about", function(req, res) {
  console.log("about");
  res.render("about");
});
app.get("/contact", function(req, res) {
  console.log("contact");
  res.render("contact");
});
app.get("/register", function(req, res) {
  console.log("reg");
  res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("User registered succesfullly");
      res.render("main");
    }
  });
});

app.get("/login", function(req, res) {
  console.log("login");
  res.render("login");
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({
    username: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("main");
        } else {
          res.render("register");
        }
      }
    }
  });
});

app.get("/", function(req, res) {
  console.log("front");
  res.render("welcome");
});

app.get("/donate", function(req, res) {
  console.log("donate");
  res.render("donate");
});

app.post("/donate", function(req, res) {
  const newDonation = new Donation({
    name: req.body.name,
    email: req.body.email,
    amount: 300,
    address: req.body.contact
  });
  newDonation.save();
});

app.get("/donInfo", function(req, res) {
  console.log("donInfo");
  res.render("donInfo");
});

app.get("/about", function(req, res) {
  console.log("about");
  res.render("about");
});

app.get("/thanks", function(req, res) {
  console.log("thanks");
  res.render("thanks");
});

app.get("/requests", (req, res) => {
  Image.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.render("requests", {
        items: items
      });
    }
  });
});

app.post("/order", (req, res) =>{
  let options = {
    amount: 300*100,
    currency: "INR",
  };
  razorpay.orders.create(options, function(err, order){
    console.log(order);
    res.json(order)
  })
});

app.listen(3000, function() {
  console.log("Server Running");
});
