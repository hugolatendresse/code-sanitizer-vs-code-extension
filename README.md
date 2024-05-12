# Code Sanitizer

Copy-paste code to and from VS Code without sharing anything other than code keywords.

For example, when using SQL, words like SELECT and FROM will stay the same, but all table and field names will be replaced by a random dictionary word.

This allows pasting code into tools like ChatGPT or public forums, without sharing potentially sensitive details.

/* Currently only supports Python and SQL. R will be added next. */


### Step 1
Select the code you want to sanitize and copy using **ctrl+shift+alt+C** (**cmd+shift+option+C** on Mac).
You can also right-click and select "**Anonymize and Copy Code**".

![VS Code Screenshot Before](./images/step_1.png)

The code in your clipboard will be a sanitized version of what you see in VS Code.

### Step 2
Paste the code as you would normally (**ctrl+V** or **cmd+V**) in your favorite AI chat tool. 
Instead of the original code, the pasted version is sanitized with random words!

![Prompting LLM](./images/step_2.png)

### Step 3
If the chat tool gives you something you want to bring back to VS code, copy it as you would normally (**ctrl+C** or **cmd+C**).

![Pasting from LLM](./images/step_3.png)

### Step 4
Use **ctrl+shift+alt+V** (**cmd+shift+option+V** on Mac) to paste back in VS Code.
You can also right-click and select "**Unanonymize and Paste Code**".

Instead of the sanitized code, you will get the original names! 
Even if the code has changed (new lines of code, etc.)

![VS Code Screenshot After](./images/step_4.png)
