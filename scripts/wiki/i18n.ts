import i18next from "i18next";
import pokemon from "../../locales/en/pokemon.json";
import pokemonCategory from "../../locales/en/pokemon-category.json";
import battlePokemonForm from "../../locales/en/pokemon-form-battle.json";

await i18next.init({
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en"],
  ns: ["pokemon", "battlePokemonForm", "pokemonCategory"],
  defaultNS: "pokemon",
  resources: {
    en: {
      pokemon,
      battlePokemonForm,
      pokemonCategory,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});
