const vscode = require('vscode');
const Anonymizer = require('./anonymizer');

let anonymizer = new Anonymizer();

function activate(context) {

    let disposable = vscode.commands.registerCommand('code-sanitizer.anonymizeAndCopy', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            // const fileName = editor.document.fileName; // This gets the full path of the active document
            // const extension = path.extname(fileName); 
            
            // Check if it's a python script
            if (editor.document.getText().includes('import')) {
                const allText = editor.document.getText(); // This gets the entire text of the active document
                anonymizer.read_entire_python_script(allText);
            }

            // Check if it's an R script
            const RStringsToCheck = ['library', 'require'];
            if (RStringsToCheck.some(keyword => editor.document.getText().includes(keyword))) {
                const allText = editor.document.getText(); // This gets the entire text of the active document
                anonymizer.read_entire_R_script(allText);
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

// This method is called when the extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
