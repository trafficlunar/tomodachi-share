/*
  Warnings:

  - You are about to drop the column `images` on the `miis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "miis" DROP COLUMN "images",
ADD COLUMN     "imageCount" INTEGER NOT NULL DEFAULT 0;
