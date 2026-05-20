import { SpeciesDataRegistry } from "#data/species-data-registry";
import { defaultCommanderHelpArgs } from "#script-utils/arguments";
import { join } from "path";
import { Command } from "@commander-js/extra-typings";

export const SCRIPT_VERSION = "1.0.0";

const programm = new Command("pnpm wiki:scrape")
  .description("Scrapes species related data into CSV files for use on the wiki")
  .helpOption("-h, --help", "Show this help message.")
  .version(SCRIPT_VERSION, "-v, --version", "Show the version number.")
  .option("-c, --clean", "Whether to clean the output directory before generating the files", true)
  .configureHelp(defaultCommanderHelpArgs)
  .showHelpAfterError(true)
  .parse();

export const cliArgs = programm.opts();

export const OUTPUT_DIR = join(__dirname, "output");
export const PROJECT_ROOT = join(import.meta.dirname, "..", "..");

export const wikiSpeciesDataRegistry = new SpeciesDataRegistry();
