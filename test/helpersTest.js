const assert = require('chai').assert;
const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";

    assert.equal(user, expectedOutput);
  });

  it('should returns undefined with a non-existent email', () => {
    const user = findUserByEmail("u@example.com", testUsers);
    const expectedOutput = undefined;
    
    assert.equal(user, expectedOutput);
  });
});