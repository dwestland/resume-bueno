/*
  Warnings:

  - The `product_type` column on the `custom_resume` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('RESUME_PACKAGE', 'MATCHING_RESUME');

-- AlterTable
ALTER TABLE "custom_resume" DROP COLUMN "product_type",
ADD COLUMN     "product_type" "product_type";

-- DropEnum
DROP TYPE "ProductType";
