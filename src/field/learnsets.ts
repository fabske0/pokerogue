import { EVOLVE_MOVE, RELEARN_MOVE } from "#app/constants";
import { LearnMoveSituation } from "#enums/learn-move-situation";
import { LearnableMoveSource } from "#enums/learnable-move-source";
import type { MoveId } from "#enums/move-id";
import type { Pokemon } from "#field/pokemon";
import type { LevelMovesWithSource } from "#types/pokemon-species";
import { getPokemonSpeciesForm } from "#utils/pokemon-utils";

/**
 * Get the {@linkcode LearnableMoveSource | source} of a move.
 * @param level - The level at which the move is learned
 * @param fromPrevo - Whether the move is from a prevolution
 * @returns The source of the move
 */
function computeLearnableMoveSource(level: number, fromPrevo: boolean): LearnableMoveSource {
  // Enum arranged such that the fusion source is 1 greater than its normal counterpart
  switch (level) {
    case RELEARN_MOVE:
      return LearnableMoveSource.RELEARN;
    case EVOLVE_MOVE:
      return LearnableMoveSource.EVOLUTION;
    default:
      return fromPrevo ? LearnableMoveSource.PREVO : LearnableMoveSource.LEVEL;
  }
}

/**
 * Helper method for {@linkcode getLevelMoves}
 *
 * Get all level moves the species form can learn on its own.
 * @param pokemon - The Pokemon to get the moves for
 * @param includeEvolutionMoves - Whether to include evolution moves
 * @param includeRelearnerMoves - Whether to include moves that would require a relearner. Note the move relearner inherently allows evolution moves
 * @param fromFusion - Whether to get the moves from the fusion species \
 * @remarks
 * `fromFusion` should only be used if the pokemon is a fusion
 * @returns A list of moves and the levels they can be learned at, along with the source of the moveexcludes moves from prevolutions, but includes evolution moves and relearner moves
 */
function getRegularLevelMoves(
  pokemon: Pokemon,
  includeEvolutionMoves: boolean,
  includeRelearnerMoves: boolean,
  fromFusion = false,
): LevelMovesWithSource {
  const ret: LevelMovesWithSource = [];
  const moves = (fromFusion ? pokemon.getFusionSpeciesForm(true) : pokemon.getSpeciesForm(true)).getLevelMoves();
  for (const [level, move] of moves) {
    if (
      (includeEvolutionMoves && level === EVOLVE_MOVE)
      || (includeRelearnerMoves && level === RELEARN_MOVE)
      || level > 0
    ) {
      const moveSource = (computeLearnableMoveSource(level, false) + +fromFusion) as LearnableMoveSource;
      ret.push([level, move, moveSource]);
    }
  }
  return ret;
}

/**
 * Helper method for {@linkcode getLevelMoves}
 *
 * Get all level moves the species form and its prevolutions can learn.
 * @param pokemon - The Pokemon to get the prevolution moves for
 * @param includeEvolutionMoves - Whether to include evolution moves
 * @param includeRelearnerMoves - Whether to include moves that would require a relearner. Note the move relearner inherently allows evolution moves
 * @param fromFusion - Whether to get the prevolution moves from the fusion species \
 * @remarks
 * `fromFusion` should only be used if the pokemon is a fusion
 * @returns A list of moves and the levels they can be learned at, along with the source of the move
 */
