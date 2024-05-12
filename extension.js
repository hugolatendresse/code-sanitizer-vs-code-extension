const vscode = require('vscode');
const Anonymizer = require('./anonymizer');
const path = require('path');

let anonymizer = new Anonymizer();

function activate(context) {

	// console.log('Extension "code-sanitizer" is now active!');

    let disposable = vscode.commands.registerCommand('code-sanitizer.anonymizeAndCopy', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            // const fileName = editor.document.fileName; // This gets the full path of the active document
            // const extension = path.extname(fileName); 
            
            // Check if the substring "import" is in the script
            // TODO if lag, it might be faster to parse in the background, before anonymizeAndCopy is ever called
            if (editor.document.getText().includes('import')) {
                const allText = editor.document.getText(); // This gets the entire text of the active document
                anonymizer.read_entire_python_script(allText);
            }

            let modifiedText = anonymizer.anonymize(selectedText);
            vscode.env.clipboard.writeText(modifiedText)
        }
    });

    context.subscriptions.push(disposable);

    let disposableUnanonymizeAndPaste = vscode.commands.registerCommand('code-sanitizer.unanonymizeAndPaste', async function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            let clipboardText = await vscode.env.clipboard.readText();
            let modifiedText = anonymizer.unanonymize(clipboardText);
    
            await editor.edit(editBuilder => {
                editBuilder.replace(editor.selection, modifiedText);
            });
        }
    });
    
    context.subscriptions.push(disposableUnanonymizeAndPaste);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
