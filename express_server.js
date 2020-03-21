const express = require('express');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { findUserByEmail } = require('./helpers.js');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'tinyApp',
  keys: ['key1']
}));

const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
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


const generateRandomString = () => {
  return Math.random().toString(36).slice(7);
};

const authenticateUser = (email, pass) => {
  for (let key in users) {
    if (email === users[key].email &&
      bcrypt.compareSync(pass, users[key].password)) {
      return true;
    }
  }
  return false;
};

const urlsForUser = (userId) => {
  const urls = {};
  for (let key in urlDatabase) {
    if (userId === urlDatabase[key].userID) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

///////////////////////
//    GET hunders    //
///////////////////////

// JSON handler for a test purpose
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// JSON handler for a test purpose
app.get("/users.json", (req, res) => {
  res.json(users);
});

// "/" page redirect to login or My URLs page handler
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

// My URLs page handler
app.get("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = {
      urls: urlsForUser(users[req.session.user_id].id,urlDatabase),
      users: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Page to create a new URL handler
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  let templateVars = {
    urls: urlDatabase,
    users: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

// Editing a URL page handler
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

// Short URL takes to an actual site handler
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Register page hander
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

// Login page handler
app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

/////////////////////////
//    POST hunders    //
////////////////////////

// My URLs page: new URL is added to the My URLs page
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls");
});

// Delete URL handler
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session.user_id] &&
    users[req.session.user_id].id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  } else {
    res.redirect("/login");
  }
});

// Edit URL handler: redirecting to the edit URL page
app.post("/urls/:shortURL/edit", (req, res) => {
  if (users[req.session.user_id] &&
    users[req.session.user_id].id === urlDatabase[req.params.shortURL].userID) {
    const pageURL = `/urls/${req.params.shortURL}`;
    res.redirect(pageURL);
  } else {
    res.redirect("/login");
  }
});

// Edit page handler: new URL gets updated in the page
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

// login page hander
app.post("/login", (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  const user = findUserByEmail(email, users);
  if (authenticateUser(email, pass)) {
    req.session.user_id = user;
    res.redirect("/urls");
  } else {
    res.status(403).send(`<h3 style="text-align:center">Incorrect Email/Password. <a href="/login">Go back to login page</a></h3><br><h3 style="text-align:center">If you haven't registered yet, <a href="/register">register now</a>!</h3>`);
  }
});

// logout hander
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// register page handler
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`<h3 style="text-align:center">Missing Email or/and Password. <a href="/register">Go back to register page</a></h3>`);
  } else if (findUserByEmail(req.body.email, users)) {
    res.status(400).send(`<h3 style="text-align:center">Try again, Email address already exists. <a href="/register">Go back to register page</a></h3>`);
  }
  const newId = generateRandomString();
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = newId;
  res.redirect("/urls");
});

// listens for connections on the given path
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});