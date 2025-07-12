import { Stats } from "../../types/games.js";
import { absoluteDifference } from "../../Utils/mathUtils";
import {
  absoluteDifference,
  average,
  parsePercentage,
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

  if (homeTeamHomeOrDrawsPercentage > 75) {
    return "Chance dupla vitória do time da casa ou empate";
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
  const homeTeamHomeOverHalfGoalPercentage = parsePercentage(
    homeTeamData.homeTeamGoalsOverPercentage.atLeast1
  );
  const awayTeamHomeOverHalfGoalPercentage = parsePercentage(
    awayTeamData.homeTeamGoalsOverPercentage.atLeast1
  );
  const differenceValue =
    homeTeamHomeOverHalfGoalPercentage - awayTeamHomeOverHalfGoalPercentage;
  const absoluteDifferenceValue = absoluteDifference(
    homeTeamHomeOverHalfGoalPercentage,
    awayTeamHomeOverHalfGoalPercentage
  );

  if (absoluteDifferenceValue > 2.78 && differenceValue > -9.47) {
    return "Time da casa faz mais de 0.5 gols";
  }
  return null;
}

export function chanceAwayOverHalfGoal(
  homeTeamData: Stats,
  awayTeamData: Stats
): string | null {
  const homeTeamAwayOverHalfGoalPercentage = parsePercentage(
    homeTeamData.awayTeamGoalsOverPercentage.atLeast1
  );
  const awayTeamAwayOverHalfGoalPercentage = parsePercentage(
    awayTeamData.awayTeamGoalsOverPercentage.atLeast1
  );
  const differenceValue =
    homeTeamAwayOverHalfGoalPercentage - awayTeamAwayOverHalfGoalPercentage;

  const homeTeamAwayTeamGoalsAverage = parsePercentage(
    homeTeamData.awayTeamGoalsAverage
  );
  const awayTeamAwayTeamGoalsAverage = parsePercentage(
    awayTeamData.awayTeamGoalsAverage
  );
  const awayTeamGoalsAverage = average(
    homeTeamAwayTeamGoalsAverage,
    awayTeamAwayTeamGoalsAverage
  );
  const relativeAwayStrength =
    homeTeamAwayTeamGoalsAverage - awayTeamAwayTeamGoalsAverage;

  if (
    differenceValue <= 3.47 &&
    awayTeamGoalsAverage > 1 &&
    relativeAwayStrength < 0.88
  ) {
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
