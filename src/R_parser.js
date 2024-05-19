
const { printDebugInfo } = require('./utils-testing');

// two tokens before to see if it's "import", for example
const assert = require('assert');
const {getAllNodes, findNodeByText, findAllPythonKeywordsInTree, findAllPythonKeywordsInQuery} = require("./utils-python");
const debug = false;


// Returns a dictionary describing the imports and modules used in the Python script.
function getRImports(script, topPyPIProjectNames) {

    // TODO need to refactor this since it won't be able to handle imports over multiple lines (with a \)
    // TODO so simply refactor with tree parse!!

    const importRegex = /^\s*import\s+([a-zA-Z0-9_]+)(\s+as\s+([a-zA-Z0-9_]+))?|^\s*from\s+([a-zA-Z0-9_.]+)\s+import\s+(.*)$/gm;
    let match;
    const imports = [];

    while ((match = importRegex.exec(script)) !== null) {
        if (match[1]) {
            // This is a direct import statement, e.g., import numpy as np
            const alias = match[3] || '';  // Captures alias if present
            imports.push({ module: match[1], importedItems: [], libraryNickName: alias });
        } else if (match[4] && match[5]) {
            // This is a from...import statement, e.g., from os import path as os_path, system
            const items = match[5].split(',').map(item => {
                const parts = item.trim().split(/\s+as\s+/);
                return parts.length > 1 ? `${parts[0]} as ${parts[1]}` : parts[0];
            });
            imports.push({ module: match[4], importedItems: items, libraryNickName: '' });
        }
    }
    return imports;
}

// Allows adding individual tokens to the results set
function addEachRTokenToResults(results, text) {
    const moduleTokens = text.match(/\b\w+\b/g);
    moduleTokens.forEach(token => {
        results.add(token);
    });
}

// Adds everything that needs to be added to the list of keywords from the dictionary of imports 
function processRImports(importData, topPyPIProjectNames, debug=false) {
    const results = new Set();

    if (debug) {
        console.log("importData (input of processImports)", importData);
    }

    importData.forEach(entry => {
        // Only include if the module is a PyPI project. Need to look at first token in entry.module
        const firstToken = entry.module.split('.')[0];

        //Print the type of topPyPIProjectNames
        // printDebugInfo("process Imports topPyPIProjectNames", topPyPIProjectNames);
        // printDebugInfo("process Imports topPyPIProjectNames type", typeof topPyPIProjectNames);
        // printDebugInfo("process Imports topPyPIProjectNames size", topPyPIProjectNames.size);
        
        if (topPyPIProjectNames.has(firstToken)) {
            // Add all tokens in the module no matter what
            addEachTokenToResults(results, entry.module);

            // Add the library nickname if it exists
            if (entry.libraryNickName) {
                results.add(entry.libraryNickName);
            }

            // Process each imported item
            // TODO important items can probably have dots in them, so need to split on dots and add each part
            entry.importedItems.forEach(item => {
                if (item.includes(' as ')) {
                    // For aliasing, add only the alias name
                    const [originalName, aliasName] = item.split(' as ');
                    addEachTokenToResults(results, originalName.trim());
                    addEachTokenToResults(results, aliasName.trim());
                } else {
                    // For simple imports, add only the name of the imported item
                    addEachTokenToResults(results, item.trim());
                }
            });
        }
    });

    return Array.from(results);
}

function parseRScript(script, toRProjectNames, debug=false) {
    const extractedImports = getRImports(script, toRProjectNames);
    const libraries = processRImports(extractedImports, toRProjectNames, debug);
    let results = new Set(libraries);
    let previousSize = -1;
    const newKeyWords = findAllPythonKeywordsInQuery(script, libraries);
    // Combine the two sets
    results = new Set([...results, ...newKeyWords]);
    return Array.from(results);
}

// Export parsePythonScript so it can be used in extension.js
module.exports = parseRScript;
