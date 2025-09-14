import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import InventoryList from "./InventoryList";

const subscribeItems = jest.fn();
const deleteItem = jest.fn();
jest.mock("../services/items", () => ({
  subscribeItems: (...args) => subscribeItems(...args),
  deleteItem: (...args) => deleteItem(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  subscribeItems.mockImplementation(() => () => {});
});

test("shows LOW — reorder badge and highlights row when stock <= reorder", () => {
  subscribeItems.mockImplementationOnce((cb) => {
    cb([
      {
        id: "1",
        name: "Tomatoes",
        sku: "SKU-001",
        unit: "kg",
        currentStock: 2,
        reorderPoint: 5,
        dailyUsageAvg: 1,
      },
    ]);
    return () => {};
  });

  render(<InventoryList />);

  const badge = screen.getByTestId("badge-1");
  expect(badge).toHaveTextContent(/LOW — reorder/i);
  expect(badge).toHaveTextContent(/2d/);

  const row = screen.getByText("Tomatoes").closest("tr");
  expect(row).toHaveStyle("background: #fff7ed");
});

test("shows ∞d (no consumption) and no LOW badge nor highlight", () => {
  subscribeItems.mockImplementationOnce((cb) => {
    cb([
      {
        id: "2",
        name: "Apples",
        sku: "SKU-002",
        unit: "kg",
        currentStock: 10,
        reorderPoint: 1,
        dailyUsageAvg: 0,
      },
    ]);
    return () => {};
  });

  render(<InventoryList />);

  const badge = screen.getByTestId("badge-2");
  expect(badge).toHaveTextContent("∞d");
  expect(badge).not.toHaveTextContent(/LOW/i);

  const row = screen.getByText("Apples").closest("tr");
  expect(row).not.toHaveStyle("background: #fff7ed");
});
