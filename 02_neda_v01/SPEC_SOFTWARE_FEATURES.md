# SPEC_SOFTWARE_FEATURES

## 1. Product summary

Neda is a very simple family-oriented prototype application. It allows a user to send a short “hello” message into the system, view recent activity, and reset the message history if an “erase” command is issued.

The application is intentionally minimal and should remain easy to understand and easy to maintain.

### 1.1 How this document evolves

This is a living spec for an actively developed prototype — features get added over time rather than fully planned upfront. When adding a new feature, follow these conventions so the doc stays easy to extend without reshuffling what's already shipped:

- **Core user flows (§3)** are grouped in "decades" by iteration: 3.1–3.9 hold the original core flows (hello/erase/view). Each later iteration claims the next open decade (3.10–3.19, 3.20–3.29, ...) for its cluster of related flows, so a reader can tell at a glance which flows shipped together. Numbers are never reused or renumbered once shipped.
- **UI elements (§2)** and **acceptance criteria (§7)** are appended in the order features were implemented, not re-sorted alphabetically or logically — the newest entry is the most recently shipped feature.
- **Data requirements (§5)** gain new fields as features need them; existing fields are not renamed or removed for a prototype like this.
- Every iteration is logged in **§11 Revision history**, recording what shipped and which sections it touched, so the connection between a feature and its scattered footprint (UI + flow + data + acceptance criteria) stays traceable.

Going forward, a new feature just needs: a new flow decade in §3, appended UI/criteria entries, new fields in §5, and one new block in §11 — no renumbering of existing content.

---

## 2. User interface

### 2.1 Main screen

The mobile-first UI should contain only a few essential elements:

- Text input or message field
- “Hello” button
- “Trebam” (todo/need) button, placed next to “Hello”
- “Erase” button
- Recent messages panel
- Filter toggle button (all items vs. uncompleted-only), placed next to Settings
- Settings button

### 2.2 Message list

- Show the last 10 messages
- Each entry should include a timestamp, the user-set name, and the message text
- Messages should be displayed in reverse chronological order (newest first or newest last, as long as it is consistent)
- The list should refresh after a successful send or after an erase event
- Todo items are shown with a checkmark to the left of the text; tapping it toggles completion
- The 10-item display limit applies only to plain messages/history. When the filter is set to "show all", uncompleted todo items are always shown in full regardless of the 10-item cap
- Below the text input, an autocomplete suggestion list appears once the user has typed at least 2 characters, listing matching known todo items (see 3.13)

### 2.3 Settings screen

The settings screen should allow the user to:

- set or update their display name
- confirm the change
- cancel and return without saving

The UI should remain minimal and avoid extra settings.

### 2.4 Filter toggle button (added with the todo feature, see 3.10–3.13)

- Toggles between "show all items" and "show only uncompleted todo items"
- Icon is a checkmark, shown in gray when completed items are hidden and green when completed items are shown, using image tinting rather than swapped image assets

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

*Flows 3.10–3.13 below were added together in a later iteration to introduce the todo feature (see §11 Revision history). Per the numbering convention in §1.1, they were given their own decade rather than continuing from 3.4.*

### 3.10 Add todo item

When the user taps “Trebam”:

- the client sends a timestamped message to the backend, flagged as a todo item (not a plain message)
- the record is created with `isComplete = false`
- the item is displayed in the message/todo list with a checkmark to its left
- the recent list refreshes, same as for “Hello”

### 3.11 Complete / uncomplete todo item

- Any user may tap the checkmark next to a todo item to mark it complete
- On completion, a completion timestamp is written and `isComplete` is set to `true`
- Tapping the checkmark again on a completed item uncompletes it, with the following rule:
  - If `completedAt` falls on the same calendar day as the item's original `timestamp` (i.e. it was completed the same day it was created), the item is uncompleted in place: `isComplete` is set back to `false` and `completedAt` is cleared to null/empty.
  - If `completedAt` falls on a different calendar day than the item's original `timestamp` (i.e. it lingered across days before being completed), the original item is left untouched (stays complete, preserving that day's history) and a new todo item is created with the same description text, `isComplete = false`, and a fresh timestamp — effectively re-opening the task as a new item rather than rewriting history

### 3.12 Toggle completed-items filter

- Tapping the filter button switches between showing all items and showing only uncompleted todo items
- Plain (non-todo) messages are unaffected by the filter and always follow the normal 10-item display rule
- The icon updates immediately to reflect the new state (gray = completed hidden, green = completed shown)

