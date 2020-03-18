const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;
app.use(cookieParser())


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get ("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


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
  res.redirect('/urls');
  // console.log("cookies", req.cookies.username); => 456

  // console.log("req.body.username", req.body.username); => 456
});

