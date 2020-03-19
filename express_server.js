const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/url.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  // let templateVars = { urls: urlDatabase };
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("register", templateVars);
});


app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  // console.log(req.body.longURL);
  const shortURL = generateRandomString();
  // saving shortURL data and longURL to the /urls page
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

function generateRandomString() {
  return Math.random().toString(36).slice(7);
}

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.post("/urls/:shortURL/edit", (req, res) => {
  // console.log("test", req.params.shortURL);
  const pageURL = `/urls/${req.params.shortURL}`;
  res.redirect(pageURL);
});


app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
  // console.log("cookies", req.cookies.username); => 456
  // console.log("req.body.username", req.body.username); => 456
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", res.cookie.username);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const newId = generateRandomString();
  users[newId] = {id: newId, email: req.body.email, password: req.body.password};
  res.cookie("user_id", newId);
  res.redirect("/urls");
})


