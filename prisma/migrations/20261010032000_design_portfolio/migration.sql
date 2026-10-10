CREATE TABLE "PortfolioDesign" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "result" JSONB NOT NULL,
  "visibility" TEXT NOT NULL DEFAULT 'private',
  "donatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PortfolioDesign_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PortfolioDesign_visibility_check" CHECK ("visibility" IN ('private', 'community')),
  CONSTRAINT "PortfolioDesign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PortfolioDesign_userId_fingerprint_key" ON "PortfolioDesign"("userId", "fingerprint");
CREATE INDEX "PortfolioDesign_userId_updatedAt_idx" ON "PortfolioDesign"("userId", "updatedAt");
CREATE INDEX "PortfolioDesign_visibility_donatedAt_idx" ON "PortfolioDesign"("visibility", "donatedAt");
