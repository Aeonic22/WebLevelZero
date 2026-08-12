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
- [x] Copy the Firebase config values
- [x] Save them in a frontend config file or JS module

### Step 3: Enable Firestore

- [x] Open Firestore Database
- [x] Create a database in test mode for prototype development
- [x] Choose a region close to the expected users

### Step 4: Create the required collections

#### Create the `neda_messages` collection

- [x] Open **Firestore Database** in your Firebase project
- [x] Click **Create collection**
- [x] Name it `neda_messages`
- [ ] Click **Auto ID** for the first document
- [ ] Add at least one field (e.g., `placeholder` as a string with value `temp`) — required before saving
- [ ] Click **Save**
- [ ] After creation, delete that auto-created document (we'll add real messages from the app later)

#### Create the `neda_allowedDevices` collection

- [ ] Click **Create collection** again
- [ ] Name it `neda_allowedDevices`
- [ ] Click **Auto ID** for the first document
- [ ] Add these fields to the document:
  - `deviceId` (string) — see below for how to get the device ID
  - `passkey` (string) — e.g., `family-pass-001`
  - `label` (string) — e.g., `Test Device`
- [ ] Click **Save**

#### How to find your device ID

The app generates a unique device ID and stores it locally. To find it:

1. Open the app in your browser (`npm run dev`)
2. Open browser DevTools (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. Run this command: `localStorage.getItem('neda-device-id')`
5. Copy the returned value (it will look like `device-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
6. Paste that exact value into the `deviceId` field of the `neda_allowedDevices` document

#### Example allowed device document

```json
{
  "deviceId": "device-a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
  "passkey": "family-pass-001",
  "label": "Test Device"
}
```

### Step 5: Define the document schema

#### `neda_messages` document schema

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

### Step 6: Set up Firestore rules

Firestore rules control who can read and write data. For this prototype, use simple rules that allow public message reading but protect the device allowlist.

#### How to update rules

1. Open **Firestore Database** in Firebase Console
2. Go to the **Rules** tab
3. Replace all content with the rules below
4. Click **Publish**

#### Recommended Firestore rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /neda_messages/{document=**} {
      allow read: if true;
      allow create: if request.auth != null || exists(/databases/$(database)/documents/allowedDevices/$(request.resource.data.deviceId));
      allow delete: if false;
    }
    match /allowedDevices/{document=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

#### What these rules do

- **neda_messages** collection:
  - `allow read`: Anyone can read messages
  - `allow create`: Only devices in the `allowedDevices` collection can create new messages
  - `allow delete`: Nobody can delete messages (prevents accidental loss); only the erase logic can clear the collection

- **allowedDevices** collection:
  - `allow read`: Locked down (only backend admin can read)
  - `allow write`: Locked down (prevent unauthorized device registration)

These rules are intentionally simple for prototyping. Production rules would be stricter.

> **Important:** After publishing these rules, only devices in `allowedDevices` can send messages. If you try to send a message from an unknown device, it will be rejected.

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

### Step 2: Install dependencies and run the dev server

- [x] Create `package.json` with Firebase and Vite dependencies
- [ ] Run `npm install` in the `02_neda_v01` folder
- [ ] Run `npm run dev` to start the local dev server
- [ ] Open the app in your browser (usually `http://localhost:5173`)

### Step 3: Prepare the static app

- [x] Add a main HTML page (`index.html`)
- [x] Add buttons for Hello and Erase
- [x] Add a settings area for name entry
- [x] Add a list area for the latest messages
- [x] Add a simple refresh function after writes

All of these are already included in the generated files.

### Step 4: Add Firebase client script and config

- [x] Import Firebase SDK (already in `js/app.js`)
- [x] Initialize Firebase with the web config (already configured in `js/app.js`)
- [x] Use Firestore methods for reading and writing messages (already implemented)
- [ ] Paste your Firebase config values into `js/firebase-config.js`

The Firebase config file (`js/firebase-config.js`) contains placeholders:

```js
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
```

Replace these placeholders with your actual Firebase config values from the Firebase Console.

---

## 6. Frontend behavior checklist

### Message sending

- [ ] Read the current device ID or generate a stable client-side identifier
- [ ] Read the current chosen display name from local state or localStorage
- [ ] Validate that the device is in allowedDevices
- [ ] Send a new document to the `neda_messages` collection on hello or erase

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
- [ ] Clear the `neda_messages` collection when the condition is met

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

## 8. End-to-end validation checklist

Once Firebase is configured and the app is running, validate these flows:

### Test 1: Basic message sending

- [ ] Run `npm run dev` in the `02_neda_v01` folder
- [ ] Open the app in your browser
- [ ] Find your device ID using the console command: `localStorage.getItem('neda-device-id')`
- [ ] Add this device ID to the `neda_allowedDevices` collection in Firestore (with a passkey and label)
- [ ] Enter a name in the Settings panel and click Save
- [ ] Click the **Hello** button
- [ ] Verify the message appears in the UI (check the "Recent messages" section)
- [ ] Verify the message appears in Firestore in the `neda_messages` collection

### Test 2: Unknown device rejection

- [ ] Open the app in an incognito/private browser window (creates a new device ID)
- [ ] Try to send a hello message
- [ ] Verify that it fails with a message about the device not being allowed
- [ ] Confirm the message does NOT appear in Firestore

### Test 3: Erase logic (requires 2 devices)

- [ ] Add a second device ID to the `neda_allowedDevices` collection
- [ ] Open two browser tabs/windows or private windows
- [ ] From the first device, send a hello message
- [ ] From the second device, send an "Erase" message (click the **Erase** button)
- [ ] From the first device, send an "Erase" message
- [ ] Verify that after the second erase, the `neda_messages` collection is completely cleared
- [ ] Verify the UI shows "No messages yet." or is empty

### Test 4: Settings persistence

- [ ] Enter a custom name in Settings
- [ ] Send a hello message
- [ ] Verify the message shows your custom name
- [ ] Refresh the browser
- [ ] Verify your name is still saved
- [ ] Send another message and verify your name persists

### Success criteria

The prototype is ready for next phase when all tests pass:

- [ ] Known devices can send messages
- [ ] Unknown devices are rejected
- [ ] Messages persist in Firestore
- [ ] Messages display in the UI
- [ ] Erase rule works (2 erase messages from 2 users clears the collection)
- [ ] User name is saved locally and appears in messages

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
- [ ] `neda_messages` collection exists
- [ ] `allowedDevices` collection exists
- [ ] At least one allowed device is registered manually
- [ ] The frontend project structure is ready
- [ ] The app can read and write to Firestore
- [ ] The erase rule is understood and ready to implement
- [ ] User is ready to begin the development phase

---

## 11. Next recommended action

Once this setup checklist is complete, proceed to the development phase and begin implementing the frontend UI and Firebase integration in the app folder.
