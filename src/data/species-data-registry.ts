import { initGenerationOne } from "#balance/species/generation-01";
import { initGenerationTwo } from "#balance/species/generation-02";
import { initGenerationThree } from "#balance/species/generation-03";
import { initGenerationFour } from "#balance/species/generation-04";
import { initGenerationFive } from "#balance/species/generation-05";
import { initGenerationSix } from "#balance/species/generation-06";
import { initGenerationSeven } from "#balance/species/generation-07";
import { initGenerationEight } from "#balance/species/generation-08";
import { initGenerationNine } from "#balance/species/generation-09";
import { setSpeciesDataRegistry } from "#balance/species/species-data-registry";
import { allSpecies } from "#data/data-lists";
import type { AbilityId } from "#enums/ability-id";
import type { EggTier } from "#enums/egg-type";
import type { MoveId } from "#enums/move-id";
import type { SpeciesId } from "#enums/species-id";
import type { LevelMoves, PokemonSpeciesData, SpeciesDataMap } from "#types/pokemon-species";
import type { PokemonSpecies } from "./pokemon-species";

export class SpeciesDataRegistry {
  private readonly data: SpeciesDataMap;

  constructor() {
    this.data = Object.assign(
      {} as SpeciesDataMap,
      initGenerationOne(),
      initGenerationTwo(),
      initGenerationThree(),
      initGenerationFour(),
      initGenerationFive(),
      initGenerationSix(),
      initGenerationSeven(),
      initGenerationEight(),
      initGenerationNine(),
    );

    // TODO: Replace all callswith direct calls to the registry
    (allSpecies as PokemonSpecies[]).push(...Object.values(this.data).map(s => s.species));
  }

  /**
   * Get the {@linkcodecode PokemonSpeciesData} for a given species.
   * @param speciesId-  The {@linkcode SpeciesId} of the species to get data for
   * @returns The {@linkcodecode PokemonSpeciesData}
   */
  public getSpeciesData(speciesId: SpeciesId): PokemonSpeciesData {
    return this.data[speciesId];
  }

  /**
   * Get the {@linkcodecode PokemonSpecies} for a given species.
   * @param speciesId-  The {@linkcode SpeciesId} of the species to get data for
   * @returns The {@linkcodecode PokemonSpecies}
   */
  public getSpecies(speciesId: SpeciesId): PokemonSpecies {
    return this.getSpeciesData(speciesId).species;
  }

  /**
   * Get all available TMs for a given species and form.
   * @param speciesId - The {@linkcode SpeciesId} of the species to get TMs for
   * @param form - the `formIndex` or `formKey` of the form to get TMs for. (default: base form)
   * @return An array of all TMs available
   */
  public getTms(speciesId: SpeciesId, form?: string | number): MoveId[] {
    const speciesData = this.getSpeciesData(speciesId);
    const formKey = this.getFormKey(speciesId, form);
    const tms = new Set([...speciesData.tms, ...(speciesData.formTms?.[formKey] ?? [])]);
    return Array.from(tms);
  }

  /**
   * Get all available level moves for a given species and form.
   * @param speciesId - The {@linkcode SpeciesId} of the species to get level moves for
   * @param form - the `formIndex` or `formKey` of the form to get level moves for. (default: base form)
   * @return An array of all level moves available
   */
  public getLevelMoves(speciesId: SpeciesId, form?: string | number): LevelMoves {
    const speciesData = this.getSpeciesData(speciesId);
    const formKey = this.getFormKey(speciesId, form);
    const levelMoves = new Set([...speciesData.levelMoves, ...(speciesData.formLevelMoves?.[formKey] ?? [])]);
    return Array.from(levelMoves);
  }

  /**
   * Checks if a given species has any form specific level moves.
   * @param speciesId - The {@linkcode SpeciesId} of the species to check
   * @returns whether the species and form has any form specific level moves
   */
  public hasFormLevelMoves(speciesId: SpeciesId): boolean {
    const speciesData = this.getSpeciesData(speciesId);
    return !!speciesData.formLevelMoves && Object.keys(speciesData.formLevelMoves).length > 0;
  }

  /**
   * Get all starter species that belong to a given egg tier.
   * @param tier - the {@linkcode EggTier} to get starter species for
   * @returns an array of all starter species that belong to the given egg tier
   */
  public getAllEggTierSpecies(tier: EggTier): PokemonSpecies[] {
    const species = Object.values(this.data)
      .filter(s => s.eggTier === tier)
      .map(s => s.species);
    return species;
  }

