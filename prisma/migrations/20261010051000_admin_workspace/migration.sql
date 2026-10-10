CREATE TABLE "StudioWorkspacePart" (
  "id" TEXT NOT NULL,
  "state" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudioWorkspacePart_pkey" PRIMARY KEY ("id")
);
INSERT INTO "Project" ("id", "name", "messages", "data", "createdAt", "updatedAt") VALUES ('cstudioadminworkspace000001', 'Admin studio workspace', '[]', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT ("id") DO NOTHING;
