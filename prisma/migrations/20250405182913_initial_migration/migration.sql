-- CreateEnum
CREATE TYPE "customer_status" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('USER', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "purchase_type" AS ENUM ('MONTHLY_SUBSCRIPTION', 'YEAR_PURCHASE', 'ADDITIONAL_CREDITS');

-- CreateEnum
CREATE TYPE "purchase_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('RESUME_PACKAGE', 'MATCHING_RESUME');

-- CreateTable
CREATE TABLE "todo" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'USER',
    "awards" TEXT,
    "certificates" TEXT,
    "education" TEXT,
    "experience" TEXT,
    "hobbies_interests" TEXT,
    "projects" TEXT,
    "resume" TEXT,
    "skills" TEXT,
    "training" TEXT,
    "volunteering" TEXT,
    "stripe_customer_id" TEXT,
    "subscription_status" "customer_status" NOT NULL DEFAULT 'INACTIVE',
    "credits" INTEGER NOT NULL DEFAULT 20,
    "credit_consumed" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_token" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_token_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "purchase_type" "purchase_type" NOT NULL,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "purchase_status" "purchase_status" NOT NULL DEFAULT 'PENDING',
    "subscription_start" TIMESTAMP(3),
    "subscription_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "cancel_at" TIMESTAMP(3),
    "stripe_session_id" TEXT,
    "stripe_payment_id" TEXT,
    "credits_added" INTEGER NOT NULL DEFAULT 0,
    "valid_until" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_event_log" (
    "id" TEXT NOT NULL,
    "stripe_event_id" TEXT,
    "event_type" TEXT NOT NULL,
    "stripe_object_id" TEXT,
    "user_id" TEXT NOT NULL,
    "payload" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_event_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_resume" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "job_description" TEXT,
    "custom_resume" TEXT,
    "cover_letter" TEXT,
    "job_evaluation" TEXT,
    "matching_resume" TEXT,
    "product_type" "product_type",
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

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_stripe_customer_id_key" ON "user"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_sessionToken_key" ON "session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "authenticator_credentialID_key" ON "authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_stripe_session_id_key" ON "purchase"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_stripe_payment_id_key" ON "purchase"("stripe_payment_id");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_custom_resume" ADD CONSTRAINT "user_custom_resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_custom_resume" ADD CONSTRAINT "user_custom_resume_customResumeId_fkey" FOREIGN KEY ("customResumeId") REFERENCES "custom_resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
