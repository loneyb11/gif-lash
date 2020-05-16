const express = require("express");
const passport = require("passport");
const db = require("../../models");

const authRouter = express.Router();

module.exports = function router() {

  authRouter.route('/register')
    .get((req, res) => {
      if (req.user) {
        return res.redirect("/game");
      }
      return res.render('register_login', {
        cardTitle: 'Register', 
        formAction: '/auth/register', 
        typeSubmit: 'Register',
        redirectUrl: '/auth/login',
        redirectText: 'Already have an account?',
      });
    })
    .post((req, res) => {
      db.User.create({
        password: req.body.password,
        username: req.body.username
      }).then(() => {
        req.login(req.body.username, () => {
          res.redirect("/game");
        });
      });
    });

  authRouter.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/auth/login');
    });

  authRouter.route('/login')
    .get((req, res) => {
      if (req.user) {
        return res.redirect("/game");
      }
      return res.render('register_login', {
        cardTitle: 'Login',
        formAction: '/auth/login',
        typeSubmit: 'Login',
        redirectUrl: '/auth/register',
        redirectText: 'Need an account?',
      });
    })
    .post((req, res) => {
      passport.authenticate("local", (err, user, info) => {
        switch (info.message) {
          case ("Invaild username."):
            res.status(401);
            res.render('register_login', {
              cardTitle: 'Login',
              formAction: '/auth/login',
              typeSubmit: 'Login',
              redirectUrl: '/auth/register',
              redirectText: 'Need an account?',
              username: req.body.username,
              usernameErr: info.message,
            });
            break;
          case ("Invalid password."):
            res.status(401);
            res.render('register_login', {
              cardTitle: 'Login',
              formAction: '/auth/login',
              typeSubmit: 'Login',
              redirectUrl: '/auth/register',
              redirectText: 'Need an account?',
              username: req.body.username,
              passwordErr: info.message,
            });
            break;
          case ('Validated.'):
            req.login(user.username, () => { res.redirect('/game'); });
            break;
          default:
            res.redirect('/auth/login');
            break;
        }
      })(req, res);

    });

  return authRouter;
};
