import { getChampionshipRule } from "../rules/registry.js";
import { Stats } from "../types/games.js";

export function processChampionship(
  competition: string,
  homeTeamData: Stats,
  awayTeamData: Stats
): Record<string, string> {
  const rule = getChampionshipRule(competition);

  return rule.applyRule(homeTeamData, awayTeamData);
}
