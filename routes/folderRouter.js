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
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });
  if (Object.hasOwn(req.query, "rename_folder")) {
    return res.render("pages/folder-page", { renameFolder: true, folder: folder });
  }

  res.render("pages/folder-page", { folder: folder });
});

module.exports = folderRouter;
