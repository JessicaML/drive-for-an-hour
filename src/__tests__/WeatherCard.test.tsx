import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import WeatherCard from "../components/WeatherCard";
import { Value } from "../types";

const value: Value = { 
  id: 1,
  main: { 
    temp: 30 
  }, 
  weather: 
    [
      { description: 'sunny',
        main: 'sun'
      }
    ],
  sys: { 
    sunrise: 1683174857,
    sunset: 1683228608
  }
}

test('WeatherCard renders', async () => {
  const { getByText } =  render(<WeatherCard value={value} />);

  expect(getByText(/Current weather:/)).toBeInTheDocument()
  expect(getByText(/Temperature:/)).toBeInTheDocument()
  expect(getByText(/Sunrise time:/)).toBeInTheDocument()
  expect(getByText(/Sunset time:/)).toBeInTheDocument()
  expect(getByText(/Daylight hours:/)).toBeInTheDocument()
})

test('WeatherCard calculates daylight hours correctly', () => {
  const { getByText } = render(<WeatherCard value={value} />);

  // Expected: (1683228608 - 1683174857) = 53751 seconds = 14h 55m
  expect(getByText(/Daylight hours: 14h 55m/)).toBeInTheDocument()
})