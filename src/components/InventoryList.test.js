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

beforeAll(() => {
  global.confirm = () => true;
});
afterAll(() => {
  delete global.confirm;
});

test("shows empty state when no items", () => {
  subscribeItems.mockImplementationOnce((cb) => {
    cb([]);
    return () => {};
  });
  render(<InventoryList />);
  expect(screen.getByTestId("empty")).toHaveTextContent("No items yet.");
});

test("renders row + Chart/Edit/Delete buttons and calls onSelectItem", () => {
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
      },
    ]);
    return () => {};
  });
  const onSelectItem = jest.fn();
  render(<InventoryList onSelectItem={onSelectItem} />);

  expect(
    screen.getByRole("button", { name: /Chart Tomatoes/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /Edit Tomatoes/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /Delete Tomatoes/i })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Chart Tomatoes/i }));
  expect(onSelectItem).toHaveBeenCalledWith(
    expect.objectContaining({ id: "1", name: "Tomatoes" })
  );
});

test("Delete calls deleteItem when confirmed", () => {
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
