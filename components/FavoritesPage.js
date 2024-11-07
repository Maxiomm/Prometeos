import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import {
  Center,
  Text,
  VStack,
  Box,
  ScrollView,
  Button,
  HStack,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import axios from "axios";

import { WEATHER_API_KEY } from "@env";

import { FavoritesContext } from "../FavoritesContext";

import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";

// Initialiser les noms de pays en français
countries.registerLocale(fr);

// Fonction pour convertir le code de pays ISO en un emoji de drapeau
const getCountryFlagEmoji = (countryCode) => {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
};

export default function FavoritesPage() {
  const { favorites, resetFavorites } = useContext(FavoritesContext);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [translatedFavorites, setTranslatedFavorites] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false); // État pour suivre le défilement

  // Fonction pour obtenir la traduction des noms de villes via l'API OpenWeatherMap
  const translateCityNames = async () => {
    try {
      const language = i18n.language;
      const updatedFavorites = await Promise.all(
        favorites.map(async (city) => {
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${WEATHER_API_KEY}&lang=${language}`;
          const response = await axios.get(url);
          const translatedName = response.data.name;
          return { ...city, name: translatedName };
        })
      );
      setTranslatedFavorites(updatedFavorites);
    } catch (error) {
      console.error("Erreur lors de la traduction des noms de villes :", error);
    }
  };

  // Mettre à jour les noms traduits des villes lorsque la langue change
  useEffect(() => {
    translateCityNames();
  }, [favorites, i18n.language]);

  // Fonction pour naviguer vers la météo d'une ville favorite
  const handleFavoritePress = (city) => {
    if (!isScrolling) {
      // Vérifier si le défilement ne se produit pas
      navigation.navigate("Rechercher", { cityName: city.name });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} position="relative">
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 63 }}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setIsScrolling(true)} // Activer le défilement
          onScrollEndDrag={() => setIsScrolling(false)} // Désactiver le défilement
        >
          <Center flex={1} width="100%">
            {favorites.length === 0 ? (
              <Text fontSize="md">{t("noFavorites")}</Text>
            ) : (
              <VStack space={4} alignItems="center" width="100%">
                {translatedFavorites.map((city, index) => (
                  <Box
                    key={index}
                    p={4}
                    borderWidth={1}
                    borderColor="gray.300"
                    borderRadius="8"
                    width="90%"
                    bg="gray.100"
                    onTouchEnd={() => handleFavoritePress(city)}
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        flex={4}
                        mr={2}
                      >
                        {city.name}
                      </Text>

                      <Text
                        fontSize="lg"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        flex={1}
                        textAlign="right"
                        lineHeight="24px"
                        fontFamily="monospace"
                      >
                        {city.country}
                        {getCountryFlagEmoji(city.country)}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Center>
        </ScrollView>

        {/* Bouton pour réinitialiser les favoris, fixe en bas sans changer le style */}
        <Button
          onPress={resetFavorites}
          colorScheme="red"
          size="xs"
          alignSelf="center"
          width="33%"
          position="absolute"
          bottom={0}
          mb={4}
        >
          {t("resetFavorites")}
        </Button>
      </Box>
    </SafeAreaView>
  );
}
