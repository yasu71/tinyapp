const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "i98kIO": "https://ca.yahoo.com/"
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/url.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello',  (req, res) => {
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
  console.log(req);
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("OK, your short URL is... " + generateRandomString()); // Respond with 'Ok' (we will replace this)
});

function generateRandomString() {
  return Math.random().toString(36).slice(7);;
}
generateRandomString();