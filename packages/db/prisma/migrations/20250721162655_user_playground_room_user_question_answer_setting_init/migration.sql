/*
  Warnings:

  - You are about to drop the column `profieImage` on the `User` table. All the data in the column will be lost.
  - Added the required column `hostId` to the `Playground` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileImage` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('waiting', 'active', 'ended');

-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('active', 'eliminated', 'left', 'afk');

-- AlterTable
ALTER TABLE "Playground" ADD COLUMN     "hostId" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'waiting';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profieImage",
ADD COLUMN     "profileImage" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RoomUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playgroundId" TEXT NOT NULL,
    "status" "PlayerStatus" NOT NULL DEFAULT 'active',
    "score" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT[],
    "correctOption" TEXT NOT NULL,
    "category" TEXT,
    "difficulty" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "roomUserId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionNo" INTEGER NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "questionLimit" INTEGER NOT NULL DEFAULT 20,
    "timePerQuestion" INTEGER NOT NULL DEFAULT 45,
    "playgroundId" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Playground" ADD CONSTRAINT "Playground_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_playgroundId_fkey" FOREIGN KEY ("playgroundId") REFERENCES "Playground"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_roomUserId_fkey" FOREIGN KEY ("roomUserId") REFERENCES "RoomUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_playgroundId_fkey" FOREIGN KEY ("playgroundId") REFERENCES "Playground"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
