const { body } = require("express-validator");

validateFolder = [
  body("folder_name").trim().escape().isAlphanumeric("en-US", { ignore: " " }).withMessage("Name can only contain letters and numbers"),
  body("folder_description").trim().escape().notEmpty().withMessage("Please enter a folder description"),
];

module.exports = validateFolder;
