import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import StockHistoryChart from "./StockHistoryChart";

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = () => ({});
});

test("renders chart wrapper when item provided", () => {
  render(<StockHistoryChart item={{ name: "Tomatoes", sku: "SKU-001" }} />);
  expect(
    screen.getByRole("heading", { name: /Stock history — Tomatoes/i })
  ).toBeInTheDocument();
  expect(screen.getByTestId("stock-chart")).toBeInTheDocument();
});

test("renders nothing when no item", () => {
  const { container } = render(<StockHistoryChart item={null} />);
  expect(container).toBeEmptyDOMElement();
});
