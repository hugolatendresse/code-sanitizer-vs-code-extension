// TODO still need to sanitize what comes from custom libraries. Need a full list of all pipy librairies!


// two tokens before to see if it's "import", for example
const assert = require('assert');
const {findAllKeywordsInTree, findAllKeywordsInQuery, getAllNodes} = require("./python-tree-utils");
const debug = false;

// TODO: need to catch if import * is used and say that's not supported right now

// TODO see exactly what works and what doesn't below and prune the two functions above

// TODO: 'axis'=0 in pandas call need to be preserved too!!!. I can maybe only sanitize strings within function calls?? idk

// TODO handle numbers better? I could just not replace them, or replace by other numbers, OR replace by num1, num2, etc

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

function addEachTokenToResults(results, text) {
    const moduleTokens = text.match(/\b\w+\b/g);
    moduleTokens.forEach(token => {
        results.add(token);
    });
}

function processImports(importData, topPyPIProjectNames, debug=false) {
    const results = new Set();

    if (debug) {
        console.log("importData (input of processImports)",importData);
    }

    importData.forEach(entry => {
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
    });

    console.log("results from processImports",results);
    return Array.from(results);
}

function parsePythonScript(script, topPyPIProjectNames, debug=false) {
    const extractedImports = getImports(script, topPyPIProjectNames);
    const libraries = processImports(extractedImports, topPyPIProjectNames, debug);
    let results = new Set(libraries);
    let previousSize = -1;


    // TODO this was use before, need to see if any good, or if it adds anything
    // while (previousSize !== results.size) {
    //     if (debug) {
    //         console.log("STARTING LOOP!!!!!!!!!!!!!!!!!!!!!!!!")
    //         console.log("RESULT SIZE IS",results.size);
    //         console.log("SEARCHING FOR LIBRARIES",Array.from(results));
    //     }
    //
    //     previousSize = results.size;
    //
    //     // Create a regex pattern to match the library usage
    //     const libPattern = '\\b(' + libraries.join('|') + ')\\.([a-zA-Z_][a-zA-Z0-9_]*(?:\\.[a-zA-Z_][a-zA-Z0-9_]*)*)';
    //
    //     const pattern = new RegExp(libPattern, 'g');
    //
    //     // This will hold all matches found
    //     let match;
    //     while ((match = pattern.exec(script)) !== null) {
    //
    //         // Extract the function or module name after the library name
    //         if (debug) {
    //             console.log("MATCH IS",match);
    //         }
    //
    //         // Split the chain after the first property and add each one to the results
    //         const properties = match[2].split('.');
    //         properties.forEach(functionName => {
    //             if (functionName) {
    //                 if (debug) {
    //                     console.log("ADDING",functionName);
    //                 }
    //                 results.add(functionName);
    //                 if (debug) {
    //                     console.log("RESULTS SIZE IS NOW",results.size);
    //                 }
    //             }
    //         });
    //     }
    // }
    // return Array.from(results);
    const newKeyWords = findAllKeywordsInQuery(script, libraries);
    // Combine the two sets
    results = new Set([...results, ...newKeyWords]);
    return Array.from(results);
}



// Export parsePythonScript so it can be used in extension.js
module.exports = parsePythonScript;
