// TODO just create a huge dict of EVERY token in the script. Each token has its own dict that says what type of stuff it is. I can then easily look at
// two tokens before to see if it's "import", for example
const assert = require('assert');
const debug = false;


function getImports(script) {
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

function processImports(importData, debug=false) {
    const results = new Set();

    if (debug) {
        console.log("importData (input of processImports)",importData);
    }

    importData.forEach(entry => {
        // Add the main module no matter what
        results.add(entry.module);

        // Add the library nickname if it exists
        if (entry.libraryNickName) {
            results.add(entry.libraryNickName);
        }

        // Process each imported item
        entry.importedItems.forEach(item => {
            if (item.includes(' as ')) {
                // For aliasing, add only the alias name
                const [originalName, aliasName] = item.split(' as ');
                results.add(originalName.trim());
                results.add(aliasName.trim());
            } else {
                // For simple imports, add only the name of the imported item
                results.add(item.trim());
            }
        });
    });

    console.log("results from processImports",results);
    return Array.from(results);
}

function parsePythonScript(script, debug=false) {
    const extractedImports = getImports(script);
    const libraries = processImports(extractedImports, debug);
    let results = new Set(libraries);
    let previousSize = -1;

    while (previousSize !== results.size) {
        if (debug) {
            console.log("STARTING LOOP!!!!!!!!!!!!!!!!!!!!!!!!")
            console.log("RESULT SIZE IS",results.size);    
            console.log("SEARCHING FOR LIBRARIES",Array.from(results));
        }

        previousSize = results.size;

        // Create a regex pattern to match the library usage
        // const libPattern ='\\b(' + libraries.join('|') + ')\\.([a-zA-Z_][a-zA-Z0-9_]*)';
        const libPattern = '\\b(' + libraries.join('|') + ')\\.([a-zA-Z_][a-zA-Z0-9_]*(?:\\.[a-zA-Z_][a-zA-Z0-9_]*)*)';
   
        const pattern = new RegExp(libPattern, 'g');

        // This will hold all matches found
        let match;
        while ((match = pattern.exec(script)) !== null) {

            // Extract the function or module name after the library name
            if (debug) {
                console.log("MATCH IS",match);
            }
            
            // Split the chain after the first property and add each one to the results
            const properties = match[2].split('.');
            properties.forEach(functionName => {
                if (functionName) {
                    if (debug) {
                        console.log("ADDING",functionName);
                    }
                    results.add(functionName);
                    if (debug) {
                        console.log("RESULTS SIZE IS NOW",results.size);
                    }
                }
            });
        }
    }
    return Array.from(results);
}



// TODO: need to catch if import * is used and say that's not supported right now

// TODO see exactly what works and what doesn't below and prune the two functions above

// TODO: 'axis'=0 in pandas call need to be preserved too!!!. I can maybe only sanitize strings within function calls?? idk

// TODO need to catch stillincluded6 (see test script)


// Export parsePythonScript so it can be used in extension.js
module.exports = parsePythonScript;
