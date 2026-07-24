const cloudinary = require("cloudinary").v2;
const { Readable } = require("node:stream");
const prisma = require("../lib/prisma.js");
const { validationResult, matchedData } = require("express-validator");
cloudinary.config({
  cloud_name: "mkigiypd",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function uploadFile(req, res) {
  const userFolders = await prisma.folder.findMany({ where: { user_id: req.user.id } });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("pages/dashboard", { showUploadFiles: true, errors: errors.array(), userFolders: userFolders });
  }
  const validatedFileFolder = matchedData(req);

  const asset = await uploadToCloudinaryFromBuffer(req.file.buffer);
  const downloadUrl = `https://res.cloudinary.com/mkigiypd/${asset.resource_type}/upload/fl_attachment/${asset.asset_folder}/${asset.display_name}`;
  const fileProperties = { user_id: req.user.id, name: req.file.originalname, file_url: asset.secure_url, file_size: String(req.file.size), download_url: downloadUrl };
  if (validatedFileFolder.folder_id !== "no_folder") fileProperties.folder_id = validatedFileFolder.folder_id;
  await prisma.file.create({
    data: {
      ...fileProperties,
    },
  });
  const file = await prisma.file.findFirst({ where: { file_url: asset.secure_url } });
  res.render("pages/dashboard", { showUploadFiles: true, userFolders: userFolders, fileId: asset.secure_url });
}

function uploadToCloudinaryFromBuffer(buffer) {
  const options = {
    folder: "user_uploads",
    resource_type: "auto",
    unique_filename: true,
  };
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });
}

module.exports = { uploadFile };
