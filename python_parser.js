// TODO just create a huge dict of EVERY token in the script. Each token has its own dict that says what type of stuff it is. I can then easily look at
// two tokens before to see if it's "import", for example


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

function processImports(importData) {
    const results = new Set();

    importData.forEach(entry => {
        // Add the main module if no specific imports are listed and no nickname is given
        if (entry.importedItems.length === 0 && !entry.libraryNickName) {
            results.add(entry.module);
        }

        // Add the library nickname if it exists
        if (entry.libraryNickName) {
            results.add(entry.libraryNickName);
        }

        // Process each imported item
        entry.importedItems.forEach(item => {
            if (item.includes(' as ')) {
                // For aliasing, add only the alias name
                const [originalName, aliasName] = item.split(' as ');
                results.add(aliasName.trim());
            } else {
                // For simple imports, add only the name of the imported item
                results.add(item.trim());
            }
        });
    });

    return Array.from(results);
}

function parsePythonScript(script, libraries) {
    const results = [];
    // Create a regex pattern to match the library usage
    const libPattern = libraries.map(lib => `${lib}\\s*\\.\\s*([a-zA-Z_][a-zA-Z0-9_]*)`).join('|');
    const pattern = new RegExp(libPattern, 'g');

    // This will hold all matches found
    let match;
    while ((match = pattern.exec(script)) !== null) {
        // Extract the function or module name after the library name
        const functionName = match[1] || match[3] || match[5]; // Depending on which library matched
        if (functionName && !results.includes(functionName)) {
            results.push(functionName);
        }
    }

    return results;
}

const pythonScript = `
import os
import numpy as np
from os import path as os_path, system
import pandas as pd
from matplotlib import pyplot as plt
from copy import deepcopy

some_var = np.sum(pandas.read_csv(os.path.join('data','some folder',var1)['some column'], axis=0))
other_var = some_var + pd.functoinclude1.functounclude2.otherfunctoinclude3.shouldalsobethere4.stillincluded5('hello world').stillincluded6
`;

// TODO: need to catch if import * is used and say that's not supported right now

// TODO see exactly what works and what doesn't below and prune the two functions above

const extractedImports = getImports(pythonScript);
console.log("pythonScript2:\n",pythonScript);
console.log("extracted imports\n",extractedImports);

console.log("\n\n\n")

const expectedLibraries = ["os", "np", "os_path", "system", "pd", "plt", "deepcopy"];
const libraries = processImports(extractedImports);
// Assertion that libraries equal expectedLibraries
// console.log("libraries\n",libraries);
// console.log("expectedLibrarries\n",expectedLibraries);
const assert = require('assert');
assert.deepStrictEqual(libraries, expectedLibraries, 'libraries does not equal expectedLibraries');


console.log("\n\n\n\n")


const usedNames = parsePythonScript(pythonScript, libraries);
// Ass
console.log(usedNames);
