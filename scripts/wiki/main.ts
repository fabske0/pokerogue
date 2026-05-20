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
import { generateEvolutionsCsv } from "./evolutions";
import { generateLevelMovesCsv } from "./level-moves";
import { generateSpeciesCsv } from "./species";
import { generateTmsCsv } from "./tms";

function main(): void {
  const { clean } = cliArgs;
  console.log(chalk.grey(`📚 Wiki scraper - v${SCRIPT_VERSION}\n`));
  if (existsSync(OUTPUT_DIR) && clean) {
    console.log(chalk.yellow("🧹 Cleaning output directory...\n"));
    rmSync(OUTPUT_DIR, { recursive: true });
  }
  generateSpeciesCsv();
  generateEvolutionsCsv();
  generateLevelMovesCsv();
  generateTmsCsv();
  console.log(chalk.green("✅ Done!"));
}

main();
