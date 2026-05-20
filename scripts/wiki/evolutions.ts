import { EvoCondKey, EvolutionItem } from "#balance/pokemon-evolutions";
import { Gender } from "#data/gender";
import { MoveId } from "#enums/move-id";
import { Nature } from "#enums/nature";
import { PokemonType } from "#enums/pokemon-type";
import { SpeciesId } from "#enums/species-id";
import { TimeOfDay } from "#enums/time-of-day";
import { WeatherType } from "#enums/weather-type";
import { getBiomeName } from "#utils/common";
import { wikiSpeciesDataRegistry } from "./constants";
import { writeWikiData } from "./helpers";

interface EvolutionEntry {
  dexNum: number;
  id: string;
  evoDexNum: number | null;
  evoId: string | null;
  prevoKey: string | null;
  evoKey: string | null;
  levelNeeded: number;
  evoItems: string | null;
  evoDelay: string | null;
  timeOfDayCond: string | null;
  biomeCond: string | null;
  genderEvo: string | null;
  moveTypeCond: string | null;
  knowsMove: string | null;
  friendship: number | null;
  haveCaught: string | null;
  tyrogueStats: string | null;
  rockruffAbility: string | null;
  shedinjaBs: string | null;
  weatherCond: string | null;
  dunsparceSeed: number | null;
  nature: string | null;
  partyTypeCond: string | null;
  heldItemCond: string | null;
  evoTreasureTracker: number | null;
}

export function generateEvolutionsCsv(): void {
  const entries: EvolutionEntry[] = [];

  for (const speciesData of Object.values(wikiSpeciesDataRegistry.data)) {
    const evolutions = speciesData.evolutions;
    if (evolutions) {
      for (const evo of evolutions) {
        const evoEntry: EvolutionEntry = {
          dexNum: speciesData.species.speciesId,
          id: SpeciesId[speciesData.species.speciesId],
          evoDexNum: evo.speciesId,
          evoId: SpeciesId[evo.speciesId],
          prevoKey: evo.preFormKey || null,
          evoKey: evo.evoFormKey || null,
          levelNeeded: evo.level,
          evoItems: evo.item ? EvolutionItem[evo.item] : null,
          evoDelay: evo.evoLevelThreshold ? evo.evoLevelThreshold.join("|") : null,
          timeOfDayCond: null,
          biomeCond: null,
          genderEvo: null,
          moveTypeCond: null,
          knowsMove: null,
          friendship: null,
          haveCaught: null,
          tyrogueStats: null,
          rockruffAbility: null,
          shedinjaBs: null,
          weatherCond: null,
          dunsparceSeed: null,
          nature: null,
          partyTypeCond: null,
          heldItemCond: null,
          evoTreasureTracker: null,
        };

        for (const cond of evo.condition?.data ?? []) {
          switch (cond.key) {
            case EvoCondKey.FRIENDSHIP:
              evoEntry.friendship = cond.value;
              break;
            case EvoCondKey.TIME:
              evoEntry.timeOfDayCond = cond.time.map(time => TimeOfDay[time]).join("|");
              break;
            case EvoCondKey.MOVE:
              evoEntry.knowsMove = MoveId[cond.move];
              break;
            case EvoCondKey.MOVE_TYPE:
              evoEntry.moveTypeCond = PokemonType[cond.pkmnType];
              break;
            case EvoCondKey.PARTY_TYPE:
              evoEntry.partyTypeCond = PokemonType[cond.pkmnType];
              break;
            case EvoCondKey.WEATHER:
              evoEntry.weatherCond = cond.weather.map(weather => WeatherType[weather]).join("|");
              break;
            case EvoCondKey.BIOME:
              evoEntry.biomeCond = cond.biome.map(biome => getBiomeName(biome)).join("|");
              break;
            case EvoCondKey.TYROGUE:
              evoEntry.tyrogueStats = MoveId[cond.move];
              break;
            case EvoCondKey.SHEDINJA:
              evoEntry.shedinjaBs = "TRUE";
              break;
            case EvoCondKey.SPECIES_CAUGHT:
              evoEntry.haveCaught = SpeciesId[cond.speciesCaught];
              break;
            case EvoCondKey.GENDER:
              evoEntry.genderEvo = Gender[cond.gender];
              break;
            case EvoCondKey.NATURE:
              evoEntry.nature = cond.nature.map(nature => Nature[nature]).join("|");
              break;
            case EvoCondKey.HELD_ITEM:
              evoEntry.heldItemCond = cond.itemKey;
              break;
            case EvoCondKey.EVO_TREASURE_TRACKER:
              evoEntry.evoTreasureTracker = cond.value;
              break;
            case EvoCondKey.RANDOM_FORM:
              evoEntry.dunsparceSeed = cond.value;
              break;
            default:
              cond satisfies never;
          }
        }

        if (evoEntry.prevoKey === "own-tempo") {
          evoEntry.rockruffAbility = "OWN_TEMPO";
        }

        entries.push(evoEntry);
      }
    }
  }

  writeWikiData("evolutions", entries);
}
