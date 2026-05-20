import { MoveId } from "#enums/move-id";
import { SpeciesId } from "#enums/species-id";
import { writeFileSafe } from "#script-utils/file";
import { join } from "node:path";
import { OUTPUT_DIR, wikiSpeciesDataRegistry } from "./constants";

const OUTPUT_FILE = join(OUTPUT_DIR, "level-moves.csv");

export function generateLevelMovesCsv(): void {
  const csvLines: string[] = ["dex num,id,form,level,move"];

  for (const speciesData of Object.values(wikiSpeciesDataRegistry.data)) {
    for (const [level, move] of speciesData.levelMoves) {
      const levelString = level === 0 ? "EVOLVE_MOVE" : level === -1 ? "RELEARN_MOVE" : level;
      csvLines.push(
        `${speciesData.species.speciesId},${SpeciesId[speciesData.species.speciesId]},,${levelString},${MoveId[move]}`,
      );
    }

    for (const formKey in speciesData.formLevelMoves) {
      if (speciesData.formLevelMoves) {
        const formLevelMoves = speciesData.formLevelMoves[formKey];
        for (const [level, move] of formLevelMoves) {
          const levelString = level === 0 ? "EVOLVE_MOVE" : level === -1 ? "RELEARN_MOVE" : level;
          csvLines.push(
            `${speciesData.species.speciesId},${SpeciesId[speciesData.species.speciesId]},${formKey},${levelString},${MoveId[move]}`,
          );
        }
      }
    }
  }

  writeFileSafe(OUTPUT_FILE, csvLines.join("\n"));
}
