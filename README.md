# Code Sanitizer

[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hugolatendresse/code-sanitizer-vs-code-extension)

Copy-paste code to and from VS code without sharing anything else than code keywords.

For example, when using SQL, words like SELECT and FROM will stay the same, but all table and field names will be replaced by a random dictionary word.

This allows to paste code into tools like ChatGPT, or even public forums, without sharing any company secrets.

/* Only supports SQL for now */


### Step 1
Select the code you want to sanitize and copy using **ctrl+shift+alt+C** (**cmd+shift+option+C** on mac)

![VS Code Screenshot Before](./images/step_1.png)

### Step 2
Paste the code normally (**ctrl+V** or **cmd+V**) in your favorite AI chat tool. 
Instead of the original code, the pasted version is sanitized with random words!

![Prompting LLM](./images/step_2.png)

### Step 3
If the chat tool gives you something you want to bring back to VS code, copy it normally (**ctrl+C** or **cmd+C**) 

![Pasting from LLM](./images/step_3.png)

### Step 4
Use **ctrl+shift+alt+V** (**cmd+shift+option+V** on mac) to paste back in VS code.

Instead of the sanitized code, you will get the original names! 
Even if the code has changed (new lines of code, etc.)

![VS Code Screenshot After](./images/step_4.png)
