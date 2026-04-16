-- CreateEnum
CREATE TYPE "PunishmentType" AS ENUM ('WARNING', 'TEMP_EXILE', 'PERM_EXILE');

-- AlterTable
ALTER TABLE "miis" ADD COLUMN     "punishmentId" INTEGER;

-- CreateTable
CREATE TABLE "mii_punishments" (
    "punishmentId" INTEGER NOT NULL,
    "miiId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "mii_punishments_pkey" PRIMARY KEY ("punishmentId","miiId")
);

-- CreateTable
CREATE TABLE "punishments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "PunishmentType" NOT NULL,
    "notes" TEXT NOT NULL,
    "reasons" TEXT[],
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "punishments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mii_punishments" ADD CONSTRAINT "mii_punishments_punishmentId_fkey" FOREIGN KEY ("punishmentId") REFERENCES "punishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mii_punishments" ADD CONSTRAINT "mii_punishments_miiId_fkey" FOREIGN KEY ("miiId") REFERENCES "miis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "punishments" ADD CONSTRAINT "punishments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
