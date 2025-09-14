import { useEffect, useState } from "react";
import "./App.css";
import { auth } from "./firebase";
import SignIn from "./components/SignIn";
import AddItemForm from "./components/AddItemForm";
import InventoryList from "./components/InventoryList";
import StockHistoryChart from "./components/StockHistoryChart";

function App() {
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub && unsub();
  }, []);

  async function handleSignOut() {
    if (!auth) return;
    await auth.signOut();
    setSelectedItem(null);
  }

  return (
    <main style={{ padding: "24px" }}>
      <h1>KitchenIQ</h1>
      <p>Predictive restaurant inventory — React 17 + Firebase + Chart.js</p>

      {!user ? (
        <SignIn />
      ) : (
        <>
          <div>
            <p data-testid="user-email">
              Signed in as <strong>{user.email}</strong>
            </p>
            <button data-testid="signout" onClick={handleSignOut}>
              Sign out
            </button>
          </div>

          <AddItemForm />
          <InventoryList onSelectItem={setSelectedItem} />
          <StockHistoryChart item={selectedItem} />
        </>
      )}
    </main>
  );
}

export default App;
