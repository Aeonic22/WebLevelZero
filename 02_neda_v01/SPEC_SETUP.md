# SPEC_SETUP

## 1. Setup phase objective

Prepare the Neda prototype for implementation by creating the minimal online backend and project structure needed to support a simple family messaging app.

This file provides the detailed technical checklist for the Firebase setup path.

---

## 2. Chosen architecture

- Frontend: static HTML + CSS + JavaScript
- Backend: Firebase Firestore
- Hosting: Firebase Hosting (recommended for static web app)
- Auth model: manual device allowlist, no full user management
- Identity approach: device ID is the operational identity; user-entered name is display-only text
- Testing: browser-based validation on one laptop first

---

## 3. Required tools

### For project setup

- Node.js (recommended LTS)
- npm
- Optional: Firebase CLI
- Optional: VS Code or any editor

### For browser testing

- One laptop
- Two different browser profiles or tabs for simulating multiple users/devices during testing

---

## 4. Firebase setup checklist

### Step 1: Create a Firebase project

- [x] Go to Firebase Console
- [x] Create a new project named something like "neda-family-prototype"
- [x] Accept the default settings unless a specific requirement exists

### Step 2: Add a web app

- [x] Register a web app inside the Firebase project
- [ ] Copy the Firebase config values
- [ ] Save them in a frontend config file or JS module

### Step 3: Enable Firestore

- [ ] Open Firestore Database
- [ ] Create a database in test mode for prototype development
- [ ] Choose a region close to the expected users

### Step 4: Create the required collections

- [ ] Create a collection called `messages`
- [ ] Create a collection called `allowedDevices`

### Step 5: Define the document schema

#### `messages` document schema

Each message document should include:

- `timestamp` (string or number, ISO timestamp recommended)
- `deviceId` (string)
- `name` (string)
- `text` (string)
- optional `createdAt` (server timestamp if available)

Example:

```json
{
  "timestamp": "2026-08-12T14:22:00.000Z",
  "deviceId": "device-001",
  "name": "Alice",
  "text": "Alice says hello"
}
```

#### `allowedDevices` document schema

Each device record should include:

- `deviceId` (string)
- `passkey` (string, optional but useful for verification)
- `label` (string, optional)
- `createdAt` (optional)

Example:

```json
{
  "deviceId": "device-001",
  "passkey": "family-pass-001",
  "label": "Alice phone",
  "createdAt": "2026-08-12T12:00:00.000Z"
}
```

### Step 6: Set up rules

For the prototype, start with simple rules for development.

Recommended approach:

- allow read access to `messages`
- allow write access only to known devices
- allow read access to `allowedDevices` only for validation logic or admin usage if needed

Example rule direction (conceptual, not production-grade):

- allow create on `messages` only if the request contains a valid `deviceId` and valid payload
- allow read on `messages` for public viewing
- allow read on `allowedDevices` only from trusted backend logic or admin-side checks

> Production-grade security is not required for this PoC, but the app should still reject unknown devices.

### Step 7: Install Firebase tooling locally

- [ ] Install Firebase CLI with npm if needed
- [ ] Run the Firebase login flow
- [ ] Initialize Firebase in the project folder if hosting is used

Command example:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

---

## 5. Frontend project setup checklist

### Step 1: Create the app folder structure

Create a simple structure like this:

```text
02_neda_v01/
  index.html
  css/
    style.css
  js/
    app.js
    firebase-config.js
```

### Step 2: Prepare the static app

- [ ] Add a main HTML page
- [ ] Add a form or buttons for Hello and Erase
- [ ] Add a settings area for name entry
- [ ] Add a list area for the latest messages
- [ ] Add a simple refresh function after writes

### Step 3: Add Firebase client script

- [ ] Import Firebase SDK
- [ ] Initialize Firebase with the web config
- [ ] Use Firestore methods for reading and writing messages

Example import pattern:

```html
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
  import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
</script>
```

---

## 6. Frontend behavior checklist

### Message sending

- [ ] Read the current device ID or generate a stable client-side identifier
- [ ] Read the current chosen display name from local state or localStorage
- [ ] Validate that the device is in allowedDevices
- [ ] Send a new document to the `messages` collection on hello or erase

### Message reading

- [ ] Query the last 10 messages
- [ ] Sort by timestamp or createdAt descending
- [ ] Render them into the UI

### Settings behavior

- [ ] Allow the user to enter a name
- [ ] Save the name locally in localStorage
- [ ] Use the saved name in future message posts

---

## 7. Erase logic checklist

This is the core business rule.

### Required behavior

- [ ] Detect a new message whose text contains `ERASE`
- [ ] Inspect the most recent message stream
- [ ] Confirm there are at least 2 consecutive erase messages
- [ ] Confirm those erase messages come from at least 2 different users/devices
- [ ] Clear the `messages` collection when the condition is met

### Suggested implementation approach

The simplest implementation is:

1. Read the last few messages from Firestore
2. Check the last 2 or more entries for erase markers
3. Count unique deviceIds in the erase sequence
4. If the sequence matches the rule, delete all message documents

Example rule logic concept:

```js
const recent = lastMessages.slice(0, 10);
const eraseEntries = recent.filter(m => /ERASE/i.test(m.text));
const uniqueDevices = new Set(eraseEntries.map(m => m.deviceId));

const conditionMet = eraseEntries.length >= 2 && uniqueDevices.size >= 2;
```

This is intentionally simple and easy to debug.

---

## 8. Validation checklist

Before moving to feature polish, validate these flows:

- [ ] Add an allowed device manually in Firestore
- [ ] Open the app in a browser tab with that device ID
- [ ] Enter a name and send a hello message
- [ ] Verify the message appears in Firestore
- [ ] Verify the message appears on screen
- [ ] Send an erase message from one device
- [ ] Send another erase message from a second device
- [ ] Verify the message list clears as expected
- [ ] Confirm unknown devices are rejected

---

## 9. Risks and notes

- The app should not yet be treated as a secure production service
- Firestore rules should remain simple until the prototype is proven to work
- Manual device allowlisting is acceptable for the first stage
- Keep UI tiny and behavior clear

---

## 10. Definition of done for setup phase

The setup phase is complete when all of the following are true:

- [ ] Firebase project exists
- [ ] Firestore is enabled
- [ ] `messages` collection exists
- [ ] `allowedDevices` collection exists
- [ ] At least one allowed device is registered manually
- [ ] The frontend project structure is ready
- [ ] The app can read and write to Firestore
- [ ] The erase rule is understood and ready to implement
- [ ] User is ready to begin the development phase

---

## 11. Next recommended action

Once this setup checklist is complete, proceed to the development phase and begin implementing the frontend UI and Firebase integration in the app folder.
