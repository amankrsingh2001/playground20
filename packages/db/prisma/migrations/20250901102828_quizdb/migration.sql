-- CreateEnum
CREATE TYPE "public"."GameMode" AS ENUM ('CLASSIC', 'BATTLE_ROYALE');

-- CreateEnum
CREATE TYPE "public"."RoomType" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."RoomStatus" AS ENUM ('WAITING', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "public"."PlayerStatus" AS ENUM ('WAITING', 'READY', 'ACTIVE', 'ELIMINATED', 'LEFT', 'AFK');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT', 'MASTER');

-- CreateEnum
CREATE TYPE "public"."QuestionCategory" AS ENUM ('SCIENCE', 'HISTORY', 'GEOGRAPHY', 'SPORTS', 'ENTERTAINMENT', 'TECHNOLOGY', 'LITERATURE', 'ART', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."ScoringType" AS ENUM ('SPEED', 'ACCURACY', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."RewardType" AS ENUM ('POINTS', 'BADGE', 'CURRENCY');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),
    "loginAttempt" INTEGER NOT NULL DEFAULT 0,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "baExpiresAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "public"."RoomType" NOT NULL DEFAULT 'PUBLIC',
    "status" "public"."RoomStatus" NOT NULL DEFAULT 'WAITING',
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "gameMode" "public"."GameMode" NOT NULL DEFAULT 'CLASSIC',
    "questionLimit" INTEGER NOT NULL DEFAULT 20,
    "timePerQuestion" INTEGER NOT NULL DEFAULT 30,
    "difficultyProgression" BOOLEAN NOT NULL DEFAULT false,
    "initialDifficulty" "public"."Difficulty" NOT NULL DEFAULT 'EASY',
    "eliminationCount" INTEGER,
    "difficultyIncrement" INTEGER,
    "hostId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoomUser" (
    "id" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."PlayerStatus" NOT NULL DEFAULT 'WAITING',
    "readyAt" TIMESTAMP(3) NOT NULL,
    "eliminatedAt" TIMESTAMP(3) NOT NULL,
    "eliminatedRound" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RoomUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctOption" TEXT NOT NULL,
    "category" "public"."QuestionCategory" NOT NULL,
    "baseDifficulty" "public"."Difficulty" NOT NULL DEFAULT 'EASY',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
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
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Answer" (
    "id" TEXT NOT NULL,
    "selectedOption" TEXT NOT NULL,
    "timeTakenMs" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "serverTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "public"."User"("username");

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
CREATE INDEX "RoomUser_roomId_status_idx" ON "public"."RoomUser"("roomId", "status");

-- CreateIndex
CREATE INDEX "RoomUser_userId_status_idx" ON "public"."RoomUser"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RoomUser_roomId_userId_key" ON "public"."RoomUser"("roomId", "userId");

-- CreateIndex
CREATE INDEX "Question_category_idx" ON "public"."Question"("category");

-- CreateIndex
CREATE INDEX "Question_baseDifficulty_idx" ON "public"."Question"("baseDifficulty");

-- CreateIndex
CREATE INDEX "Question_approved_idx" ON "public"."Question"("approved");

-- CreateIndex
CREATE INDEX "Round_roomId_active_idx" ON "public"."Round"("roomId", "active");

-- CreateIndex
CREATE INDEX "Round_roomId_number_idx" ON "public"."Round"("roomId", "number");

-- CreateIndex
CREATE INDEX "Answer_userId_roundId_idx" ON "public"."Answer"("userId", "roundId");

-- CreateIndex
CREATE INDEX "Answer_roundId_isCorrect_idx" ON "public"."Answer"("roundId", "isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_userId_roundId_key" ON "public"."Answer"("userId", "roundId");

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

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomUser" ADD CONSTRAINT "RoomUser_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomUser" ADD CONSTRAINT "RoomUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Round" ADD CONSTRAINT "Round_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Round" ADD CONSTRAINT "Round_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
