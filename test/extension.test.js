// to run: npm test


const vscode = require('vscode');
const assert = require('assert');
const parsePythonScript = require('../src/python_parser');
const topPyPIProjectNames = new Set(require('../assets/top-pypi-project-names-all'));
const {printDebugInfo, assertAllTokensDifferent, assertSomeTokensSame, assertSetsEqual} = require('../src/utils-testing');

suite('Extension Test Suite', () => {

    test('Test 00 anonymizeAndCopy all sanitized', async () => {
        const doc = await vscode.workspace.openTextDocument({content: ' '});
        const editor = await vscode.window.showTextDocument(doc);
        assert.ok(editor, 'No active editor');
        editor.selection = new vscode.Selection(0, 0, 0, 10);
        const originalText = 'table2.somename allthe01 wordshere 23432 shouldbe.sanitized0';
        await editor.edit(editBuilder => {
            editBuilder.replace(editor.selection, originalText);
        });
        await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');
        const clipboardText = await vscode.env.clipboard.readText();
        assertAllTokensDifferent(originalText, clipboardText);
    });

    test('Test 01 anonymizeAndCopy with SQL keywords', async () => {
        const doc = await vscode.workspace.openTextDocument({content: ' '});
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

    test('Test 03 unanonymizeAndPaste ultra simple', async () => {
        let doc = await vscode.workspace.openTextDocument({content: ' '});
        let editor = await vscode.window.showTextDocument(doc);
        let document = editor.document;
        assert.ok(editor, 'No active editor');
        const originalText = `thisisa verysimple testfor theunanonymizefunction`;
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), originalText);
        });

        // Copy and sanitize
        editor.selection = new vscode.Selection(0, 0, 0, originalText.length);
        await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');

        // Clear the editor
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('editor.action.deleteLines');

        // Paste in editor
        await vscode.commands.executeCommand('editor.action.clipboardPasteAction');

        // Assert that every token in selection is different from the original text
        assertAllTokensDifferent(originalText, document.getText());

        // Set clipboard to something random (to make sure we're grabbing sanitized text)
        await vscode.env.clipboard.writeText("random text");

        // Copy all text in the editor such that clipboard contains the sanitized text
        editor.selection = new vscode.Selection(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
        await vscode.commands.executeCommand('editor.action.clipboardCopyAction');

        // Assert that every token in the clipboard is different from the original text
        assertAllTokensDifferent(originalText, await vscode.env.clipboard.readText());

        // Replace all text in the editor with "hello world"
        // const text_before_helloworld = document.getText();
        // printDebugInfo("text_before_priting_hello_world", text_before_helloworld);
        await editor.edit(editBuilder => {
            // Create a range that covers the entire document
            let range = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            // Replace the range with "hello world"
            editBuilder.replace(range, "hello world");
        });

        // Replace all text in the editor with the unsanitized text
        assertAllTokensDifferent(originalText, document.getText());
        editor.selection = new vscode.Selection(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
        await vscode.commands.executeCommand('code-sanitizer.unanonymizeAndPaste');

        // Assert that the finalText is equal to the originalTextHalf
        assert.strictEqual(document.getText(), originalText);
    });

    test('Test 04 unanonymizeAndPaste half, no SQL', async () => {
        let doc = await vscode.workspace.openTextDocument({content: ' '});
        let editor = await vscode.window.showTextDocument(doc);
        let document = editor.document;
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

        // Copy and sanitize
        let lineCount = editor.document.lineCount;
        editor.selection = new vscode.Selection(0, 0, lineCount - 1, editor.document.lineAt(lineCount - 1).text.length);
        await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');

        // Clear the editor
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('editor.action.deleteLines');

        // Paste in editor so that editor contains sanitized text
        await vscode.commands.executeCommand('editor.action.clipboardPasteAction');

        // Assert that every token in selection is different from the original text
        assertAllTokensDifferent(originalText, document.getText());

        // Assert that the third line of pastedText is the same as penultimate line of pastedText
        // This is to make sure that same symbols get mapped to same sanitized tokens
        const pastedLines = document.getText().split('\n');
        assert.strictEqual(pastedLines[2], pastedLines[9]);

        // Set clipboard to something random
        await vscode.env.clipboard.writeText("random text");

        // Copy half of text in the editor such that clipboard contains 7 lines of sanitized text
        let halfLines = 7;
        editor.selection = new vscode.Selection(0, 0, halfLines, 0);
        await vscode.commands.executeCommand('editor.action.clipboardCopyAction');

        // Assert that every token in the clipboard is different from the original text
        assertAllTokensDifferent(originalText, await vscode.env.clipboard.readText());  // Won't be true with SQL

        // Replace all text in the editor with "hello world"
        // const text_before_helloworld = document.getText();
        // printDebugInfo("text_before_priting_hello_world", text_before_helloworld);
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('editor.action.deleteLines');
        await editor.edit(editBuilder => {
            // Create a range that covers the entire document
            let range = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            // Replace the range with "hello world"
            editBuilder.replace(range, "hello world");
        });

        // Replace all text in the editor with the unsanitized text
        assertAllTokensDifferent(originalText, document.getText());
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('code-sanitizer.unanonymizeAndPaste');

        // Assert that the finalText is equal to the first 7 lines of the originalText
        const originalTextHalf = originalText.split('\n').slice(0, halfLines).join('\n') + '\r\n';
        // printDebugInfo("originalTextHalf", originalTextHalf);
        // printDebugInfo("finalText", document.getText());
        assert.strictEqual(document.getText().replace(/\r\n/g, '\n'), originalTextHalf.replace(/\r\n/g, '\n'));
    });

    test('Test 04 unanonymizeAndPaste half, with SQL keywords', async () => {
        let doc = await vscode.workspace.openTextDocument({content: ' '});
        let editor = await vscode.window.showTextDocument(doc);
        let document = editor.document;
        assert.ok(editor, 'No active editor');
        const originalText = `Wewilltry.amuchlonger pieceoftext tocheck ifthe unanonymize functionworksproperly
		thisisjust averylong stringwithlotsofwords LEFT JOIN moreoverthere aresomenumbers1234
		where specialcharacterslike $%&/()=?^* ORDER BY andalsosome! SELECT
		andthen, itrepeasts 2 times
		Wewilltry.amuchlonger pieceoftext tocheck ifthe unanonymize functionworksproperly
		thisisjust averylong stringwithlotsofwords LEFT JOIN moreoverthere 1
		where specialcharacterslike $%&/()=?^* andalsosome SELECT
		Wewilltry.amuchlonger pieceoftext tocheck ifthe unanonymize functionworksproperly
		thisisjust averylong stringwithlotsofwords LEFT JOIN moreoverthere aresomenumbers1234
		where specialcharacterslike $%&/()=?^* ORDER BY andalsosome! SELECT
		andtheend`;
        const sameExpectedTokens = ["SELECT", "ORDER", "BY", "where", "LEFT", "JOIN", "1", "2"];
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), originalText);
        });

        // Copy and sanitize
        let lineCount = editor.document.lineCount;
        editor.selection = new vscode.Selection(0, 0, lineCount - 1, editor.document.lineAt(lineCount - 1).text.length);
        await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');

        // Clear the editor
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('editor.action.deleteLines');

        // Paste in editor so that editor contains sanitized text
        await vscode.commands.executeCommand('editor.action.clipboardPasteAction');

        // Assert that every token in selection is different from the original text, except for SQL words
        assertSomeTokensSame(originalText, document.getText(), sameExpectedTokens);

        // Assert that the third line of pastedText is the same as penultimate line of pastedText
        // This is to make sure that same symbols get mapped to same sanitized tokens
        const pastedLines = document.getText().split('\n');
        assert.strictEqual(pastedLines[2], pastedLines[9]);

        // Set clipboard to something random
        await vscode.env.clipboard.writeText("random text");

        // Copy half of text in the editor such that clipboard contains 7 lines of sanitized text
        // Print all text in editor
        // printDebugInfo("document.getText() line 274 (expected 10 lines of sanitized text)", document.getText());
        let halfLines = 7;
        editor.selection = new vscode.Selection(0, 0, halfLines, 0);
        await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        await new Promise(resolve => setTimeout(resolve, 100));

        // Assert that every token in selection is different from the original text, except for SQL words
        // printDebugInfo("originalText line 280, expect 10 lines of unsanitized text", originalText);
        const clipboardText = await vscode.env.clipboard.readText();
        // printDebugInfo("vscode.env.clipboard.readText() line 282 (expect 7 lines of sanitized text)", clipboardText);
        assertSomeTokensSame(originalText, clipboardText, sameExpectedTokens);  // this line randomly fails!!

        // Replace all text in the editor with "hello world"
        // const text_before_helloworld = document.getText();
        // printDebugInfo("text_before_priting_hello_world", text_before_helloworld);
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('editor.action.deleteLines');
        await editor.edit(editBuilder => {
            // Create a range that covers the entire document
            let range = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            // Replace the range with "hello world"
            editBuilder.replace(range, "hello world");
        });

        // Replace all text in the editor with the unsanitized text
        assertAllTokensDifferent(originalText, document.getText());  // Should have nothing in common with Hello World
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('code-sanitizer.unanonymizeAndPaste');

        // Assert that the finalText is equal to the first 7 lines of the originalText
        const originalTextHalf = originalText.split('\n').slice(0, halfLines).join('\n') + '\r\n';
        // printDebugInfo("originalTextHalf", originalTextHalf);
        // printDebugInfo("finalText", document.getText());
        assert.strictEqual(document.getText().replace(/\r\n/g, '\n'), originalTextHalf.replace(/\r\n/g, '\n'));
    });


});


