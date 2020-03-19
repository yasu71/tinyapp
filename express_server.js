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
  "firstId": {
    id: "firstId",
    email: "first@example.com",
    password: "123"
  },
  "secondId": {
    id: "secondId",
    email: "second@example.com",
    password: "456"
  }
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// generate random strings for short URL and user ID
function generateRandomString() {
  return Math.random().toString(36).slice(7);
}

const findUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


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
  let templateVars = {
    urls: urlDatabase,
    users: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: users[req.cookies.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

/////////////////////////
//    POST hunders    //
////////////////////////

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // saving shortURL data and longURL to the /urls page
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const pageURL = `/urls/${req.params.shortURL}`;
  res.redirect(pageURL);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  const user = findUserByEmail(req.body.email);
  if (!user) {
    res.status(403).send('Error 403: no data found');
  } else if (user.password !== req.body.password) {
    res.status(403).send('Error 403: no data found');
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", res.cookie.users);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Error 400: Try again`);
  } else if (findUserByEmail(req.body.email)) {
    res.status(400).send(`Error 400: Try again`);
  }
  const newId = generateRandomString();
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", newId);
  res.redirect("/urls");
});


