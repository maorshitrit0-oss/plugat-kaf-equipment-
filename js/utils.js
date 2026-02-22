// Hash password with SHA-256 (stored in Firebase as hash only)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const storage = {
  save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  load: (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
};

const initData = () => {
  if (!storage.load("checkouts")) storage.save("checkouts", []);
  if (!storage.load("faults")) storage.save("faults", []);
  if (!storage.load("spareEquipment")) storage.save("spareEquipment", []);
};
