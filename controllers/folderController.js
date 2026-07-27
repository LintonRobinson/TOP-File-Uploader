const { validationResult, matchedData } = require("express-validator");
const prisma = require("../lib/prisma.js");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "mkigiypd",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

async function deleteFolder(req, res, next) {
  const folderId = req.params.folderId;
  const files = await prisma.file.findMany({
    where: {
      folder_id: folderId,
    },
  });

  files.forEach(async (file) => {
    await Promise.all(files.map((file) => cloudinary.uploader.destroy(file.public_id)));
  });

  try {
    await prisma.file.deleteMany({
      where: {
        folder_id: folderId,
      },
    });
    await prisma.folder.delete({
      where: {
        id: folderId,
      },
    });

    // get files in folder for feach destroy

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports = { createFolder, updateFolder, deleteFolder };
