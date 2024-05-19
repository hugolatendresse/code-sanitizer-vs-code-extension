
const { printDebugInfo } = require('./utils-testing');

// two tokens before to see if it's "import", for example
const assert = require('assert');
const {getAllNodes, findNodeByText, findAllPythonKeywordsInTree, findAllPythonKeywordsInQuery} = require("./utils-python");
const Parser = require("tree-sitter");
const R = require("tree-sitter-r");
const debug = false;


// Returns a dictionary describing the imports and modules used in the Python script.
function getRImports(script) {










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

function parseRScript(script, topRProjectNames, debug=false) {
    const extractedImports = getRImports(script, topRProjectNames);
    const libraries = processRImports(extractedImports, topRProjectNames, debug);
    let results = new Set(libraries);
    let previousSize = -1;
    const newKeyWords = findAllRKeywordsInQuery(script, libraries);
    // Combine the two sets
    results = new Set([...results, ...newKeyWords]);
    return Array.from(results);
}

// Export parsePythonScript so it can be used in extension.js
module.exports = parseRScript;


// TODO handle this for package loading
//         packages <- c("actuary", "ragg", "R6")
//         lapply(packages, library, character.only = TRUE)



const rscripttest = `
        # Load the necessary libraries
        library(ggplot2)
        library("dplyr")
        
        # Load data (you can replace this with your actual data source)
        data("mtcars")  # Using mtcars dataset for demonstration
        
        # Use dplyr to manipulate the dataset
        filtered_data <- mtcars %>%
          select(wt, mpg) %>%
          filter(mpg <= 30)  # Filtering to focus on cars with mpg 30 or less
        
        # Create the scatter plot using ggplot2
        ggplot(filtered_data, aes(x = wt, y = mpg)) +
          geom_point(aes(color = wt), size = 3) +  # Points colored by weight
          geom_smooth(method = "lm", se = FALSE, color = "blue") +  # Add a regression line
          labs(title = "Car Weight vs. MPG",
               x = "Weight (1000 lbs)",
               y = "Miles per Gallon",
               color = "Weight") +
          theme_minimal()  # Use a minimal theme for the plot
		`
const parser = new Parser();
parser.setLanguage(R);
const tree = parser.parse(rscripttest);


const result = [];
let visitedChildren = false;
let cursor = tree.walk();
while (true) {
    if (!visitedChildren) {

        // Add different types of keywords
        if (isParentOfCallPython(cursor.currentNode, keyWords)) {
            // Add method calls following a '.'
            const secondIdentifier = cursor.currentNode.children[2].text;
            result.push(secondIdentifier);
        } else if (isPythonKeywordArgumentOfMethodFromLibrary(cursor.currentNode, keyWords)) {
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
// return result;



console.log("hi");
// findAllPythonKeywordsInTree(tree, keyWords);