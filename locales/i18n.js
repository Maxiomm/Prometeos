import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import des traductions
import fr from "./fr.json";
import en from "./en.json";
import es from "./es.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3", // Pour assurer la compatibilité avec JSON
  lng: "fr", // Langue par défaut
  fallbackLng: "fr", // Langue de secours
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    es: { translation: es },
    // Ajouter plus de langue ici
  },
  interpolation: {
    escapeValue: false, // Pas besoin d'échapper car React gère la sécurité par défaut
  },
});

export default i18n;
