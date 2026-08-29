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
When a new message is being written into the text field, after the second letter possible matches from the dictionary are offered, right below the text box. So, for "ba" both "banana" and "rabarbara" woudl be shown if they exist in dictionary.

<!--sorted in a proper way - for example, "ba" would show "BAnana" and then "raBArbara" and then "Brewed Ale". So, beginning of word first, than "if contains", and then initials.
-->
