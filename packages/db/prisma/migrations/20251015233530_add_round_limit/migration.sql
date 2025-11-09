-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "currentRound" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "roundLimit" INTEGER NOT NULL DEFAULT 5;
