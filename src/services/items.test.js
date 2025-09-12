jest.mock("../firebase", () => {
  const add = jest.fn();
  const update = jest.fn();
  const _delete = jest.fn();
  const onSnapshot = jest.fn();
  const doc = jest.fn(() => ({ update, delete: _delete }));
  const orderBy = jest.fn(() => ({ onSnapshot }));
  const collection = jest.fn(() => ({ add, doc, orderBy }));
  return {
    db: { collection },
    __mocks: { add, update, _delete, onSnapshot, doc, orderBy, collection },
  };
});

jest.mock("firebase/app", () => {
  const serverTimestamp = jest.fn(() => "SERVER_TS");
  return { default: { firestore: { FieldValue: { serverTimestamp } } } };
});

import { createItem, updateItem, deleteItem, subscribeItems } from "./items";

const { __mocks } = jest.requireMock("../firebase");
const firebaseApp = jest.requireMock("firebase/app").default;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createItem", () => {
  test("adds normalized payload and sets server timestamp", async () => {
    await createItem({
      name: "Tomatoes",
      sku: "SKU-001",
      unit: "kg",
      currentStock: "10",
      reorderPoint: "5",
      dailyUsageAvg: "2",
    });

    expect(__mocks.collection).toHaveBeenCalledWith("items");
    expect(__mocks.add).toHaveBeenCalledTimes(1);

    const payload = __mocks.add.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: "Tomatoes",
      sku: "SKU-001",
      unit: "kg",
      currentStock: 10,
      reorderPoint: 5,
      dailyUsageAvg: 2,
    });
    expect(firebaseApp.firestore.FieldValue.serverTimestamp).toHaveBeenCalled();
    expect(payload.updatedAt).toBe("SERVER_TS");
  });

  test("throws if required fields missing", async () => {
    await expect(createItem({ sku: "X", unit: "kg" })).rejects.toThrow(
      "`name` is required"
    );

    await expect(createItem({ name: "A", unit: "kg" })).rejects.toThrow(
      "`sku` is required"
    );

    await expect(createItem({ name: "A", sku: "X" })).rejects.toThrow(
      "`unit` is required"
    );
  });
});

describe("updateItem", () => {
  test("updates partial fields, coerces numbers, sets updatedAt", async () => {
    await updateItem("abc123", { currentStock: "12", reorderPoint: "3" });

    expect(__mocks.collection).toHaveBeenCalledWith("items");
    expect(__mocks.doc).toHaveBeenCalledWith("abc123");
    expect(__mocks.update).toHaveBeenCalledTimes(1);

    const patch = __mocks.update.mock.calls[0][0];
    expect(patch.currentStock).toBe(12);
    expect(patch.reorderPoint).toBe(3);
    expect(firebaseApp.firestore.FieldValue.serverTimestamp).toHaveBeenCalled();
    expect(patch.updatedAt).toBe("SERVER_TS");
  });

  test("throws if id missing", async () => {
    await expect(updateItem("", { name: "X" })).rejects.toThrow(
      "`id` is required"
    );
  });
});

describe("deleteItem", () => {
  test("deletes by id", async () => {
    await deleteItem("abc123");
    expect(__mocks.collection).toHaveBeenCalledWith("items");
    expect(__mocks.doc).toHaveBeenCalledWith("abc123");
    expect(__mocks._delete).toHaveBeenCalledTimes(1);
  });
});

describe("subscribeItems", () => {
  test("subscribes and maps docs to array with ids", () => {
    const cb = jest.fn();
    const unsub = jest.fn();

    __mocks.onSnapshot.mockImplementation((handler) => {
      handler({
        docs: [
          { id: "1", data: () => ({ name: "Apples" }) },
          { id: "2", data: () => ({ name: "Bananas" }) },
        ],
      });
      return unsub;
    });

    const ret = subscribeItems(cb);

    expect(__mocks.collection).toHaveBeenCalledWith("items");
    expect(__mocks.orderBy).toHaveBeenCalledWith("name");
    expect(cb).toHaveBeenCalledWith([
      { id: "1", name: "Apples" },
      { id: "2", name: "Bananas" },
    ]);
    expect(typeof ret).toBe("function");

    // call unsubscribe to ensure it is a function (no throw)
    ret();
    expect(unsub).toHaveBeenCalledTimes(1);
  });
});
