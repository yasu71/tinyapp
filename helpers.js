const findUserByEmail = (email, usersDB) => {
  for (const userId in usersDB) {
    if (usersDB[userId].email === email) {
      return usersDB[userId].id;
    }
  }
  return null;
};


module.exports = {
  findUserByEmail
};
