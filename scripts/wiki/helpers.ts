export function normalizeSpriteKey(spriteKey: string): string {
  return spriteKey.replace(/^pkmn__/, "");
}
