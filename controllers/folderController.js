const { validationResult, matchedData } = require("express-validator");
const prisma = require("../lib/prisma.js");
async function createFolder(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("pages/dashboard", { errors: errors.array(), showCreateFolder: true });
  }

  const validatedFolder = matchedData(req);
  try {
    await prisma.folder.create({
      data: {
        name: validatedFolder.folder_name,
        description: validatedFolder.folder_description,
      },
    });
    res.render("pages/dashboard", { showCreateFolder: true, successfulFolderCreation: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports = { createFolder };
