import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

test("renders headline", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /KitchenIQ/i })
  ).toBeInTheDocument();
});
