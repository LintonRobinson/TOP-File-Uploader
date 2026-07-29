const { Router } = require("express");
const folderRouter = Router();
const validateFolder = require("../middleware/validators/folderValidator.js");
const folderController = require("../controllers/folderController.js");
const prisma = require("../lib/prisma.js");
folderRouter.post("/create", validateFolder, folderController.createFolder);
folderRouter.post("/:folderId/update", validateFolder, folderController.updateFolder);
folderRouter.post("/:folderId/delete", folderController.deleteFolder);

folderRouter.get("/:folderId", async (req, res) => {
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
    files = await prisma.file.findMany({
      where: {
        folder_id: folderId,
      },
    });
    folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
    });
  }

  if (Object.hasOwn(req.query, "rename_folder")) {
    return res.render("pages/folder-page", { renameFolder: true, folder: folder, userFiles: files });
  }

  if (Object.hasOwn(req.query, "show_upload_file")) {
    return res.render("pages/folder-page", { uploadFile: true, folder: folder, userFiles: files });
  }

  res.render("pages/folder-page", { folder: folder, userFiles: files });
});

module.exports = folderRouter;
