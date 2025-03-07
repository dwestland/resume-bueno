/*
  Warnings:

  - You are about to drop the column `status` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `credit_transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "credit_transaction" DROP CONSTRAINT "credit_transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "purchase" DROP CONSTRAINT "purchase_userId_fkey";

-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_userId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "status";

-- DropTable
DROP TABLE "credit_transaction";

-- DropTable
DROP TABLE "purchase";

-- DropTable
DROP TABLE "subscription";

-- DropEnum
DROP TYPE "CreditTransactionType";

-- DropEnum
DROP TYPE "PurchaseType";

-- DropEnum
DROP TYPE "SubscriptionPlan";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- DropEnum
DROP TYPE "UserStatus";
