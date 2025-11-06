import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import LocationCard from "../components/LocationCard";
import { Coordinate } from "../types";

const coordinate: Coordinate = {
  lat: 50,
  long: 55
}

test('LocationCard renders', async () => {
  const { getByText } =  render(<LocationCard coordinate={coordinate} />);

  expect(getByText(/Lat:/)).toBeInTheDocument()
  expect(getByText(/Long:/)).toBeInTheDocument()
})