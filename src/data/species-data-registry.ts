import type { SpeciesFormEvolution } from "#balance/pokemon-evolutions";
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
import { SpeciesFormKey } from "#enums/species-form-key";
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

    this.initPreEvolutions();

    // TODO: Replace all calls with direct calls to the registry
    (allSpecies as PokemonSpecies[]).push(...Object.values(this.data).map(s => s.species));
  }

  /**
   * Get the {@linkcode PokemonSpeciesData} for a given species.
   * @param speciesId-  The {@linkcode SpeciesId} of the species to get data for
   * @returns The {@linkcode PokemonSpeciesData}
   */
  public getSpeciesData(speciesId: SpeciesId): PokemonSpeciesData {
    return this.data[speciesId];
  }

  /**
   * Get the {@linkcode PokemonSpecies} for a given species.
   * @param speciesId-  The {@linkcode SpeciesId} of the species to get data for
   * @returns The {@linkcode PokemonSpecies}
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
   * Get the starter of a given species.
   * @param species - The {@linkcode SpeciesId} or {@linkcode PokemonSpecies} of the species to get the starter for
   * @param getSpecies - Whether to return the {@linkcode PokemonSpecies} instead of a {@linkcode SpeciesId}. (default: `false`)
   * @returns The starter {@linkcode SpeciesId} or {@linkcode PokemonSpecies}
   */
  public getStarter(species: SpeciesId | PokemonSpecies): SpeciesId;
  public getStarter(species: SpeciesId | PokemonSpecies, getSpecies: false): SpeciesId;
  public getStarter(species: SpeciesId | PokemonSpecies, getSpecies: true): PokemonSpecies;
  public getStarter(species: SpeciesId | PokemonSpecies, getSpecies = false): SpeciesId | PokemonSpecies {
    const speciesId = typeof species === "number" ? species : species.speciesId;
    const speciesData = this.getSpeciesData(speciesId);
    // only need to check if the species is a starter because of pikachu :/
    if (getSpecies) {
      return this.isStarter(speciesId) ? speciesData.species : this.getSpecies(speciesData.starter);
    }
    return this.isStarter(speciesId) ? speciesId : speciesData.starter;
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
   * @returns An array of all starter {@linkcode SpeciesId}s
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
  public getAllStartersWithCost(starterCost: number): SpeciesId[] {
    const species = Object.values(this.data)
      .filter(s => s.starterCost === starterCost)
      .map(s => s.species.speciesId);
    return species;
  }

  /**
   * Get the evolutions for a given species.
   * @param speciesId - The {@linkcode SpeciesId} of the species to get evolutions for
   * @returns An array of {@linkcode SpeciesFormEvolution}s
   */
  public getEvolutions(speciesId: SpeciesId): SpeciesFormEvolution[] {
    const speciesData = this.getSpeciesData(speciesId);
    return speciesData.evolutions;
  }

  /**
   * Get all species in the evolution chain for a given species.
   * Does NOT include the given species itself.
   * @param speciesId - The {@linkcode SpeciesId} of the species to get the evolution chain for
   * @returns An array of {@linkcode SpeciesId}s representing the evolution chain
   */
  public getEvolutionChain(speciesId: SpeciesId): SpeciesId[] {
    const evoLine: SpeciesId[] = [];
    const evolutions = this.getEvolutions(speciesId);
    for (const evolution of evolutions) {
      evoLine.push(evolution.speciesId);
      evoLine.push(...this.getEvolutionChain(evolution.speciesId));
    }
    return evoLine;
  }

  /**
   * Checks if a given species has any evolutions.
   * @param speciesId - The {@linkcode SpeciesId} of the species to check
   * @returns whether the species has any evolutions
   */
  public hasEvolutions(speciesId: SpeciesId): boolean {
    const speciesData = this.getSpeciesData(speciesId);
    return speciesData.evolutions.length > 0;
  }

  /**
   * Get all {@linkcode SpeciesId}s that have evolutions.
   * @returns An array of all {@linkcode SpeciesId}s that have evolutions
   */
  public getSpeciesWithEvolutions(): SpeciesId[] {
    return Object.values(this.data)
      .filter(s => this.hasEvolutions(s.species.speciesId))
      .map(s => s.species.speciesId);
  }

  /**
   * Get the prevolution of a given species.
   * @param species - The {@linkcode SpeciesId} or {@linkcode PokemonSpecies} of the species to get the prevolution for
   * @param getSpecies - Whether to return the {@linkcode PokemonSpecies} instead of a {@linkcode SpeciesId}. (default: `false`)
   * @returns The prevolution {@linkcode SpeciesId} or {@linkcode PokemonSpecies}
   */
  public getPrevolution(species: SpeciesId | PokemonSpecies): SpeciesId | null;
  public getPrevolution(species: SpeciesId | PokemonSpecies, getSpecies: false): SpeciesId | null;
  public getPrevolution(species: SpeciesId | PokemonSpecies, getSpecies: true): PokemonSpecies | null;
  public getPrevolution(species: SpeciesId | PokemonSpecies, getSpecies = false): SpeciesId | PokemonSpecies | null {
    const speciesId = typeof species === "number" ? species : species.speciesId;
    const speciesData = this.getSpeciesData(speciesId);
    if (getSpecies) {
      return speciesData.prevolution !== null ? this.getSpecies(speciesData.prevolution) : null;
    }
    return speciesData.prevolution;
  }

  /**
   * Get all species in the prevolution chain for a given species.
   * Does NOT include the given species itself.
   * @param speciesId - The {@linkcode SpeciesId} of the species to get the prevolution chain for
   * @returns An array of {@linkcode SpeciesId}s representing the prevolution chain
   */
  public getPrevolutionChain(speciesId: SpeciesId): SpeciesId[] {
    const preEvoSpecies: SpeciesId[] = [];
    let preEvoSpeciesId = this.getPrevolution(speciesId);
    while (preEvoSpeciesId) {
      preEvoSpecies.push(preEvoSpeciesId);
      preEvoSpeciesId = this.getPrevolution(preEvoSpeciesId);
    }
    return preEvoSpecies;
  }

  /**
   * Check if a given species has a prevolution.
   * @param speciesId - The {@linkcode SpeciesId} of the species to check
   * @returns Whether the species has a prevolution
   */
  // TODO: once pikachu isn't a starter anymore, we can just check if it's a starter, although we might want to keep this method for consistency and readability
  public hasPrevolution(speciesId: SpeciesId): boolean {
    return this.getPrevolution(speciesId) !== null;
  }

  //#region Initializations

  /**
   * Set the `prevolution` field for all species.
   */
  private initPreEvolutions(): void {
    const megaFormKeys = [SpeciesFormKey.MEGA, SpeciesFormKey.MEGA_X, SpeciesFormKey.MEGA_Y];

    const setPrevo = (speciesId: SpeciesId): void => {
      const evolutions = this.getEvolutions(speciesId);
      for (const evolution of evolutions) {
        if (evolution.evoFormKey && megaFormKeys.includes(evolution.evoFormKey as SpeciesFormKey)) {
          continue;
        }

        this.data[evolution.speciesId].prevolution = speciesId;

        if (this.hasEvolutions(evolution.speciesId)) {
          setPrevo(evolution.speciesId);
        }
      }
    };

    for (const starterId of this.getAllStarters()) {
      this.data[starterId].prevolution = null;
      setPrevo(starterId);
    }
  }

  //#endregion Initializations

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
