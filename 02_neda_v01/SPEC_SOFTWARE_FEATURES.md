# SPEC_SOFTWARE_FEATURES

## 1. Product summary

Neda is a very simple family-oriented prototype application. It allows a user to send a short “hello” message into the system, view recent activity, and reset the message history if an “erase” command is issued.

The application is intentionally minimal and should remain easy to understand and easy to maintain.

---

## 2. User interface

### 2.1 Main screen

The mobile-first UI should contain only a few essential elements:

- Text input or message field
- “Hello” button
- “Erase” button
- Recent messages panel
- Settings button

### 2.2 Message list

- Show the last 10 messages
- Each entry should include a timestamp, the user-set name, and the message text
- Messages should be displayed in reverse chronological order (newest first or newest last, as long as it is consistent)
- The list should refresh after a successful send or after an erase event

### 2.3 Settings screen

The settings screen should allow the user to:

- set or update their display name
- confirm the change
- cancel and return without saving

The UI should remain minimal and avoid extra settings.

---

## 3. Core user flows

### 3.1 Send hello

When the user taps “Hello”:

- the client sends a timestamped message to the backend
- the backend records the message
- the user receives confirmation
- the recent message list refreshes

Example payload:

- timestamp
- device ID
- user display name
- text: "Username says hello"

### 3.2 Send erase

When the user taps “Erase”:

- the client sends an erase-style message to the backend
- the backend logs the action as a message event
- the backend checks the recent sequence of erase events
- if at least 2 consecutive erase messages have been received from at least 2 different users/devices, the message table is cleared

Example payload:

- timestamp
- device ID
- user display name
- text: "Username wants to ERASE"

### 3.3 View activity

The application should always show what the system currently knows about recent family messages. The user should see a short stream of recent activity, not a large or complex dashboard.

---

## 4. Business logic rules

### 4.1 Message storage

The system must accept new messages and keep a record of recent ones.

### 4.2 Authorization

Only registered devices or approved passkeys should be allowed to send messages.

### 4.3 Recent message retrieval

The app should read the last 10 messages from the backend.

### 4.4 Erase maintenance rule

When a user sends a message containing “ERASE”, the system should inspect the recent message stream. If there are at least 2 consecutive erase messages from at least 2 different users/devices, the system wipes the “message” table.

This is intentionally simple and functional rather than elegant.

---

## 5. Data requirements

### 5.1 Message record

Minimum fields:

- timestamp
- device ID
- message text
- user display name

Optional fields:

- created_at
- source
- userLabel

### 5.2 Allowed user/device list

Minimum fields:

- device ID
- passkey or token

Optional fields:

- friendly name
- registration date

### 5.3 Identity model

- User and device are treated as effectively the same for this prototype
- The database stores a device identifier as the operational identity
- The app-entered name is the display name shown in the message feed and is not treated as a separate user identity system

---

## 6. UX expectations

- Very low friction for family members
- Mobile-first and easy to launch from a home screen
- Simple interface with almost no learning curve
- Immediate feedback after each action
- Reliable basic behavior over visual sophistication
- Testing will begin on one laptop with a browser, not yet on multiple real devices

---

## 7. Acceptance criteria

- [ ] The app runs in the browser on mobile and is easy to open from the home screen
- [ ] A user may enter a name and save it
- [ ] The display name appears in message entries
- [ ] A user may send a hello message
- [ ] The system stores the message in the backend
- [ ] The app displays the most recent messages
- [ ] A user may send an erase message
- [ ] The backend clears stored messages when the erase condition is triggered
- [ ] Only approved devices are allowed to post messages
- [ ] The erase rule requires at least 2 consecutive erase messages from at least 2 different users/devices

---

## 8. Open questions for implementation

- [x] The project will be tested on one laptop first
- [x] The backend will be chosen as a simple online provider
- [x] Allowed devices will be managed manually
- [x] User and device are treated as the same identity for this prototype
- [ ] Which online provider should be chosen if Firebase is not used?

---

## 9. Implementation focus for the first version

The first version should prioritize:

1. working read/write flows
2. basic device authorization
3. recent message display with user names
4. reset behavior for erase messages after 2 consecutive erase events from 2 users/devices
5. straightforward mobile UI

No advanced UI, authentication, or architecture should be added until the prototype is working reliably.

---

## 10. Recommended backend alternatives

If Firebase is not chosen, the strongest alternatives are:

- Supabase
- PocketBase
- Render or Railway with Postgres

Supabase is the most natural alternative because it is online, beginner-friendly, and offers a simple database model with minimal complexity. It is a strong option if the goal is to keep the backend online but avoid Firebase.
