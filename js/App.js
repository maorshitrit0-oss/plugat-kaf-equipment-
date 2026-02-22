const { useState, useEffect } = React;

function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [checkouts, setCheckouts] = useState([]);
  const [faults, setFaults] = useState([]);
  const [spareEquipment, setSpareEquipment] = useState([]);

  const [passwordHash, setPasswordHash] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const loadPasswordConfig = async () => {
    const url =
      "https://plugat-kaf-default-rtdb.firebaseio.com/passwordHash.json";
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (typeof data === "string" && data.length > 0) {
          setPasswordHash(data);
          return;
        }
      }
    } catch (e) {
      console.error("Error loading password from Firebase:", e);
    }

    try {
      const defaultHash = await hashPassword("0209");
      try {
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(defaultHash),
        });
      } catch (e) {
        console.error("Error saving default password hash to Firebase:", e);
      }
      setPasswordHash(defaultHash);
    } catch (e) {
      console.error("Error hashing default password:", e);
    }
  };

  useEffect(() => {
    let interval = null;
    const handleStorageChange = () => loadData();

    const initAll = async () => {
      await loadPasswordConfig();
      initData();
      loadData();
      window.addEventListener("storage", handleStorageChange);
      interval = setInterval(loadData, 2000);
      setIsAuthLoading(false);
    };

    initAll();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      const resSpare = await fetch(
        "https://plugat-kaf-default-rtdb.firebaseio.com/spareEquipment.json"
      );
      if (resSpare.ok) {
        const data = await resSpare.json();
        let spareArray = [];
        if (data) {
          spareArray = Object.keys(data).map((key) => ({
            ...data[key],
            firebaseId: key,
          }));
        }
        setSpareEquipment(spareArray);
      }
    } catch (e) {
      console.error("Failed to fetch spare equipment:", e);
    }

    try {
      const resCheckouts = await fetch(
        "https://plugat-kaf-default-rtdb.firebaseio.com/checkouts.json"
      );
      if (resCheckouts.ok) {
        const data = await resCheckouts.json();
        const checkoutsArray = data ? Object.values(data) : [];
        setCheckouts(checkoutsArray);
      }
    } catch (e) {
      console.error("Failed to fetch checkouts:", e);
    }

    try {
      const resFaults = await fetch(
        "https://plugat-kaf-default-rtdb.firebaseio.com/faults.json"
      );
      if (resFaults.ok) {
        const data = await resFaults.json();
        let faultsArray = [];
        if (data) {
          faultsArray = Object.keys(data).map((key) => ({
            ...data[key],
            firebaseId: key,
          }));
        }
        const now = Date.now();
        const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
        const filteredFaults = faultsArray.filter((f) => {
          if (f.status === "pending") return true;
          if (f.status === "resolved" && f.resolvedDate) {
            const resolvedTime = new Date(f.resolvedDate).getTime();
            return resolvedTime > ninetyDaysAgo;
          }
          return true;
        });
        setFaults(filteredFaults);
      }
    } catch (e) {
      console.error("Failed to fetch faults:", e);
    }
  };

  const deleteFault = async (faultId) => {
    if (!confirm("האם למחוק תקלה זו?")) return;
    const fault = faults.find((f) => f.id === faultId);
    if (fault && fault.firebaseId) {
      try {
        await fetch(
          `https://plugat-kaf-default-rtdb.firebaseio.com/faults/${fault.firebaseId}.json`,
          { method: "DELETE" }
        );
      } catch (e) {
        console.error("Failed to delete fault from Firebase:", e);
      }
    }
    setFaults(faults.filter((f) => f.id !== faultId));
  };

  const updateFaultStatus = async (faultId, newStatus) => {
    const fault = faults.find((f) => f.id === faultId);
    if (fault && fault.firebaseId) {
      const updates = {
        status: newStatus,
        resolvedDate:
          newStatus === "resolved" ? new Date().toISOString() : null,
      };
      try {
        await fetch(
          `https://plugat-kaf-default-rtdb.firebaseio.com/faults/${fault.firebaseId}.json`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          }
        );
      } catch (e) {
        console.error("Failed to update fault status in Firebase:", e);
      }
    }
    setFaults(
      faults.map((f) => {
        if (f.id === faultId) {
          return {
            ...f,
            status: newStatus,
            resolvedDate:
              newStatus === "resolved" ? new Date().toISOString() : null,
          };
        }
        return f;
      })
    );
  };

  const deleteCheckout = async (id) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק רישום זה?")) return;
    const newCheckouts = checkouts.filter((c) => c.id !== id);
    setCheckouts(newCheckouts);
    try {
      await fetch(
        "https://plugat-kaf-default-rtdb.firebaseio.com/checkouts.json",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCheckouts),
        }
      );
    } catch (e) {
      console.error("Failed to delete checkout from Firebase:", e);
    }
  };

  const updateCheckout = async (id, field, value) => {
    const newCheckouts = checkouts.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    setCheckouts(newCheckouts);
    try {
      await fetch(
        "https://plugat-kaf-default-rtdb.firebaseio.com/checkouts.json",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCheckouts),
        }
      );
    } catch (e) {
      console.error("Failed to save update to cloud:", e);
    }
  };

  const addSpareEquipment = async (item) => {
    const newItem = { ...item, id: Date.now() };
    const newSpare = [...spareEquipment, newItem];
    setSpareEquipment(newSpare);
    try {
      await fetch(
        "https://plugat-kaf-default-rtdb.firebaseio.com/spareEquipment.json",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        }
      );
    } catch (e) {
      console.error("Failed to add spare equipment to Firebase:", e);
    }
  };

  const updateSpareEquipment = async (id, field, value) => {
    const newSpare = spareEquipment.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    setSpareEquipment(newSpare);
    const item = spareEquipment.find((s) => s.id === id);
    if (item && item.firebaseId) {
      try {
        await fetch(
          `https://plugat-kaf-default-rtdb.firebaseio.com/spareEquipment/${item.firebaseId}.json`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: value }),
          }
        );
      } catch (e) {
        console.error("Failed to update spare equipment in Firebase:", e);
      }
    }
  };

  const deleteSpareEquipment = async (id) => {
    if (!confirm("האם למחוק פריט זה?")) return;
    const item = spareEquipment.find((s) => s.id === id);
    if (item && item.firebaseId) {
      try {
        await fetch(
          `https://plugat-kaf-default-rtdb.firebaseio.com/spareEquipment/${item.firebaseId}.json`,
          { method: "DELETE" }
        );
      } catch (e) {
        console.error("Failed to delete spare equipment from Firebase:", e);
      }
    }
    setSpareEquipment(spareEquipment.filter((s) => s.id !== id));
  };

  const handleLogin = async () => {
    if (!passwordHash) return;
    setAuthError("");
    try {
      const enteredHash = await hashPassword(passwordInput);
      if (enteredHash === passwordHash) {
        setIsAuthenticated(true);
        setPasswordInput("");
        setAuthError("");
      } else {
        setAuthError("סיסמה שגויה");
      }
    } catch (e) {
      console.error("Error checking password:", e);
      setAuthError("שגיאה באימות הסיסמה");
    }
  };

  const updateFaultDescription = async (faultId, newDescription) => {
    const fault = faults.find((f) => f.id === faultId);
    if (fault && fault.firebaseId) {
      try {
        await fetch(
          `https://plugat-kaf-default-rtdb.firebaseio.com/faults/${fault.firebaseId}.json`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: newDescription }),
          }
        );
      } catch (e) {
        console.error("Failed to update fault description in Firebase:", e);
      }
    }
    setFaults(
      faults.map((f) =>
        f.id === faultId ? { ...f, description: newDescription } : f
      )
    );
  };

  if (!isAuthenticated) {
    return (
      <div
        className="container"
        style={{
          paddingTop: "4rem",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <div className="section">
          <h2 className="section-title" style={{ textAlign: "center" }}>
            כניסה למערכת
          </h2>
          <p style={{ textAlign: "center", marginBottom: "1rem" }}>
            הכנס סיסמה כדי להמשיך
          </p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "0.75rem",
              fontSize: "1rem",
              direction: "ltr",
            }}
          />
          {authError && (
            <div
              style={{
                color: "#d32f2f",
                marginBottom: "0.5rem",
                textAlign: "center",
              }}
            >
              {authError}
            </div>
          )}
          <button
            className="btn"
            style={{ width: "100%" }}
            onClick={handleLogin}
          >
            התחבר
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div className="logo-container">
          <img src={LOGO_SVG} alt="פלוגה כ׳" className="company-logo" />
          <div>
            <div className="header-title">פלוגה כ׳ גדוד 43</div>
            <div className="header-subtitle">יחד. בעוצמתנו.</div>
          </div>
        </div>
        <nav className="nav">
          <button
            className={`nav-btn ${currentView === "dashboard" ? "active" : ""}`}
            onClick={() => setCurrentView("dashboard")}
          >
            לוח בקרה
          </button>
          <button
            className={`nav-btn ${currentView === "spare" ? "active" : ""}`}
            onClick={() => setCurrentView("spare")}
          >
            ציוד ספייר
          </button>
          <button
            className={`nav-btn ${currentView === "links" ? "active" : ""}`}
            onClick={() => setCurrentView("links")}
          >
            קישורים
          </button>
          <button
            className={`nav-btn ${currentView === "report" ? "active" : ""}`}
            onClick={() => setCurrentView("report")}
          >
            דוח יומי
          </button>
          <button
            className={`nav-btn ${currentView === "faults" ? "active" : ""}`}
            onClick={() => setCurrentView("faults")}
          >
            תקלות ({faults.filter((f) => f.status === "pending").length})
          </button>
          <button
            className={`nav-btn ${currentView === "signatures" ? "active" : ""}`}
            onClick={() => setCurrentView("signatures")}
          >
            חתימות מול חטיבה
          </button>
        </nav>
      </header>

      <main className="container">
        {currentView === "dashboard" && (
          <DashboardView
            checkouts={checkouts}
            faults={faults}
            deleteCheckout={deleteCheckout}
            updateCheckout={updateCheckout}
          />
        )}
        {currentView === "spare" && (
          <SpareEquipmentView
            spareEquipment={spareEquipment}
            addSpareEquipment={addSpareEquipment}
            updateSpareEquipment={updateSpareEquipment}
            deleteSpareEquipment={deleteSpareEquipment}
          />
        )}
        {currentView === "links" && <LinksView />}
        {currentView === "report" && (
          <ReportView checkouts={checkouts} faults={faults} />
        )}
        {currentView === "faults" && (
          <FaultsView
            faults={faults}
            updateFaultStatus={updateFaultStatus}
            updateFaultDescription={updateFaultDescription}
            deleteFault={deleteFault}
          />
        )}
        {currentView === "signatures" && <SignaturesView />}
      </main>
    </div>
  );
}
