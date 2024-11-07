import React, { useState, useEffect, useContext } from "react";
import { Box, Text, VStack, Button, IconButton, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";
import en from "i18n-iso-countries/langs/en.json";
import es from "i18n-iso-countries/langs/es.json";

import { FavoritesContext } from "../FavoritesContext";
import { TemperatureContext } from "../TemperatureContext";

import CityMap from "./CityMap";

// Initialiser les noms de pays en français et en anglais
countries.registerLocale(fr);
countries.registerLocale(en);
countries.registerLocale(es);

// Fonction pour convertir le code de pays ISO en un emoji de drapeau
const getCountryFlagEmoji = (countryCode) => {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
};

// Dictionnaire pour les descriptions météo en français
const emojiMapFr = {
  "ciel dégagé": "☀️",
  "peu nuageux": "🌤️",
  "partiellement nuageux": "⛅",
  nuageux: "☁️",
  couvert: "☁️",
  pluie: "🌧️",
  "pluie modérée": "🌧️",
  "forte pluie": "⛈️",
  neige: "❄️",
  "légères chutes de neige": "🌨️",
  orage: "⚡",
  brouillard: "🌫️",
};

// Dictionnaire pour les descriptions météo en anglais
const emojiMapEn = {
  "clear sky": "☀️",
  "few clouds": "🌤️",
  "scattered clouds": "⛅",
  "broken clouds": "☁️",
  "overcast clouds": "☁️",
  rain: "🌧️",
  "moderate rain": "🌧️",
  "heavy rain": "⛈️",
  snow: "❄️",
  "light snow": "🌨️",
  thunderstorm: "⚡",
  fog: "🌫️",
};

// Dictionnaire pour les descriptions météo en espagnol
const emojiMapEs = {
  "cielo despejado": "☀️",
  "pocas nubes": "🌤️",
  "nubes dispersas": "⛅",
  "nubes rotas": "☁️",
  "nubes cubiertas": "☁️",
  lluvia: "🌧️",
  "lluvia moderada": "🌧️",
  "lluvia fuerte": "⛈️",
  nieve: "❄️",
  "nieve ligera": "🌨️",
  tormenta: "⚡",
  niebla: "🌫️",
  "cielo claro": "☀️",
  "muy nuboso": "☁️",
  "nevada ligera": "🌨️",
  nubes: "☁️",
  "algo de nubes": "🌤️",
  niebla: "🌫️",
  "lluvia ligera": "🌧️",
};

export default function WeatherDisplay({ weather, localTime, state }) {
  const { defaultUnit } = useContext(TemperatureContext);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [emojiDescription, setEmojiDescription] = useState("");
  const [description, setDescription] = useState("");

  const { i18n } = useTranslation(); // Utiliser useTranslation pour obtenir la langue actuelle
  const language = i18n.language; // Langue actuelle des paramètres

  const { addToFavorites, removeFromFavorites, favorites } =
    useContext(FavoritesContext);

  // Utiliser les coordonnées pour déterminer si la ville est un favori
  const latitude = weather.coord.lat;
  const longitude = weather.coord.lon;

  // Fonction pour vérifier si la ville est déjà un favori
  useEffect(() => {
    const cityExists = favorites.some(
      (fav) => fav.latitude === latitude && fav.longitude === longitude
    );
    setIsFavorite(cityExists);
  }, [favorites, latitude, longitude]);

  // Fonction pour basculer le statut de favori
  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites({ latitude, longitude });
    } else {
      addToFavorites({
        name: weather.name,
        country: weather.sys.country,
        latitude,
        longitude,
      });
    }
    setIsFavorite(!isFavorite);
  };

  // Fonction pour convertir la température
  const convertTemperature = (tempCelsius) => {
    return isCelsius ? tempCelsius : (tempCelsius * 9) / 5 + 32;
  };

  // Fonction pour basculer entre Celsius et Fahrenheit
  const toggleUnit = () => {
    setIsCelsius(!isCelsius);
  };

  // Fonction pour formater le nom de la ville et retirer les préfixes (cas spéciaux)
  const formatCityName = (name) => {
    return name.replace(
      /^Arrondissement d[' ]|^Arrondissement de |^Préfecture de |^Comté de /,
      ""
    );
  };

  // Fonction pour récupérer le nom complet du pays à partir du code ISO
  const getCountryName = (countryCode) => {
    let countryName =
      countries.getName(countryCode, i18n.language) || countryCode;

    // Cas spéciaux
    // Remplacer "Russian Federation" par "Russie" pour le code "RU"
    if (countryName === "Royaume d'Eswatini") {
      countryName = "Eswatini";
    }

    if (countryName === "Russian Federation") {
      countryName = "Russia";
    }

    if (countryName === "People's Republic of China") {
      countryName = "China";
    }

    return countryName;
  };

  // Fonction pour formater la ville, l'état et le pays
  const formatCityAndRegion = (name, country) => {
    const formattedCityName = formatCityName(name); // Appliquer le formatage
    const countryName = getCountryName(country);
    const flagEmoji = getCountryFlagEmoji(country);

    if (country === "US" && state) {
      // Afficher l'État si disponible pour les États-Unis
      return `${formattedCityName}\n${state} ${flagEmoji}`;
    } else {
      // Pour les autres pays, afficher le nom complet
      return `${formattedCityName}\n${countryName} ${flagEmoji}`;
    }
  };

  // Dictionnaire des descriptions météo pour chaque langue
  const emojiMaps = {
    fr: emojiMapFr,
    en: emojiMapEn,
    es: emojiMapEs,
  };

  // Mettre à jour l'emoji et la description en fonction de la langue
  useEffect(() => {
    const emojiMap = emojiMaps[language] || emojiMapFr; // Par défaut, le français
    const currentDescription = weather.weather[0].description;
    setEmojiDescription(emojiMap[currentDescription] || "🌈");
    setDescription(currentDescription);
  }, [language, weather]);

  // Mettre à jour l'état `isCelsius` lorsque `defaultUnit` change
  useEffect(() => {
    setIsCelsius(defaultUnit === "Celsius");
  }, [defaultUnit]);

  return (
    <Box
      bg="blue.100"
      borderRadius="15"
      p="5"
      mt="5"
      width="100%"
      position="relative"
      borderWidth={2}
      borderColor="blue.200"
    >
      {/* Étoile en haut à droite pour ajouter en favori */}
      <IconButton
        icon={
          <Icon
            as={Ionicons}
            name={isFavorite ? "star" : "star-outline"}
            color={isFavorite ? "yellow.400" : "gray.400"}
            size="lg"
          />
        }
        position="absolute"
        top={2}
        right={2}
        onPress={toggleFavorite}
        p={3}
        borderRadius="full"
      />

      <VStack space={2} alignItems="center">
        <Text fontSize="2xl" fontStyle="italic">
          {localTime}
        </Text>

        <Text fontSize="4xl" fontWeight="bold" textAlign="center" mb={5}>
          {formatCityAndRegion(weather.name, weather.sys.country)}
        </Text>

        <Text fontSize="lg" fontStyle="normal">
          {emojiDescription} {description} {emojiDescription}
        </Text>

        <Button onPress={toggleUnit} variant="unstyled">
          <Text fontSize="4xl" fontWeight="bold">
            {convertTemperature(weather.main.temp).toFixed(1)}{" "}
            {isCelsius ? "°C" : "°F"}
          </Text>
        </Button>

        <CityMap
          latitude={latitude}
          longitude={longitude}
          cityName={weather.name}
        />
      </VStack>
    </Box>
  );
}
