-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "creatorId" INTEGER;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
