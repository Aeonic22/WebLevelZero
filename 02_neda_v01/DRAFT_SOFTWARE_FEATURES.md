# Clientside
User screen, which is mobile only, has just a few main elements. A txt box, hello buttonm erase button and a settings button.

"Hello" button posts a hello into the system, essentially adding a text to the database (example: timestamp, deviceuid, "Username says hello"). 

Text box shows 10 lines of text, which are last 10 posts into the system.

"Erase" button posts an erase message into the system (example: timestamp, deviceuid, "Username wants to ERASE"). So, same as hello, only different text.

App has a settings window. There it is only possible to set your name, so it probably contains of a text box and confirm and cancel buttons.

Anytime a user sends a message, he receives from backend a confirmation and then refreshes the text box.

# Database / backend

Database should accept registered users. There should probably be a table of allowed device id's and/or passkeys.

App logic requires one table ("message") with timestamp and a text of message.
There is essentialy one method, read last n rows.

There is a maintenance method to delete all rows from "message" table. It is activated if a user sends a message containing "ERASE". Then, if any of the last 10 messages contain one more "ERASE" the message table is wiped.


# Todo item functionality

Have the ability to send a todo item to the system, as well as complete it.
Add another button, just like Hello, next to Hello, but call it "Trebam" ("I need" in croatian).
If item is added with a need button, it's a todo item and not just a message. It has a checkmark left of the text.
Any user can complete the todo item. Task completion timestamp must also be added to the database, as well as bool variable "isComplete".
Complete items can be uncompleted by clicking the checkbox again. If done on the same date as completion, completion timestamp is then set to null, and if uncompleted on a later date, a new item is createds instead, with the same description.

# Filtering completed items functionality

Filter toggle button must exist on main screen. It toggles between showing all todo items and only uncompleted todo items. 10 item recent message display limit does not apply to uncompleted todo items - all uncompleted todos are always shown.
Button could be next to settings button, with a gray checkmark icon when completed are hidden, and a green checkmark icon when they are shown. Use image tinting to chenge the icon.

# Text prediction functionality

Local app should create an in-memory dictionary of all todo items for quick search ability. Dictionary is recreated every time the message list is acquired from the server, and each time a new message is posted by that user. 
When a new message is being written into the text field, after the second letter possible matches from the dictionary are offered, right below the text box. So, for "ba" both "banana" and "rabarbara" would be shown if they exist in dictionary.

<!--sorted in a proper way - for example, "ba" would show "BAnana" and then "raBArbara" and then "Brewed Ale". So, beginning of word first, than "if contains", and then initials.
-->

# Suggesteed features to discuss

## Add todo items via push to talk
A button that can be pressed and, on release, speech to text converts it into new todo item and adds it automatically. If uncertain about pronouncination and text detection, existing items and messages dictionary can be used.
How to proceed with that? Is there a JS library, or does Android support that?

## Add todo items by scanning the written note
A button activates the camera, camera can only tap to focus and click to take snapshot. After the photo, it is automatically OCR into a set of todo items, one per line of text - or even multiple items per line, if commas are detected.

## Separate needs screen and action screen
Needs screen is basically input screen. It has controls to type in, push to talk, OCR the note etc. Clicking existing items on a Needs screen opens item edit menu. 
Probably main screens would be accessible from the navigation buttons on the bottom of screen (Need, Action, Settings)

## Item edit menu
Every unique text item (like 'banana' or 'yoghurt') can also have additional data, set in Item settings menu. Those would be 'category' (text field), unit (text, selectable from dropdown, predefined in some cfg file), default quantity (float), availability in stores (sequential list of predefined stores in a cfg file, single word per store). Store availabilty would be used in some advanced sorting and filtering.
Item quantity would be adjustable.

## Adjustable fetch
App loads entire history of messages into memory once started and does not bother server again. Only messages from that day are periodically reloaded sice all users can continue adding and completing items. 
How would we solve this? List of items or dictionary in memory? Can we query Firebase in that way?

## Item metadata database (corresponds to item settings) 
For now, it would be created by reading entire history of todo items and deducing from that.
For every item, it would calculate frequency as (timestamp of last created item - timestamp of first created item) divided by (number of those items - 1).

## Store selection
Would be a screen-wide div on top of screen. It would influence suggested items when in Adding items mode, and would generate item metadata on Action screen (if item is completed wile store x is selected, store x is added to item's store availiability and preference list).

## Know frequency of items

## Item auto-suggestion
It would be a screen-wide, two line div what would have a "tap to add" suggestions for todo items. Items would be suggested by category and by use frequency.
To suggest by category, app will remember the last 5 categories used today (so, reset the list if new day detected in app launch or switching to app). Any item with that category, not already added that day, has +1 visibility point.
To suggest by frequency, 


