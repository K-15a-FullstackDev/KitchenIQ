import { render, screen, fireEvent } from "@testing-library/react";
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

// Provide a confirm stub we can control
beforeAll(() => {
  global.confirm = () => true;
});
afterAll(() => {
  delete global.confirm;
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

  [
    "Name",
    "SKU",
    "Unit",
    "Current Stock",
    "Reorder Point",
    "Daily Usage Avg",
    "Updated At",
    "Actions",
  ].forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());

  expect(screen.getByText("Tomatoes")).toBeInTheDocument();
  expect(screen.getByText("SKU-001")).toBeInTheDocument();
  expect(screen.getByText("kg")).toBeInTheDocument();
  expect(screen.getByText("10")).toBeInTheDocument();
  expect(screen.getByText("5")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
});

test("clicking Delete calls deleteItem with the doc id (confirm=true)", () => {
  // confirm should return true
  const confirmSpy = jest.spyOn(global, "confirm").mockReturnValue(true);

  subscribeItems.mockImplementationOnce((cb) => {
    cb([{ id: "1", name: "Tomatoes" }]);
    return () => {};
  });

  render(<InventoryList />);

  fireEvent.click(screen.getByRole("button", { name: /Delete Tomatoes/i }));
  expect(deleteItem).toHaveBeenCalledWith("1");

  confirmSpy.mockRestore();
});

test("does not call deleteItem when confirm=false", () => {
  const confirmSpy = jest.spyOn(global, "confirm").mockReturnValue(false);

  subscribeItems.mockImplementationOnce((cb) => {
    cb([{ id: "1", name: "Tomatoes" }]);
    return () => {};
  });

  render(<InventoryList />);
  fireEvent.click(screen.getByRole("button", { name: /Delete Tomatoes/i }));
  expect(deleteItem).not.toHaveBeenCalled();

  confirmSpy.mockRestore();
});
