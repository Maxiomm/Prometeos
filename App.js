import React from "react";
import { StatusBar } from "react-native";
import { NativeBaseProvider } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import WeatherManager from "./components/WeatherManager";
import FavoritesPage from "./components/FavoritesPage";
import Settings from "./components/Settings";

import { FavoritesProvider } from "./FavoritesContext";
import { TemperatureProvider } from "./TemperatureContext";

import "./locales/i18n";

const Tab = createBottomTabNavigator();

export default function App() {
  const { t } = useTranslation();

  return (
    <FavoritesProvider>
      <TemperatureProvider>
        <NativeBaseProvider>
          <StatusBar barStyle="dark-content" />
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  if (route.name === "Rechercher") {
                    iconName = focused ? "search" : "search-outline";
                  } else if (route.name === "Favoris") {
                    iconName = focused ? "star" : "star-outline";
                  } else if (route.name === "Paramètres") {
                    iconName = focused ? "settings" : "settings-outline";
                  }

                  // Retourner l'icône Ionicons appropriée
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "blue",
                tabBarInactiveTintColor: "gray",
                headerShown: false,
              })}
            >
              <Tab.Screen
                name="Rechercher"
                component={WeatherManager}
                options={{ tabBarLabel: t("search") }}
              />
              <Tab.Screen
                name="Favoris"
                component={FavoritesPage}
                options={{ tabBarLabel: t("favorites") }}
              />
              <Tab.Screen
                name="Paramètres"
                component={Settings}
                options={{ tabBarLabel: t("settings") }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </NativeBaseProvider>
      </TemperatureProvider>
    </FavoritesProvider>
  );
}
