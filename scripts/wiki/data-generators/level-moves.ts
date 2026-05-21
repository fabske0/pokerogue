/*
 * SPDX-FileCopyrightText: 2026 Pagefault Games
 * SPDX-FileContributor: Fabske0
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MoveId } from "#enums/move-id";
import { SpeciesId } from "#enums/species-id";
import { wikiSpeciesDataRegistry } from "../constants";
import { writeWikiData } from "../helpers";
import type { LevelMoveWikiEntry } from "../types";

export function generateLevelMovesData(): void {
  const entries: LevelMoveWikiEntry[] = [];

  for (const speciesData of Object.values(wikiSpeciesDataRegistry.data)) {
    for (const [level, move] of speciesData.levelMoves) {
      const levelString = level === 0 ? "EVOLVE_MOVE" : level === -1 ? "RELEARN_MOVE" : level;
      const data: LevelMoveWikiEntry = {
        dexNum: speciesData.species.speciesId,
        id: SpeciesId[speciesData.species.speciesId],
        form: null,
        level: levelString,
        move: MoveId[move],
      };

      entries.push(data);
    }

    for (const formKey in speciesData.formLevelMoves) {
      if (speciesData.formLevelMoves) {
        const formLevelMoves = speciesData.formLevelMoves[formKey];
        for (const [level, move] of formLevelMoves) {
          const levelString = level === 0 ? "EVOLVE_MOVE" : level === -1 ? "RELEARN_MOVE" : level;
          const data: LevelMoveWikiEntry = {
            dexNum: speciesData.species.speciesId,
            id: SpeciesId[speciesData.species.speciesId],
            form: formKey,
            level: levelString,
            move: MoveId[move],
          };
          entries.push(data);
        }
      }
    }
  }

  writeWikiData("level-moves", entries);
}
