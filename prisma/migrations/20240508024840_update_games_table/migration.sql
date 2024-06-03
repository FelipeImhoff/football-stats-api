/*
  Warnings:

  - You are about to drop the column `awayTeamName` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamName` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `teamsId` on the `games` table. All the data in the column will be lost.
  - Added the required column `awayTeamId` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeamId` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_awayTeamName_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_homeTeamName_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_teamsId_fkey";

-- AlterTable
ALTER TABLE "games" DROP COLUMN "awayTeamName",
DROP COLUMN "homeTeamName",
DROP COLUMN "teamsId",
ADD COLUMN     "awayTeamId" TEXT NOT NULL,
ADD COLUMN     "homeTeamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
