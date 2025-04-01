/*
  Warnings:

  - You are about to drop the column `pictures` on the `miis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "miis" DROP COLUMN "pictures",
ADD COLUMN     "images" TEXT[];
