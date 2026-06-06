/*
 * SPDX-FileCopyrightText: 2026 Pagefault Games
 * SPDX-FileContributor: Fabske0
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MoveId } from "#enums/move-id";
import { SpeciesId } from "#enums/species-id";
import chalk from "chalk";
import { wikiSpeciesDataRegistry } from "../constants";
import { writeWikiData } from "../helpers";
import type { TmWikiEntry } from "../types";

export async function generateTmsData(): Promise<void> {
  const entries: TmWikiEntry[] = [];

  for (const speciesData of Object.values(wikiSpeciesDataRegistry.data)) {
    for (const move of speciesData.tms) {
      const data: TmWikiEntry = {
        dexNum: speciesData.species.speciesId,
        id: SpeciesId[speciesData.species.speciesId],
        form: null,
        move: MoveId[move],
      };
      entries.push(data);
    }

    const allFormKeys = speciesData.species.forms.map(f => f.formKey);
    for (const formKey in speciesData.formTms) {
      if (!allFormKeys.includes(formKey)) {
        console.log(
          chalk.yellow(
            `⚠️  Warning(tms): FormKey "${formKey}" does not exist for species ${speciesData.species.speciesId} (${speciesData.species.name})`,
          ),
        );
      }
      if (speciesData.formTms) {
        const formTms = speciesData.formTms[formKey];
        for (const move of formTms) {
          const data: TmWikiEntry = {
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
