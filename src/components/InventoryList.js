// src/components/InventoryList.js
// Inventory table with Chart/Edit/Delete + prediction badge (days-to-empty) — Firestore v8, 2021-era
import { useEffect, useState } from "react";
import { subscribeItems, deleteItem } from "../services/items";
import { lowStockStatus } from "../utils/prediction";
import EditItemModal from "./EditItemModal";

function formatUpdatedAt(ts) {
  if (!ts) return "-";
  if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
  if (typeof ts.seconds === "number")
    return new Date(ts.seconds * 1000).toLocaleString();
  return "-";
}

function Badge({ item }) {
  const s = lowStockStatus(item);
  const dtoe = s.daysToEmpty === Infinity ? "∞d" : `${s.daysToEmpty}d`;
  const text = s.low
    ? s.reason === "reorder"
      ? `LOW — reorder • ${dtoe}`
      : `LOW — soon • ${dtoe}`
    : `${dtoe}`;

  const style = {
    display: "inline-block",
    marginLeft: 8,
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 12,
    background: s.low ? "#fde68a" /* amber-200 */ : "#e5e7eb" /* gray-200 */,
    color: s.low ? "#7c2d12" /* amber-900 */ : "#111827" /* gray-900 */,
  };

  return (
    <span data-testid={`badge-${item.id}`} style={style}>
      {text}
    </span>
  );
}

export default function InventoryList({ onSelectItem }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const unsub = subscribeItems((list) => setItems(list || []));
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  async function handleDelete(id) {
    const ok = window.confirm("Delete this item?");
    if (!ok) return;
    try {
      await deleteItem(id);
    } catch (_) {
      alert("Delete failed");
    }
  }

  if (!items.length) {
    return (
      <section aria-label="Inventory List">
        <h2>Inventory</h2>
        <p data-testid="empty">No items yet.</p>
      </section>
    );
  }

  return (
    <section aria-label="Inventory List">
      <h2>Inventory</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {[
                "Name",
                "SKU",
                "Unit",
                "Current Stock",
                "Reorder Point",
                "Daily Usage Avg",
                "Updated At",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const s = lowStockStatus(it);
              const rowStyle = s.low
                ? { background: "#fff7ed" /* orange-50 */ }
                : {};
              return (
                <tr key={it.id} style={rowStyle}>
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {it.name}
                    <Badge item={it} />
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {it.sku}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {it.unit}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {it.currentStock}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {it.reorderPoint}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {it.dailyUsageAvg}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {formatUpdatedAt(it.updatedAt)}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button
                      aria-label={`Chart ${it.name}`}
                      onClick={() => onSelectItem && onSelectItem(it)}
                    >
                      Chart
                    </button>
                    <button
                      aria-label={`Edit ${it.name}`}
                      onClick={() => setEditing(it)}
                    >
                      Edit
                    </button>
                    <button
                      aria-label={`Delete ${it.name}`}
                      onClick={() => handleDelete(it.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing ? (
        <EditItemModal item={editing} onClose={() => setEditing(null)} />
      ) : null}
    </section>
  );
}
