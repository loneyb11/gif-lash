const express = require("express");
const isAuthenticated = require("../../config/middleware/isAuthenticated.js");

const serverRouter = express.Router();

module.exports = function router() {
  serverRouter.use(isAuthenticated);
  serverRouter.route("/")
    .get((req, res) => {
      res.render('game');
    });
  return serverRouter;
};
