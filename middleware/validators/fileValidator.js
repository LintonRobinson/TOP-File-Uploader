const { body } = require("express-validator");
const prisma = require("../../lib/prisma.js");

validateFile = [
  body("folder_id")
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      if (value === "no_folder" || value === "all") return true;
      const folder = await prisma.folder.findFirst({
        where: { id: value, user_id: req.user.id },
      });

      if (!folder) throw new Error("Invalid folder selection");
    })
    .withMessage("Invalid folder selection"),
];

module.exports = validateFile;
