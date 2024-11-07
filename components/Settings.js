import React, { useState, useContext } from "react";
import {
  HStack,
  VStack,
  Button,
  Text,
  Actionsheet,
  ScrollView,
  useDisclose,
} from "native-base";
import { useTranslation } from "react-i18next";
import i18n from "../locales/i18n";

import { TemperatureContext } from "../TemperatureContext";

// Fonction pour convertir le code de pays ISO en emoji de drapeau
const getCountryFlagEmoji = (countryCode) => {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
};

export default function Settings() {
  const { isOpen, onOpen, onClose } = useDisclose();
  const [isTempSheetOpen, setIsTempSheetOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("fr");
  const { defaultUnit, setDefaultUnit } = useContext(TemperatureContext);
  const { t } = useTranslation();

  const languages = [
    { label: `Français ${getCountryFlagEmoji("FR")}`, value: "fr" },
    { label: `English ${getCountryFlagEmoji("GB")}`, value: "en" },
    { label: `Español ${getCountryFlagEmoji("ES")}`, value: "es" },
    // Ajouter d'autres langues ici
  ];

  const temperatureUnits = [
    { label: "Celsius (°C)", value: "Celsius" },
    { label: "Fahrenheit (°F)", value: "Fahrenheit" },
  ];

  const changeLanguage = (lng) => {
    setCurrentLanguage(lng);
    i18n.changeLanguage(lng);
    onClose(); // Fermer le menu après la sélection
  };

  const changeTemperatureUnit = (unit) => {
    setDefaultUnit(unit); // Mettre à jour l'unité de température par défaut
    setIsTempSheetOpen(false); // Fermer l'ActionSheet
  };

  return (
    <VStack flex={1} justifyContent="center" alignItems="center" space={5}>
      {/* Sélection de la langue */}
      <HStack space={3} alignItems="center">
        <Text fontSize="lg">{t("changeLanguage")}</Text>
        <Button
          onPress={onOpen}
          bg="white"
          borderWidth={1}
          borderColor="gray.400"
          borderRadius="full"
          px={4}
          py={2}
          _text={{ fontSize: "md", fontWeight: "bold", color: "black" }}
          _hover={{ bg: "gray.100" }}
          _pressed={{ bg: "gray.200" }}
        >
          {languages.find((lang) => lang.value === currentLanguage)?.label}
        </Button>
      </HStack>

      {/* Sélection de l'unité de température */}
      <HStack space={3} alignItems="center">
        <Text fontSize="lg">{t("defaultTemperatureUnit")}</Text>
        <Button
          onPress={() => setIsTempSheetOpen(true)}
          bg="white"
          borderWidth={1}
          borderColor="gray.400"
          borderRadius="full"
          px={4}
          py={2}
          _text={{ fontSize: "md", fontWeight: "bold", color: "black" }}
          _hover={{ bg: "gray.100" }}
          _pressed={{ bg: "gray.200" }}
        >
          {temperatureUnits.find((unit) => unit.value === defaultUnit)?.label}
        </Button>
      </HStack>

      {/* Actionsheet pour la sélection de la langue */}
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {languages.map((lang) => (
              <Actionsheet.Item
                key={lang.value}
                onPress={() => changeLanguage(lang.value)}
                _pressed={{ bg: "gray.100" }}
                borderRadius={10}
              >
                {lang.label}
              </Actionsheet.Item>
            ))}
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>

      {/* Actionsheet pour la sélection de l'unité de température */}
      <Actionsheet
        isOpen={isTempSheetOpen}
        onClose={() => setIsTempSheetOpen(false)}
      >
        <Actionsheet.Content>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {temperatureUnits.map((unit) => (
              <Actionsheet.Item
                key={unit.value}
                onPress={() => changeTemperatureUnit(unit.value)}
                _pressed={{ bg: "gray.100" }}
                borderRadius={10}
              >
                {unit.label}
              </Actionsheet.Item>
            ))}
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </VStack>
  );
}
