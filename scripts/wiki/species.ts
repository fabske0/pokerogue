import { GrowthRate } from "#data/exp";
import { AbilityId } from "#enums/ability-id";
import { EggTier } from "#enums/egg-type";
import { PokemonType } from "#enums/pokemon-type";
import { SpeciesId } from "#enums/species-id";
import { writeFileSafe } from "#script-utils/file";
import { join } from "node:path";
import variantMasterlist from "../../assets/images/pokemon/variant/_masterlist.json";
import { OUTPUT_DIR, wikiSpeciesDataRegistry } from "./constants";
import { normalizeSpriteKey } from "./helpers";

const OUTPUT_FILE = join(OUTPUT_DIR, "species.csv");

interface SpeciesCsvData {
  dexNum: number;
  id: string;
  form: string | null;
  name: string;
  starter: string;
  startercost: number | null;
  eggTier: string | null;
  prevolution: string | null;
  generation: number;
  spriteKey: string;
  formKey: string | null;
  hasVariants: boolean;
  category: string;
  type1: string;
  type2: string | null;
  ability1: string;
  ability2: string;
  hiddenAbility: string;
  passive: string;
  bst: number;
  hp: number;
  atk: number;
  def: number;
  spatk: number;
  spdef: number;
  spd: number;
  sublegend: boolean;
  legendary: boolean;
  mythical: boolean;
  weight: number;
  height: number;
  catchRate: number;
  friendship: number;
  baseExp: number;
  growthRate: string;
  maleRatio: number | null; // null for genderless
  genderDiffs: boolean;
  isStartSelectable: boolean;
  isUnobtainable: boolean | null; // form only. Can't make it optional, because it's needed to generate the header line
  canChangeForm: boolean | null;
}

export function generateSpeciesCsv(): void {
  const csvLines: string[] = [];
  let isFirstLine = true;

  for (const speciesData of Object.values(wikiSpeciesDataRegistry.data)) {
    const species = speciesData.species;
    const passives = speciesData.passives;
    const normalizedSpriteKey = normalizeSpriteKey(species.getSpriteKey(false));

    const data: SpeciesCsvData = {
      dexNum: species.speciesId,
      id: SpeciesId[species.speciesId],
      form: null,
      name: species.getName(),
      starter: SpeciesId[speciesData.starter],
      startercost: speciesData.starterCost ?? null,
      prevolution: speciesData.prevolution ? SpeciesId[speciesData.prevolution] : null,
      eggTier: speciesData.eggTier == null ? null : EggTier[speciesData.eggTier],
      generation: species.generation,
      spriteKey: normalizedSpriteKey,
      formKey: null,
      hasVariants: variantMasterlist[normalizedSpriteKey] != null,
      category: species.category,
      type1: PokemonType[species.type1],
      type2: species.type2 ? PokemonType[species.type2] : null,
      ability1: AbilityId[species.ability1],
      ability2: AbilityId[species.ability2],
      hiddenAbility: AbilityId[species.abilityHidden],
      passive: typeof passives === "number" ? AbilityId[passives] : AbilityId[passives[0]],
      bst: species.baseTotal,
      hp: species.baseStats[0],
      atk: species.baseStats[1],
      def: species.baseStats[2],
      spatk: species.baseStats[3],
      spdef: species.baseStats[4],
      spd: species.baseStats[5],
      sublegend: species.subLegendary,
      legendary: species.legendary,
      mythical: species.mythical,
      weight: species.weight,
      height: species.height,
      catchRate: species.catchRate,
      friendship: species.baseFriendship,
      baseExp: species.baseExp,
      growthRate: GrowthRate[species.growthRate],
      maleRatio: species.malePercent,
      genderDiffs: species.genderDiffs,
      isStartSelectable: species.isStarterSelectable,
      isUnobtainable: null,
      canChangeForm: species.canChangeForm,
    };

    if (isFirstLine) {
      // add header line
      csvLines.push(Object.keys(data).join(","));
      isFirstLine = false;
    }

    csvLines.push(
      Object.values(data)
        .map(value => (value === null ? "" : value))
        .join(","),
    );

    for (const [index, form] of Object.entries(species.forms)) {
      // TODO: should this check if index is `0` instead for species that have male and female and no "default" form?
      if (form.formKey === "") {
        continue;
      }
      const normalizedFormSpriteKey = normalizeSpriteKey(species.getSpriteKey(false, Number(index)));

      const formData: SpeciesCsvData = {
        ...data,
        // these fields don't exist for forms
        eggTier: null,
        startercost: null,
        canChangeForm: null,

        form: form.formName,
        name: species.getName(Number(index)),
        spriteKey: normalizedFormSpriteKey,
        formKey: form.formKey,
        hasVariants: variantMasterlist[normalizedFormSpriteKey] != null,
        type1: PokemonType[form.type1] || data.type1,
        type2: form.type2 ? PokemonType[form.type2] : data.type2,
        ability1: AbilityId[form.ability1] ? AbilityId[form.ability1] : data.ability1,
        ability2: AbilityId[form.ability2] ? AbilityId[form.ability2] : data.ability2,
        hiddenAbility: AbilityId[form.abilityHidden] ? AbilityId[form.abilityHidden] : data.hiddenAbility,
        passive: typeof passives === "number" ? AbilityId[passives] : AbilityId[passives[Number(index)]],
        bst: form.baseTotal || data.bst,
        hp: form.baseStats[0] || data.hp,
        atk: form.baseStats[1] || data.atk,
        def: form.baseStats[2] || data.def,
        spatk: form.baseStats[3] || data.spatk,
        spdef: form.baseStats[4] || data.spdef,
        spd: form.baseStats[5] || data.spd,
        isStartSelectable: form.isStarterSelectable,
        isUnobtainable: form.isUnobtainable,
      };

      csvLines.push(
        Object.values(formData)
          .map(value => (value === null ? "" : value))
          .join(","),
      );
    }
  }

  writeFileSafe(OUTPUT_FILE, csvLines.join("\n"));
}
