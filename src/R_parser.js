const R_packages_objects = require('../assets/R_packages_objects.json');
const { printDebugInfo } = require('./utils-testing');

// two tokens before to see if it's "import", for example
const assert = require('assert');
const {getAllNodes, findNodeByText, findAllPythonKeywordsInTree, findAllPythonKeywordsInQuery} = require("./utils-python");
const Parser = require("tree-sitter");
// const R = require("tree-sitter-r");




// Allows adding individual tokens to the results set
function addEachRTokenToResults(results, text) {
    const moduleTokens = text.match(/\b\w+\b/g);
    moduleTokens.forEach(token => {
        results.add(token);
    });
}

// Adds everything that needs to be added to the list of keywords from the dictionary of imports 
function getRLibraries(script, topRProjectNames, debug=false) {
    const results = new Set();

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

function parseRScript(script, topRProjectNames, debug=false) {
    const libraries = getRLibraries(script, topRProjectNames, debug);

    // Load assets/R_packages_objects.json, which is a dictionary whre keys are libraries and values are lists of functions
    let results = new Set();
    // Add all the functions from the libraries to the results set
    libraries.forEach(library => {
        const functions = R_packages_objects[library];
        functions.forEach(func => {
            results.add(func);
        });
    });

    // TODO also need to add argument names of those functions!!
    // const newKeyWords = findAllRKeywordsInQuery(script, libraries);

    // Combine the two sets
    results = new Set([...results, ...libraries]);
    return Array.from(results);
}

// Export parsePythonScript so it can be used in extension.js
module.exports = parseRScript;


if (require.main === module) {
    // Code here will only execute if this file is run directly from Node.js
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

    res = parseRScript(rscripttest, new Set(["ggplot2", "dplyr"]));
    console.log("test");
}