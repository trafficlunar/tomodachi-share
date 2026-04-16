/*
  Warnings:

  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `usernameUpdatedAt` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "miis" ALTER COLUMN "allowedCopying" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username",
DROP COLUMN "usernameUpdatedAt";
