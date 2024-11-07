import React, { useRef, useState, useEffect } from "react";
import {
  Input,
  VStack,
  Icon,
  IconButton,
  FlatList,
  Box,
  Text,
} from "native-base";
import { Keyboard, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import axios from "axios";

import { MAPBOX_API_KEY } from "@env";

export default function CityInput({
  city,
  setCity,
  fetchWeather,
  error,
  setError,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFromSuggestions, setSelectedFromSuggestions] = useState(false);
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  // Fonction pour récupérer les suggestions de villes via l'API Mapbox
  const fetchCitySuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]); // Réinitialiser si la saisie est trop courte
      return;
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_API_KEY}&types=place&language=${language}&limit=5`;

    try {
      const response = await axios.get(url);

      // Filtrer les résultats pour inclure uniquement ceux avec place_type égal à "place"
      const places = response.data.features
        .filter((feature) => feature.place_type.includes("place"))
        .map((feature) => ({
          name: feature.place_name,
        }));

      setSuggestions(places);
    } catch (error) {
      console.log("Erreur lors de la récupération des suggestions :", error);
    }
  };

  // Fonction pour réinitialiser le champ de saisie
  const clearInput = () => {
    setCity("");
    setError("");
    setSuggestions([]);
  };

  // Fonction pour chercher la météo et fermer le clavier
  const handleFetchWeather = () => {
    Keyboard.dismiss();
    fetchWeather();
    setSuggestions([]);
  };

  // Appel de la fonction pour récupérer les suggestions lors de la saisie
  const handleCityChange = (text) => {
    setCity(text);
    setError("");
    setSelectedFromSuggestions(false);
    fetchCitySuggestions(text);
  };

  // Fonction pour gérer la sélection d'une ville
  const handleSelectCity = (selectedCity) => {
    const cityName = selectedCity.name.split(",")[0];
    setCity(cityName);
    setSelectedFromSuggestions(true);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  // Utiliser useEffect pour surveiller les changements de "selectedFromSuggestions"
  useEffect(() => {
    if (selectedFromSuggestions) {
      fetchWeather(); // Appeler fetchWeather après la mise à jour de city
      setSelectedFromSuggestions(false); // Réinitialiser l'indicateur
    }
  }, [city, selectedFromSuggestions]);

  /* Animation nulle */
  // Créer une valeur animée pour l'icône de réinitialisation
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Fonction pour déclencher le dézoom
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9, // Dézoom à 90%
      speed: 50,
      useNativeDriver: true,
    }).start();
  };

  // Fonction pour revenir à l'état normal (zoom retour)
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // Retour à 100%
      speed: 50,
      useNativeDriver: true,
    }).start();
  };

  return (
    <VStack space={4} alignItems="center" w="100%">
      <Input
        placeholder={t("placeholderCityInput")}
        value={city}
        onChangeText={handleCityChange}
        variant="filled"
        bg="gray.200"
        py="3"
        px="5"
        width="100%"
        borderRadius="full"
        fontSize="16"
        _focus={{
          borderColor: error ? "red.500" : "blue.500",
        }}
        borderWidth={2}
        borderColor={error ? "red.500" : "transparent"}
        returnKeyType="search"
        onSubmitEditing={handleFetchWeather}
        InputRightElement={
          city ? (
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <IconButton
                icon={<Icon as={MaterialIcons} name="close" size={3} />}
                onPress={clearInput}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                mr="4"
                borderRadius="full"
                borderWidth={1}
                borderColor="gray.600"
                bg="gray.100"
                size={5}
                _icon={{
                  color: "gray.600",
                }}
                _hover={{
                  bg: "gray.300",
                }}
                _pressed={{
                  bg: "gray.400",
                }}
              />
            </Animated.View>
          ) : null
        }
      />

      {/* Afficher les suggestions de villes */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Box
              bg="white"
              py="2"
              px="4"
              my="1"
              borderRadius="md"
              shadow={1}
              width="100%"
              onTouchEnd={() => handleSelectCity(item)}
            >
              <Text>{item.name}</Text>
            </Box>
          )}
        />
      )}
    </VStack>
  );
}
