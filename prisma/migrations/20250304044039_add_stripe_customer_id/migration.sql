/*
  Warnings:

  - You are about to drop the column `employer_evaluation` on the `custom_resume` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "custom_resume" DROP COLUMN "employer_evaluation";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_stripeCustomerId_key" ON "user"("stripeCustomerId");
