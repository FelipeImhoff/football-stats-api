import { Stats } from "./games.js";

export interface ChampionshipRule {
  applyRule(
    homeTeamData: Stats,
    awayTeamData: Stats
  ): Record<string, string | null>;
}
