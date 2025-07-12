import { Stats } from "../../types/games.js";
import {
  parsePercentage,
  absoluteDifference,
  average,
} from "../../Utils/mathUtils.js";

export function chanceHomeWin(homeTeamData: Stats, awayTeamData: Stats) {
  const homeTeamHomeTeamWin = parsePercentage(
    homeTeamData.homeTeamWinPercentage
  );
  const awayTeamHomeTeamWin = parsePercentage(
    homeTeamData.homeTeamWinPercentage
  );
  const differenceValue = homeTeamHomeTeamWin - awayTeamHomeTeamWin;

  if (differenceValue > -2.45 && differenceValue < 25) {
    return "Chance de vitória do time da casa";
  }
  return null;
}

export function chanceHomeOrDraw(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamHomeOrDrawsPercentage = parsePercentage(
    homeTeamData.homeOrDrawsPercentage
  );
  const awayTeamHomeOrDrawsPercentage = parsePercentage(
    awayTeamData.homeOrDrawsPercentage
  );
  const differenceValue =
    homeTeamHomeOrDrawsPercentage - awayTeamHomeOrDrawsPercentage;

  if (differenceValue > 0) {
    return "Chance dupla vitória do time da casa ou empate";
  }
  return null;
}

export function chanceHomeOrAway(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamHomeOrAwayPercentage = parsePercentage(
    homeTeamData.homeOrAwayWinPercentage
  );
  const awayTeamHomeOrAwayPercentage = parsePercentage(
    awayTeamData.homeOrAwayWinPercentage
  );
  const differenceValue =
    homeTeamHomeOrAwayPercentage - awayTeamHomeOrAwayPercentage;

  if (differenceValue <= 17.08) {
    return "Chance dupla time da casa ou visitante";
  }

  return null;
}

export function chanceAwayOrDraw(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamAwayOrDrawsPercentage = parsePercentage(
    homeTeamData.awayOrDrawsPercentage
  );

  if (homeTeamAwayOrDrawsPercentage > 60.87) {
    return "Chance dupla vitória do time visitante ou empate";
  }
  return null;
}

export function chanceHomeOverHalfGoal(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamHomeAverageGoals = parsePercentage(
    homeTeamData.homeTeamGoalsAverage
  );
  const awayTeamHomeAverageGoals = parsePercentage(
    awayTeamData.homeTeamGoalsAverage
  );
  const homeTeamAverageGoals = average(
    homeTeamHomeAverageGoals,
    awayTeamHomeAverageGoals
  );

  if (homeTeamAverageGoals > 1.13) {
    return "Time da casa faz mais de 0.5 gols";
  }
  return null;
}

export function chanceAwayOverHalfGoal(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamAwayTeamGoalsAverage = parsePercentage(
    homeTeamData.awayTeamGoalsAverage
  );
  const awayTeamAwayTeamGoalsAverage = parsePercentage(
    awayTeamData.awayTeamGoalsAverage
  );
  const awayTeamAverageGoals = average(
    homeTeamAwayTeamGoalsAverage,
    awayTeamAwayTeamGoalsAverage
  );

  if (awayTeamAverageGoals > 0.88) {
    return "Time visitante faz mais de 0.5 gols";
  }
  return null;
}

export function chanceOverHalfGoal(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamOverTwoAndHalfGoalPercentage = parsePercentage(
    homeTeamData.homeTeamGoalsOverPercentage.atLeast3
  );
  const awayTeamOverTwoAndHalfGoalPercentage = parsePercentage(
    awayTeamData.homeTeamGoalsOverPercentage.atLeast3
  );
  const differenceValue =
    homeTeamOverTwoAndHalfGoalPercentage - awayTeamOverTwoAndHalfGoalPercentage;

  if (differenceValue > -1.33) {
    return "Total de gols mais de 0.5";
  }
  return null;
}

export function chanceOverOneAndHalfGoal(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamOverOneAndHalfGoalPercentage = parsePercentage(
    homeTeamData.homeTeamGoalsOverPercentage.atLeast2
  );
  const awayTeamOverOneAndHalfGoalPercentage = parsePercentage(
    awayTeamData.homeTeamGoalsOverPercentage.atLeast2
  );
  const absoluteDifferenceValue = absoluteDifference(
    homeTeamOverOneAndHalfGoalPercentage,
    awayTeamOverOneAndHalfGoalPercentage
  );

  if (absoluteDifferenceValue < 58.24) {
    return "Total de gols mais de 1.5";
  }
  return null;
}

export function chanceOverTwoAndHalfGoal(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamOverTwoAndHalfGoalPercentage = parsePercentage(
    homeTeamData.homeTeamGoalsOverPercentage.atLeast3
  );
  const awayTeamOverTwoAndHalfGoalPercentage = parsePercentage(
    awayTeamData.homeTeamGoalsOverPercentage.atLeast3
  );
  const differenceValue =
    homeTeamOverTwoAndHalfGoalPercentage - awayTeamOverTwoAndHalfGoalPercentage;

  const homeTeamAverageGoals =
    parsePercentage(homeTeamData.homeTeamGoalsAverage) +
    parsePercentage(homeTeamData.awayTeamGoalsAverage);
  const awayTeamAverageGoals =
    parsePercentage(awayTeamData.homeTeamGoalsAverage) +
    parsePercentage(awayTeamData.awayTeamGoalsAverage);
  const teamAverageGoals = average(homeTeamAverageGoals, awayTeamAverageGoals);

  if (teamAverageGoals >= 2.95 && differenceValue > 2.78) {
    return "Total de gols mais de 2.5";
  }
  return null;
}
