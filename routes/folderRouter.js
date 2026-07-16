const { Router } = require("express");
const folderRouter = Router();
const validateFolder = require("../middleware/validators/folderValidator.js");
const folderController = require("../controllers/folderController.js");
folderRouter.post("/create", validateFolder, folderController.createFolder);

module.exports = folderRouter;
