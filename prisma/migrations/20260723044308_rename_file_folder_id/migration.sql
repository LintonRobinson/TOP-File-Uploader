/*
  Warnings:

  - You are about to drop the column `folderId` on the `File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_folderId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "folderId",
ADD COLUMN     "folder_id" TEXT;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
