const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
// const cookieSession = require('cookie-session')

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.set("view engine", "ejs");
// app.use(cookieSession({
//   name: 'tinyApp',
//   keys: ['key1']
// }))

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

// old database
// const urlDatabase = {
//   "b2xVn2":  "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
const generateRandomString = () => {
  return Math.random().toString(36).slice(7);
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
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

const urlsForUser = (id) => {
  const urls = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
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

// My URLs page

app.get("/urls", (req, res) => {
  console.log("users[req.cookies.user_id]", users[req.cookies.user_id]);
  if (users[req.cookies.user_id]) {
    let templateVars = {
      urls: urlsForUser(users[req.cookies.user_id].id),
      users: users[req.cookies.user_id] //shows only the urls for logged in user
    };
    res.render("urls_index", templateVars);
  }
  res.redirect("/login");
});


// old one
// app.get("/urls", (req, res) => {
//   let templateVars = {
//     urls: urlDatabase,
//     users: users[req.cookies.user_id]
//   };
//   console.log("urlDatabase", urlDatabase);
//   res.render("urls_index", templateVars);
// });

// Page to create a new URL
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }
  let templateVars = {
    urls: urlDatabase,
    users: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

// old one //
// app.get("/urls/new", (req, res) => {
//   let templateVars = {
//     urls: urlDatabase,
//     users: users[req.cookies.user_id]
//   };
//   res.render("urls_new", templateVars);
// });

// Editing/Adding new URL page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// old one
// app.get("/urls/:shortURL", (req, res) => {
//   let templateVars = {
//     shortURL: req.params.shortURL,
//     longURL: urlDatabase[req.params.shortURL],
//     users: users[req.cookies.user_id]
//   };
//   res.render("urls_show", templateVars);
// });

// Short URL takes to an actual site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// register page
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: users[req.cookies.user_id]
  };
  res.render("register", templateVars);
});

// login page
app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

// app.get("/u/:id", (req, res) => {
//   let templateVars = {
//     urls: urlDatabase,
//     users: users[req.cookies.user_id]
//   };
//   const userUrl = `/u/${urlDatabase.userID}`;
//   res.render(userUrl, templateVars);
// });

/////////////////////////
//    POST hunders    //
////////////////////////


// My URLs page: new URL is added to the My URLs page
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // saving shortURL data and longURL to the /urls page
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  res.redirect("/urls");
});

// old one
// app.post("/urls", (req, res) => {
//   const shortURL = generateRandomString();
//   // saving shortURL data and longURL to the /urls page
//   urlDatabase[shortURL] = req.body.longURL;
//   res.redirect("/urls");
// });

// Delete URL handler
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies.user_id] &&
    users[req.cookies.user_id].id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  } else {
    res.redirect("/login");
  }
});

// Edit URL handler: redirecting to the edit URL page
app.post("/urls/:shortURL/edit", (req, res) => {
  if (users[req.cookies.user_id] &&
    users[req.cookies.user_id].id === urlDatabase[req.params.shortURL].userID) {
    const pageURL = `/urls/${req.params.shortURL}`;
    res.redirect(pageURL);
  } else {
    res.redirect("/login");
  }
});

// old one
// app.post("/urls/:shortURL/edit", (req, res) => {
//   const pageURL = `/urls/${req.params.shortURL}`;
//   res.redirect(pageURL);
// });

// Edit page handler: new URL gets updated in the page
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// login
app.post("/login", (req, res) => {
  const user = findUserByEmail(req.body.email);
  if (authenticateUser(req.body.email, req.body.password)) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send('Error 403: Incorrect email/password');
  }
});

// const authenticateUser = (email, pass) => {
//   for (let key in users) {
//     if (email === users[key].email &&
//       bcrypt.compareSync(pass, users[key].password)) {
//       return true;
//     }
//   return false;
//   }
// };

// old one
// app.post("/login", (req, res) => {
//   const user = findUserByEmail(req.body.email);
//   if (!user) {
//     res.status(403).send('Error 403: no data found');
//   } else if (user.password !== req.body.password) {
//     res.status(403).send('Error 403: no data found');
//   }
//   res.cookie("user_id", user.id);
//   res.redirect("/urls");
// });

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", res.cookie.users);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Error 400: Try again`);
  } else if (findUserByEmail(req.body.email)) {
    res.status(400).send(`Error 400: Try again, your email alrady exists`);
  }
  const newId = generateRandomString();
  users[newId] = {
    id: newId,
    email: req.body.email,
    // password: req.body.password
    password: bcrypt.hashSync(req.body.password, 10)
  };
  console.log("bcrypt PW: ", users[newId].password);
  res.cookie("user_id", newId);
  res.redirect("/urls");
});

// const password = "1234";
// const salt = bcrypt.genSaltSync(10);
// const hash = bcrypt.hashSync(password, salt);
// console.log("original PW: ", password);
// console.log("hash PW: ", hash);

// const authenticateUser = (email, pass) => {
//   for (let key in users) {
//     if (email === users[key].email &&
//       bcrypt.compareSync(pass, users[key].password)) {
//       return true;
//     }
//   }
//   return false;
// };
