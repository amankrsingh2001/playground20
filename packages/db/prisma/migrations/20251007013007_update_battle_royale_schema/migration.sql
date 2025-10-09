/*
  Warnings:

  - You are about to drop the column `questionId` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the column `baExpiresAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,roundId,questionId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Round" DROP CONSTRAINT "Round_questionId_fkey";

-- DropIndex
DROP INDEX "public"."Answer_userId_roundId_key";

-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "questionsPerRound" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "public"."Round" DROP COLUMN "questionId";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "baExpiresAt",
ADD COLUMN     "banExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."RoundQuestion" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RoundQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoundQuestion_roundId_questionId_idx" ON "public"."RoundQuestion"("roundId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundQuestion_roundId_order_key" ON "public"."RoundQuestion"("roundId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_userId_roundId_questionId_key" ON "public"."Answer"("userId", "roundId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."RoundQuestion" ADD CONSTRAINT "RoundQuestion_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoundQuestion" ADD CONSTRAINT "RoundQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
