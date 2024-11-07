import React, { createContext, useState } from "react";

export const TemperatureContext = createContext();

export const TemperatureProvider = ({ children }) => {
  const [defaultUnit, setDefaultUnit] = useState("Celsius"); // "Celsius" ou "Fahrenheit"

  return (
    <TemperatureContext.Provider value={{ defaultUnit, setDefaultUnit }}>
      {children}
    </TemperatureContext.Provider>
  );
};
