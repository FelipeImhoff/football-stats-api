import { ChampionshipRule } from "../types/rules.js";
import { brazilianLeagueRules } from "./brazilianLeague/index.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { resolveChampionAlias } from "../Utils/aliasUtils.js";
import { englishLeagueRules } from "./englishLeague/index.js";
import { germanLeagueRules } from "./germanLeague/index.js";
import { frenchLeagueRules } from "./frenchLeague/index.js";
import { italianLeagueRules } from "./italianLeague/index.js";

const ruleMap: Record<string, ChampionshipRule> = {
  brazilianLeague: brazilianLeagueRules,
  englishLeague: englishLeagueRules,
  // spanishLeague: spanishLeagueRules,
  germanLeague: germanLeagueRules,
  frenchLeague: frenchLeagueRules,
  italianLeague: italianLeagueRules,
};

export function getChampionshipRule(name: string): ChampionshipRule {
  const alias = resolveChampionAlias(name);
  if (!alias || !ruleMap[alias]) {
    throw new BadRequestError(
      `Regras não encontradas para o campeonato: ${name}`
    );
  }
  return ruleMap[alias];
}