### 3.13 Todo text autocomplete

- The client maintains an in-memory dictionary of all known todo item texts
- The dictionary is rebuilt whenever the message list is fetched from the server, and again whenever the current user posts a new message
- While typing in the text field, once at least 2 characters have been entered, the client shows matching todo items from the dictionary as suggestions below the text box
- Ordering/ranking of suggestions is not yet specified (a draft ordering scheme — match-at-start, then contains, then initials — exists in the draft file but is commented out and therefore explicitly excluded from this version's scope per the draft's own annotation convention)

---

## 4. Business logic rules

### 4.1 Message storage

The system must accept new messages and keep a record of recent ones.

### 4.2 Authorization

Only registered devices or approved passkeys should be allowed to send messages.

### 4.3 Recent message retrieval

The app should read the last 10 messages from the backend.

### 4.4 Erase maintenance rule

When a user sends a message containing "ERASE", the system should inspect the recent message stream. If there are at least 2 consecutive erase messages from at least 2 different users/devices, the system wipes the "neda_messages" collection.

This is intentionally simple and functional rather than elegant.

---

## 5. Data requirements

### 5.1 Message record (collection: `neda_messages`)

Minimum fields:

- timestamp
- device ID
- message text
- user display name
- isTodo (bool) — true if created via the “Trebam” button, false for plain “Hello”/erase messages
- isComplete (bool) — only meaningful when isTodo is true
- completedAt (timestamp, nullable) — set when isComplete becomes true; behavior on uncomplete is an open question (see 8)

Optional fields (purpose not yet settled, see §8):

- created_at
- source
- userLabel

### 5.2 Allowed user/device list (collection: `neda_allowedDevices`)

Minimum fields:

- device ID
- passkey or token

Optional fields:

- friendly name
- registration date

### 5.3 Naming convention

All Neda data collections must use the `neda_` prefix to distinguish them from other miniApps' data stores that may share the same Firestore instance.

### 5.4 Identity model

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

### 7.1 Iteration 1 — core (hello/erase)

- [x] The app runs in the browser on mobile and is easy to open from the home screen
- [x] A user may enter a name and save it
- [x] The display name appears in message entries
- [x] A user may send a hello message
- [x] The system stores the message in the backend
- [x] The app displays the most recent messages
- [x] A user may send an erase message
- [x] The backend clears stored messages when the erase condition is triggered
- [x] Only approved devices are allowed to post messages
- [x] The erase rule requires at least 2 consecutive erase messages from at least 2 different users/devices

### 7.2 Iteration 2 — todo feature (3.10–3.13)

- [x] A user may send a todo item via the “Trebam” button
- [x] Todo items display a checkmark and can be completed/uncompleted by any user
- [x] The filter toggle shows/hides completed todo items without affecting the 10-item cap on plain messages, and without ever hiding uncompleted todos
- [x] After typing 2+ characters, the app shows matching known todo items as autocomplete suggestions

New iterations append a new `7.N` block here rather than inserting into the lists above.

---

## 8. Open questions for implementation

- [x] The project will be tested on one laptop first
- [x] The backend will be chosen as a simple online provider
- [x] Allowed devices will be managed manually
- [x] User and device are treated as the same identity for this prototype
- [x] Uncompleting a todo clears its timestamp only if completed same-day as created; otherwise the original stays completed and a new item is spawned with the same text (see 3.11)
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

---

## 11. Revision history

Tracks which sections each iteration touched, per the convention in §1.1. Add a new entry here whenever a feature ships — don't edit past entries.

### Iteration 1 — core (hello / erase / view)

- Flows: 3.1 Send hello, 3.2 Send erase, 3.3 View activity
- UI: 2.1 Main screen, 2.2 Message list (base), 2.3 Settings screen
- Data: `neda_messages` base fields, `neda_allowedDevices`
- Acceptance criteria: 7.1

### Iteration 2 — todo feature

- Flows: 3.10 Add todo item, 3.11 Complete/uncomplete todo item, 3.12 Toggle completed-items filter, 3.13 Todo text autocomplete
- UI: 2.4 Filter toggle button; message list and settings sections updated in place for todo display
- Data: `neda_messages` gained `isTodo`, `isComplete`, `completedAt`
- Acceptance criteria: 7.2

### Iteration 3 — (next feature goes here)

- Flows: 3.20–3.2x reserved for the next feature cluster
- UI: append to §2
- Data: append new fields to §5.1/§5.2 as needed
- Acceptance criteria: new 7.3 block