function getPrevolutionMoves(
  pokemon: Pokemon,
  includeEvolutionMoves: boolean,
  includeRelearnerMoves: boolean,
  fromFusion = false,
): LevelMovesWithSource {
  const ret: LevelMovesWithSource = [];
  // Convey that this method cannot use `fromFusion` if the pokemon is not a fusion and the bang is then safe
  const speciesBase = fromFusion ? pokemon.fusionSpecies! : pokemon.species;
  if (!speciesBase && fromFusion) {
    // TODO: Find a better way to handle fromFusion=true without being a fusion
    console.warn("getPrevolutionMoves was called with fromFusion=true but the pokemon is not a fusion");
    return ret;
  }
  const evolutionChain = speciesBase.getSimulatedEvolutionChain(
    pokemon.level,
    pokemon.hasTrainer(),
    pokemon.isBoss(),
    pokemon.isPlayer(),
  );
  for (let e = 0; e < evolutionChain.length; e++) {
    const isPrevo = e < evolutionChain.length - 1;
    // TODO: Might need to pass specific form index in simulated evolution chain
    const speciesLevelMoves = getPokemonSpeciesForm(evolutionChain[e][0], pokemon.formIndex).getLevelMoves();
    for (const [level, move] of speciesLevelMoves) {
      const includeLevelOne = !e || level > 1 || includeRelearnerMoves;
      if (includeRelearnerMoves && level === RELEARN_MOVE) {
        ret.push([level, move, (LearnableMoveSource.RELEARN + +fromFusion) as LearnableMoveSource]);
      } else if (includeEvolutionMoves && level === EVOLVE_MOVE) {
        ret.push([level, move, (LearnableMoveSource.EVOLUTION + +fromFusion) as LearnableMoveSource]);
      } else if (includeLevelOne && (!isPrevo || level <= evolutionChain[e + 1][1])) {
        const source = isPrevo ? LearnableMoveSource.PREVO : LearnableMoveSource.LEVEL;
        ret.push([level, move, (source + +fromFusion) as LearnableMoveSource]);
      }
    }
  }
  return ret;
}

/**
 * Helper method for {@linkcode getLevelMoves}
 *
 * Get all level moves the fusion species form can learn.
 * @param includeEvolutionMoves - Whether to include evolution moves
 * @param includeRelearnerMoves - Whether to include moves that would require a relearner. Note the move relearner inherently allows evolution moves
 * @returns A list of moves and the levels they can be learned at, along with the source of the move
 */
function getFusionEvolutionMoves(
  pokemon: Pokemon,
  includeEvolutionMoves: boolean,
  includeRelearnerMoves: boolean,
): LevelMovesWithSource {
  const ret: LevelMovesWithSource = [];
  const fusionLevelMoves = pokemon.getFusionSpeciesForm(true).getLevelMoves();
  for (const [level, move] of fusionLevelMoves) {
    if (
      (includeEvolutionMoves && level === EVOLVE_MOVE)
      || (includeRelearnerMoves && level === RELEARN_MOVE)
      || level > 0
    ) {
      let moveSource: LearnableMoveSource;
      switch (level) {
        case RELEARN_MOVE:
          moveSource = LearnableMoveSource.FUSION_RELEARN;
          break;
        case EVOLVE_MOVE:
          moveSource = LearnableMoveSource.FUSION_EVOLUTION;
          break;
        default:
          moveSource = LearnableMoveSource.FUSION_LEVEL;
      }
      ret.push([level, move, moveSource]);
    }
  }
  return ret;
}

/**
 * Helper function for {@linkcode filterAndSortLevelMoves}
 *
 * @remarks
 * Finds all non-duplicate items from the input, and pushes them into the output.
 * Two items count as duplicate if they have the same Move, regardless of level.
 *
 * @param levelMoves - The input array to search for non-duplicates from
 * @param ret - The output array to be pushed into.
 */
function getUniqueMoves(levelMoves: LevelMovesWithSource, ret: LevelMovesWithSource): void {
  const uniqueMoves: MoveId[] = [];
  for (const lm of levelMoves) {
    if (!uniqueMoves.find(m => m === lm[1])) {
      uniqueMoves.push(lm[1]);
      ret.push(lm);
    }
  }
}

/**
 * Helper method for {@linkcode getLevelMoves}
 *
 * Filters out moves not within the correct level range(s) and duplicates.
 * Sorts the moves first by level, then by source.
 * @param levelMoves - The list of level moves to filter and sort
 * @param startingLevel - Don't include moves below this level
 * @param includeEvolutionMoves - Whether to include evolution moves
 * @param includeRelearnerMoves - Whether to include moves that would require a relearner. Note the move relearner inherently allows evolution moves
 * @returns A filtered and sorted list of level moves
 */
