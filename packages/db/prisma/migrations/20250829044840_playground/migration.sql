/*
  Warnings:

  - The values [active,eliminated,left,afk] on the enum `PlayerStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `answeredAt` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionNo` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `roomUserId` on the `Answer` table. All the data in the column will be lost.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Question` table. All the data in the column will be lost.
  - The primary key for the `RoomUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `playgroundId` on the `RoomUser` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `RoomUser` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Playground` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Setting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,roundId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `RoomUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roomId,userId]` on the table `RoomUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roundId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeTakenMs` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cotegory` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `test` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `options` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `eliminatedAt` to the `RoomUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eliminatedRound` to the `RoomUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readyAt` to the `RoomUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `RoomUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."GameMode" AS ENUM ('CLASSIC', 'BATTLE_ROYALE');

-- CreateEnum
CREATE TYPE "public"."RoomType" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."RoomStatus" AS ENUM ('WAITING', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT', 'MASTER');

-- CreateEnum
CREATE TYPE "public"."QuestionCategory" AS ENUM ('SCIENCE', 'HISTORY', 'GEOGRAPHY', 'SPORTS', 'ENTERTAINMENT', 'TECHNOLOGY', 'LITERATURE', 'ART', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."ScoringType" AS ENUM ('SPEED', 'ACCURACY', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."RewardType" AS ENUM ('POINTS', 'BADGE', 'CURRENCY');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PlayerStatus_new" AS ENUM ('WAITING', 'READY', 'ACTIVE', 'ELIMINATED', 'LEFT', 'AFK');
ALTER TABLE "public"."RoomUser" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."RoomUser" ALTER COLUMN "status" TYPE "public"."PlayerStatus_new" USING ("status"::text::"public"."PlayerStatus_new");
ALTER TYPE "public"."PlayerStatus" RENAME TO "PlayerStatus_old";
ALTER TYPE "public"."PlayerStatus_new" RENAME TO "PlayerStatus";
DROP TYPE "public"."PlayerStatus_old";
ALTER TABLE "public"."RoomUser" ALTER COLUMN "status" SET DEFAULT 'WAITING';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Answer" DROP CONSTRAINT "Answer_roomUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Playground" DROP CONSTRAINT "Playground_hostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoomUser" DROP CONSTRAINT "RoomUser_playgroundId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Setting" DROP CONSTRAINT "Setting_playgroundId_fkey";

-- AlterTable
ALTER TABLE "public"."Answer" DROP COLUMN "answeredAt",
DROP COLUMN "questionNo",
DROP COLUMN "roomUserId",
ADD COLUMN     "roundId" TEXT NOT NULL,
ADD COLUMN     "serverTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "timeTakenMs" INTEGER NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "category",
DROP COLUMN "difficulty",
DROP COLUMN "text",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "baseDifficulty" "public"."Difficulty" NOT NULL DEFAULT 'EASY',
ADD COLUMN     "cotegory" "public"."QuestionCategory" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "test" TEXT NOT NULL,
ADD COLUMN     "usedCount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "options",
ADD COLUMN     "options" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."RoomUser" DROP CONSTRAINT "RoomUser_pkey",
DROP COLUMN "playgroundId",
DROP COLUMN "score",
ADD COLUMN     "eliminatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eliminatedRound" INTEGER NOT NULL,
ADD COLUMN     "readyAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "roomId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "baExpiresAt" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "loginAttempt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "username" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Playground";

-- DropTable
DROP TABLE "public"."Setting";

-- DropEnum
DROP TYPE "public"."Status";

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "public"."RoomType" NOT NULL DEFAULT 'PUBLIC',
    "status" "public"."RoomStatus" NOT NULL DEFAULT 'WAITING',
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "gameMode" "public"."GameMode" NOT NULL DEFAULT 'CLASSIC',
    "questionLimit" INTEGER NOT NULL DEFAULT 20,
    "timePerQuestion" INTEGER NOT NULL DEFAULT 30,
    "difficultyProgression" BOOLEAN NOT NULL DEFAULT false,
    "initialDifficulty" "public"."Difficulty" NOT NULL DEFAULT 'EASY',
    "eliminationCount" INTEGER,
    "difficultyIncrement" INTEGER,
    "hostId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Round" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'EASY',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "roomId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Score" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "speedRank" INTEGER,
    "accuracyRank" INTEGER,
    "totalRank" INTEGER,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "roundId" TEXT,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoomSetting" (
    "id" TEXT NOT NULL,
    "scoringType" "public"."ScoringType" NOT NULL DEFAULT 'SPEED',
    "roomId" TEXT NOT NULL,

    CONSTRAINT "RoomSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerPreference" (
    "id" TEXT NOT NULL,
    "difficultyProgression" BOOLEAN NOT NULL DEFAULT false,
    "favoriteCategories" "public"."QuestionCategory"[],
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "PlayerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reward" (
    "id" TEXT NOT NULL,
    "type" "public"."RewardType" NOT NULL,
    "value" INTEGER NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "roomId" TEXT,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_id_key" ON "public"."Room"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Room_slug_key" ON "public"."Room"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Room_inviteCode_key" ON "public"."Room"("inviteCode");

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "public"."Room"("status");

-- CreateIndex
CREATE INDEX "Room_type_status_idx" ON "public"."Room"("type", "status");

-- CreateIndex
CREATE INDEX "Room_gameMode_idx" ON "public"."Room"("gameMode");

-- CreateIndex
CREATE UNIQUE INDEX "Round_id_key" ON "public"."Round"("id");

-- CreateIndex
CREATE INDEX "Round_roomId_active_idx" ON "public"."Round"("roomId", "active");

-- CreateIndex
CREATE INDEX "Round_roomId_number_idx" ON "public"."Round"("roomId", "number");

-- CreateIndex
CREATE INDEX "Score_roomId_userId_idx" ON "public"."Score"("roomId", "userId");

-- CreateIndex
CREATE INDEX "Score_roomId_totalRank_idx" ON "public"."Score"("roomId", "totalRank");

-- CreateIndex
CREATE UNIQUE INDEX "RoomSetting_roomId_key" ON "public"."RoomSetting"("roomId");

-- CreateIndex
CREATE INDEX "RoomSetting_scoringType_idx" ON "public"."RoomSetting"("scoringType");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerPreference_userId_roomId_key" ON "public"."PlayerPreference"("userId", "roomId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "public"."AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "Reward_userId_type_idx" ON "public"."Reward"("userId", "type");

-- CreateIndex
CREATE INDEX "Answer_userId_roundId_idx" ON "public"."Answer"("userId", "roundId");

-- CreateIndex
CREATE INDEX "Answer_roundId_isCorrect_idx" ON "public"."Answer"("roundId", "isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_userId_roundId_key" ON "public"."Answer"("userId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_id_key" ON "public"."Question"("id");

-- CreateIndex
CREATE INDEX "Question_cotegory_idx" ON "public"."Question"("cotegory");

-- CreateIndex
CREATE INDEX "Question_baseDifficulty_idx" ON "public"."Question"("baseDifficulty");

-- CreateIndex
CREATE INDEX "Question_approved_idx" ON "public"."Question"("approved");

-- CreateIndex
CREATE UNIQUE INDEX "RoomUser_id_key" ON "public"."RoomUser"("id");

-- CreateIndex
CREATE INDEX "RoomUser_roomId_status_idx" ON "public"."RoomUser"("roomId", "status");

-- CreateIndex
CREATE INDEX "RoomUser_userId_status_idx" ON "public"."RoomUser"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RoomUser_roomId_userId_key" ON "public"."RoomUser"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "public"."User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomUser" ADD CONSTRAINT "RoomUser_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Round" ADD CONSTRAINT "Round_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Round" ADD CONSTRAINT "Round_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."Round"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomSetting" ADD CONSTRAINT "RoomSetting_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerPreference" ADD CONSTRAINT "PlayerPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerPreference" ADD CONSTRAINT "PlayerPreference_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reward" ADD CONSTRAINT "Reward_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
