const authController = require("../controllers/authController.js");
const validateUser = require("../middleware/validators/userValidator.js");
const { Router } = require("express");
const authRouter = Router();
const passport = require("passport");

authRouter.get("/sign-up", (req, res) => {
  res.render("pages/sign-up");
});

authRouter.post("/sign-up", validateUser, authController.signUpUser);

authRouter.get("/log-in", (req, res) => {
  const messages = req.session.messages || [];
  if (messages.length > 0) res.locals.loginMessages = req.session.messages;

  res.render("pages/log-in");
  if (messages.length > 0) {
    req.session.messages = [];
  }
});

authRouter.post("/log-in", passport.authenticate("local", { failureMessage: true, failureRedirect: "/auth/log-in", successRedirect: "/" }));

authRouter.get("/log-out", (req, res, next) => {
  req.logOut((error) => {
    if (error) return next(error);
    res.redirect("/auth/log-in");
  });
});

module.exports = authRouter;