function filterAndSortLevelMoves(
  pokemon: Pokemon,
  levelMoves: LevelMovesWithSource,
  startingLevel: number,
  includeEvolutionMoves = false,
  includeRelearnerMoves = false,
): LevelMovesWithSource {
  const ret: LevelMovesWithSource = [];
  levelMoves.sort(([lvlA, , sourceA], [lvlB, , sourceB]) => {
    if (lvlA !== lvlB) {
      return lvlA > lvlB ? 1 : -1;
    }

    return sourceA - sourceB;
  });

  // A set of moves the species gets by level, but are above the current level
  const prevoLockedMoves = new Set(
    levelMoves
      .filter(
        lm =>
          (lm[2] === LearnableMoveSource.LEVEL || lm[2] === LearnableMoveSource.FUSION_LEVEL) && lm[0] > pokemon.level,
      )
      .map(lm => lm[1]),
  );

  // A set of moves the species learns by level.
  // Used to prefer showing a move as level rather than showing as a prevo/evo move
  const ownMoves = new Set(
    levelMoves
      .filter(lm => lm[2] === LearnableMoveSource.LEVEL || lm[2] === LearnableMoveSource.FUSION_LEVEL)
      .map(lm => lm[1]),
  );

  /*
   * Filter out moves not within the correct level range(s)
   * Includes moves below startingLevel, or of specifically level 0 if
   * includeRelearnerMoves or includeEvolutionMoves are true respectively
   */
  levelMoves = levelMoves.filter(lm => {
    const [level, move, source] = lm;
    const isRelearner = level < startingLevel;
    const allowedEvolutionMove = level === 0 && includeEvolutionMoves;
    const isLevelMoveSource = source === LearnableMoveSource.LEVEL || source === LearnableMoveSource.FUSION_LEVEL;
    const isOwnMoveFromNonLevelSource = ownMoves.has(move) && !isLevelMoveSource;
    const isLockedPrevoMove =
      prevoLockedMoves.has(move)
      && (source === LearnableMoveSource.PREVO || source === LearnableMoveSource.FUSION_PREVO);

    return (
      !(level > pokemon.level)
      && !isOwnMoveFromNonLevelSource
      && !isLockedPrevoMove
      && (includeRelearnerMoves || !isRelearner || allowedEvolutionMove)
    );
  });

  /*
   * This must be done AFTER filtering by level, else if the same move shows up
   * in levelMoves multiple times all but the lowest level one will be skipped.
   * This causes problems when there are intentional duplicates (i.e. Smeargle with Sketch)
   */
  if (levelMoves) {
    getUniqueMoves(levelMoves, ret);
  }

  return ret;
}

export function getLevelMoves(
  pokemon: Pokemon,
  startingLevel = pokemon.level,
  includeEvolutionMoves = false,
  includePrevolutionMoves = false,
  includeRelearnerMoves = false,
  learnSituation: LearnMoveSituation = LearnMoveSituation.MISC,
): LevelMovesWithSource {
  const levelMoves: LevelMovesWithSource = [];
  if (learnSituation === LearnMoveSituation.EVOLUTION_FUSED && pokemon.isFusion()) {
    // For fusion evolutions, get ONLY the moves of the component mon that evolved
    levelMoves.push(...getFusionEvolutionMoves(pokemon, includeEvolutionMoves, includeRelearnerMoves));
  } else if (includePrevolutionMoves) {
    levelMoves.push(...getPrevolutionMoves(pokemon, includeEvolutionMoves, includeRelearnerMoves));
  } else {
    levelMoves.push(...getRegularLevelMoves(pokemon, includeEvolutionMoves, includeRelearnerMoves));
  }

  if (pokemon.isFusion() && learnSituation !== LearnMoveSituation.EVOLUTION_FUSED_BASE) {
    const methodFunc = includePrevolutionMoves ? getPrevolutionMoves : getRegularLevelMoves;
    levelMoves.push(...methodFunc(pokemon, includeEvolutionMoves, includeRelearnerMoves, true));
  }

  const ret = filterAndSortLevelMoves(pokemon, levelMoves, startingLevel, includeEvolutionMoves, includeRelearnerMoves);
  return ret;
}
