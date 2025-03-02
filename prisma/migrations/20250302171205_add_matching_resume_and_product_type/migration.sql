-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('RESUME_PACKAGE', 'MATCHING_RESUME');

-- AlterTable
ALTER TABLE "custom_resume" ADD COLUMN     "matching_resume" TEXT,
ADD COLUMN     "product_type" "ProductType";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deleted_at" TIMESTAMP(3);
