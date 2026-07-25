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
        user_id: req.user.id,
      },
    });
    //const userFolders = await prisma.folder.findMany({ where: { user_id: req.user.id } });
    res.redirect("/dashboard");
    //res.render("pages/dashboard", { showCreateFolder: true, successfulFolderCreation: true, userFolders: userFolders });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function updateFolder(req, res, next) {
  const validatedFolder = matchedData(req);

  const folderId = req.params.folderId;
  try {
    const updatedFolder = await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        name: validatedFolder.folder_name,
        description: validatedFolder.folder_description,
      },
    });

    res.render("pages/folder-page", { folder: updatedFolder });
  } catch (error) {
    next(error);
  }
}

module.exports = { createFolder, updateFolder };
