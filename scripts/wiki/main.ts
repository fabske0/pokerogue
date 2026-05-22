/*
 * SPDX-FileCopyrightText: 2026 Pagefault Games
 * SPDX-FileContributor: Fabske0
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import "./i18n"; // needs to be imported first

import { existsSync, rmSync } from "node:fs";
import { performance } from "node:perf_hooks";
import chalk from "chalk";
import { cliArgs, OUTPUT_DIR, SCRIPT_VERSION } from "./constants";
import { generateEvolutionTextsData } from "./data-generators/evolution-texts";
import { generateEvolutionsData } from "./data-generators/evolutions";
import { generateFormChangeTextsData } from "./data-generators/form-change-texts";
import { generateLevelMovesData } from "./data-generators/level-moves";
import { generateSpeciesData } from "./data-generators/species";
import { generateTmTiersData } from "./data-generators/tm-tiers";
import { generateTmsData } from "./data-generators/tms";

async function main(): Promise<void> {
  const startTime = performance.now();
  const { clean, debug } = cliArgs;
  console.log(chalk.grey(`📚 Wiki scraper - v${SCRIPT_VERSION}\n`));
  if (existsSync(OUTPUT_DIR) && clean) {
    console.log(chalk.yellow("🧹 Cleaning output directory...\n"));
    rmSync(OUTPUT_DIR, { recursive: true });
  }
  const runStep = async (label: string, action: () => Promise<void>): Promise<void> => {
    const startedAt = performance.now();
    await action();
    if (debug) {
      const elapsed = performance.now() - startedAt;
      console.log(chalk.gray(`⏱️  ${label}: ${elapsed.toFixed(2)}ms`));
    }
  };

  await Promise.all([
    runStep("tm tiers", generateTmTiersData),
    runStep("species", generateSpeciesData),
    runStep("evolutions", generateEvolutionsData),
    runStep("evolution texts", generateEvolutionTextsData),
    runStep("form change texts", generateFormChangeTextsData),
    runStep("level moves", generateLevelMovesData),
    runStep("tms", generateTmsData),
  ]);
  const totalElapsed = performance.now() - startTime;
  if (debug) {
    console.log(chalk.gray(`⏱️  Total execution time: ${totalElapsed.toFixed(2)}ms\n`));
  }
  console.log(chalk.green("✅ Done!"));
}

await main();
