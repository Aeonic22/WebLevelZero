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
