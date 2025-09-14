import { useState } from "react";
import { createItem } from "../services/items";

const UNITS = ["kg", "pcs", "ltr"];

export default function AddItemForm() {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState(UNITS[0]);
  const [currentStock, setCurrentStock] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [dailyUsageAvg, setDailyUsageAvg] = useState("");
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");

  function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setStatus("");
    try {
      await createItem({
        name,
        sku: sku.trim(),
        unit,
        currentStock: toNum(currentStock),
        reorderPoint: toNum(reorderPoint),
        dailyUsageAvg: toNum(dailyUsageAvg),
      });
      // clear
      setName("");
      setSku("");
      setUnit(UNITS[0]);
      setCurrentStock("");
      setReorderPoint("");
      setDailyUsageAvg("");
      setStatus("Added");
    } catch (e2) {
      setErr(e2?.message || "Add failed");
    }
  }

  return (
    <section aria-label="Add Item" style={{ margin: "16px 0" }}>
      <h2>Add Item</h2>
      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 8, maxWidth: 520 }}
      >
        <label>
          Name
          <input
            data-testid="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          SKU
          <input
            data-testid="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onBlur={() => setSku((s) => s.trim().toUpperCase())}
            required
          />
        </label>
        <label>
          Unit
          <select
            data-testid="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <label>
          Current Stock
          <input
            data-testid="currentStock"
            type="number"
            min="0"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
          />
        </label>
        <label>
          Reorder Point
          <input
            data-testid="reorderPoint"
            type="number"
            min="0"
            value={reorderPoint}
            onChange={(e) => setReorderPoint(e.target.value)}
          />
        </label>
        <label>
          Daily Usage Avg
          <input
            data-testid="dailyUsageAvg"
            type="number"
            min="0"
            value={dailyUsageAvg}
            onChange={(e) => setDailyUsageAvg(e.target.value)}
          />
        </label>

        <button data-testid="submit" type="submit">
          Add
        </button>
      </form>
      {status && <p role="status">{status}</p>}
      {err && <p role="alert">{err}</p>}
    </section>
  );
}
