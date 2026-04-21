/*
  Warnings:

  - You are about to drop the column `punishmentId` on the `miis` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `punishments` table. All the data in the column will be lost.
  - You are about to drop the column `reasons` on the `punishments` table. All the data in the column will be lost.
  - You are about to drop the `mii_punishments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `reason` to the `punishments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "mii_punishments" DROP CONSTRAINT "mii_punishments_miiId_fkey";

-- DropForeignKey
ALTER TABLE "mii_punishments" DROP CONSTRAINT "mii_punishments_punishmentId_fkey";

-- AlterTable
ALTER TABLE "miis" DROP COLUMN "punishmentId";

-- AlterTable
ALTER TABLE "punishments" RENAME COLUMN "notes" TO "reason";
ALTER TABLE "punishments" DROP COLUMN "reasons";

-- DropTable
DROP TABLE "mii_punishments";
