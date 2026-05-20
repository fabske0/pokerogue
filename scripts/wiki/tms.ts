import { MoveId } from "#enums/move-id";
import { SpeciesId } from "#enums/species-id";
import { wikiSpeciesDataRegistry } from "./constants";
import { writeWikiData } from "./helpers";

interface TmWikiData {
  dexNum: number;
  id: string;
  form: string | null;
  move: string;
}

export function generateTmsCsv(): void {
  const entries: TmWikiData[] = [];

  for (const speciesData of Object.values(wikiSpeciesDataRegistry.data)) {
    for (const move of speciesData.tms) {
      const data: TmWikiData = {
        dexNum: speciesData.species.speciesId,
        id: SpeciesId[speciesData.species.speciesId],
        form: null,
        move: MoveId[move],
      };
      entries.push(data);
    }

    for (const formKey in speciesData.formTms) {
      if (speciesData.formTms) {
        const formTms = speciesData.formTms[formKey];
        for (const move of formTms) {
          const data: TmWikiData = {
            dexNum: speciesData.species.speciesId,
            id: SpeciesId[speciesData.species.speciesId],
            form: formKey,
            move: MoveId[move],
          };
          entries.push(data);
        }
      }
    }
  }

  writeWikiData("tms", entries);
}
