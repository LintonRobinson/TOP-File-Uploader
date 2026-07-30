const { Router } = require("express");
const folderRouter = Router();
const validateFolder = require("../middleware/validators/folderValidator.js");
const folderController = require("../controllers/folderController.js");
const prisma = require("../lib/prisma.js");
const requireAuth = require("../middleware/requireAuth.js");

folderRouter.post("/create", validateFolder, folderController.createFolder);

folderRouter.post("/:folderId/update", validateFolder, folderController.updateFolder);

folderRouter.post("/:folderId/delete", folderController.deleteFolder);

folderRouter.get("/:folderId", requireAuth.isAuthenticated, folderController.renderForm);

folderRouter.get("/:folderId/share", requireAuth.isAuthenticated, folderController.shareFolder);

folderRouter.get("/:folderId/shared", folderController.renderSharedFolder);

module.exports = folderRouter;
