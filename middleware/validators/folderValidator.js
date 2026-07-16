const { body } = require("express-validator");
const crypto = require("crypto");
const { escape } = require("querystring");

validateFolder = [
  body("folder_name").escape().trim().isAlphanumeric("en-US", { ignore: " " }).withMessage("Name can only contain letters and numbers"),
  body("folder_description").trim().escape().notEmpty().withMessage("Please enter a folder description"),
];

module.exports = validateFolder;
