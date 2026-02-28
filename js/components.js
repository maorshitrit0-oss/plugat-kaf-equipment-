const { useState, useEffect, useRef } = React;

function EditableCell({ value, onChange, type = "text" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  if (!isEditing) {
    return (
      <td
        className="editable-cell"
        onClick={() => {
          setTempValue(value);
          setIsEditing(true);
        }}
        style={{ cursor: "pointer" }}
      >
        {value || "-"}
      </td>
    );
  }

  return (
    <td>
      <input
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={() => {
          if (tempValue !== value) {
            onChange(tempValue);
          }
          setIsEditing(false);
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            if (tempValue !== value) {
              onChange(tempValue);
            }
            setIsEditing(false);
          }
        }}
        autoFocus
        style={{
          width: "100%",
          padding: "0.25rem",
          border: "2px solid #2c5f2d",
          borderRadius: "4px",
        }}
      />
    </td>
  );
}

function BoolCell({ value, onChange }) {
  const isTrue = !!value;
  const display = isTrue ? "✓" : "✗";
  const color = isTrue ? "#2e7d32" : "#d32f2f";

  return (
    <td
      className="editable-cell"
      onClick={() => onChange(!isTrue)}
      style={{
        cursor: "pointer",
        textAlign: "center",
        fontWeight: "bold",
        color,
      }}
    >
      {display}
    </td>
  );
}

