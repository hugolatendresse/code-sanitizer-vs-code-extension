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


const pythonScript = `
import os
import numpy as np
from os import path as os_path, system
import pandas as pd
from matplotlib import pyplot as plt
from copy import deepcopy
`;

// TODO: need to catch if import * is used and say that's not supported right now

// TODO see exactly what works and what doesn't below and prune the two functions above

const extractedImports = getImports(pythonScript);
console.log("pythonScript2:\n",pythonScript);
console.log("nicknamesfunc:\n",extractedImports);