import {
  BASE_SAME_SPECIES_SHINY_INCREASE_COUNT,
  MAX_SAME_SPECIES_SHINY_INCREASE_COUNT,
  SAME_SPECIES_EGG_SHINY_RATE,
} from "#balance/rates";

/**
 * Custom function that can be used in the dev environment to help testing without having to use the debugger or make temporary code changes.
 *
 * Default Button mapping is `Q`, but can be changed in the keyboard settings.
 * @example
 * ```ts
 *   const playerPokemon = globalScene.getPlayerPokemon();
 *   if (playerPokemon) {
 *     playerPokemon.hp = 1;
 *   }
 * ```
 * @privateremarks
 * This file should _NOT_ be committed and only used for temporary testing purposes.
 */
export async function customDevFunction() {
  for (let i = 0; i < MAX_SAME_SPECIES_SHINY_INCREASE_COUNT; i++) {
    console.log(`Shiny odds for ${i} eggs: ${((1 / getSameSpeciesShinyOdds(i)) * 100).toFixed(2)}%`);
  }
}

function getSameSpeciesShinyOdds(count) {
  const baseRate = 1 / SAME_SPECIES_EGG_SHINY_RATE;
  const targetRate = 1;
  count++; // Increment count since `lastShiny` starts at 0

  if (count <= BASE_SAME_SPECIES_SHINY_INCREASE_COUNT) {
    return 1 / baseRate;
  }
  if (count >= MAX_SAME_SPECIES_SHINY_INCREASE_COUNT) {
    return 1 / targetRate;
  }

  const progress =
    (count - BASE_SAME_SPECIES_SHINY_INCREASE_COUNT)
    / (MAX_SAME_SPECIES_SHINY_INCREASE_COUNT - BASE_SAME_SPECIES_SHINY_INCREASE_COUNT);
  const currentProbability = baseRate + progress * (targetRate - baseRate);

  return 1 / currentProbability;
}
