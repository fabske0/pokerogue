import { allSpecies } from "#data/data-lists";
import type { PokemonSpecies } from "#data/pokemon-species";
import type { SpeciesDataMap } from "#types/pokemon-species";
import { initGenerationOne } from "./generation-01";
import { initGenerationTwo } from "./generation-02";
import { initGenerationThree } from "./generation-03";
import { initGenerationFour } from "./generation-04";
import { initGenerationFive } from "./generation-05";
import { initGenerationSix } from "./generation-06";
import { initGenerationSeven } from "./generation-07";
import { initGenerationEight } from "./generation-08";
import { initGenerationNine } from "./generation-09";

export const speciesData = {} as SpeciesDataMap;

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
