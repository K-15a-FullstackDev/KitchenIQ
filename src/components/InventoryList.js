import { useEffect, useState } from "react";
import { subscribeItems, deleteItem } from "../services/items";
import EditItemModal from "./EditItemModal";

function formatUpdatedAt(ts) {
  if (!ts) return "-";
  if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
  if (typeof ts.seconds === "number")
    return new Date(ts.seconds * 1000).toLocaleString();
  return "-";
}

export default function InventoryList() {
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
            {items.map((it) => (
              <tr key={it.id}>
                <td
                  style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}
                >
                  {it.name}
                </td>
                <td
                  style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}
                >
                  {it.sku}
                </td>
                <td
                  style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}
                >
                  {it.unit}
                </td>
                <td
                  style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}
                >
                  {it.currentStock}
                </td>
                <td
                  style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}
                >
                  {it.reorderPoint}
                </td>
                <td
                  style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}
                >
                  {it.dailyUsageAvg}
                </td>
                <td
                  style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}
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
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <EditItemModal item={editing} onClose={() => setEditing(null)} />
      ) : null}
    </section>
  );
}
