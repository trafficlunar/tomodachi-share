-- CreateEnum
CREATE TYPE "public"."MiiPlatform" AS ENUM ('SWITCH', 'THREE_DS');

-- AlterTable
ALTER TABLE "public"."miis" ADD COLUMN     "platform" "public"."MiiPlatform" NOT NULL DEFAULT 'THREE_DS',
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "islandName" DROP NOT NULL,
ALTER COLUMN "allowedCopying" DROP NOT NULL;
