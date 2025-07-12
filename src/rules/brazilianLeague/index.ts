import { Stats } from "../../types/games.js";
import { ChampionshipRule } from "../../types/rules.js";
import { removeNulls } from "../../Utils/objectUtils.js";
import {
  chanceAwayOverHalfGoal,
  chanceHomeOrAway,
  chanceHomeOrDraw,
  chanceHomeOverHalfGoal,
  chanceOverHalfGoal,
  chanceOverOneAndHalfGoal,
} from "./rules.js";

export const brazilianLeagueRules: ChampionshipRule = {
  applyRule(homeTeamData, awayTeamData) {
    return init(homeTeamData, awayTeamData);
  },
};

function init(
  homeTeamData: Stats,
  awayTeamData: Stats
): Record<string, string> {
  const result = {
    chanceHomeOrDraw: chanceHomeOrDraw(homeTeamData, awayTeamData),
    chanceHomeOrAway: chanceHomeOrAway(homeTeamData, awayTeamData),
    chanceHomeOverHalfGoal: chanceHomeOverHalfGoal(homeTeamData, awayTeamData),
    chanceAwayOverHalfGoal: chanceAwayOverHalfGoal(homeTeamData, awayTeamData),
    chanceOverHalfGoal: chanceOverHalfGoal(homeTeamData, awayTeamData),
    chanceOverOneAndHalfGoal: chanceOverOneAndHalfGoal(
      homeTeamData,
      awayTeamData
    ),
  };

  return removeNulls(result);
}
