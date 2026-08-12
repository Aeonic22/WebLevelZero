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
- Each entry should include a timestamp and the message text
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
- the application checks recent history for repeated erase events
- if the erase condition is satisfied, the message table is cleared

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

When a user sends a message containing “ERASE”, the system should check recent messages. If one or more recent entries indicate erase intent, the system wipes the “message” table.

This is intentionally simple and functional rather than elegant.

---

## 5. Data requirements

### 5.1 Message record

Minimum fields:

- timestamp
- device ID
- message text

Optional fields:

- display name
- created_at
- source

### 5.2 Allowed user/device list

Minimum fields:

- device ID
- passkey or token

Optional fields:

- friendly name
- registration date

---

## 6. UX expectations

- Very low friction for family members
- Mobile-first and easy to launch from a home screen
- Simple interface with almost no learning curve
- Immediate feedback after each action
- Reliable basic behavior over visual sophistication

---

## 7. Acceptance criteria

- [ ] The app runs in the browser on mobile and is easy to open from the home screen
- [ ] A user may enter a name and save it
- [ ] A user may send a hello message
- [ ] The system stores the message in the backend
- [ ] The app displays the most recent messages
- [ ] A user may send an erase message
- [ ] The backend clears stored messages when the erase condition is triggered
- [ ] Only approved devices are allowed to post messages

---

## 8. Open questions for implementation

- [ ] Will this be tested on a single machine with multiple browser sessions or on multiple physical devices?
- [ ] Is the backend going to be Firebase or another simple provider?
- [ ] Should a device register itself automatically or by manual setup?
- [ ] Is the app expected to support names only, or also distinct family member identities?

---

## 9. Implementation focus for the first version

The first version should prioritize:

1. working read/write flows
2. basic device authorization
3. recent message display
4. reset behavior for erase messages
5. straightforward mobile UI

No advanced UI, authentication, or architecture should be added until the prototype is working reliably.
