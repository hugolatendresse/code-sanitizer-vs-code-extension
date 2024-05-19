// to run: npm test

const {originalTextPythonText1, expectedTokensTest1} = require('./test_python')

function printDebugInfo(someName, someVar) {
    console.log("\n\!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(`This is the ${someName}:`);
    console.log(someVar);  // No need to change this line if you want to print the variable as is
    console.log("#######################################\n");
}

suite('Python Parser Test Suite', () => {

    test('print', async () => {
        printDebugInfo("expectedTokensTest1 first", expectedTokensTest1);
        console.log("expectedTokensTest1 after import:", expectedTokensTest1);
        printDebugInfo("expectedTokensTest1 second", expectedTokensTest1);
    })
});


