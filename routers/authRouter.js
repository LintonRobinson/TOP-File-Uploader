const authController = require("../controllers/authController.js");
const validateUser = require("../middleware/validators/userValidator.js");
const { Router } = require("express");
const authRouter = Router();

authRouter.get("/sign-up", (req, res) => {
  res.render("pages/sign-up");
});

authRouter.post("/sign-up", validateUser, authController.signUpUser);

module.exports = authRouter;
