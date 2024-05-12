// TODO still need to sanitize what comes from custom libraries. Need a full list of all pipy librairies!

const { printDebugInfo } = require('./utils-testing');

// two tokens before to see if it's "import", for example
const assert = require('assert');
const {getAllNodes, findNodeByText, findAllKeywordsInTree, findAllKeywordsInQuery} = require("./utils-python");
const debug = false;

// TODO: need to catch if import * is used and say that's not supported right now

// TODO see exactly what works and what doesn't below and prune the two functions above

// TODO: 'axis'=0 in pandas call need to be preserved too!!!. I can maybe only sanitize strings within function calls?? idk

// TODO handle numbers better? I could just not replace them, or replace by other numbers, OR replace by num1, num2, etc

// Returns a dictionary describing the imports and modules used in the Python script.
function getImports(script, topPyPIProjectNames) {

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
function addEachTokenToResults(results, text) {
    const moduleTokens = text.match(/\b\w+\b/g);
    moduleTokens.forEach(token => {
        results.add(token);
    });
}

// Adds everything that needs to be added to the list of keywords from the dictionary of imports 
function processImports(importData, topPyPIProjectNames, debug=false) {
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

function parsePythonScript(script, topPyPIProjectNames, debug=false) {
    const extractedImports = getImports(script, topPyPIProjectNames);
    const libraries = processImports(extractedImports, topPyPIProjectNames, debug);
    let results = new Set(libraries);
    let previousSize = -1;
    const newKeyWords = findAllKeywordsInQuery(script, libraries);
    // Combine the two sets
    results = new Set([...results, ...newKeyWords]);
    return Array.from(results);
}



// Export parsePythonScript so it can be used in extension.js
module.exports = parsePythonScript;
