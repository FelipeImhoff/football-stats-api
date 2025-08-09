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
    awayTeamData.homeTeamWinPercentage
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

  if (
    homeTeamHomeOrDrawsPercentage !== null &&
    homeTeamHomeOrDrawsPercentage > 83.51
  ) {
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
  const absoluteDifferenceValue = absoluteDifference(
    homeTeamHomeOrAwayPercentage,
    awayTeamHomeOrAwayPercentage
  );

  if (homeTeamHomeOrAwayPercentage > 90 || absoluteDifferenceValue > 14.98) {
    return "Chance dupla vitória do time da casa ou do visitante";
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
  const homeTeamOverHalfGoalPercentage = parsePercentage(
    homeTeamData.homeTeamGoalsOverPercentage.atLeast1
  );
  const awayTeamOverHalfGoalPercentage = parsePercentage(
    awayTeamData.homeTeamGoalsOverPercentage.atLeast1
  );

  const absoluteDifferenceValue = absoluteDifference(
    homeTeamOverHalfGoalPercentage,
    awayTeamOverHalfGoalPercentage
  );

  const differenceValue =
    homeTeamOverHalfGoalPercentage - awayTeamOverHalfGoalPercentage;

  if (absoluteDifferenceValue > 2.78 && differenceValue > -9.47) {
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
  const teamsAverageGoals = average(
    homeTeamAwayTeamGoalsAverage,
    awayTeamAwayTeamGoalsAverage
  );

  const homeTeamOverHalfGoalPercentage = parsePercentage(
    homeTeamData.awayTeamGoalsOverPercentage.atLeast1
  );
  const awayTeamOverHalfGoalPercentage = parsePercentage(
    awayTeamData.awayTeamGoalsOverPercentage.atLeast1
  );
  const absoluteDifferenceValue = absoluteDifference(
    homeTeamOverHalfGoalPercentage,
    awayTeamOverHalfGoalPercentage
  );

  if (teamsAverageGoals > 1 && absoluteDifferenceValue <= 3.41) {
    return "Time visitante faz mais de 0.5 gols";
  }
  return null;
}

export function chanceOverHalfGoal(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamAverageGoals =
    parsePercentage(homeTeamData.homeTeamGoalsAverage) +
    parsePercentage(homeTeamData.awayTeamGoalsAverage);

  const awayTeamAverageGoals =
    parsePercentage(awayTeamData.homeTeamGoalsAverage) +
    parsePercentage(awayTeamData.awayTeamGoalsAverage);

  const relativeHomeStrength = homeTeamAverageGoals - awayTeamAverageGoals;

  if (relativeHomeStrength > -1.33) {
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
  const differenceValue =
    homeTeamOverOneAndHalfGoalPercentage - awayTeamOverOneAndHalfGoalPercentage;

  const relativeHomeStrength = absoluteDifference(
    homeTeamOverOneAndHalfGoalPercentage,
    awayTeamOverOneAndHalfGoalPercentage
  );

  if (
    absoluteDifferenceValue < 58.24 &&
    differenceValue < 36.36 &&
    relativeHomeStrength > 0.06
  ) {
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
