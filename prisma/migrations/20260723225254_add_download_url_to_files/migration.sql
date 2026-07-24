/*
  Warnings:

  - Added the required column `download_url` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "download_url" TEXT NOT NULL;
