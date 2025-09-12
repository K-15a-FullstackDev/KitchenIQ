import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import InventoryList from "./InventoryList";

jest.mock("../services/items", () => ({
  subscribeItems: jest.fn(),
}));
import { subscribeItems } from "../services/items";

beforeEach(() => {
  jest.clearAllMocks();
  // default noop unsubscribe
  subscribeItems.mockImplementation(() => () => {});
});

test("shows empty state when there are no items", () => {
  subscribeItems.mockImplementationOnce((cb) => {
    cb([]); // emit empty list
    return () => {};
  });

  render(<InventoryList />);
  expect(
    screen.getByRole("heading", { name: /Inventory/i })
  ).toBeInTheDocument();
  expect(screen.getByTestId("empty")).toHaveTextContent("No items yet.");
});

test("renders table rows when items are present", () => {
  subscribeItems.mockImplementationOnce((cb) => {
    cb([
      {
        id: "1",
        name: "Tomatoes",
        sku: "SKU-001",
        unit: "kg",
        currentStock: 10,
        reorderPoint: 5,
        dailyUsageAvg: 2,
        updatedAt: { seconds: 1609459200 },
      },
    ]);
    return () => {};
  });

  render(<InventoryList />);

  // headers
  [
    "Name",
    "SKU",
    "Unit",
    "Current Stock",
    "Reorder Point",
    "Daily Usage Avg",
    "Updated At",
  ].forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());

  // row content
  expect(screen.getByText("Tomatoes")).toBeInTheDocument();
  expect(screen.getByText("SKU-001")).toBeInTheDocument();
  expect(screen.getByText("kg")).toBeInTheDocument();
  expect(screen.getByText("10")).toBeInTheDocument();
  expect(screen.getByText("5")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
});
