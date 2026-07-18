const { Router } = require("express");
const fileRouter = Router();
const fileController = require("../controllers/fileController.js");
const multer = require("multer");
const mime = require("mime-types");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = mime.extension(file.mimetype);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

fileRouter.post("/upload", upload.single("file"), fileController.uploadFile);

module.exports = fileRouter;
