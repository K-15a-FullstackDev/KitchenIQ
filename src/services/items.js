import firebase from "firebase/app";
import { db } from "../firebase";

const COLLECTION = "items";

function toNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

/**
 * Create an inventory item.
 * @param {{name:string, sku:string, unit:string, currentStock:number, reorderPoint:number, dailyUsageAvg:number}} data
 * @returns {Promise<import('firebase').default.firestore.DocumentReference>}
 */
export async function createItem(data) {
  if (!db) throw new Error("Firestore not initialized");

  const payload = {
    name: (data.name || "").trim(),
    sku: (data.sku || "").trim(),
    unit: (data.unit || "").trim(), // e.g., 'kg', 'pcs', 'ltr'
    currentStock: toNumber(data.currentStock),
    reorderPoint: toNumber(data.reorderPoint),
    dailyUsageAvg: toNumber(data.dailyUsageAvg),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // Minimal validation
  if (!payload.name) throw new Error("`name` is required");
  if (!payload.sku) throw new Error("`sku` is required");
  if (!payload.unit) throw new Error("`unit` is required");

  return db.collection(COLLECTION).add(payload);
}

/**
 * Update partial fields of an item.
 * @param {string} id Firestore doc id
 * @param {object} partial Partial fields to update
 */
export async function updateItem(id, partial = {}) {
  if (!db) throw new Error("Firestore not initialized");
  if (!id) throw new Error("`id` is required");

  const patch = {
    ...partial,
    // Normalize possible numeric updates
    ...(partial.currentStock !== undefined && {
      currentStock: toNumber(partial.currentStock),
    }),
    ...(partial.reorderPoint !== undefined && {
      reorderPoint: toNumber(partial.reorderPoint),
    }),
    ...(partial.dailyUsageAvg !== undefined && {
      dailyUsageAvg: toNumber(partial.dailyUsageAvg),
    }),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  return db.collection(COLLECTION).doc(id).update(patch);
}

/**
 * Delete an item by id.
 * @param {string} id Firestore doc id
 */
export async function deleteItem(id) {
  if (!db) throw new Error("Firestore not initialized");
  if (!id) throw new Error("`id` is required");
  return db.collection(COLLECTION).doc(id).delete();
}

/**
 * Subscribe to live list of items ordered by name.
 * @param {(items: Array<{id:string} & any>) => void} cb callback with items array
 * @returns {() => void} unsubscribe function
 */
export function subscribeItems(cb) {
  if (!db) {
    // Dev convenience—allows app to boot without envs
    // eslint-disable-next-line no-console
    console.warn("Firestore not initialized; subscribeItems is a no-op");
    return () => {};
  }

  return db
    .collection(COLLECTION)
    .orderBy("name")
    .onSnapshot((snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(items);
    });
}