  /**
   * Get the passive ability for a given species and form.
   * @param speciesId - The {@linkcode SpeciesId} of the species to get the passive for
   * @param form - the `formIndex` or `formKey` of the form to get the passive for. (default: base form)
   * @returns the passive ability of the species and form
   */
  public getPassive(speciesId: SpeciesId, form: string | number): AbilityId {
    const speciesData = this.getSpeciesData(speciesId);
    // TODO: Should probably also use formkeys for passives to keep it consistent
    let formIndex = this.getFormIndex(speciesId, form);
    const passives = speciesData.passives;
    if (typeof passives === "object" && !(formIndex in passives)) {
      formIndex = 0;
    }
    return typeof passives === "object" ? passives[formIndex] : passives;
  }

  /**
   * Checks if a given species is a starter.
   * @param speciesId - The {@linkcode SpeciesId} of the species to check
   * @returns whether the species is a starter
   */
  public isStarter(speciesId: SpeciesId): boolean {
    const speciesData = this.getSpeciesData(speciesId);
    return !!speciesData.starterCost;
  }

  /**
   * Get the starter species of a given species.
   * @param species - The {@linkcode SpeciesId} of the species to get the starter for
   * @returns The starter {@linkcodecode SpeciesId}
   */
  public getStarterSpecies(species: SpeciesId | PokemonSpecies): PokemonSpecies {
    const speciesId = typeof species === "number" ? species : species.speciesId;
    const speciesData = this.getSpeciesData(speciesId);
    // only need to check if the species is a starter because of pikachu :/
    return this.isStarter(speciesId) ? speciesData.species : this.getSpecies(speciesData.starter);
  }

  /**
   * Get the starter cost for a given species.
   * @param speciesId - The {@linkcode SpeciesId} of the species to get the starter cost for
   * @returns The starter cost of the species
   */
  public getStarterCost(speciesId: SpeciesId): number {
    const speciesData = this.getSpeciesData(speciesId);
    // We assume that the starter cost is set if it's a starter
    return speciesData.starterCost as number;
  }

  /**
   * Get all starters.
   * @returns An array of all starter {@linkcodecode SpeciesId}s
   */
  public getAllStarters(): SpeciesId[] {
    const species = Object.values(this.data)
      .filter(s => this.isStarter(s.species.speciesId))
      .map(s => s.species.speciesId);
    return species;
  }

  /**
   * Get all starters for a given starter cost.
   * @param starterCost - The starter cost
   * @returns An array of all starter species that have the given starter cost
   */
  getAllStartersWithCost(starterCost: number): SpeciesId[] {
    const species = Object.values(this.data)
      .filter(s => s.starterCost === starterCost)
      .map(s => s.species.speciesId);
    return species;
  }

  //#region Helpers

  /**
   * Helper to get the form key for a given species and formIndex or formKey.
   * Also validates that the form exists and falls back to the base form if it doesn't.
   * @param speciesId - The {@linkcode SpeciesId} of the species to get the form key for
   * @param form - the `formIndex` or `formKey` of the form to get the form key for. (default: base form)
   * @returns The formKey
   */
  private getFormKey(speciesId: SpeciesId, form?: string | number): string {
    const speciesData = this.getSpeciesData(speciesId);
    if (typeof form === "string") {
      if (speciesData.species.forms.some(f => f.formKey === form)) {
        return form;
      }
      form = undefined;
    }
    if (typeof form === "number" && (form < 0 || form >= speciesData.species.forms.length)) {
      form = undefined;
    }
    if (!form) {
      // using formIndex here instead of `""` because some species don't have a form with `""` as their key.
      // mainly species with "male" and "female" forms
      form = 0;
    }
    return speciesData.species.forms[form]?.formKey ?? "";
  }

  /**
   * Helper to get the form index for a given species and formIndex or formKey.
   * @param speciesId - The {@linkcode SpeciesId} of the species to get the form index for
   * @param form - the `formIndex` or `formKey` of the form to get the form index for. (default: base form)
   * @returns The form index
   */
  private getFormIndex(speciesId: SpeciesId, form?: string | number): number {
    const speciesData = this.getSpeciesData(speciesId);
    if (typeof form === "number") {
      if (form >= 0 && form < speciesData.species.forms.length) {
        return form;
      }
      form = undefined;
    }
    if (typeof form === "string") {
      const formIndex = speciesData.species.forms.findIndex(f => f.formKey === form);
      if (formIndex !== -1) {
        return formIndex;
      }
    }
    return 0;
  }

  //#endregion Helpers
}

export function initSpeciesDataRegistry(): void {
  setSpeciesDataRegistry(new SpeciesDataRegistry());
}
