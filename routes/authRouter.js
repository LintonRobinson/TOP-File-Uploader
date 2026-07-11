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
  res.render("pages/log-in");
});

//authRouter.post("/log-in", passport.authenticate("local", { failureMessage: true, failureRedirect: "/log-in" }));

module.exports = authRouter;
