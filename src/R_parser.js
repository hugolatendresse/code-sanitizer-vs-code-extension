const R_packages_objects = require('../assets/R_packages_objects.json');
const { printDebugInfo } = require('./utils-testing');

// two tokens before to see if it's "import", for example
const assert = require('assert');
const {getAllNodes, findNodeByText, findAllPythonKeywordsInTree, findAllPythonKeywordsInQuery} = require("./utils-python");
const Parser = require("tree-sitter");
const Python = require("tree-sitter-python");
// const R = require("tree-sitter-r");




// Allows adding individual tokens to the results set
function addEachRTokenToResults(results, text) {
    const moduleTokens = text.match(/\b\w+\b/g);
    moduleTokens.forEach(token => {
        results.add(token);
    });
}

// Adds everything that needs to be added to the list of keywords from the dictionary of imports
function getRLibraries(script, topRProjectNames) {
    // Create a subset of all topRProjectNames that appear in the script
    // Iterate over the tokens in the script
    const tokens = script.match(/\b\w+\b/g);
    // Iterate and check which of the topRProjectNames are in the script
    const topRProjectNamesInScript = new Set();
    tokens.forEach(token => {
        if (topRProjectNames.has(token)) {
            topRProjectNamesInScript.add(token);
        }
    });
    return topRProjectNamesInScript;
}

function isParentOfCallR(node, keyWords) {
    try {
        let callCondition = node.children.length === 3 && node.children[1].text === '.' && node.children[2].type === 'identifier';
        const firstIdentifier = node.children[0].text; // TODO function name shold be a keyword!
        // let libraryCond = keyWords.some(keyword => firstIdentifier.startsWith(keyword));
        return callCondition && libraryCond;
    } catch (error) {
        return false;
    }
}


function isRKeywordArgumentOfMethodFromLibrary(node, keyWordsArray) {
    try {
        // Some functions except user-defined keywords that must be sanitizes
        const functionExceptions = ["mutate", "summarize", "filter"];
        keyWordsArray = keyWordsArray.filter(keyword => !functionExceptions.includes(keyword)); // filter is not in-place in JS

        let libraryCond = keyWordsArray.some(keyword => node.parent.parent.text.startsWith(keyword));
        let keywordCond = node.type === 'keyword_argument' && node.children[0].type === 'identifier' && node.parent.parent.type === 'call';
        const cond = libraryCond && keywordCond;
        return cond;
    } catch (error) {
        return false;
    }
}



function findAllRKeywordsInTree(tree, keyWordsArray) {
    const result = [];
    let visitedChildren = false;
    let cursor = tree.walk();
    while (true) {
        if (!visitedChildren) {

            // Add different types of keywords
            if (isRKeywordArgumentOfMethodFromLibrary(cursor.currentNode, keyWordsArray)) {
                // Add keywords of arguments in function calls
                const keyword = cursor.currentNode.children[0].text;
                result.push(keyword);
            }

            // Continue walking the tree
            if (!cursor.gotoFirstChild()) {
                visitedChildren = true;
            }
        } else if (cursor.gotoNextSibling()) {
            visitedChildren = false;
        } else if (!cursor.gotoParent()) {
            break;
        }
    }
    return result;
}


function findAllRKeywordsInQuery(script, keyWordsArray) {
      const parser = new Parser();
      parser.setLanguage(Python);
      const tree = parser.parse(script);
      return findAllRKeywordsInTree(tree, keyWordsArray);

}

function parseRScript(script, topRProjectNames) {
    const libraries = getRLibraries(script, topRProjectNames);

    // Load assets/R_packages_objects.json, which is a dictionary whre keys are libraries and values are lists of functions
    let results = new Set();
    // Add all the functions from the libraries to the results set


    // Skip if libraries is empty
    if (libraries.size === 0) {
        return [];
    }

    libraries.forEach(library => {
        const functions = R_packages_objects[library];
        functions.forEach(func => {
            results.add(func);
        });
    });

    let keyWords = new Set([...results, ...libraries]);

    const Arguments = findAllRKeywordsInQuery(script, [...keyWords]);

    const keywordsAndArguments = new Set([...keyWords, ...Arguments]);
    // Combine the two sets
    return Array.from(keywordsAndArguments);
}

// Export parsePythonScript so it can be used in extension.js
module.exports = parseRScript;
