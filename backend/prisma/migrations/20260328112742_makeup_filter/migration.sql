-- CreateEnum
CREATE TYPE "MiiMakeup" AS ENUM ('FULL', 'PARTIAL', 'NONE');

-- AlterTable
ALTER TABLE "miis" ADD COLUMN     "makeup" "MiiMakeup";
