import React from "react";
import MapView, { UrlTile, Marker } from "react-native-maps";
import { Box } from "native-base";
import { MAPBOX_API_KEY } from "@env";

export default function CityMap({ latitude, longitude, cityName }) {
  // Déterminer l'heure actuelle pour choisir le style de la carte
  const currentHour = new Date().getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18;

  // Choisir le style de carte en fonction de l'heure
  const mapStyle = isDaytime
    ? "light-v11" // Style clair en journée
    : "dark-v11"; // Style sombre la nuit

  return (
    <Box
      mt={5}
      width="100%"
      height="300px"
      borderRadius="15px"
      overflow="hidden"
      borderWidth={5}
      borderColor="gray.400"
    >
      <MapView
        style={{ flex: 1, backgroundColor: "black" }}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 50,
          longitudeDelta: 50,
        }}
        showsUserLocation={true} // Montre la position de l'utilisateur si les permissions sont activées
        showsCompass={true} // Affiche la boussole
        showsScale={true} // Affiche l'échelle de la carte
        showsTraffic={false}
      >
        <UrlTile
          urlTemplate={`https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_API_KEY}`}
          maximumZ={19}
        />

        <Marker
          coordinate={{ latitude: latitude, longitude: longitude }}
          title={cityName}
          pinColor="darkviolet"
        />
      </MapView>
    </Box>
  );
}
