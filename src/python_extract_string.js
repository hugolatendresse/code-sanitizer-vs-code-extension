function extractPythonStrings(script) {
    let inString = false;
    let stringDelimiter = '';
    let currentSegment = '';
    let result = [];
    let escapeMode = false;

    function pushSegment(text, inStr) {
        if (text) {
            result.push({ segment: text, inString: inStr });
        }
    }

    for (let i = 0; i < script.length; i++) {
        const char = script[i];
        const nextChar = script[i + 1];

        if (escapeMode) {
            currentSegment += char;
            escapeMode = false;
            continue;
        }

        if (char === '\\') {
            currentSegment += char;
            escapeMode = true;
            continue;
        }

        if (inString) {
            if ((char === stringDelimiter && !escapeMode) && ((stringDelimiter.length === 1) || (script.substr(i, 3) === stringDelimiter))) {
                currentSegment += char;
                if (stringDelimiter.length === 3) i += 2;
                pushSegment(currentSegment, true);
                currentSegment = '';
                inString = false;
                stringDelimiter = '';
            } else {
                currentSegment += char;
            }
        } else {
            if ((char === '\'' || char === '"') && !inString && !escapeMode) {
                // Check if it starts a triple quote string
                if (script.substr(i, 3) === `${char}${char}${char}`) {
                    if (currentSegment) pushSegment(currentSegment, false);
                    stringDelimiter = `${char}${char}${char}`;
                    inString = true;
                    currentSegment = stringDelimiter;
                    i += 2; // Advance to skip the next two quotes
                } else {
                    if (currentSegment) pushSegment(currentSegment, false);
                    stringDelimiter = char;
                    inString = true;
                    currentSegment = char;
                }
            } else {
                if (currentSegment && !char.match(/[\s\w]/)) {
                    pushSegment(currentSegment, false);
                    currentSegment = '';
                }
                currentSegment += char;
            }
        }
    }

    // Push any remaining segment at the end
    if (currentSegment) {
        pushSegment(currentSegment, inString);
    }

    return result;
}

const pythonScript = `print("Hello, world!") # Example script`;
console.log(extractPythonStrings(pythonScript));
