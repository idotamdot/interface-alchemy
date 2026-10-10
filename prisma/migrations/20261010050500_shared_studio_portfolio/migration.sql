CREATE TABLE "StudioTestPortfolio" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "visibility" TEXT NOT NULL DEFAULT 'studio',
  "donatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudioTestPortfolio_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudioTestPortfolio_fingerprint_key" ON "StudioTestPortfolio"("fingerprint");
CREATE INDEX "StudioTestPortfolio_kind_updatedAt_idx" ON "StudioTestPortfolio"("kind", "updatedAt");
CREATE INDEX "StudioTestPortfolio_visibility_donatedAt_idx" ON "StudioTestPortfolio"("visibility", "donatedAt");
