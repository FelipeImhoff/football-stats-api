import { Stats } from "../../types/games.js";
import { ChampionshipRule } from "../../types/rules.js";
import { removeNulls } from "../../Utils/objectUtils.js";
import {
  chanceHomeWin,
  chanceAwayOrDraw,
  chanceAwayOverHalfGoal,
  chanceHomeOverHalfGoal,
  chanceOverHalfGoal,
  chanceOverTwoAndHalfGoal,
  chanceOverOneAndHalfGoal,
  chanceHomeOrDraw,
} from "./rules.js";

export const spaniseagueRules: ChampionshipRule = {
  applyRule(homeTeamData, awayTeamData) {
    return init(homeTeamData, awayTeamData);
  },
};

function init(
  homeTeamData: Stats,
  awayTeamData: Stats
): Record<string, string> {
  const result = {
    chanceHomeWin: chanceHomeWin(homeTeamData, awayTeamData),
    chanceHomeOrDraw: chanceHomeOrDraw(homeTeamData, awayTeamData),
    chanceAwayOrDraw: chanceAwayOrDraw(homeTeamData, awayTeamData),
    chanceHomeOverHalfGoal: chanceHomeOverHalfGoal(homeTeamData, awayTeamData),
    chanceAwayOverHalfGoal: chanceAwayOverHalfGoal(homeTeamData, awayTeamData),
    chanceOverHalfGoal: chanceOverHalfGoal(homeTeamData, awayTeamData),
    chanceOverOneAndHalfGoal: chanceOverOneAndHalfGoal(
      homeTeamData,
      awayTeamData
    ),
    chanceOverTwoAndHalfGoal: chanceOverTwoAndHalfGoal(
      homeTeamData,
      awayTeamData
    ),
  };

  return removeNulls(result);
}
