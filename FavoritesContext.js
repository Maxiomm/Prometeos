import React, { createContext, useState } from "react";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Fonction pour ajouter une ville aux favoris, sans doublon
  const addToFavorites = (city) => {
    const { latitude, longitude } = city;

    const cityExists = favorites.some(
      (fav) => fav.latitude === latitude && fav.longitude === longitude
    );

    if (!cityExists) {
      setFavorites((prevFavorites) => [...prevFavorites, city]);
    }
  };

  // Fonction pour supprimer une ville des favoris
  const removeFromFavorites = (city) => {
    const { latitude, longitude } = city;

    setFavorites((prevFavorites) =>
      prevFavorites.filter(
        (fav) => fav.latitude !== latitude || fav.longitude !== longitude
      )
    );
  };

  // Fonction pour réinitialiser les favoris
  const resetFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, resetFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
