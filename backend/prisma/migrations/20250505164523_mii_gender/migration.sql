-- CreateEnum
CREATE TYPE "MiiGender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "miis" ADD COLUMN     "gender" "MiiGender";
