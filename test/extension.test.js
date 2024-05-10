// const assert = require('assert');

// // You can import and use all API from the 'vscode' module
// // as well as import your extension to test it
// const vscode = require('vscode');
// // const myExtension = require('../extension');

// suite('Extension Test Suite', () => {
// 	vscode.window.showInformationMessage('Start all tests.');

// 	test('Sample test', () => {
// 		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
// 		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
// 	});
// });

// to run: npm test


const vscode = require('vscode');
const assert = require('assert');
const extension = require('../extension');

function printDebugInfo(someName, someVar) {
    console.log("\n\!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("This is the ", someName, ":");
    console.log(someVar);
    console.log("#######################################\n");
}

suite('Extension Test Suite', () => {

	test('Test 00 anonymizeAndCopy all sanitized', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		editor.selection = new vscode.Selection(0, 0, 0, 10);
		const originalText = 'table2.somename allthe01 wordshere 23432 shouldbe.sanitized0';
		await editor.edit(editBuilder => {
			editBuilder.replace(editor.selection, originalText);
		});
		await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');
		const clipboardText = await vscode.env.clipboard.readText();
		assert.notStrictEqual(clipboardText, originalText);
		// Tokenize the original text and make sure that no token is the same as before
		const tokens = originalText.match(/\b\w+\b/g);
		tokens.forEach(token => {
			assert.strictEqual(clipboardText.includes(token), false);
		});
    });
	
    test('Test 01 anonymizeAndCopy with SQL keywords', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		editor.selection = new vscode.Selection(0, 0, 0, 10);
		const originalText = 'SELECT * FROM table1.sometoken where column1 = 1234324 AND column2 = 23432';
		await editor.edit(editBuilder => {
			editBuilder.replace(editor.selection, originalText);
		});
		await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');
		const clipboardText = await vscode.env.clipboard.readText();
		
		// First 13 characters should be the same
		assert.strictEqual(clipboardText.substring(0, 13), originalText.substring(0, 13));
		
		// The entire thing should be different
		assert.notStrictEqual(clipboardText, originalText);

		// If the token is in ["SELECT", "FROM", "where", "AND"], it should be the same, else it should be different
		const tokens = originalText.match(/\b\w+\b/g);
		tokens.forEach(token => {
			const sqlReservedWords = ["SELECT", "FROM", "where", "AND"];
			if (sqlReservedWords.includes(token)) {
				assert.strictEqual(clipboardText.includes(token), true);
			} else {
				assert.strictEqual(clipboardText.includes(token), false);
			}
		});
    });

	// TODO copy back full test
    // test('Test 02 unanonymizeAndPaste all sanitized', async () => {


    test('Test 03 unanonymizeAndPaste all sanitized but only half', async () => {
		// An editor is created and writes something in a first script
		let doc = await vscode.workspace.openTextDocument({ content: ' ' });
		let editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		const originalText = `Wewilltry.amuchlonger pieceoftext tocheck ifthe unanonymize functionworksproperly
		thisisjust averylong stringwithlotsofwords andpunctuationmarks! moreoverthere aresomenumbers1234
		andalsosome1 specialcharacterslike $%&/()=?^* andalsosome! whitespaces
		andthen, itrepeasts twotimes
		Wewilltry.amuchlonger pieceoftext tocheck ifthe unanonymize functionworksproperly
		thisisjust averylong stringwithlotsofwords andpunctuationmarks! moreoverthere aresomenumbers1234
		andalsosome specialcharacterslike $%&/()=?^* andalsosome whitespaces
		Wewilltry.amuchlonger pieceoftext tocheck ifthe unanonymize functionworksproperly
		thisisjust averylong stringwithlotsofwords andpunctuationmarks! moreoverthere aresomenumbers1234
		andalsosome1 specialcharacterslike $%&/()=?^* andalsosome! whitespaces
		andtheend`;
		await editor.edit(editBuilder => {
			editBuilder.insert(new vscode.Position(0, 0), originalText);
		});
		let lineCount = editor.document.lineCount;
		editor.selection = new vscode.Selection(0, 0, lineCount - 1, editor.document.lineAt(lineCount - 1).text.length);
		// editor.selection = new vscode.Selection(0, 0, 0, originalText.length);
		printDebugInfo("originalText (should be full length and unsanitized", originalText);

		// Copy and sanitize
		await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');

		// Paste the result in some doc
		doc = await vscode.workspace.openTextDocument({ content: ' ' });
		editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
		
		// Assert that the third line of pastedText is the same as last line of pastedText
		const pastedText = editor.document.getText();
		printDebugInfo("pastedText (should be full length and sanitized)", pastedText); // this is empty
		const pastedLines = pastedText.split('\n');
		assert.strictEqual(pastedLines[2], pastedLines[9]);
		
		// Tokenize the pastedText, tokenize the originalText and assert that the two lists of token have no element in common
		const originalTokens = originalText.match(/\b\w+\b/g);
		const pastedTokens = pastedText.match(/\b\w+\b/g);
		originalTokens.forEach(token => {
			assert.strictEqual(pastedTokens.includes(token), false);
		});
		
		// Copy only part of the sanitized text
		let halfLines = 7;

		// // Adjust the selection such that it includes half the lines
		// editor.selection = new vscode.Selection(0, 0, halfLines, 0);
		// const finalText = editor.document.getText(editor.selection);
		// // Substring the originalText to include only the first 7 lines
		// const originalTextHalf = originalText.split('\n').slice(0, halfLines).join('\n');
		// assert.strictEqual(finalText, originalTextHalf);

		// Adjust the selection such that it includes half the lines
		editor.selection = new vscode.Selection(0, 0, halfLines, 0);

		// Copy the selected text
		await vscode.commands.executeCommand('editor.action.clipboardCopyAction');

		// Clear the editor
		await vscode.commands.executeCommand('editor.action.selectAll');
		await vscode.commands.executeCommand('editor.action.deleteLines');

		// Print the content of the clipboard
		const clipboardText = await vscode.env.clipboard.readText();
		printDebugInfo("clipboardText (should be half length and sanitized)", clipboardText);
		// Paste the copied text into the editor, replacing all text that's in there
		await vscode.commands.executeCommand('code-sanitizer.unanonymizeAndPaste');

		// Get the resulting text
		const finalText = editor.document.getText();

		// Substring the originalText to include only the first 7 lines
		const originalTextHalf = originalText.split('\n').slice(0, halfLines).join('\n');

		// Assert that the finalText is equal to the originalTextHalf
		printDebugInfo("finalText (should be half length and unsanitized)", finalText);
		printDebugInfo("originalTextHalf (should be half length and unsanitized)", originalTextHalf);
		assert.strictEqual(finalText, originalTextHalf);
    });

	// TODO    test('Test 02 unanonymizeAndPaste with SQL keywords', async () => {

});