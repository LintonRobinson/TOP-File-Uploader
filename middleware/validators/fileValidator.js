const { body } = require("express-validator");

validateFile = [body("folder_name").trim().escape().isAlphanumeric("en-US", { ignore: " " }).withMessage("Name can only contain letters and numbers")];

module.exports = validateFile;
