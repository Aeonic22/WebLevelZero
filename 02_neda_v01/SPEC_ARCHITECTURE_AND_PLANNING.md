# SPEC_ARCHITECTURE_AND_PLANNING

## 1. Project overview

Project: Neda

Goal: build a simple, low-friction family prototype that allows users to send short “hello” and “erase” messages through a shared backend, view the latest activity, and maintain a minimal, easy-to-set-up data store.

The app is intentionally lightweight and should be easy to operate by a developer with limited web experience. The emphasis is on a working proof of concept, not polished product UX.

---

## 2. Architectural direction

### 2.1 Application type

- Recommended approach: lightweight web app, ideally mobile-friendly and installable as a home-screen app
- Acceptable implementation: plain HTML + JavaScript + CSS for the frontend
- Backend: small online database service with simple API access
- Authentication: simple user identification based on device ID, with manual allowlist management for the prototype

### 2.2 Recommended architecture

A minimal client-server architecture is sufficient:

- Client: browser-based web app for mobile devices
- Frontend: simple HTML, CSS, and JavaScript
- API/backend: lightweight service layer that accepts message writes and reads
- Database: one shared collection/table for messages and one collection/table for allowed devices
- Authentication/authorization: allow only recognized devices to submit messages

This keeps the project easy to learn, low cost, and quick to prototype.

---

## 3. Core technical decisions

### 3.1 Frontend

- Use a very small frontend, ideally a single-page app
- Target mobile usage first
- Focus on a few actions: write message, view recent messages, change name, erase data
- Prefer straightforward, readable browser code over framework-heavy setup

### 3.2 Backend / persistence

- Data storage should be an online database service that is easy to configure and free for small use
- Firebase Firestore is the primary recommendation for this prototype because it is beginner-friendly and easy to learn
- Alternative online options should remain viable, but Firebase is the default choice unless a better low-overhead alternative is preferred
- Keep data model minimal and explicit

### 3.3 Authentication and security

- Each device should be identifiable through a local device ID or backend-approved identifier
- For this prototype, user and device are treated as effectively the same concept: a device is the identity, and the app's user-entered name is only display text
- The device name stored in the database is operational metadata; it is not used in practice by the user-facing product flow
- Access should be restricted to devices registered in the backend
- Manual maintenance of the allowedDevices list is acceptable at this stage

### 3.4 Data model

Message collection/table fields should include at least:

- timestamp
- device identifier
- message text
- display name entered by the user

**Note:** All Neda data collections must use the `neda_` prefix to distinguish them from other miniApps' data stores in the shared Firestore.

- Collection name: `neda_messages`
  - timestamp
  - deviceId
  - text
  - name

Allowed devices collection/table fields should include at least:

- device identifier
- optional passkey or token
- optional registration date
- optional simple device label for internal reference

- Collection name: `neda_allowedDevices`
  - deviceId
  - passkey (optional)
  - label (optional)
  - createdAt (optional)

---

## 4. Functional requirements summary

- User can enter a name in settings
- The entered name is shown in messages
- User can send a “hello” message
- User can send an “erase” message
- App displays the most recent 10 messages
- App refreshes after each successful send
- System checks whether the device is allowed to interact
- System supports one maintenance action: erase all messages when at least 2 consecutive erase messages are submitted by at least 2 different users/devices

---

## 5. Business / usage assumptions

- The app is for a family of two or more users
- The app is a prototype and should stay intentionally simple
- No polished UI is required for now
- The application should be easy to demonstrate and easy to explain
- Testing will begin on one laptop first, with browser-based validation rather than production device deployment

---

## 6. Setup plan

### Recommended implementation path

- [x] Confirm that testing will begin on one laptop
- [x] Decide on a backend option and architecture
- [x] Decide that allowedDevices will be managed manually
- [x] Create a simple project folder and decide on a static frontend structure
- [x] Create a minimal backend API or database rules that support create/read operations
- [x] Register authorized devices manually
- [x] Build the client UI for messages, name settings, and refresh behavior
- [x] Implement erase logic requiring 2 consecutive erase messages from at least 2 users/devices
- [x] Validate the full workflow on a laptop/browser first

### Minimum technical prerequisites

- A browser for testing
- A simple online database provider
- Basic web project structure
- Optional local development server if needed for testing

---

## 7. Risks and open questions

- [x] Testing can be done effectively using one PC initially
- [ ] Should the backend be configured and tested directly through API calls rather than only through the browser UI?
- [ ] Is the family use case broad enough to require multiple devices and multiple names, or a single shared family identity?
- [x] Device registration will be handled manually for the prototype
- [x] Which online database provider will be used if Firebase is not chosen?

---

## 8. Recommended implementation strategy

Keep the first version intentionally small and robust:

1. Start with one static frontend page
2. Use a minimal message store in an online database service
3. Add authorization for recognized devices only
4. Implement read of last 10 rows
5. Add reset logic requiring 2 consecutive erase messages from at least 2 users/devices
6. Validate end-to-end behavior before refining UX

This approach maximizes learning and keeps the project low-risk.

---

## 9. Alternative online backend options

If Firebase is not preferred, good alternatives include:

- Supabase
- PocketBase
- Render + Postgres backend
- Railway + Postgres backend

Among these, Supabase is the most natural alternative because it offers a simple online database, auth support, and a familiar developer experience while staying lightweight enough for a prototype.

For this project, the best practical alternatives are:

- Firebase Firestore: simplest for learning and online backend setup
- Supabase: best alternative if a more SQL-like and open model is preferred
- PocketBase: very simple self-hosted or hosted option, but may be slightly less conventional for a beginner

---

## 4. Functional requirements summary

- User can enter a name in settings
- User can send a “hello” message
- User can send an “erase” message
- App displays the most recent 10 messages
- App refreshes after each successful send
- System checks if the user/device is allowed to interact
- System supports one maintenance action: erase all messages when the last few messages indicate an erase event

---

## 5. Business / usage assumptions

- The app is for a family of two or more users
- The app is a prototype and should stay intentionally simple
- No polished UI is required for now
- The application should be easy to demonstrate and easy to explain

---

## 6. Setup plan

### Recommended implementation path

- [x] Confirm whether testing will be done from one PC or multiple devices/browsers
- [x] Choose a backend option: Firebase or another free online database service
- [x] Create a simple project folder and decide on a static frontend structure
- [ ] Create a minimal backend API or database rules that support create/read operations
- [ ] Register authorized devices or keys
- [ ] Build the client UI for messages, name settings, and refresh behavior
- [ ] Validate the full workflow on a mobile browser or emulated device

### Minimum technical prerequisites

- A browser for testing
- A simple online database provider
- Basic web project structure
- Optional local development server if needed for testing

---

## 7. Risks and open questions

- [ ] Can the app be tested effectively using only one PC and multiple browser tabs or devices?
- [ ] Should the backend be configured and tested directly through API calls rather than only through the browser UI?
- [ ] Is the family use case broad enough to require multiple devices and multiple names, or a single shared family identity?
- [ ] How should device registration be handled in the simplest possible way?

---

## 8. Recommended implementation strategy

Keep the first version intentionally small and robust:

1. Start with one static frontend page
2. Use a minimal message store in a free online database
3. Add authorization for recognized devices only
4. Implement read of last 10 rows
5. Add reset logic for erase messages
6. Validate end-to-end behavior before refining UX

This approach maximizes learning and keeps the project low-risk.
