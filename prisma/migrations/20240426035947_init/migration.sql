-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "winner" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "season" TEXT NOT NULL,
    "homeTeamGoals" INTEGER NOT NULL,
    "awayTeamGoals" INTEGER NOT NULL,
    "homeManager" TEXT NOT NULL,
    "awayManager" TEXT NOT NULL,
    "homeTeamName" TEXT NOT NULL,
    "awayTeamName" TEXT NOT NULL,
    "teamsId" TEXT,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players_stats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minutesPlayed" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "convertedPenalties" INTEGER NOT NULL,
    "attemptedPenalties" INTEGER NOT NULL,
    "shots" INTEGER NOT NULL,
    "shotsOnTarget" INTEGER NOT NULL,
    "xG" DOUBLE PRECISION NOT NULL,
    "npxG" DOUBLE PRECISION NOT NULL,
    "xAG" DOUBLE PRECISION NOT NULL,
    "game_id" TEXT NOT NULL,

    CONSTRAINT "players_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_homeTeamName_fkey" FOREIGN KEY ("homeTeamName") REFERENCES "teams"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_awayTeamName_fkey" FOREIGN KEY ("awayTeamName") REFERENCES "teams"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_teamsId_fkey" FOREIGN KEY ("teamsId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players_stats" ADD CONSTRAINT "players_stats_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
