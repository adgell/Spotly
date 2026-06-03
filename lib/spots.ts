/** Shared spot field normalization for API + client filters */

export function normalizeStringList(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  const text = String(value).trim();
  return text ? [text] : [];
}

export function spotMatchesCategory(
  category: string | string[] | undefined,
  selected: string
): boolean {
  if (selected === 'All') return true;
  const cats = normalizeStringList(category);
  return cats.some((c) => c === selected);
}

export function spotMatchesNeighborhood(
  neighborhood: string | string[] | undefined,
  selected: string
): boolean {
  if (selected === 'All Areas') return true;
  const hoods = normalizeStringList(neighborhood);
  return hoods.some((h) => h === selected);
}

export function spotMatchesVibe(vibes: string[] | undefined, selected: string): boolean {
  if (selected === 'Any Vibe') return true;
  if (!vibes?.length) return false;
  return vibes.some((v) => v.trim() === selected);
}