function DashboardView({
  checkouts,
  faults,
  deleteCheckout,
  updateCheckout,
}) {
  const totalSoldiers = checkouts.length;
  const pendingFaults = faults.filter((f) => f.status === "pending").length;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">סה״כ חיילים</div>
          <div className="stat-value">{totalSoldiers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">תקלות פתוחות</div>
          <div
            className="stat-value"
            style={{
              color: pendingFaults > 0 ? "#d32f2f" : "#4caf50",
            }}
          >
            {pendingFaults}
          </div>
        </div>
      </div>

      {UNITS.map((unitName) => {
        const unitSoldiers = checkouts.filter((c) => c.unit === unitName);
        if (unitSoldiers.length === 0) return null;

        return (
          <div key={unitName} className="section">
            <h2 className="section-title">{unitName}</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>תפקיד</th>
                    <th>שם</th>
                    <th>מ.א</th>
                    <th>624</th>
                    <th>ליונט</th>
                    <th>מטען</th>
                    <th>מעד</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {unitSoldiers.map((soldier) => (
                    <tr key={soldier.id}>
                      <EditableCell
                        value={soldier.role || ""}
                        onChange={(val) =>
                          updateCheckout(soldier.id, "role", val)
                        }
                      />
                      <EditableCell
                        value={soldier.soldierName}
                        onChange={(val) =>
                          updateCheckout(soldier.id, "soldierName", val)
                        }
                      />
                      <EditableCell
                        value={soldier.soldierId}
                        onChange={(val) =>
                          updateCheckout(soldier.id, "soldierId", val)
                        }
                      />
                      <BoolCell
                        value={soldier.equipment?.["radio624"]}
                        onChange={(val) => {
                          const newEquipment = {
                            ...(soldier.equipment || {}),
                            radio624: val,
                          };
                          updateCheckout(
                            soldier.id,
                            "equipment",
                            newEquipment
                          );
                        }}
                      />
                      <EditableCell
                        value={
                          soldier.equipment?.lionet?.serialNumber || ""
                        }
                        onChange={(val) => {
                          const newEquipment = {
                            ...(soldier.equipment || {}),
                            lionet: val ? { serialNumber: val } : null,
                          };
                          updateCheckout(
                            soldier.id,
                            "equipment",
                            newEquipment
                          );
                        }}
                      />
                      <BoolCell
                        value={soldier.equipment?.charger}
                        onChange={(val) => {
                          const newEquipment = {
                            ...(soldier.equipment || {}),
                            charger: val,
                          };
                          updateCheckout(
                            soldier.id,
                            "equipment",
                            newEquipment
                          );
                        }}
                      />
                      <BoolCell
                        value={soldier.equipment?.vest}
                        onChange={(val) => {
                          const newEquipment = {
                            ...(soldier.equipment || {}),
                            vest: val,
                          };
                          updateCheckout(
                            soldier.id,
                            "equipment",
                            newEquipment
                          );
                        }}
                      />
                      <td>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => deleteCheckout(soldier.id)}
                        >
                          מחק
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {checkouts.length === 0 && (
        <div className="section">
          <p
            style={{
              textAlign: "center",
              color: "#666",
              padding: "2rem",
            }}
          >
            עדיין לא נרשמו חיילים. שתף את הקישורים מהעמוד "קישורים"
          </p>
        </div>
      )}
    </div>
  );
}

function SpareEquipmentView({
  spareEquipment,
  addSpareEquipment,
  updateSpareEquipment,
  deleteSpareEquipment,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    type: "",
    quantity: "",
    notes: "",
  });

  const handleAdd = () => {
    if (!newItem.type || !newItem.quantity) {
      alert("אנא מלא את כל השדות");
      return;
    }
    addSpareEquipment(newItem);
    setNewItem({ type: "", quantity: "", notes: "" });
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="section">
        <h2 className="section-title">ציוד ספייר</h2>

        <button
          className="btn"
          onClick={() => setShowAddForm(true)}
          style={{ marginBottom: "1rem" }}
        >
          + הוסף ציוד ספייר
        </button>

        {showAddForm && (
          <div
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          >
            <div className="form-group">
              <label>סוג ציוד</label>
              <input
                value={newItem.type}
                onChange={(e) =>
                  setNewItem({ ...newItem, type: e.target.value })
                }
                placeholder="לדוגמא: קשר 624, סוללה, אנטנה..."
              />
            </div>
            <div className="form-group">
              <label>כמות</label>
              <input
                type="number"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>הערות</label>
              <input
                value={newItem.notes}
                onChange={(e) =>
                  setNewItem({ ...newItem, notes: e.target.value })
                }
                placeholder="מיקום, מספר סידורי וכו׳"
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn" onClick={handleAdd}>
                שמור
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                ביטול
              </button>
            </div>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>סוג ציוד</th>
                <th>כמות</th>
                <th>הערות</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {spareEquipment.map((item) => (
                <SpareEquipmentRow
                  key={item.id}
                  item={item}
                  updateSpareEquipment={updateSpareEquipment}
                  deleteSpareEquipment={deleteSpareEquipment}
                />
              ))}
              {spareEquipment.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      color: "#666",
                      padding: "2rem",
                    }}
                  >
                    עדיין לא נוסף ציוד ספייר
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SpareEquipmentRow({
  item,
  updateSpareEquipment,
  deleteSpareEquipment,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(item);

  const handleSave = () => {
    updateSpareEquipment(item.id, "type", editData.type);
    updateSpareEquipment(item.id, "quantity", editData.quantity);
    updateSpareEquipment(item.id, "notes", editData.notes);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr>
        <td>
          <input
            value={editData.type}
            onChange={(e) =>
              setEditData({ ...editData, type: e.target.value })
            }
          />
        </td>
        <td>
          <input
            type="number"
            value={editData.quantity}
            onChange={(e) =>
              setEditData({ ...editData, quantity: e.target.value })
            }
          />
        </td>
        <td>
          <input
            value={editData.notes}
            onChange={(e) =>
              setEditData({ ...editData, notes: e.target.value })
            }
          />
        </td>
        <td>
          <button className="btn btn-small" onClick={handleSave}>
            שמור
          </button>
          <button
            className="btn btn-secondary btn-small"
            onClick={() => setIsEditing(false)}
          >
            ביטול
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{item.type}</td>
      <td>{item.quantity}</td>
      <td>{item.notes || "-"}</td>
      <td>
        <button
          className="btn btn-small"
          onClick={() => setIsEditing(true)}
        >
          ערוך
        </button>
        <button
          className="btn btn-danger btn-small"
          onClick={() => deleteSpareEquipment(item.id)}
        >
          מחק
        </button>
      </td>
    </tr>
  );
}

function LinksView() {
  const [alert, setAlert] = useState(null);
  const baseUrl = window.location.href.replace(/\/[^/]*$/, "/");

  const signupUrl = baseUrl + "soldier-signup.html";
  const faultUrl = baseUrl + "fault-report.html";
  const managerUrl = baseUrl + "equipment-manager-main.html";

  const copyLink = (url, type) => {
    navigator.clipboard.writeText(url);
    setAlert({ type: "success", message: `קישור ${type} הועתק!` });
    setTimeout(() => setAlert(null), 2000);
  };

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      <div className="section">
        <h2 className="section-title">קישורים</h2>

        <div className="link-box">
          <div className="link-header">📝 טופס חתימה על ציוד</div>
          <p
            style={{
              color: "#666",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            לחיילים - למלא ולחתום על הציוד
          </p>
          <div className="link-url">
            <input
              type="text"
              value={signupUrl}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <button
              className="btn"
              onClick={() => copyLink(signupUrl, "חתימה")}
            >
              📋 העתק
            </button>
          </div>
        </div>

        <div className="link-box">
          <div className="link-header">⚠️ טופס דיווח תקלות</div>
          <p
            style={{
              color: "#666",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            לחיילים - לדווח על תקלות בציוד
          </p>
          <div className="link-url">
            <input
              type="text"
              value={faultUrl}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <button
              className="btn"
              onClick={() => copyLink(faultUrl, "תקלות")}
            >
              📋 העתק
            </button>
          </div>
        </div>

        <div className="link-box">
          <div className="link-header">🎯 מערכת ניהול ציוד</div>
          <p
            style={{
              color: "#666",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            למפקד - גישה למערכת הניהול
          </p>
          <div className="link-url">
            <input
              type="text"
              value={managerUrl}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <button
              className="btn"
              onClick={() => copyLink(managerUrl, "ניהול")}
            >
              📋 העתק
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportView({ checkouts, faults }) {
  const generateLiveText = () => {
    let r = "דוח צ\n*פלוגה כ׳*\n\n";
    r +=
      "חפק:\nמשואה: [מספר סידורי]\nכרטיס: [מספר סידורי]\nמשיב מיקום: [מספר סידורי]\n\n";
    r +=
      "סיור:\nמשואה: קיים במשקשיה\nכרטיס: קיים במשקשיה\nמשיב מיקום: קיים במשקשיה\n\n";
    r += "חמל:\nכרטיס מחשב משואה: [מספר סידורי]\n\n";
    r +=
      "משרד מ״פ:\nכרטיס מחשב משואה: [מספר סידורי]\nכרטיס מחשב מנהלתי: [מספר סידורי]\n\n";
    r += "חדן:\nמשיב מיקום: [מספר סידורי]\nכרטיס: [מספר סידורי]\n\n";

    const hasLionet = (c) => c.equipment?.lionet?.serialNumber;
    const lionetSerial = (s) => s.equipment?.lionet?.serialNumber || "—";
    const rolesWithLabel = ["מפ", "סמפ", "קשר מפ", "קשר סמפ", "ממ", "קמבצ", "חמל"];
    const showRoleAndNumber = (role) => rolesWithLabel.includes(role);

    r += "ליונטים:\n";
    const orderPlatoon = ["מפ", "סמפ", "קשר מפ", "קשר סמפ"];
    orderPlatoon.forEach((role) => {
      checkouts
        .filter((c) => hasLionet(c) && c.role === role)
        .forEach((s) => {
          r += `${s.role} ${lionetSerial(s)}\n`;
        });
    });
    r += "\n";

    UNITS.filter((u) => u.includes("מחלקה")).forEach((unitName) => {
      const squad = checkouts.filter(
        (c) => c.unit === unitName && hasLionet(c)
      );
      if (squad.length > 0) {
        r += `${unitName}:\n`;
        squad.forEach((s) => {
          r += showRoleAndNumber(s.role)
            ? `${s.role} ${lionetSerial(s)}\n`
            : `${lionetSerial(s)}\n`;
        });
        r += "\n";
      }
    });

    const hamalSquad = checkouts.filter(
      (c) => c.unit === "חמל" && hasLionet(c)
    );
    if (hamalSquad.length > 0) {
      r += "חמל:\n";
      hamalSquad.forEach((s) => {
        r += `חמל ${lionetSerial(s)}\n`;
      });
      r += "\n";
    }

    const pendingFaults = faults.filter((f) => f.status === "pending");
    r += "תקלות פתוחות:\n";
    if (pendingFaults.length === 0) {
      r += "אין תקלות פתוחות\n";
    } else {
      pendingFaults.forEach((f, index) => {
        const desc = f.description || "ללא תיאור";
        r += `${index + 1}. ${desc}\n`;
      });
    }
    return r;
  };

  const [reportContent, setReportContent] = useState(generateLiveText);
  const [isEditing, setIsEditing] = useState(false);
  const [lastAutoGenerated, setLastAutoGenerated] = useState("");

  useEffect(() => {
    const liveText = generateLiveText();

    if (!isEditing && liveText !== lastAutoGenerated) {
      setReportContent(liveText);
      setLastAutoGenerated(liveText);
    }
  }, [checkouts, faults, isEditing]);

  const saveManualEdit = () => {
    setIsEditing(false);
    alert("✓ השינויים הידניים נשמרו (מקומית בלבד)");
  };

  return (
    <div>
      <div className="section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          <h2 className="section-title" style={{ margin: 0 }}>
            דוח יומי
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {!isEditing ? (
              <>
                <button
                  className="btn"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ עריכה ידנית
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    navigator.clipboard.writeText(reportContent);
                    alert("✓ הדוח הועתק");
                  }}
                >
                  📋 העתק
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn"
                  onClick={saveManualEdit}
                  style={{ background: "#4caf50" }}
                >
                  💾 שמור שינויים
                </button>
                <button
                  className="btn"
                  onClick={() => setIsEditing(false)}
                  style={{ background: "#999" }}
                >
                  ✕ ביטול
                </button>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            background: isEditing ? "#fff3e0" : "#e8f5e9",
            padding: "0.5rem",
            borderRadius: "4px",
            fontSize: "0.8rem",
            marginBottom: "1rem",
            color: isEditing ? "#ef6c00" : "#2e7d32",
            fontWeight: "bold",
          }}
        >
          {isEditing
            ? "✍️ מצב עריכה ידנית - הסנכרון האוטומטי מושהה"
            : "⚡ סנכרון חי פעיל - כל שינוי בציוד מעדכן את הדוח"}
        </div>

        {!isEditing ? (
          <div className="report-preview">{reportContent}</div>
        ) : (
          <textarea
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            style={{
              width: "100%",
              minHeight: "500px",
              padding: "1rem",
              fontFamily: "monospace",
              fontSize: "1rem",
              border: "2px solid #ef6c00",
              borderRadius: "4px",
              direction: "rtl",
            }}
          />
        )}
      </div>
    </div>
  );
}

function FaultsView({
  faults,
  updateFaultStatus,
  updateFaultDescription,
  deleteFault,
}) {
  const pending = faults.filter((f) => f.status === "pending");
  const resolved = faults.filter((f) => f.status === "resolved");

  const formatDate = (d) => {
    return new Date(d).toLocaleString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (d) => {
    const diff = Date.now() - new Date(d);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins} דקות`;
    if (hours < 24) return `${hours} שעות`;
    return `${days} ימים`;
  };

  return (
    <div>
      <div className="section">
        <h2 className="section-title">תקלות פתוחות ({pending.length})</h2>
        {pending.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#4caf50",
              padding: "2rem",
            }}
          >
            ✓ אין תקלות פתוחות
          </p>
        ) : (
          pending.map((f) => (
            <div key={f.id} className="fault-item">
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>{f.soldierName}</strong> - {f.unit}
                {f.role && <span> ({f.role})</span>}
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                מ.א: {f.soldierId}
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>ציוד:</strong> {f.equipmentType}
                {f.otherLocation && <span> - {f.otherLocation}</span>}
              </div>
              <FaultDescription
                fault={f}
                onUpdate={updateFaultDescription}
              />
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#666",
                  marginBottom: "0.25rem",
                }}
              >
                📅 נפתח: {formatDate(f.date)}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#d32f2f",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                ⏱️ לפני {getTimeAgo(f.date)}
              </div>
              <button
                className="btn"
                onClick={() => updateFaultStatus(f.id, "resolved")}
              >
                ✓ סמן כטופל
              </button>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <h2 className="section-title">
          תקלות שטופלו ({resolved.length})
        </h2>
        {resolved.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#999",
              padding: "2rem",
            }}
          >
            אין תקלות שטופלו
          </p>
        ) : (
          resolved
            .slice()
            .reverse()
            .map((f) => (
              <div key={f.id} className="fault-item fault-resolved">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>{f.soldierName}</strong> - {f.unit}
                      {f.role && <span> ({f.role})</span>}
                    </div>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>ציוד:</strong> {f.equipmentType}
                      {f.otherLocation && (
                        <span> - {f.otherLocation}</span>
                      )}
                    </div>
                    <div
                      style={{
                        background: "white",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        marginBottom: "0.5rem",
                        fontSize: "0.95rem",
                      }}
                    >
                      {f.description}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      📅 נפתח: {formatDate(f.date)}
                    </div>
                    {f.resolvedDate && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#4caf50",
                          fontWeight: "600",
                        }}
                      >
                        ✓ טופל: {formatDate(f.resolvedDate)}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      className="btn"
                      onClick={() => updateFaultStatus(f.id, "pending")}
                      style={{ background: "#ff9800" }}
                    >
                      ↩️ החזר לפתוח
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteFault(f.id)}
                    >
                      🗑️ מחק תקלה
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function FaultDescription({ fault, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(fault.description);

  if (isEditing) {
    return (
      <div style={{ marginBottom: "0.5rem" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            onUpdate(fault.id, text);
            setIsEditing(false);
          }}
          autoFocus
          style={{
            width: "100%",
            padding: "0.5rem",
            fontFamily: "inherit",
            border: "2px solid #2c5f2d",
            borderRadius: "4px",
            direction: "rtl",
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        setText(fault.description);
        setIsEditing(true);
      }}
      style={{
        background: "white",
        padding: "0.5rem",
        borderRadius: "4px",
        marginBottom: "0.5rem",
        cursor: "pointer",
        border: "1px dashed #ccc",
      }}
    >
      {fault.description || "(לחץ להוספת תיאור)"} ✏️
    </div>
  );
}

function SignaturesView() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [gdudSignatures, setGdudSignatures] = useState([]);
  const [isGdudLoading, setIsGdudLoading] = useState(true);
  const [gdudEquipment, setGdudEquipment] = useState("");
  const [gdudQuantity, setGdudQuantity] = useState("");
  const [submittingGdud, setSubmittingGdud] = useState(false);

  useEffect(() => {
    const loadGdud = async () => {
      try {
        const res = await fetch("https://plugat-kaf-default-rtdb.firebaseio.com/gdudSignatures.json");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const arr = Object.keys(data).map(key => ({
              ...data[key],
              firebaseId: key
            }));
            setGdudSignatures(arr.sort((a, b) => b.timestamp - a.timestamp));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsGdudLoading(false);
      }
    };
    loadGdud();
  }, []);

  const handleGdudSubmit = async (e) => {
    e.preventDefault();
    if (!gdudEquipment.trim() || !gdudQuantity.trim()) return;
    setSubmittingGdud(true);
    const newItem = {
      equipmentType: gdudEquipment.trim(),
      quantity: gdudQuantity.trim(),
      timestamp: Date.now(),
    };
    try {
      const res = await fetch(
        "https://plugat-kaf-default-rtdb.firebaseio.com/gdudSignatures.json",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        }
      );
      const data = await res.json();
      setGdudSignatures((prev) => [{ ...newItem, firebaseId: data.name }, ...prev]);
      setGdudEquipment("");
      setGdudQuantity("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingGdud(false);
    }
  };

  const deleteGdudRow = async (item) => {
    if (!confirm("למחוק חתימה זו מול הגדוד?")) return;
    try {
      await fetch(
        `https://plugat-kaf-default-rtdb.firebaseio.com/gdudSignatures/${item.firebaseId}.json`,
        { method: "DELETE" }
      );
      setGdudSignatures((prev) => prev.filter((i) => i.firebaseId !== item.firebaseId));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch(
          "https://plugat-kaf-default-rtdb.firebaseio.com/signatureImages.json"
        );
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const arr = Object.keys(data).map((key) => ({
              ...data[key],
              firebaseId: key,
            }));
            setImages(arr.sort((a, b) => b.timestamp - a.timestamp));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [showCamera, stream]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = async (ev) => {
          const base64 = ev.target.result;
          const newItem = {
            base64,
            name: file.name,
            timestamp: Date.now(),
          };
          try {
            const res = await fetch(
              "https://plugat-kaf-default-rtdb.firebaseio.com/signatureImages.json",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem),
              }
            );
            const data = await res.json();
            setImages((prev) => [
              { ...newItem, firebaseId: data.name },
              ...prev,
            ]);
          } catch (err) {
            console.error(err);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
    e.target.value = "";
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      document.getElementById("fallback-camera-input").click();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.8);
    stream.getTracks().forEach((t) => t.stop());
    setShowCamera(false);
    setStream(null);
    const newItem = {
      base64,
      name: `photo_${Date.now()}.jpg`,
      timestamp: Date.now(),
    };
    setUploading(true);
    fetch(
      "https://plugat-kaf-default-rtdb.firebaseio.com/signatureImages.json",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      }
    )
      .then((r) => r.json())
      .then((data) => {
        setImages((prev) => [
          { ...newItem, firebaseId: data.name },
          ...prev,
        ]);
        setUploading(false);
      });
  };

  const closeCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setShowCamera(false);
    setStream(null);
  };

  const deleteImage = async (img) => {
    if (!confirm("למחוק תמונה זו?")) return;
    try {
      await fetch(
        `https://plugat-kaf-default-rtdb.firebaseio.com/signatureImages/${img.firebaseId}.json`,
        { method: "DELETE" }
      );
      setImages((prev) =>
        prev.filter((i) => i.firebaseId !== img.firebaseId)
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="section">
        <h2 className="section-title">חתימות מול חטיבה</h2>

        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <label
            style={{
              display: "inline-block",
              background: "#2c5f2d",
              color: "white",
              padding: "0.7rem 1.5rem",
              borderRadius: "6px",
              cursor: uploading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "0.95rem",
              opacity: uploading ? 0.7 : 1,
            }}
          >
            📁 העלאת תמונות
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              style={{ display: "none" }}
              disabled={uploading}
            />
          </label>

          {uploading && (
            <span
              style={{ color: "#2c5f2d", fontWeight: "600" }}
            >
              ⏳ מעלה...
            </span>
          )}
        </div>

        <video ref={videoRef} style={{ display: "none" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <input
          id="fallback-camera-input"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: "none" }}
        />

        {isLoading ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            טוען תמונות...
          </p>
        ) : images.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#999",
              padding: "2rem",
            }}
          >
            עדיין לא הועלו תמונות חתימות
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {images.map((img) => (
              <div
                key={img.firebaseId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                }}
              >
                <img
                  src={img.base64}
                  alt={img.name}
                  style={{
                    width: "100%",
                    display: "block",
                    cursor: "pointer",
                    maxHeight: "250px",
                    objectFit: "contain",
                  }}
                  onClick={() => setSelectedImage(img)}
                />
                <div
                  style={{
                    padding: "0.5rem 0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #eee",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(img.timestamp).toLocaleDateString("he-IL")} —{" "}
                    {img.name}
                  </span>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => deleteImage(img)}
                  >
                    מחק
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">חתימות מול הגדוד</h2>

        <form
          onSubmit={handleGdudSubmit}
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "flex-end",
            marginBottom: "1.5rem",
            background: "#f9f9f9",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1, minWidth: "180px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444" }}>
              סוג ציוד
            </label>
            <input
              type="text"
              value={gdudEquipment}
              onChange={(e) => setGdudEquipment(e.target.value)}
              placeholder="הזן סוג ציוד..."
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1, minWidth: "180px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444" }}>
              כמות
            </label>
            <input
              type="number"
              value={gdudQuantity}
              onChange={(e) => setGdudQuantity(e.target.value)}
              placeholder="הזן כמות..."
              min="1"
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submittingGdud || !gdudEquipment.trim() || !gdudQuantity.trim()}
            style={{
              background: "#2c5f2d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.6rem 1.5rem",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: submittingGdud ? "not-allowed" : "pointer",
              opacity: submittingGdud ? 0.7 : 1,
              height: "38px",
            }}
          >
            {submittingGdud ? "⏳ שומר..." : "➕ הוסף"}
          </button>
        </form>

        {isGdudLoading ? (
          <p style={{ textAlign: "center", color: "#666" }}>טוען חתימות...</p>
        ) : gdudSignatures.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
            עדיין לא נוספו חתימות מול הגדוד
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#2c5f2d", color: "white" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>#</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>סוג ציוד</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>כמות</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>תאריך</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {gdudSignatures.map((item, index) => (
                  <tr
                    key={item.firebaseId}
                    style={{
                      background: index % 2 === 0 ? "white" : "#f5f5f5",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <td style={{ padding: "0.7rem 1rem", color: "#888" }}>{index + 1}</td>
                    <td style={{ padding: "0.7rem 1rem", fontWeight: "600" }}>{item.equipmentType}</td>
                    <td style={{ padding: "0.7rem 1rem" }}>{item.quantity}</td>
                    <td style={{ padding: "0.7rem 1rem", color: "#666", fontSize: "0.85rem" }}>
                      {new Date(item.timestamp).toLocaleDateString("he-IL")}
                    </td>
                    <td style={{ padding: "0.7rem 1rem" }}>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => deleteGdudRow(item)}
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCamera && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "black",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              maxHeight: "80vh",
              display: "block",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={capturePhoto}
              style={{
                background: "white",
                color: "black",
                padding: "1rem 2rem",
                borderRadius: "50px",
                fontSize: "1.2rem",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              📸 צלם
            </button>
            <button
              onClick={closeCamera}
              style={{
                background: "#d32f2f",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "50px",
                fontSize: "1.2rem",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              ✕ ביטול
            </button>
          </div>
        </div>
      )}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <img
            src={selectedImage.base64}
            alt={selectedImage.name}
            style={{
              maxWidth: "95vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ color: "white", fontSize: "0.9rem" }}>
              {selectedImage.name} — {new Date(selectedImage.timestamp).toLocaleDateString("he-IL")}
            </span>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                background: "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: "50px",
                padding: "0.5rem 1.2rem",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "1rem",
              }}
            >
              ✕ סגור
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmdotsView() {
  const [amadot, setAmadot] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [amada, setAmada] = useState("");
  const [sogHaציוד, setSogHaציוד] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "https://plugat-kaf-default-rtdb.firebaseio.com/amadot.json"
        );
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const arr = Object.keys(data).map((key) => ({
              ...data[key],
              firebaseId: key,
            }));
            setAmadot(arr.sort((a, b) => b.timestamp - a.timestamp));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amada.trim() || !sogHaציוד.trim()) return;
    setSubmitting(true);
    const newItem = {
      amada: amada.trim(),
      sogHaציוד: sogHaציוד.trim(),
      timestamp: Date.now(),
    };
    try {
      const res = await fetch(
        "https://plugat-kaf-default-rtdb.firebaseio.com/amadot.json",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        }
      );
      const data = await res.json();
      setAmadot((prev) => [{ ...newItem, firebaseId: data.name }, ...prev]);
      setAmada("");
      setSogHaציוד("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRow = async (item) => {
    if (!confirm("למחוק שורה זו?")) return;
    try {
      await fetch(
        `https://plugat-kaf-default-rtdb.firebaseio.com/amadot/${item.firebaseId}.json`,
        { method: "DELETE" }
      );
      setAmadot((prev) => prev.filter((i) => i.firebaseId !== item.firebaseId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="section">
        <h2 className="section-title">עמדות</h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "flex-end",
            marginBottom: "1.5rem",
            background: "#f9f9f9",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1, minWidth: "180px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444" }}>
              עמדה / פילובוקס
            </label>
            <input
              type="text"
              value={amada}
              onChange={(e) => setAmada(e.target.value)}
              placeholder="הזן עמדה או פילובוקס..."
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1, minWidth: "180px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444" }}>
              סוג הציוד
            </label>
            <input
              type="text"
              value={sogHaציוד}
              onChange={(e) => setSogHaציוד(e.target.value)}
              placeholder="הזן סוג ציוד..."
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !amada.trim() || !sogHaציוד.trim()}
            style={{
              background: "#2c5f2d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.6rem 1.5rem",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              height: "38px",
            }}
          >
            {submitting ? "⏳ שומר..." : "➕ הוסף"}
          </button>
        </form>

        {/* Table */}
        {isLoading ? (
          <p style={{ textAlign: "center", color: "#666" }}>טוען...</p>
        ) : amadot.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
            עדיין לא נוספו עמדות
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#2c5f2d", color: "white" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>#</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>עמדה / פילובוקס</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>סוג הציוד</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>תאריך</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600" }}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {amadot.map((item, index) => (
                  <tr
                    key={item.firebaseId}
                    style={{
                      background: index % 2 === 0 ? "white" : "#f5f5f5",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <td style={{ padding: "0.7rem 1rem", color: "#888" }}>{index + 1}</td>
                    <td style={{ padding: "0.7rem 1rem", fontWeight: "600" }}>{item.amada}</td>
                    <td style={{ padding: "0.7rem 1rem" }}>{item.sogHaציוד}</td>
                    <td style={{ padding: "0.7rem 1rem", color: "#666", fontSize: "0.85rem" }}>
                      {new Date(item.timestamp).toLocaleDateString("he-IL")}
                    </td>
                    <td style={{ padding: "0.7rem 1rem" }}>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => deleteRow(item)}
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}