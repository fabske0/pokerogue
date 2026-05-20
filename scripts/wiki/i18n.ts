/*
 * SPDX-FileCopyrightText: 2026 Pagefault Games
 * SPDX-FileContributor: Fabske0
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from "i18next";
import biome from "../../locales/en/biomes.json";
import pokemon from "../../locales/en/pokemon.json";
import pokemonCategory from "../../locales/en/pokemon-category.json";
import battlePokemonForm from "../../locales/en/pokemon-form-battle.json";

// TODO: find a better way to handle this
await i18next.init({
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en"],
  ns: ["pokemon", "battlePokemonForm", "pokemonCategory", "biome"],
  defaultNS: "pokemon",
  resources: {
    en: {
      pokemon,
      battlePokemonForm,
      pokemonCategory,
      biome,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});