suite('Python Parser Test Suite', () => {

    test('Test 00 pythonParser (7 lines)', async () => {
        const pythonScript = `
		import os
		import numpy as np
		from os import path as os_path, \
		system
		import pandas as pd
		from matplotlib import pyplot as plt
		from copy import deepcopy

		some_var = pd.functoinclude1.sum(pandas.read_csv(os.path.join('data','some folder with np.DONTGRAB in ) it' ,var1)['some column'].mean(), axis=0))
		other_var = some_var + pd.functoinclude1.functounclude2.otherfunctoinclude3.shouldalsobethere4 \
		.stillincluded5('hello world').stillincluded6
		`;

        const expectedFinalanser = ["os", "np", "os_path", "system", "pd", "plt", "deepcopy",
            "numpy",
            "path",
            "pandas",
            "matplotlib",
            "pyplot",
            "copy",
            "sum",
            "read_csv",
            "join",
            "mean",
            "functoinclude1",
            "functounclude2",
            "otherfunctoinclude3",
            "shouldalsobethere4",
            "stillincluded5",
            "stillincluded6",
            "axis",
        ];
        const parsePythonScript_out = parsePythonScript(pythonScript, topPyPIProjectNames,false);
        assertSetsEqual(parsePythonScript_out, expectedFinalanser, 'final does not equal expectedFinalanser'); // Only Difference: stillincluded6
    });

    test('Test 01 pythonparser (100 lines)', async () => {
        let doc = await vscode.workspace.openTextDocument({content: ' '});
        let editor = await vscode.window.showTextDocument(doc);
        let document = editor.document;
        assert.ok(editor, 'No active editor');
        const originalText = `from sklearn.metrics.pairwise import linear_kernel, cosine_similarity, euclidean_distances
import numpy as np
import pandas as pd
from scipy.spatial.distance import euclidean
from owapy.tools.time_it import time_it
from sklearn.feature_extraction.text import TfidfVectorizer

from common_paths import join_to_local_dir

out_length = 10

# TODO: the main improvement here would be to have my own tokenizer. For example, insteaf of "slip and fall" being mapped to "slip" and "fall", it
#  should be mapped to "slip", "fall", and "slip and fall"

# TODO try everything on facebook posts data!!

# Sample data
data = {'ID1': 'This is a sample paragraph.',
        'ID2': 'Another example of text.',
        'ID3': 'Writing more examples.'}
df_path = join_to_local_dir("data", "Claim Adjusters Notes Sample (RRT-46784).xlsx")
df = pd.read_excel(df_path)

for index, row in df.iterrows():
    note = row['note']
    if isinstance(note, str):
        data[index] = note

# Pre-processing  # TODO add more steps? Removing from strings, map synonyms, etc
# TODO probably a good idea to break up sentences into different records. This way, smaller chance that all the words happen to all appear
#  randomly in a long document
df.dropna(subset='note', axis=0, inplace=True)
notes1= df['note'].values

# Since this one uses normalized vectors (and cosine sim), a short note with just one of the key words could be given a high score.

# TODO it's worht noting that so far binary tf is probably best because my documents are very short. In general, sublinear-tf is used for large documents.
#  I don't think it would be good idea to group notes together (indeed I think we might want to do the opposite), but it could still be a good idea
#  to use sublinear-tf if it turns out we work with documents larger than ~ 10 words

def tfidf_with_reg_tf(query, notes):
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf_vectorizer.fit_transform(notes)
    # feature_names = tfidf_vectorizer.get_feature_names_out()
    query_vector = tfidf_vectorizer.transform([query])
    cosine_similarities = cosine_similarity(tfidf_matrix, query_vector.reshape(1, -1)).flatten()
    related_docs_indices = cosine_similarities.argsort()[:-out_length:-1]
    print("Results for tf-idf with regular term frequency")
    print(notes[related_docs_indices])
    print("\\n")


def tfidf_with_binary_tf(query, notes):
    # This one is closer to simply checking whether each word of the query is present in the note. In case of equality, unusual words will be given precedence
    # Tried different ways (normalzied, cosine) and this was the best
    tfidf_vectorizer = TfidfVectorizer(stop_words='english', norm=None, binary=True)
    tfidf_matrix = tfidf_vectorizer.fit_transform(notes)
    query_vector = tfidf_vectorizer.transform([query])
    dot_products= tfidf_matrix.dot(query_vector.T).toarray().flatten()
    related_docs_indices = dot_products.argsort()[:-out_length:-1]
    print("Results for tf-idf with binary term frequency")
    print(notes[related_docs_indices])
    print("\\n")


def tfidf_with_sublinear_tf(query, notes):
    # Tried sublinear term frequency in multiple ways, did not do very well
    # Tried different ways (unnormalzied, dot product) and this was the best
    tfidf_vectorizer = TfidfVectorizer(stop_words='english', sublinear_tf=True)
    tfidf_matrix = tfidf_vectorizer.fit_transform(notes)
    # feature_names = tfidf_vectorizer.get_feature_names_out()
    query_vector = tfidf_vectorizer.transform([query])
    cosine_similarities = cosine_similarity(tfidf_matrix, query_vector.reshape(1, -1)).flatten()
    related_docs_indices = cosine_similarities.argsort()[:-out_length:-1]
    print("Results for tf-idf with sublinear term frequency")
    print(notes[related_docs_indices])
    print("\\n")

def transform_with_numpy(an_array):
    # Reshape, transpose, and flatten a multi-dimensional array
    another_array = an_array.reshape(1, -1).T
    return np.sum(another_array.flatten())

def transform_with_pandas(df):
    # Remove some columns
    df.drop(columns=['ID', 'note'], inplace=True)
    # Create a new column as the sum of two other columns
    df['col3'] = df['col1'] + df['col2']
    somevar = df['col3'].apply(lambda x: x + 1).sum(axis=0, skipna=True)
    return somevar

# TODO try Okapi BM25: This is a more complex variation that takes into account both term frequency and document length. It also uses a non-linear function to calculate the idf value.

# TODO it probably makes sense to do tf-idf first to at least filter notes that share any word with the prompt. Then we can use nlp on that subset
if __name__ == "__main__":
    query = 'the employee is a customer accounts manager' # Binary tf is the best!
    query = 'slip and fall'  # Binary tf is the best!
    tfidf_with_reg_tf(query, notes=notes1)
    tfidf_with_binary_tf(query, notes1)
    tfidf_with_sublinear_tf(query=query, notes=notes1)
`;
        const sameExpectedTokens = ["SELECT", "ORDER", "BY", "where", "LEFT", "JOIN", "1", "2"];
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), originalText);
        });

        // Copy and sanitize
        let lineCount = editor.document.lineCount;
        editor.selection = new vscode.Selection(0, 0, lineCount - 1, editor.document.lineAt(lineCount - 1).text.length);
        await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');

        // Clear the editor
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('editor.action.deleteLines');

        // Paste in editor so that editor contains sanitized text
        await vscode.commands.executeCommand('editor.action.clipboardPasteAction');

        // Assert that every token in selection is different from the original text, except for SQL words
        assertSomeTokensSame(originalText, document.getText(), sameExpectedTokens);

        // Assert that the third line of pastedText is the same as penultimate line of pastedText
        // This is to make sure that same symbols get mapped to same sanitized tokens
        const pastedLines = document.getText().split('\n');
        assert.strictEqual(pastedLines[2], pastedLines[9]);

        // Set clipboard to something random
        await vscode.env.clipboard.writeText("random text");

        // Copy half of text in the editor such that clipboard contains 7 lines of sanitized text
        // Print all text in editor
        // printDebugInfo("document.getText() line 274 (expected 10 lines of sanitized text)", document.getText());
        let halfLines = 7;
        editor.selection = new vscode.Selection(0, 0, halfLines, 0);
        await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        await new Promise(resolve => setTimeout(resolve, 100));

        // Assert that every token in selection is different from the original text, except for SQL words
        // printDebugInfo("originalText line 280, expect 10 lines of unsanitized text", originalText);
        const clipboardText = await vscode.env.clipboard.readText();
        // printDebugInfo("vscode.env.clipboard.readText() line 282 (expect 7 lines of sanitized text)", clipboardText);
        assertSomeTokensSame(originalText, clipboardText, sameExpectedTokens);  // this line randomly fails!!

        // Replace all text in the editor with "hello world"
        // const text_before_helloworld = document.getText();
        // printDebugInfo("text_before_priting_hello_world", text_before_helloworld);
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('editor.action.deleteLines');
        await editor.edit(editBuilder => {
            // Create a range that covers the entire document
            let range = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            // Replace the range with "hello world"
            editBuilder.replace(range, "hello world");
        });

        // Replace all text in the editor with the unsanitized text
        assertAllTokensDifferent(originalText, document.getText());  // Should have nothing in common with Hello World
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('code-sanitizer.unanonymizeAndPaste');

        // Assert that the finalText is equal to the first 7 lines of the originalText
        const originalTextHalf = originalText.split('\n').slice(0, halfLines).join('\n') + '\r\n';
        // printDebugInfo("originalTextHalf", originalTextHalf);
        // printDebugInfo("finalText", document.getText());
        assert.strictEqual(document.getText().replace(/\r\n/g, '\n'), originalTextHalf.replace(/\r\n/g, '\n'));
    });



});