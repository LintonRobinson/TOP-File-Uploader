const { body } = require("express-validator");
const crypto = require("crypto");

const validateUser = [
  body("first_name")
    .trim()
    .customSanitizer((value) => value.replace(/\s+/g, " "))
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1-50 characters")
    .matches(/^[\p{L}\s'-]+$/u)
    .withMessage("First name contains invalid characters"),
  body("last_name")
    .trim()
    .customSanitizer((value) => value.replace(/\s+/g, " "))
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be 1-50 characters")
    .matches(/^[\p{L}\s'-]+$/u)
    .withMessage("Last name contains invalid characters"),
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3-20 characters")
    .matches(/^[A-Za-z0-9_-]+$/u)
    .withMessage("Username can only contain letters, numbers, underscores, and hyphens (no spaces)"),
  body("email").trim().isEmail().withMessage("Please enter a valid email address").toLowerCase(),
  body("password")
    .isLength({ min: 12, max: 64 })
    .withMessage("Password must be between 12-64 characters")
    .bail()
    .custom(async (value) => {
      const breachCount = await getPasswordBreachCount(value);
      return breachCount === 0;
    })
    .withMessage("This password has appeared in a known data breach. Please choose a different password."),
  body("confirmed_password")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match"),
];

async function getPasswordBreachCount(password) {
  try {
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: AbortSignal.timeout(5000),
    });
    const text = await res.text();

    const match = text.split("\n").find((line) => line.startsWith(suffix));
    return match ? parseInt(match.split(":")[1], 10) : 0;
  } catch (error) {
    console.error("HIBP check failed:", error);
    return 0;
  }
}

module.exports = validateUser;
