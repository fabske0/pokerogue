import type { SpeciesFormEvolution } from "#balance/pokemon-evolutions";
import type { PokemonSpecies } from "#data/pokemon-species";
import type { AbilityId } from "#enums/ability-id";
import type { EggTier } from "#enums/egg-type";
import type { MoveId } from "#enums/move-id";
import type { SpeciesId } from "#enums/species-id";

interface PokemonSpeciesPassives {
  [key: number]: AbilityId;
}

export type LevelMoves = [number, MoveId][];

export interface SpeciesFormTmMoves {
  move: MoveId;
  form: string;
}

export interface PokemonSpeciesData {
  species: PokemonSpecies;
  starter: SpeciesId;
  evolutions: SpeciesFormEvolution | SpeciesFormEvolution[];
  /** The egg tier of the Pokémon. Should be omitted for non starters */
  eggTier?: EggTier;
  passives: AbilityId | PokemonSpeciesPassives;
  levelMoves: LevelMoves;
  tms: (MoveId | SpeciesFormTmMoves)[];
}
