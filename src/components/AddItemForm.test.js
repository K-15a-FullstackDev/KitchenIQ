import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

const createItem = jest.fn();
jest.mock("../services/items", () => ({
  createItem: (...args) => createItem(...args),
}));
import AddItemForm from "./AddItemForm";

beforeEach(() => {
  createItem.mockReset();
});

test("submits item and clears form on success", async () => {
  createItem.mockResolvedValue({ id: "abc" });

  render(<AddItemForm />);

  fireEvent.change(screen.getByTestId("name"), {
    target: { value: "Tomatoes" },
  });
  fireEvent.change(screen.getByTestId("sku"), { target: { value: "sku-001" } });
  fireEvent.blur(screen.getByTestId("sku")); // uppercases
  fireEvent.change(screen.getByTestId("unit"), { target: { value: "kg" } });
  fireEvent.change(screen.getByTestId("currentStock"), {
    target: { value: "10" },
  });
  fireEvent.change(screen.getByTestId("reorderPoint"), {
    target: { value: "5" },
  });
  fireEvent.change(screen.getByTestId("dailyUsageAvg"), {
    target: { value: "2" },
  });
  fireEvent.click(screen.getByTestId("submit"));

  // wait for status (“Added” appears after promise resolves)
  await screen.findByRole("status");

  expect(createItem).toHaveBeenCalledWith({
    name: "Tomatoes",
    sku: "SKU-001",
    unit: "kg",
    currentStock: 10,
    reorderPoint: 5,
    dailyUsageAvg: 2,
  });

  expect(screen.getByRole("status")).toHaveTextContent("Added");
});

test("shows error if create fails", async () => {
  createItem.mockRejectedValue(new Error("boom"));

  render(<AddItemForm />);

  fireEvent.change(screen.getByTestId("name"), { target: { value: "Apples" } });
  fireEvent.change(screen.getByTestId("sku"), { target: { value: "sku-002" } });
  fireEvent.blur(screen.getByTestId("sku"));
  fireEvent.click(screen.getByTestId("submit"));

  expect(await screen.findByRole("alert")).toHaveTextContent("boom");
});
