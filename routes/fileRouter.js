const { Router } = require("express");
const fileRouter = Router();
const fileController = require("../controllers/fileController.js");
const multer = require("multer");
const mime = require("mime-types");
const cloudinary = require("cloudinary").v2;
const validateFile = require("../middleware/validators/fileValidator.js");
const prisma = require("../lib/prisma.js");
const dateFns = require("date-fns");
const { filesize } = require("filesize");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

fileRouter.get("/:fileId", async (req, res) => {
  const fileId = req.params.fileId;
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });
  file.upload_time = dateFns.format(file.upload_time, "MMMM d, yyyy 'at' h:mm a");
  file.file_size = filesize(Number(file.file_size));

  res.render("pages/file-page", { file: file });
});

fileRouter.post("/upload", upload.single("file"), validateFile, fileController.uploadFile);

fileRouter.post("/:fileId/delete", fileController.deleteFile);

module.exports = fileRouter;
