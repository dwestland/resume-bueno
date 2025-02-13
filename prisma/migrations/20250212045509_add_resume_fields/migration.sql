/*
  Warnings:

  - You are about to drop the `flag` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "awards" TEXT,
ADD COLUMN     "certificates" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "hobbies_interests" TEXT,
ADD COLUMN     "projects" TEXT,
ADD COLUMN     "resume" TEXT,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "training" TEXT,
ADD COLUMN     "volunteering" TEXT;

-- DropTable
DROP TABLE "flag";
