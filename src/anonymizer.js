const parsePythonScript = require('./python_parser');
const { sqlReservedWordsUpper, pythonReservedWordsUpper } = require('../assets/reserved_words');
const wordList = require('../assets/dict_words.json');
const topPyPIProjectNames = require('../assets/top-pypi-project-names-all');

const debug = false;

function printDebugInfo(someName, someVar, debug) {
    if (!debug) {
        return;
    }
    console.log("\n\<<<<<<<<<<<<<<<<< In anonymizer.js <<<<<<<<<<<<<<<<<<<<<<<<");
    console.log(someName, ":");
    console.log(someVar);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n");
}

class Anonymizer {
    constructor(tokenMode = 'dictionary') {
        this.mapping = {}; // Dictionary from original tokens to sanitized tokens
        this.tokenMode = tokenMode; // 'random' for random strings, 'dictionary' for dictionary words
        if (tokenMode === 'dictionary') {
            this.wordList = wordList;
            // TODO the above is not very elegant, would be better to read from json file
            // let rawData = fs.readFileSync('word_list.json', 'utf8');
            // this.wordList = JSON.parse(rawData);
            this.shuffleArray(this.wordList);
        }
        this.sqlReservedWordsUpper = new Set(sqlReservedWordsUpper);
        this.pythonReservedWordsUpper = new Set(pythonReservedWordsUpper);
        this.updateReservedWordsUpper();
        this.topPyPIProjectNames = new Set(topPyPIProjectNames);
        // printDebugInfo("constructor topPyPIProjectNames", this.topPyPIProjectNames);
        // printDebugInfo("constructor topPyPIProjectNames type", typeof this.topPyPIProjectNames);
        // printDebugInfo("constructor topPyPIProjectNames size", this.topPyPIProjectNames.size);
       
    }

    generateRandomString(length = 8) {
        // TODO this is not as rigourous as in python!! Need to define a word exactly
        if (this.tokenMode === 'random') {
            let letters = 'abcdefghijklmnopqrstuvwxyz';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += letters.charAt(Math.floor(Math.random() * letters.length));
            }
            return result;
        } else if (this.tokenMode === 'dictionary') {
            if (!this.wordList.length) {
                throw new Error("The word list has been exhausted.");
            }
            let one_dict_word = this.wordList.pop().toLowerCase();
            while (this.tokens.includes(one_dict_word)) {
                one_dict_word = this.wordList.pop().toLowerCase();
            }
            return one_dict_word;
        } else {
            throw new Error(`Unexpected token mode: ${this.tokenMode}`);
        }
    }

    updateReservedWordsUpper() {
        this.reservedWordsUpper =  new Set([...this.sqlReservedWordsUpper, ...this.pythonReservedWordsUpper]);
    }

    anonymize(query) {
        this.tokens = query.match(/\b\w+\b/g);
        this.tokens.forEach(token => {
            const upperToken = token.toUpperCase();
            if (!this.reservedWordsUpper.has(upperToken)) {  // TODO check if token was changed inplace
                // If the token is not reserved and if it's not yet in mapping, add a mapping for that token
                if (!this.mapping.hasOwnProperty(token)) {
                    this.mapping[token] = this.generateRandomString();
                }
                // Replace the token with the sanitized token
                query = this.replaceInString(token, this.mapping[token], query);
            }
          });
        return query;
    }

    unanonymize(query) {
        printDebugInfo("trying to unanonymize this query", query, debug);
        if (debug) {
            console.log("mapping:");
            // Iterate over the mapping object and print each key-value pair
            Object.entries(this.mapping).forEach(([key, value]) => {
                console.log(`${key}: ${value}`);
            });
        }
        Object.entries(this.mapping).forEach(([originalToken, sanitizedToken]) => {
            query = this.replaceInString(sanitizedToken, originalToken, query);
        });
        printDebugInfo("returning this query", query, debug);
        return query;
    }

    replaceInString(token, replacement, string) {
        const regex = new RegExp(`\\b${token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
        return string.replace(regex, replacement);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    // DOING THAT IN CONSTRUCTOR FOR NOW
    // Fetch the top PyPI project names if haven't been done yet, and return them
    // get topPyPIProjectNames() {
    //     return new Promise((resolve, reject) => {
    //         if (!this._topPyPIProjectNames) {
    //             this._topPyPIProjectNames = new Set(require('./top-pypi-project-names'));
    //         }
    //         resolve(this._topPyPIProjectNames);
    //     });
    // }

    read_entire_python_script(allText) {
        let wordsFromPythonScript = parsePythonScript(allText, this.topPyPIProjectNames);
        let pythonWordsUpper = wordsFromPythonScript.map(word => word.toUpperCase());
        this.pythonReservedWordsUpper = new Set([...this.pythonReservedWordsUpper, ...pythonWordsUpper]);
        this.updateReservedWordsUpper();
    }
}

module.exports = Anonymizer;
 