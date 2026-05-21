/*
 * SPDX-FileCopyrightText: 2026 Pagefault Games
 * SPDX-FileContributor: Fabske0
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import "./i18n"; // needs to be imported first

import { existsSync, rmSync } from "node:fs";
import chalk from "chalk";
import { cliArgs, OUTPUT_DIR, SCRIPT_VERSION } from "./constants";
import { generateEvolutionTextsData } from "./data-generators/evolution-texts";
import { generateEvolutionsData } from "./data-generators/evolutions";
import { generateLevelMovesData } from "./data-generators/level-moves";
import { generateSpeciesData } from "./data-generators/species";
import { generateTmTiersData } from "./data-generators/tm-tiers";
import { generateTmsData } from "./data-generators/tms";

function main(): void {
  const { clean } = cliArgs;
  console.log(chalk.grey(`📚 Wiki scraper - v${SCRIPT_VERSION}\n`));
  if (existsSync(OUTPUT_DIR) && clean) {
    console.log(chalk.yellow("🧹 Cleaning output directory...\n"));
    rmSync(OUTPUT_DIR, { recursive: true });
  }
  generateTmTiersData();
  generateSpeciesData();
  generateEvolutionsData();
  generateEvolutionTextsData();
  generateLevelMovesData();
  generateTmsData();
  console.log(chalk.green("✅ Done!"));
}

main();
