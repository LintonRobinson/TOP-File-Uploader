const { Router } = require("express");
const fileRouter = Router();
const fileController = require("../controllers/fileController.js");
const multer = require("multer");
const mime = require("mime-types");
const cloudinary = require("cloudinary").v2;
const validateFile = require("../middleware/validators/fileValidator.js");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

fileRouter.post("/upload", upload.single("file"), validateFile, fileController.uploadFile);

module.exports = fileRouter;
