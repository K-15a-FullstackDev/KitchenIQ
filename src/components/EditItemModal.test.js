import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

const updateItem = jest.fn();
jest.mock("../services/items", () => ({
  updateItem: (...args) => updateItem(...args),
}));

import EditItemModal from "./EditItemModal";

beforeEach(() => {
  updateItem.mockReset();
});

test("saves edited fields via updateItem and closes", async () => {
  const onClose = jest.fn();
  render(
    <EditItemModal
      item={{
        id: "1",
        name: "Tomatoes",
        sku: "SKU-001",
        unit: "kg",
        currentStock: 10,
        reorderPoint: 5,
        dailyUsageAvg: 2,
      }}
      onClose={onClose}
    />
  );

  fireEvent.change(screen.getByTestId("edit-name"), {
    target: { value: "Roma Tomatoes" },
  });
  fireEvent.change(screen.getByTestId("edit-sku"), {
    target: { value: "SKU-001" },
  });
  fireEvent.change(screen.getByTestId("edit-unit"), {
    target: { value: "pcs" },
  });
  fireEvent.change(screen.getByTestId("edit-currentStock"), {
    target: { value: "12" },
  });

  fireEvent.click(screen.getByTestId("edit-save"));

  expect(updateItem).toHaveBeenCalledWith(
    "1",
    expect.objectContaining({
      name: "Roma Tomatoes",
      sku: "SKU-001",
      unit: "pcs",
      currentStock: 12,
    })
  );

  await Promise.resolve();
  expect(onClose).toHaveBeenCalled();
});

test("shows error if update fails", async () => {
  updateItem.mockRejectedValue(new Error("boom"));
  const onClose = jest.fn();

  render(
    <EditItemModal
      item={{ id: "1", name: "Tomatoes", sku: "SKU-001", unit: "kg" }}
      onClose={onClose}
    />
  );

  fireEvent.click(screen.getByTestId("edit-save"));
  expect(await screen.findByRole("alert")).toHaveTextContent("boom");
  expect(onClose).not.toHaveBeenCalled();
});
