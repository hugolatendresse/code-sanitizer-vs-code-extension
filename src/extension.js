const vscode = require('vscode');
const Anonymizer = require('./anonymizer');
const {printDebugInfo} = require("./utils-testing");

let anonymizer = new Anonymizer();
let seenScripts = new Set();

function activate(context) {

    // Register an event listener for when the active text editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const filePath = editor.document.uri.fsPath;

            // Check if the script has been seen before
            if (!seenScripts.has(filePath)) {
                // If not, add it to the set of seen scripts
                seenScripts.add(filePath);

                // Run your code here

                // Check if it's a python script and add python-related reserved words
                if (editor.document.getText().includes('import')) {
                    const allText = editor.document.getText(); // This gets the entire text of the active document
                    anonymizer.read_entire_python_script(allText);
                }

                // Check if it's an R script and add R-related reserved words
                const RStringsToCheck = ['library', 'require'];
                if (RStringsToCheck.some(keyword => editor.document.getText().includes(keyword))) {
                    const allText = editor.document.getText(); // This gets the entire text of the active document
                    anonymizer.read_entire_R_script(allText);
                }
            }
        }
    });

    let disposable = vscode.commands.registerCommand('code-sanitizer.anonymizeAndCopy', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {



            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            // printDebugInfo("selectedText", selectedText)

            // Check if it's a python script and add python-related reserved words
            // TODO remove this!!! we want to run only on active text editor change now
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

// This method is called when the extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}