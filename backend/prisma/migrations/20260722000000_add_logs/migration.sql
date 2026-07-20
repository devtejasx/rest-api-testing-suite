-- Feature 12: persisted application logs.
CREATE TABLE IF NOT EXISTS "logs" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "logs_type_idx" ON "logs"("type");
CREATE INDEX IF NOT EXISTS "logs_createdAt_idx" ON "logs"("createdAt");
