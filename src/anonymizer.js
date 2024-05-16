const parsePythonScript = require('./python_parser');
const reservedWordsSQLUpper = require('../assets/reserved_words_sql_upper.json');
const reservedWordsPython = require('../assets/reserved_words_python.json')
const dictWords = require('../assets/dict_words.json');
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
            this.dictWords = dictWords;
            this.shuffleArray(this.dictWords);
        }
        this.reservedWordsSQLUpper = new Set(reservedWordsSQLUpper);
        this.reservedWordsPython = new Set(reservedWordsPython);
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
            if (!this.dictWords.length) {
                throw new Error("The word list has been exhausted.");
            }
            let one_dict_word = this.dictWords.pop().toLowerCase();
            while (this.tokens.includes(one_dict_word)) {
                one_dict_word = this.dictWords.pop().toLowerCase();
            }
            return one_dict_word;
        } else {
            throw new Error(`Unexpected token mode: ${this.tokenMode}`);
        }
    }

    anonymize(query) {
        this.tokens = query.match(/\b\w+\b/g);
        this.tokens.forEach(token => {
            const upperToken = token.toUpperCase();
            if (!(this.reservedWordsSQLUpper.has(upperToken) || this.reservedWordsPython.has(token))) {
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
        let reservedWordsFromPythonScript = parsePythonScript(allText, this.topPyPIProjectNames);
        this.reservedWordsPython = new Set([...this.reservedWordsPython, ...reservedWordsFromPythonScript]);
    }
}

module.exports = Anonymizer;
 