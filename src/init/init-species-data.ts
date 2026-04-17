import { initGenerationOne } from "#balance/species/generation-01";
import { initGenerationTwo } from "#balance/species/generation-02";
import { initGenerationThree } from "#balance/species/generation-03";
import { initGenerationFour } from "#balance/species/generation-04";
import { initGenerationFive } from "#balance/species/generation-05";
import { initGenerationSix } from "#balance/species/generation-06";
import { initGenerationSeven } from "#balance/species/generation-07";
import { initGenerationEight } from "#balance/species/generation-08";
import { initGenerationNine } from "#balance/species/generation-09";
import { speciesData } from "#balance/species/species-data";
import { allSpecies } from "#data/data-lists";
import type { PokemonSpecies } from "#data/pokemon-species";

export function initSpeciesData(): void {
  Object.assign(
    speciesData,
    initGenerationOne(),
    initGenerationTwo(),
    initGenerationThree(),
    initGenerationFour(),
    initGenerationFive(),
    initGenerationSix(),
    initGenerationSeven(),
    initGenerationEight(),
    initGenerationNine(),
  );

  (allSpecies as PokemonSpecies[]).push(...Object.values(speciesData).map(data => data.species));
}
