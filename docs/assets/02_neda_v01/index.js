import { i as initializeApp, g as getFirestore, a as getAuth, s as signInAnonymously, b as addDoc, c as collection, q as query, l as limit, d as getDocs, e as deleteDoc, f as doc, u as updateDoc } from "../vendor.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const firebaseConfig = {
  apiKey: "AIzaSyBcIrVmj3Cri7ZVymPeNPEsGD9piGuK2Os",
  authDomain: "weblevelzero.firebaseapp.com",
  projectId: "weblevelzero",
  storageBucket: "weblevelzero.firebasestorage.app",
  messagingSenderId: "166769008411",
  appId: "1:166769008411:web:e6a2f4ec5da2803b3c3dbe"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const STORAGE_KEYS = {
  name: "neda-display-name",
  deviceId: "neda-device-id"
};
const elements = {
  settingsPanel: document.getElementById("settingsPanel"),
  settingsToggle: document.getElementById("settingsToggle"),
  nameInput: document.getElementById("nameInput"),
  saveName: document.getElementById("saveName"),
  deviceIdBtn: document.getElementById("deviceIdBtn"),
  deviceIdDisplay: document.getElementById("deviceIdDisplay"),
  helloBtn: document.getElementById("helloBtn"),
  trebamBtn: document.getElementById("trebamBtn"),
  eraseBtn: document.getElementById("eraseBtn"),
  filterToggle: document.getElementById("filterToggle"),
  todoInput: document.getElementById("todoInput"),
  todoSuggestions: document.getElementById("todoSuggestions"),
  messagesList: document.getElementById("messagesList"),
  statusMessage: document.getElementById("statusMessage")
};
let showCompleted = false;
let todoDictionary = [];
function setStatus(message, type = "") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = "status-message";
  console.log(`Status: ${message} [${type}]`);
  if (type) {
    elements.statusMessage.classList.add(type);
  }
}
function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem(STORAGE_KEYS.deviceId);
  if (!deviceId) {
    deviceId = `device-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.deviceId, deviceId);
  }
  return deviceId;
}
function getName() {
  return localStorage.getItem(STORAGE_KEYS.name) || "Guest";
}
function computeInitials(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return "";
  }
  return words.map((word) => word[0].toLowerCase()).join("");
}
async function updateDeviceIdDisplay() {
  if (!elements.deviceIdDisplay) {
    return;
  }
  const deviceId = getOrCreateDeviceId();
  elements.deviceIdDisplay.value = deviceId;
  try {
    await navigator.clipboard.writeText(deviceId);
    console.log("Device ID auto-copied to clipboard");
  } catch (error) {
    console.log("Could not auto-copy to clipboard:", error);
  }
}
function saveName() {
  const value = elements.nameInput.value.trim() || "Guest";
  localStorage.setItem(STORAGE_KEYS.name, value);
  setStatus(`Name saved as ${value}`, "success");
  elements.settingsPanel.classList.add("hidden");
}
function renderMessages(messages) {
  elements.messagesList.innerHTML = "";
  if (!messages.length) {
    const emptyRow = document.createElement("li");
    emptyRow.className = "message-item";
    emptyRow.innerHTML = '<div class="message-text">No messages yet.</div>';
    elements.messagesList.appendChild(emptyRow);
    return;
  }
  for (const item of messages) {
    const entry = document.createElement("li");
    entry.className = "message-item";
    const time = item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown time";
    const text = item.text || "Message";
    const name = item.name || "Unknown";
    if (item.isTodo) {
      entry.innerHTML = `
        <div class="todo-row">
          <button class="todo-checkbox ${item.isComplete ? "checked" : ""}" data-id="${item.id}" type="button" aria-label="Toggle complete">${item.isComplete ? "&#10003;" : ""}</button>
          <div class="todo-body">
            <div class="message-meta">${name} • ${time}</div>
            <div class="message-text ${item.isComplete ? "completed" : ""}">${text}</div>
          </div>
        </div>
      `;
    } else {
      entry.innerHTML = `
        <div class="message-meta">${name} • ${time}</div>
        <div class="message-text">${text}</div>
      `;
    }
    elements.messagesList.appendChild(entry);
  }
  elements.messagesList.querySelectorAll(".todo-checkbox").forEach((btn) => {
    btn.addEventListener("click", () => toggleTodo(btn.dataset.id));
  });
}
function buildTodoDictionary(items) {
  const byText = /* @__PURE__ */ new Map();
  for (const item of items) {
    if (item.isTodo && item.text && !byText.has(item.text)) {
      byText.set(item.text, {
        text: item.text,
        initials: (item.initials || "").toLowerCase()
      });
    }
  }
  todoDictionary = Array.from(byText.values());
}
function hideSuggestions() {
  elements.todoSuggestions.classList.add("hidden");
  elements.todoSuggestions.innerHTML = "";
}
function renderSuggestions(matches) {
  elements.todoSuggestions.innerHTML = "";
  if (!matches.length) {
    hideSuggestions();
    return;
  }
  for (const match of matches) {
    const li = document.createElement("li");
    li.textContent = match;
    li.addEventListener("click", () => {
      elements.todoInput.value = match;
      hideSuggestions();
      elements.todoInput.focus();
    });
    elements.todoSuggestions.appendChild(li);
  }
  elements.todoSuggestions.classList.remove("hidden");
}
async function fetchAllItems() {
  const messagesQuery = query(
    collection(db, "neda_messages"),
    //orderBy('timestamp', 'desc'),
    limit(200)
  );
  const snapshot = await getDocs(messagesQuery);
  const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return items;
}
async function refreshMessages() {
  try {
    console.log("Fetching messages from Firestore...");
    const items = await fetchAllItems();
    console.log("Successfully loaded", items.length, "messages");
    buildTodoDictionary(items);
    const plain = items.filter((item) => !item.isTodo).slice(0, 10);
    const todos = items.filter((item) => item.isTodo && (showCompleted || !item.isComplete));
    const combined = [...plain, ...todos].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    renderMessages(combined);
  } catch (error) {
    console.error("Failed to load messages:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    setStatus("Could not load messages. Check Firebase setup.", "error");
  }
}
async function sendMessage(text, extra = {}) {
  const deviceId = getOrCreateDeviceId();
  const name = getName();
  console.log(`Attempting to send message from device ${deviceId} with name ${name}: "${text}"`);
  try {
    console.log("try");
    await addDoc(collection(db, "neda_messages"), {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      deviceId,
      name,
      text,
      initials: computeInitials(text),
      isTodo: false,
      isComplete: false,
      completedAt: null,
      ...extra
    });
    console.log("after try");
    setStatus("Message sent successfully.", "success");
    await refreshMessages();
    console.log("Message sent and messages refreshed.");
    await maybeClearMessages();
    console.log("Maybe clear done");
  } catch (error) {
    console.error("Write failed:", error);
    setStatus("Failed to send message. Check your Firebase connection and rules.", "error");
  }
}
async function maybeClearMessages() {
  try {
    const items = await fetchAllItems();
    const last10 = items.slice(0, 10);
    const eraseItems = last10.filter((item) => /ERASE/i.test(String(item.text || "")));
    const uniqueDeviceIds = new Set(eraseItems.map((item) => item.deviceId));
    const shouldClear = eraseItems.length >= 2 && uniqueDeviceIds.size >= 2;
    if (!shouldClear) {
      return;
    }
    const deletePromises = items.map((item) => deleteDoc(doc(db, "neda_messages", item.id)));
    await Promise.all(deletePromises);
    setStatus("Erase condition met. Messages cleared.", "success");
    await refreshMessages();
  } catch (error) {
    console.error("Erase check failed:", error);
    setStatus("Erase logic failed. Check your Firestore setup.", "error");
  }
}
async function toggleTodo(itemId) {
  try {
    const items = await fetchAllItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      return;
    }
    if (!item.isComplete) {
      await updateDoc(doc(db, "neda_messages", itemId), {
        isComplete: true,
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      const createdDay = item.timestamp ? new Date(item.timestamp).toDateString() : null;
      const completedDay = item.completedAt ? new Date(item.completedAt).toDateString() : null;
      if (createdDay && completedDay && createdDay === completedDay) {
        await updateDoc(doc(db, "neda_messages", itemId), {
          isComplete: false,
          completedAt: null
        });
      } else {
        await addDoc(collection(db, "neda_messages"), {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          deviceId: getOrCreateDeviceId(),
          name: getName(),
          text: item.text,
          isTodo: true,
          isComplete: false,
          completedAt: null
        });
      }
    }
    await refreshMessages();
  } catch (error) {
    console.error("Toggle todo failed:", error);
    setStatus("Failed to update todo item.", "error");
  }
}
function initializeUI() {
  const initialName = getName();
  elements.nameInput.value = initialName === "Guest" ? "" : initialName;
  elements.settingsToggle.addEventListener("click", () => {
    elements.settingsPanel.classList.toggle("hidden");
    if (!elements.settingsPanel.classList.contains("hidden")) {
      updateDeviceIdDisplay();
    }
  });
  elements.deviceIdBtn.addEventListener("click", async () => {
    const deviceId = getOrCreateDeviceId();
    elements.deviceIdDisplay.value = deviceId;
    try {
      await navigator.clipboard.writeText(deviceId);
      setStatus("Device ID copied to clipboard.", "success");
    } catch (error) {
      setStatus("Device ID ready to copy. Select it and copy manually.", "success");
      elements.deviceIdDisplay.focus();
      elements.deviceIdDisplay.select();
    }
  });
  updateDeviceIdDisplay();
  elements.saveName.addEventListener("click", saveName);
  elements.helloBtn.addEventListener("click", async () => {
    const name = getName();
    await sendMessage(`${name} says hello`);
  });
  elements.eraseBtn.addEventListener("click", async () => {
    const name = getName();
    await sendMessage(`${name} wants to ERASE`);
  });
  elements.trebamBtn.addEventListener("click", async () => {
    const text = elements.todoInput.value.trim();
    if (!text) {
      setStatus("Enter a todo item before tapping Trebam.", "error");
      return;
    }
    await sendMessage(text, { isTodo: true, isComplete: false, completedAt: null });
    elements.todoInput.value = "";
    hideSuggestions();
  });
  elements.todoInput.addEventListener("input", () => {
    const value = elements.todoInput.value.trim().toLowerCase();
    if (value.length < 2) {
      hideSuggestions();
      return;
    }
    const textMatches = todoDictionary.filter((item) => item.text.toLowerCase().includes(value)).sort((a, b) => a.text.toLowerCase().indexOf(value) - b.text.toLowerCase().indexOf(value));
    const initialsMatches = todoDictionary.filter((item) => item.initials && item.initials.includes(value)).sort((a, b) => a.initials.indexOf(value) - b.initials.indexOf(value));
    const seen = /* @__PURE__ */ new Set();
    const matches = [];
    for (const item of [...textMatches, ...initialsMatches]) {
      if (!seen.has(item.text)) {
        seen.add(item.text);
        matches.push(item.text);
      }
    }
    renderSuggestions(matches);
  });
  elements.filterToggle.addEventListener("click", async () => {
    showCompleted = !showCompleted;
    elements.filterToggle.classList.toggle("active", showCompleted);
    elements.filterToggle.setAttribute("aria-pressed", String(showCompleted));
    await refreshMessages();
  });
}
async function startApp() {
  var _a;
  try {
    setStatus("Initializing...", "");
    console.log("Starting app initialization...");
    console.log("Auth object:", auth);
    console.log("Database:", db);
    if ((_a = navigator.storage) == null ? void 0 : _a.persist) {
      navigator.storage.persist().then((granted) => {
        console.log("Persistent storage granted:", granted);
      });
    }
    signInAnonymously(auth).then((userCred) => {
      console.log("✓ Anonymous sign in successful:", userCred.user.uid);
      setStatus("Connected", "success");
    }).catch((authError) => {
      console.error("✗ Anonymous sign in failed:", authError.code, authError.message);
      setStatus(`Auth failed: ${authError.message}`, "error");
    });
    initializeUI();
    console.log("UI initialized");
    setTimeout(async () => {
      await refreshMessages();
    }, 1e3);
  } catch (error) {
    console.error("Failed to initialize app:", error);
    setStatus(`Failed to connect: ${error.message}`, "error");
  }
}
startApp();
