-- Feature 1/6: real Newman execution — add request name, assertion error,
-- and the generated HTML report path. All additive and non-breaking.

-- AlterTable
ALTER TABLE "request_results" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "request_results" ADD COLUMN "errorMessage" TEXT;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN "reportPath" TEXT;
