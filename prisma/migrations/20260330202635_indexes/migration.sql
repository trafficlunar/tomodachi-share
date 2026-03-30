-- CreateIndex
CREATE INDEX "likes_miiId_idx" ON "likes"("miiId");

-- CreateIndex
CREATE INDEX "miis_tags_idx" ON "miis" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "miis_createdAt_idx" ON "miis"("createdAt");

-- CreateIndex
CREATE INDEX "miis_quarantined_createdAt_idx" ON "miis"("quarantined", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "miis_platform_createdAt_idx" ON "miis"("platform", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "miis_userId_createdAt_idx" ON "miis"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "miis_gender_idx" ON "miis"("gender");

-- CreateIndex
CREATE INDEX "miis_makeup_idx" ON "miis"("makeup");

-- CreateIndex
CREATE INDEX "miis_quarantined_id_idx" ON "miis"("quarantined", "id");
