import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import App from "../App";

test("React Testing Library works and container is rendered", () => {
  const { getByTestId } =  render(<App />);

  expect(getByTestId("container")).toBeInTheDocument();
});

