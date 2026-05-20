import { MoveId } from "#enums/move-id";
import { SpeciesId } from "#enums/species-id";
import { writeFileSafe } from "#script-utils/file";
import { join } from "node:path";
import { OUTPUT_DIR, wikiSpeciesDataRegistry } from "./constants";

const OUTPUT_FILE = join(OUTPUT_DIR, "tms.csv");

export function generateTmsCsv(): void {
  const csvLines: string[] = ["dex num,id,form,move"];

  for (const speciesData of Object.values(wikiSpeciesDataRegistry.data)) {
    for (const move of speciesData.tms) {
      csvLines.push(`${speciesData.species.speciesId},${SpeciesId[speciesData.species.speciesId]},,${MoveId[move]}`);
    }

    for (const formKey in speciesData.formTms) {
      if (speciesData.formTms) {
        const formTms = speciesData.formTms[formKey];
        for (const move of formTms) {
          csvLines.push(
            `${speciesData.species.speciesId},${SpeciesId[speciesData.species.speciesId]},${formKey},${MoveId[move]}`,
          );
        }
      }
    }
  }

  writeFileSafe(OUTPUT_FILE, csvLines.join("\n"));
}
