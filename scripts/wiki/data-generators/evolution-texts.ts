import { supportedLngs } from "#app/i18n-supported-lngs";
import { EvoCondKey, EvolutionItem, type SpeciesFormEvolution } from "#balance/pokemon-evolutions";
import { getGenderSymbol } from "#data/gender";
import { MoveId } from "#enums/move-id";
import { PokemonType } from "#enums/pokemon-type";
import { SpeciesId } from "#enums/species-id";
import { TimeOfDay } from "#enums/time-of-day";
import { toCamelCase } from "#utils/strings";
import i18next from "i18next";
import { wikiSpeciesDataRegistry } from "../constants";
import { writeWikiData } from "../helpers";
import type { EvolutionTextWikiEntry } from "../types";

export function generateEvolutionTextsData() {
  const entries: EvolutionTextWikiEntry[] = [];

  for (const speciesData of Object.values(wikiSpeciesDataRegistry.data)) {
    const evolutions = speciesData.evolutions;
    if (evolutions) {
      for (const evo of evolutions) {
        const evoEntry: EvolutionTextWikiEntry = {
          preDexNum: speciesData.species.speciesId,
          preId: SpeciesId[speciesData.species.speciesId],
          evoDexNum: evo.speciesId,
          evoId: SpeciesId[evo.speciesId],
        } as EvolutionTextWikiEntry;

        for (const lng of supportedLngs) {
          // TODO: actually support all langs
          evoEntry[lng] = getEvoConditionDescription(evo).join("|");
        }
        entries.push(evoEntry);
      }
    }
  }

  writeWikiData("evolution-texts", entries);
}

export function getEvoConditionDescription(evo: SpeciesFormEvolution): string[] {
  const ret: string[] = [];

  const descriptions = evo.condition?.data
    .map(cond => {
      switch (cond.key) {
        case EvoCondKey.FRIENDSHIP:
          return i18next.t("pokemonEvolutions:friendship");
        case EvoCondKey.TIME:
          return i18next.t(`pokemonEvolutions:timeOfDay.${toCamelCase(TimeOfDay[cond.time.at(-1)!])}`); // For Day and Night evos, the key we want goes last
        case EvoCondKey.MOVE_TYPE:
          return i18next.t("pokemonEvolutions:moveType", {
            type: i18next.t(`pokemonInfo:type.${toCamelCase(PokemonType[cond.pkmnType])}`),
          });
        case EvoCondKey.PARTY_TYPE:
          return i18next.t("pokemonEvolutions:partyType", {
            type: i18next.t(`pokemonInfo:type.${toCamelCase(PokemonType[cond.pkmnType])}`),
          });
        case EvoCondKey.GENDER:
          return i18next.t("pokemonEvolutions:gender", { gender: getGenderSymbol(cond.gender) });
        case EvoCondKey.MOVE:
        case EvoCondKey.TYROGUE:
          return i18next.t("pokemonEvolutions:move", {
            move: i18next.t(`move:${toCamelCase(MoveId[cond.move])}.name`),
          });
        case EvoCondKey.BIOME:
          return i18next.t("pokemonEvolutions:biome");
        case EvoCondKey.NATURE:
          return i18next.t("pokemonEvolutions:nature");
        case EvoCondKey.WEATHER:
          return i18next.t("pokemonEvolutions:weather");
        case EvoCondKey.SHEDINJA:
          return i18next.t("pokemonEvolutions:shedinja");
        case EvoCondKey.EVO_TREASURE_TRACKER:
          return i18next.t("pokemonEvolutions:treasure");
        case EvoCondKey.SPECIES_CAUGHT:
          return i18next.t("pokemonEvolutions:caught", {
            species: wikiSpeciesDataRegistry.getSpecies(cond.speciesCaught)?.name,
          });
        case EvoCondKey.HELD_ITEM:
          return i18next.t(`pokemonEvolutions:heldItem.${toCamelCase(cond.itemKey)}`);
        case EvoCondKey.RANDOM_FORM:
          return null;
        default:
          cond satisfies never;
          return null;
      }
    })
    .filter(s => s != null); // Filter out stringless conditions

  ret.push(...(descriptions ?? []));

  if (evo.level > 1) {
    ret.push(i18next.t("pokemonEvolutions:atLevel", { lv: evo.level }));
  }
  if (evo.item) {
    const itemDescription = i18next.t(`modifierType:EvolutionItem.${EvolutionItem[evo.item].toUpperCase()}`);
    const rarity = evo.item > 50 ? i18next.t("pokemonEvolutions:ultra") : i18next.t("pokemonEvolutions:great");
    ret.push(i18next.t("pokemonEvolutions:using", { item: itemDescription, tier: rarity }));
  }
  if (evo.condition && ret.length === 0) {
    ret.push(i18next.t("pokemonEvolutions:levelUp"));
  }

  return ret;
}
