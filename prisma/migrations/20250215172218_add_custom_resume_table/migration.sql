-- AlterTable
ALTER TABLE "user" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "custom_resume" (
    "id" SERIAL NOT NULL,
    "job_description" TEXT,
    "custom_resume" TEXT,
    "cover_letter" TEXT,
    "job_evaluation" TEXT,
    "employer_evaluation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_custom_resume" (
    "userId" TEXT NOT NULL,
    "customResumeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_custom_resume_pkey" PRIMARY KEY ("userId","customResumeId")
);

-- AddForeignKey
ALTER TABLE "user_custom_resume" ADD CONSTRAINT "user_custom_resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_custom_resume" ADD CONSTRAINT "user_custom_resume_customResumeId_fkey" FOREIGN KEY ("customResumeId") REFERENCES "custom_resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
