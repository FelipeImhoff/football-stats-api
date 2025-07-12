import { ChampionshipRule } from "../types/rules.js";
import { brazilianLeagueRules } from "./brazilianLeague/index.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { resolveChampionAlias } from "../Utils/aliasUtils.js";

const ruleMap: Record<string, ChampionshipRule> = {
  brazilianLeague: brazilianLeagueRules,
};

export function getChampionshipRule(name: string): ChampionshipRule {
  const alias = resolveChampionAlias(name);
  if (!alias || !ruleMap[alias]) {
    throw new BadRequestError(
      `Regra não encontrada para o campeonato: ${name}`
    );
  }
  return ruleMap[alias];
}
