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
  const sharedFolderUrl = `${req.protocol}://${req.get("host")}/folder/${folderId}/shared`;
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

    const files = await prisma.file.findMany({
      where: {
        folder_id: folderId,
      },
    });

    res.render("pages/folder-page", { folder: updatedFolder, sharedFolderUrl: sharedFolderUrl, userFiles: files });
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

async function renderForm(req, res) {
  const folderId = req.params.folderId;
  let files;
  let folder;

  if (folderId === "all") {
    files = await prisma.file.findMany({
      where: {
        user_id: req.user.id,
      },
    });

    folder = {
      id: "all",
      name: "All Files",
      description: "All of your files.",
    };
  } else {
    folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
    });

    if (folder.user_id !== req.user.id) return res.redirect("/dashboard");

    files = await prisma.file.findMany({
      where: {
        folder_id: folderId,
      },
    });
  }

  const sharedFolderUrl = `${req.protocol}://${req.get("host")}/folder/${folderId}/shared`;

  if (Object.hasOwn(req.query, "rename_folder")) {
    return res.render("pages/folder-page", { renameFolder: true, folder: folder, userFiles: files, sharedFolderUrl: sharedFolderUrl });
  }

  if (Object.hasOwn(req.query, "show_upload_file")) {
    return res.render("pages/folder-page", { uploadFile: true, folder: folder, userFiles: files, sharedFolderUrl: sharedFolderUrl });
  }

  res.render("pages/folder-page", { folder: folder, userFiles: files, sharedFolderUrl: sharedFolderUrl });
}

async function shareFolder(req, res) {
  res.locals.homePath = true;
  const folderId = req.params.folderId;
  const sharedFolderUrl = `${req.protocol}://${req.get("host")}/folder/${folderId}/shared`;

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (folder.user_id !== req.user.id) return res.redirect("/dashboard");

  await prisma.folder.update({
    where: {
      id: folderId,
    },
    data: {
      shared: true,
    },
  });

  const files = await prisma.file.findMany({
    where: {
      folder_id: folderId,
    },
  });

  if (Object.hasOwn(req.query, "rename_folder")) {
    return res.render("pages/folder-page", { renameFolder: true, folder: folder, userFiles: files, sharedFolderUrl: sharedFolderUrl });
  }

  if (Object.hasOwn(req.query, "show_upload_file")) {
    return res.render("pages/folder-page", { uploadFile: true, folder: folder, userFiles: files, sharedFolderUrl: sharedFolderUrl });
  }

  res.render("pages/folder-page", { folder: folder, userFiles: files, sharedFolder: true, sharedFolderUrl: sharedFolderUrl });
}

async function renderSharedFolder(req, res) {
  if (req.user) return res.redirect("/dashboard");

  const folderId = req.params.folderId;

  if (Object.hasOwn(req.cookies, "shared_folder")) {
    if (req.cookies.shared_folder === folderId) {
      const folder = await prisma.folder.findUnique({
        where: {
          id: folderId,
        },
      });

      const files = await prisma.file.findMany({
        where: {
          folder_id: folderId,
        },
      });
      return res.render("pages/folder-page", { folder: folder, userFiles: files, guest: true });
    } else {
      return res.redirect("/dashboard");
    }
  }
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (!folder.shared) return res.redirect("/");

  await prisma.folder.update({
    where: {
      id: folderId,
    },
    data: {
      shared: false,
    },
  });
  res.cookie("shared_folder", folderId, {
    maxAge: 60000,
    httpOnly: true,
    sameSite: "strict",
  });
  const files = await prisma.file.findMany({
    where: {
      folder_id: folderId,
    },
  });
  res.render("pages/folder-page", { folder: folder, userFiles: files, guest: true });
}

module.exports = { createFolder, updateFolder, deleteFolder, renderForm, shareFolder, renderSharedFolder };
