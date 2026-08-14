import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const STORAGE_KEYS = {
  name: 'neda-display-name',
  deviceId: 'neda-device-id'
};

const elements = {
  settingsPanel: document.getElementById('settingsPanel'),
  settingsToggle: document.getElementById('settingsToggle'),
  nameInput: document.getElementById('nameInput'),
  saveName: document.getElementById('saveName'),
  deviceIdBtn: document.getElementById('deviceIdBtn'),
  helloBtn: document.getElementById('helloBtn'),
  eraseBtn: document.getElementById('eraseBtn'),
  messagesList: document.getElementById('messagesList'),
  statusMessage: document.getElementById('statusMessage')
};

function setStatus(message, type = '') {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = 'status-message';
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
  return localStorage.getItem(STORAGE_KEYS.name) || 'Guest';
}

function updateDeviceIdDisplay() {
  if (!elements.deviceIdDisplay) {
    return;
  }

  const deviceId = getOrCreateDeviceId();
  elements.deviceIdDisplay.value = deviceId;
}

function saveName() {
  const value = elements.nameInput.value.trim() || 'Guest';
  localStorage.setItem(STORAGE_KEYS.name, value);
  setStatus(`Name saved as ${value}`, 'success');
  elements.settingsPanel.classList.add('hidden');
}

/*
async function isDeviceAllowed(deviceId) {
  console.log('isDeviceAllowed');
  const allowedQuery = query(
    collection(db, 'neda_allowedDevices'),
    where('deviceId', '==', deviceId)
  );

  const snapshot = await getDocs(allowedQuery);
  return !snapshot.empty;
}
*/

function renderMessages(messages) {
  elements.messagesList.innerHTML = '';

  if (!messages.length) {
    const emptyRow = document.createElement('li');
    emptyRow.className = 'message-item';
    emptyRow.innerHTML = '<div class="message-text">No messages yet.</div>';
    elements.messagesList.appendChild(emptyRow);
    return;
  }

  for (const item of messages) {
    const entry = document.createElement('li');
    entry.className = 'message-item';

    const time = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown time';
    const text = item.text || 'Message';
    const name = item.name || 'Unknown';

    entry.innerHTML = `
      <div class="message-meta">${name} • ${time}</div>
      <div class="message-text">${text}</div>
    `;

    elements.messagesList.appendChild(entry);
  }
}

async function refreshMessages() {
  try {
    console.log('Fetching messages from Firestore...');
    const messagesQuery = query(
      collection(db, 'neda_messages'),
      //orderBy('timestamp', 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(messagesQuery);
    console.log('Successfully loaded', snapshot.docs.length, 'messages');
    const messages = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    renderMessages(messages);
  } catch (error) {
    console.error('Failed to load messages:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    setStatus('Could not load messages. Check Firebase setup.', 'error');
  }
}

async function sendMessage(text) {
  const deviceId = getOrCreateDeviceId();
  const name = getName();
  console.log(`Attempting to send message from device ${deviceId} with name ${name}: "${text}"`);

  // const allowed = await isDeviceAllowed(deviceId);
  // console.log(`Device ${deviceId} allowed status: ${allowed}`);

  // if (!allowed) {
  //   setStatus('This device is not allowed. Add it to neda_allowedDevices in Firestore.', 'error');
  //   return;
  // }

  try {
    console.log('try');
    await addDoc(collection(db, 'neda_messages'), {
      timestamp: new Date().toISOString(),
      deviceId,
      name,
      text
    });
    console.log('after try');

    setStatus('Message sent successfully.', 'success');
    await refreshMessages();
    console.log('Message sent and messages refreshed.');
    await maybeClearMessages();
    console.log('Maybe clear done');
  } catch (error) {
    console.error('Write failed:', error);
    setStatus('Failed to send message. Check your Firebase connection and rules.', 'error');
  }
}

async function maybeClearMessages() {
  try {
    const messagesQuery = query(
      collection(db, 'neda_messages'),
      //orderBy('timestamp', 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(messagesQuery);
    const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

    const eraseItems = items.filter((item) => /ERASE/i.test(String(item.text || '')));
    const uniqueDeviceIds = new Set(eraseItems.map((item) => item.deviceId));

    const shouldClear = eraseItems.length >= 2 && uniqueDeviceIds.size >= 2;

    if (!shouldClear) {
      return;
    }

    const deletePromises = items.map((item) => deleteDoc(doc(db, 'neda_messages', item.id)));
    await Promise.all(deletePromises);
    setStatus('Erase condition met. Messages cleared.', 'success');
    await refreshMessages();
  } catch (error) {
    console.error('Erase check failed:', error);
    setStatus('Erase logic failed. Check your Firestore setup.', 'error');
  }
}

function initializeUI() {
  const initialName = getName();
  elements.nameInput.value = initialName === 'Guest' ? '' : initialName;

  elements.settingsToggle.addEventListener('click', () => {
    elements.settingsPanel.classList.toggle('hidden');
  });

  elements.deviceIdBtn.addEventListener('click', async () => {
    const deviceId = getOrCreateDeviceId();
    elements.deviceIdDisplay.value = deviceId;

    try {
      await navigator.clipboard.writeText(deviceId);
      setStatus('Device ID copied to clipboard.', 'success');
    } catch (error) {
      setStatus('Device ID ready to copy. Select it and copy manually.', 'success');
      elements.deviceIdDisplay.focus();
      elements.deviceIdDisplay.select();
    }
  });

  updateDeviceIdDisplay();
  elements.saveName.addEventListener('click', saveName);

  elements.helloBtn.addEventListener('click', async () => {
    const name = getName();
    await sendMessage(`${name} says hello`);
  });

  elements.eraseBtn.addEventListener('click', async () => {
    const name = getName();
    await sendMessage(`${name} wants to ERASE`);
  });
}

async function startApp() {
  try {
    setStatus('Initializing...', '');
    console.log('Starting app initialization...');
    console.log('Auth object:', auth);
    console.log('Database:', db);
    
    // Try to sign in anonymously
    signInAnonymously(auth).then(userCred => {
      console.log('✓ Anonymous sign in successful:', userCred.user.uid);
      setStatus('Connected', 'success');
    }).catch(authError => {
      console.error('✗ Anonymous sign in failed:', authError.code, authError.message);
      setStatus(`Auth failed: ${authError.message}`, 'error');
    });
    
    initializeUI();
    console.log('UI initialized');
    
    // Give auth a moment to complete, then try to load messages
    setTimeout(async () => {
      await refreshMessages();
    }, 1000);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    setStatus(`Failed to connect: ${error.message}`, 'error');
  }
}

startApp();

