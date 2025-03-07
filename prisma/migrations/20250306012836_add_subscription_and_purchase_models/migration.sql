/*
  Warnings:

  - A unique constraint covering the columns `[subscription_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "subscription_plan" AS ENUM ('MONTHLY', 'YEARLY', 'NONE');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELED', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "purchase_type" AS ENUM ('SUBSCRIPTION_MONTHLY', 'SUBSCRIPTION_YEARLY', 'CREDIT_PURCHASE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "subscription_end" TIMESTAMP(3),
ADD COLUMN     "subscription_id" TEXT,
ADD COLUMN     "subscription_plan" "subscription_plan" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "subscription_start" TIMESTAMP(3),
ADD COLUMN     "subscription_status" "subscription_status" NOT NULL DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE "purchase" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "purchase_type" "purchase_type" NOT NULL,
    "credits_added" INTEGER NOT NULL DEFAULT 0,
    "stripe_session_id" TEXT,
    "stripe_invoice_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchase_stripe_session_id_key" ON "purchase"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscription_id_key" ON "user"("subscription_id");

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
