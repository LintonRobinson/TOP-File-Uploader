const prisma = require("../lib/prisma.js");
const bcrypt = require("bcryptjs");
const { validationResult, matchedData } = require("express-validator");

async function signUpUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("pages/sign-up", { errors: errors.array() });
  }

  const validatedUser = matchedData(req);
  const hashedPassword = await bcrypt.hash(validatedUser.password, 10);

  try {
    await prisma.user.create({
      data: {
        first_name: validatedUser.first_name,
        last_name: validatedUser.last_name,
        username: validatedUser.username,
        email: validatedUser.email,
        password: hashedPassword,
      },
    });
    res.render("pages/sign-up", { successfulSignUp: true, username: validatedUser.username });
  } catch (error) {
    console.error(error);
    return res.render("pages/sign-up", { errors: [{ msg: "Username or email already in use." }] });
  }
}

module.exports = { signUpUser };
