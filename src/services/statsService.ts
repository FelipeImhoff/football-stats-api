import { GoalsOverPercentage, Stats } from "../types/games.js";
import { Games } from "@prisma/client";

function countOverGoals(goal: number, target: Record<string, number>) {
  for (let i = 1; i <= 5; i++) {
    if (goal >= i) target[`atLeast${i}`]++;
  }
}

function toPercentage(value: number, total: number): string {
  return total === 0 ? "0.00%" : `${((value / total) * 100).toFixed(2)}%`;
}

function toAverage(value: number, total: number): string {
  return total === 0 ? "0.00" : (value / total).toFixed(2);
}

function generatePercentageObject(
  source: Record<string, number>,
  total: number
): GoalsOverPercentage {
  return {
    atLeast1: toPercentage(source.atLeast1, total),
    atLeast2: toPercentage(source.atLeast2, total),
    atLeast3: toPercentage(source.atLeast3, total),
    atLeast4: toPercentage(source.atLeast4, total),
    atLeast5: toPercentage(source.atLeast5, total),
  };
}

async function calculateStats(games: Games[]): Promise<Stats> {
  const totalGames = games.length;

  let homeWins = 0,
    draws = 0,
    awayWins = 0,
    bothScored = 0;
  let homeGoalsSum = 0,
    awayGoalsSum = 0;
  const homeGoalsList: number[] = [],
    awayGoalsList: number[] = [];

  const initCounter = () => ({
    atLeast1: 0,
    atLeast2: 0,
    atLeast3: 0,
    atLeast4: 0,
    atLeast5: 0,
  });
  const homeOver = initCounter();
  const awayOver = initCounter();
  const totalOver = initCounter();

  for (let { homeTeamGoals, awayTeamGoals } of games) {
    homeGoalsSum += homeTeamGoals;
    awayGoalsSum += awayTeamGoals;
    homeGoalsList.push(homeTeamGoals);
    awayGoalsList.push(awayTeamGoals);

    if (homeTeamGoals > awayTeamGoals) homeWins++;
    else if (homeTeamGoals === awayTeamGoals) draws++;
    else awayWins++;

    if (homeTeamGoals > 0 && awayTeamGoals > 0) bothScored++;

    countOverGoals(homeTeamGoals, homeOver);
    countOverGoals(awayTeamGoals, awayOver);
    countOverGoals(homeTeamGoals + awayTeamGoals, totalOver);
  }

  return {
    games: totalGames,
    homeTeamWins: homeWins,
    draws,
    awayTeamWins: awayWins,
    homeTeamWinPercentage: toPercentage(homeWins, totalGames),
    homeOrAwayWinPercentage: toPercentage(homeWins + awayWins, totalGames),
    homeOrDrawsPercentage: toPercentage(homeWins + draws, totalGames),
    drawsPercentage: toPercentage(draws, totalGames),
    awayOrDrawsPercentage: toPercentage(awayWins + draws, totalGames),
    awayTeamWinPercentage: toPercentage(awayWins, totalGames),
    homeTeamGoalsAverage: toAverage(homeGoalsSum, totalGames),
    awayTeamGoalsAverage: toAverage(awayGoalsSum, totalGames),
    bothScored,
    bothScoredPercentual: toPercentage(bothScored, totalGames),
    notBothScoredPercentual: toPercentage(totalGames - bothScored, totalGames),
    homeTeamMinGoals: Math.min(...homeGoalsList),
    awayTeamMinGoals: Math.min(...awayGoalsList),
    homeTeamMaxGoals: Math.max(...homeGoalsList),
    awayTeamMaxGoals: Math.max(...awayGoalsList),
    homeTeamGoalsOver: homeOver,
    homeTeamGoalsOverPercentage: generatePercentageObject(homeOver, totalGames),
    awayTeamGoalsOver: awayOver,
    awayTeamGoalsOverPercentage: generatePercentageObject(awayOver, totalGames),
    gameTotalOver: totalOver,
    gameTotalOverPercentage: generatePercentageObject(totalOver, totalGames),
  };
}

async function calculateFairOdds(stats: Stats): Promise<void> {
  const gamesAmount = stats.games;

  stats.fairOdds = {
    homeTeamWins: (1 / (stats.homeTeamWins / gamesAmount)).toFixed(2),
    homeOrAwayWins: (
      1 /
      ((stats.homeTeamWins + stats.awayTeamWins) / gamesAmount)
    ).toFixed(2),
    homeOrDraws: (
      1 /
      ((stats.homeTeamWins + stats.draws) / gamesAmount)
    ).toFixed(2),
    draws: (1 / (stats.draws / gamesAmount)).toFixed(2),
    awayOrDraws: (
      1 /
      ((stats.awayTeamWins + stats.draws) / gamesAmount)
    ).toFixed(2),
    awayTeamWins: (1 / (stats.awayTeamWins / gamesAmount)).toFixed(2),
    bothScored: (1 / (stats.bothScored / gamesAmount)).toFixed(2),
    notBothScored: (
      1 /
      ((gamesAmount - stats.bothScored) / gamesAmount)
    ).toFixed(2),
    homeTeamGoalsOver: {
      atLeast1: (1 / (stats.homeTeamGoalsOver.atLeast1 / gamesAmount)).toFixed(
        2
      ),
      atLeast2: (1 / (stats.homeTeamGoalsOver.atLeast2 / gamesAmount)).toFixed(
        2
      ),
      atLeast3: (1 / (stats.homeTeamGoalsOver.atLeast3 / gamesAmount)).toFixed(
        2
      ),
      atLeast4: (1 / (stats.homeTeamGoalsOver.atLeast4 / gamesAmount)).toFixed(
        2
      ),
      atLeast5: (1 / (stats.homeTeamGoalsOver.atLeast5 / gamesAmount)).toFixed(
        2
      ),
    },
    awayTeamGoalsOver: {
      atLeast1: (1 / (stats.awayTeamGoalsOver.atLeast1 / gamesAmount)).toFixed(
        2
      ),
      atLeast2: (1 / (stats.awayTeamGoalsOver.atLeast2 / gamesAmount)).toFixed(
        2
      ),
      atLeast3: (1 / (stats.awayTeamGoalsOver.atLeast3 / gamesAmount)).toFixed(
        2
      ),
      atLeast4: (1 / (stats.awayTeamGoalsOver.atLeast4 / gamesAmount)).toFixed(
        2
      ),
      atLeast5: (1 / (stats.awayTeamGoalsOver.atLeast5 / gamesAmount)).toFixed(
        2
      ),
    },
    gameTotalOver: {
      atLeast1: (1 / (stats.gameTotalOver.atLeast1 / gamesAmount)).toFixed(2),
      atLeast2: (1 / (stats.gameTotalOver.atLeast2 / gamesAmount)).toFixed(2),
      atLeast3: (1 / (stats.gameTotalOver.atLeast3 / gamesAmount)).toFixed(2),
      atLeast4: (1 / (stats.gameTotalOver.atLeast4 / gamesAmount)).toFixed(2),
      atLeast5: (1 / (stats.gameTotalOver.atLeast5 / gamesAmount)).toFixed(2),
    },
  };

  return;
}

export { calculateStats, calculateFairOdds };
