import React from "react";
import { Line } from "react-chartjs-2";

function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0xffffffff) / 0x100000000;
  };
}

function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function generateHistory(sku = "SKU", days = 14) {
  const rand = seededRand(hash(sku));
  const labels = [];
  const data = [];

  let stock = 20 + Math.floor(rand() * 30);
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString());

    stock = Math.max(0, stock + Math.floor(rand() * 5) - 2);
    data.push(stock);
  }
  return { labels, data };
}

export default function StockHistoryChart({ item }) {
  if (!item) return null;
  const { labels, data } = generateHistory(item.sku || item.name || "SKU");

  const chartData = {
    labels,
    datasets: [
      {
        label: `Stock — ${item.name} (${item.sku})`,
        data,
        fill: false,
        lineTension: 0.2,
        borderWidth: 2,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    legend: { display: true },
    scales: {
      xAxes: [{ display: true }],
      yAxes: [{ display: true, ticks: { beginAtZero: true } }],
    },
    animation: { duration: 0 },
  };

  return (
    <section aria-label="Stock History" style={{ marginTop: 16 }}>
      <h3>Stock history — {item.name}</h3>
      <div data-testid="stock-chart" style={{ height: 280 }}>
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}
