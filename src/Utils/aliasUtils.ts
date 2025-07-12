function resolveChampionAlias(alias: string): string | null {
  const aliasMap: Record<string, string> = {
    "Campeonato Brasileiro Série A": "brazilianLeague",
    "Fußball-Bundesliga": "germanLeague",
    "La Liga": "spanishLeague",
    "Ligue 1": "frenchLeague",
    "Premier League": "englishLeague",
    "Serie A": "italianLeague",
  };

  return aliasMap[alias] || null;
}

export { resolveChampionAlias };
