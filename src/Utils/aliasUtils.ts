function resolveChampionAlias(alias: string): string | null {
  const aliasMap: Record<string, string> = {
    "Campeonato Brasileiro Série A": "brazilianLeague",
    "Premier League": "englishLeague",
    "Fußball-Bundesliga": "germanLeague",
    "La Liga": "spanishLeague",
    "Ligue 1": "frenchLeague",
    "Serie A": "italianLeague",
  };

  return aliasMap[alias] || null;
}

export { resolveChampionAlias };
