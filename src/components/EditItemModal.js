import { useState } from "react";
import { updateItem } from "../services/items";

export default function EditItemModal({ item, onClose }) {
  const [name, setName] = useState(item?.name || "");
  const [sku, setSku] = useState(item?.sku || "");
  const [unit, setUnit] = useState(item?.unit || "kg");
  const [currentStock, setCurrentStock] = useState(
    String(item?.currentStock ?? "")
  );
  const [reorderPoint, setReorderPoint] = useState(
    String(item?.reorderPoint ?? "")
  );
  const [dailyUsageAvg, setDailyUsageAvg] = useState(
    String(item?.dailyUsageAvg ?? "")
  );
  const [err, setErr] = useState("");

  function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await updateItem(item.id, {
        name: name.trim(),
        sku: sku.trim(),
        unit,
        currentStock: toNum(currentStock),
        reorderPoint: toNum(reorderPoint),
        dailyUsageAvg: toNum(dailyUsageAvg),
      });
      onClose && onClose();
    } catch (e2) {
      setErr(e2?.message || "Update failed");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 16,
          maxWidth: 520,
          width: "100%",
          borderRadius: 6,
        }}
      >
        <h3>Edit Item</h3>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
          <label>
            {" "}
            Name
            <input
              data-testid="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            {" "}
            SKU
            <input
              data-testid="edit-sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </label>
          <label>
            {" "}
            Unit
            <select
              data-testid="edit-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            >
              <option>kg</option>
              <option>pcs</option>
              <option>ltr</option>
            </select>
          </label>
          <label>
            {" "}
            Current Stock
            <input
              data-testid="edit-currentStock"
              type="number"
              min="0"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
            />
          </label>
          <label>
            {" "}
            Reorder Point
            <input
              data-testid="edit-reorderPoint"
              type="number"
              min="0"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
            />
          </label>
          <label>
            {" "}
            Daily Usage Avg
            <input
              data-testid="edit-dailyUsageAvg"
              type="number"
              min="0"
              value={dailyUsageAvg}
              onChange={(e) => setDailyUsageAvg(e.target.value)}
            />
          </label>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button data-testid="edit-save" type="submit">
              Save
            </button>
            <button data-testid="edit-cancel" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
        {err && <p role="alert">{err}</p>}
      </div>
    </div>
  );
}
