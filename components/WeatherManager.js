import React, { useState, useContext } from "react";
import { Box, VStack, Text, Spinner, Center } from "native-base";
import { ScrollView, RefreshControl, SafeAreaView } from "react-native";
import { WEATHER_API_KEY, LOCATIONIQ_API_KEY, TIMEZONEDB_API_KEY } from "@env";
import { useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import axios from "axios";

import CityInput from "./CityInput";
import WeatherDisplay from "./WeatherDisplay";

import { FavoritesContext } from "../FavoritesContext";

export default function WeatherManager() {
  const route = useRoute();

  const [city, setCity] = useState(route.params?.cityName || "");
  const [isFromFavorites, setIsFromFavorites] = useState(false);
  const [weather, setWeather] = useState(null);
  const [localTime, setLocalTime] = useState("");
  const [state, setState] = useState("");

  const [isWeatherReady, setIsWeatherReady] = useState(false);
  const [isTimeReady, setIsTimeReady] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  // Fonction pour ajouter une ville aux favoris
  const { addToFavorites } = useContext(FavoritesContext);

  const { t, i18n } = useTranslation();

  // Fonction pour vérifier si la recherche correspond à une ville via LocationIQ
  const checkIfCity = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true); // Indique que c'est un pull-to-refresh
    } else {
      setIsLoading(true); // Indique que c'est un chargement initial
    }

    setHasSearched(true);

    const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
      city
    )}&format=json&limit=1&addressdetails=1`;

    try {
      const response = await axios.get(url);
      const location = response.data[0];

      if (
        location &&
        (location.address.city ||
          location.address.town ||
          location.address.village ||
          location.address.hamlet)
      ) {
        fetchWeather(); // Appelle la fonction pour récupérer la météo
      } else {
        setError(t("pleaseEnterCity"));
        setWeather(null);
        setLocalTime("");
        setState("");
        setIsWeatherReady(false);
        setIsTimeReady(false);
        setIsLoading(false);
        setIsRefreshing(false);
        setHasSearched(false);
      }
    } catch (error) {
      setError(t("errorCityCheck"));
      setWeather(null);
      setLocalTime("");
      setState("");
      setIsWeatherReady(false);
      setIsTimeReady(false);
      setIsLoading(false);
      setIsRefreshing(false);
      setHasSearched(false);
    }
  };

  // Fonction pour récupérer la météo via l'API OpenWeatherMap
  const fetchWeather = async (cityToFetch = city) => {
    if (!city) return;

    setIsWeatherReady(false);

    // Récupérer la langue actuelle de i18next
    const language = i18n.language;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityToFetch}&appid=${WEATHER_API_KEY}&units=metric&lang=${language}`;

    try {
      const response = await axios.get(url);

      setWeather(response.data);

      // Extraire l'État si disponible
      const locationName = response.data.name;
      const stateInfo = locationName.includes(", ")
        ? locationName.split(", ")[1]
        : ""; // Extraire l'État si présent après une virgule

      setState(stateInfo); // Stocker l'information de l'État
      setIsWeatherReady(true);
      setError("");

      // Une fois la météo récupérée, récupérer l'heure locale
      fetchLocalTime(response.data.coord.lat, response.data.coord.lon);
    } catch (err) {
      setError(t("cityNotFound"));
      setWeather(null);
      setLocalTime("");
      setState("");
      setIsWeatherReady(false);
      setIsLoading(false);
      setIsRefreshing(false);
      setHasSearched(false);
    }
  };

  // Fonction pour récupérer l'heure locale via TimeZoneDB
  const fetchLocalTime = async (latitude, longitude) => {
    setIsTimeReady(false);

    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONEDB_API_KEY}&format=json&by=position&lat=${latitude}&lng=${longitude}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      // Extraire uniquement l'heure et les minutes du champ "formatted"
      const formattedTime = data.formatted.split(" ")[1].slice(0, 5); // Récupère "HH:MM"

      setLocalTime(formattedTime);
      setIsTimeReady(true);

      // Fin du chargement lorsque toutes les données sont prêtes
      if (isWeatherReady) {
        setIsLoading(false);
      }
    } catch (error) {
      setIsTimeReady(false);
      setIsLoading(false);
    }
  };

  // Fonction spécifique pour les favoris
  const handleFavoritePress = (selectedCity) => {
    setCity(selectedCity.name); // Met à jour la ville sélectionnée
    setIsFromFavorites(true); // Indique que la recherche vient des favoris
  };

  // Récupérer la ville favorite lors de la navigation
  React.useEffect(() => {
    if (route.params?.cityName) {
      handleFavoritePress({ name: route.params.cityName });
    }
  }, [route.params?.cityName]);

  // Utilisation de useEffect pour déclencher la recherche lorsque la ville vient des favoris
  React.useEffect(() => {
    if (isFromFavorites && city) {
      fetchWeather(city);
      setIsFromFavorites(false); // Réinitialise après la recherche
    }
  }, [city, isFromFavorites]);

  // Fonction pour rafraîchir la recherche météo
  const onRefresh = async () => {
    await checkIfCity(true); // Passe "true" pour indiquer que c'est un rafraîchissement
    setIsRefreshing(false); // Cache le spinner de pull-to-refresh une fois terminé
  };

  // Désactiver le chargement lorsque toutes les données sont prêtes
  React.useEffect(() => {
    if (isWeatherReady && isTimeReady) {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isWeatherReady, isTimeReady]);

  // Réappeler l'API lorsque la langue change
  React.useEffect(() => {
    fetchWeather();
  }, [i18n.language]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <VStack flex={1} p={4} w="100%" space={4}>
        <Box w="100%">
          <CityInput
            city={city}
            setCity={setCity}
            fetchWeather={checkIfCity}
            error={error}
            setError={setError}
          />
        </Box>

        {hasSearched &&
        (isLoading || !isWeatherReady || !isTimeReady) &&
        !isRefreshing ? (
          <Center flex={1} justifyContent="center" alignItems="center">
            <Spinner size="lg" color="blue.500" />
          </Center>
        ) : (
          <ScrollView
            flex={1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 0 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }
          >
            <Box flex={1} w="100%">
              {error ? (
                <Text color="red.500" fontSize="md" textAlign="center" mt="2">
                  {error}
                </Text>
              ) : (
                // Afficher WeatherDisplay seulement si toutes les données sont prêtes
                isWeatherReady &&
                isTimeReady && (
                  <WeatherDisplay
                    weather={weather}
                    localTime={localTime}
                    state={state}
                    onAddToFavorites={addToFavorites}
                  />
                )
              )}
            </Box>
          </ScrollView>
        )}
      </VStack>
    </SafeAreaView>
  );
}
