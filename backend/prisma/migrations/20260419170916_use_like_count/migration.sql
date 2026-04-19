-- AlterTable
ALTER TABLE "miis" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "miis_likeCount_idx" ON "miis"("likeCount" DESC);
