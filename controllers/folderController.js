const { validationResult, matchedData } = require("express-validator");
async function createFolder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("pages/dashboard", { errors: errors.array(), showCreateFolder: true });
  }
}

module.exports = { createFolder };
