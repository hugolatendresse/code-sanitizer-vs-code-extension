function parsePythonImports(script) {
    const importRegex = /^\s*import\s+([a-zA-Z0-9_]+)|^\s*from\s+([a-zA-Z0-9_.]+)\s+import\s+(.*)$/gm;
    let match;
    const imports = [];

    while ((match = importRegex.exec(script)) !== null) {
        if (match[1]) {
            // This is a direct import statement, e.g., import numpy
            imports.push({ module: match[1], importedItems: [] });
        } else if (match[2] && match[3]) {
            // This is a from...import statement, e.g., from os import path
            let items = match[3].split(',').map(item => item.trim());
            imports.push({ module: match[2], importedItems: items });
        }
    }

    return imports;
}

const pythonScript = `
import numpy as np
from os import path, system
import pandas as pd
from matplotlib import pyplot as plt
`;

// TODO: need to catch if import * is used and say that's not supported right now

const imports = parsePythonImports(pythonScript);
console.log(imports);