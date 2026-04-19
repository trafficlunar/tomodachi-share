-- CreateIndex
CREATE INDEX "miis_in_queue_quarantined_createdAt_idx" ON "miis"("in_queue", "quarantined", "createdAt" DESC);
