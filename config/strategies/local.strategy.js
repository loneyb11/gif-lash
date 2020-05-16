const passport = require("passport");
const { Strategy } = require("passport-local");
const db = require("../../models");

module.exports = function localStrategy() {
  passport.use(new Strategy(
    {
      usernameField: "username",
      passwordField: "password"
    }, (username, password, done) => {
      db.User.findOne({
        where: {
          username
        }
      }).then((dbUser) => {
        if (!dbUser) {
          return done(null, false, {
            message: "Invaild username."
          });
        }
        if (!dbUser.validatePass(password)) {
          return done(null, false, {
            message: "Invalid password."
          });
        }
        return done(null, dbUser, {
          message: "Validated."
        });
      });
    }
  ));
};
